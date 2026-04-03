<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Certificate;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Other;
use App\Models\Prize;
use App\Models\Project;
use App\Models\Resume;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResumeController extends Controller
{
    public function getByCurrentCandidate()
    {
        $res = Resume::where('candidate_id', Auth::user()->id)
            ->select(['id', 'title', 'created_at', 'updated_at'])
            ->get();

        return response()->json($res);
    }
    public function getById($id)
    {
        $resume = Resume::where('id', $id)
            ->with(['educations', 'experiences', 'projects', 'skills', 'certificates', 'prizes', 'activities', 'others'])
            ->first();
        $basicInfor = Resume::find($id);
        $resume['basicInfor'] = $basicInfor;

        return response()->json($resume);
    }
    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        $resume_fields = (array)$req->basicInfor;
        $resume_fields['candidate_id'] = $candidate_id;

        $resume = Resume::create($resume_fields);
        $resume_id = $resume->id;

        if ($resume) {
            if ($req->educations) {
                for ($i = 0; $i < count($req->educations); $i++) {
                    $education_fields = (array)$req->educations[$i];
                    $education_fields['id'] = Education::max('id') + 1;
                    $education_fields['candidate_id'] = $candidate_id;
                    $education_fields['resume_id'] = $resume_id;
                    Education::create($education_fields);
                }
            }
            if ($req->experiences) {
                for ($i = 0; $i < count($req->experiences); $i++) {
                    $experience_fields = (array)$req->experiences[$i];
                    $experience_fields['id'] = Experience::max('id') + 1;
                    $experience_fields['candidate_id'] = $candidate_id;
                    $experience_fields['resume_id'] = $resume_id;
                    Experience::create($experience_fields);
                }
            }
            if ($req->projects) {
                for ($i = 0; $i < count($req->projects); $i++) {
                    $project_fields = (array)$req->projects[$i];
                    $project_fields['id'] = Project::max('id') + 1;
                    $project_fields['candidate_id'] = $candidate_id;
                    $project_fields['resume_id'] = $resume_id;
                    Project::create($project_fields);
                }
            }
            if ($req->skills) {
                for ($i = 0; $i < count($req->skills); $i++) {
                    $skill_fields = (array)$req->skills[$i];
                    $skill_fields['id'] = Skill::max('id') + 1;
                    $skill_fields['candidate_id'] = $candidate_id;
                    $skill_fields['resume_id'] = $resume_id;
                    Skill::create($skill_fields);
                }
            }
            if ($req->certificates) {
                for ($i = 0; $i < count($req->certificates); $i++) {
                    $certificate_fields = (array)$req->certificates[$i];
                    $certificate_fields['id'] = Certificate::max('id') + 1;
                    $certificate_fields['candidate_id'] = $candidate_id;
                    $certificate_fields['resume_id'] = $resume_id;
                    Certificate::create($certificate_fields);
                }
            }
            if ($req->prizes) {
                for ($i = 0; $i < count($req->prizes); $i++) {
                    $prize_fields = (array)$req->prizes[$i];
                    $prize_fields['id'] = Prize::max('id') + 1;
                    $prize_fields['candidate_id'] = $candidate_id;
                    $prize_fields['resume_id'] = $resume_id;
                    Prize::create($prize_fields);
                }
            }
            if ($req->activities) {
                for ($i = 0; $i < count($req->activities); $i++) {
                    $activity_fields = (array)$req->activities[$i];
                    $activity_fields['id'] = Activity::max('id') + 1;
                    $activity_fields['candidate_id'] = $candidate_id;
                    $activity_fields['resume_id'] = $resume_id;
                    Activity::create($activity_fields);
                }
            }
            if ($req->others) {
                for ($i = 0; $i < count($req->others); $i++) {
                    $other_fields = (array)$req->others[$i];
                    $other_fields['id'] = Other::max('id') + 1;
                    $other_fields['candidate_id'] = $candidate_id;
                    $other_fields['resume_id'] = $resume_id;
                    Other::create($other_fields);
                }
            }
        }

        return response()->json("created successfully", 201);
    }
    public function update(Request $req)
    {
        $resume_fields = (array)$req->basicInfor;

        Resume::where('id', $req->resume_id)->update($resume_fields);
        if ($req->educations)
            foreach ($req->educations as $item) {
                Education::where('id', $item['id'])->update((array)$item);
            }
        if ($req->experiences)
            foreach ($req->experiences as $item) {
                Experience::where('id', $item['id'])->update((array)$item);
            }
        if ($req->projects)
            foreach ($req->projects as $item) {
                Project::where('id', $item['id'])->update((array)$item);
            }
        if ($req->skills)
            foreach ($req->skills as $item) {
                Skill::where('id', $item['id'])->update((array)$item);
            }
        if ($req->certificates)
            foreach ($req->certificates as $item) {
                Certificate::where('id', $item['id'])->update((array)$item);
            }
        if ($req->prizes)
            foreach ($req->prizes as $item) {
                Prize::where('id', $item['id'])->update((array)$item);
            }
        if ($req->activities)
            foreach ($req->activities as $item) {
                Activity::where('id', $item['id'])->update((array)$item);
            }
        if ($req->others)
            foreach ($req->others as $item) {
                Other::where('id', $item['id'])->update((array)$item);
            }

        return response()->json("updated successfully");
    }
    public function destroy($id)
    {
        Resume::findOrFail($id)->delete();
        Education::where('resume_id', $id)->delete();
        Experience::where('resume_id', $id)->delete();
        Project::where('resume_id', $id)->delete();
        Skill::where('resume_id', $id)->delete();
        Certificate::where('resume_id', $id)->delete();
        Prize::where('resume_id', $id)->delete();
        Activity::where('resume_id', $id)->delete();
        Other::where('resume_id', $id)->delete();

        return response()->json("deleted successfully");
    }
}
