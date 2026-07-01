<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Models\Amenity;
use App\Models\StaffAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

    return view('reservationpage', [
        'amenities' => $amenities,
    ]);
})->name('reservation');

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
