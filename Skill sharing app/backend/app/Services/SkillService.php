<?php

namespace App\Services;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Pagination\Paginator;

class SkillService
{
    public function createSkill(User $teacher, array $data): Skill
    {
        return $teacher->skills()->create($data);
    }

    public function updateSkill(Skill $skill, array $data): Skill
    {
        $skill->update($data);
        return $skill;
    }

    public function deleteSkill(Skill $skill): bool
    {
        return $skill->delete();
    }

    public function getAllSkills(int $perPage = 15)
    {
        return Skill::with(['teacher', 'category', 'reviews'])
            ->paginate($perPage);
    }

    public function getTeacherSkills($userId, int $perPage = 15)
    {
        return Skill::where('teacher_id', $userId)
            ->with(['category', 'reviews'])
            ->paginate($perPage);
    }

    public function getSkillById(int $id): ?Skill
    {
        return Skill::with(['teacher', 'category', 'reviews', 'exchanges'])
            ->find($id);
    }

    public function searchSkills(string $query, int $perPage = 15)
    {
        return Skill::with(['teacher', 'category'])
            ->where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->paginate($perPage);
    }
}