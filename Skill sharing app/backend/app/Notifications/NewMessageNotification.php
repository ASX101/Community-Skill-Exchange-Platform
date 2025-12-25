<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $messagesUrl = env('FRONTEND_URL', 'http://localhost:9002') . '/messages';

        return (new MailMessage)
            ->subject('New Message from ' . $this->message->sender->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a new message!')
            ->line('From: ' . $this->message->sender->name)
            ->line('Message: ' . substr($this->message->content, 0, 100) . (strlen($this->message->content) > 100 ? '...' : ''))
            ->action('View Message', $messagesUrl)
            ->line('Thank you for using SkillShare!');
    }
}
