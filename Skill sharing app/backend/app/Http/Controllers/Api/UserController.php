<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function show(int $id): JsonResponse
    {
        try {
            $user = \App\Models\User::findOrFail($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'User retrieved successfully',
                'data' => new UserResource($user),
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Get user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function updateProfile(Request $request): JsonResponse
    {
        try {
            // Log the incoming request
            \Log::info('=== PROFILE UPDATE START ===');
            \Log::info('Request user ID: ' . ($request->user() ? $request->user()->id : 'NULL'));
            \Log::info('Request all: ' . json_encode($request->all()));
            
            $user = $request->user();
            
            if (!$user) {
                \Log::error('User not authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Validate input
            $validated = $request->validate([
                'name' => ['sometimes', 'string', 'max:255', 'min:2'],
                'bio' => ['sometimes', 'string', 'max:500', 'nullable'],
                'avatar' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
            ]);

            \Log::info('Validation passed. Validated data: ' . json_encode($validated));

            $data = [];
            
            // Only add name if provided
            if ($request->has('name') && $request->input('name') !== null) {
                $data['name'] = $request->input('name');
            }
            
            // Only add bio if provided
            if ($request->has('bio') && $request->input('bio') !== null) {
                $data['bio'] = $request->input('bio');
            }

            \Log::info('Data to update: ' . json_encode($data));

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                \Log::info('Processing avatar upload for user: ' . $user->id);
                
                // Delete old avatar if exists
                if ($user->avatar_url) {
                    $oldPath = str_replace('/storage/', '', $user->avatar_url);
                    \Log::info('Attempting to delete old avatar: ' . $oldPath);
                    
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                        \Log::info('Deleted old avatar: ' . $oldPath);
                    }
                }

                // Upload new avatar
                $file = $request->file('avatar');
                if ($file && $file->isValid()) {
                    try {
                        $path = $file->store('avatars', 'public');
                        $data['avatar_url'] = '/storage/' . $path;
                        \Log::info('Uploaded new avatar to: ' . $path);
                    } catch (\Exception $uploadError) {
                        \Log::error('Avatar upload failed: ' . $uploadError->getMessage());
                        return response()->json([
                            'success' => false,
                            'message' => 'Failed to upload avatar: ' . $uploadError->getMessage(),
                        ], 500);
                    }
                }
            }

            \Log::info('About to update user with data: ' . json_encode($data));

            // Perform the update
            $updateResult = $user->update($data);
            \Log::info('Update result: ' . ($updateResult ? 'TRUE' : 'FALSE'));

            // Refresh user from database
            $user->refresh();
            \Log::info('User refreshed from database. Name: ' . $user->name . ', Bio: ' . $user->bio . ', Avatar: ' . $user->avatar_url);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'bio' => $user->bio,
                    'avatar_url' => $user->avatar_url,
                    'rating' => $user->rating,
                    'total_reviews' => $user->total_reviews,
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage(),
            ], 500);
        }
    }
}