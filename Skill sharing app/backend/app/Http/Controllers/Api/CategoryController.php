<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $categories = Category::all();

            return response()->json([
                'success' => true,
                'message' => 'Categories retrieved successfully',
                'data' => CategoryResource::collection($categories),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories: ' . $e->getMessage(),
            ], 400);
        }
    }
}
