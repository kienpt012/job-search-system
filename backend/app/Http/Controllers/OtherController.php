<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Other;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OtherController extends Controller
{
    public function index()
    {
        $res = Other::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Other::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();

        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Other::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;

        Other::create([
            "candidate_id" => $candidate_id,
            "name" => $req->name,
            "description" => $req->description
        ]);

        return response()->json("created successfully");
    }

    public function destroy($id)
    {
        Other::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }

    public function update(Request $req)
    {
        $update_fields = $req->all();
        Other::where('id', $req->id)->update($update_fields);

        return response()->json("updated successfully");
    }
}
