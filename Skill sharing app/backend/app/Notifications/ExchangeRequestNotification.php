<?php

namespace App\Notifications;

use App\Models\Exchange;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExchangeRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $exchange;

    public function __construct(Exchange $exchange)
    {
        $this->exchange = $exchange;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $exchangeUrl = env('FRONTEND_URL', 'http://localhost:9002') . '/exchanges/' . $this->exchange->id;

        return (new MailMessage)
            ->subject('New Exchange Request - ' . $this->exchange->skill->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a new skill exchange request!')
            ->line('Skill: ' . $this->exchange->skill->title)
            ->line('From: ' . $this->exchange->learner->name)
            ->action('View Request', $exchangeUrl)
            ->line('Thank you for using SkillShare!');
    }
}
