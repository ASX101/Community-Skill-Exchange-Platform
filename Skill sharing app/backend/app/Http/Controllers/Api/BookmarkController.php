<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookmarkService;
use App\Http\Resources\SkillResource;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookmarkController extends Controller
{
    private BookmarkService $bookmarkService;

    public function __construct(BookmarkService $bookmarkService)
    {
        $this->bookmarkService = $bookmarkService;
    }

    /**
     * Add a bookmark
     * POST /api/bookmarks
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - User not authenticated',
                ], 401);
            }

            // Validate input
            $validated = $request->validate([
                'skill_id' => 'required|integer|exists:skills,id',
            ]);

            // Check if bookmark already exists
            $existing = Bookmark::where('user_id', $user->id)
                ->where('skill_id', $validated['skill_id'])
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => true,
                    'message' => 'Skill already bookmarked',
                    'data' => [
                        'bookmark_id' => $existing->id,
                        'skill_id' => $existing->skill_id,
                        'created_at' => $existing->created_at,
                    ]
                ], 200);
            }

            // Create new bookmark
            $bookmark = Bookmark::create([
                'user_id' => $user->id,
                'skill_id' => $validated['skill_id'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Skill bookmarked successfully',
                'data' => [
                    'bookmark_id' => $bookmark->id,
                    'skill_id' => $bookmark->skill_id,
                    'created_at' => $bookmark->created_at,
                ]
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Bookmark validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Bookmark creation error: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'skill_id' => $request->get('skill_id'),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to add bookmark: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove a bookmark
     * DELETE /api/bookmarks/{skillId}
     */
    public function destroy(int $skillId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $deleted = Bookmark::where('user_id', $user->id)
                ->where('skill_id', $skillId)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bookmark not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Bookmark removed successfully',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Bookmark deletion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove bookmark',
            ], 500);
        }
    }

    /**
     * Get user's bookmarks
     * GET /api/bookmarks
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $bookmarks = Bookmark::where('user_id', $user->id)
                ->with(['skill.category', 'skill.teacher'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => SkillResource::collection($bookmarks->pluck('skill')),
                'count' => $bookmarks->count(),
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Get bookmarks error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bookmarks',
            ], 500);
        }
    }

    /**
     * Check if a skill is bookmarked
     * GET /api/bookmarks/check/{skillId}
     */
    public function check(int $skillId, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $isBookmarked = Bookmark::where('user_id', $user->id)
                ->where('skill_id', $skillId)
                ->exists();

            return response()->json([
                'success' => true,
                'is_bookmarked' => $isBookmarked,
                'skill_id' => $skillId,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Check bookmark error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check bookmark status',
            ], 500);
        }
    }
}