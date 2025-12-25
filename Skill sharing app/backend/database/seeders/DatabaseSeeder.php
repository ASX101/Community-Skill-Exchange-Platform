<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
        ]);

        // Create test users
        User::factory()->create([
            'name' => 'John Teacher',
            'email' => 'teacher@example.com',
            'password' => 'password',
            'role' => 'teacher',
            'bio' => 'Experienced programmer and mentor',
        ]);

        User::factory()->create([
            'name' => 'Jane Learner',
            'email' => 'learner@example.com',
            'password' => 'password',
            'role' => 'learner',
            'bio' => 'Eager to learn new skills',
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'role' => 'both',
            'bio' => 'I can teach and learn',
        ]);
    }
}
