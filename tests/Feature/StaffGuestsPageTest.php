<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffGuestsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_guests_page_lists_customers(): void
    {
        $customer = Customer::create([
            'first_name' => 'Maria',
            'middle_name' => 'Clara',
            'last_name' => 'Santos',
            'age' => 29,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
            'phone' => '09171234567',
            'email' => 'maria@example.com',
        ]);

        $response = $this->withSession([
            'auth_user' => [
                'id' => 1,
                'name' => 'Staff User',
                'email' => 'staff@example.com',
                'role' => 'staff',
            ],
        ])->get(route('staff.records'));

        $response->assertOk()
            ->assertSee('Records')
            ->assertSee($customer->first_name)
            ->assertSee($customer->last_name);
    }
}
