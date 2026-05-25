<?php

namespace App\Http\Controllers;

use App\Models\Employer;
use App\Models\EmployerRegistration;
use App\Models\User;
use App\Services\CompanyAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmployerRegistrationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email|unique:employer_registrations,email',
            'company_name' => 'required|string|max:150',
            'address' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'website' => 'nullable|string|max:255',
            'min_employees' => 'nullable|integer|min:0',
            'max_employees' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'documents' => 'required|array|min:1|max:5',
            'documents.*' => 'file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
        ]);

        $documents = [];
        foreach ($request->file('documents', []) as $document) {
            $documents[] = $this->storeDocument($document);
        }

        $registration = EmployerRegistration::create([
            'email' => $validated['email'],
            'company_name' => $validated['company_name'],
            'address' => $validated['address'],
            'contact_name' => $validated['contact_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'website' => $validated['website'] ?? null,
            'min_employees' => $validated['min_employees'] ?? null,
            'max_employees' => $validated['max_employees'] ?? null,
            'description' => $validated['description'] ?? null,
            'documents' => $documents,
            'status' => 'pending',
        ]);

        return response()->json($registration, 201);
    }

    public function index()
    {
        $this->ensureAdmin();

        return response()->json(
            EmployerRegistration::orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function approve(Request $request, $id)
    {
        $this->ensureAdmin();

        $registration = EmployerRegistration::find($id);
        if (!$registration) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        if ($registration->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu này đã được xử lý.'], 422);
        }

        if (User::where('email', $registration->email)->exists()) {
            return response()->json(['message' => 'Email này đã tồn tại trong hệ thống.'], 422);
        }

        $defaultPassword = Str::password(10, true, true, false, false);

        $user = DB::transaction(function () use ($registration, $request, $defaultPassword) {
            $user = User::create([
                'email' => $registration->email,
                'password' => Hash::make($defaultPassword),
                'role' => 2,
                'is_active' => 1,
            ]);

            $employer = Employer::create([
                'id' => $user->id,
                'user_id' => $user->id,
                'name' => $registration->company_name,
                'address' => $registration->address,
                'min_employees' => $registration->min_employees,
                'max_employees' => $registration->max_employees,
                'contact_name' => $registration->contact_name,
                'phone' => $registration->phone,
                'website' => $registration->website,
                'description' => $registration->description,
                'logo' => '',
                'image' => null,
                'is_hot' => 0,
                'is_active' => 1,
            ]);

            app(CompanyAccessService::class)->ensureOwnerMemberForEmployer($employer);

            $this->sendApprovedMail($registration, $defaultPassword);

            $registration->update([
                'status' => 'approved',
                'admin_note' => $request->input('admin_note'),
                'approved_user_id' => $user->id,
                'approved_at' => now(),
            ]);

            app(CompanyAccessService::class)->log(
                'employer_registration.approved',
                EmployerRegistration::class,
                $registration->id,
                null,
                ['approved_user_id' => $user->id, 'employer_id' => $employer->id],
                'Admin duyệt hồ sơ, công ty cần thanh toán để mở đầy đủ quyền quản trị.'
            );

            return $user;
        });

        return response()->json([
            'message' => 'Employer approved successfully',
            'user' => $user,
            'registration' => $registration->fresh(),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $this->ensureAdmin();

        $registration = EmployerRegistration::find($id);
        if (!$registration) {
            return response()->json(['message' => 'resource not found'], 404);
        }

        if ($registration->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu này đã được xử lý.'], 422);
        }

        $registration->update([
            'status' => 'rejected',
            'admin_note' => $request->input('admin_note'),
        ]);

        return response()->json($registration->fresh());
    }

    private function sendApprovedMail(EmployerRegistration $registration, string $defaultPassword): void
    {
        $recipientName = $registration->contact_name ?: $registration->company_name;

        Mail::raw(
            "Xin chào {$recipientName},\n\n"
                . "Tài khoản nhà tuyển dụng cho {$registration->company_name} đã được duyệt.\n\n"
                . "Email đăng nhập: {$registration->email}\n"
                . "Mật khẩu mặc định: {$defaultPassword}\n\n"
                . "Vui lòng đăng nhập tại trang nhà tuyển dụng và đổi mật khẩu sau khi vào hệ thống.",
            function ($message) use ($registration) {
                $message->to($registration->email)
                    ->subject('Tài khoản nhà tuyển dụng đã được duyệt');
            }
        );
    }

    private function storeDocument($file)
    {
        $directoryName = 'employer_documents';
        $directory = storage_path($directoryName);
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'pdf');
        $filename = 'employer_document_' . time() . '_' . Str::random(8) . '.' . $extension;
        $file->move($directory, $filename);

        return [
            'name' => $file->getClientOriginalName(),
            'url' => rtrim(env('APP_URL'), '/') . '/' . $directoryName . '/' . rawurlencode($filename),
        ];
    }

    private function ensureAdmin()
    {
        $user = Auth::user();
        if (!$user || (int) $user->role !== 0) {
            abort(403, 'Forbidden');
        }

        return $user;
    }
}
