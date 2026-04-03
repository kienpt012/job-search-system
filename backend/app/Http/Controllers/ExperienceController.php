<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExperienceController extends Controller
{
    public function index()
    {
        $res = Experience::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Experience::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Experience::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        Experience::create([
            "candidate_id" => $candidate_id,
            "name" => $req->name,
            "company" => $req->company,
            "start_date" => $req->start_date,
            "end_date" => $req->end_date,
            "description" => $req->description,
        ]);

        return response()->json("created successfully");
    }
    public function destroy($id)
    {
        Experience::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }
    public function update(Request $req)
    {
        $update_fields = $req->all();
        Experience::where('id', $req->id)->update($update_fields);
        $msg = 'updated successfully';

        return response()->json($msg);
    }
}
