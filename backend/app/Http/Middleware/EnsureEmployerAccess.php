<?php

namespace App\Http\Middleware;

use App\Services\CompanyAccessService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureEmployerAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user || (int) $user->role !== 2 || !(int) $user->is_active) {
            abort(403, 'Bạn không có quyền truy cập khu vực nhà tuyển dụng.');
        }

        app(CompanyAccessService::class)->requireMember($user->id);

        return $next($request);
    }
}
