<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Models\Amenity;
use App\Models\Customer;
use App\Models\Reservation;
use App\Models\ReservationAmenity;
use App\Models\ReservationGuest;
use App\Models\StaffAccount;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Mail\ReservationQrMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/amenities', function () {
    return view('amenities');
})->name('amenities');

Route::get('/reservation', function () {
    $amenities = Amenity::where('status', true)
        ->orderBy('amenities_name')
        ->get();

    if ($amenities->isEmpty()) {
        $sampleAmenities = [
            ['id' => 'amenity-1', 'amenities_name' => 'Cottage A', 'daytime_price' => 500, 'nighttime_price' => 700, 'daytime_aircon_price' => 800, 'nighttime_aircon_price' => 900, 'additional_per_head' => 100, 'minimum_capacity' => 10, 'maximum_capacity' => 20, 'description' => 'Cozy cottage with garden view.', 'image' => null, 'status' => true],
            ['id' => 'amenity-2', 'amenities_name' => 'Cottage B', 'daytime_price' => 550, 'nighttime_price' => 750, 'daytime_aircon_price' => 850, 'nighttime_aircon_price' => 950, 'additional_per_head' => 100, 'minimum_capacity' => 12, 'maximum_capacity' => 22, 'description' => 'Spacious cottage for family gatherings.', 'image' => null, 'status' => true],
            ['id' => 'amenity-3', 'amenities_name' => 'Picnic Area', 'daytime_price' => 300, 'nighttime_price' => 450, 'daytime_aircon_price' => null, 'nighttime_aircon_price' => null, 'additional_per_head' => 50, 'minimum_capacity' => 8, 'maximum_capacity' => 15, 'description' => 'Open picnic ground near the river.', 'image' => null, 'status' => true],
            ['id' => 'amenity-4', 'amenities_name' => 'Camping Ground', 'daytime_price' => 350, 'nighttime_price' => 500, 'daytime_aircon_price' => null, 'nighttime_aircon_price' => null, 'additional_per_head' => 75, 'minimum_capacity' => 6, 'maximum_capacity' => 20, 'description' => 'Camping spot with a scenic view.', 'image' => null, 'status' => true],
            ['id' => 'amenity-5', 'amenities_name' => 'Function Hall', 'daytime_price' => 1200, 'nighttime_price' => 1600, 'daytime_aircon_price' => 1500, 'nighttime_aircon_price' => 1900, 'additional_per_head' => 120, 'minimum_capacity' => 20, 'maximum_capacity' => 50, 'description' => 'Indoor hall for events and gatherings.', 'image' => null, 'status' => true],
            ['id' => 'amenity-6', 'amenities_name' => 'Viewing Deck', 'daytime_price' => 400, 'nighttime_price' => 600, 'daytime_aircon_price' => null, 'nighttime_aircon_price' => null, 'additional_per_head' => 50, 'minimum_capacity' => 5, 'maximum_capacity' => 12, 'description' => 'A scenic viewing deck for small groups.', 'image' => null, 'status' => true],
        ];

        foreach ($sampleAmenities as $sampleAmenity) {
            Amenity::firstOrCreate(['id' => $sampleAmenity['id']], $sampleAmenity);
        }

        $amenities = Amenity::where('status', true)
            ->orderBy('amenities_name')
            ->get();
    }

    return view('reservationpage', [
        'amenities' => $amenities,
    ]);
})->name('reservation');

