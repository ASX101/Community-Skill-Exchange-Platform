<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'level' => ['required', 'string', 'in:beginner,intermediate,advanced'],
            'duration' => ['required', 'string'],
            'max_students' => ['required', 'integer', 'min:1'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Category is required',
            'title.required' => 'Skill title is required',
            'level.in' => 'Invalid skill level',
            'max_students.min' => 'Maximum students must be at least 1',
            'image.image' => 'File must be an image',
            'image.mimes' => 'Image must be JPEG, PNG, JPG, or GIF',
            'image.max' => 'Image must not exceed 5MB',
        ];
    }
}