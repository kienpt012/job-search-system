<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Job;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CandidateMatchingService
{
    public function rankForJob(Job $job, int $limit = 24): Collection
    {
        $job->loadMissing(['skills', 'industries', 'branch', 'jtype', 'jlevel']);

        $candidates = Candidate::query()
            ->with([
                'skills' => fn ($query) => $query->whereNull('resume_id'),
                'educations' => fn ($query) => $query->whereNull('resume_id'),
                'experiences' => fn ($query) => $query->whereNull('resume_id'),
                'projects' => fn ($query) => $query->whereNull('resume_id'),
                'certificates' => fn ($query) => $query->whereNull('resume_id'),
                'prizes' => fn ($query) => $query->whereNull('resume_id'),
                'activities' => fn ($query) => $query->whereNull('resume_id'),
                'resumes',
            ])
            ->limit(500)
            ->get();

        return $candidates
            ->map(fn ($candidate) => $this->scoreCandidate($job, $candidate))
            ->filter(fn ($item) => $item['score'] > 0)
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }

    public function searchAndRank(Job $job, $candidateQuery, int $perPage = 20): array
    {
        $paginator = $candidateQuery
            ->with([
                'skills' => fn ($query) => $query->whereNull('resume_id'),
                'educations' => fn ($query) => $query->whereNull('resume_id'),
                'experiences' => fn ($query) => $query->whereNull('resume_id'),
                'projects' => fn ($query) => $query->whereNull('resume_id'),
                'certificates' => fn ($query) => $query->whereNull('resume_id'),
                'prizes' => fn ($query) => $query->whereNull('resume_id'),
                'activities' => fn ($query) => $query->whereNull('resume_id'),
                'resumes',
            ])
            ->paginate($perPage);

        $ranked = collect($paginator->items())
            ->map(fn ($candidate) => $this->scoreCandidate($job, $candidate))
            ->sortByDesc('score')
            ->values();

        return [
            'data' => $ranked,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    public function scoreCandidate(Job $job, Candidate $candidate): array
    {
        $requiredSkills = $this->skillNamesByType($job, 'required');
        $preferredSkills = $this->skillNamesByType($job, 'preferred');
        $candidateSkills = $candidate->skills->pluck('name')
            ->map(fn ($name) => $this->normalize($name))
            ->filter()
            ->unique()
            ->values();

        $score = 0;
        $reasons = [];

        $requiredMatches = $candidateSkills->intersect($requiredSkills)->values();
        $preferredMatches = $candidateSkills->intersect($preferredSkills)->values();

        if ($requiredSkills->isNotEmpty()) {
            $skillScore = ($requiredMatches->count() / max($requiredSkills->count(), 1)) * 30;
            $score += $skillScore;
            if ($requiredMatches->isNotEmpty()) {
                $reasons[] = 'Phù hợp kỹ năng bắt buộc: ' . $requiredMatches->implode(', ');
            }
        }

        if ($preferredSkills->isNotEmpty()) {
            $preferredScore = ($preferredMatches->count() / max($preferredSkills->count(), 1)) * 10;
            $score += $preferredScore;
            if ($preferredMatches->isNotEmpty()) {
                $reasons[] = 'Có kỹ năng ưu tiên: ' . $preferredMatches->implode(', ');
            }
        }

        $experienceYears = $this->candidateExperienceYears($candidate);
        if ($job->yoe !== null) {
            if ($experienceYears >= (int) $job->yoe) {
                $score += 15;
                $reasons[] = "Kinh nghiệm khoảng {$experienceYears} năm, đạt yêu cầu {$job->yoe} năm.";
            } elseif ($experienceYears > 0) {
                $partial = min(10, ($experienceYears / max((int) $job->yoe, 1)) * 10);
                $score += $partial;
                $reasons[] = "Có {$experienceYears} năm kinh nghiệm, gần yêu cầu {$job->yoe} năm.";
            }
        } elseif ($experienceYears > 0) {
            $score += 8;
            $reasons[] = "Có kinh nghiệm làm việc đã khai báo.";
        }

        if ($this->educationMatches($job, $candidate)) {
            $score += 8;
            $reasons[] = 'Học vấn/chuyên ngành có liên quan.';
        }

        $keywordReason = $this->keywordMatches($job, $candidate);
        if ($keywordReason) {
            $score += 8;
            $reasons[] = $keywordReason;
        }

        $locationReason = $this->locationScore($job, $candidate);
        $score += $locationReason['score'];
        if ($locationReason['reason']) {
            $reasons[] = $locationReason['reason'];
        }

        $certReason = $this->certificationMatches($job, $candidate);
        if ($certReason) {
            $score += 7;
            $reasons[] = $certReason;
        }

        $profileScore = $this->profileCompleteness($candidate);
        $score += $profileScore;
        if ($profileScore >= 7) {
            $reasons[] = 'Hồ sơ ứng viên khá đầy đủ.';
        }

        $appliedJobs = DB::table('job_applying')
            ->where('candidate_id', $candidate->id)
            ->count();
        if ($appliedJobs > 0) {
            $score += min(4, $appliedJobs);
            $reasons[] = 'Có lịch sử ứng tuyển trên hệ thống.';
        }

        $score = min(100, round($score));

        $missingRequiredSkills = $requiredSkills->diff($requiredMatches)->values();

        return [
            'score' => $score,
            'match_percent' => $score,
            'reasons' => array_values(array_unique($reasons)),
            'candidate' => $this->candidatePayload($candidate),
            'matched_skills' => $requiredMatches->merge($preferredMatches)->unique()->values(),
            'missing_required_skills' => $missingRequiredSkills,
            'missing_skills' => $missingRequiredSkills,
            'required_skills' => $requiredSkills,
            'preferred_skills' => $preferredSkills,
            'experience_years' => $experienceYears,
        ];
    }

    private function skillNamesByType(Job $job, string $type): Collection
    {
        return $job->skills
            ->filter(fn ($skill) => ($skill->pivot->requirement_type ?? 'required') === $type)
            ->pluck('name')
            ->map(fn ($name) => $this->normalize($name))
            ->filter()
            ->unique()
            ->values();
    }

    private function normalize($value): string
    {
        return Str::of((string) $value)->lower()->trim()->toString();
    }

    private function candidateExperienceYears(Candidate $candidate): int
    {
        $months = 0;
        foreach ($candidate->experiences as $experience) {
            if (!$experience->start_date) {
                continue;
            }

            $start = Carbon::parse($experience->start_date);
            $end = $experience->end_date ? Carbon::parse($experience->end_date) : now();
            if ($end->lessThan($start)) {
                continue;
            }

            $months += $start->diffInMonths($end);
        }

        return (int) floor($months / 12);
    }

    private function educationMatches(Job $job, Candidate $candidate): bool
    {
        $educationNeedle = $this->normalize($job->education_level);
        $jobIndustries = $job->industries->pluck('name')->map(fn ($name) => $this->normalize($name));

        return $candidate->educations->contains(function ($education) use ($educationNeedle, $jobIndustries) {
            $haystack = $this->normalize(($education->school ?? '') . ' ' . ($education->major ?? '') . ' ' . ($education->description ?? ''));

            if ($educationNeedle !== '' && str_contains($haystack, $educationNeedle)) {
                return true;
            }

            return $jobIndustries->contains(fn ($industry) => $industry !== '' && str_contains($haystack, $industry));
        });
    }

    private function keywordMatches(Job $job, Candidate $candidate): ?string
    {
        $keywords = collect([
            $job->jname,
            optional($job->jlevel)->name,
            optional($job->jtype)->name,
        ])
            ->merge($job->industries->pluck('name'))
            ->map(fn ($value) => $this->normalize($value))
            ->filter(fn ($value) => mb_strlen($value) >= 3)
            ->unique()
            ->values();

        if ($keywords->isEmpty()) {
            return null;
        }

        $profileText = $this->normalize(collect([
            $candidate->objective,
            $candidate->address,
            $candidate->experiences->pluck('name')->implode(' '),
            $candidate->experiences->pluck('description')->implode(' '),
            $candidate->projects->pluck('name')->implode(' '),
            $candidate->projects->pluck('technologies')->implode(' '),
            $candidate->projects->pluck('description')->implode(' '),
        ])->implode(' '));

        $hits = $keywords->filter(fn ($keyword) => str_contains($profileText, $keyword))->values();
        if ($hits->isEmpty()) {
            return null;
        }

        return 'Nội dung hồ sơ/CV có keyword liên quan: ' . $hits->take(3)->implode(', ');
    }

    private function locationScore(Job $job, Candidate $candidate): array
    {
        if ($job->work_location_type === 'remote') {
            return ['score' => 10, 'reason' => 'Job remote nên không giới hạn địa điểm.'];
        }

        $jobLat = $job->map_lat ?? $job->branch?->map_lat;
        $jobLng = $job->map_lng ?? $job->branch?->map_lng;

        if ($jobLat !== null && $jobLng !== null && $candidate->map_lat !== null && $candidate->map_lng !== null) {
            $distance = $this->distanceKm((float) $jobLat, (float) $jobLng, (float) $candidate->map_lat, (float) $candidate->map_lng);
            if ($distance <= 10) {
                return ['score' => 10, 'reason' => 'Gần địa điểm làm việc, khoảng ' . round($distance, 1) . ' km.'];
            }
            if ($distance <= 30) {
                return ['score' => 6, 'reason' => 'Khoảng cách đến chi nhánh ở mức chấp nhận được, khoảng ' . round($distance, 1) . ' km.'];
            }
        }

        $candidateAddress = $this->normalize($candidate->address);
        $jobAddress = $this->normalize($job->special_address ?: $job->branch?->address ?: $job->address);
        if ($candidateAddress && $jobAddress) {
            $candidateTokens = collect(preg_split('/[\s,.-]+/u', $candidateAddress))->filter(fn ($token) => mb_strlen($token) >= 4);
            $addressHit = $candidateTokens->first(fn ($token) => str_contains($jobAddress, $token));
            if ($addressHit) {
                return ['score' => 5, 'reason' => 'Địa chỉ ứng viên có khu vực gần job.'];
            }
        }

        return ['score' => 0, 'reason' => null];
    }

    private function certificationMatches(Job $job, Candidate $candidate): ?string
    {
        $requiredText = $this->normalize(($job->required_certificates ?? '') . ' ' . ($job->required_languages ?? ''));
        if ($requiredText === '') {
            return null;
        }

        $candidateText = $this->normalize(
            $candidate->certificates->pluck('name')->implode(' ')
            . ' '
            . $candidate->skills->pluck('description')->implode(' ')
            . ' '
            . $candidate->projects->pluck('technologies')->implode(' ')
        );

        foreach (preg_split('/[\s,;\/]+/u', $requiredText) as $token) {
            $token = trim($token);
            if (mb_strlen($token) >= 3 && str_contains($candidateText, $token)) {
                return 'Có chứng chỉ/ngôn ngữ hoặc công nghệ liên quan.';
            }
        }

        return null;
    }

    private function profileCompleteness(Candidate $candidate): int
    {
        $items = [
            (bool) $candidate->avatar,
            (bool) $candidate->phone,
            (bool) $candidate->objective,
            (bool) $candidate->address,
            $candidate->map_lat !== null && $candidate->map_lng !== null,
            $candidate->skills->isNotEmpty(),
            $candidate->educations->isNotEmpty(),
            $candidate->experiences->isNotEmpty(),
            $candidate->projects->isNotEmpty(),
            $candidate->resumes->isNotEmpty(),
        ];

        return (int) round((collect($items)->filter()->count() / count($items)) * 10);
    }

    private function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function candidatePayload(Candidate $candidate): array
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
}
