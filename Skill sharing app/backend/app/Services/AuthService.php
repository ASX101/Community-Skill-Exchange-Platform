<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        // Trigger email verification event
        event(new Registered($user));

        return $user;
    }

    public function login(string $email, string $password): ?User
    {
        $user = User::where('email', $email)->first();
        
        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            return null; // Return null to indicate unverified email
        }

        return $user;
    }

    public function createToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }

    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }

    public function getUserProfile(User $user): User
    {
        return $user->load(['skills', 'learnerExchanges', 'teacherExchanges']);
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);
        return $user;
    }
}
