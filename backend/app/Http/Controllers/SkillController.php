<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SkillController extends Controller
{
    public function index()
    {
        $res = Skill::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Skill::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Skill::where([
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
        Skill::create([
            "candidate_id" => $candidate_id,
            "name" => $req->name,
            "proficiency" => $proficiency,
            "description" =>$req->description,
        ]);

        return response()->json("created successfully");
    }
    public function destroy($id)
    {
        Skill::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }
    public function update(Request $req)
    {
        $update_fields = $req->all();
        Skill::where('id', $req->id)->update($update_fields);
        $msg = 'updated successfully';

        return response()->json($msg);
    }
}
