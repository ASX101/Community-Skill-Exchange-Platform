<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'reviewee' => new UserResource($this->whenLoaded('reviewee')),
            'skill' => new SkillResource($this->whenLoaded('skill')),
            'created_at' => $this->created_at,
        ];
    }
}
