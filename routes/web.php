<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/amenities', function () {
    return view('amenities');
})->name('amenities');

Route::get('/reservation', function () {
    return view('reservationpage');
})->name('reservation');
