<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CertificateController extends Controller
{
    public function index()
    {
        $res = Certificate::all();

        return response()->json($res);
    }

    public function getByCurrentCandidateProfile()
    {
        $candidate_id = Auth::user()->id;
        $res = Certificate::where([
            ["candidate_id", $candidate_id],
            ["resume_id", null]
        ])->get();
        return response()->json($res);
    }

    public function getByCurCandResumeId($resume_id)
    {
        $candidate_id = Auth::user()->id;
        $res = Certificate::where([
            ["candidate_id", $candidate_id],
            ["resume_id", $resume_id]
        ])->get();
        return response()->json($res);
    }

    public function create(Request $req)
    {
        $candidate_id = Auth::user()->id;
        $certificate = new Certificate;
        $certificate->candidate_id = $candidate_id;
        $certificate->name = $req->name;
        $certificate->receive_date = $req->receive_date;
        $certificate->expire_date = $req->expire_date;
        $certificate->save();
        //process saving file:
        $file = $req->file('image');
        if ($file) {
            $fname = 'certificate' . '_' . $certificate->id;
            $path =  env('APP_URL') . '/storage/' . $file->storeAs('certificate_images', $fname, 'public');
            $certificate->image = $path;
            $certificate->save();
        }

        return response()->json("created successfully");
    }

    public function destroy($id)
    {
        Certificate::findOrFail($id)->delete();

        return response()->json("deleted successfully");
    }

    public function update(Request $req)
    {
        $certificate = Certificate::find($req->id);
        $certificate->name = $req->name;
        $certificate->receive_date = $req->receive_date;
        $certificate->expire_date = $req->expire_date;

        $file = $req->file('image');
        if ($file) {
            $fname = 'certificate' . '_' . $certificate->id;
            $path =  env('APP_URL') . '/storage/' . $file->storeAs('certificate_images', $fname, 'public');
            $certificate->image = $path;
        }
        if ($req->delete_img) {
            $certificate->image = NULL;
        }
        $certificate->save();

        return response()->json('updated successfully');
    }
}
