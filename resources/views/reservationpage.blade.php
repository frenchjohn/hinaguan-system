<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Book a Visit — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|playfair-display:600,700" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/css/reservationpage.css', 'resources/js/reservationpage.js'])
</head>
<body class="antialiased rp-page">
    <main class="rp-main">
        <div class="rp-container">
            <span class="rp-label">Reservations</span>
            <h1 class="rp-title">Book Your Visit</h1>
            <p class="rp-desc">Reservation form coming soon. Plan your trip to Hinaguan Nature Park.</p>
            <div class="rp-actions">
                <a href="{{ route('home') }}" class="rp-btn rp-btn--primary">Back to Home</a>
                <a href="{{ route('amenities') }}" class="rp-btn rp-btn--outline">View Amenities</a>
            </div>
        </div>
    </main>
</body>
</html>
