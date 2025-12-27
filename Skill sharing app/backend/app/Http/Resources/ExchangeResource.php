<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExchangeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'notes' => $this->notes,
            'skill' => new SkillResource($this->whenLoaded('skill')),
            'learner' => new UserResource($this->whenLoaded('learner')),
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'created_at' => $this->created_at,
        ];
    }
}
