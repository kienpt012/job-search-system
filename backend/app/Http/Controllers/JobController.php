<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Models\Job;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobController extends Controller
{
    public function index(Request $req)
    {
        $jobs = Job::with(['employer', 'locations'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
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
            ->orderByDesc('jobs.updated_at')
            ->select('jobs.*')
            ->distinct()
            ->paginate(9);

        $jobs = $jobs->toArray();
        $currentTime = Carbon::now();

        if ($req->posting_period) {
            $jobs['data'] = array_filter(
                $jobs['data'],
                fn ($item) => $currentTime->diffInDays($item['created_at']) <= $req->posting_period
            );
        }

        return response()->json($jobs);
    }
    public function show($id)
    {
        $job = Job::with(['employer', 'jtype', 'jlevel', 'industries'])
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
    public function create(Request $req)
    {
        $new_record = $req->all();

        $industries = $new_record['industries'];
        unset($new_record['industries']);
        $locations = $new_record['locations'];
        unset($new_record['locations']);
        $skills = $new_record['skills'] ?? [];
        unset($new_record['skills']);

        $new_record['employer_id'] = Auth::user()->id;

        $job = Job::create($new_record);
        for ($i = 0; $i < count($industries); $i++) {
            $job_industries[$i] = collect(['job_id' => $job->id, 'industry_id' => $industries[$i]])->toArray();
        }
        DB::table('job_industry')->insert($job_industries);

        for ($i = 0; $i < count($locations); $i++) {
            $job_locations[$i] = collect(['job_id' => $job->id, 'location_id' => $locations[$i]])->toArray();
        }
        DB::table('job_location')->insert($job_locations);

        $this->syncJobSkills($job->id, $skills);

        return response()->json('Updated successfully');
    }
    public function update(Request $req, $id = null)
    {
        $jobId = $id ?? $req->id;
        $update_fields = $req->all();
        if (isset($update_fields['industries'])) {
            $industries = $update_fields['industries'];
            unset($update_fields['industries']);

            //update job_industry
            DB::table('job_industry')->where('job_id', $jobId)->delete();
            for ($i = 0; $i < count($industries); $i++) {
                $job_industries[$i] = collect(['job_id' => $jobId, 'industry_id' => $industries[$i]])->toArray();
            }
            DB::table('job_industry')->insert($job_industries);
        }
        if (isset($update_fields['locations'])) {
            $locations = $update_fields['locations'];
            unset($update_fields['locations']);

            //update job_location
            DB::table('job_location')->where('job_id', $jobId)->delete();
            for ($i = 0; $i < count($locations); $i++) {
                $job_locations[$i] = collect(['job_id' => $jobId, 'location_id' => $locations[$i]])->toArray();
            }
            DB::table('job_location')->insert($job_locations);
        }
        if (isset($update_fields['skills'])) {
            $skills = $update_fields['skills'];
            unset($update_fields['skills']);

            $this->syncJobSkills($jobId, $skills);
        }
        if (count($update_fields) > 0) {
            unset($update_fields['id']);
            Job::where('id', $jobId)
                ->update($update_fields);
        }
        $msg = 'Update successfully';

        return response()->json($msg);
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

    private function syncJobSkills($jobId, $skills)
    {
        DB::table('job_skill')->where('job_id', $jobId)->delete();

        if (!is_array($skills) || count($skills) === 0) {
            return;
        }

        $jobSkills = collect($skills)
            ->filter(fn ($skillId) => $skillId !== null && $skillId !== '')
            ->unique()
            ->map(fn ($skillId) => [
                'job_id' => $jobId,
                'skill_id' => (int) $skillId,
            ])
            ->values()
            ->toArray();

        if (count($jobSkills) > 0) {
            DB::table('job_skill')->insert($jobSkills);
        }
    }
}
