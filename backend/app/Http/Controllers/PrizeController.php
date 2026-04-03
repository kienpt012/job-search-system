<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Prize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrizeController extends Controller
{
    public function index()
    {
        $res = Prize::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Prize::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Prize::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        $prize = new Prize;
        $prize->candidate_id = $candidate_id;
        $prize->name = $req->name;
        $prize->receive_date = $req->receive_date;
        $prize->save();
        //process saving file:
        $file = $req->file('image');
        if ($file) {
            $fname = 'prize' . '_' . $prize->id;
            $path =  env('APP_URL') . '/storage/' . $file->storeAs('prize_images', $fname, 'public');
            $prize->image = $path;
            $prize->save();
        }

        return response()->json("created successfully");
    }

    public function destroy($id)
    {
        Prize::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }

    public function update(Request $req)
    {
        $prize = Prize::find($req->id);
        $prize->name = $req->name;
        $prize->receive_date = $req->receive_date;

        $file = $req->file('image');
        if ($file) {
            $fname = 'prize' . '_' . $prize->id;
            $path =  env('APP_URL') . '/storage/' . $file->storeAs('prize_images', $fname, 'public');
            $prize->image = $path;
        }
        if ($req->delete_img) {
            $prize->image = NULL;
        }
        $prize->save();

        return response()->json('updated successfully');
    }
}