Route::post('/reservation/prototype', function (Request $request) {
    $data = $request->validate([
        'booker_name' => ['required', 'string', 'max:255'],
        'phone' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255'],
        'number_of_guests' => ['required', 'integer', 'min:1'],
        'check_in' => ['nullable', 'date'],
        'slot' => ['nullable', 'string'],
        'amenities' => ['required', 'array', 'min:1'],
        'amenities.*.amenity_id' => ['required', 'string'],
        'amenities.*.pricing_type' => ['required', 'string'],
        'amenities.*.price_at_booking' => ['required', 'numeric'],
    ]);

    // Calculate total from all amenities
    $totalAmount = array_sum(array_column($data['amenities'], 'price_at_booking'));

    $reservation = Reservation::create([
        'booker_name' => $data['booker_name'],
        'phone' => $data['phone'],
        'email' => $data['email'],
        'check_in' => $data['check_in'] ?? now()->toDateString(),
        'number_of_guests' => $data['number_of_guests'],
        'status' => 'Pending',
        'total_amount' => $totalAmount,
        'amount_paid' => $totalAmount * 0.5,
        'remaining_balance' => $totalAmount * 0.5,
        'payment_status' => 'Partially Paid',
    ]);

    $customer = Customer::create([
        'first_name' => $data['booker_name'],
        'middle_name' => null,
        'last_name' => '',
        'gender' => 'Male',
        'nationality' => 'Filipino',
        'is_foreigner' => false,
        'phone' => $data['phone'],
        'email' => $data['email'],
    ]);

    ReservationGuest::create([
        'reservation_id' => $reservation->id,
        'customer_id' => $customer->id,
        'is_primary_guest' => true,
    ]);

    // Create a ReservationAmenity record for each amenity
    foreach ($data['amenities'] as $amenity) {
        ReservationAmenity::create([
            'reservation_id' => $reservation->id,
            'amenity_id' => $amenity['amenity_id'],
            'pricing_type' => $amenity['pricing_type'],
            'price_at_booking' => $amenity['price_at_booking'],
            'quantity' => 1,
            'remarks' => 'Prototype reservation from reservation page. Slot: ' . ($data['slot'] ?? 'Daytime'),
        ]);
    }

    try {
        Mail::to($data['email'])->send(new ReservationQrMail($reservation));
    } catch (\Throwable $exception) {
        report($exception);
    }

    return response()->json([
        'success' => true,
        'reservation_id' => $reservation->id,
        'message' => 'Prototype reservation recorded and marked partially paid.',
    ]);
})->name('reservation.prototype')->withoutMiddleware([VerifyCsrfToken::class]);

Route::get('/reservation/check-in/{reservation}', function (Reservation $reservation) {
    $reservation->status = 'Checked In';
    $reservation->save();

    return response()->json([
        'success' => true,
        'reservation_id' => $reservation->id,
        'message' => 'Reservation checked in successfully.',
    ]);
})->name('reservation.check-in');

