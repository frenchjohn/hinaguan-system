<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationDateTimeTest extends TestCase
{
    use RefreshDatabase;

    public function test_reservation_creation_and_checkout_store_full_datetime_values(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 7, 13, 14, 30, 45));

        $reservation = Reservation::create([
            'booker_name' => 'Jane Doe',
            'phone' => '09171234567',
            'email' => 'jane@example.com',
            'reservation_date' => now()->toDateTimeString(),
            'check_in' => null,
            'number_of_guests' => 2,
            'status' => 'Pending',
            'total_amount' => 500,
            'amount_paid' => 250,
            'remaining_balance' => 250,
            'payment_status' => 'Partially Paid',
        ]);

        $this->assertNotNull($reservation->reservation_date);
        $this->assertSame('2026-07-13 14:30:45', $reservation->reservation_date->format('Y-m-d H:i:s'));
        $this->assertNull($reservation->check_in);

        $customer = Customer::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '09181234567',
            'age' => 30,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
        ]);
        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $customer->id,
            'is_primary_guest' => true,
        ]);

        $checkoutResponse = $this->withSession(['auth_user' => ['role' => 'staff']])
            ->postJson(route('staff.reservations.checkout', ['reservation' => $reservation->id]));

        $checkoutResponse->assertOk();
        $reservation->refresh();
        $this->assertNotNull($reservation->check_out);
        $this->assertSame('2026-07-13 14:30:45', $reservation->check_out->format('Y-m-d H:i:s'));
    }
}
