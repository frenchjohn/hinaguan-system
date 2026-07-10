<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Reservations — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">
    @vite([
        'resources/css/app.css',
        'resources/components/css_js/header.css',
        'resources/components/css_js/sidemenu.css',
        'resources/css/staff_css/staff_dashboard.css',
        'resources/css/staff_css/staff_guests.css',
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
                        <button type="button" class="guest-filter-toggle" id="reservationFilterToggle" aria-expanded="false" aria-controls="reservationFilterPanel">
                            <span>Filters</span>
                            <span class="guest-filter-toggle__icon">▾</span>
                        </button>
                        <div class="guest-toolbar guest-toolbar--collapsed" id="reservationFilterPanel" hidden>
                            <label class="guest-toolbar__field guest-toolbar__field--search">
                                <span>Search</span>
                                <input type="search" id="reservationSearchInput" placeholder="Search by booker, email, phone, or status">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Sort by</span>
                                <select id="reservationSortSelect">
                                    <option value="date-asc">Check-in date (soonest)</option>
                                    <option value="date-desc">Check-in date (latest)</option>
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
                                <span>Check-in from</span>
                                <input type="date" id="reservationCheckInFrom">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Check-in to</span>
                                <input type="date" id="reservationCheckInTo">
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
                                    <th>Check-in</th>
                                    <th>Guests</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody id="reservationTableBody">
                                @forelse ($reservations as $reservation)
                                    <tr
                                        class="guest-row reservation-row"
                                        data-reservation-id="{{ $reservation->id }}"
                                        data-booker-name="{{ e($reservation->booker_name) }}"
                                        data-email="{{ e($reservation->email) }}"
                                        data-phone="{{ e($reservation->phone) }}"
                                        data-check-in="{{ $reservation->check_in }}"
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
                                        <td>{{ $reservation->check_in }}</td>
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
            </main>
        </div>
    </div>
    <script>
        window.staffReservationData = @json($reservationData ?? []);
    </script>
</body>
</html>
