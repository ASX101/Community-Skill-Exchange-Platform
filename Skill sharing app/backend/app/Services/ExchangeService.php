<?php

namespace App\Services;

use App\Models\Exchange;
use App\Models\Skill;
use App\Models\User;
use App\Notifications\ExchangeRequestNotification;

class ExchangeService
{
    public function createExchange(User $learner, int $skillId, array $data): Exchange
    {
        $skill = Skill::findOrFail($skillId);
        
        $exchange = Exchange::create([
            'skill_id' => $skill->id,
            'learner_id' => $learner->id,
            'teacher_id' => $skill->teacher_id,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
        ]);

        // Send notification to teacher
        $skill->teacher->notify(new ExchangeRequestNotification($exchange));

        return $exchange;
    }

    public function acceptExchange(Exchange $exchange): Exchange
    {
        $exchange->update(['status' => 'accepted']);
        return $exchange;
    }

    public function completeExchange(Exchange $exchange): Exchange
    {
        $exchange->update(['status' => 'completed']);
        return $exchange;
    }

    public function cancelExchange(Exchange $exchange): Exchange
    {
        $exchange->update(['status' => 'cancelled']);
        return $exchange;
    }

    public function getExchangeById(int $id): ?Exchange
    {
        return Exchange::with(['skill', 'learner', 'teacher', 'messages', 'reviews'])
            ->find($id);
    }

    public function getLearnerExchanges(User $learner, int $perPage = 15)
    {
        return $learner->learnerExchanges()
            ->with(['skill', 'teacher'])
            ->paginate($perPage);
    }

    public function getTeacherExchanges(User $teacher, int $perPage = 15)
    {
        return $teacher->teacherExchanges()
            ->with(['skill', 'learner'])
            ->paginate($perPage);
    }
}
