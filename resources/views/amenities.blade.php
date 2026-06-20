<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Amenities — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|playfair-display:600,700" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/css/amenities.css', 'resources/js/amenities.js'])
</head>
<body class="antialiased am-page">
    <main class="am-main">
        <div class="am-container">
            <span class="am-label">Amenities</span>
            <h1 class="am-title">Park Amenities</h1>
            <p class="am-desc">This page is coming soon. Check back for cottages, picnic areas, trails, and more.</p>
            <div class="am-actions">
                <a href="{{ route('home') }}" class="am-btn am-btn--primary">Back to Home</a>
                <a href="{{ route('reservation') }}" class="am-btn am-btn--outline">Book Now</a>
            </div>
        </div>
    </main>
</body>
</html>
