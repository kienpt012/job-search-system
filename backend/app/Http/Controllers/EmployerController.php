<?php

namespace App\Http\Controllers;

use App\Events\NotifyCandidateEvent;
use App\Models\Candidate;
use App\Models\CandidateMessage;
use App\Models\CompanyBranch;
use App\Models\Employer;
use App\Models\Job;
use App\Services\CandidateMatchingService;
use App\Services\CompanyAccessService;
use App\Services\EmployerBillingService;
use App\Services\GoogleMapLinkResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmployerController extends Controller
{
    public function me(CompanyAccessService $access)
    {
        return response()->json($access->companyPayload());
    }

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

    public function getDashboard(CompanyAccessService $access)
    {
        $member = $access->requireMember();
        $employer = Employer::where('id', $member->employer_id)->first();

        if (!$employer) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $jobScope = $access->scopedJobQuery($member);
        $jobIds = (clone $jobScope)->pluck('id');
        $totalJobs = (clone $jobScope)->count();
        $activeJobs = (clone $jobScope)->where('is_active', 1)->count();
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

        $jobPerformance = $access->scopedJobQuery($member)
            ->leftJoin('job_applying', 'jobs.id', '=', 'job_applying.job_id')
            ->selectRaw('jobs.id, jobs.jname, jobs.is_active, COUNT(job_applying.candidate_id) as total_applications')
            ->groupBy('jobs.id', 'jobs.jname', 'jobs.is_active')
            ->orderByDesc('total_applications')
            ->orderByDesc('jobs.created_at')
            ->take(5)
            ->get();

        $visibleBranches = $access->visibleBranches($member)->values();
        $workspaceLocation = $member->isCompanyWide()
            ? $employer
            : ($member->branch ?: $visibleBranches->first());
        $branchSummaries = $this->branchDashboardSummaries($visibleBranches, $member->employer_id);

        return response()->json([
            'employer' => $employer,
            'branch' => $member->branch,
            'workspace_location' => $workspaceLocation,
            'profile_scope' => $member->isCompanyWide() ? 'company' : 'branch',
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
            'branches' => $visibleBranches,
            'branch_summaries' => $branchSummaries,
            'branch_stats' => [
                'total' => $branchSummaries->count(),
                'active' => $branchSummaries->where('is_active', true)->count(),
                'with_jobs' => $branchSummaries->where('total_jobs', '>', 0)->count(),
                'without_location' => $branchSummaries->filter(fn ($branch) =>
                    $branch['map_lat'] === null || $branch['map_lat'] === '' ||
                    $branch['map_lng'] === null || $branch['map_lng'] === ''
                )->count(),
                'total_members' => $branchSummaries->sum('total_members'),
            ],
            'member' => $member,
            'permissions' => $access->permissionsFor($member),
        ]);
    }

    private function branchDashboardSummaries($branches, int $employerId)
    {
        $branchIds = $branches->pluck('id')->filter()->values();

        if ($branchIds->isEmpty()) {
            return collect();
        }

        $jobStats = Job::query()
            ->selectRaw('branch_id, COUNT(*) as total_jobs, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_jobs')
            ->where('employer_id', $employerId)
            ->whereIn('branch_id', $branchIds)
            ->groupBy('branch_id')
            ->get()
            ->keyBy('branch_id');

        $applicationStats = DB::table('jobs')
            ->leftJoin('job_applying', 'jobs.id', '=', 'job_applying.job_id')
            ->selectRaw(
                "jobs.branch_id,
                COUNT(job_applying.candidate_id) as total_applications,
                SUM(CASE WHEN job_applying.status IN ('WAITING', 'BROWSING_RESUME') THEN 1 ELSE 0 END) as waiting_applications"
            )
            ->where('jobs.employer_id', $employerId)
            ->whereIn('jobs.branch_id', $branchIds)
            ->groupBy('jobs.branch_id')
            ->get()
            ->keyBy('branch_id');

        $memberStats = DB::table('company_members')
            ->selectRaw(
                "branch_id,
                COUNT(*) as total_members,
                SUM(CASE WHEN role = 'branch_manager' THEN 1 ELSE 0 END) as branch_managers,
                SUM(CASE WHEN role = 'branch_hr' THEN 1 ELSE 0 END) as branch_hr"
            )
            ->where('employer_id', $employerId)
            ->where('status', 'active')
            ->whereIn('branch_id', $branchIds)
            ->groupBy('branch_id')
            ->get()
            ->keyBy('branch_id');

        return $branches->map(function ($branch) use ($jobStats, $applicationStats, $memberStats) {
            $jobStat = $jobStats->get($branch->id);
            $applicationStat = $applicationStats->get($branch->id);
            $memberStat = $memberStats->get($branch->id);

            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'address' => $branch->address,
                'contact_name' => $branch->contact_name,
                'phone' => $branch->phone,
                'map_lat' => $branch->map_lat,
                'map_lng' => $branch->map_lng,
                'is_headquarters' => (bool) $branch->is_headquarters,
                'is_active' => (bool) $branch->is_active,
                'total_jobs' => (int) ($jobStat->total_jobs ?? 0),
                'active_jobs' => (int) ($jobStat->active_jobs ?? 0),
                'total_applications' => (int) ($applicationStat->total_applications ?? 0),
                'waiting_applications' => (int) ($applicationStat->waiting_applications ?? 0),
                'total_members' => (int) ($memberStat->total_members ?? 0),
                'branch_managers' => (int) ($memberStat->branch_managers ?? 0),
                'branch_hr' => (int) ($memberStat->branch_hr ?? 0),
            ];
        })->values();
    }

    public function updateCurrent(Request $req, CompanyAccessService $access)
    {
        $member = $access->requireCompanyOwner();
        $access->requireActiveSubscription($member);
        $employer = Employer::where('id', $member->employer_id)->first();
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

        $before = $employer->toArray();
        $employer->update($updateFields);
        $access->log('company.updated', Employer::class, $employer->id, $before, $employer->fresh()->toArray());

        return response()->json($employer->fresh());
    }

    public function resolveSharedMapLink(Request $request, GoogleMapLinkResolver $mapResolver)
    {
        $request->validate([
            'url' => 'required|string|max:1000',
        ]);

        $resolved = $mapResolver->resolve($request->input('url'));

        if (!$resolved) {
            return response()->json([
                'message' => 'Không thể đọc tọa độ từ liên kết Google Maps.'
            ], 422);
        }

        return response()->json($resolved);
    }

    public function getCandidateList(Request $req, CompanyAccessService $access)
    {
        $member = $access->requirePermission('view_applications');
        $job_ids = $access->scopedJobQuery($member)->pluck('id');
        $keyword = $req->query('keyword');
        $perPage = min((int) $req->query('per_page', 20), 50);

        if ($req->status == 'WAITING' || $req->status == 'BROWSING_RESUME' || !$req->status) {
            $status = ['WAITING', 'BROWSING_RESUME'];
        } else {
            $status[] = $req->status;
        }

        $candidates = DB::table('job_applying')
            ->join('jobs', 'job_id', '=', 'jobs.id')
            ->join('candidates', 'candidate_id', '=', 'candidates.id')
            ->leftJoin('company_branches', 'jobs.branch_id', '=', 'company_branches.id')
            ->whereIn('job_applying.status', $status)
            ->whereIn('job_id', $job_ids)
            ->when($keyword != null, function ($query) use ($keyword) {
                return $query->where(function ($query2) use ($keyword) {
                    $query2->whereRaw('LOWER(jname) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw('LOWER(candidates.email) LIKE ?', ['%' . strtolower($keyword) . '%'])
                        ->orWhereRaw("LOWER(CONCAT(lastname, ' ', firstname)) LIKE ?", ['%' . strtolower($keyword) . '%']);
                });
            })
            ->selectRaw('job_applying.*, candidates.*, jobs.id as job_id, jobs.jname,
                        company_branches.name as branch_name,
                        DATE_FORMAT(job_applying.created_at, "%d/%m/%Y %H:%i") as appliedTime')
            ->orderByDesc('job_applying.created_at')
            ->paginate($perPage);

        return response()->json($candidates);
    }

    public function getRecommendedCandidates($job_id, CompanyAccessService $access, CandidateMatchingService $matching)
    {
        $access->requirePermission('search_candidates');
        $billingAccess = $this->requirePaidEmployerFeature('candidate_search');
        if ($billingAccess) {
            return $billingAccess;
        }

        $job = $access->assertCanAccessJob((int) $job_id);

        return response()->json($matching->rankForJob($job, 24)->map(function ($match) use ($job) {
            $match['job'] = [
                'id' => $job->id,
                'jname' => $job->jname,
                'amount' => $job->amount,
                'yoe' => $job->yoe,
                'branch_name' => $job->branch?->name,
            ];
            return $match;
        })->values());
    }

    public function searchCandidates(Request $req, CompanyAccessService $access, CandidateMatchingService $matching)
    {
        $member = $access->requirePermission('search_candidates');
        $billingAccess = $this->requirePaidEmployerFeature('candidate_search');
        if ($billingAccess) {
            return $billingAccess;
        }

        $keyword = trim((string) $req->query('keyword', ''));
        $skillIds = $req->query('skill_ids', []);
        $skillIds = is_array($skillIds) ? $skillIds : [$skillIds];
        $jobId = $req->query('job_id');
        $perPage = min((int) $req->query('per_page', 20), 50);

        $skillNames = collect();
        if (count($skillIds) > 0) {
            $skillNames = DB::table('jskills')
                ->whereIn('id', array_filter($skillIds))
                ->pluck('name')
                ->map(fn ($name) => strtolower(trim($name)))
                ->filter()
                ->values();
        }

        $job = null;
        if ($jobId) {
            $job = $access->assertCanAccessJob((int) $jobId);
        } else {
            $job = $access->scopedJobQuery($member)
                ->with(['skills', 'industries', 'branch', 'jtype', 'jlevel'])
                ->where('is_active', 1)
                ->whereHas('skills')
                ->orderByDesc('updated_at')
                ->first();
        }

        $candidateQuery = Candidate::query()
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
            ->orderByDesc('updated_at');

        if ($job) {
            return response()->json($matching->searchAndRank($job, $candidateQuery, $perPage));
        }

        $paginator = $candidateQuery
            ->with([
                'skills' => fn ($query) => $query->whereNull('resume_id'),
                'educations' => fn ($query) => $query->whereNull('resume_id'),
                'experiences' => fn ($query) => $query->whereNull('resume_id'),
                'projects' => fn ($query) => $query->whereNull('resume_id'),
                'certificates' => fn ($query) => $query->whereNull('resume_id'),
                'prizes' => fn ($query) => $query->whereNull('resume_id'),
            ])
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($candidate) => [
                'score' => null,
                'match_percent' => null,
                'reasons' => ['Chọn một tin tuyển dụng để hệ thống tính điểm phù hợp.'],
                'candidate' => $this->serializeCandidateLite($candidate),
                'matched_skills' => [],
                'missing_required_skills' => [],
                'missing_skills' => [],
            ])->values(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function getTalentRecommendations(CompanyAccessService $access, CandidateMatchingService $matching)
    {
        $member = $access->requirePermission('search_candidates');
        $billingAccess = $this->requirePaidEmployerFeature('candidate_search');
        if ($billingAccess) {
            return $billingAccess;
        }

        $jobs = $access->scopedJobQuery($member)
            ->with(['skills', 'industries', 'branch', 'jtype', 'jlevel'])
            ->where('is_active', 1)
            ->whereHas('skills')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get();

        if ($jobs->isEmpty()) {
            return response()->json([]);
        }

        $recommendations = collect();
        foreach ($jobs as $job) {
            $recommendations = $recommendations->merge(
                $matching->rankForJob($job, 8)->map(function ($match) use ($job) {
                    $match['job'] = [
                        'id' => $job->id,
                        'jname' => $job->jname,
                        'amount' => $job->amount,
                        'yoe' => $job->yoe,
                        'branch_name' => $job->branch?->name,
                    ];
                    return $match;
                })
            );
        }

        return response()->json(
            $recommendations
                ->sortByDesc('score')
                ->take(24)
                ->values()
        );
    }

    public function contactCandidate(Request $req, CompanyAccessService $access)
    {
        $access->requirePermission('search_candidates');
        $billingAccess = $this->requirePaidEmployerFeature('candidate_search');
        if ($billingAccess) {
            return $billingAccess;
        }

        $req->validate([
            'candidate_id' => 'required|integer|exists:candidates,id',
            'job_id' => 'required|integer|exists:jobs,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_send_mail' => 'nullable|boolean',
        ]);

        $job = $access->assertCanAccessJob((int) $req->job_id);

        $company = Employer::where('id', '=', $job->employer_id)->value('name');
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
        $access->log('candidate.contacted', Candidate::class, (int) $req->candidate_id, null, [
            'job_id' => $job->id,
            'title' => $req->title,
            'is_send_mail' => $req->boolean('is_send_mail'),
        ]);

        return response()->json('Sent successfully');
    }

    public function processApplying(Request $req, CompanyAccessService $access)
    {
        $access->requirePermission('manage_applications');
        $currentTime = Carbon::now()->format('H:i d/m/Y');
        $job = $access->assertCanAccessJob((int) $req->job_id);
        $company = Employer::where('id', '=', $job->employer_id)->value('name');

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
            ->whereIn('job_id', [$job->id])
            ->update([
                'status' => $nextStatus,
                'updated_at' => Carbon::now(),
            ]);

        if ($req->actType !== 'VIEWED') {
            CandidateMessage::create([
                'candidate_id' => $req->candidate_id,
                'job_id' => $job->id,
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
        $access->log('application.status_changed', 'job_applying', (int) $job->id, null, [
            'candidate_id' => $req->candidate_id,
            'status' => $nextStatus,
        ]);

        return response()->json('Updated successfully');
    }

    public function getJobList(Request $req, CompanyAccessService $access)
    {
        $member = $access->requirePermission('view_jobs');
        $keyword = $req->query('keyword');
        $perPage = min((int) $req->query('per_page', 30), 100);
        $jobs = $access->scopedJobQuery($member)
            ->with(['industries', 'locations', 'skills', 'branch'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->leftJoin('jtypes', 'jtype_id', '=', 'jtypes.id')
            ->leftJoin('jlevels', 'jlevel_id', '=', 'jlevels.id')
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
            ->paginate($perPage);

        return response()->json($jobs);
    }

    public function changeJobStatus(Request $req, CompanyAccessService $access)
    {
        $access->requirePermission('manage_jobs');
        $job = $access->assertCanAccessJob((int) $req->job_id);
        $before = $job->toArray();
        $status = (int) $req->status;
        $job->update([
            'is_active' => $status,
            'status' => $status ? 'active' : 'paused',
        ]);
        $access->log('job.status_changed', Job::class, $job->id, $before, $job->fresh()->toArray());

        return response()->json('Updated successfully');
    }

    private function nullableNumber($value)
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function requirePaidEmployerFeature(string $feature)
    {
        $access = app(EmployerBillingService::class)->checkAccessForEmployerUser(Auth::id(), $feature);
        if ($access['allowed']) {
            return null;
        }

        return response()->json([
            'message' => $access['message'],
            'code' => $access['code'],
            'billing_url' => '/employer/billing',
        ], 402);
    }

    private function serializeCandidateLite(Candidate $candidate): array
    {
        return [
            'id' => $candidate->id,
            'firstname' => $candidate->firstname,
            'lastname' => $candidate->lastname,
            'gender' => $candidate->gender,
            'dob' => $candidate->dob,
            'phone' => $candidate->phone,
            'email' => $candidate->email,
            'address' => $candidate->address,
            'map_lat' => $candidate->map_lat,
            'map_lng' => $candidate->map_lng,
            'objective' => $candidate->objective,
            'avatar' => $candidate->avatar,
            'link' => $candidate->link,
            'skills' => $candidate->skills->pluck('name')->filter()->values(),
            'educations' => $candidate->educations,
            'experiences' => $candidate->experiences,
            'projects' => $candidate->projects,
            'certificates' => $candidate->certificates,
            'prizes' => $candidate->prizes,
        ];
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
