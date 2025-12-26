<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'bio' => $this->bio,
            'avatar_url' => $this->avatar_url,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'created_at' => $this->created_at,
        ];
    }
}
