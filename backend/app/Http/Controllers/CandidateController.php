<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Employer;
use App\Models\Job;
use App\Services\GoogleMapLinkResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CandidateController extends Controller
{
    public function getCurrent()
    {
        $candidate = Candidate::find(Auth::user()->id);

        return response()->json($candidate);
    }

    public function getDashboardSummary()
    {
        $candidate = Candidate::query()
            ->withCount([
                'educations',
                'experiences',
                'projects',
                'skills',
                'certificates',
                'prizes',
                'activities',
                'others',
                'resumes',
            ])
            ->find(Auth::user()->id);

        if (!$candidate) {
            return response()->json([
                'message' => 'Candidate not found',
            ], 404);
        }

        $appliedCount = DB::table('job_applying')
            ->join('jobs', 'job_applying.job_id', '=', 'jobs.id')
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('job_applying.candidate_id', $candidate->id)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->count();

        $savedCount = DB::table('saved_jobs')
            ->join('jobs', 'saved_jobs.job_id', '=', 'jobs.id')
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->where('saved_jobs.candidate_id', $candidate->id)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->count();

        return response()->json([
            'applied_jobs_count' => $appliedCount,
            'saved_jobs_count' => $savedCount,
            'resumes_count' => (int) $candidate->resumes_count,
            'section_counts' => [
                'educations' => (int) $candidate->educations_count,
                'experiences' => (int) $candidate->experiences_count,
                'projects' => (int) $candidate->projects_count,
                'skills' => (int) $candidate->skills_count,
                'certificates' => (int) $candidate->certificates_count,
                'prizes' => (int) $candidate->prizes_count,
                'activities' => (int) $candidate->activities_count,
                'others' => (int) $candidate->others_count,
            ],
        ]);
    }

    public function getProfileBundle()
    {
        $candidate = Candidate::query()
            ->with([
                'educations',
                'experiences',
                'projects',
                'skills',
                'certificates',
                'prizes',
                'activities',
                'others',
            ])
            ->find(Auth::user()->id);

        if (!$candidate) {
            return response()->json([
                'message' => 'Candidate not found',
            ], 404);
        }

        return response()->json([
            'personal' => $candidate,
            'educations' => $candidate->educations,
            'experiences' => $candidate->experiences,
            'projects' => $candidate->projects,
            'skills' => $candidate->skills,
            'certificates' => $candidate->certificates,
            'prizes' => $candidate->prizes,
            'activities' => $candidate->activities,
            'others' => $candidate->others,
        ]);
    }

    public function update(Request $request)
    {
        $candidate = Candidate::findOrFail(Auth::user()->id);

        $candidate->lastname = $request->lastname;
        $candidate->firstname = $request->firstname;
        $candidate->gender = $request->gender;
        $candidate->dob = $request->dob;
        $candidate->phone = $request->phone;
        $candidate->email = $request->email;
        $candidate->address = $request->address;
        $candidate->map_lat = $this->nullableCoordinate($request->input('map_lat'), $candidate->map_lat);
        $candidate->map_lng = $this->nullableCoordinate($request->input('map_lng'), $candidate->map_lng);
        $candidate->link = $request->link;
        $candidate->objective = $request->objective;

        $file = $request->file('image');
        if ($file) {
            $this->deleteCandidateAvatarFiles($candidate->avatar);
            $candidate->avatar = $this->storeCandidateAvatar($file, $candidate->id);
        }

        if ($request->boolean('delete_img')) {
            $this->deleteCandidateAvatarFiles($candidate->avatar);
            $candidate->avatar = null;
        }

        $candidate->save();

        return response()->json('updated successfully');
    }

    public function resolveSharedMapLink(Request $request, GoogleMapLinkResolver $mapResolver)
    {
        $request->validate([
            'url' => 'required|string|max:1000',
        ]);

        $resolved = $mapResolver->resolve($request->input('url'));

        if (!$resolved) {
            return response()->json([
                'message' => 'Kh?ng th? ??c t?a ?? t? li?n k?t Google Maps.',
            ], 422);
        }

        return response()->json($resolved);
    }

    public function getNearbyCompanies()
    {
        $candidate = Candidate::find(Auth::user()->id);
        $radiusKm = 10;

        if (!$candidate || $candidate->map_lat === null || $candidate->map_lng === null) {
            return response()->json([
                'has_location' => false,
                'distance_limit_km' => $radiusKm,
                'candidate_address' => $candidate?->address,
                'data' => [],
            ]);
        }

        $lat = (float) $candidate->map_lat;
        $lng = (float) $candidate->map_lng;

        $jobCountSub = Job::query()
            ->where('is_active', 1)
            ->selectRaw('employer_id, COUNT(*) as job_num')
            ->groupBy('employer_id');

        $distanceSql = '(6371 * acos(cos(radians(?)) * cos(radians(employers.map_lat)) * cos(radians(employers.map_lng) - radians(?)) + sin(radians(?)) * sin(radians(employers.map_lat))))';

        $companies = Employer::query()
            ->leftJoinSub($jobCountSub, 'job_counts', function ($join) {
                $join->on('employers.id', '=', 'job_counts.employer_id');
            })
            ->where('employers.is_active', 1)
            ->whereNotNull('employers.map_lat')
            ->whereNotNull('employers.map_lng')
            ->whereRaw('COALESCE(job_counts.job_num, 0) > 0')
            ->select(
                'employers.id',
                'employers.name',
                'employers.logo',
                'employers.address',
                'employers.website',
                'employers.description',
                'employers.map_lat',
                'employers.map_lng'
            )
            ->selectRaw('COALESCE(job_counts.job_num, 0) as job_num')
            ->selectRaw($distanceSql . ' as distance_km', [$lat, $lng, $lat])
            ->having('distance_km', '<', $radiusKm)
            ->orderBy('distance_km')
            ->limit(8)
            ->get()
            ->map(function ($company) {
                $company->distance_km = round((float) $company->distance_km, 1);
                return $company;
            })
            ->values();

        return response()->json([
            'has_location' => true,
            'distance_limit_km' => $radiusKm,
            'candidate_address' => $candidate->address,
            'data' => $companies,
        ]);
    }

    public function getAppliedJobs($id)
    {
        return response()->json($this->appliedJobsQuery((int) $id)->get());
    }

    public function getCurrentAppliedJobs()
    {
        return response()->json($this->appliedJobsQuery((int) Auth::id())->get());
    }

    private function appliedJobsQuery(int $candidateId)
    {
        return Job::query()
            ->join('job_applying', 'jobs.id', '=', 'job_applying.job_id')
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->leftJoin('company_branches', 'jobs.branch_id', '=', 'company_branches.id')
            ->where('job_applying.candidate_id', $candidateId)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->select(
                'jobs.id',
                'jobs.jname',
                'jobs.employer_id',
                'employers.name',
                'employers.name as employer_name',
                'employers.logo as employer_logo',
                'employers.address as employer_address',
                'employers.map_lat as employer_map_lat',
                'employers.map_lng as employer_map_lng',
                'company_branches.name as branch_name',
                'company_branches.address as branch_address',
                'company_branches.map_lat as branch_map_lat',
                'company_branches.map_lng as branch_map_lng',
                'job_applying.resume_id',
                'job_applying.cv_link',
                'job_applying.status as status',
                DB::raw('DATE_FORMAT(job_applying.created_at, "%d/%m/%Y") as postDate')
            )
            ->orderByDesc('job_applying.created_at');
    }

    public function getSavedJobs($id)
    {
        return response()->json($this->savedJobsQuery((int) $id)->get());
    }

    public function getCurrentSavedJobs()
    {
        return response()->json($this->savedJobsQuery((int) Auth::id())->get());
    }

    private function savedJobsQuery(int $candidateId)
    {
        return Job::with(['employer:id,name,logo', 'locations:id,name', 'branch:id,name,address,map_lat,map_lng'])
            ->join('employers', 'jobs.employer_id', '=', 'employers.id')
            ->join('saved_jobs', 'jobs.id', '=', 'saved_jobs.job_id')
            ->where('saved_jobs.candidate_id', $candidateId)
            ->where('jobs.is_active', 1)
            ->where('employers.is_active', 1)
            ->select('jobs.*', DB::raw('DATE_FORMAT(jobs.expire_at, "%d/%m/%Y") as deadline'))
            ->orderByDesc('saved_jobs.job_id');
    }

    public function checkJobSaved($job_id)
    {
        $candidateId = Auth::user()->id;
        $exists = DB::table('saved_jobs')->where([
            ['candidate_id', '=', $candidateId],
            ['job_id', '=', $job_id],
        ])->exists();

        return response()->json(['value' => $exists]);
    }

    public function processJobSaving(Request $request)
    {
        $candidateId = Auth::user()->id;

        if ($request->status == true) {
            DB::table('saved_jobs')->insert([
                ['candidate_id' => $candidateId, 'job_id' => $request->job_id],
            ]);
        } elseif ($request->status == false) {
            DB::table('saved_jobs')->where([
                ['candidate_id', '=', $candidateId],
                ['job_id', '=', $request->job_id],
            ])->delete();
        }

        return response()->json('Updated successfully');
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

    private function storeCandidateAvatar($file, $candidateId)
    {
        $directory = public_path('storage/avatar_images');

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower(
            $file->getClientOriginalExtension()
            ?: $file->extension()
            ?: 'jpg'
        );

        $filename = 'avatar_candidate_' . $candidateId . '_' . time() . '.' . $extension;
        $file->move($directory, $filename);

        return rtrim(env('APP_URL'), '/') . '/storage/avatar_images/' . $filename;
    }

    private function deleteCandidateAvatarFiles($avatarUrl)
    {
        if (!$avatarUrl) {
            return;
        }

        $path = parse_url($avatarUrl, PHP_URL_PATH);

        if (!$path || !str_contains($path, '/storage/avatar_images/')) {
            return;
        }

        $filename = basename($path);

        $publicFile = public_path('storage/avatar_images/' . $filename);
        $storageFile = storage_path('app/public/avatar_images/' . $filename);

        if (File::exists($publicFile)) {
            File::delete($publicFile);
        }

        if (File::exists($storageFile)) {
            File::delete($storageFile);
        }
    }
}
