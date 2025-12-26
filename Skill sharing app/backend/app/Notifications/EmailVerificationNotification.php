<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        // Generate stateless verification link
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Email Address - Skill Share')
            ->greeting('Welcome to Skill Share!')
            ->line('Please verify your email address by clicking the button below.')
            ->action('Verify Email', $verificationUrl)
            ->line('This link will expire in 24 hours.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Best regards,\nSkill Share Team');
    }

    /**
     * Get the verification URL for the given notifiable.
     * Format: /api/email/verify/{id}/{hash}
     * Hash = sha1(email)
     */
    protected function verificationUrl($notifiable)
    {
        $hash = sha1($notifiable->getEmailForVerification());
        return url('/api/email/verify/' . $notifiable->getKey() . '/' . $hash);
    }
}