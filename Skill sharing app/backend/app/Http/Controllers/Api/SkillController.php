<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use App\Services\SkillService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SkillController extends Controller
{
    public function __construct(private SkillService $skillService) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $skills = $this->skillService->getAllSkills($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Skills retrieved successfully',
                'data' => SkillResource::collection($skills),
                'pagination' => [
                    'total' => $skills->total(),
                    'per_page' => $skills->perPage(),
                    'current_page' => $skills->currentPage(),
                    'last_page' => $skills->lastPage(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve skills: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $skill = $this->skillService->getSkillById($id);

            if (!$skill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Skill not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Skill retrieved successfully',
                'data' => new SkillResource($skill),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve skill: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function store(CreateSkillRequest $request): JsonResponse
    {
        try {
            \Log::info('=== SKILL CREATE START ===');
            \Log::info('Content-Type: ' . $request->header('Content-Type'));
            \Log::info('Request method: ' . $request->method());
            \Log::info('Has image file: ' . ($request->hasFile('image') ? 'YES' : 'NO'));
            \Log::info('Files in request: ' . json_encode(array_keys($request->allFiles())));
            \Log::info('All request data keys: ' . json_encode(array_keys($request->all())));
            
            $data = $request->validated();
            \Log::info('Validated data keys: ' . json_encode(array_keys($data)));

            // Handle image upload
            if ($request->hasFile('image')) {
                \Log::info('Image file detected!');
                $file = $request->file('image');
                \Log::info('Image details:');
                \Log::info('  - Original name: ' . $file->getClientOriginalName());
                \Log::info('  - Size: ' . $file->getSize());
                \Log::info('  - Mime: ' . $file->getMimeType());
                \Log::info('  - Is valid: ' . ($file->isValid() ? 'YES' : 'NO'));
                
                if ($file->isValid()) {
                    try {
                        \Log::info('Attempting to store image...');
                        $path = $file->store('skills', 'public');
                        \Log::info('Image stored successfully at: ' . $path);
                        $data['image_url'] = '/storage/' . $path;
                        \Log::info('Image URL set to: ' . $data['image_url']);
                    } catch (\Exception $uploadError) {
                        \Log::error('Image storage failed: ' . $uploadError->getMessage());
                        \Log::error('Trace: ' . $uploadError->getTraceAsString());
                    }
                } else {
                    \Log::error('Image file is not valid');
                }
            } else {
                \Log::info('No image file in request');
            }
            
            \Log::info('Final data to save: ' . json_encode($data));
            
            $skill = $this->skillService->createSkill($request->user(), $data);
            
            \Log::info('Skill created with ID: ' . $skill->id);
            \Log::info('Skill image_url value: ' . ($skill->image_url ?? 'NULL'));

            return response()->json([
                'success' => true,
                'message' => 'Skill created successfully',
                'data' => new SkillResource($skill->load(['teacher', 'category'])),
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Skill creation error: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create skill: ' . $e->getMessage(),
            ], 400);
        }
    }
    public function update(CreateSkillRequest $request, int $id): JsonResponse
    {
        try {
            $skill = Skill::findOrFail($id);

            if ($skill->teacher_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $data = $request->validated();
            
            // Handle image upload
            if ($request->hasFile('image')) {
                try {
                    // Delete old image if exists
                    if ($skill->image_url) {
                        $oldPath = str_replace('/storage/', '', $skill->image_url);
                        if (Storage::disk('public')->exists($oldPath)) {
                            Storage::disk('public')->delete($oldPath);
                        }
                    }

                    $path = $request->file('image')->store('skills', 'public');
                    $data['image_url'] = '/storage/' . $path;
                    \Log::info('Skill image updated to: ' . $path);
                } catch (\Exception $uploadError) {
                    \Log::error('Skill image upload failed: ' . $uploadError->getMessage());
                }
            }

            $skill = $this->skillService->updateSkill($skill, $data);

            return response()->json([
                'success' => true,
                'message' => 'Skill updated successfully',
                'data' => new SkillResource($skill->load(['teacher', 'category'])),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update skill: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        try {
            $skill = Skill::findOrFail($id);

            if ($skill->teacher_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Delete image if exists
            if ($skill->image_url) {
                $imagePath = str_replace('/storage/', '', $skill->image_url);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }

            $this->skillService->deleteSkill($skill);

            return response()->json([
                'success' => true,
                'message' => 'Skill deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete skill: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function userSkills(int $userId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $skills = $this->skillService->getTeacherSkills($userId, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'User skills retrieved successfully',
                'data' => SkillResource::collection($skills),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user skills: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $perPage = $request->get('per_page', 15);

            if (strlen($query) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query must be at least 2 characters',
                ], 400);
            }

            $skills = $this->skillService->searchSkills($query, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'Skills search completed',
                'data' => SkillResource::collection($skills),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search skills: ' . $e->getMessage(),
            ], 400);
        }
    }
}