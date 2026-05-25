<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EducationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\CandidateMessageController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CompanyBranchController;
use App\Http\Controllers\CompanyMemberController;
use App\Http\Controllers\EmployerController;
use App\Http\Controllers\EmployerRegistrationController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\EmployerBillingController;
use App\Http\Controllers\HeroSlideController;
use App\Http\Controllers\IndustryController;
use App\Http\Controllers\JlevelController;
use App\Http\Controllers\JskillController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JtypeController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\OtherController;
use App\Http\Controllers\PrizeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\SkillController;
use App\Models\CandidateMessage;
use App\Models\Employer;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
/*
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
*/

Route::controller(AuthController::class)->group(function () {
    Route::post('login', 'login');
    Route::post('register', 'register');
    Route::get('logout', 'logout');
    Route::get('refresh', 'refresh');
    Route::get('getMe', 'me');
});

Route::controller(EmployerController::class)->prefix('companies')->group(function () {
    Route::get('', 'index');
    Route::get('dashboard', 'getDashboard')->middleware(['jwt', 'employer.access']);
    Route::post('updateCurrent', 'updateCurrent')->middleware(['jwt', 'employer.access']);
    Route::post('resolveSharedMapLink', 'resolveSharedMapLink')->middleware(['jwt', 'employer.access']);
    Route::get('{id}/getByID', 'show');
    Route::get('getHotList', 'getHotList');
    Route::delete('{id}', 'destroy');
    Route::get('{id}/getComJobs', 'getComJobs');
    Route::get('{id}/getJobList', 'getJobList')->middleware(['jwt', 'employer.access']);
    Route::get('getCandidateList', 'getCandidateList')->middleware(['jwt', 'employer.access']);
    Route::get('searchCandidates', 'searchCandidates')->middleware(['jwt', 'employer.access']);
    Route::get('talentRecommendations', 'getTalentRecommendations')->middleware(['jwt', 'employer.access']);
    Route::get('jobs/{job_id}/recommendedCandidates', 'getRecommendedCandidates')->middleware(['jwt', 'employer.access']);
    Route::post('contactCandidate', 'contactCandidate')->middleware(['jwt', 'employer.access']);
    Route::post('processApplying', 'processApplying')->middleware(['jwt', 'employer.access']);
    Route::post('{job_id}/changeJobStatus', 'changeJobStatus')->middleware(['jwt', 'employer.access']);
});

