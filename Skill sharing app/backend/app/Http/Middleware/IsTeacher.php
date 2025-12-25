<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsTeacher
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, ['teacher', 'both'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can perform this action',
            ], 403);
        }

        return $next($request);
    }
}