Route::get('/park-portal', [LoginController::class, 'show'])->name('login');
Route::post('/park-portal', [LoginController::class, 'authenticate'])->name('login.submit');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }
        return view('admin.admin_dashboard');
    })->name('dashboard');

    Route::get('/amenities', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        return view('admin.admin_amenitiesmanagement', [
            'amenities' => Amenity::orderBy('amenities_name')->get(),
        ]);
    })->name('amenities');

    Route::post('/amenities', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'amenities_name' => ['required', 'string', 'max:255'],
            'daytime_price' => ['required', 'numeric'],
            'nighttime_price' => ['required', 'numeric'],
            'daytime_aircon_price' => ['nullable', 'numeric'],
            'nighttime_aircon_price' => ['nullable', 'numeric'],
            'additional_per_head' => ['nullable', 'numeric'],
            'minimum_capacity' => ['nullable', 'numeric'],
            'maximum_capacity' => ['nullable', 'numeric'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'image', 'max:4096'],
            'status' => ['nullable', 'in:enabled,disabled'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('amenities_images', 'public');
        }

        Amenity::create([
            'id' => Str::uuid(),
            'amenities_name' => $data['amenities_name'],
            'daytime_price' => $data['daytime_price'],
            'nighttime_price' => $data['nighttime_price'],
            'daytime_aircon_price' => $data['daytime_aircon_price'] ?? null,
            'nighttime_aircon_price' => $data['nighttime_aircon_price'] ?? null,
            'additional_per_head' => $data['additional_per_head'] ?? null,
            'minimum_capacity' => $data['minimum_capacity'] ?? null,
            'maximum_capacity' => $data['maximum_capacity'] ?? null,
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => ($data['status'] ?? 'enabled') === 'enabled',
        ]);

        return redirect()->route('admin.amenities')->with('success', 'Amenity created successfully.');
    })->name('amenities.store');

    Route::put('/amenities/{amenity}', function (Request $request, Amenity $amenity) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'amenities_name' => ['required', 'string', 'max:255'],
            'daytime_price' => ['required', 'numeric'],
            'nighttime_price' => ['required', 'numeric'],
            'daytime_aircon_price' => ['nullable', 'numeric'],
            'nighttime_aircon_price' => ['nullable', 'numeric'],
            'additional_per_head' => ['nullable', 'numeric'],
            'minimum_capacity' => ['nullable', 'numeric'],
            'maximum_capacity' => ['nullable', 'numeric'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'file', 'image', 'max:4096'],
            'existing_image' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:enabled,disabled'],
        ]);

        $imagePath = $data['existing_image'] ?? $amenity->image;
        if ($request->hasFile('image')) {
            if ($amenity->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($amenity->image);
            }
            $imagePath = $request->file('image')->store('amenities_images', 'public');
        }

        $amenity->update([
            'amenities_name' => $data['amenities_name'],
            'daytime_price' => $data['daytime_price'],
            'nighttime_price' => $data['nighttime_price'],
            'daytime_aircon_price' => $data['daytime_aircon_price'] ?? null,
            'nighttime_aircon_price' => $data['nighttime_aircon_price'] ?? null,
            'additional_per_head' => $data['additional_per_head'] ?? null,
            'minimum_capacity' => $data['minimum_capacity'] ?? null,
            'maximum_capacity' => $data['maximum_capacity'] ?? null,
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => ($data['status'] ?? 'enabled') === 'enabled',
        ]);

        return redirect()->route('admin.amenities')->with('success', 'Amenity updated successfully.');
    })->name('amenities.update');

    Route::delete('/amenities/{amenity}', function (Request $request, Amenity $amenity) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        if ($amenity->image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($amenity->image);
        }

        $amenity->delete();
        return redirect()->route('admin.amenities')->with('success', 'Amenity deleted successfully.');
    })->name('amenities.destroy');

    Route::get('/users', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        return view('admin.admin_usermanagement', [
            'staffAccounts' => StaffAccount::orderBy('name')->get(),
        ]);
    })->name('users');

    Route::post('/users', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:staff_accounts,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'ban_status' => ['nullable', 'boolean'],
        ]);

        StaffAccount::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'ban_status' => (bool) ($data['ban_status'] ?? false),
        ]);

        return redirect()->route('admin.users')->with('success', 'Staff account created successfully.');
    })->name('users.store');

    Route::put('/users/{staffAccount}', function (Request $request, StaffAccount $staffAccount) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:staff_accounts,email,' . $staffAccount->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'ban_status' => ['nullable', 'boolean'],
        ]);

        $update = [
            'name' => $data['name'],
            'email' => $data['email'],
            'ban_status' => (bool) ($data['ban_status'] ?? false),
        ];

        if (! empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }

        $staffAccount->update($update);

        return redirect()->route('admin.users')->with('success', 'Staff account updated successfully.');
    })->name('users.update');

    Route::patch('/users/{staffAccount}/ban', function (Request $request, StaffAccount $staffAccount) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $staffAccount->update([
            'ban_status' => ! $staffAccount->ban_status,
        ]);

        return redirect()->route('admin.users')->with('success', $staffAccount->ban_status ? 'Staff account banned.' : 'Staff account unbanned.');
    })->name('users.toggle-ban');

    Route::delete('/users/{staffAccount}', function (Request $request, StaffAccount $staffAccount) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }

        $staffAccount->delete();

        return redirect()->route('admin.users')->with('success', 'Staff account deleted successfully.');
    })->name('users.destroy');

    Route::get('/settings', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'admin') {
            return redirect()->route('login');
        }
        return view('admin.admin_settings');
    })->name('settings');
});

