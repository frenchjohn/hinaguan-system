<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
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
        <x-staff_sidemenu active="guests" />

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
                        
                    </div>

                    @if (session('success'))
                        <div class="guest-alert">{{ session('success') }}</div>
                    @endif

                    <div class="guest-filter-shell">
                        <button type="button" class="guest-filter-toggle" id="guestFilterToggle" aria-expanded="false" aria-controls="guestFilterPanel">
                            <span>Filters</span>
                            <span class="guest-filter-toggle__icon">▾</span>
                        </button>
                        <div class="guest-toolbar guest-toolbar--collapsed" id="guestFilterPanel" hidden>
                            <label class="guest-toolbar__field guest-toolbar__field--search">
                                <span>Search</span>
                                <input type="search" id="guestSearchInput" placeholder="Search by name, ID, gender, nationality">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Sort by</span>
                                <select id="guestSortSelect">
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="age-asc">Age (Low-High)</option>
                                    <option value="age-desc">Age (High-Low)</option>
                                    <option value="reservation-asc">Reservation Type</option>
                                </select>
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Check-in from</span>
                                <input type="date" id="guestCheckInFrom">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Check-in to</span>
                                <input type="date" id="guestCheckInTo">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Check-out from</span>
                                <input type="date" id="guestCheckOutFrom">
                            </label>
                            <label class="guest-toolbar__field">
                                <span>Check-out to</span>
                                <input type="date" id="guestCheckOutTo">
                            </label>
                            <button type="button" class="guest-toolbar__clear" id="guestFiltersClear">Clear</button>
                        </div>
                    </div>
                    <div class="guest-toolbar__meta">
                        <span id="guestResultsCount">Showing {{ $customers->count() }} records</span>
                    </div>

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
                            <tbody id="guestTableBody">
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
                                        data-check-in="{{ $reservationEntry?->reservation?->check_in ?? '' }}"
                                        data-check-out="{{ $reservationEntry?->reservation?->check_out ?? '' }}"
                                        data-status="{{ strtolower(str_replace(' ', '_', (string) ($reservationEntry?->reservation?->status ?? '')) ) }}"
                                        data-age-value="{{ is_numeric($customer->age) ? (int) $customer->age : 999999 }}"
                                        data-search="{{ strtolower(trim(($customer->first_name ?? '') . ' ' . ($customer->middle_name ?? '') . ' ' . ($customer->last_name ?? '') . ' ' . $customer->id . ' ' . ($customer->gender ?? '') . ' ' . ($customer->nationality ?? '') . ' ' . $reservationTypeLabel)) }}"
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
                

                
            </main>
        </div>
    </div>
    <script>
        window.staffGuestData = @json($guestData ?? []);
    </script>
</body>
</html>
