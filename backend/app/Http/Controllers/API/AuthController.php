<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Employer;
use App\Models\Jskill;
use App\Models\Skill;
use App\Models\User;
use App\Services\CompanyAccessService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt', ['except' => ['login', 'register', 'requestPasswordOtp', 'resetPasswordWithOtp']]);
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

        $requestedRole = (int) $request->role;

        if ($requestedRole === 1) {
            $user = $this->buildCandidateAuthPayload($user);
        }

        if ($requestedRole === 2) {
            $user = $this->buildEmployerAuthPayload($user);
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

    public function requestPasswordOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'role' => 'required|integer|in:1,2',
        ]);

        $user = User::where('email', $validated['email'])
            ->where('role', (int) $validated['role'])
            ->where('is_active', 1)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => 'Không tìm thấy tài khoản đang hoạt động với vai trò đã chọn.',
            ]);
        }

        $otp = (string) random_int(100000, 999999);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => Hash::make($otp),
                'created_at' => Carbon::now(),
            ]
        );

        try {
            Mail::raw("Mã OTP đặt lại mật khẩu Recruitment Studio của bạn là: {$otp}. Mã có hiệu lực trong 15 phút.", function ($mail) use ($validated) {
                $mail->to($validated['email'])->subject('Mã OTP đặt lại mật khẩu');
            });
        } catch (\Throwable $exception) {
            report($exception);
        }

        return response()->json(array_filter([
            'message' => 'Đã gửi mã OTP đặt lại mật khẩu nếu email hợp lệ.',
            'debug_otp' => app()->environment('local') ? $otp : null,
        ]));
    }

    public function resetPasswordWithOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'role' => 'required|integer|in:1,2',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6',
        ]);

        $token = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$token || Carbon::parse($token->created_at)->lt(Carbon::now()->subMinutes(15)) || !Hash::check($validated['otp'], $token->token)) {
            throw ValidationException::withMessages([
                'otp' => 'Mã OTP không đúng hoặc đã hết hạn.',
            ]);
        }

        $updated = User::where('email', $validated['email'])
            ->where('role', (int) $validated['role'])
            ->update(['password' => Hash::make($validated['password'])]);

        if (!$updated) {
            throw ValidationException::withMessages([
                'email' => 'Không tìm thấy tài khoản với vai trò đã chọn.',
            ]);
        }

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json(['message' => 'Đã cập nhật mật khẩu.']);
    }

    public function me()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $role = (int) $user->role;

        if ($role === 2) {
            $user = $this->buildEmployerAuthPayload($user);
        }

        if ($role === 1) {
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
        $role = $user ? (int) $user->role : null;

        if ($role === 1) {
            $user = $this->buildCandidateAuthPayload($user);
        }

        if ($role === 2) {
            $user = $this->buildEmployerAuthPayload($user);
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

    private function buildEmployerAuthPayload($user)
    {
        $access = app(CompanyAccessService::class);
        $member = $access->currentMember($user->id);

        if (!$member) {
            $employer = Employer::where('user_id', $user->id)->first();
            if ($employer) {
                $member = $access->ensureOwnerMemberForEmployer($employer);
            }
        }

        if (!$member) {
            return User::with('employer')->find($user->id);
        }

        $payload = User::with([
            'companyMember.employer',
            'companyMember.branch',
        ])->find($user->id)->toArray();

        $companyPayload = $access->companyPayload($member);
        $payload['employer'] = $companyPayload['employer'];
        $payload['company'] = $companyPayload['company'];
        $payload['company_member'] = $companyPayload['member'];
        $payload['member'] = $companyPayload['member'];
        $payload['branch'] = $companyPayload['branch'];
        $payload['branches'] = $companyPayload['branches'];
        $payload['permissions'] = $companyPayload['permissions'];

        return $payload;
    }
}
