<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\CompanyBranch;
use App\Models\CompanyMember;
use App\Models\Employer;
use App\Models\EmployerSubscription;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyAccessService
{
    public function currentMember(?int $userId = null): ?CompanyMember
    {
        $userId = $userId ?: Auth::id();
        if (!$userId) {
            return null;
        }

        return CompanyMember::query()
            ->with([
                'employer',
                'branch',
                'user:id,email,role,is_active',
            ])
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->first();
    }

    public function requireMember(?int $userId = null): CompanyMember
    {
        $member = $this->currentMember($userId);
        $user = Auth::user();

        if (!$member || !$user || (int) $user->role !== 2 || !(int) $user->is_active) {
            abort(403, 'Bạn không có quyền truy cập không gian nhà tuyển dụng.');
        }

        return $member;
    }

    public function requireCompanyOwner(): CompanyMember
    {
        $member = $this->requireMember();
        if ($member->role !== CompanyMember::ROLE_COMPANY_OWNER) {
            abort(403, 'Chỉ tài khoản tổng công ty được thực hiện thao tác này.');
        }

        return $member;
    }

    public function requirePermission(string $permission): CompanyMember
    {
        $member = $this->requireMember();
        $permissions = $this->permissionsFor($member);

        if (empty($permissions[$permission])) {
            abort(403, 'Bạn không có quyền thực hiện thao tác này.');
        }

        return $member;
    }

    public function requireActiveSubscription(?CompanyMember $member = null): CompanyMember
    {
        $member = $member ?: $this->requireMember();
        $hasSubscription = EmployerSubscription::where('employer_id', $member->employer_id)
            ->where('status', 'ACTIVE')
            ->where('ends_at', '>=', now())
            ->exists();

        if (!$hasSubscription) {
            abort(402, 'Công ty cần thanh toán gói dịch vụ trước khi sử dụng chức năng quản trị.');
        }

        return $member;
    }

    public function assertCanManageBranch(?int $branchId): CompanyBranch
    {
        $member = $this->requireMember();
        $branch = CompanyBranch::where('employer_id', $member->employer_id)
            ->where('id', $branchId)
            ->first();

        if (!$branch) {
            abort(404, 'Không tìm thấy chi nhánh.');
        }

        if (!$member->canManageBranch($branch->id)) {
            abort(403, 'Bạn không có quyền thao tác trên chi nhánh này.');
        }

        return $branch;
    }

    public function assertCanManageMember(CompanyMember $targetMember): CompanyMember
    {
        $member = $this->requireMember();

        if ((int) $member->employer_id !== (int) $targetMember->employer_id) {
            abort(403, 'Không cùng công ty.');
        }

        if ($member->role === CompanyMember::ROLE_COMPANY_OWNER) {
            return $member;
        }

        if (
            $member->role === CompanyMember::ROLE_BRANCH_MANAGER
            && $targetMember->role === CompanyMember::ROLE_BRANCH_HR
            && (int) $member->branch_id === (int) $targetMember->branch_id
        ) {
            return $member;
        }

        abort(403, 'Bạn không có quyền quản lý tài khoản HR này.');
    }

    public function scopedJobQuery(?CompanyMember $member = null): Builder
    {
        $member = $member ?: $this->requireMember();
        $query = Job::query()->where('employer_id', $member->employer_id);

        if (!$member->isCompanyWide()) {
            $query->where('branch_id', $member->branch_id);
        }

        return $query;
    }

    public function assertCanAccessJob(int $jobId): Job
    {
        $job = $this->scopedJobQuery()->where('jobs.id', $jobId)->first();
        if (!$job) {
            abort(404, 'Không tìm thấy tin tuyển dụng trong phạm vi quyền của bạn.');
        }

        return $job;
    }

    public function assertBranchBelongsToCompany(?int $branchId, ?CompanyMember $member = null): ?CompanyBranch
    {
        $member = $member ?: $this->requireMember();

        if (!$branchId) {
            return null;
        }

        $branch = CompanyBranch::where('employer_id', $member->employer_id)
            ->where('id', $branchId)
            ->where('is_active', 1)
            ->first();

        if (!$branch) {
            abort(422, 'Chi nhánh không hợp lệ hoặc đã ngừng hoạt động.');
        }

        if (!$member->canManageBranch($branch->id)) {
            abort(403, 'Bạn không có quyền dùng chi nhánh này.');
        }

        return $branch;
    }

    public function defaultBranchForMember(?CompanyMember $member = null): ?CompanyBranch
    {
        $member = $member ?: $this->requireMember();

        if ($member->branch_id) {
            return CompanyBranch::where('employer_id', $member->employer_id)
                ->where('id', $member->branch_id)
                ->first();
        }

        return CompanyBranch::where('employer_id', $member->employer_id)
            ->where('is_headquarters', 1)
            ->first()
            ?: CompanyBranch::where('employer_id', $member->employer_id)->first();
    }

    public function companyPayload(?CompanyMember $member = null): array
    {
        $member = $member ?: $this->requireMember();
        $employer = Employer::with([
            'branches' => fn ($query) => $query->orderByDesc('is_headquarters')->orderBy('name'),
            'members.branch',
            'subscriptions' => fn ($query) => $query->orderByDesc('ends_at'),
        ])->find($member->employer_id);

        return [
            'employer' => $employer,
            'company' => $employer,
            'member' => $member,
            'role' => $member->role,
            'branch' => $member->branch,
            'branches' => $this->visibleBranches($member)->values(),
            'permissions' => $this->permissionsFor($member),
        ];
    }

    public function visibleBranches(?CompanyMember $member = null)
    {
        $member = $member ?: $this->requireMember();
        $query = CompanyBranch::where('employer_id', $member->employer_id)
            ->orderByDesc('is_headquarters')
            ->orderBy('name');

        if (!$member->isCompanyWide()) {
            $query->where('id', $member->branch_id);
        }

        return $query->get();
    }

    public function permissionsFor(CompanyMember $member): array
    {
        $companyWide = $member->role === CompanyMember::ROLE_COMPANY_OWNER;
        $branchManager = $member->role === CompanyMember::ROLE_BRANCH_MANAGER;
        return [
            'role' => $member->role,
            'manage_company_profile' => $companyWide,
            'view_branches' => $companyWide || $branchManager,
            'create_branches' => $companyWide,
            'update_branches' => $companyWide,
            'update_own_branch' => $branchManager,
            'delete_branches' => $companyWide,
            'manage_branches' => $companyWide,
            'view_members' => $companyWide || $branchManager,
            'create_members' => $companyWide || $branchManager,
            'update_members' => $companyWide || $branchManager,
            'lock_members' => $companyWide || $branchManager,
            'unlock_members' => $companyWide || $branchManager,
            'manage_company_members' => $companyWide,
            'manage_branch_members' => $companyWide || $branchManager,
            'view_jobs' => true,
            'manage_jobs' => $companyWide || $branchManager,
            'view_applications' => true,
            'manage_applications' => $companyWide || $branchManager,
            'search_candidates' => $companyWide || $branchManager,
            'manage_billing' => $companyWide,
            'view_all_branches' => $companyWide,
        ];
    }

    public function log(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?array $before = null,
        ?array $after = null,
        ?string $note = null,
        ?Request $request = null
    ): void {
        $request = $request ?: request();
        $member = $this->currentMember();

        AuditLog::create([
            'actor_user_id' => Auth::id(),
            'impersonator_user_id' => session('impersonator_user_id'),
            'employer_id' => $member?->employer_id,
            'branch_id' => $member?->branch_id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'before_payload' => $before,
            'after_payload' => $after,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'note' => $note,
        ]);
    }

    public function ensureOwnerMemberForEmployer(Employer $employer): CompanyMember
    {
        $branch = CompanyBranch::firstOrCreate(
            [
                'employer_id' => $employer->id,
                'is_headquarters' => true,
            ],
            [
                'name' => 'Trụ sở chính',
                'address' => $employer->address,
                'map_lat' => $employer->map_lat ?? null,
                'map_lng' => $employer->map_lng ?? null,
                'contact_name' => $employer->contact_name,
                'phone' => $employer->phone,
                'is_active' => true,
            ]
        );

        return CompanyMember::firstOrCreate(
            ['user_id' => $employer->user_id],
            [
                'employer_id' => $employer->id,
                'branch_id' => null,
                'role' => CompanyMember::ROLE_COMPANY_OWNER,
                'title' => 'Tài khoản tổng công ty',
                'status' => 'active',
            ]
        );
    }
}
