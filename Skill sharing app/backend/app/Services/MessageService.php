<?php

namespace App\Services;

use App\Models\Exchange;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;

class MessageService
{
    public function sendMessage(User $sender, array $data): Message
    {
        $message = Message::create([
            'exchange_id' => $data['exchange_id'],
            'sender_id' => $sender->id,
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
            'is_read' => false,
        ]);

        // Send notification to receiver
        $receiver = User::find($data['receiver_id']);
        if ($receiver) {
            $receiver->notify(new NewMessageNotification($message));
        }

        return $message;
    }

    public function getExchangeMessages(Exchange $exchange, int $perPage = 20)
    {
        return $exchange->messages()
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function markAsRead(Message $message): Message
    {
        $message->update(['is_read' => true]);
        return $message;
    }

    public function getUnreadMessages(User $receiver)
    {
        return $receiver->receivedMessages()
            ->where('is_read', false)
            ->with(['sender', 'exchange'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function markAllAsRead(User $receiver): void
    {
        $receiver->receivedMessages()
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }
}
