<?php

namespace App\Http\Controllers;

use App\Events\NotifyCandidateEvent;
use App\Models\Candidate;
use App\Models\CandidateMessage;
use App\Models\Employer;
use App\Models\Job;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmployerController extends Controller
{
    public function index(Request $request)
    {
        $keyw = $request->query('keyword');
        $query = Employer::query()
            ->withCount([
                'jobs as job_num' => function ($jobQuery) {
                    $jobQuery->where('is_active', 1);
                },
            ])
            ->where('is_active', 1);

        if ($keyw) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($keyw) . '%']);
        }

        $res = $query->paginate(6);

        return response()->json($res);
    }

    public function show($id)
    {
        $employer = Employer::where('id', $id)
            ->where('is_active', 1)
            ->first();
        if ($employer) {
            return $employer;
        }

        return response()->json([
            'message' => 'resource not found'
        ], 404);
    }

    public function destroy($id)
    {
        if (Employer::find($id)) {
            Employer::destroy($id);
        } else {
            return response()->json(['message' => 'resource not found']);
        }
    }

    public function getHotList()
    {
        $res = Employer::query()
            ->select('id', 'name', 'logo')
            ->withCount([
                'jobs as job_num' => function ($query) {
                    $query->where('is_active', 1);
                },
            ])
            ->where('is_hot', 1)
            ->where('is_active', 1)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->take(8)
            ->get();

        return response()->json($res);
    }

    public function getComJobs($id)
    {
        $jobs = Employer::join('jobs', 'employers.id', '=', 'employer_id')
            ->where([
                ['employers.id', '=', $id],
                ['employers.is_active', '=', 1],
                ['jobs.is_active', '=', 1]
            ])
            ->select('jobs.*', DB::raw(
                'DATE_FORMAT(jobs.created_at, "%d/%m/%Y") as postDate,
                 DATE_FORMAT(jobs.expire_at, "%d/%m/%Y") as deadline'
            ))
            ->get();

        for ($i = 0; $i < count($jobs); $i++) {
            $res = DB::table('job_location')
                ->join('locations', 'location_id', '=', 'locations.id')
                ->where('job_id', $jobs[$i]->id)
                ->pluck('locations.name');

            $location = array2String($res);
            $jobs[$i]['location'] = $location;
        }

        return $jobs;
    }

    public function getDashboard()
    {
        $userId = Auth::id();
        $employer = Employer::where('user_id', $userId)->first();

        if (!$employer) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $jobIds = Job::where('employer_id', $userId)->pluck('id');
        $totalJobs = Job::where('employer_id', $userId)->count();
        $activeJobs = Job::where('employer_id', $userId)->where('is_active', 1)->count();
        $inactiveJobs = $totalJobs - $activeJobs;

        $baseApplyingQuery = DB::table('job_applying')->whereIn('job_id', $jobIds);
        $totalApplications = (clone $baseApplyingQuery)->count();
        $waitingApplications = (clone $baseApplyingQuery)
            ->whereIn('status', ['WAITING', 'BROWSING_RESUME'])
            ->count();
        $interviewingApplications = (clone $baseApplyingQuery)
            ->where('status', 'BROWSING_INTERVIEW')
            ->count();
        $passedApplications = (clone $baseApplyingQuery)
            ->where('status', 'PASSED')
            ->count();
        $rejectedApplications = (clone $baseApplyingQuery)
            ->whereIn('status', ['RESUME_FAILED', 'INTERVIEW_FAILED'])
            ->count();

        $monthlyApplications = collect(range(5, 0))
            ->map(function ($offset) use ($jobIds) {
                $start = Carbon::now()->startOfMonth()->subMonths($offset);
                $end = (clone $start)->endOfMonth();

                return [
                    'label' => $start->format('m/Y'),
                    'value' => DB::table('job_applying')
                        ->whereIn('job_id', $jobIds)
                        ->whereBetween('created_at', [$start, $end])
                        ->count(),
                ];
            })
            ->values();

        $jobPerformance = Job::where('employer_id', $userId)
            ->leftJoin('job_applying', 'jobs.id', '=', 'job_applying.job_id')
            ->selectRaw('jobs.id, jobs.jname, jobs.is_active, COUNT(job_applying.candidate_id) as total_applications')
            ->groupBy('jobs.id', 'jobs.jname', 'jobs.is_active')
            ->orderByDesc('total_applications')
            ->orderByDesc('jobs.created_at')
            ->take(5)
            ->get();

        return response()->json([
            'employer' => $employer,
            'stats' => [
                'total_jobs' => $totalJobs,
                'active_jobs' => $activeJobs,
                'inactive_jobs' => $inactiveJobs,
                'total_applications' => $totalApplications,
                'waiting_applications' => $waitingApplications,
                'interviewing_applications' => $interviewingApplications,
                'passed_applications' => $passedApplications,
                'rejected_applications' => $rejectedApplications,
            ],
            'monthly_applications' => $monthlyApplications,
            'application_status' => [
                ['label' => 'Chờ duyệt', 'value' => $waitingApplications, 'tone' => '#0f766e'],
                ['label' => 'Phỏng vấn', 'value' => $interviewingApplications, 'tone' => '#0ea5e9'],
                ['label' => 'Đạt', 'value' => $passedApplications, 'tone' => '#f59e0b'],
                ['label' => 'Loại', 'value' => $rejectedApplications, 'tone' => '#ef4444'],
            ],
            'job_performance' => $jobPerformance,
        ]);
    }

    public function updateCurrent(Request $req)
    {
        $employer = Employer::where('user_id', Auth::id())->first();
        if (!$employer) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $req->validate([
            'name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'map_lat' => 'nullable|numeric|between:-90,90',
            'map_lng' => 'nullable|numeric|between:-180,180',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:60',
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'min_employees' => 'nullable',
            'max_employees' => 'nullable',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        $updateFields = [
            'name' => $req->input('name', $employer->name),
            'address' => $req->input('address', $employer->address),
            'map_lat' => $this->nullableCoordinate($req->input('map_lat'), $employer->map_lat),
            'map_lng' => $this->nullableCoordinate($req->input('map_lng'), $employer->map_lng),
            'contact_name' => $req->input('contact_name', $employer->contact_name),
            'phone' => $req->input('phone', $employer->phone),
            'website' => $req->input('website', $employer->website),
            'description' => $req->input('description', $employer->description),
            'min_employees' => $this->nullableNumber($req->input('min_employees')),
            'max_employees' => $this->nullableNumber($req->input('max_employees')),
        ];

        if ($req->hasFile('logo')) {
            $this->deleteLocalAsset($employer->logo, 'company_logos');
            $updateFields['logo'] = $this->storeEmployerAsset(
                $req->file('logo'),
                $employer->id,
                'company_logos',
                'logo'
            );
        }

        if ($req->hasFile('image')) {
            $this->deleteLocalAsset($employer->image, 'company_covers');
            $updateFields['image'] = $this->storeEmployerAsset(
                $req->file('image'),
                $employer->id,
                'company_covers',
                'cover'
            );
        }

        $employer->update($updateFields);

        return response()->json($employer->fresh());
    }

    public function resolveSharedMapLink(Request $request)
    {
        $request->validate([
            'url' => 'required|string|max:1000',
        ]);

        $resolved = $this->resolveGoogleMapUrl($request->input('url'));

        if (!$resolved) {
            return response()->json([
                'message' => 'Không thể đọc tọa độ từ liên kết Google Maps.'
            ], 422);
        }

        return response()->json($resolved);
    }

    public function getCandidateList(Request $req)
    {
        $job_ids = Job::where('employer_id', '=', Auth::user()->id)->pluck('id');
        $keyword = $req->query('keyword');

        if ($req->status == 'WAITING' || $req->status == 'BROWSING_RESUME') {
            $status = ['WAITING', 'BROWSING_RESUME'];
        } else {
            $status[] = $req->status;
        }

        $candidates = DB::table('job_applying')
            ->join('jobs', 'job_id', '=', 'jobs.id')
            ->join('candidates', 'candidate_id', '=', 'candidates.id')
            ->whereIn('status', $status)
            ->whereIn('job_id', $job_ids)
            ->when($keyword != null, function ($query) use ($keyword) {
                return $query->where(function ($query2) use ($keyword) {
                    $query2->whereRaw('LOWER(jname) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw('LOWER(candidates.email) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw("LOWER(CONCAT(lastname, ' ', firstname)) LIKE ?", ['%' . strtolower($keyword) . '%']);
                });
            })
            ->selectRaw('job_applying.*, candidates.*, jobs.id, jobs.jname,
                        DATE_FORMAT(job_applying.created_at, "%d/%m/%Y %H:%i") as appliedTime')
            ->orderByDesc('job_applying.created_at')
            ->get();

        return response()->json($candidates);
    }

    public function getRecommendedCandidates($job_id)
    {
        $job = Job::with('skills')->where([
            ['id', '=', $job_id],
            ['employer_id', '=', Auth::id()],
        ])->firstOrFail();

        $requiredSkills = $job->skills
            ->pluck('name')
            ->map(fn ($name) => strtolower(trim($name)))
            ->filter()
            ->values();

        if ($requiredSkills->isEmpty()) {
            return response()->json([]);
        }

        $candidates = Candidate::query()
            ->with(['skills' => function ($query) {
                $query->whereNull('resume_id');
            }])
            ->whereHas('skills', function ($query) use ($requiredSkills) {
                $query->whereNull('resume_id')
                    ->whereIn(DB::raw('LOWER(name)'), $requiredSkills->toArray());
            })
            ->get()
            ->map(function ($candidate) use ($requiredSkills) {
                $candidateSkills = $candidate->skills
                    ->pluck('name')
                    ->filter()
                    ->values();

                $matchedSkills = $candidateSkills
                    ->filter(fn ($name) => $requiredSkills->contains(strtolower(trim($name))))
                    ->unique()
                    ->values();

                return [
                    'id' => $candidate->id,
                    'firstname' => $candidate->firstname,
                    'lastname' => $candidate->lastname,
                    'email' => $candidate->email,
                    'phone' => $candidate->phone,
                    'skills' => $candidateSkills,
                    'matched_skills' => $matchedSkills,
                    'match_count' => $matchedSkills->count(),
                    'match_percent' => round(($matchedSkills->count() / max($requiredSkills->count(), 1)) * 100),
                ];
            })
            ->sortByDesc('match_count')
            ->values();

        return response()->json($candidates);
    }

    public function searchCandidates(Request $req)
    {
        $keyword = trim((string) $req->query('keyword', ''));
        $skillIds = $req->query('skill_ids', []);
        $skillIds = is_array($skillIds) ? $skillIds : [$skillIds];
        $jobId = $req->query('job_id');

        $skillNames = collect();
        if (count($skillIds) > 0) {
            $skillNames = DB::table('jskills')
                ->whereIn('id', array_filter($skillIds))
                ->pluck('name')
                ->map(fn ($name) => strtolower(trim($name)))
                ->filter()
                ->values();
        }

        $requiredSkills = collect();
        if ($jobId) {
            $job = Job::with('skills')->where([
                ['id', '=', $jobId],
                ['employer_id', '=', Auth::id()],
            ])->first();

            if ($job) {
                $requiredSkills = $job->skills
                    ->pluck('name')
                    ->map(fn ($name) => strtolower(trim($name)))
                    ->filter()
                    ->values();
            }
        }

        $candidates = Candidate::query()
            ->with([
                'skills' => fn ($query) => $query->whereNull('resume_id'),
                'educations' => fn ($query) => $query->whereNull('resume_id'),
                'experiences' => fn ($query) => $query->whereNull('resume_id'),
                'projects' => fn ($query) => $query->whereNull('resume_id'),
                'certificates' => fn ($query) => $query->whereNull('resume_id'),
                'prizes' => fn ($query) => $query->whereNull('resume_id'),
            ])
            ->when($keyword !== '', function ($query) use ($keyword) {
                $like = '%' . strtolower($keyword) . '%';
                $query->where(function ($subQuery) use ($like) {
                    $subQuery
                        ->whereRaw("LOWER(CONCAT(lastname, ' ', firstname)) LIKE ?", [$like])
                        ->orWhereRaw("LOWER(CONCAT(firstname, ' ', lastname)) LIKE ?", [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(phone) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(address) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(objective) LIKE ?', [$like])
                        ->orWhereHas('skills', fn ($rel) => $rel->whereRaw('LOWER(name) LIKE ?', [$like]))
                        ->orWhereHas('educations', fn ($rel) => $rel
                            ->whereRaw('LOWER(school) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(major) LIKE ?', [$like]))
                        ->orWhereHas('experiences', fn ($rel) => $rel
                            ->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(company) LIKE ?', [$like]))
                        ->orWhereHas('projects', fn ($rel) => $rel
                            ->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(role) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(technologies) LIKE ?', [$like]));
                });
            })
            ->when($req->query('gender') !== null && $req->query('gender') !== '', function ($query) use ($req) {
                $query->where('gender', $req->query('gender'));
            })
            ->when($req->query('address'), function ($query, $address) {
                $query->whereRaw('LOWER(address) LIKE ?', ['%' . strtolower($address) . '%']);
            })
            ->when($skillNames->isNotEmpty(), function ($query) use ($skillNames) {
                $query->whereHas('skills', function ($rel) use ($skillNames) {
                    $rel->whereNull('resume_id')
                        ->whereIn(DB::raw('LOWER(name)'), $skillNames->toArray());
                });
            })
            ->when($req->query('school'), function ($query, $school) {
                $query->whereHas('educations', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->whereRaw('LOWER(school) LIKE ?', ['%' . strtolower($school) . '%']));
            })
            ->when($req->query('major'), function ($query, $major) {
                $query->whereHas('educations', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->whereRaw('LOWER(major) LIKE ?', ['%' . strtolower($major) . '%']));
            })
            ->when($req->query('experience'), function ($query, $experience) {
                $like = '%' . strtolower($experience) . '%';
                $query->whereHas('experiences', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->where(function ($subQuery) use ($like) {
                        $subQuery->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(company) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(description) LIKE ?', [$like]);
                    }));
            })
            ->when($req->query('project'), function ($query, $project) {
                $like = '%' . strtolower($project) . '%';
                $query->whereHas('projects', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->where(function ($subQuery) use ($like) {
                        $subQuery->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(role) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(technologies) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(description) LIKE ?', [$like]);
                    }));
            })
            ->when($req->query('certificate'), function ($query, $certificate) {
                $query->whereHas('certificates', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($certificate) . '%']));
            })
            ->when($req->query('prize'), function ($query, $prize) {
                $query->whereHas('prizes', fn ($rel) => $rel
                    ->whereNull('resume_id')
                    ->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($prize) . '%']));
            })
            ->when($req->boolean('has_location'), fn ($query) => $query
                ->whereNotNull('map_lat')
                ->whereNotNull('map_lng'))
            ->orderByDesc('updated_at')
            ->limit(60)
            ->get()
            ->map(function ($candidate) use ($requiredSkills) {
                $candidateSkills = $candidate->skills->pluck('name')->filter()->values();
                $matchedSkills = $requiredSkills->isEmpty()
                    ? collect()
                    : $candidateSkills
                        ->filter(fn ($name) => $requiredSkills->contains(strtolower(trim($name))))
                        ->unique()
                        ->values();

                return [
                    'id' => $candidate->id,
                    'firstname' => $candidate->firstname,
                    'lastname' => $candidate->lastname,
                    'gender' => $candidate->gender,
                    'dob' => $candidate->dob,
                    'phone' => $candidate->phone,
                    'email' => $candidate->email,
                    'address' => $candidate->address,
                    'objective' => $candidate->objective,
                    'avatar' => $candidate->avatar,
                    'link' => $candidate->link,
                    'skills' => $candidateSkills,
                    'matched_skills' => $matchedSkills,
                    'match_count' => $matchedSkills->count(),
                    'match_percent' => $requiredSkills->isEmpty()
                        ? null
                        : round(($matchedSkills->count() / max($requiredSkills->count(), 1)) * 100),
                    'educations' => $candidate->educations,
                    'experiences' => $candidate->experiences,
                    'projects' => $candidate->projects,
                    'certificates' => $candidate->certificates,
                    'prizes' => $candidate->prizes,
                ];
            })
            ->sortByDesc('match_count')
            ->values();

        return response()->json($candidates);
    }

    public function getTalentRecommendations()
    {
        $jobs = Job::with('skills')
            ->where('employer_id', Auth::id())
            ->where('is_active', 1)
            ->whereHas('skills')
            ->orderByDesc('updated_at')
            ->get();

        if ($jobs->isEmpty()) {
            return response()->json([]);
        }

        $candidates = Candidate::with([
            'skills' => fn ($query) => $query->whereNull('resume_id'),
            'educations' => fn ($query) => $query->whereNull('resume_id'),
            'experiences' => fn ($query) => $query->whereNull('resume_id'),
            'projects' => fn ($query) => $query->whereNull('resume_id'),
            'certificates' => fn ($query) => $query->whereNull('resume_id'),
        ])->get();

        $recommendations = collect();

        foreach ($jobs as $job) {
            $requiredSkills = $job->skills
                ->pluck('name')
                ->map(fn ($name) => strtolower(trim($name)))
                ->filter()
                ->values();

            if ($requiredSkills->isEmpty()) {
                continue;
            }

            foreach ($candidates as $candidate) {
                $candidateSkills = $candidate->skills->pluck('name')->filter()->values();
                $matchedSkills = $candidateSkills
                    ->filter(fn ($name) => $requiredSkills->contains(strtolower(trim($name))))
                    ->unique()
                    ->values();

                if ($matchedSkills->isEmpty()) {
                    continue;
                }

                $missingSkills = $job->skills
                    ->pluck('name')
                    ->filter(fn ($name) => !$matchedSkills->contains($name))
                    ->values();

                $recommendations->push([
                    'candidate' => [
                        'id' => $candidate->id,
                        'firstname' => $candidate->firstname,
                        'lastname' => $candidate->lastname,
                        'gender' => $candidate->gender,
                        'phone' => $candidate->phone,
                        'email' => $candidate->email,
                        'address' => $candidate->address,
                        'objective' => $candidate->objective,
                        'avatar' => $candidate->avatar,
                        'skills' => $candidateSkills,
                        'educations' => $candidate->educations,
                        'experiences' => $candidate->experiences,
                        'projects' => $candidate->projects,
                        'certificates' => $candidate->certificates,
                    ],
                    'job' => [
                        'id' => $job->id,
                        'jname' => $job->jname,
                        'amount' => $job->amount,
                        'yoe' => $job->yoe,
                    ],
                    'required_skills' => $job->skills->pluck('name')->values(),
                    'matched_skills' => $matchedSkills,
                    'missing_skills' => $missingSkills,
                    'match_count' => $matchedSkills->count(),
                    'match_percent' => round(($matchedSkills->count() / max($requiredSkills->count(), 1)) * 100),
                ]);
            }
        }

        return response()->json(
            $recommendations
                ->sortByDesc('match_percent')
                ->sortByDesc('match_count')
                ->take(24)
                ->values()
        );
    }

    public function contactCandidate(Request $req)
    {
        $req->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'job_id' => 'required|integer|exists:jobs,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_send_mail' => 'nullable|boolean',
        ]);

        $job = Job::where([
            ['id', '=', $req->job_id],
            ['employer_id', '=', Auth::id()],
        ])->firstOrFail();

        $company = Employer::where('user_id', '=', Auth::id())->value('name');
        $messageName = 'Nhà tuyển dụng ' . ($company ?: '') . ' đã liên hệ bạn về vị trí ' . $job->jname;

        CandidateMessage::create([
            'candidate_id' => $req->candidate_id,
            'job_id' => $job->id,
            'name' => $messageName,
            'title' => $req->title,
            'content' => $req->content,
        ]);

        $candidate = Candidate::find($req->candidate_id);
        if ($req->boolean('is_send_mail') && $candidate?->email) {
            Mail::raw($req->content, function ($message) use ($candidate, $req) {
                $message->to($candidate->email)->subject($req->title);
            });
        }

        event(new NotifyCandidateEvent($messageName, $req->candidate_id));

        return response()->json('Sent successfully');
    }

    public function processApplying(Request $req)
    {
        $currentTime = Carbon::now()->format('H:i d/m/Y');
        $company = Employer::where('user_id', '=', Auth::user()->id)->value('name');

        if ($req->actType === 'VIEWED') {
            $nextStatus = 'BROWSING_RESUME';
            $msgName = 'Hồ sơ đã được xem, vị trí ';
        } elseif ($req->actType === 'ACCEPT') {
            if ($req->step === 'step1') {
                $nextStatus = 'BROWSING_INTERVIEW';
                $msgName = 'Hồ sơ được chấp nhận, vị trí ';
            } else {
                $nextStatus = 'PASSED';
                $msgName = 'Chúc mừng bạn đã được nhận, vị trí ';
            }
        } else {
            if ($req->step === 'step1') {
                $nextStatus = 'RESUME_FAILED';
                $msgName = 'Hồ sơ bị loại, vị trí ';
            } else {
                $nextStatus = 'INTERVIEW_FAILED';
                $msgName = 'Phỏng vấn bị loại, vị trí ';
            }
        }

        $msgName = $msgName . $req->jname . ', ' . $company . ', lúc ' . $currentTime;

        DB::table('job_applying')
            ->where([
                ['job_id', '=', $req->job_id],
                ['candidate_id', '=', $req->candidate_id]
            ])
            ->update([
                'status' => $nextStatus,
                'updated_at' => Carbon::now(),
            ]);

        if ($req->actType !== 'VIEWED') {
            CandidateMessage::create([
                'candidate_id' => $req->candidate_id,
                'job_id' => $req->job_id,
                'name' => $msgName,
                'title' => $req->title,
                'content' => $req->content,
            ]);
        }

        if ($req->boolean('is_send_mail') && $req->actType !== 'VIEWED' && !empty($req->email)) {
            $safeTitle = e($req->title);
            $safeCandidateName = e(trim(($req->lastname ?? '') . ' ' . ($req->firstname ?? '')));
            $safeCompany = e($company);
            $safeJobName = e($req->jname);
            $safeContent = nl2br(e($req->content));
            $safeCurrentTime = e($currentTime);

            Mail::html(
                "
                <div style=\"font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937;\">
                    <h2 style=\"margin-bottom:16px;\">{$safeTitle}</h2>
                    <p>Xin chào {$safeCandidateName},</p>
                    <p>Bạn vừa nhận được phản hồi từ nhà tuyển dụng <strong>{$safeCompany}</strong> cho vị trí <strong>{$safeJobName}</strong>.</p>
                    <div style=\"padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;margin:16px 0;\">
                        {$safeContent}
                    </div>
                    <p>Thời gian phản hồi: {$safeCurrentTime}</p>
                    <p>Trân trọng,<br>{$safeCompany}</p>
                </div>
                ",
                function ($message) use ($req) {
                    $message->to($req->email)
                        ->subject($req->title);
                }
            );
        }

        event(new NotifyCandidateEvent($msgName, $req->candidate_id));

        return response()->json('Updated successfully');
    }

    public function getJobList(Request $req)
    {
        $keyword = $req->query('keyword');
        $jobs = Job::with(['industries', 'locations'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->join('jtypes', 'jtype_id', '=', 'jtypes.id')
            ->join('jlevels', 'jlevel_id', '=', 'jlevels.id')
            ->where('employer_id', '=', $req->id)
            ->where('employers.is_active', 1)
            ->when($keyword != null, function ($query) use ($keyword) {
                return $query->where(function ($query2) use ($keyword) {
                    $query2->whereRaw('LOWER(jname) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw('LOWER(jtypes.name) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw('LOWER(jlevels.name) LIKE ?', ['%' . strtolower($keyword) . '%']);
                });
            })
            ->selectRaw('jobs.*, jtypes.name as jtype_name, jlevels.name as jlevel_name,
                        DATE_FORMAT(jobs.created_at ,"%d/%m/%Y %H:%i") as postTime,
                        DATE_FORMAT(expire_at ,"%d/%m/%Y") as deadline')
            ->orderByDesc('jobs.created_at')
            ->get();

        return response()->json($jobs);
    }

    public function changeJobStatus(Request $req)
    {
        Job::where('id', $req->job_id)
            ->update(['is_active' => $req->status]);

        return response()->json('Updated successfully');
    }

    private function nullableNumber($value)
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function nullableCoordinate($value, $fallback = null)
    {
        if ($value === null) {
            return $fallback;
        }

        if ($value === '') {
            return null;
        }

        return (float) $value;
    }

    private function resolveGoogleMapUrl($url)
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        $response = $this->followGoogleMapRedirects($url);
        if (!$response) {
            return null;
        }

        [$finalUrl, $body] = $response;

        return $this->extractCoordinatesFromMapPayload($finalUrl, $body);
    }

    private function followGoogleMapRedirects($url)
    {
        if (!function_exists('curl_init')) {
            return null;
        }

        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 8,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_USERAGENT => 'Mozilla/5.0 RecruitmentMapResolver/1.0',
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $body = curl_exec($curl);
        $finalUrl = curl_getinfo($curl, CURLINFO_EFFECTIVE_URL);
        $error = curl_errno($curl);
        curl_close($curl);

        if ($error || !$finalUrl) {
            return null;
        }

        return [$finalUrl, (string) $body];
    }

    private function extractCoordinatesFromMapPayload($finalUrl, $body = '')
    {
        $signedNumber = '([+-]?\d+(?:\.\d+)?)';
        $patterns = [
            '/!3d' . $signedNumber . '!4d' . $signedNumber . '/i',
            '/\/maps\/search\/' . $signedNumber . '\s*,\s*' . $signedNumber . '/i',
            '/[?&](?:query|destination|center)=' . $signedNumber . '\s*,\s*' . $signedNumber . '/i',
            '/@' . $signedNumber . ',' . $signedNumber . ',/i',
        ];

        $sources = array_values(array_filter([
            (string) $finalUrl,
            rawurldecode((string) $finalUrl),
            (string) $body,
            rawurldecode((string) $body),
        ]));

        foreach ($sources as $source) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $source, $matches)) {
                    return [
                        'lat' => (float) $matches[1],
                        'lng' => (float) $matches[2],
                        'resolved_url' => $finalUrl,
                    ];
                }
            }

            if (preg_match("/https?:\/\/www\.google\.com\/maps\/[^\"'\s<]+/i", $source, $embeddedUrl)) {
                $embeddedCoordinates = $this->extractCoordinatesFromMapPayload($embeddedUrl[0], '');
                if ($embeddedCoordinates) {
                    return $embeddedCoordinates;
                }
            }
        }

        return null;
    }

    private function storeEmployerAsset($file, $employerId, $directoryName, $prefix)
    {
        $directory = storage_path($directoryName);
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
        $filename = 'employer_' . $employerId . '_' . $prefix . '_' . time() . '_' . Str::random(6) . '.' . $extension;
        $file->move($directory, $filename);

        return rtrim(env('APP_URL'), '/') . '/' . $directoryName . '/' . rawurlencode($filename);
    }

    private function deleteLocalAsset($currentPath, $directoryName)
    {
        if (!$currentPath) {
            return;
        }

        $path = parse_url($currentPath, PHP_URL_PATH);
        if (!$path || !str_contains($path, '/' . $directoryName . '/')) {
            return;
        }

        $filename = basename($path);
        $fullPath = storage_path($directoryName . '/' . $filename);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}
