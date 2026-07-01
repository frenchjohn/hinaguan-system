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
        <section class="rp-filterbar">
            <div class="rp-filterbar__copy">
                <span class="rp-label">Reservations</span>
                <h1 class="rp-title">Choose a date and filter amenities</h1>
                <p class="rp-desc">View image cards, then tap any amenity to see details in a modal.</p>
            </div>
            <div class="rp-filterbar__controls">
                <div class="rp-date-card">
                    <span class="rp-date-card__label">Reservation date</span>
                    <div class="rp-date-card__picker">
                        <input id="reservation_date" name="reservation_date" type="date" min="{{ now()->toDateString() }}" value="{{ now()->toDateString() }}">
                        <span id="reservationDay" class="rp-date-card__day">{{ now()->format('l') }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="rp-subfilters">
            <div class="rp-subfilters__control">
                <label for="filterType">Filter by</label>
                <select id="filterType">
                    <option value="all">All amenities</option>
                    <option value="capacity">Capacity range</option>
                    <option value="price">Price range</option>
                </select>
            </div>
            <div class="rp-subfilters__control">
                <label for="filterMin">Minimum</label>
                <input id="filterMin" type="number" min="0" placeholder="Min" disabled>
            </div>
            <div class="rp-subfilters__control">
                <label for="filterMax">Maximum</label>
                <input id="filterMax" type="number" min="0" placeholder="Max" disabled>
            </div>
        </section>

        <section class="rp-grid">
            @if($amenities->isEmpty())
                <div class="rp-empty">
                    <p>No amenities are available right now. Please check back later.</p>
                </div>
            @else
                <div class="rp-grid__list" id="amenityGrid">
                    @foreach($amenities as $amenity)
                        @php
                            $minPrice = collect([$amenity->daytime_price, $amenity->nighttime_price])->filter()->min();
                            $maxPrice = collect([$amenity->daytime_price, $amenity->nighttime_price])->filter()->max();
                        @endphp
                        <article class="rp-card" data-name="{{ $amenity->amenities_name }}" data-min-capacity="{{ $amenity->minimum_capacity }}" data-max-capacity="{{ $amenity->maximum_capacity }}" data-min-price="{{ $minPrice }}" data-max-price="{{ $maxPrice }}" data-daytime-price="{{ $amenity->daytime_price }}" data-nighttime-price="{{ $amenity->nighttime_price }}" data-additional="{{ $amenity->additional_per_head ?? '0' }}" data-description="{{ $amenity->description ?? '' }}">
                            <button type="button" class="rp-card__button" data-open-modal>
                                @if($amenity->image)
                                    <div class="rp-card__image" style="background-image:url('{{ asset('storage/' . $amenity->image) }}')"></div>
                                @else
                                    <div class="rp-card__image rp-card__image--empty"></div>
                                @endif
                                <div class="rp-card__overlay">
                                    <span>{{ $amenity->amenities_name }}</span>
                                </div>
                            </button>
                        </article>
                    @endforeach
                </div>
            @endif
        </section>

        <div class="rp-modal" id="amenityModal" aria-hidden="true">
            <div class="rp-modal__backdrop" data-close-modal></div>
            <div class="rp-modal__panel">
                <div class="rp-modal__header">
                    <div>
                        <p class="rp-modal__eyebrow">Amenity details</p>
                        <h2 id="modalName">Amenity name</h2>
                    </div>
                    <button type="button" class="rp-modal__close" data-close-modal>&times;</button>
                </div>
                <div class="rp-modal__content">
                    <div class="rp-modal__row"><span>Date:</span> <span id="modalDate"></span></div>
                    <div class="rp-modal__row"><span>Capacity:</span> <span id="modalCapacity"></span></div>
                    <div class="rp-modal__row"><span>Daytime price:</span> <span id="modalDaytime"></span></div>
                    <div class="rp-modal__row"><span>Nighttime price:</span> <span id="modalNighttime"></span></div>
                    <div class="rp-modal__row"><span>Additional:</span> <span id="modalAdditional"></span></div>
                    <p class="rp-modal__text" id="modalDescription"></p>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
