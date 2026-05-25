<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Models\Job;
use App\Models\User;
use App\Services\CompanyAccessService;
use App\Services\EmployerBillingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    public function index(Request $req)
    {
        $jobs = Job::with(['employer:id,name,logo', 'locations:id,name', 'branch:id,name,address'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->where(function ($query) {
                $query->whereNull('jobs.status')
                    ->orWhere('jobs.status', 'active');
            })
            ->when($req->keyword !== null, function ($query) use ($req) {
                // return $query->join('employers', 'employer_id', '=', 'employers.id')
                //     ->whereRaw('LOWER(employers.name) LIKE ?', ['%' . strtolower($req->keyword) . '%']);
                return $query->whereRaw('LOWER(jobs.jname) LIKE ?', ['%' . strtolower($req->keyword) . '%']);
            })
            ->when($req->industry_id !== null, function ($query) use ($req) {
                return $query->join('job_industry', 'jobs.id', '=', 'job_industry.job_id')
                    ->whereIn('industry_id', $req->industry_id);
            })
            ->when($req->location_id !== null, function ($query) use ($req) {
                return $query->join('job_location', 'jobs.id', '=', 'job_location.job_id')
                    ->whereIn('location_id', $req->location_id);
            })
            ->when($req->salary !== null, function ($query) use ($req) {
                return $query->where('min_salary', '>=', $req->salary);
            })
            ->when($req->jtype_id !== null, function ($query) use ($req) {
                return $query->where('jtype_id', '=', $req->jtype_id);
            })
            ->when($req->jlevel_id !== null, function ($query) use ($req) {
                return $query->where('jlevel_id', '=', $req->jlevel_id);
            })
            ->when($req->posting_period !== null, function ($query) use ($req) {
                return $query->where('jobs.created_at', '>=', Carbon::now()->subDays((int) $req->posting_period));
            })
            ->orderByDesc('jobs.updated_at')
            ->select('jobs.*')
            ->distinct()
            ->paginate(9);

        return response()->json($jobs);
    }
    public function show($id)
    {
        $job = Job::with(['employer', 'jtype', 'jlevel', 'industries', 'skills', 'branch'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('jobs.id', $id)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->select('jobs.*', DB::raw('DATE_FORMAT(jobs.created_at, "%d/%m/%Y") as postDate'))
            ->first();

        if ($job) {
            $this->addLocationInf($job);
            return response()->json($job);
        } else {
            return response()->json(['message' => 'resource not found'], 404);
        }
    }
    public function getHotList()
    {
        $res = Job::with([
            'employer:id,name,logo',
            'locations:id,name',
        ])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('jobs.is_hot', 1)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->orderByDesc('jobs.created_at')
            ->select(
                'jobs.id',
                'jobs.employer_id',
                'jobs.jname',
                'jobs.min_salary',
                'jobs.max_salary',
                'jobs.created_at'
            )
            ->paginate(6);

        return response()->json($res);
    }
    public function create(Request $req, CompanyAccessService $access)
    {
        $member = $access->requirePermission('manage_jobs');
        $billingAccess = app(EmployerBillingService::class)->checkAccessForEmployerUser(Auth::id(), 'job_post');
        if (!$billingAccess['allowed']) {
            return response()->json([
                'message' => $billingAccess['message'],
                'code' => $billingAccess['code'],
                'billing_url' => '/employer/billing',
            ], 402);
        }

        $validated = $this->validateJobPayload($req, true);
        $branch = $access->assertBranchBelongsToCompany((int) $validated['branch_id'], $member);
        $status = $validated['status'] ?? 'active';

        $job = DB::transaction(function () use ($validated, $branch, $member, $status, $billingAccess, $access) {
            $job = Job::create($this->jobFieldsFromPayload($validated, $branch, [
                'employer_id' => $member->employer_id,
                'branch_id' => $branch->id,
                'posted_by_user_id' => Auth::id(),
                'is_active' => $status === 'active' ? 1 : 0,
                'status' => $status,
            ]));

            $this->syncJobIndustries($job->id, $validated['industries'] ?? []);
            $this->syncJobLocations($job->id, $validated['locations'] ?? []);
            $this->syncJobSkillsByType(
                $job->id,
                $validated['required_skills'] ?? ($validated['skills'] ?? []),
                $validated['preferred_skills'] ?? []
            );

            app(EmployerBillingService::class)->consumeJobPost($billingAccess['subscription']);
            $access->log('job.created', Job::class, $job->id, null, $job->fresh()->toArray());

            return $job->fresh(['branch', 'industries', 'skills']);
        });

        return response()->json($job, 201);
    }
    public function update(Request $req, CompanyAccessService $access, $id = null)
    {
        $access->requirePermission('manage_jobs');
        $jobId = $id ?? $req->id;
        $job = $access->assertCanAccessJob((int) $jobId);
        $validated = $this->validateJobPayload($req, false);
        $before = $job->toArray();

        DB::transaction(function () use ($validated, $job, $access, $before) {
            $branch = null;
            if (array_key_exists('branch_id', $validated)) {
                $branch = $access->assertBranchBelongsToCompany((int) $validated['branch_id']);
            } elseif ($job->branch_id) {
                $branch = $job->branch;
            }

            $status = $validated['status'] ?? null;
            $fields = $this->jobFieldsFromPayload($validated, $branch, []);
            if ($status !== null) {
                $fields['status'] = $status;
                $fields['is_active'] = $status === 'active' ? 1 : 0;
            }

            if (count($fields) > 0) {
                $job->update($fields);
            }

            if (array_key_exists('industries', $validated)) {
                $this->syncJobIndustries($job->id, $validated['industries'] ?? []);
            }

            if (array_key_exists('locations', $validated)) {
                $this->syncJobLocations($job->id, $validated['locations'] ?? []);
            }

            if (
                array_key_exists('required_skills', $validated)
                || array_key_exists('preferred_skills', $validated)
                || array_key_exists('skills', $validated)
            ) {
                $this->syncJobSkillsByType(
                    $job->id,
                    $validated['required_skills'] ?? ($validated['skills'] ?? []),
                    $validated['preferred_skills'] ?? []
                );
            }

            $access->log('job.updated', Job::class, $job->id, $before, $job->fresh()->toArray());
        });

        return response()->json($job->fresh(['branch', 'industries', 'skills']));
    }
    public function getJobIndustries($id)
    {
        $res = Job::find($id)->industries;

        return response()->json($res);
    }

    public function getJobSkills($id)
    {
        $res = Job::findOrFail($id)->skills;

        return response()->json($res);
    }

    public function addLocationInf($job)
    {
        $res = DB::table('job_location')
            ->join('locations', 'location_id', '=', 'locations.id')
            ->where('job_id', $job->id)
            ->pluck('locations.name');
        //convert $res from array to string to send back frontend
        $location = array2String($res);
        $job['location'] = $location;
        //format date to display:
        // $job['expire_at'] = Carbon::parse($job['expire_at'])->format('d/m/Y');
        // $job['updated_at'] = Carbon::parse($job['updated_at'])->toDateTimeString();
    }
    public function apply(Request $req)
    {
        $user = Auth::user();
        $req->validate([
            'cv' => 'required|file|mimes:pdf',
            'resume_id' => 'nullable|integer',
        ]);

        if ($req->resume_id) {
            $resume = Resume::where([
                ['id', '=', $req->resume_id],
                ['candidate_id', '=', $user->id]
            ])->first();

            if ($resume === null) {
                return response()->json(['message' => 'Resume not found'], 422);
            }
        }

        $directory = storage_path('cv_images');
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $baseName = pathinfo($req->fname ?? 'cv', PATHINFO_FILENAME);
        $safeBaseName = Str::slug($baseName, '_');
        if ($safeBaseName === '') {
            $safeBaseName = 'cv';
        }

        $fname = 'cand' . $user->id . '_' . time() . '_' . $safeBaseName . '.pdf';
        $req->file('cv')->move($directory, $fname);
        $path = rtrim(env('APP_URL'), '/') . '/cv_images/' . rawurlencode($fname);

        DB::table('job_applying')->insert([
            'job_id' => $req->id,
            'candidate_id' => $user->id,
            'cv_link' => $path,
            'created_at' => Carbon::now()
        ]);

        return response()->json($path);
    }
    public function checkApplying($job_id)
    {
        $user = Auth::user();
        $res = DB::table('job_applying')
            ->where([
                ['job_id', '=', $job_id],
                ['candidate_id', '=', $user->id]
            ])->first();

        if ($res != null) {
            return response()->json(['value' => true]);
        } else return response()->json(['value' => false]);
    }

    private function validateJobPayload(Request $req, bool $isCreate): array
    {
        $required = $isCreate ? 'required' : 'sometimes';

        return $req->validate([
            'jname' => [$required, 'string', 'max:150'],
            'branch_id' => [$required, 'integer'],
            'jtype_id' => [$required, 'integer', 'exists:jtypes,id'],
            'jlevel_id' => [$required, 'integer', 'exists:jlevels,id'],
            'industries' => [$required, 'array', 'min:1'],
            'industries.*' => ['integer', 'exists:industries,id'],
            'locations' => ['nullable', 'array'],
            'locations.*' => ['integer', 'exists:locations,id'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['integer', 'exists:jskills,id'],
            'required_skills' => [$isCreate ? 'required_without:skills' : 'nullable', 'array'],
            'required_skills.*' => ['integer', 'exists:jskills,id'],
            'preferred_skills' => ['nullable', 'array'],
            'preferred_skills.*' => ['integer', 'exists:jskills,id'],
            'work_location_type' => ['nullable', Rule::in(['onsite', 'hybrid', 'remote', 'special'])],
            'special_address' => ['nullable', 'string', 'max:500'],
            'map_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'amount' => ['nullable', 'integer', 'min:1'],
            'min_salary' => ['nullable', 'integer', 'min:0'],
            'max_salary' => ['nullable', 'integer', 'min:0'],
            'yoe' => ['nullable', 'integer', 'min:0', 'max:50'],
            'education_level' => ['nullable', 'string', 'max:120'],
            'gender' => ['nullable', 'integer', 'in:0,1,2'],
            'required_languages' => ['nullable', 'string'],
            'required_certificates' => ['nullable', 'string'],
            'description' => [$required, 'string'],
            'requirements' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'expire_at' => [$required, 'date'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'paused', 'closed'])],
        ]);
    }

    private function jobFieldsFromPayload(array $payload, $branch, array $base): array
    {
        $fields = $base;
        $allowed = [
            'jname',
            'jtype_id',
            'jlevel_id',
            'amount',
            'min_salary',
            'max_salary',
            'yoe',
            'education_level',
            'gender',
            'work_location_type',
            'special_address',
            'map_lat',
            'map_lng',
            'required_languages',
            'required_certificates',
            'description',
            'requirements',
            'benefits',
            'expire_at',
        ];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $payload)) {
                $fields[$field] = $payload[$field];
            }
        }

        if ($branch) {
            $fields['branch_id'] = $branch->id;
        }

        $shouldResolveAddress = array_key_exists('employer_id', $base)
            || array_key_exists('branch_id', $payload)
            || array_key_exists('work_location_type', $payload)
            || array_key_exists('special_address', $payload);

        if ($shouldResolveAddress) {
            $locationType = $fields['work_location_type'] ?? $payload['work_location_type'] ?? 'onsite';
            if ($locationType === 'remote') {
                $fields['address'] = 'Làm việc từ xa';
            } elseif ($locationType === 'special') {
                $fields['address'] = $payload['special_address'] ?? $fields['special_address'] ?? '';
            } elseif ($branch) {
                $fields['address'] = $branch->address;
                $fields['map_lat'] = $branch->map_lat;
                $fields['map_lng'] = $branch->map_lng;
            }
        }

        return $fields;
    }

    private function syncJobIndustries($jobId, array $industries): void
    {
        DB::table('job_industry')->where('job_id', $jobId)->delete();
        $rows = collect($industries)
            ->filter()
            ->unique()
            ->map(fn ($industryId) => ['job_id' => $jobId, 'industry_id' => (int) $industryId])
            ->values()
            ->toArray();

        if (count($rows) > 0) {
            DB::table('job_industry')->insert($rows);
        }
    }

    private function syncJobLocations($jobId, array $locations): void
    {
        DB::table('job_location')->where('job_id', $jobId)->delete();
        $rows = collect($locations)
            ->filter()
            ->unique()
            ->map(fn ($locationId) => ['job_id' => $jobId, 'location_id' => (int) $locationId])
            ->values()
            ->toArray();

        if (count($rows) > 0) {
            DB::table('job_location')->insert($rows);
        }
    }

    private function syncJobSkillsByType($jobId, array $requiredSkills, array $preferredSkills): void
    {
        DB::table('job_skill')->where('job_id', $jobId)->delete();

        $requiredRows = collect($requiredSkills)
            ->filter(fn ($skillId) => $skillId !== null && $skillId !== '')
            ->unique()
            ->map(fn ($skillId) => [
                'job_id' => $jobId,
                'skill_id' => (int) $skillId,
                'requirement_type' => 'required',
            ])
            ->values();

        $preferredRows = collect($preferredSkills)
            ->filter(fn ($skillId) => $skillId !== null && $skillId !== '')
            ->unique()
            ->reject(fn ($skillId) => $requiredRows->pluck('skill_id')->contains((int) $skillId))
            ->map(fn ($skillId) => [
                'job_id' => $jobId,
                'skill_id' => (int) $skillId,
                'requirement_type' => 'preferred',
            ])
            ->values();

        $jobSkills = $requiredRows->merge($preferredRows)->values()->toArray();

        if (count($jobSkills) > 0) {
            DB::table('job_skill')->insert($jobSkills);
        }
    }
}
