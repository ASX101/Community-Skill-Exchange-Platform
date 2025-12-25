<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Serve storage files (must be before other routes)
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    // Security check: prevent directory traversal
    $realPath = realpath($fullPath);
    $storagePath = realpath(storage_path('app/public'));
    
    if (!$realPath || strpos($realPath, $storagePath) !== 0) {
        abort(403);
    }
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    return response()->file($fullPath);
})->where('path', '.*');

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['success' => true, 'message' => 'API is running']);
});

// PUBLIC ROUTES

// Auth routes (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Password Reset
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Email Verification
Route::post('/email/resend', [VerificationController::class, 'resend'])->middleware('throttle:6,1');
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');

// Public skill/category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/search', [SkillController::class, 'search']);
Route::get('/skills/user/{userId}', [SkillController::class, 'userSkills']);
Route::get('/skills/{id}', [SkillController::class, 'show']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::get('/reviews/skill/{skillId}', [ReviewController::class, 'skillReviews']);
Route::get('/reviews/user/{userId}', [ReviewController::class, 'userReviews']);

//PROTECTED ROUTES

Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/profile', [AuthController::class, 'me']); // Alias for me()

    // User routes
    Route::post('/users/profile', [UserController::class, 'updateProfile']);

    // Skill routes (only teachers can create/update/delete)
    Route::post('/skills', [SkillController::class, 'store'])->middleware('teacher');
    Route::put('/skills/{id}', [SkillController::class, 'update'])->middleware('teacher');
    Route::delete('/skills/{id}', [SkillController::class, 'destroy'])->middleware('teacher');

    // Exchange routes
    Route::post('/exchanges', [ExchangeController::class, 'store']);
    Route::get('/exchanges', [ExchangeController::class, 'myExchanges']);
    Route::get('/exchanges/{id}', [ExchangeController::class, 'show']);
    Route::post('/exchanges/{id}/accept', [ExchangeController::class, 'accept']);
    Route::post('/exchanges/{id}/complete', [ExchangeController::class, 'complete']);
    Route::post('/exchanges/{id}/cancel', [ExchangeController::class, 'cancel']);

    // Message routes
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/exchange/{exchangeId}', [MessageController::class, 'getExchangeMessages']);
    Route::post('/messages/{messageId}/read', [MessageController::class, 'markAsRead']);
    Route::get('/messages/unread', [MessageController::class, 'getUnread']);

    // Review routes
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Bookmark routes
    Route::post('/bookmarks', [BookmarkController::class, 'store']);
    Route::delete('/bookmarks/{skillId}', [BookmarkController::class, 'destroy']);
    Route::get('/bookmarks', [BookmarkController::class, 'index']);
    Route::get('/bookmarks/check/{skillId}', [BookmarkController::class, 'check']);
});
