<?php

namespace App\Http\Controllers;

use App\Models\Industry;
use Illuminate\Http\Request;

class IndustryController extends Controller
{
    public function index(){
        $all = Industry::all();
        return response()->json([
            'inf' => $all
        ], 200);
    }
}
