<?php

namespace App\Http\Controllers;

use App\Models\CompanyBranch;
use App\Models\CompanyMember;
use App\Services\CompanyAccessService;
use App\Services\CompanyDeletionService;
use Illuminate\Http\Request;

class CompanyBranchController extends Controller
{
    public function index(CompanyAccessService $access)
    {
        $member = $access->requirePermission('view_branches');

        return response()->json([
            'data' => $access->visibleBranches($member)->values(),
            'permissions' => $access->permissionsFor($member),
        ]);
    }

    public function store(Request $request, CompanyAccessService $access)
    {
        $member = $access->requirePermission('create_branches');
        $access->requireActiveSubscription($member);

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
            'employer_id' => $member->employer_id,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? $this->coordinateAddress($validated['map_lat'] ?? null, $validated['map_lng'] ?? null),
            'map_lat' => $validated['map_lat'] ?? null,
            'map_lng' => $validated['map_lng'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'is_headquarters' => false,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $access->log('branch.created', CompanyBranch::class, $branch->id, null, $branch->toArray());

        return response()->json($branch, 201);
    }

    public function update(Request $request, CompanyAccessService $access, $id)
    {
        $member = $access->requireMember();
        $access->requireActiveSubscription($member);
        $branch = $access->assertCanManageBranch((int) $id);

        $permissions = $access->permissionsFor($member);
        if (empty($permissions['update_branches']) && empty($permissions['update_own_branch'])) {
            abort(403, 'Bạn không có quyền sửa thông tin chi nhánh.');
        }

        $before = $branch->toArray();
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

        if (($validated['address'] ?? '') === '') {
            $lat = $validated['map_lat'] ?? $branch->map_lat;
            $lng = $validated['map_lng'] ?? $branch->map_lng;
            $validated['address'] = $this->coordinateAddress($lat, $lng);
        }

        $branch->fill($validated);
        if ($request->has('is_active') && !$branch->is_headquarters) {
            $branch->is_active = $request->boolean('is_active');
        }
        $branch->save();

        $access->log('branch.updated', CompanyBranch::class, $branch->id, $before, $branch->fresh()->toArray());

        return response()->json($branch->fresh());
    }

    public function destroy(CompanyAccessService $access, CompanyDeletionService $deletion, $id)
    {
        $member = $access->requirePermission('delete_branches');
        $access->requireActiveSubscription($member);
        $branch = $access->assertCanManageBranch((int) $id);
        if ($branch->is_headquarters) {
            return response()->json(['message' => 'Không thể xóa trụ sở chính.'], 422);
        }

        $before = $branch->toArray();
        $counts = $deletion->deleteBranch($branch);

        $access->log('branch.deleted', CompanyBranch::class, (int) $id, $before, $counts);

        return response()->json([
            'message' => 'Đã xóa chi nhánh và toàn bộ dữ liệu thuộc chi nhánh.',
            'deleted' => $counts,
        ]);
    }

    private function coordinateAddress($lat, $lng): string
    {
        if ($lat !== null && $lng !== null) {
            return "Tọa độ: {$lat}, {$lng}";
        }

        return 'Chưa có địa chỉ bản đồ';
    }
}
