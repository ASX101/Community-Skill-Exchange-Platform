<?php

namespace App\Services;

use App\Models\Review;
use App\Models\Skill;
use App\Models\User;

class ReviewService
{
    public function createReview(User $reviewer, array $data): Review
    {
        $review = Review::create([
            'exchange_id' => $data['exchange_id'] ?? null,
            'skill_id' => $data['skill_id'],
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $data['reviewee_id'] ?? null,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $this->updateSkillRating($data['skill_id']);
        
        if (isset($data['reviewee_id'])) {
            $this->updateUserRating($data['reviewee_id']);
        }

        return $review;
    }

    public function getSkillReviews(Skill $skill, int $perPage = 10)
    {
        return $skill->reviews()
            ->with(['reviewer', 'reviewee'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getUserReviews(User $user, int $perPage = 10)
    {
        return $user->reviewsReceived()
            ->with(['reviewer', 'skill'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    private function updateSkillRating(int $skillId): void
    {
        $skill = Skill::find($skillId);
        if ($skill) {
            $reviews = $skill->reviews()->get();
            if ($reviews->count() > 0) {
                $skill->update([
                    'rating' => $reviews->avg('rating'),
                    'total_reviews' => $reviews->count(),
                ]);
            }
        }
    }

    private function updateUserRating(int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $reviews = $user->reviewsReceived()->get();
            if ($reviews->count() > 0) {
                $user->update([
                    'rating' => $reviews->avg('rating'),
                    'total_reviews' => $reviews->count(),
                ]);
            }
        }
    }
}
