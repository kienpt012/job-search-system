<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Throwable;

class JWTMiddleware
{
    public function __construct()
    {
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            JWTAuth::parseToken()->authenticate();
        } catch (Throwable $exception) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
