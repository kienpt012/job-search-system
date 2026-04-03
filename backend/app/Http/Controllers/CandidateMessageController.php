<?php

namespace App\Http\Controllers;

use App\Models\CandidateMessage;
use Illuminate\Http\Request;

class CandidateMessageController extends Controller
{
    public function getByCandidateID($id)
    {
        $msgs = CandidateMessage::where('candidate_id', '=', $id)->get();

        return response()->json($msgs);
    }
    public function updateReadMsg($id)
    {
        $res = CandidateMessage::where('id', '=', $id)
            ->update(['isRead' => 1]);
        if($res){
            $msg = "Updated successfully!";
        }
        else {
            $msg = "Updated failed!";
        }

        return response()->json($msg);
    }
}
