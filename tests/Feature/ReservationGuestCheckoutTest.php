<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationGuestCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_individual_guest_checkout_times_are_preserved_when_reservation_is_checked_out(): void
    {
        // Create a reservation with a main guest and companion
        $reservation = Reservation::create([
            'booker_name' => 'Maria Santos',
            'phone' => '09171234567',
            'email' => 'maria@example.com',
            'reservation_date' => now()->toDateString(),
            'check_in' => now()->toDateString(),
            'number_of_guests' => 2,
            'status' => 'Checked In',
            'total_amount' => 1000,
            'amount_paid' => 500,
            'remaining_balance' => 500,
            'payment_status' => 'Partially Paid',
        ]);

        // Create main guest
        $mainGuest = Customer::create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'age' => 28,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $mainGuest->id,
            'is_primary_guest' => true,
        ]);

        // Create companion guest
        $companion = Customer::create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'age' => 30,
            'gender' => 'Male',
            'nationality' => 'American',
            'is_foreigner' => true,
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $companion->id,
            'is_primary_guest' => false,
        ]);

        // Check out main guest at 10:12 PM
        $mainGuestRecord = ReservationGuest::where('reservation_id', $reservation->id)
            ->where('is_primary_guest', true)
            ->first();

        $mainGuestCheckOutTime = now()->subMinutes(3); // Simulating 10:12 PM
        $mainGuestRecord->update(['checked_out_at' => $mainGuestCheckOutTime]);

        // Verify main guest has their checkout time
        $this->assertNotNull($mainGuestRecord->fresh()->checked_out_at);
        $this->assertEquals(
            \Carbon\Carbon::parse($mainGuestCheckOutTime)->toDateTimeString(),
            \Carbon\Carbon::parse($mainGuestRecord->fresh()->checked_out_at)->toDateTimeString()
        );

        // Check out companion at 10:15 PM (current time)
        $companionRecord = ReservationGuest::where('reservation_id', $reservation->id)
            ->where('is_primary_guest', false)
            ->first();

        $companionRecord->update(['checked_out_at' => now()]);

        // Now check out the reservation (this should only affect guests without checked_out_at)
        // Since all guests are already checked out, their times should NOT change
        $this->actingAsStaff();
        $response = $this->postJson("/staff/reservations/{$reservation->id}/check-out");

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Verify main guest's checkout time is PRESERVED (not overwritten)
        $mainGuestFresh = $mainGuestRecord->fresh();
        $this->assertNotNull($mainGuestFresh->checked_out_at);
        $this->assertEquals(
            \Carbon\Carbon::parse($mainGuestCheckOutTime)->toDateTimeString(),
            \Carbon\Carbon::parse($mainGuestFresh->checked_out_at)->toDateTimeString(),
            'Main guest checkout time should be preserved'
        );

        // Verify companion's checkout time is PRESERVED
        $companionFresh = $companionRecord->fresh();
        $this->assertNotNull($companionFresh->checked_out_at);
    }

    public function test_only_unchecked_guests_are_updated_when_reservation_is_checked_out(): void
    {
        // Create a reservation with one main guest and one companion
        $reservation = Reservation::create([
            'booker_name' => 'Maria Santos',
            'phone' => '09171234567',
            'email' => 'maria@example.com',
            'reservation_date' => now()->toDateString(),
            'check_in' => now()->toDateString(),
            'number_of_guests' => 2,
            'status' => 'Checked In',
            'total_amount' => 1000,
            'amount_paid' => 500,
            'remaining_balance' => 500,
            'payment_status' => 'Partially Paid',
        ]);

        $mainGuest = Customer::create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'age' => 28,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $mainGuest->id,
            'is_primary_guest' => true,
        ]);

        $companion = Customer::create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'age' => 30,
            'gender' => 'Male',
            'nationality' => 'American',
            'is_foreigner' => true,
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $companion->id,
            'is_primary_guest' => false,
        ]);

        // Main guest has already checked out
        $mainGuestRecord = ReservationGuest::where('reservation_id', $reservation->id)
            ->where('is_primary_guest', true)
            ->first();
        $mainGuestCheckOutTime = now()->subHours(1);
        $mainGuestRecord->update(['checked_out_at' => $mainGuestCheckOutTime]);

        // Companion has NOT checked out yet
        $companionRecord = ReservationGuest::where('reservation_id', $reservation->id)
            ->where('is_primary_guest', false)
            ->first();

        $this->assertNull($companionRecord->checked_out_at);

        // Check out the reservation
        $this->actingAsStaff();
        $this->postJson("/staff/reservations/{$reservation->id}/check-out");

        // Verify main guest's time is NOT changed
        $mainGuestFresh = $mainGuestRecord->fresh();
        $this->assertEquals(
            \Carbon\Carbon::parse($mainGuestCheckOutTime)->toDateTimeString(),
            \Carbon\Carbon::parse($mainGuestFresh->checked_out_at)->toDateTimeString()
        );

        // Verify companion NOW has a checkout time
        $companionFresh = $companionRecord->fresh();
        $this->assertNotNull($companionFresh->checked_out_at);
    }

    private function actingAsStaff()
    {
        session(['auth_user' => ['id' => 1, 'role' => 'staff']]);
    }
}
