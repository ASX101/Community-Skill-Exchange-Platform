<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private string $resetUrl)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset Your Password')
            ->greeting('Hello!')
            ->line('You requested to reset your password. Click the link below to reset it.')
            ->action('Reset Password', $this->resetUrl)
            ->line('This link will expire in 24 hours.')
            ->line('If you did not request a password reset, you can ignore this email.')
            ->salutation('Best regards, Community SkillSwap Team');
    }
}