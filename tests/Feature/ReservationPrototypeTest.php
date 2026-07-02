<?php

namespace Tests\Feature;

use App\Mail\ReservationQrMail;
use App\Models\Amenity;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ReservationPrototypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_sample_amenities_when_none_exist(): void
    {
        $response = $this->get('/reservation');

        $response->assertOk();
        $response->assertSee('Cottage A');
        $this->assertDatabaseCount('amenities', 6);
    }

    public function test_it_creates_a_reservation_and_reservation_amenity_when_the_prototype_form_is_submitted(): void
    {
        Amenity::create([
            'id' => 'amenity-1',
            'amenities_name' => 'Picnic Area',
            'daytime_price' => '500',
            'nighttime_price' => '700',
            'daytime_aircon_price' => '800',
            'nighttime_aircon_price' => '900',
            'additional_per_head' => '100',
            'minimum_capacity' => '10',
            'maximum_capacity' => '20',
            'description' => 'Test amenity',
            'image' => null,
            'status' => true,
        ]);

        $response = $this->postJson('/reservation/prototype', [
            'booker_name' => 'Maria Santos',
            'phone' => '09171234567',
            'email' => 'maria@example.com',
            'number_of_guests' => 12,
            'amenity_id' => 'amenity-1',
            'pricing_type' => 'Daytime Aircon',
            'price_at_booking' => 800,
            'check_in' => '2026-07-02',
            'check_out' => '2026-07-03',
            'slot' => 'Daytime',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('reservations', [
            'booker_name' => 'Maria Santos',
            'payment_status' => 'Partially Paid',
            'status' => 'Pending',
        ]);

        $this->assertDatabaseHas('reservation_amenities', [
            'amenity_id' => 'amenity-1',
            'pricing_type' => 'Daytime Aircon',
            'price_at_booking' => 800.00,
        ]);

        $this->assertDatabaseCount('reservations', 1);
    }

    public function test_it_sends_a_reservation_qr_email_with_an_embedded_qr_image(): void
    {
        Mail::fake();

        Amenity::create([
            'id' => 'amenity-1',
            'amenities_name' => 'Picnic Area',
            'daytime_price' => '500',
            'nighttime_price' => '700',
            'daytime_aircon_price' => '800',
            'nighttime_aircon_price' => '900',
            'additional_per_head' => '100',
            'minimum_capacity' => '10',
            'maximum_capacity' => '20',
            'description' => 'Test amenity',
            'image' => null,
            'status' => true,
        ]);

        $this->postJson('/reservation/prototype', [
            'booker_name' => 'Maria Santos',
            'phone' => '09171234567',
            'email' => 'maria@example.com',
            'number_of_guests' => 12,
            'amenity_id' => 'amenity-1',
            'pricing_type' => 'Daytime Aircon',
            'price_at_booking' => 800,
            'check_in' => '2026-07-02',
            'check_out' => '2026-07-03',
            'slot' => 'Daytime',
        ]);

        Mail::assertSent(ReservationQrMail::class, function (ReservationQrMail $mail): bool {
            $html = $mail->render();

            return str_contains($html, 'api.qrserver.com')
                && str_contains($html, 'Hinaguan Nature Park');
        });
    }
}
