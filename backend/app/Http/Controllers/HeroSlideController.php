<?php

namespace App\Http\Controllers;

use App\Models\Employer;
use App\Models\HeroSlide;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class HeroSlideController extends Controller
{
    public function index()
    {
        $slides = HeroSlide::query()
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function ($slide) {
                return $this->transformSlide($slide, false);
            })
            ->values();

        return response()->json($slides);
    }

    public function adminIndex()
    {
        $this->ensureAdmin();

        $slides = HeroSlide::query()
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(function ($slide) {
                return $this->transformSlide($slide, true);
            })
            ->values();

        $companies = Employer::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $jobs = Job::query()
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->select('jobs.id', 'jobs.jname', 'employers.name as employer_name')
            ->orderByDesc('jobs.created_at')
            ->get();

        return response()->json([
            'slides' => $slides,
            'companies' => $companies,
            'jobs' => $jobs,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:8192',
            'target_type' => 'required|string|in:company,job,custom',
            'target_company_id' => 'nullable|integer|exists:employers,id',
            'target_job_id' => 'nullable|integer|exists:jobs,id',
            'custom_url' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $targetType = $validated['target_type'];

        if ($targetType === 'company' && empty($validated['target_company_id'])) {
            return response()->json(['message' => 'Please choose a target company.'], 422);
        }

        if ($targetType === 'job' && empty($validated['target_job_id'])) {
            return response()->json(['message' => 'Please choose a target job.'], 422);
        }

        if ($targetType === 'custom' && blank($validated['custom_url'] ?? null)) {
            return response()->json(['message' => 'Please enter a target link.'], 422);
        }

        $slide = new HeroSlide();
        $slide->image = $this->storeSlideImage($request->file('image'));
        $slide->target_type = $targetType;
        $slide->target_company_id = $targetType === 'company' ? (int) $validated['target_company_id'] : null;
        $slide->target_job_id = $targetType === 'job' ? (int) $validated['target_job_id'] : null;
        $slide->custom_url = $targetType === 'custom' ? trim((string) ($validated['custom_url'] ?? '')) : null;
        $slide->is_active = $request->boolean('is_active', true);
        $slide->sort_order = ((int) HeroSlide::max('sort_order')) + 1;
        $slide->save();

        return response()->json($this->transformSlide($slide->fresh(), true), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $slide = HeroSlide::find($id);
        if (!$slide) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        $slide->is_active = (bool) $validated['is_active'];
        $slide->save();

        return response()->json($this->transformSlide($slide->fresh(), true));
    }

    public function reorder(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'orders' => 'required|array|min:1',
            'orders.*.id' => 'required|integer|exists:hero_slides,id',
            'orders.*.sort_order' => 'required|integer|min:1',
        ]);

        foreach ($validated['orders'] as $item) {
            HeroSlide::where('id', $item['id'])->update([
                'sort_order' => (int) $item['sort_order'],
            ]);
        }

        return response()->json([
            'message' => 'Slide order updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $this->ensureAdmin();

        $slide = HeroSlide::find($id);
        if (!$slide) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        $image = $slide->image;
        $slide->delete();
        $this->deleteLocalFileFromUrl($image);

        return response()->json(['message' => 'Slide deleted successfully.']);
    }

    private function transformSlide(HeroSlide $slide, $includeAdminMeta)
    {
        $target = $this->resolveTarget($slide);

        $payload = [
            'id' => $slide->id,
            'image' => $slide->image,
            'target_type' => $slide->target_type,
            'target_url' => $target['url'],
            'is_external' => $target['is_external'],
            'target_label' => $target['label'],
            'is_active' => (bool) $slide->is_active,
            'sort_order' => (int) ($slide->sort_order ?? 0),
        ];

        if ($includeAdminMeta) {
            $payload['target_company_id'] = $slide->target_company_id;
            $payload['target_job_id'] = $slide->target_job_id;
            $payload['custom_url'] = $slide->custom_url;
            $payload['created_at'] = optional($slide->created_at)->format('d/m/Y H:i');
        }

        return $payload;
    }

    private function resolveTarget(HeroSlide $slide)
    {
        if ($slide->target_type === 'company' && $slide->target_company_id) {
            $company = Employer::find($slide->target_company_id);

            return [
                'url' => $company ? '/companies/' . $company->id : null,
                'is_external' => false,
                'label' => $company ? $company->name : 'Company no longer exists',
            ];
        }

        if ($slide->target_type === 'job' && $slide->target_job_id) {
            $job = Job::find($slide->target_job_id);

            return [
                'url' => $job ? '/jobs/' . $job->id : null,
                'is_external' => false,
                'label' => $job ? $job->jname : 'Job no longer exists',
            ];
        }

        if ($slide->target_type === 'custom' && $slide->custom_url) {
            $normalizedUrl = $this->normalizeCustomUrl($slide->custom_url);
            $isExternal = $this->isExternalUrl($normalizedUrl);

            return [
                'url' => $normalizedUrl,
                'is_external' => $isExternal,
                'label' => 'Custom link',
            ];
        }

        return [
            'url' => null,
            'is_external' => false,
            'label' => 'Target not configured',
        ];
    }

    private function normalizeCustomUrl($url)
    {
        $url = trim((string) $url);
        if ($url === '') {
            return null;
        }

        if (str_starts_with($url, '/')) {
            return $url;
        }

        if (preg_match('/^https?:\/\//i', $url)) {
            return $url;
        }

        return 'https://' . ltrim($url, '/');
    }

    private function isExternalUrl($url)
    {
        return (bool) $url && preg_match('/^https?:\/\//i', $url);
    }

    private function storeSlideImage($file)
    {
        $directory = storage_path('hero_slides');
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $filename = 'hero_slide_' . time() . '_' . Str::random(6) . '.' . $extension;
        $file->move($directory, $filename);

        return rtrim(env('APP_URL'), '/') . '/hero_slides/' . rawurlencode($filename);
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
        if (!str_starts_with($relativePath, 'hero_slides/')) {
            return;
        }

        $fullPath = storage_path($relativePath);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
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
}
