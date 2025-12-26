<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'bio',
        'avatar_url',
        'rating',
        'total_reviews',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /* email for verification.*/
    public function getEmailForVerification()
    {
        return $this->email;
    }

    /*verified email address.*/
    public function hasVerifiedEmail()
    {
        return null !== $this->email_verified_at;
    }

    /* email verified.*/
    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /*email verification notification.*/
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\EmailVerificationNotification());
    }

    // relations

    public function skills()
    {
        return $this->hasMany(Skill::class, 'teacher_id');
    }

    public function learnerExchanges()
    {
        return $this->hasMany(Exchange::class, 'learner_id');
    }

    public function teacherExchanges()
    {
        return $this->hasMany(Exchange::class, 'teacher_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }
}