<?php

namespace App\Http\Controllers;

use App\Models\Employer;
use App\Models\CompanyBranch;
use App\Models\CompanyMember;
use App\Models\Job;
use App\Models\User;
use App\Services\CompanyAccessService;
use App\Services\CompanyDeletionService;
use App\Services\GoogleMapLinkResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    public function getDashboard()
    {
        $this->ensureAdmin();

        $users = $this->getUsersQuery()
            ->orderByDesc('users.id')
            ->get();

        $companies = $this->getCompaniesQuery()
            ->orderByDesc('employers.id')
            ->get();

        $monthlyRegistrations = collect(range(5, 0))
            ->map(function ($offset) {
                $start = Carbon::now()->startOfMonth()->subMonths($offset);
                $end = (clone $start)->endOfMonth();

                return [
                    'label' => $start->format('m/Y'),
                    'value' => User::whereBetween('created_at', [$start, $end])->count(),
                ];
            })
            ->values();

        return response()->json([
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', 1)->count(),
                'locked_users' => User::where('is_active', 0)->count(),
                'total_admins' => User::where('role', 0)->count(),
                'total_candidates' => User::where('role', 1)->count(),
                'total_employers' => User::where('role', 2)->count(),
                'total_companies' => Employer::count(),
                'hot_companies' => Employer::where('is_hot', 1)->count(),
                'active_companies' => Employer::where('is_active', 1)->count(),
                'total_jobs' => DB::table('jobs')->count(),
                'active_jobs' => DB::table('jobs')->where('is_active', 1)->count(),
                'total_applications' => DB::table('job_applying')->count(),
            ],
            'role_breakdown' => [
                ['label' => 'Quản trị', 'value' => User::where('role', 0)->count(), 'tone' => '#0f766e'],
                ['label' => 'Ứng viên', 'value' => User::where('role', 1)->count(), 'tone' => '#0ea5e9'],
                ['label' => 'Nhà tuyển dụng', 'value' => User::where('role', 2)->count(), 'tone' => '#f59e0b'],
            ],
            'status_breakdown' => [
                ['label' => 'Đang hoạt động', 'value' => User::where('is_active', 1)->count(), 'tone' => '#16a34a'],
                ['label' => 'Đang khóa', 'value' => User::where('is_active', 0)->count(), 'tone' => '#ef4444'],
            ],
            'monthly_registrations' => $monthlyRegistrations,
            'users' => $users,
            'companies' => $companies,
            'current_admin' => Auth::user(),
        ]);
    }

    public function createCompany(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'map_lat' => 'nullable|numeric|between:-90,90',
            'map_lng' => 'nullable|numeric|between:-180,180',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:60',
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'min_employees' => 'nullable',
            'max_employees' => 'nullable',
            'is_hot' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        $company = DB::transaction(function () use ($request, $validated) {
            $user = User::create([
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 2,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $employer = Employer::create([
                'id' => $user->id,
                'user_id' => $user->id,
                'name' => $validated['name'],
                'address' => $validated['address'] ?? '',
                'map_lat' => $this->nullableCoordinate($validated['map_lat'] ?? null),
                'map_lng' => $this->nullableCoordinate($validated['map_lng'] ?? null),
                'min_employees' => $this->nullableNumber($validated['min_employees'] ?? null),
                'max_employees' => $this->nullableNumber($validated['max_employees'] ?? null),
                'contact_name' => $validated['contact_name'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'website' => $validated['website'] ?? null,
                'description' => $validated['description'] ?? null,
                'logo' => '',
                'image' => null,
                'is_hot' => $request->boolean('is_hot'),
                'is_active' => $request->boolean('is_active', true),
            ]);

            if ($request->hasFile('logo')) {
                $employer->logo = $this->storeEmployerAsset(
                    $request->file('logo'),
                    $employer->id,
                    'company_logos',
                    'logo'
                );
            }

            if ($request->hasFile('image')) {
                $employer->image = $this->storeEmployerAsset(
                    $request->file('image'),
                    $employer->id,
                    'company_covers',
                    'cover'
                );
            }

            $employer->save();
            app(CompanyAccessService::class)->ensureOwnerMemberForEmployer($employer);

            return $employer->fresh();
        });

        return response()->json($company, 201);
    }

    public function updateCompany(Request $request, $id)
    {
        $this->ensureAdmin();

        $employer = Employer::where('id', $id)->orWhere('user_id', $id)->first();
        if (!$employer) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $user = User::find($employer->user_id);
        if (!$user) {
            return response()->json(['message' => 'user not found'], 404);
        }

        $validated = $request->validate([
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
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
            'is_hot' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:8192',
        ]);

        $updatedCompany = DB::transaction(function () use ($request, $validated, $employer, $user) {
            if (array_key_exists('email', $validated)) {
                $user->email = $validated['email'];
            }

            if ($request->filled('password')) {
                $user->password = Hash::make($validated['password']);
            }

            if ($request->has('is_active')) {
                $user->is_active = $request->boolean('is_active');
                $employer->is_active = $request->boolean('is_active');
            }

            $user->save();

            $employer->fill([
                'name' => $validated['name'] ?? $employer->name,
                'address' => $validated['address'] ?? $employer->address,
                'map_lat' => array_key_exists('map_lat', $validated)
                    ? $this->nullableCoordinate($validated['map_lat'])
                    : $employer->map_lat,
                'map_lng' => array_key_exists('map_lng', $validated)
                    ? $this->nullableCoordinate($validated['map_lng'])
                    : $employer->map_lng,
                'contact_name' => array_key_exists('contact_name', $validated)
                    ? $validated['contact_name']
                    : $employer->contact_name,
                'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : $employer->phone,
                'website' => array_key_exists('website', $validated) ? $validated['website'] : $employer->website,
                'description' => array_key_exists('description', $validated)
                    ? $validated['description']
                    : $employer->description,
                'min_employees' => array_key_exists('min_employees', $validated)
                    ? $this->nullableNumber($validated['min_employees'])
                    : $employer->min_employees,
                'max_employees' => array_key_exists('max_employees', $validated)
                    ? $this->nullableNumber($validated['max_employees'])
                    : $employer->max_employees,
            ]);

            if ($request->has('is_hot')) {
                $employer->is_hot = $request->boolean('is_hot');
            }

            if ($request->hasFile('logo')) {
                $this->deleteLocalFileFromUrl($employer->logo);
                $employer->logo = $this->storeEmployerAsset(
                    $request->file('logo'),
                    $employer->id,
                    'company_logos',
                    'logo'
                );
            }

            if ($request->hasFile('image')) {
                $this->deleteLocalFileFromUrl($employer->image);
                $employer->image = $this->storeEmployerAsset(
                    $request->file('image'),
                    $employer->id,
                    'company_covers',
                    'cover'
                );
            }

            $employer->save();

            return $employer->fresh();
        });

        return response()->json($updatedCompany);
    }

    public function resolveSharedMapLink(Request $request, GoogleMapLinkResolver $mapResolver)
    {
        $this->ensureAdmin();

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

    public function getCompanyDetail($id)
    {
        $this->ensureAdmin();

        $company = Employer::with([
            'branches' => fn ($query) => $query->orderByDesc('is_headquarters')->orderBy('name'),
            'members.user:id,email,role,is_active',
            'members.branch:id,name',
            'subscriptions' => fn ($query) => $query->orderByDesc('ends_at'),
            'payments' => fn ($query) => $query->orderByDesc('created_at')->limit(10),
        ])->where('id', $id)->orWhere('user_id', $id)->first();

        if (!$company) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        return response()->json($company);
    }

    public function getCompanyBranches($id)
    {
        $this->ensureAdmin();
        $company = $this->findCompanyOrFail($id);

        return response()->json([
            'data' => CompanyBranch::where('employer_id', $company->id)
                ->orderByDesc('is_headquarters')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function createCompanyBranch(Request $request, $id)
    {
        $this->ensureAdmin();
        $company = $this->findCompanyOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:180',
            'address' => 'nullable|string|max:500',
            'map_lat' => 'nullable|numeric|between:-90,90',
            'map_lng' => 'nullable|numeric|between:-180,180',
            'contact_name' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $branch = CompanyBranch::create([
            'employer_id' => $company->id,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'map_lat' => $this->nullableCoordinate($validated['map_lat'] ?? null),
            'map_lng' => $this->nullableCoordinate($validated['map_lng'] ?? null),
            'contact_name' => $validated['contact_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'is_headquarters' => false,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->writeAdminAudit('admin.branch.created', CompanyBranch::class, $branch->id, null, $branch->toArray(), $company->id);

        return response()->json($branch, 201);
    }

    public function updateCompanyBranch(Request $request, $id)
    {
        $this->ensureAdmin();
        $branch = CompanyBranch::find($id);

        if (!$branch) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:180',
            'address' => 'nullable|string|max:500',
            'map_lat' => 'nullable|numeric|between:-90,90',
            'map_lng' => 'nullable|numeric|between:-180,180',
            'contact_name' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $before = $branch->toArray();
        $branch->fill([
            'name' => $validated['name'] ?? $branch->name,
            'address' => array_key_exists('address', $validated) ? $validated['address'] : $branch->address,
            'map_lat' => array_key_exists('map_lat', $validated)
                ? $this->nullableCoordinate($validated['map_lat'])
                : $branch->map_lat,
            'map_lng' => array_key_exists('map_lng', $validated)
                ? $this->nullableCoordinate($validated['map_lng'])
                : $branch->map_lng,
            'contact_name' => array_key_exists('contact_name', $validated) ? $validated['contact_name'] : $branch->contact_name,
            'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : $branch->phone,
            'email' => array_key_exists('email', $validated) ? $validated['email'] : $branch->email,
        ]);

        if ($request->has('is_active')) {
            $branch->is_active = $request->boolean('is_active');
        }

        $branch->save();
        $this->writeAdminAudit('admin.branch.updated', CompanyBranch::class, $branch->id, $before, $branch->fresh()->toArray(), $branch->employer_id);

        return response()->json($branch->fresh());
    }

    public function destroyCompanyBranch(CompanyDeletionService $deletion, $id)
    {
        $this->ensureAdmin();
        $branch = CompanyBranch::find($id);

        if (!$branch) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $before = $branch->toArray();
        $counts = $deletion->deleteBranch($branch);
        $this->writeAdminAudit('admin.branch.deleted', CompanyBranch::class, (int) $id, $before, $counts, $before['employer_id'] ?? null);

        return response()->json(['message' => 'Branch deleted successfully', 'deleted' => $counts]);
    }

    public function getCompanyMembers($id)
    {
        $this->ensureAdmin();
        $company = $this->findCompanyOrFail($id);

        return response()->json([
            'data' => CompanyMember::with(['user:id,email,role,is_active', 'branch:id,name'])
                ->where('employer_id', $company->id)
                ->orderByRaw("FIELD(role, 'company_owner', 'branch_manager', 'branch_hr')")
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function createCompanyMember(Request $request, $id)
    {
        $this->ensureAdmin();
        $company = $this->findCompanyOrFail($id);

        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'name' => 'required|string|max:160',
            'phone' => 'nullable|string|max:40',
            'title' => 'nullable|string|max:120',
            'role' => 'required|in:branch_manager,branch_hr',
            'branch_id' => 'required|integer',
            'status' => 'nullable|in:active,inactive',
        ]);

        $branch = CompanyBranch::where('employer_id', $company->id)
            ->where('id', $validated['branch_id'])
            ->first();

        if (!$branch) {
            return response()->json(['message' => 'Chi nhánh không thuộc công ty này.'], 422);
        }

        $temporaryPassword = $validated['password'] ?? Str::password(10, true, true, false, false);

        $member = DB::transaction(function () use ($validated, $company, $branch, $temporaryPassword) {
            $user = User::create([
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => 2,
                'is_active' => ($validated['status'] ?? 'active') === 'active' ? 1 : 0,
            ]);

            return CompanyMember::create([
                'employer_id' => $company->id,
                'branch_id' => $branch->id,
                'user_id' => $user->id,
                'role' => $validated['role'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'title' => $validated['title'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'created_by' => Auth::id(),
            ])->load(['user:id,email,role,is_active', 'branch:id,name']);
        });

        $this->writeAdminAudit('admin.member.created', CompanyMember::class, $member->id, null, $member->toArray(), $company->id, $branch->id);

        return response()->json([
            'member' => $member,
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    public function updateCompanyMember(Request $request, $id)
    {
        $this->ensureAdmin();
        $member = CompanyMember::with('user')->find($id);

        if (!$member) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $validated = $request->validate([
            'email' => 'nullable|email|max:255|unique:users,email,' . $member->user_id,
            'password' => 'nullable|string|min:6',
            'name' => 'nullable|string|max:160',
            'phone' => 'nullable|string|max:40',
            'title' => 'nullable|string|max:120',
            'role' => 'nullable|in:branch_manager,branch_hr',
            'branch_id' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive',
            'is_active' => 'nullable|boolean',
        ]);

        if ($member->role === CompanyMember::ROLE_COMPANY_OWNER && array_key_exists('role', $validated)) {
            return response()->json(['message' => 'Không đổi vai trò tài khoản tổng công ty tại đây.'], 422);
        }

        if (array_key_exists('branch_id', $validated)) {
            $branch = CompanyBranch::where('employer_id', $member->employer_id)
                ->where('id', $validated['branch_id'])
                ->first();

            if (!$branch) {
                return response()->json(['message' => 'Chi nhánh không thuộc công ty này.'], 422);
            }
        }

        $before = $member->toArray();

        DB::transaction(function () use ($request, $validated, $member) {
            if ($member->user) {
                if (array_key_exists('email', $validated)) {
                    $member->user->email = $validated['email'];
                }
                if ($request->filled('password')) {
                    $member->user->password = Hash::make($validated['password']);
                }
                if ($request->has('is_active') || array_key_exists('status', $validated)) {
                    $member->user->is_active = $request->has('is_active')
                        ? $request->boolean('is_active')
                        : (($validated['status'] ?? $member->status) === 'active' ? 1 : 0);
                }
                $member->user->save();
            }

            foreach (['name', 'phone', 'title', 'role', 'branch_id', 'status'] as $field) {
                if (array_key_exists($field, $validated)) {
                    $member->{$field} = $validated[$field];
                }
            }

            $member->save();
        });

        $fresh = $member->fresh(['user:id,email,role,is_active', 'branch:id,name']);
        $this->writeAdminAudit('admin.member.updated', CompanyMember::class, $member->id, $before, $fresh->toArray(), $member->employer_id, $member->branch_id);

        return response()->json($fresh);
    }

    public function destroyCompanyMember(CompanyDeletionService $deletion, $id)
    {
        $this->ensureAdmin();
        $member = CompanyMember::with('user')->find($id);

        if (!$member) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $before = $member->toArray();
        $counts = $deletion->deleteMember($member);
        $this->writeAdminAudit('admin.member.deleted', CompanyMember::class, (int) $id, $before, $counts, $before['employer_id'] ?? null, $before['branch_id'] ?? null);

        return response()->json(['message' => 'Member deleted successfully', 'deleted' => $counts]);
    }

    public function impersonateUser($id)
    {
        $admin = $this->ensureAdmin();
        $target = User::find($id);

        if (!$target) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        if (!(int) $target->is_active) {
            return response()->json(['message' => 'Tài khoản đang bị khóa.'], 422);
        }

        $token = JWTAuth::claims([
            'impersonator_user_id' => $admin->id,
        ])->fromUser($target);

        $this->writeAdminAudit('admin.user.impersonated', User::class, $target->id, null, [
            'target_user_id' => $target->id,
            'target_role' => $target->role,
        ]);

        return response()->json([
            'user' => $target,
            'role' => (int) $target->role,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ],
        ]);
    }

    public function updateUserPassword(Request $request, $id)
    {
        $this->ensureAdmin();

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function getJobs(Request $request)
    {
        $this->ensureAdmin();

        $jobs = Job::query()
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->leftJoin('company_branches', 'jobs.branch_id', '=', 'company_branches.id')
            ->when($request->filled('company_id'), function ($query) use ($request) {
                return $query->where('jobs.employer_id', $request->company_id);
            })
            ->when($request->filled('keyword'), function ($query) use ($request) {
                $keyword = strtolower($request->keyword);

                return $query->where(function ($subQuery) use ($keyword) {
                    $subQuery->whereRaw('LOWER(jobs.jname) LIKE ?', ['%' . $keyword . '%'])
                        ->orWhereRaw('LOWER(employers.name) LIKE ?', ['%' . $keyword . '%']);
                });
            })
            ->selectRaw("
                jobs.*,
                employers.name as employer_name,
                employers.logo as employer_logo,
                employers.is_active as employer_is_active,
                company_branches.name as branch_name,
                DATE_FORMAT(jobs.created_at, '%d/%m/%Y') as post_date,
                DATE_FORMAT(jobs.expire_at, '%d/%m/%Y') as deadline
            ")
            ->orderByDesc('jobs.created_at')
            ->get();

        return response()->json($jobs);
    }

    public function updateJob(Request $request, $id)
    {
        $this->ensureAdmin();

        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'nullable|boolean',
            'is_hot' => 'nullable|boolean',
        ]);

        if (array_key_exists('is_active', $validated)) {
            $job->is_active = (int) $validated['is_active'];
        }

        if (array_key_exists('is_hot', $validated)) {
            $job->is_hot = (int) $validated['is_hot'];
        }

        $job->save();

        return response()->json($job->fresh());
    }

    public function destroyJob(CompanyDeletionService $deletion, $id)
    {
        $this->ensureAdmin();

        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $before = $job->toArray();
        $counts = $deletion->deleteJobs([$job->id]);
        $this->writeAdminAudit('admin.job.deleted', Job::class, (int) $id, $before, $counts, $before['employer_id'] ?? null, $before['branch_id'] ?? null);

        return response()->json(['message' => 'Job deleted successfully', 'deleted' => $counts]);
    }

    public function toggleUserStatus(Request $request, $id)
    {
        $this->ensureAdmin();

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        if ((int) Auth::id() === (int) $user->id && !$validated['is_active']) {
            return response()->json([
                'message' => 'Bạn không thể tự khóa tài khoản quản trị đang đăng nhập.',
            ], 422);
        }

        $user->is_active = (int) $validated['is_active'];
        $user->save();

        if ((int) $user->role === 2) {
            Employer::where('user_id', $user->id)->update([
                'is_active' => (int) $validated['is_active'],
            ]);
        }

        return response()->json(['message' => 'Status updated successfully']);
    }

    public function destroyUser(CompanyDeletionService $deletion, $id)
    {
        $this->ensureAdmin();

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        if ((int) Auth::id() === (int) $user->id) {
            return response()->json([
                'message' => 'Bạn không thể tự xóa tài khoản quản trị đang đăng nhập.',
            ], 422);
        }

        $before = $user->toArray();
        $counts = $deletion->deleteUser($user);
        $this->writeAdminAudit('admin.user.deleted', User::class, (int) $id, $before, $counts);

        return response()->json(['message' => 'User deleted successfully', 'deleted' => $counts]);
    }

    public function destroyCompany(CompanyDeletionService $deletion, $id)
    {
        $this->ensureAdmin();

        $employer = Employer::where('id', $id)->orWhere('user_id', $id)->first();
        if (!$employer) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        $before = $employer->toArray();
        if ((int) Auth::id() === (int) $employer->user_id) {
            return response()->json([
                'message' => 'Bạn không thể tự xóa công ty của tài khoản quản trị đang đăng nhập.',
            ], 422);
        }

        $counts = $deletion->deleteEmployer($employer, true);
        $this->writeAdminAudit('admin.company.deleted', Employer::class, (int) $id, $before, $counts, $before['id'] ?? null);

        return response()->json(['message' => 'Company deleted successfully', 'deleted' => $counts]);
    }

    private function getUsersQuery()
    {
        return User::query()
            ->leftJoin('candidates', 'users.id', '=', 'candidates.user_id')
            ->leftJoin('employers', 'users.id', '=', 'employers.user_id')
            ->selectRaw("
                users.id,
                users.email,
                users.role,
                users.is_active,
                users.created_at,
                employers.id as employer_id,
                employers.name as company_name,
                employers.logo as company_logo,
                candidates.firstname,
                candidates.lastname
            ")
            ->selectRaw("
                CASE
                    WHEN users.role = 1 THEN TRIM(CONCAT(COALESCE(candidates.lastname, ''), ' ', COALESCE(candidates.firstname, '')))
                    WHEN users.role = 2 THEN COALESCE(employers.name, users.email)
                    ELSE 'System Admin'
                END as display_name
            ");
    }

    private function getCompaniesQuery()
    {
        $jobCountSub = DB::table('jobs')
            ->selectRaw('employer_id, COUNT(*) as jobs_count')
            ->groupBy('employer_id');

        $applicationCountSub = DB::table('jobs')
            ->join('job_applying', 'jobs.id', '=', 'job_applying.job_id')
            ->selectRaw('jobs.employer_id, COUNT(job_applying.candidate_id) as applications_count')
            ->groupBy('jobs.employer_id');

        return Employer::query()
            ->leftJoin('users', 'employers.user_id', '=', 'users.id')
            ->leftJoinSub($jobCountSub, 'job_counts', function ($join) {
                $join->on('employers.id', '=', 'job_counts.employer_id');
            })
            ->leftJoinSub($applicationCountSub, 'application_counts', function ($join) {
                $join->on('employers.id', '=', 'application_counts.employer_id');
            })
            ->selectRaw("
                employers.*,
                users.email as account_email,
                users.is_active as account_is_active,
                COALESCE(job_counts.jobs_count, 0) as jobs_count,
                COALESCE(application_counts.applications_count, 0) as applications_count
            ");
    }

    private function findCompanyOrFail($id): Employer
    {
        $company = Employer::where('id', $id)->orWhere('user_id', $id)->first();

        if (!$company) {
            abort(404, 'resource not found');
        }

        return $company;
    }

    private function writeAdminAudit(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?array $before = null,
        ?array $after = null,
        ?int $employerId = null,
        ?int $branchId = null
    ): void {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        DB::table('audit_logs')->insert([
            'actor_user_id' => Auth::id(),
            'impersonator_user_id' => null,
            'employer_id' => $employerId,
            'branch_id' => $branchId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'before_payload' => $before ? json_encode($before, JSON_UNESCAPED_UNICODE) : null,
            'after_payload' => $after ? json_encode($after, JSON_UNESCAPED_UNICODE) : null,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'note' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function cleanupCandidateAccount(User $user)
    {
        $candidateId = $user->id;

        $candidate = DB::table('candidates')->where('user_id', $candidateId)->first();
        $candidateAvatar = $candidate?->avatar;

        $resumeAssets = DB::table('resumes')
            ->where('candidate_id', $candidateId)
            ->get(['cv_link', 'avatar']);

        $applicationAssets = DB::table('job_applying')
            ->where('candidate_id', $candidateId)
            ->pluck('cv_link');

        DB::table('saved_jobs')->where('candidate_id', $candidateId)->delete();
        DB::table('candidate_messages')->where('candidate_id', $candidateId)->delete();
        DB::table('job_applying')->where('candidate_id', $candidateId)->delete();
        DB::table('educations')->where('candidate_id', $candidateId)->delete();
        DB::table('experiences')->where('candidate_id', $candidateId)->delete();
        DB::table('projects')->where('candidate_id', $candidateId)->delete();
        DB::table('skills')->where('candidate_id', $candidateId)->delete();
        DB::table('certificates')->where('candidate_id', $candidateId)->delete();
        DB::table('prizes')->where('candidate_id', $candidateId)->delete();
        DB::table('activities')->where('candidate_id', $candidateId)->delete();
        DB::table('others')->where('candidate_id', $candidateId)->delete();
        DB::table('resumes')->where('candidate_id', $candidateId)->delete();
        DB::table('candidates')->where('user_id', $candidateId)->delete();
        $user->delete();

        $paths = collect([$candidateAvatar])
            ->merge($resumeAssets->pluck('cv_link'))
            ->merge($resumeAssets->pluck('avatar'))
            ->merge($applicationAssets)
            ->filter()
            ->unique()
            ->values();

        foreach ($paths as $path) {
            $this->deleteLocalFileFromUrl($path);
        }
    }

    private function cleanupEmployerAccount(User $user, ?Employer $employer = null)
    {
        $company = $employer ?: Employer::where('user_id', $user->id)->first();

        if ($company) {
            $this->cleanupEmployerDataOnly($company);
        } else {
            $jobIds = DB::table('jobs')->where('employer_id', $user->id)->pluck('id');
            if ($jobIds->isNotEmpty()) {
                DB::table('candidate_messages')->whereIn('job_id', $jobIds)->delete();
                DB::table('job_applying')->whereIn('job_id', $jobIds)->delete();
                DB::table('job_industry')->whereIn('job_id', $jobIds)->delete();
                DB::table('job_location')->whereIn('job_id', $jobIds)->delete();
                DB::table('job_skill')->whereIn('job_id', $jobIds)->delete();
                DB::table('job_tag')->whereIn('job_id', $jobIds)->delete();
                DB::table('jobs')->whereIn('id', $jobIds)->delete();
            }
        }

        $user->delete();
    }

    private function cleanupEmployerDataOnly(Employer $company)
    {
        $jobIds = DB::table('jobs')->where('employer_id', $company->id)->pluck('id');
        $applicationFiles = collect();

        if ($jobIds->isNotEmpty()) {
            $applicationFiles = DB::table('job_applying')
                ->whereIn('job_id', $jobIds)
                ->pluck('cv_link');

            DB::table('candidate_messages')->whereIn('job_id', $jobIds)->delete();
            DB::table('job_applying')->whereIn('job_id', $jobIds)->delete();
            DB::table('job_industry')->whereIn('job_id', $jobIds)->delete();
            DB::table('job_location')->whereIn('job_id', $jobIds)->delete();
            DB::table('job_skill')->whereIn('job_id', $jobIds)->delete();
            DB::table('job_tag')->whereIn('job_id', $jobIds)->delete();
            DB::table('jobs')->whereIn('id', $jobIds)->delete();
        }

        DB::table('employer_location')->where('employer_id', $company->id)->delete();

        $assetPaths = collect([$company->logo, $company->image])
            ->merge($applicationFiles)
            ->filter()
            ->unique()
            ->values();

        $company->delete();

        foreach ($assetPaths as $path) {
            $this->deleteLocalFileFromUrl($path);
        }
    }

    private function ensureAdmin()
    {
        $user = Auth::user();
        if (!$user || (int) $user->role !== 0) {
            abort(403, 'Forbidden');
        }

        return $user;
    }

    private function nullableNumber($value)
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function nullableCoordinate($value)
    {
        if ($value === null || $value === '') {
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

    private function deleteLocalFileFromUrl($url)
    {
        if (!$url) {
            return;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return;
        }

        $relativePath = ltrim(rawurldecode($path), '/');
        $fullPath = null;

        if (
            str_starts_with($relativePath, 'cv_images/')
            || str_starts_with($relativePath, 'company_logos/')
            || str_starts_with($relativePath, 'company_covers/')
        ) {
            $fullPath = storage_path($relativePath);
        } elseif (str_starts_with($relativePath, 'storage/')) {
            $fullPath = public_path($relativePath);
        }

        if ($fullPath && File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}
