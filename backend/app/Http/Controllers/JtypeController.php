<?php

namespace App\Http\Controllers;

use App\Models\Jtype;
use Illuminate\Http\Request;

class JtypeController extends Controller
{
    public function index(){
        $all = Jtype::all();
        return response()->json([
            'inf' => $all
        ], 200);
    }
}
