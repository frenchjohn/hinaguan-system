
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="csrf-token" content="{{ csrf_token() }}">
	<title>Check Ins — Hinaguan Nature Park</title>
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
		<x-staff_sidemenu active="checkins" />

		<div class="dash-main">
			<x-header
				title="Check Ins"
				subtitle="Active check-ins and walk-ins"
				userName="Staff User"
				userRole="Staff"
				:settingsUrl="route('staff.settings')"
			/>

			<main class="dash-content">
				<section class="dash-panel guest-panel">
					<div class="dash-panel__head guest-panel__head">
						<div>
							<h3 class="dash-panel__title">Current Check-ins</h3>
							<p class="dash-panel__subtitle">Guests currently checked in or not yet checked out</p>
						</div>
						<a href="#" class="guest-panel__button" data-open-add-guest-modal="true">Add Guest</a>
					</div>

					@if (session('success'))
						<div class="guest-alert">{{ session('success') }}</div>
					@endif

					@php
						$activeCustomers = collect($customers ?? collect())->filter(function ($customer) {
							return $customer->reservationGuests->filter(function ($guest) {
								$reservation = $guest->reservation ?? null;
								if (! $reservation) {
									return false;
								}
								$status = strtolower(str_replace(' ', '_', (string) ($reservation->status ?? '')));
								return $status !== 'checked_out' && $status !== 'checkedout' && $status !== 'checked-out';
							})->isNotEmpty();
						});
					@endphp

					<div class="guest-summary">
						<div class="guest-summary-card">
							<span>Total active guests</span>
							<strong id="guestSummaryTotal">{{ $activeCustomers->count() }}</strong>
						</div>
						<div class="guest-summary-card">
							<span>Female</span>
							<strong id="guestSummaryFemale">0</strong>
						</div>
						<div class="guest-summary-card">
							<span>Male</span>
							<strong id="guestSummaryMale">0</strong>
						</div>
						<div class="guest-summary-card">
							<span>Foreign</span>
							<strong id="guestSummaryForeign">0</strong>
						</div>
						<div class="guest-summary-card">
							<span>Filipino</span>
							<strong id="guestSummaryFilipino">0</strong>
						</div>
					</div>

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
						<span id="guestResultsCount">Showing {{ $activeCustomers->count() }} active guests</span>
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
								@forelse ($customers ?? collect() as $customer)
									@php
										$hasActiveReservation = $customer->reservationGuests->filter(function ($guest) {
											$reservation = $guest->reservation ?? null;
											if (! $reservation) return false;
											$status = strtolower(str_replace(' ', '_', (string) ($reservation->status ?? '')));
											return $status !== 'checked_out' && $status !== 'checkedout' && $status !== 'checked-out';
										})->isNotEmpty();
									@endphp

									@if (! $hasActiveReservation)
										@continue
									@endif

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
										data-gender="{{ strtolower((string) ($customer->gender ?? 'N/A')) }}"
											data-check-in="{{ $reservationEntry?->reservation?->check_in ?? '' }}"
											data-check-out="{{ $reservationEntry?->reservation?->check_out ?? '' }}"
											data-checked-out-at="{{ $reservationEntry?->checked_out_at ?? '' }}"
											data-status="{{ $reservationEntry?->reservation?->status ?? 'N/A' }}"
											data-age-value="{{ is_numeric($customer->age) ? (int) $customer->age : 999999 }}"
											data-is-foreign="{{ (bool) ($customer->is_foreigner ?? false) ? 'true' : 'false' }}"
											data-search="{{ strtolower(trim(($customer->first_name ?? '') . ' ' . ($customer->middle_name ?? '') . ' ' . ($customer->last_name ?? '') . ' ' . $customer->id . ' ' . ($customer->gender ?? '') . ' ' . ($customer->nationality ?? '') . ' ' . $reservationTypeLabel)) }}"
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
										<td colspan="5" class="guest-empty">No active check-ins found.</td>
									</tr>
								@endforelse
							</tbody>
						</table>
					</div>
				</section>

				{{-- Include the detail modal and add-guest modals (copied from staff_guests) --}}
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
									<span>Check-in date</span>
									<input type="date" name="check_in" value="{{ now()->toDateString() }}" required>
								</label>
							</div>
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
											<select name="primary_guest[nationality_option]" id="primaryGuestNationalityOption">
												<option value="Filipino" selected>Filipino</option>
												<option value="Foreign">Foreign</option>
											</select>
										</label>
										<label class="guest-form__field" id="primaryGuestNationalityTextField" style="display:none;">
											<span>Foreign type</span>
											<input type="text" name="primary_guest[nationality]" id="primaryGuestNationalityText" placeholder="e.g. American">
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
							@forelse ($amenities ?? collect() as $amenity)
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
					</div>
				</div>

				<div class="guest-modal guest-modal--compact" id="companionModal" aria-hidden="true">
					<div class="guest-modal__backdrop" data-close-companion-modal="true"></div>
					<div class="guest-modal__content guest-modal__content--compact" role="dialog" aria-modal="true" aria-labelledby="companionModalTitle">
						<button type="button" class="guest-modal__close" data-close-companion-modal="true" aria-label="Close companion form">&times;</button>
						<h3 id="companionModalTitle" class="guest-modal__title">Add Companion</h3>
						<form id="companionForm" class="guest-form" action="#">
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
									<select name="nationality_option" id="companionNationalityOption">
											<option value="Filipino" selected>Filipino</option>
											<option value="Foreign">Foreign</option>
										</select>
									</label>
									<label class="guest-form__field" id="companionNationalityTextField" style="display:none;">
										<span>Foreign type</span>
										<input type="text" name="nationality" id="companionNationalityText" placeholder="e.g. American">
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
								<button type="submit" class="guest-form__button">Add Companion</button>
							</div>
						</form>
					</div>
				</div>

			</main>
		</div>
	</div>
</body>
</html>

<script>
	window.staffGuestData = @json($guestData ?? []);
</script>
