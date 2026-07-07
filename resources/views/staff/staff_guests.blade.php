<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Guest Management — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">
    @vite([
        'resources/css/app.css',
        'resources/components/css_js/header.css',
        'resources/components/css_js/sidemenu.css',
        'resources/css/staff_css/staff_dashboard.css',
        'resources/css/staff_css/staff_guests.css',
        'resources/components/css_js/header.js',
        'resources/components/css_js/sidemenu.js',
        'resources/js/staff_js/staff_guests.js',
    ])
</head>
<body class="antialiased">
    <div class="dash-layout">
        <x-staff-sidemenu active="guests" />

        <div class="dash-main">
            <x-header
                title="Guest Management"
                subtitle="View and manage guest records from the customer table"
                userName="Staff User"
                userRole="Staff"
                :settingsUrl="route('staff.settings')"
            />

            <main class="dash-content">
                <section class="dash-panel guest-panel">
                    <div class="dash-panel__head guest-panel__head">
                        <div>
                            <h3 class="dash-panel__title">Registered Guests</h3>
                            <p class="dash-panel__subtitle">Customer records stored in the system</p>
                        </div>
                        <a href="#" class="guest-panel__button" data-open-add-guest-modal="true">Add Guest</a>
                    </div>

                    @if (session('success'))
                        <div class="guest-alert">{{ session('success') }}</div>
                    @endif

                    <div class="guest-table-wrap" id="guestTableWrap">
                        <table class="guest-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                    <th>Nationality</th>
                                    <th>Reservation Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($customers as $customer)
                                    @php
                                        $reservationEntry = $customer->reservationGuests->first(function ($guest) {
                                            return $guest->reservation && $guest->reservation->reservation_type === 'walk_in';
                                        }) ?? $customer->reservationGuests->first();
                                        $reservationType = $reservationEntry?->reservation?->reservation_type;
                                        $reservationTypeLabel = $reservationType === 'walk_in' ? 'walk-in' : ($reservationType ?? 'N/A');
                                    @endphp
                                    <tr
                                        class="guest-row"
                                        data-customer-id="{{ $customer->id }}"
                                        data-age="{{ $customer->age ?? 'N/A' }}"
                                        data-gender="{{ $customer->gender ?? 'N/A' }}"
                                        data-nationality="{{ $customer->nationality ?? 'N/A' }}"
                                        data-reservation-type="{{ $reservationTypeLabel }}"
                                        tabindex="0"
                                        role="button"
                                        aria-label="View details for {{ trim(($customer->first_name ?? '') . ' ' . ($customer->middle_name ?? '') . ' ' . ($customer->last_name ?? '')) }}"
                                    >
                                        <td>
                                            <div class="guest-name">{{ trim(($customer->first_name ?? '') . ' ' . ($customer->middle_name ?? '') . ' ' . ($customer->last_name ?? '')) }}</div>
                                            <div class="guest-meta">Customer ID: {{ $customer->id }}</div>
                                        </td>
                                        <td>{{ $customer->age ?? 'N/A' }}</td>
                                        <td>{{ $customer->gender ?? 'N/A' }}</td>
                                        <td>{{ $customer->nationality ?? 'N/A' }}</td>
                                        <td>{{ $reservationTypeLabel }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="guest-empty">No customer records found.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </section>

                <div class="guest-modal" id="guestModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-modal="true"></div>
                    <div class="guest-modal__content" role="dialog" aria-modal="true" aria-labelledby="guestModalTitle">
                        <button type="button" class="guest-modal__close" data-close-modal="true" aria-label="Close details">&times;</button>
                        <div class="guest-modal__header">
                            <h3 id="guestModalTitle" class="guest-modal__title">Guest Details</h3>
                            <span id="guestModalRole" class="guest-modal__role-badge"></span>
                        </div>
                        <div id="guestModalBody" class="guest-modal__body"></div>
                    </div>
                </div>
                <div class="guest-modal guest-modal--add" id="addGuestModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-add-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--wide" role="dialog" aria-modal="true" aria-labelledby="addGuestModalTitle">
                        <button type="button" class="guest-modal__close" data-close-add-modal="true" aria-label="Close add guest form">&times;</button>
                        <h3 id="addGuestModalTitle" class="guest-modal__title">Add Guest Reservation</h3>
                        <form id="addGuestForm" class="guest-form" action="{{ route('staff.guests.store') }}" method="POST">
                            @csrf
                            <div class="guest-form__group">
                                <label class="guest-form__label">Guest mode</label>
                                <div class="guest-form__chips">
                                    <label class="guest-form__chip">
                                        <input type="radio" name="guest_mode" value="with_primary" checked>
                                        <span>With primary guest</span>
                                    </label>
                                    <label class="guest-form__chip">
                                        <input type="radio" name="guest_mode" value="visitors_only">
                                        <span>Visitors only</span>
                                    </label>
                                </div>
                            </div>

                            <div class="guest-form__row">
                                <label class="guest-form__field">
                                    <span>Reservation type</span>
                                    <select name="reservation_type" required>
                                        <option value="online">Online</option>
                                        <option value="walk_in">Walk-in</option>
                                    </select>
                                </label>
                            </div>

                            <div class="guest-form__row">
                                <label class="guest-form__field">
                                    <span>Check-in</span>
                                    <input type="date" name="check_in" value="{{ now()->toDateString() }}" required>
                                </label>
                                <label class="guest-form__field">
                                    <span>Check-out</span>
                                    <input type="date" name="check_out" value="{{ now()->addDay()->toDateString() }}" required>
                                </label>
                            </div>

                            <label class="guest-form__toggle">
                                <input type="checkbox" name="is_checked_in" value="1">
                                <span>Mark reservation as checked in</span>
                            </label>

                            <div id="primaryGuestSection" class="guest-form__section">
                                <div class="guest-form__section-header">
                                    <h4 class="guest-form__section-title">Primary guest</h4>
                                </div>
                                <div class="guest-form__row guest-form__row--three">
                                    <label class="guest-form__field">
                                        <span>First name</span>
                                        <input type="text" name="primary_guest[first_name]" placeholder="First name">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Middle name</span>
                                        <input type="text" name="primary_guest[middle_name]" placeholder="Middle name">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Last name</span>
                                        <input type="text" name="primary_guest[last_name]" placeholder="Last name">
                                    </label>
                                </div>
                                <div class="guest-form__row guest-form__row--three">
                                    <label class="guest-form__field">
                                        <span>Age</span>
                                        <input type="number" name="primary_guest[age]" min="0" placeholder="Age">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Gender</span>
                                        <select name="primary_guest[gender]">
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Nationality</span>
                                        <input type="text" name="primary_guest[nationality]" placeholder="Nationality">
                                    </label>
                                </div>
                                <div class="guest-form__row guest-form__row--two">
                                    <label class="guest-form__field">
                                        <span>Phone</span>
                                        <input type="text" name="primary_guest[phone]" placeholder="Phone number">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Email</span>
                                        <input type="email" name="primary_guest[email]" placeholder="Email address">
                                    </label>
                                </div>
                            </div>

                            <div class="guest-form__section">
                                <div class="guest-form__section-header">
                                    <h4 class="guest-form__section-title">Companions</h4>
                                    <button type="button" class="guest-form__secondary" id="addCompanionBtn">+ Add Companion</button>
                                </div>
                                <div id="companionList" class="guest-companion-list"></div>
                                <div id="companionHiddenFields"></div>
                            </div>

                            <div class="guest-form__section">
                                <div class="guest-form__section-header">
                                    <h4 class="guest-form__section-title">Amenities</h4>
                                    <button type="button" class="guest-form__secondary" id="chooseAmenitiesBtn">Choose Amenities</button>
                                </div>
                                <div id="selectedAmenitiesContainer"></div>
                                <div class="guest-form__summary">
                                    <span>Total</span>
                                    <strong id="reservationTotal">₱0.00</strong>
                                </div>
                                <input type="hidden" name="total_amount" id="totalAmountInput" value="0">
                            </div>

                            <div class="guest-form__actions">
                                <button type="button" class="guest-form__secondary" data-close-add-modal="true">Cancel</button>
                                <button type="submit" class="guest-form__button">Create Reservation</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="guest-modal guest-modal--compact" id="amenityModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-amenity-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--compact" role="dialog" aria-modal="true" aria-labelledby="amenityModalTitle">
                        <button type="button" class="guest-modal__close" data-close-amenity-modal="true" aria-label="Close amenity selection">&times;</button>
                        <h3 id="amenityModalTitle" class="guest-modal__title">Choose Amenities</h3>
                        <div class="guest-form__amenities" id="amenitiesContainer">
                            @forelse ($amenities as $amenity)
                                <label class="guest-amenity-option">
                                    <input type="checkbox" class="amenity-checkbox" value="{{ $amenity->id }}" data-amenity-id="{{ $amenity->id }}" data-amenity-name="{{ $amenity->amenities_name }}">
                                    <span class="guest-amenity-option__body">
                                        <strong>{{ $amenity->amenities_name }}</strong>
                                        <small>Choose a pricing option</small>
                                    </span>
                                    <select class="guest-amenity-option__select" disabled>
                                        @if ($amenity->daytime_price !== null)
                                            <option value="Daytime" data-price="{{ $amenity->daytime_price }}">Daytime — ₱{{ number_format($amenity->daytime_price, 2) }}</option>
                                        @endif
                                        @if ($amenity->nighttime_price !== null)
                                            <option value="Nighttime" data-price="{{ $amenity->nighttime_price }}">Nighttime — ₱{{ number_format($amenity->nighttime_price, 2) }}</option>
                                        @endif
                                        @if ($amenity->daytime_aircon_price !== null)
                                            <option value="Daytime Aircon" data-price="{{ $amenity->daytime_aircon_price }}">Daytime Aircon — ₱{{ number_format($amenity->daytime_aircon_price, 2) }}</option>
                                        @endif
                                        @if ($amenity->nighttime_aircon_price !== null)
                                            <option value="Nighttime Aircon" data-price="{{ $amenity->nighttime_aircon_price }}">Nighttime Aircon — ₱{{ number_format($amenity->nighttime_aircon_price, 2) }}</option>
                                        @endif
                                    </select>
                                </label>
                            @empty
                                <p class="guest-empty">No active amenities are available yet.</p>
                            @endforelse
                        </div>
                        <div class="guest-form__actions" style="margin-top:0.85rem;">
                            <button type="button" class="guest-form__secondary" data-close-amenity-modal="true">Done</button>
                        </div>
                    </div>
                </div>

                <div class="guest-modal guest-modal--compact" id="companionModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-companion-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--compact" role="dialog" aria-modal="true" aria-labelledby="companionModalTitle">
                        <button type="button" class="guest-modal__close" data-close-companion-modal="true" aria-label="Close companion form">&times;</button>
                        <h3 id="companionModalTitle" class="guest-modal__title">Add Companion</h3>
                        <form id="companionForm" class="guest-form guest-form--compact">
                            <div class="guest-form__row guest-form__row--three">
                                <label class="guest-form__field">
                                    <span>First name</span>
                                    <input type="text" name="first_name" placeholder="First name">
                                </label>
                                <label class="guest-form__field">
                                    <span>Middle name</span>
                                    <input type="text" name="middle_name" placeholder="Middle name">
                                </label>
                                <label class="guest-form__field">
                                    <span>Last name</span>
                                    <input type="text" name="last_name" placeholder="Last name">
                                </label>
                            </div>
                            <div class="guest-form__row guest-form__row--three">
                                <label class="guest-form__field">
                                    <span>Age</span>
                                    <input type="number" name="age" min="0" placeholder="Age">
                                </label>
                                <label class="guest-form__field">
                                    <span>Gender</span>
                                    <select name="gender">
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </label>
                                <label class="guest-form__field">
                                    <span>Nationality</span>
                                    <input type="text" name="nationality" placeholder="Nationality">
                                </label>
                            </div>
                            <div class="guest-form__row guest-form__row--two">
                                <label class="guest-form__field">
                                    <span>Phone</span>
                                    <input type="text" name="phone" placeholder="Phone number">
                                </label>
                                <label class="guest-form__field">
                                    <span>Email</span>
                                    <input type="email" name="email" placeholder="Email address">
                                </label>
                            </div>
                            <div class="guest-form__actions">
                                <button type="button" class="guest-form__secondary" data-close-companion-modal="true">Cancel</button>
                                <button type="submit" class="guest-form__button">Done</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>
    <script>
        window.staffGuestData = @json($guestData ?? []);
    </script>
</body>
</html>