Route::middleware(['jwt', 'employer.access'])->prefix('employer')->group(function () {
    Route::get('me', [EmployerController::class, 'me']);
    Route::get('jobs', [EmployerController::class, 'getJobList']);
    Route::apiResource('branches', CompanyBranchController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('members', CompanyMemberController::class)->only(['index', 'store', 'update', 'destroy']);
});

Route::controller(EmployerBillingController::class)->prefix('employer/billing')->middleware('jwt')->group(function () {
    Route::get('summary', 'summary');
    Route::post('checkout', 'checkout');
    Route::post('payments/{orderCode}/sync', 'sync');
});

Route::post('payments/payos/webhook', [EmployerBillingController::class, 'webhook']);

Route::controller(AdminController::class)->prefix('admin')->middleware('jwt')->group(function () {
    Route::get('dashboard', 'getDashboard');
    Route::get('jobs', 'getJobs');
    Route::post('resolveSharedMapLink', 'resolveSharedMapLink');
    Route::post('companies', 'createCompany');
    Route::post('companies/{id}/update', 'updateCompany');
    Route::post('jobs/{id}/update', 'updateJob');
    Route::delete('companies/{id}', 'destroyCompany');
    Route::post('users/{id}/status', 'toggleUserStatus');
    Route::post('users/{id}/password', 'updateUserPassword');
    Route::delete('users/{id}', 'destroyUser');
});

Route::controller(EmployerRegistrationController::class)->prefix('employer-registrations')->group(function () {
    Route::post('', 'store');
    Route::get('', 'index')->middleware('jwt');
    Route::post('{id}/approve', 'approve')->middleware('jwt');
    Route::post('{id}/reject', 'reject')->middleware('jwt');
});

Route::controller(JskillController::class)->prefix('jskills')->group(function () {
    Route::get('', 'index');
    Route::post('', 'store')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
});

Route::controller(HeroSlideController::class)->prefix('admin/hero-slides')->middleware('jwt')->group(function () {
    Route::get('', 'adminIndex');
    Route::post('', 'store');
    Route::post('reorder', 'reorder');
    Route::post('{id}/status', 'updateStatus');
    Route::delete('{id}', 'destroy');
});

Route::controller(HeroSlideController::class)->prefix('hero-slides')->group(function () {
    Route::get('', 'index');
});

Route::controller(JobController::class)->prefix('jobs')->group(function () {
    Route::get('', 'index');
    Route::get('{id}/getByID', 'show');
    Route::get('getHotList', 'getHotList');
    Route::post('', 'create')->middleware(['jwt', 'employer.access']);
    Route::post('{id}/update', 'update')->middleware(['jwt', 'employer.access']);
    Route::get('{id}/getJobIndustries', 'getJobIndustries');
    Route::get('{id}/getJobSkills', 'getJobSkills');
    Route::post('{id}/apply', 'apply')->middleware('jwt');
    Route::get('{id}/checkApplying', 'checkApplying')->middleware('jwt');
});

Route::controller(CandidateController::class)->prefix('candidates')->group(function () {
    // Route::get('', 'index');
    // Route::get('{id}', 'show')->middleware('jwt');
    Route::get('getCurrent', 'getCurrent')->middleware('jwt');
    Route::get('dashboardSummary', 'getDashboardSummary')->middleware('jwt');
    Route::get('profileBundle', 'getProfileBundle')->middleware('jwt');
    Route::get('nearbyCompanies', 'getNearbyCompanies')->middleware('jwt');
    Route::post('resolveSharedMapLink', 'resolveSharedMapLink')->middleware('jwt');
    Route::post('update', 'update')->middleware('jwt');
    Route::get('{id}/getAppliedJobs', 'getAppliedJobs');
    Route::get('{id}/getSavedJobs', 'getSavedJobs');
    Route::post('{job_id}/processJobSaving', 'processJobSaving');
    Route::get('{job_id}/checkJobSaved', 'checkJobSaved');
});

Route::controller(IndustryController::class)->prefix('industries')->group(function () {
    Route::get('', 'index');
});

Route::controller(LocationController::class)->prefix('locations')->group(function () {
    Route::get('', 'index');
});

Route::controller(JtypeController::class)->prefix('jtypes')->group(function () {
    Route::get('', 'index');
});

Route::controller(JlevelController::class)->prefix('jlevels')->group(function () {
    Route::get('', 'index');
});

Route::controller(CandidateMessageController::class)->prefix('cand-msgs')->group(function () {
    Route::get('{id}/getByCandidateID', 'getByCandidateID')->middleware('jwt');
    Route::get('{id}/updateReadMsg', 'updateReadMsg');
});

Route::controller(EducationController::class)->prefix('educations')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::post('update/{id}', 'update')->middleware('jwt');
});
Route::controller(ExperienceController::class)->prefix('experiences')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
});
Route::controller(SkillController::class)->prefix('skills')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
});
Route::controller(ProjectController::class)->prefix('projects')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
});
Route::controller(CertificateController::class)->prefix('certificates')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::post('/update/{id}', 'update')->middleware('jwt');
});
Route::controller(PrizeController::class)->prefix('prizes')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::post('/update/{id}', 'update')->middleware('jwt');
});
Route::controller(ActivityController::class)->prefix('activities')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
});
Route::controller(OtherController::class)->prefix('others')->group(function () {
    Route::get('', 'index');
    Route::get('getByCurrentCandidateProfile', 'getByCurrentCandidateProfile')->middleware('jwt');
    Route::get('{resume_id}/getByCurCandResumeId', 'getByCurCandResumeId')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
    Route::patch('{id}', 'update')->middleware('jwt');
});
Route::controller(ResumeController::class)->prefix('resumes')->group(function () {
    Route::get('getByCurrentCandidate', 'getByCurrentCandidate')->middleware('jwt');
    Route::get('{id}/getById', 'getById')->middleware('jwt');
    Route::post('', 'create')->middleware('jwt');
    Route::post('update', 'update')->middleware('jwt');
    Route::delete('{id}', 'destroy')->middleware('jwt');
});
