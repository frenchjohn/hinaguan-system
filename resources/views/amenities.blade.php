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
            <h1 class="am-title">Find an amenity by availability</h1>
            <p class="am-desc">Browse our amenities and see which dates are still open for daytime or nighttime booking.</p>
            <div class="am-actions">
                <a href="{{ route('home') }}" class="am-btn am-btn--primary">Back to Home</a>
                <a href="{{ route('reservation') }}" class="am-btn am-btn--outline">Go to booking</a>
            </div>

            <div class="am-grid">
                @foreach($amenities as $amenity)
                    @php
                        $slots = $availability[$amenity->id] ?? [];
                    @endphp
                    <article class="am-card">
                        <button type="button" class="am-card__button" data-open-availability-modal data-amenity-id="{{ $amenity->id }}" data-amenity-name="{{ $amenity->amenities_name }}" data-availability='{{ json_encode($availability[$amenity->id] ?? []) }}'>
                            @if($amenity->image)
                                <div class="am-card__image" style="background-image:url('{{ asset('storage/' . $amenity->image) }}')"></div>
                            @else
                                <div class="am-card__image am-card__image--empty"></div>
                            @endif
                            <div class="am-card__overlay">
                                <span>{{ $amenity->amenities_name }}</span>
                                <small>Available now</small>
                            </div>
                        </button>
                    </article>
                @endforeach
            </div>
        </div>
    </main>

    <div class="am-modal" id="availabilityModal" aria-hidden="true">
        <div class="am-modal__backdrop" data-close-availability-modal></div>
        <div class="am-modal__panel" role="dialog" aria-modal="true" aria-labelledby="availabilityModalTitle">
            <div class="am-modal__header">
                <div>
                    <p class="am-modal__eyebrow">Availability calendar</p>
                    <h3 id="availabilityModalTitle">Amenity availability</h3>
                </div>
                <button type="button" class="am-modal__close" data-close-availability-modal aria-label="Close availability picker">&times;</button>
            </div>
            <div class="am-modal__body">
                <div class="am-modal__slot-toggle" role="tablist" aria-label="Booking slot">
                    <button type="button" class="am-slot-btn is-active" data-slot-toggle="Daytime">Daytime</button>
                    <button type="button" class="am-slot-btn" data-slot-toggle="Nighttime">Nighttime</button>
                </div>
                <div class="am-calendar" id="availabilityCalendar"></div>
                <p class="am-modal__hint">Available dates are clickable. Unavailable dates are disabled.</p>
            </div>
        </div>
    </div>
</body>
</html>
