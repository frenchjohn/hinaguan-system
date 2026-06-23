<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\HomeController;
use App\Models\Amenity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/amenities', function () {
    return view('amenities');
})->name('amenities');

Route::get('/reservation', function () {
    return view('reservationpage');
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
});
