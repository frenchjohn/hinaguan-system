<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    public function getTodayWeather(): ?array
    {
        $key = config('services.weatherapi.key');
        $location = config('services.weatherapi.location');

        if (! $key || ! $location) {
            return null;
        }

        return Cache::remember(
            'homepage_weather_'.md5($location),
            now()->addMinutes(30),
            function () use ($key, $location) {
                $response = Http::timeout(8)->get('https://api.weatherapi.com/v1/current.json', [
                    'key' => $key,
                    'q' => $location,
                ]);

                if (! $response->successful()) {
                    return null;
                }

                $data = $response->json();
                $icon = $data['current']['condition']['icon'] ?? null;

                if ($icon && ! str_starts_with($icon, 'http')) {
                    $icon = 'https:'.$icon;
                }

                return [
                    'location' => $data['location']['name'] ?? $location,
                    'region' => $data['location']['region'] ?? null,
                    'temp_c' => $data['current']['temp_c'] ?? null,
                    'feelslike_c' => $data['current']['feelslike_c'] ?? null,
                    'humidity' => $data['current']['humidity'] ?? null,
                    'condition' => $data['current']['condition']['text'] ?? null,
                    'icon' => $icon,
                ];
            }
        );
    }
}
