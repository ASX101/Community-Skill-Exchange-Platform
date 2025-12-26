<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class VerificationController extends Controller
{
    /**
     * Stateless verify: verify user by id + hash (sha1(email))
     * Works without user being authenticated (suitable for SPA + API).
     * 
     * URL format: GET /api/email/verify/{id}/{hash}
     * Example: GET /api/email/verify/6/af9ff2b8f3045f278ae8edac9f63bf6783a38d56
     */
    public function verify($id, $hash): JsonResponse
    {
        try {
            // Find user by ID
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                ], 404);
            }

            // Generate expected hash from user's email
            $expectedHash = sha1($user->email);

            // Compare provided hash with expected hash
            if (!hash_equals($expectedHash, (string)$hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired verification link.',
                ], 400);
            }

            // Check if already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email already verified.',
                    'data' => [
                        'verified' => true,
                        'email' => $user->email,
                    ],
                ], 200);
            }

            // Mark email as verified
            $user->email_verified_at = now();
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully! You can now log in.',
                'data' => [
                    'verified' => true,
                    'email' => $user->email,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Email verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend verification email by email address (public route).
     * POST /api/email/resend
     * Body: { "email": "user@example.com" }
     */
    public function resend(Request $request): JsonResponse
    {
        try {
            // Validate email
            $validated = $request->validate([
                'email' => 'required|email|exists:users',
            ]);

            // Find user by email
            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No user found with this email.',
                ], 404);
            }

            // Check if already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified.',
                ], 400);
            }

            // Send verification email
            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent! Check your inbox.',
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
            \Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend verification email',
            ], 500);
        }
    }
}