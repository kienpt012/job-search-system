<?php

namespace App\Http\Controllers;

use App\Models\Jlevel;
use Illuminate\Http\Request;

class JlevelController extends Controller
{
    public function index(){
        $all = Jlevel::all();
        return response()->json([
            'inf' => $all
        ], 200);
    }
}
