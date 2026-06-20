<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(WeatherService $weather): View
    {
        return view('homepage', [
            'weather' => $weather->getTodayWeather(),
        ]);
    }
}
