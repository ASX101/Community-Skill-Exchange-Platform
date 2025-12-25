<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'level' => $this->level,
            'duration' => $this->duration,
            'max_students' => $this->max_students,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'image_url' => $this->image_url,
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at,
        ];
    }
}
