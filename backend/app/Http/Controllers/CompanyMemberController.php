<?php

namespace App\Http\Controllers;

use App\Models\CompanyMember;
use App\Models\User;
use App\Services\CompanyAccessService;
use App\Services\CompanyDeletionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CompanyMemberController extends Controller
{
    public function index(CompanyAccessService $access)
    {
        $member = $access->requirePermission('view_members');
        $query = CompanyMember::with(['user:id,email,role,is_active', 'branch'])
            ->where('employer_id', $member->employer_id)
            ->orderByRaw("FIELD(role, 'company_owner', 'branch_manager', 'branch_hr')")
            ->orderByDesc('id');

        if ($member->role === CompanyMember::ROLE_BRANCH_MANAGER) {
            $query->where('branch_id', $member->branch_id)
                ->where('role', CompanyMember::ROLE_BRANCH_HR);
        } elseif ($member->role === CompanyMember::ROLE_BRANCH_HR) {
            $query->where('user_id', $member->user_id);
        }

        return response()->json([
            'data' => $query->get(),
            'permissions' => $access->permissionsFor($member),
        ]);
    }

    public function store(Request $request, CompanyAccessService $access)
    {
        $actor = $access->requirePermission('create_members');
        $access->requireActiveSubscription($actor);

        $roles = $actor->role === CompanyMember::ROLE_COMPANY_OWNER
            ? [CompanyMember::ROLE_BRANCH_MANAGER, CompanyMember::ROLE_BRANCH_HR]
            : [CompanyMember::ROLE_BRANCH_HR];

        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'name' => 'required|string|max:160',
            'phone' => 'nullable|string|max:40',
            'title' => 'nullable|string|max:120',
            'role' => ['required', Rule::in($roles)],
            'branch_id' => 'required|integer',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $branch = $access->assertBranchBelongsToCompany((int) $validated['branch_id'], $actor);
        $plainPassword = $validated['password'] ?? Str::password(10, true, true, false, false);

        $companyMember = DB::transaction(function () use ($validated, $actor, $branch, $plainPassword) {
            $user = User::create([
                'email' => $validated['email'],
                'password' => Hash::make($plainPassword),
                'role' => 2,
                'is_active' => ($validated['status'] ?? 'active') === 'active',
            ]);

            return CompanyMember::create([
                'employer_id' => $actor->employer_id,
                'branch_id' => $branch->id,
                'user_id' => $user->id,
                'role' => $validated['role'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'title' => $validated['title'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'created_by' => $actor->user_id,
            ])->load(['user:id,email,role,is_active', 'branch']);
        });

        $access->log('company_member.created', CompanyMember::class, $companyMember->id, null, $companyMember->toArray());

        return response()->json([
            'member' => $companyMember,
            'temporary_password' => $request->filled('password') ? null : $plainPassword,
        ], 201);
    }

    public function update(Request $request, CompanyAccessService $access, $id)
    {
        $target = CompanyMember::with('user')->findOrFail($id);
        $access->requirePermission('update_members');
        $actor = $access->assertCanManageMember($target);
        $access->requireActiveSubscription($actor);
        $before = $target->toArray();

        $roles = $actor->role === CompanyMember::ROLE_COMPANY_OWNER
            ? [CompanyMember::ROLE_COMPANY_OWNER, CompanyMember::ROLE_BRANCH_MANAGER, CompanyMember::ROLE_BRANCH_HR]
            : [CompanyMember::ROLE_BRANCH_HR];

        $validated = $request->validate([
            'name' => 'nullable|string|max:160',
            'phone' => 'nullable|string|max:40',
            'title' => 'nullable|string|max:120',
            'role' => ['nullable', Rule::in($roles)],
            'branch_id' => 'nullable|integer',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'is_active' => 'nullable|boolean',
            'password' => 'nullable|string|min:6',
        ]);

        if (isset($validated['branch_id'])) {
            $access->assertBranchBelongsToCompany((int) $validated['branch_id'], $actor);
            $target->branch_id = $validated['branch_id'];
        }

        if (
            $actor->role === CompanyMember::ROLE_BRANCH_MANAGER
            && isset($validated['status'])
            && $target->role !== CompanyMember::ROLE_BRANCH_HR
        ) {
            abort(403, 'Quản lý chi nhánh chỉ được khóa/mở khóa HR thuộc chi nhánh mình.');
        }

        foreach (['name', 'phone', 'title', 'role', 'status'] as $field) {
            if (array_key_exists($field, $validated)) {
                $target->{$field} = $validated[$field];
            }
        }
        $target->save();

        if ($target->user) {
            if ($request->has('is_active')) {
                $target->user->is_active = $request->boolean('is_active');
            }
            if ($request->filled('password')) {
                $target->user->password = Hash::make($validated['password']);
            }
            if (isset($validated['status'])) {
                $target->user->is_active = $validated['status'] === 'active';
            }
            $target->user->save();
        }

        $target = $target->fresh(['user:id,email,role,is_active', 'branch']);
        $access->log('company_member.updated', CompanyMember::class, $target->id, $before, $target->toArray());

        return response()->json($target);
    }

    public function destroy(CompanyAccessService $access, CompanyDeletionService $deletion, $id)
    {
        $target = CompanyMember::with('user')->findOrFail($id);
        $access->requirePermission('lock_members');
        $actor = $access->assertCanManageMember($target);
        $access->requireActiveSubscription($actor);

        if ($target->role === CompanyMember::ROLE_COMPANY_OWNER) {
            return response()->json(['message' => 'Không thể vô hiệu hóa tài khoản tổng công ty tại đây.'], 422);
        }

        $before = $target->toArray();
        $counts = $deletion->deleteMember($target);

        $access->log('company_member.deleted', CompanyMember::class, (int) $id, $before, $counts);

        return response()->json([
            'message' => 'Đã xóa tài khoản khỏi công ty.',
            'deleted' => $counts,
        ]);
    }
}
