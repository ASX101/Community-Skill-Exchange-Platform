<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateExchangeRequest;
use App\Http\Resources\ExchangeResource;
use App\Models\Exchange;
use App\Services\ExchangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExchangeController extends Controller
{
    public function __construct(private ExchangeService $exchangeService) {}

    public function store(CreateExchangeRequest $request): JsonResponse
    {
        try {
            $exchange = $this->exchangeService->createExchange(
                $request->user(),
                $request->skill_id,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Exchange created successfully',
                'data' => new ExchangeResource($exchange->load(['skill', 'learner', 'teacher'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create exchange: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $exchange = $this->exchangeService->getExchangeById($id);

            if (!$exchange) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exchange not found',
                ], 404);
            }

            $user = auth()->user();
            if ($exchange->learner_id !== $user->id && $exchange->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Exchange retrieved successfully',
                'data' => new ExchangeResource($exchange),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exchange: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function accept(int $id): JsonResponse
    {
        try {
            $exchange = Exchange::findOrFail($id);

            if ($exchange->teacher_id !== auth()->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only teacher can accept exchange',
                ], 403);
            }

            $exchange = $this->exchangeService->acceptExchange($exchange);

            return response()->json([
                'success' => true,
                'message' => 'Exchange accepted successfully',
                'data' => new ExchangeResource($exchange->load(['skill', 'learner', 'teacher'])),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept exchange: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function complete(int $id): JsonResponse
    {
        try {
            $exchange = Exchange::findOrFail($id);

            if ($exchange->teacher_id !== auth()->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only teacher can complete exchange',
                ], 403);
            }

            $exchange = $this->exchangeService->completeExchange($exchange);

            return response()->json([
                'success' => true,
                'message' => 'Exchange completed successfully',
                'data' => new ExchangeResource($exchange),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete exchange: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function cancel(int $id): JsonResponse
    {
        try {
            $exchange = Exchange::findOrFail($id);

            $user = auth()->user();
            if ($exchange->learner_id !== $user->id && $exchange->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $exchange = $this->exchangeService->cancelExchange($exchange);

            return response()->json([
                'success' => true,
                'message' => 'Exchange cancelled successfully',
                'data' => new ExchangeResource($exchange),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel exchange: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function myExchanges(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $user = $request->user();

            $learnerExchanges = $this->exchangeService->getLearnerExchanges($user, $perPage);
            $teacherExchanges = $this->exchangeService->getTeacherExchanges($user, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'Exchanges retrieved successfully',
                'data' => [
                    'learner_exchanges' => ExchangeResource::collection($learnerExchanges),
                    'teacher_exchanges' => ExchangeResource::collection($teacherExchanges),
                ],
                'pagination' => [
                    'learner_total' => $learnerExchanges->total(),
                    'teacher_total' => $teacherExchanges->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exchanges: ' . $e->getMessage(),
            ], 400);
        }
    }
}
