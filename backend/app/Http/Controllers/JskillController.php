<?php

namespace App\Http\Controllers;

use App\Models\Jskill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JskillController extends Controller
{
    public function index()
    {
        return response()->json(Jskill::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:40',
        ]);

        $skill = Jskill::create([
            'name' => trim($validated['name']),
        ]);

        return response()->json($skill, 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:40',
        ]);

        $skill = Jskill::findOrFail($id);
        $skill->update([
            'name' => trim($validated['name']),
        ]);

        return response()->json($skill);
    }

    public function destroy($id)
    {
        $this->authorizeAdmin();

        DB::table('job_skill')->where('skill_id', $id)->delete();
        Jskill::findOrFail($id)->delete();

        return response()->json('deleted successfully');
    }

    private function authorizeAdmin()
    {
        abort_if((int) Auth::user()->role !== 0, 403, 'Forbidden');
    }
}
