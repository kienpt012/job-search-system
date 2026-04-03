<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index()
    {
        $res = Activity::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Activity::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();

        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Activity::where([
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
        Activity::create([
            "candidate_id" => $candidate_id,
            "role" => $req->role,
            "organization" => $req->organization,
            "is_present" => $req->is_present,
            "start_date" => $req->start_date,
            "end_date" => $req->end_date,
            "description" => $req->description,
            "link" => $req->link,
        ]);

        return response()->json("created successfully");
    }

    public function destroy($id)
    {
        Activity::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }

    public function update(Request $req)
    {
        $update_fields = $req->all();
        Activity::where('id', $req->id)->update($update_fields);

        return response()->json("updated successfully");
    }
}
