<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Validation\ValidationException;
use App\Notifications\ResetPasswordNotification;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user's email
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            // Rate limiting: 5 reset attempts per hour
            $throttleKey = 'forgot-password-' . $request->ip();
            if (RateLimiter::tooManyAttempts($throttleKey, 5, 60)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many password reset attempts. Please try again later.',
                ], 429);
            }

            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
            ], [
                'email.exists' => 'No account found with this email address.',
            ]);

            $user = User::where('email', $validated['email'])->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No account found with this email address.',
                ], 404);
            }

            // Generate reset token
            $token = Str::random(60);
            
            // Save reset token to database
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'email' => $user->email,
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // Generate reset link for frontend
            $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
            
            \Log::info('Password reset token generated for: ' . $user->email);
            \Log::info('Reset URL: ' . $resetUrl);

            // Send reset link email
            $user->notify(new ResetPasswordNotification($resetUrl));

            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email. Please check your inbox.',
                'data' => [
                    'email' => $user->email,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Password reset error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset link: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reset user's password with reset token
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|confirmed',
            ], [
                'email.exists' => 'No account found with this email address.',
                'password.min' => 'Password must be at least 8 characters.',
                'password.confirmed' => 'Passwords do not match.',
            ]);

            // Find the reset record
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $validated['email'])
                ->first();

            if (!$resetRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token. Please request a new password reset link.',
                ], 400);
            }

            // Verify token
            if (!Hash::check($validated['token'], $resetRecord->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid reset token.',
                ], 400);
            }

            // Check if token is not expired (24 hours)
            $tokenAge = now()->diffInHours($resetRecord->created_at);
            if ($tokenAge > 24) {
                DB::table('password_reset_tokens')
                    ->where('email', $validated['email'])
                    ->delete();
                
                return response()->json([
                    'success' => false,
                    'message' => 'Reset token has expired. Please request a new password reset link.',
                ], 400);
            }

            // Update password
            $user = User::where('email', $validated['email'])->first();
            $user->forceFill([
                'password' => Hash::make($validated['password']),
            ])->save();

            // Delete used token
            DB::table('password_reset_tokens')
                ->where('email', $validated['email'])
                ->delete();

            \Log::info('Password reset successful for: ' . $user->email);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully! You can now log in with your new password.',
                'data' => [
                    'email' => $user->email,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Password reset error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password: ' . $e->getMessage(),
            ], 400);
        }
    }
}