<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Skill;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function store(CreateReviewRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['reviewee_id'] = $data['reviewee_id'] ?? Skill::find($data['skill_id'])->teacher_id;

            $review = $this->reviewService->createReview($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => 'Review created successfully',
                'data' => new ReviewResource($review->load(['reviewer', 'reviewee', 'skill'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create review: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function skillReviews(int $skillId, Request $request): JsonResponse
    {
        try {
            $skill = Skill::findOrFail($skillId);
            $perPage = $request->get('per_page', 10);

            $reviews = $this->reviewService->getSkillReviews($skill, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'Skill reviews retrieved successfully',
                'data' => ReviewResource::collection($reviews),
                'pagination' => [
                    'total' => $reviews->total(),
                    'per_page' => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function userReviews(int $userId, Request $request): JsonResponse
    {
        try {
            $user = \App\Models\User::findOrFail($userId);
            $perPage = $request->get('per_page', 10);

            $reviews = $this->reviewService->getUserReviews($user, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'User reviews retrieved successfully',
                'data' => ReviewResource::collection($reviews),
                'pagination' => [
                    'total' => $reviews->total(),
                    'per_page' => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews: ' . $e->getMessage(),
            ], 400);
        }
    }
}
