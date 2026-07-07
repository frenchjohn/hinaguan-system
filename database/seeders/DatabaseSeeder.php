<?php

namespace Database\Seeders;

use App\Models\AdminAccount;
use App\Models\Amenity;
use App\Models\Customer;
use App\Models\Reservation;
use App\Models\ReservationAmenity;
use App\Models\ReservationGuest;
use App\Models\StaffAccount;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        StaffAccount::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('staff1234'),
            ]
        );

        AdminAccount::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin1234'),
            ]
        );

        $mountainPicnicHut = Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Mountain Picnic Hut',
            'daytime_price' => 2500,
            'nighttime_price' => 3000,
            'daytime_aircon_price' => null,
            'nighttime_aircon_price' => null,
            'additional_per_head' => 150,
            'minimum_capacity' => 5,
            'maximum_capacity' => 15,
            'description' => 'A cozy open-air hut for small groups and family picnics.',
            'image' => null,
            'status' => true,
        ]);

        $lakefrontPavilion = Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Lakefront Pavilion',
            'daytime_price' => 4200,
            'nighttime_price' => 5200,
            'daytime_aircon_price' => null,
            'nighttime_aircon_price' => null,
            'additional_per_head' => 200,
            'minimum_capacity' => 10,
            'maximum_capacity' => 40,
            'description' => 'Ideal for weddings and larger gatherings by the lake.',
            'image' => null,
            'status' => true,
        ]);

        Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Air-conditioned Conference Hall',
            'daytime_price' => 6800,
            'nighttime_price' => 7800,
            'daytime_aircon_price' => 1200,
            'nighttime_aircon_price' => 1500,
            'additional_per_head' => 300,
            'minimum_capacity' => 20,
            'maximum_capacity' => 80,
            'description' => 'Climate-controlled space for corporate events and seminars.',
            'image' => null,
            'status' => false,
        ]);

        $gardenBbqArea = Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Garden BBQ Area',
            'daytime_price' => 3100,
            'nighttime_price' => 3600,
            'daytime_aircon_price' => null,
            'nighttime_aircon_price' => null,
            'additional_per_head' => 180,
            'minimum_capacity' => 8,
            'maximum_capacity' => 30,
            'description' => 'Open BBQ space with picnic tables and tent coverage.',
            'image' => null,
            'status' => true,
        ]);

        Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Riverfront Gazebo',
            'daytime_price' => 3600,
            'nighttime_price' => 4300,
            'daytime_aircon_price' => null,
            'nighttime_aircon_price' => null,
            'additional_per_head' => 220,
            'minimum_capacity' => 6,
            'maximum_capacity' => 25,
            'description' => 'A scenic gazebo with river views and soft lighting.',
            'image' => null,
            'status' => false,
        ]);

        $treehouseSuite = Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => 'Private Treehouse Suite',
            'daytime_price' => 9000,
            'nighttime_price' => 10800,
            'daytime_aircon_price' => 2400,
            'nighttime_aircon_price' => 2800,
            'additional_per_head' => 400,
            'minimum_capacity' => 4,
            'maximum_capacity' => 12,
            'description' => 'Exclusive elevated suite with private access and comfort amenities.',
            'image' => null,
            'status' => true,
        ]);

        $primaryCustomer = Customer::create([
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

        $companionCustomer = Customer::create([
            'first_name' => 'Rico',
            'middle_name' => null,
            'last_name' => 'Dela Cruz',
            'age' => 31,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'is_foreigner' => false,
            'phone' => '09181234567',
            'email' => 'rico@example.com',
        ]);

        $reservation = Reservation::create([
            'booker_name' => 'Maria Santos',
            'phone' => '09171234567',
            'email' => 'maria@example.com',
            'check_in' => now()->addDay()->toDateString(),
            'check_out' => now()->addDays(2)->toDateString(),
            'number_of_guests' => 2,
            'reservation_type' => 'online',
            'status' => 'Confirmed',
            'total_amount' => 7800,
            'amount_paid' => 7800,
            'remaining_balance' => 0,
            'payment_status' => 'Paid',
        ]);

        $walkInReservation = Reservation::create([
            'booker_name' => 'Rico Dela Cruz',
            'phone' => '09181234567',
            'email' => 'rico@example.com',
            'check_in' => now()->addDays(3)->toDateString(),
            'check_out' => now()->addDays(4)->toDateString(),
            'number_of_guests' => 2,
            'reservation_type' => 'walk_in',
            'status' => 'Pending',
            'total_amount' => 3100,
            'amount_paid' => 1000,
            'remaining_balance' => 2100,
            'payment_status' => 'Partially Paid',
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $primaryCustomer->id,
            'is_primary_guest' => true,
        ]);

        ReservationGuest::create([
            'reservation_id' => $reservation->id,
            'customer_id' => $companionCustomer->id,
            'is_primary_guest' => false,
        ]);

        ReservationGuest::create([
            'reservation_id' => $walkInReservation->id,
            'customer_id' => $primaryCustomer->id,
            'is_primary_guest' => true,
        ]);

        ReservationGuest::create([
            'reservation_id' => $walkInReservation->id,
            'customer_id' => $companionCustomer->id,
            'is_primary_guest' => false,
        ]);

        ReservationAmenity::create([
            'reservation_id' => $reservation->id,
            'amenity_id' => $mountainPicnicHut->id,
            'pricing_type' => 'Daytime',
            'price_at_booking' => 2500,
            'quantity' => 1,
            'remarks' => 'Reserved by primary guest Maria Santos for the party',
        ]);

        ReservationAmenity::create([
            'reservation_id' => $reservation->id,
            'amenity_id' => $lakefrontPavilion->id,
            'pricing_type' => 'Nighttime',
            'price_at_booking' => 5200,
            'quantity' => 1,
            'remarks' => 'Reserved by the primary guest for the evening event',
        ]);

        ReservationAmenity::create([
            'reservation_id' => $walkInReservation->id,
            'amenity_id' => $gardenBbqArea->id,
            'pricing_type' => 'Daytime',
            'price_at_booking' => 3100,
            'quantity' => 1,
            'remarks' => 'Reserved by the primary guest; companion is accompanying them',
        ]);
    }
}
