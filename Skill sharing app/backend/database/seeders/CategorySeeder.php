<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Programming', 'description' => 'Learn programming languages and development', 'icon' => '💻'],
            ['name' => 'Design', 'description' => 'UI/UX design and creative skills', 'icon' => '🎨'],
            ['name' => 'Music', 'description' => 'Musical instruments and music theory', 'icon' => '🎵'],
            ['name' => 'Languages', 'description' => 'Learn new languages', 'icon' => '🌍'],
            ['name' => 'Business', 'description' => 'Business and entrepreneurship skills', 'icon' => '📊'],
            ['name' => 'Fitness', 'description' => 'Fitness and health coaching', 'icon' => '💪'],
            ['name' => 'Photography', 'description' => 'Photography and videography skills', 'icon' => '📸'],
            ['name' => 'Writing', 'description' => 'Writing and content creation', 'icon' => '✍️'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
