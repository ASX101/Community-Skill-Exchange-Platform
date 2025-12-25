<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(private MessageService $messageService) {}

    public function store(CreateMessageRequest $request): JsonResponse
    {
        try {
            $message = $this->messageService->sendMessage($request->user(), $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => new MessageResource($message->load(['sender', 'receiver'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function getExchangeMessages(int $exchangeId, Request $request): JsonResponse
    {
        try {
            $exchange = \App\Models\Exchange::findOrFail($exchangeId);

            $user = $request->user();
            if ($exchange->learner_id !== $user->id && $exchange->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $perPage = $request->get('per_page', 20);
            $messages = $this->messageService->getExchangeMessages($exchange, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'Messages retrieved successfully',
                'data' => MessageResource::collection($messages),
                'pagination' => [
                    'total' => $messages->total(),
                    'per_page' => $messages->perPage(),
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve messages: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function markAsRead(int $messageId): JsonResponse
    {
        try {
            $message = Message::findOrFail($messageId);

            if ($message->receiver_id !== auth()->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $message = $this->messageService->markAsRead($message);

            return response()->json([
                'success' => true,
                'message' => 'Message marked as read',
                'data' => new MessageResource($message),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark message as read: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function getUnread(Request $request): JsonResponse
    {
        try {
            $messages = $this->messageService->getUnreadMessages($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Unread messages retrieved successfully',
                'data' => MessageResource::collection($messages),
                'count' => $messages->count(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve unread messages: ' . $e->getMessage(),
            ], 400);
        }
    }
}
