<?php

namespace App\Services;

use App\Models\Bookmark;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Collection;

class BookmarkService
{
    /**
     * Add a bookmark for a user
     */
    public function addBookmark(int $userId, int $skillId): Bookmark
    {
        // Check if already bookmarked
        $existing = Bookmark::where('user_id', $userId)
            ->where('skill_id', $skillId)
            ->first();

        if ($existing) {
            return $existing;
        }

        return Bookmark::create([
            'user_id' => $userId,
            'skill_id' => $skillId,
        ]);
    }

    /**
     * Remove a bookmark for a user
     */
    public function removeBookmark(int $userId, int $skillId): bool
    {
        return Bookmark::where('user_id', $userId)
            ->where('skill_id', $skillId)
            ->delete() > 0;
    }

    /**
     * Check if a skill is bookmarked by a user
     */
    public function isBookmarked(int $userId, int $skillId): bool
    {
        return Bookmark::where('user_id', $userId)
            ->where('skill_id', $skillId)
            ->exists();
    }

    /**
     * Get all bookmarks for a user
     */
    public function getUserBookmarks(int $userId): Collection
    {
        return Bookmark::where('user_id', $userId)
            ->with(['skill.category', 'skill.teacher'])
            ->get();
    }

    /**
     * Get bookmark count for a skill
     */
    public function getSkillBookmarkCount(int $skillId): int
    {
        return Bookmark::where('skill_id', $skillId)->count();
    }
}
