<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Jskill;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt', ['except' => ['login', 'register']]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'role' => 'required|integer|in:0,1,2',
        ]);

        $credentials = $request->only('email', 'password');
        $token = Auth::attempt($credentials);
        $user = Auth::user();

        if (!$token || !$user || (int) $user->role !== (int) $request->role) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        if (!(int) $user->is_active) {
            Auth::logout();

            return response()->json([
                'message' => 'Account is locked',
            ], 403);
        }

        if ((int) $request->role === 1) {
            $user = $this->buildCandidateAuthPayload($user);
        }

        return response()->json([
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'email|max:255|unique:users',
        ]);

        User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 1,
            'is_active' => 1,
        ]);

        $user = User::orderBy('id', 'desc')->first();
        Candidate::create([
            'id' => $user->id,
            'user_id' => $user->id,
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'email' => $request->email,
        ]);

        $skillIds = $request->input('skills', []);
        if (is_array($skillIds) && count($skillIds) > 0) {
            $skillNames = Jskill::whereIn('id', $skillIds)->pluck('name');
            foreach ($skillNames as $skillName) {
                Skill::create([
                    'candidate_id' => $user->id,
                    'resume_id' => null,
                    'name' => $skillName,
                    'proficiency' => 0,
                    'description' => null,
                ]);
            }
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function me()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        if ((int) $user->role === 2) {
            $user = User::with('employer')->find($user->id);
        }

        if ((int) $user->role === 1) {
            $user = $this->buildCandidateAuthPayload($user);
        }

        return response()->json($user);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    public function refresh()
    {
        $user = Auth::user();
        if ($user && (int) $user->role === 1) {
            $user = $this->buildCandidateAuthPayload($user);
        }

        return response()->json([
            'user' => $user,
            'authorization' => [
                'token' => Auth::refresh(),
                'type' => 'bearer',
            ],
        ]);
    }

    private function buildCandidateAuthPayload($user)
    {
        $candidate = Candidate::where('user_id', $user->id)->first();

        if (!$candidate) {
            return $user;
        }

        $payload = $candidate->toArray();
        $payload['role'] = $user->role;
        $payload['is_active'] = $user->is_active;

        return $payload;
    }
}
