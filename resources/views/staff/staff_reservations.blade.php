<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Reservations — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700|playfair-display:400,500,600,700" rel="stylesheet">
    @vite([
        'resources/css/app.css',
        'resources/css/homepage.css',
        'resources/components/css_js/header.css',
        'resources/components/css_js/sidemenu.css',
        'resources/css/staff_css/staff_dashboard.css',
        'resources/css/staff_css/staff_reservations.css',
        'resources/components/css_js/header.js',
        'resources/components/css_js/sidemenu.js',
        'resources/js/staff_js/staff_reservations.js',
    ])
</head>
<body class="antialiased">
    <div class="dash-layout">
        <x-staff_sidemenu active="reservations" />

        <div class="dash-main">
            <x-header
                title="Reservations"
                subtitle="Pending online reservations waiting for check-in"
                userName="Staff User"
                userRole="Staff"
                :settingsUrl="route('staff.settings')"
            />

            <main class="dash-content">
                <section class="dash-panel guest-panel">
                    <div class="dash-panel__head guest-panel__head">
                        <div>
                            <h3 class="dash-panel__title">Pending Online Reservations</h3>
                            <p class="dash-panel__subtitle">Reservations that have not been checked in yet</p>
                        </div>
                    </div>

                    @if (session('success'))
                        <div class="guest-alert">{{ session('success') }}</div>
                    @endif

                    <div class="guest-filter-shell">
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
                            <button type="button" class="guest-filter-toggle" id="reservationFilterToggle" aria-expanded="false" aria-controls="reservationFilterPanel">
                                <span>Filters</span>
                                <span class="guest-filter-toggle__icon">▾</span>
                            </button>
                            <button type="button" class="guest-filter-toggle guest-filter-toggle--secondary" id="scanQrBtn">
                                <span>Scan QR</span>
                            </button>
                        </div>
                        <div class="guest-toolbar guest-toolbar--collapsed" id="reservationFilterPanel" hidden>
                            <label class="guest-toolbar__field guest-toolbar__field--search">
                                <span>Search</span>
                                <input type="search" id="reservationSearchInput" placeholder="Search by booker, email, phone, or status">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Sort by</span>
                                <select id="reservationSortSelect">
                                    <option value="date-asc">Reservation date (soonest)</option>
                                    <option value="date-desc">Reservation date (latest)</option>
                                    <option value="name-asc">Booker (A-Z)</option>
                                    <option value="name-desc">Booker (Z-A)</option>
                                    <option value="amount-desc">Amount (High-Low)</option>
                                </select>
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Status</span>
                                <select id="reservationStatusFilter">
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Reservation date from</span>
                                <input type="date" id="reservationDateFrom">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Reservation date to</span>
                                <input type="date" id="reservationDateTo">
                            </label>
                            <button type="button" class="guest-toolbar__clear" id="reservationFiltersClear">Clear</button>
                        </div>
                    </div>

                    <div class="guest-toolbar__meta">
                        <span id="reservationResultsCount">Showing {{ $reservations->count() }} reservation{{ $reservations->count() === 1 ? '' : 's' }}</span>
                    </div>

                    <div class="guest-table-wrap" id="reservationTableWrap">
                        <table class="guest-table">
                            <thead>
                                <tr>
                                    <th>Booker</th>
                                    <th>Reservation date</th>
                                    <th>Guests</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody id="reservationTableBody">
                                @forelse ($reservations as $reservation)
                                    <tr
                                        class="guest-row reservation-row {{ $reservation->reservation_date === now()->toDateString() ? 'today-reservation' : '' }}"
                                        data-reservation-id="{{ $reservation->id }}"
                                        data-booker-name="{{ e($reservation->booker_name) }}"
                                        data-email="{{ e($reservation->email) }}"
                                        data-phone="{{ e($reservation->phone) }}"
                                        data-reservation-date="{{ $reservation->reservation_date }}"
                                        data-status="{{ strtolower($reservation->status) }}"
                                        data-guests="{{ $reservation->number_of_guests }}"
                                        data-total-amount="{{ (float) $reservation->total_amount }}"
                                        data-search="{{ strtolower(trim(($reservation->booker_name ?? '') . ' ' . ($reservation->email ?? '') . ' ' . ($reservation->phone ?? '') . ' ' . ($reservation->status ?? ''))) }}"
                                        tabindex="0"
                                        role="button"
                                        aria-label="View reservation details for {{ e($reservation->booker_name) }}"
                                    >
                                        <td>
                                            <div class="guest-name">{{ $reservation->booker_name }}</div>
                                            <div class="guest-meta">{{ $reservation->email }}</div>
                                        </td>
                                        <td>{{ $reservation->reservation_date }}</td>
                                        <td>{{ $reservation->number_of_guests }}</td>
                                        <td>
                                            <span class="reservation-status reservation-status--{{ strtolower($reservation->status) }}">{{ $reservation->status }}</span>
                                        </td>
                                        <td>₱{{ number_format($reservation->total_amount, 2) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="guest-empty">No pending online reservations found.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </section>

                <div class="guest-modal" id="reservationModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-reservation-modal="true"></div>
                    <div class="guest-modal__content" role="dialog" aria-modal="true" aria-labelledby="reservationModalTitle">
                        <button type="button" class="guest-modal__close" data-close-reservation-modal="true" aria-label="Close reservation details">&times;</button>
                        <div class="guest-modal__header">
                            <h3 id="reservationModalTitle" class="guest-modal__title">Reservation Details</h3>
                            <span id="reservationModalStatus" class="guest-modal__role-badge"></span>
                        </div>
                        <div id="reservationModalBody" class="guest-modal__body"></div>
                    </div>
                </div>

                <div class="guest-modal guest-modal--add" id="checkInModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-check-in-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--wide" role="dialog" aria-modal="true" aria-labelledby="checkInModalTitle">
                        <button type="button" class="guest-modal__close" data-close-check-in-modal="true" aria-label="Close check-in form">&times;</button>
                        <h3 id="checkInModalTitle" class="guest-modal__title">Check In Reservation</h3>
                        <form id="checkInForm" class="guest-form" action="#">
                            <div class="guest-form__group">
                                <label class="guest-form__label">Guest mode</label>
                                <div class="guest-form__chips">
                                    <label class="guest-form__chip">
                                        <input type="radio" name="check_in_guest_mode" value="with_primary" checked>
                                        <span>With primary guest</span>
                                    </label>
                                    <label class="guest-form__chip">
                                        <input type="radio" name="check_in_guest_mode" value="visitors_only">
                                        <span>Visitors only</span>
                                    </label>
                                </div>
                            </div>

                            <div id="checkInPrimaryGuestSection" class="guest-form__section">
                                <div class="guest-form__section-header">
                                    <h4 class="guest-form__section-title">Primary guest</h4>
                                </div>
                                <div class="guest-form__row guest-form__row--three">
                                    <label class="guest-form__field">
                                        <span>First name</span>
                                        <input type="text" name="check_in_primary_guest[first_name]" placeholder="First name">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Middle name</span>
                                        <input type="text" name="check_in_primary_guest[middle_name]" placeholder="Middle name">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Last name</span>
                                        <input type="text" name="check_in_primary_guest[last_name]" placeholder="Last name">
                                    </label>
                                </div>
                                <div class="guest-form__row guest-form__row--three">
                                    <label class="guest-form__field">
                                        <span>Age</span>
                                        <input type="number" name="check_in_primary_guest[age]" min="0" placeholder="Age">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Gender</span>
                                        <select name="check_in_primary_guest[gender]">
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Nationality</span>
                                        <select name="check_in_primary_guest[nationality_option]" id="checkInPrimaryNationalityOption">
                                            <option value="Filipino" selected>Filipino</option>
                                            <option value="Foreign">Foreign</option>
                                        </select>
                                    </label>
                                    <label class="guest-form__field" id="checkInPrimaryNationalityTextField" style="display:none;">
                                        <span>Foreign type</span>
                                        <input type="text" name="check_in_primary_guest[nationality]" id="checkInPrimaryNationalityText" placeholder="e.g. American">
                                    </label>
                                </div>
                                <div class="guest-form__row guest-form__row--two">
                                    <label class="guest-form__field">
                                        <span>Phone</span>
                                        <input type="text" name="check_in_primary_guest[phone]" placeholder="Phone number">
                                    </label>
                                    <label class="guest-form__field">
                                        <span>Email</span>
                                        <input type="email" name="check_in_primary_guest[email]" placeholder="Email address">
                                    </label>
                                </div>
                            </div>

                            <div class="guest-form__section">
                                <div class="guest-form__section-header">
                                    <h4 class="guest-form__section-title">Companions</h4>
                                    <button type="button" class="guest-form__secondary" id="checkInAddCompanionBtn">+ Add Companion</button>
                                </div>
                                <div id="checkInCompanionList" class="guest-companion-list"></div>
                                <div id="checkInCompanionHiddenFields"></div>
                            </div>

                            <div class="guest-form__actions">
                                <button type="button" class="guest-form__secondary" data-close-check-in-modal="true">Cancel</button>
                                <button type="submit" class="guest-form__button">Check In</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="guest-modal guest-modal--add" id="scanQrModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-scan-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--wide" role="dialog" aria-modal="true" aria-labelledby="scanQrModalTitle">
                        <button type="button" class="guest-modal__close" data-close-scan-modal="true" aria-label="Close QR scanner">&times;</button>
                        <h3 id="scanQrModalTitle" class="guest-modal__title">Scan Reservation QR</h3>
                        <div class="guest-form__section">
                            <div id="qrScanner" class="scan-modal__scanner"></div>
                            <p class="scan-modal__hint">Allow camera access and hold the reservation QR code in front of the lens.</p>
                            <label class="guest-form__field" style="margin-top:0.75rem;">
                                <span>Camera</span>
                                <select id="qrCameraSelect" style="width:100%; padding:0.75rem 0.85rem; border:1px solid #d1d5db; border-radius:0.75rem; background:#fff;"></select>
                            </label>
                            <div class="scan-modal__status" id="qrScannerStatus">Ready to scan</div>
                        </div>
                        <div class="guest-form__actions" style="margin-top: 1rem;">
                            <button type="button" class="guest-form__secondary" data-close-scan-modal="true">Cancel</button>
                            <button type="button" class="guest-form__button" id="stopQrBtn">Stop Scanner</button>
                        </div>
                    </div>
                </div>

                <div class="guest-modal guest-modal--compact" id="checkInCompanionModal" aria-hidden="true">
                    <div class="guest-modal__backdrop" data-close-check-in-companion-modal="true"></div>
                    <div class="guest-modal__content guest-modal__content--compact" role="dialog" aria-modal="true" aria-labelledby="checkInCompanionModalTitle">
                        <button type="button" class="guest-modal__close" data-close-check-in-companion-modal="true" aria-label="Close companion form">&times;</button>
                        <h3 id="checkInCompanionModalTitle" class="guest-modal__title">Add Companion</h3>
                        <form id="checkInCompanionForm" class="guest-form" action="#">
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
                                    <select name="nationality_option" id="checkInCompanionNationalityOption">
                                        <option value="Filipino" selected>Filipino</option>
                                        <option value="Foreign">Foreign</option>
                                    </select>
                                </label>
                                <label class="guest-form__field" id="checkInCompanionNationalityTextField" style="display:none;">
                                    <span>Foreign type</span>
                                    <input type="text" name="nationality" id="checkInCompanionNationalityText" placeholder="e.g. American">
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
                                <button type="button" class="guest-form__secondary" data-close-check-in-companion-modal="true">Cancel</button>
                                <button type="submit" class="guest-form__button">Add Companion</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>
    <script>
        window.staffReservationData = @json($reservationData ?? []);
    </script>
</body>
</html>
