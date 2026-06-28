<?php

namespace Tests\Feature;

use App\Models\StaffAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_banned_staff_cannot_login(): void
    {
        StaffAccount::create([
            'name' => 'Banned Staff',
            'email' => 'banned@example.com',
            'password' => Hash::make('password123'),
            'ban_status' => true,
        ]);

        $response = $this->from('/park-portal')->post('/park-portal', [
            'email' => 'banned@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/park-portal');
        $response->assertSessionHas('error', 'This staff account has been banned.');
    }
}