Route::prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }
        return view('staff.staff_dashboard');
    })->name('dashboard');

    Route::get('/check-ins', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }

        $customers = Customer::with(['reservationGuests' => function ($query) {
            $query->with([
                'reservation' => function ($reservationQuery) {
                    $reservationQuery->with(['reservationAmenities' => function ($amenityQuery) {
                        $amenityQuery->with('amenity');
                    }, 'reservationGuests.customer']);
                },
                'customer',
            ]);
        }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $amenities = Amenity::where('status', true)
            ->orderBy('amenities_name')
            ->get();

        $guestData = $customers->mapWithKeys(function ($customer) {
            return [$customer->id => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'middle_name' => $customer->middle_name,
                'last_name' => $customer->last_name,
                'age' => $customer->age,
                'gender' => $customer->gender,
                'nationality' => $customer->nationality,
                'reservation_guests' => $customer->reservationGuests->map(function ($reservationGuest) {
                    return [
                        'id' => $reservationGuest->id,
                        'checked_out_at' => $reservationGuest->checked_out_at,
                        'is_primary_guest' => (bool) $reservationGuest->is_primary_guest,
                        'reservation' => $reservationGuest->reservation ? [
                            'id' => $reservationGuest->reservation->id,
                            'reservation_type' => $reservationGuest->reservation->reservation_type,
                            'status' => $reservationGuest->reservation->status,
                            'check_in' => $reservationGuest->reservation->check_in,
                            'booker_name' => $reservationGuest->reservation->booker_name,
                            'reservation_amenities' => $reservationGuest->reservation->reservationAmenities->map(function ($reservationAmenity) {
                                return [
                                    'pricing_type' => $reservationAmenity->pricing_type,
                                    'amenity' => [
                                        'amenities_name' => $reservationAmenity->amenity?->amenities_name,
                                    ],
                                ];
                            })->values(),
                            'reservation_guests' => $reservationGuest->reservation->reservationGuests->map(function ($guestEntry) {
                                return [
                                    'is_primary_guest' => (bool) $guestEntry->is_primary_guest,
                                    'customer' => [
                                        'first_name' => $guestEntry->customer?->first_name,
                                        'last_name' => $guestEntry->customer?->last_name,
                                    ],
                                ];
                            })->values(),
                        ] : null,
                    ];
                })->values(),
            ]];
        });

        return view('staff.staff_check_ins', compact('customers', 'guestData', 'amenities'));
    })->name('checkins');

    Route::get('/guests', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }

        $customers = Customer::with(['reservationGuests' => function ($query) {
            $query->with([
                'reservation' => function ($reservationQuery) {
                    $reservationQuery->with(['reservationAmenities' => function ($amenityQuery) {
                        $amenityQuery->with('amenity');
                    }, 'reservationGuests.customer']);
                },
                'customer',
            ]);
        }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $amenities = Amenity::where('status', true)
            ->orderBy('amenities_name')
            ->get();

        $guestData = $customers->mapWithKeys(function ($customer) {
            return [$customer->id => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'middle_name' => $customer->middle_name,
                'last_name' => $customer->last_name,
                'age' => $customer->age,
                'gender' => $customer->gender,
                'nationality' => $customer->nationality,
                'reservation_guests' => $customer->reservationGuests->map(function ($reservationGuest) {
                    return [
                        'id' => $reservationGuest->id,
                        'checked_out_at' => $reservationGuest->checked_out_at,
                        'is_primary_guest' => (bool) $reservationGuest->is_primary_guest,
                        'reservation' => $reservationGuest->reservation ? [
                            'id' => $reservationGuest->reservation->id,
                            'reservation_type' => $reservationGuest->reservation->reservation_type,
                            'status' => $reservationGuest->reservation->status,
                            'check_in' => $reservationGuest->reservation->check_in,
                            'booker_name' => $reservationGuest->reservation->booker_name,
                            'reservation_amenities' => $reservationGuest->reservation->reservationAmenities->map(function ($reservationAmenity) {
                                return [
                                    'pricing_type' => $reservationAmenity->pricing_type,
                                    'amenity' => [
                                        'amenities_name' => $reservationAmenity->amenity?->amenities_name,
                                    ],
                                ];
                            })->values(),
                            'reservation_guests' => $reservationGuest->reservation->reservationGuests->map(function ($guestEntry) {
                                return [
                                    'is_primary_guest' => (bool) $guestEntry->is_primary_guest,
                                ];
                            })->values(),
                        ] : null,
                    ];
                })->values(),
            ]];
        });

        return view('staff.staff_guests', compact('customers', 'guestData', 'amenities'));
    })->name('guests');

    Route::post('/guests', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'guest_mode' => ['required', 'in:with_primary,visitors_only'],
            'reservation_type' => ['required', 'in:walk_in,online'],
            'check_in' => ['required', 'date'],
            'primary_guest' => ['nullable', 'array'],
            'primary_guest.first_name' => ['nullable', 'string', 'max:255'],
            'primary_guest.middle_name' => ['nullable', 'string', 'max:255'],
            'primary_guest.last_name' => ['nullable', 'string', 'max:255'],
            'primary_guest.age' => ['nullable', 'integer', 'min:0'],
            'primary_guest.gender' => ['nullable', 'in:Male,Female'],
            'primary_guest.nationality_option' => ['nullable', 'in:Filipino,Foreign'],
            'primary_guest.nationality' => ['nullable', 'string', 'max:255'],
            'primary_guest.phone' => ['nullable', 'string', 'max:255'],
            'primary_guest.email' => ['nullable', 'email', 'max:255'],
            'companions' => ['nullable', 'array'],
            'companions.*.first_name' => ['required_with:companions.*.last_name', 'string', 'max:255'],
            'companions.*.middle_name' => ['nullable', 'string', 'max:255'],
            'companions.*.last_name' => ['required_with:companions.*.first_name', 'string', 'max:255'],
            'companions.*.age' => ['nullable', 'integer', 'min:0'],
            'companions.*.gender' => ['nullable', 'in:Male,Female'],
            'companions.*.nationality_option' => ['nullable', 'in:Filipino,Foreign'],
            'companions.*.nationality' => ['nullable', 'string', 'max:255'],
            'companions.*.phone' => ['nullable', 'string', 'max:255'],
            'companions.*.email' => ['nullable', 'email', 'max:255'],
            'selected_amenities' => ['nullable', 'array'],
            'selected_amenities.*.amenity_id' => ['required_with:selected_amenities.*.pricing_type', 'string'],
            'selected_amenities.*.pricing_type' => ['required_with:selected_amenities.*.amenity_id', 'in:Daytime,Nighttime,Daytime Aircon,Nighttime Aircon'],
            'selected_amenities.*.price_at_booking' => ['required_with:selected_amenities.*.amenity_id', 'numeric'],
            'total_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $primaryGuestCount = ($data['guest_mode'] === 'with_primary' && ! empty($data['primary_guest'])) ? 1 : 0;
        $companionCount = count($data['companions'] ?? []);
        $guestCount = $primaryGuestCount + $companionCount;

        $reservation = Reservation::create([
            'booker_name' => trim(($data['primary_guest']['first_name'] ?? '') . ' ' . ($data['primary_guest']['last_name'] ?? '')),
            'phone' => $data['primary_guest']['phone'] ?? '',
            'email' => $data['primary_guest']['email'] ?? '',
            'check_in' => $data['check_in'],
            'number_of_guests' => $guestCount > 0 ? $guestCount : 1,
            'reservation_type' => $data['reservation_type'],
            'status' => 'Checked In',
            'total_amount' => $data['total_amount'],
            'amount_paid' => $data['total_amount'],
            'remaining_balance' => 0,
            'payment_status' => 'Paid',
        ]);

        $primaryCustomer = null;
        if ($data['guest_mode'] === 'with_primary') {
            $primaryGuestData = $data['primary_guest'] ?? [];
            $primaryFirstName = trim((string) ($primaryGuestData['first_name'] ?? '')) ?: 'Main';
            $primaryLastName = trim((string) ($primaryGuestData['last_name'] ?? '')) ?: 'Guest';
            $primaryEmail = trim((string) ($primaryGuestData['email'] ?? '')) ?: null;
            $primaryPhone = trim((string) ($primaryGuestData['phone'] ?? '')) ?: null;

            $primaryNationality = $primaryGuestData['nationality_option'] === 'Foreign'
                ? trim((string) ($primaryGuestData['nationality'] ?? '')) ?: 'Foreign'
                : 'Filipino';
            $primaryIsForeigner = $primaryGuestData['nationality_option'] === 'Foreign';

            $primaryCustomer = Customer::firstOrCreate(
                [
                    'first_name' => $primaryFirstName,
                    'last_name' => $primaryLastName,
                    'email' => $primaryEmail,
                    'phone' => $primaryPhone,
                ],
                [
                    'first_name' => $primaryFirstName,
                    'middle_name' => $primaryGuestData['middle_name'] ?? null,
                    'last_name' => $primaryLastName,
                    'age' => $primaryGuestData['age'] ?? null,
                    'gender' => $primaryGuestData['gender'] ?? 'Male',
                    'nationality' => $primaryNationality,
                    'is_foreigner' => $primaryIsForeigner,
                    'phone' => $primaryPhone,
                    'email' => $primaryEmail,
                ]
            );
        }

        if ($primaryCustomer) {
            ReservationGuest::create([
                'reservation_id' => $reservation->id,
                'customer_id' => $primaryCustomer->id,
                'is_primary_guest' => true,
            ]);
        }

        foreach ($data['companions'] ?? [] as $companionData) {
            $companionFirstName = trim((string) ($companionData['first_name'] ?? '')) ?: 'Companion';
            $companionLastName = trim((string) ($companionData['last_name'] ?? '')) ?: 'Guest';
            $companionEmail = trim((string) ($companionData['email'] ?? '')) ?: null;
            $companionPhone = trim((string) ($companionData['phone'] ?? '')) ?: null;

            $companionNationality = $companionData['nationality_option'] === 'Foreign'
                ? trim((string) ($companionData['nationality'] ?? '')) ?: 'Foreign'
                : 'Filipino';
            $companionIsForeigner = $companionData['nationality_option'] === 'Foreign';

            $companionCustomer = Customer::firstOrCreate(
                [
                    'first_name' => $companionFirstName,
                    'last_name' => $companionLastName,
                    'email' => $companionEmail,
                    'phone' => $companionPhone,
                ],
                [
                    'first_name' => $companionFirstName,
                    'middle_name' => $companionData['middle_name'] ?? null,
                    'last_name' => $companionLastName,
                    'age' => $companionData['age'] ?? null,
                    'gender' => $companionData['gender'] ?? 'Male',
                    'nationality' => $companionNationality,
                    'is_foreigner' => $companionIsForeigner,
                    'phone' => $companionPhone,
                    'email' => $companionEmail,
                ]
            );

            ReservationGuest::create([
                'reservation_id' => $reservation->id,
                'customer_id' => $companionCustomer->id,
                'is_primary_guest' => false,
            ]);
        }

        foreach ($data['selected_amenities'] ?? [] as $selectedAmenity) {
            ReservationAmenity::create([
                'reservation_id' => $reservation->id,
                'amenity_id' => $selectedAmenity['amenity_id'],
                'pricing_type' => $selectedAmenity['pricing_type'],
                'price_at_booking' => $selectedAmenity['price_at_booking'],
                'quantity' => 1,
                'remarks' => 'Reserved from staff guest form',
            ]);
        }

        return redirect()->route('staff.checkins')->with('success', 'Guest reservation created successfully.');
    })->name('guests.store');

    Route::post('/reservation-guests/{reservationGuest}/check-out', function (Request $request, ReservationGuest $reservationGuest) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reservationGuest->update([
            'checked_out_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'checked_out_at' => $reservationGuest->checked_out_at,
        ]);
    })->name('reservation-guests.checkout');

    Route::get('/settings', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }
        return view('staff.staff_settings');
    })->name('settings');

    Route::post('/settings/update', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:staff_accounts,email,' . $user['id']],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $otp = random_int(100000, 999999);

        try {
            Mail::mailer('smtp')->send('emails.staff_settings_otp', [
                'otp' => $otp,
                'name' => $data['name'],
            ], function ($message) use ($data) {
                $message->from('parkhinaguan@gmail.com', 'Hinaguan Nature Park')
                    ->to($data['email'])
                    ->subject('Hinaguan Nature Park — Verify your profile change');
            });

            // Only store pending change after mail was sent successfully
            $request->session()->put('staff_profile_change', [
                'id' => $user['id'],
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'] ?? null,
                'otp' => $otp,
            ]);

        } catch (\Throwable $e) {
            \Log::error('OTP email failed: ' . $e->getMessage(), ['exception' => $e]);
            // Ensure we do not leave a pending change in session when send fails
            $request->session()->forget('staff_profile_change');
            $request->session()->flash('error', 'Unable to send OTP email right now.');
            return redirect()->route('staff.settings');
        }

        return redirect()->route('staff.settings')->with('success', 'A verification code has been sent to your email.');
    })->name('settings.update');

    Route::post('/settings/verify', function (Request $request) {
        $user = $request->session()->get('auth_user');
        if (! $user || $user['role'] !== 'staff') {
            return redirect()->route('login');
        }

        $pending = $request->session()->get('staff_profile_change');
        $code = $request->validate(['code' => ['required', 'digits:6']])['code'];

        if (! $pending || (string) $pending['otp'] !== (string) $code) {
            return redirect()->route('staff.settings')->with('error', 'The verification code is invalid.');
        }

        $staffAccount = StaffAccount::findOrFail($pending['id']);
        $update = [
            'name' => $pending['name'],
            'email' => $pending['email'],
        ];

        if (! empty($pending['password'])) {
            $update['password'] = Hash::make($pending['password']);
        }

        $staffAccount->update($update);

        $request->session()->forget('staff_profile_change');
        $request->session()->put('auth_user', [
            'id' => $staffAccount->id,
            'name' => $staffAccount->name,
            'email' => $staffAccount->email,
            'role' => 'staff',
        ]);

        return redirect()->route('staff.settings')->with('success', 'Your account details were updated successfully.');
    })->name('settings.verify');
});
