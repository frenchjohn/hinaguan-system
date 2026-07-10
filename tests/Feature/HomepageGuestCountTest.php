<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepageGuestCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_shows_the_current_checked_in_guest_count(): void
    {
        $activeCustomer = Customer::create([
            'first_name' => 'Active',
            'middle_name' => null,
            'last_name' => 'Guest',
            'age' => 25,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
            'phone' => '09170000000',
            'email' => 'active@example.com',
        ]);

        $checkedOutCustomer = Customer::create([
            'first_name' => 'Checked',
            'middle_name' => null,
            'last_name' => 'Out',
            'age' => 30,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
            'phone' => '09170000001',
            'email' => 'checked@example.com',
        ]);

        $activeReservation = Reservation::create([
            'booker_name' => 'Active Guest',
            'phone' => '09170000000',
            'email' => 'active@example.com',
            'check_in' => now()->toDateString(),
            'number_of_guests' => 1,
            'reservation_type' => 'walk_in',
            'status' => 'Checked In',
            'total_amount' => 500,
            'amount_paid' => 500,
            'remaining_balance' => 0,
            'payment_status' => 'Paid',
        ]);

        $checkedOutReservation = Reservation::create([
            'booker_name' => 'Checked Out Guest',
            'phone' => '09170000001',
            'email' => 'checked@example.com',
            'check_in' => now()->toDateString(),
            'number_of_guests' => 1,
            'reservation_type' => 'walk_in',
            'status' => 'Checked In',
            'total_amount' => 500,
            'amount_paid' => 500,
            'remaining_balance' => 0,
            'payment_status' => 'Paid',
        ]);

        ReservationGuest::create([
            'reservation_id' => $activeReservation->id,
            'customer_id' => $activeCustomer->id,
            'is_primary_guest' => true,
            'checked_out_at' => null,
        ]);

        ReservationGuest::create([
            'reservation_id' => $checkedOutReservation->id,
            'customer_id' => $checkedOutCustomer->id,
            'is_primary_guest' => true,
            'checked_out_at' => now(),
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertViewHas('activeGuestCount', 1);
    }
}
