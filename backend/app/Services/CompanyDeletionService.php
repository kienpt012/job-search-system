<?php

namespace App\Services;

use App\Models\CompanyBranch;
use App\Models\CompanyMember;
use App\Models\Employer;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class CompanyDeletionService
{
    public function deleteJobs(iterable $jobIds): array
    {
        $ids = collect($jobIds)
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return ['jobs' => 0, 'applications' => 0, 'messages' => 0];
        }

        return DB::transaction(function () use ($ids) {
            $applicationFiles = $this->pluckWhereIn('job_applying', 'job_id', $ids, 'cv_link');

            $counts = [
                'jobs' => $ids->count(),
                'applications' => $this->deleteWhereIn('job_applying', 'job_id', $ids),
                'messages' => $this->deleteWhereIn('candidate_messages', 'job_id', $ids),
            ];

            $this->deleteWhereIn('saved_jobs', 'job_id', $ids);
            $this->deleteWhereIn('job_industry', 'job_id', $ids);
            $this->deleteWhereIn('job_location', 'job_id', $ids);
            $this->deleteWhereIn('job_skill', 'job_id', $ids);
            $this->deleteWhereIn('job_tag', 'job_id', $ids);
            Job::whereIn('id', $ids)->delete();

            $this->deleteLocalFiles($applicationFiles);

            return $counts;
        });
    }

    public function deleteMember(CompanyMember $member): array
    {
        if ($member->role === CompanyMember::ROLE_COMPANY_OWNER) {
            abort(422, 'Không thể xóa tài khoản tổng công ty.');
        }

        return DB::transaction(function () use ($member) {
            $userId = $member->user_id;
            $member->delete();
            if ($userId) {
                User::where('id', $userId)->delete();
            }

            return ['members' => 1, 'users' => $userId ? 1 : 0];
        });
    }

    public function deleteBranch(CompanyBranch $branch): array
    {
        if ($branch->is_headquarters) {
            abort(422, 'Không thể xóa trụ sở chính.');
        }

        return DB::transaction(function () use ($branch) {
            $jobIds = Job::where('branch_id', $branch->id)->pluck('id');
            $jobCounts = $this->deleteJobs($jobIds);

            $members = CompanyMember::where('branch_id', $branch->id)
                ->where('role', '<>', CompanyMember::ROLE_COMPANY_OWNER)
                ->get();
            $userIds = $members->pluck('user_id')->filter()->unique()->values();
            $memberCount = $members->count();

            if ($members->isNotEmpty()) {
                CompanyMember::whereIn('id', $members->pluck('id'))->delete();
            }
            if ($userIds->isNotEmpty()) {
                User::whereIn('id', $userIds)->delete();
            }

            $branch->delete();

            return array_merge([
                'branches' => 1,
                'members' => $memberCount,
                'users' => $userIds->count(),
            ], $jobCounts);
        });
    }

    public function deleteEmployer(Employer $employer, bool $deleteOwnerUser = true): array
    {
        return DB::transaction(function () use ($employer, $deleteOwnerUser) {
            $jobIds = Job::where('employer_id', $employer->id)->pluck('id');
            $jobCounts = $this->deleteJobs($jobIds);

            $members = CompanyMember::where('employer_id', $employer->id)->get();
            $memberUserIds = $members
                ->pluck('user_id')
                ->filter()
                ->unique()
                ->values();

            if (!$deleteOwnerUser) {
                $memberUserIds = $memberUserIds
                    ->reject(fn ($userId) => (int) $userId === (int) $employer->user_id)
                    ->values();
            }

            $memberCount = $members->count();
            $branchCount = CompanyBranch::where('employer_id', $employer->id)->count();

            CompanyMember::where('employer_id', $employer->id)->delete();
            if ($memberUserIds->isNotEmpty()) {
                User::whereIn('id', $memberUserIds)->delete();
            }

            CompanyBranch::where('employer_id', $employer->id)->delete();
            $this->deleteWhere('employer_location', 'employer_id', $employer->id);
            $this->deleteWhere('employer_subscriptions', 'employer_id', $employer->id);
            $this->deleteWhere('employer_payments', 'employer_id', $employer->id);
            $this->deleteWhere('audit_logs', 'employer_id', $employer->id);

            $assetPaths = collect([$employer->logo, $employer->image])
                ->filter()
                ->unique()
                ->values();

            $employer->delete();

            if ($deleteOwnerUser && $employer->user_id) {
                User::where('id', $employer->user_id)->delete();
            }

            $this->deleteLocalFiles($assetPaths);

            return array_merge([
                'companies' => 1,
                'branches' => $branchCount,
                'members' => $memberCount,
                'users' => $memberUserIds->count() + ($deleteOwnerUser && $employer->user_id ? 1 : 0),
            ], $jobCounts);
        });
    }

    public function deleteCandidate(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $candidateId = (int) $user->id;
            $candidate = DB::table('candidates')->where('user_id', $candidateId)->first();
            $resumeAssets = Schema::hasTable('resumes')
                ? DB::table('resumes')->where('candidate_id', $candidateId)->get(['cv_link', 'avatar'])
                : collect();
            $applicationFiles = Schema::hasTable('job_applying')
                ? DB::table('job_applying')->where('candidate_id', $candidateId)->pluck('cv_link')
                : collect();

            $counts = [
                'saved_jobs' => $this->deleteWhere('saved_jobs', 'candidate_id', $candidateId),
                'messages' => $this->deleteWhere('candidate_messages', 'candidate_id', $candidateId),
                'applications' => $this->deleteWhere('job_applying', 'candidate_id', $candidateId),
                'educations' => $this->deleteWhere('educations', 'candidate_id', $candidateId),
                'experiences' => $this->deleteWhere('experiences', 'candidate_id', $candidateId),
                'projects' => $this->deleteWhere('projects', 'candidate_id', $candidateId),
                'skills' => $this->deleteWhere('skills', 'candidate_id', $candidateId),
                'certificates' => $this->deleteWhere('certificates', 'candidate_id', $candidateId),
                'prizes' => $this->deleteWhere('prizes', 'candidate_id', $candidateId),
                'activities' => $this->deleteWhere('activities', 'candidate_id', $candidateId),
                'others' => $this->deleteWhere('others', 'candidate_id', $candidateId),
                'resumes' => $this->deleteWhere('resumes', 'candidate_id', $candidateId),
                'candidates' => $this->deleteWhere('candidates', 'user_id', $candidateId),
            ];

            $user->delete();
            $counts['users'] = 1;

            $assetPaths = collect([$candidate?->avatar])
                ->merge($resumeAssets->pluck('cv_link'))
                ->merge($resumeAssets->pluck('avatar'))
                ->merge($applicationFiles)
                ->filter()
                ->unique()
                ->values();

            $this->deleteLocalFiles($assetPaths);

            return $counts;
        });
    }

    public function deleteUser(User $user): array
    {
        if ((int) $user->role === 1) {
            return $this->deleteCandidate($user);
        }

        if ((int) $user->role === 2) {
            $employer = Employer::where('user_id', $user->id)->first();
            if ($employer) {
                return $this->deleteEmployer($employer, true);
            }

            $member = CompanyMember::where('user_id', $user->id)->first();
            if ($member) {
                return $this->deleteMember($member);
            }
        }

        $user->delete();

        return ['users' => 1];
    }

    private function deleteWhereIn(string $table, string $column, Collection $ids): int
    {
        if (!Schema::hasTable($table) || $ids->isEmpty()) {
            return 0;
        }

        return DB::table($table)->whereIn($column, $ids)->delete();
    }

    private function deleteWhere(string $table, string $column, mixed $value): int
    {
        if (!Schema::hasTable($table)) {
            return 0;
        }

        return DB::table($table)->where($column, $value)->delete();
    }

    private function pluckWhereIn(string $table, string $column, Collection $ids, string $pluckColumn): Collection
    {
        if (!Schema::hasTable($table) || $ids->isEmpty() || !Schema::hasColumn($table, $pluckColumn)) {
            return collect();
        }

        return DB::table($table)->whereIn($column, $ids)->pluck($pluckColumn);
    }

    private function deleteLocalFiles(Collection $paths): void
    {
        $paths
            ->filter()
            ->unique()
            ->each(function ($url) {
                $path = parse_url($url, PHP_URL_PATH);
                if (!$path) {
                    return;
                }

                $relativePath = ltrim(rawurldecode($path), '/');
                $candidates = [];

                if (str_starts_with($relativePath, 'storage/')) {
                    $candidates[] = public_path($relativePath);
                }

                foreach ([
                    'cv_images/',
                    'company_logos/',
                    'company_covers/',
                    'employer_documents/',
                    'avatar_images/',
                ] as $prefix) {
                    if (str_starts_with($relativePath, $prefix)) {
                        $candidates[] = storage_path($relativePath);
                        $candidates[] = public_path('storage/' . $relativePath);
                    }
                }

                foreach ($candidates as $filePath) {
                    if ($filePath && File::exists($filePath)) {
                        File::delete($filePath);
                    }
                }
            });
    }
}
