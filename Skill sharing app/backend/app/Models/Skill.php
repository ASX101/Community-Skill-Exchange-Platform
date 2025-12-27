<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'category_id',
        'title',
        'description',
        'level',
        'duration',
        'max_students',
        'rating',
        'total_reviews',
        'image_url',
    ];

    protected $casts = [
        'rating' => 'float',
        'max_students' => 'integer',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function exchanges()
    {
        return $this->hasMany(Exchange::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
