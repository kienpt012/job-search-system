<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EducationController extends Controller
{
    public function index()
    {
        return Education::all();
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Education::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Education::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        Education::create([
            "candidate_id" => $candidate_id,
            "school" => $req->school,
            "major" => $req->major,
            "start_date" => $req->start_date,
            "end_date" => $req->end_date,
            "description" => $req->description,
        ]);

        return response()->json("created successfully");
    }
    public function destroy($id)
    {
        Education::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }
    public function update(Request $req)
    {
        $update_fields = $req->all();
        Education::where('id', $req->id)->update($update_fields);
        $msg = 'Update successfully';

        return response()->json($msg);
    }
}
