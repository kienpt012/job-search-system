<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        $res = Project::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Project::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Project::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        $proficiency = $req->proficiency;
        if (!$proficiency) $proficiency = 0;
        Project::create([
            "candidate_id" => $candidate_id,
            "name" => $req->name,
            "prj_type" => $req->prj_type,
            "role" => $req->role,
            "technologies" => $req->technologies,
            "start_date" => $req->start_date,
            "end_date" => $req->end_date,
            "description" => $req->description,
            "link" => $req->link,
        ]);

        return response()->json("created successfully");
    }
    public function destroy($id)
    {
        Project::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }
    public function update(Request $req)
    {
        $update_fields = $req->all();
        Project::where('id', $req->id)->update($update_fields);
        $msg = 'updated successfully';

        return response()->json($msg);
    }
}
