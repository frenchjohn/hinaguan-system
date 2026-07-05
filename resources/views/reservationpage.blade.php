<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
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

        <section class="rp-slotbar" aria-label="Booking type">
            <span class="rp-slotbar__label">Booking type</span>
            <div class="rp-slotbar__buttons">
                <button type="button" class="rp-slot-btn is-active" data-slot="Daytime">Daytime</button>
                <button type="button" class="rp-slot-btn" data-slot="Nighttime">Nighttime</button>
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
            <label class="rp-multi-toggle" for="multiSelectionToggle">
                <input id="multiSelectionToggle" type="checkbox">
                <span>Multiple selection</span>
            </label>
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
                        <article class="rp-card"
                            data-amenity-id="{{ $amenity->id }}"
                            data-name="{{ $amenity->amenities_name }}"
                            data-min-capacity="{{ $amenity->minimum_capacity }}"
                            data-max-capacity="{{ $amenity->maximum_capacity }}"
                            data-min-price="{{ $minPrice }}"
                            data-max-price="{{ $maxPrice }}"
                            data-daytime-price="{{ $amenity->daytime_price }}"
                            data-nighttime-price="{{ $amenity->nighttime_price }}"
                            data-daytime-aircon-price="{{ $amenity->daytime_aircon_price ?? '' }}"
                            data-nighttime-aircon-price="{{ $amenity->nighttime_aircon_price ?? '' }}"
                            data-has-aircon="{{ (!empty($amenity->daytime_aircon_price) || !empty($amenity->nighttime_aircon_price)) ? '1' : '0' }}"
                            data-additional="{{ $amenity->additional_per_head ?? '0' }}"
                            data-description="{{ $amenity->description ?? '' }}">
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
                <div class="rp-empty" id="emptyState" style="display:none;">
                    <p>No amenities are available for the selected date and booking type.</p>
                </div>
            @endif
        </section>

        <div class="rp-floating-actions" id="selectionFloatingBar" hidden>
            <div class="rp-floating-actions__copy">
                <strong id="selectionCountLabel">0 amenities selected</strong>
                <span>Tap to review your picks</span>
            </div>
            <button type="button" id="selectionCheckoutBtn">Review selection</button>
        </div>

        <div class="rp-selection-sheet" id="selectionSheet" aria-hidden="true">
            <div class="rp-selection-sheet__backdrop" data-close-selection></div>
            <div class="rp-selection-sheet__panel">
                <div class="rp-selection-sheet__header">
                    <div>
                        <p class="rp-modal__eyebrow">Selection summary</p>
                        <h3>Your chosen amenities</h3>
                    </div>
                    <button type="button" class="rp-modal__close" data-close-selection>&times;</button>
                </div>
                <div class="rp-selection-sheet__total" id="selectionTotalBox">
                    <div class="rp-selection-sheet__math" id="selectionMathText">No items selected</div>
                    <div class="rp-selection-sheet__total-price" id="selectionTotalPrice">₱0.00</div>
                </div>
                <ul class="rp-selection-sheet__list" id="selectionSummaryList"></ul>
                <button type="button" id="selectionContinueBtn" class="rp-booking-form__button">Continue booking</button>
            </div>
        </div>

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
                    <div class="rp-modal__left">
                        <div class="rp-modal__summary">
                            <div class="rp-modal__meta">
                                <div class="rp-modal__meta-item"><span>Date</span><strong id="modalDate"></strong></div>
                                <div class="rp-modal__meta-item"><span>Type</span><strong id="modalSlot"></strong></div>
                                <div class="rp-modal__meta-item"><span>Capacity</span><strong id="modalCapacity"></strong></div>
                            </div>
                            <div class="rp-modal__pricebox">
                                <span id="modalPriceLabel">Price</span>
                                <strong id="modalPriceValue">₱0.00</strong>
                                <p id="modalPriceHint"></p>
                            </div>
                            <div id="airconChoice" class="rp-modal__aircon"></div>
                            <p class="rp-modal__text" id="modalDescription"></p>
                        </div>
                    </div>
                    <div class="rp-modal__right">
                        <form class="rp-booking-form is-hidden" id="bookingForm">
                            <h3>Guest reservation</h3>
                            <label>
                                Booker name
                                <input type="text" name="booker_name" placeholder="Enter booker name" required>
                            </label>
                            <label>
                                Phone
                                <input type="tel" name="phone" placeholder="Enter phone number" required>
                            </label>
                            <label>
                                Email
                                <input type="email" name="email" placeholder="Enter email address" required>
                            </label>
                            <label>
                                Number of guests
                                <input type="number" name="number_of_guests" min="1" required>
                            </label>
                            <button type="submit" class="rp-booking-form__button">Reserve prototype</button>
                            <p class="rp-booking-form__message" id="bookingNotice"></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="rp-modal" id="multiAirconModal" aria-hidden="true">
            <div class="rp-modal__backdrop" data-close-multi-aircon-modal></div>
            <div class="rp-modal__panel rp-modal__panel--compact">
                <div class="rp-modal__header">
                    <div>
                        <p class="rp-modal__eyebrow">Multiple reservation</p>
                        <h2 id="multiAirconName">Amenity name</h2>
                    </div>
                    <button type="button" class="rp-modal__close" data-close-multi-aircon-modal>&times;</button>
                </div>
                <div class="rp-modal__content rp-modal__content--stacked">
                    <div class="rp-modal__summary">
                        <div class="rp-modal__meta">
                            <div class="rp-modal__meta-item"><span>Date</span><strong id="multiAirconDate"></strong></div>
                            <div class="rp-modal__meta-item"><span>Type</span><strong id="multiAirconSlot"></strong></div>
                            <div class="rp-modal__meta-item"><span>Capacity</span><strong id="multiAirconCapacity"></strong></div>
                        </div>
                        <div class="rp-modal__pricebox">
                            <span>Package price</span>
                            <strong id="multiAirconPriceValue">₱0.00</strong>
                            <p id="multiAirconPriceHint">Choose whether this amenity will include aircon.</p>
                        </div>
                        <div id="multiAirconChoice" class="rp-modal__aircon"></div>
                        <p class="rp-modal__text" id="multiAirconDescription"></p>
                        <button type="button" id="multiAirconConfirmBtn" class="rp-booking-form__button">Confirm selection</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
