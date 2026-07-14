document.addEventListener('DOMContentLoaded', () => {
    const guestModal = document.getElementById('guestModal');
    const modalBody = document.getElementById('guestModalBody');
    const closeButtons = document.querySelectorAll('[data-close-modal="true"]');
    const guestData = window.staffGuestData || {};

    // =====================
    // GUEST TABLE LOGIC
    // =====================
    const searchInput = document.getElementById('guestSearchInput');
    const sortSelect = document.getElementById('guestSortSelect');
    const checkOutFrom = document.getElementById('guestCheckOutFrom');
    const checkOutTo = document.getElementById('guestCheckOutTo');
    const clearButton = document.getElementById('guestFiltersClear');
    const guestResultsCount = document.getElementById('guestResultsCount');
    const guestFilterToggle = document.getElementById('guestFilterToggle');
    const guestFilterPanel = document.getElementById('guestFilterPanel');
    const guestTableBody = document.getElementById('guestTableBody');
    const guestTableRows = Array.from(guestTableBody?.querySelectorAll('.guest-row') ?? []);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch {
            return 'N/A';
        }
    };

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const openGuestModal = (customerId) => {
        const customerData = guestData?.[customerId] ?? null;

        if (!customerData) {
            modalBody.innerHTML = '<p class="guest-empty">No additional detail available.</p>';
            guestModal.classList.add('is-open');
            guestModal.setAttribute('aria-hidden', 'false');
            return;
        }

        const reservation = customerData.reservation;
        modalBody.innerHTML = `
            <div class="guest-card">
                <div class="guest-card__grid">
                    <div>
                        <span class="guest-label">Full Name</span>
                        <div class="guest-value">${escapeHtml(customerData.first_name)} ${escapeHtml(customerData.middle_name || '')} ${escapeHtml(customerData.last_name)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Age</span>
                        <div class="guest-value">${customerData.age || 'N/A'}</div>
                    </div>
                    <div>
                        <span class="guest-label">Gender</span>
                        <div class="guest-value">${customerData.gender || 'N/A'}</div>
                    </div>
                    <div>
                        <span class="guest-label">Nationality</span>
                        <div class="guest-value">${customerData.nationality || 'N/A'}</div>
                    </div>
                    <div>
                        <span class="guest-label">Checked Out</span>
                        <div class="guest-value">${formatDateTime(customerData.checked_out_at)}</div>
                    </div>
                </div>
            </div>
            ${reservation ? `
                <div class="guest-card">
                    <h4 style="margin: 0 0 0.75rem; font-size: 1rem;">Reservation Details</h4>
                    <div class="guest-card__grid">
                        <div>
                            <span class="guest-label">Check-In</span>
                            <div class="guest-value">${formatDateTime(reservation.check_in)}</div>
                        </div>
                        <div>
                            <span class="guest-label">Check-Out</span>
                            <div class="guest-value">${formatDateTime(reservation.check_out)}</div>
                        </div>
                        <div>
                            <span class="guest-label">Status</span>
                            <div class="guest-value">${escapeHtml(reservation.status)}</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        guestModal.classList.add('is-open');
        guestModal.setAttribute('aria-hidden', 'false');
    };

    const applyGuestFilters = () => {
        const query = searchInput?.value.trim().toLowerCase() ?? '';
        const sortValue = sortSelect?.value ?? 'checkout-desc';
        const checkOutFromValue = checkOutFrom?.value ?? '';
        const checkOutToValue = checkOutTo?.value ?? '';

        const filteredRows = guestTableRows.filter((row) => {
            const searchText = (row.getAttribute('data-search') || '').toLowerCase();
            const matchesSearch = !query || searchText.includes(query);
            const checkedOutDate = row.getAttribute('data-checked-out') || '';
            const checkedOutDateOnly = checkedOutDate.split(' ')[0];
            const matchesCheckOutFrom = !checkOutFromValue || !checkedOutDateOnly || checkedOutDateOnly >= checkOutFromValue;
            const matchesCheckOutTo = !checkOutToValue || !checkedOutDateOnly || checkedOutDateOnly <= checkOutToValue;
            return matchesSearch && matchesCheckOutFrom && matchesCheckOutTo;
        });

        filteredRows.sort((left, right) => {
            const leftName = (left.getAttribute('data-search') || '').toLowerCase();
            const rightName = (right.getAttribute('data-search') || '').toLowerCase();
            const leftAge = Number(left.getAttribute('data-age-value') || 999999);
            const rightAge = Number(right.getAttribute('data-age-value') || 999999);
            const leftCheckOut = left.getAttribute('data-checked-out') || '';
            const rightCheckOut = right.getAttribute('data-checked-out') || '';

            switch (sortValue) {
                case 'name-desc':
                    return rightName.localeCompare(leftName);
                case 'age-asc':
                    return leftAge - rightAge;
                case 'age-desc':
                    return rightAge - leftAge;
                case 'checkout-desc':
                    return rightCheckOut.localeCompare(leftCheckOut);
                case 'name-asc':
                default:
                    return leftName.localeCompare(rightName);
            }
        });

        guestTableRows.forEach((row) => {
            row.classList.add('is-hidden');
        });

        filteredRows.forEach((row) => {
            row.classList.remove('is-hidden');
        });

        if (guestResultsCount) {
            guestResultsCount.textContent = `Showing ${filteredRows.length} records`;
        }
    };

    guestTableRows.forEach((row) => {
        row.addEventListener('click', () => {
            const customerId = row.getAttribute('data-customer-id');
            openGuestModal(customerId);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            guestModal.classList.remove('is-open');
            guestModal.setAttribute('aria-hidden', 'true');
        });
    });

    guestModal.addEventListener('click', (event) => {
        if (event.target === guestModal || event.target.classList.contains('guest-modal__backdrop')) {
            guestModal.classList.remove('is-open');
            guestModal.setAttribute('aria-hidden', 'true');
        }
    });

    [searchInput, sortSelect, checkOutFrom, checkOutTo].forEach((element) => {
        element?.addEventListener('input', applyGuestFilters);
        element?.addEventListener('change', applyGuestFilters);
    });

    clearButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'checkout-desc';
        if (checkOutFrom) checkOutFrom.value = '';
        if (checkOutTo) checkOutTo.value = '';
        applyGuestFilters();
    });

    guestFilterToggle?.addEventListener('click', () => {
        if (!guestFilterPanel) return;
        const isExpanded = guestFilterToggle.getAttribute('aria-expanded') === 'true';
        guestFilterPanel.hidden = isExpanded;
        guestFilterToggle.setAttribute('aria-expanded', String(!isExpanded));
        guestFilterToggle.querySelector('.guest-filter-toggle__icon').textContent = isExpanded ? '▾' : '▴';
    });

    const tabButtons = Array.from(document.querySelectorAll('.records-tab-btn'));
    const tabSections = Array.from(document.querySelectorAll('[data-tab-content]'));

    const setActiveTab = (tabName) => {
        tabButtons.forEach((button) => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('records-tab-btn--active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        tabSections.forEach((section) => {
            section.hidden = section.dataset.tabContent !== tabName;
        });
    };

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setActiveTab(button.dataset.tab);
        });
    });

    setActiveTab('guests');

    // ========================
    // RESERVATION TABLE LOGIC
    // ========================
    const reservationSearchInput = document.getElementById('reservationSearchInput');
    const reservationSortSelect = document.getElementById('reservationSortSelect');
    const reservationCheckOutFrom = document.getElementById('reservationCheckOutFrom');
    const reservationCheckOutTo = document.getElementById('reservationCheckOutTo');
    const reservationClearButton = document.getElementById('reservationFiltersClear');
    const reservationResultsCount = document.getElementById('reservationResultsCount');
    const reservationFilterToggle = document.getElementById('reservationFilterToggle');
    const reservationFilterPanel = document.getElementById('reservationFilterPanel');
    const reservationTableBody = document.getElementById('reservationTableBody');
    const reservationTableRows = Array.from(reservationTableBody?.querySelectorAll('.reservation-row') ?? []);

    const applyReservationFilters = () => {
        const query = reservationSearchInput?.value.trim().toLowerCase() ?? '';
        const sortValue = reservationSortSelect?.value ?? 'date-desc';
        const checkOutFromValue = reservationCheckOutFrom?.value ?? '';
        const checkOutToValue = reservationCheckOutTo?.value ?? '';

        const filteredRows = reservationTableRows.filter((row) => {
            const searchText = (row.getAttribute('data-search') || '').toLowerCase();
            const matchesSearch = !query || searchText.includes(query);
            const checkOutDate = row.getAttribute('data-check-out') || '';
            const checkOutDateOnly = checkOutDate.split(' ')[0];
            const matchesCheckOutFrom = !checkOutFromValue || !checkOutDateOnly || checkOutDateOnly >= checkOutFromValue;
            const matchesCheckOutTo = !checkOutToValue || !checkOutDateOnly || checkOutDateOnly <= checkOutToValue;
            return matchesSearch && matchesCheckOutFrom && matchesCheckOutTo;
        });

        filteredRows.sort((left, right) => {
            const leftName = (left.getAttribute('data-booker-name') || '').toLowerCase();
            const rightName = (right.getAttribute('data-booker-name') || '').toLowerCase();
            const leftAmount = Number(left.getAttribute('data-amount') || 0);
            const rightAmount = Number(right.getAttribute('data-amount') || 0);
            const leftCheckOut = left.getAttribute('data-check-out') || '';
            const rightCheckOut = right.getAttribute('data-check-out') || '';

            switch (sortValue) {
                case 'date-asc':
                    return leftCheckOut.localeCompare(rightCheckOut);
                case 'name-asc':
                    return leftName.localeCompare(rightName);
                case 'name-desc':
                    return rightName.localeCompare(leftName);
                case 'amount-desc':
                    return rightAmount - leftAmount;
                case 'date-desc':
                default:
                    return rightCheckOut.localeCompare(leftCheckOut);
            }
        });

        reservationTableRows.forEach((row) => {
            row.classList.add('is-hidden');
        });

        filteredRows.forEach((row) => {
            row.classList.remove('is-hidden');
        });

        if (reservationResultsCount) {
            reservationResultsCount.textContent = `Showing ${filteredRows.length} reservations`;
        }
    };

    [reservationSearchInput, reservationSortSelect, reservationCheckOutFrom, reservationCheckOutTo].forEach((element) => {
        element?.addEventListener('input', applyReservationFilters);
        element?.addEventListener('change', applyReservationFilters);
    });

    reservationClearButton?.addEventListener('click', () => {
        if (reservationSearchInput) reservationSearchInput.value = '';
        if (reservationSortSelect) reservationSortSelect.value = 'date-desc';
        if (reservationCheckOutFrom) reservationCheckOutFrom.value = '';
        if (reservationCheckOutTo) reservationCheckOutTo.value = '';
        applyReservationFilters();
    });

    reservationFilterToggle?.addEventListener('click', () => {
        if (!reservationFilterPanel) return;
        const isExpanded = reservationFilterToggle.getAttribute('aria-expanded') === 'true';
        reservationFilterPanel.hidden = isExpanded;
        reservationFilterToggle.setAttribute('aria-expanded', String(!isExpanded));
        reservationFilterToggle.querySelector('.guest-filter-toggle__icon').textContent = isExpanded ? '▾' : '▴';
    });

    // Initialize
    applyGuestFilters();
    applyReservationFilters();
});

        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch {
            return 'N/A';
        }
    };

    const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    const isCheckedOutStatus = (value) => ['checked_out', 'checkedout', 'checked-out'].includes(normalizeStatus(value));
    const roleLabelElement = document.getElementById('guestModalRole');

    const openGuestModal = (customerId, customerName, customerAge, customerGender, customerNationality, reservationType) => {
        const customerData = guestData?.[customerId] ?? null;
        const guestRole = customerData?.reservation_guests?.some((entry) => entry.is_primary_guest) ? 'Main Guest' : 'Companion';

        if (roleLabelElement) {
            roleLabelElement.textContent = guestRole;
            roleLabelElement.classList.toggle('guest-modal__role-badge--primary', guestRole === 'Main Guest');
            roleLabelElement.classList.toggle('guest-modal__role-badge--companion', guestRole === 'Companion');
        }

        if (!customerData) {
            modalBody.innerHTML = '<p class="guest-empty">No additional detail available.</p>';
            guestModal.classList.add('is-open');
            guestModal.setAttribute('aria-hidden', 'false');
            return;
        }

        const reservations = customerData?.reservation_guests || [];
        const reservationDetails = reservations.map((entry) => {
            const reservation = entry.reservation || null;
            const reservationGuests = (reservation?.reservation_guests || []).filter((guest) => guest.customer);
            const isCheckedOut = Boolean(entry?.checked_out_at) || isCheckedOutStatus(reservation?.status);

            const primaryGuest = reservationGuests.find((guest) => guest.is_primary_guest) ?? null;
            const companions = reservationGuests.filter((guest) => !guest.is_primary_guest);
            const primaryName = primaryGuest?.customer ? [primaryGuest.customer.first_name, primaryGuest.customer.last_name].filter(Boolean).join(' ').trim() : 'N/A';
            const amenities = (reservation?.reservation_amenities || []).map((amenity) => amenity.amenity?.amenities_name).join(', ') || 'None';

            const primaryGuestMarkup = primaryGuest?.customer
                ? `
                    <div class="guest-relationship-item guest-relationship-item--main">
                        <div class="guest-relationship-label">Main Guest</div>
                        <div class="guest-relationship-name">${escapeHtml(primaryName)}</div>
                    </div>
                `
                : '';

            const companionMarkup = companions.length
                ? companions.map((companionGuest) => {
                    const companionName = companionGuest.customer
                        ? [companionGuest.customer.first_name, companionGuest.customer.last_name].filter(Boolean).join(' ').trim()
                        : 'N/A';
                    return `
                        <div class="guest-relationship-item guest-relationship-item--companion">
                            <div class="guest-relationship-label">Companion</div>
                            <div class="guest-relationship-name">${escapeHtml(companionName)}</div>
                        </div>
                    `;
                }).join('')
                : '<div class="guest-relationship-item guest-relationship-item--companion guest-relationship-item--empty"><div class="guest-relationship-label">Companion</div><div class="guest-relationship-name">No companions listed.</div></div>';

            return `
                <div class="guest-card">
                    <div style="margin-bottom: 1rem;">
                        <span class="guest-label">Reservation ID</span>
                        <div class="guest-value">${escapeHtml(reservation?.id ?? 'N/A')}</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <span class="guest-label">Check-in</span>
                            <div class="guest-value">${escapeHtml(reservation?.check_in ?? 'N/A')}</div>
                        </div>
                        <div>
                            <span class="guest-label">Check-out</span>
                            <div class="guest-value">${escapeHtml(entry?.checked_out_at ? formatDateTime(entry.checked_out_at) : 'Not yet')}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <span class="guest-label">Guests</span>
                        <div class="guest-relationship-list">
                            ${primaryGuestMarkup}
                            ${companionMarkup}
                        </div>
                    </div>
                    <div>
                        <span class="guest-label">Amenities</span>
                        <div class="guest-value">${escapeHtml(amenities)}</div>
                    </div>
                </div>
            `;
        }).join('');

        modalBody.innerHTML = `
            <div class="guest-card">
                <div class="guest-card__grid">
                    <div>
                        <span class="guest-label">Full Name</span>
                        <div class="guest-value">${escapeHtml(customerName)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Age</span>
                        <div class="guest-value">${escapeHtml(customerAge)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Gender</span>
                        <div class="guest-value">${escapeHtml(customerGender)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Nationality</span>
                        <div class="guest-value">${escapeHtml(customerNationality)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Reservation Type</span>
                        <div class="guest-value">${escapeHtml(reservationType)}</div>
                    </div>
                </div>
            </div>
            ${reservationDetails || '<div class="guest-card"><p class="guest-empty">No reservation details available.</p></div>'}
        `;

        guestModal.classList.add('is-open');
        guestModal.setAttribute('aria-hidden', 'false');
    };

    const closeGuestModal = () => {
        guestModal.classList.remove('is-open');
        guestModal.setAttribute('aria-hidden', 'true');
    };

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeGuestModal);
    });

    if (guestModal) {
        guestModal.addEventListener('click', (event) => {
            if (event.target === guestModal) closeGuestModal();
        });
    }

    document.querySelectorAll('.guest-row').forEach((row) => {
        const openForRow = () => {
            const customerId = row.dataset.customerId;
            const customerName = row.querySelector('.guest-name')?.textContent?.trim() ?? 'Guest';
            const customerAge = row.dataset.age || 'N/A';
            const customerGender = row.dataset.gender || 'N/A';
            const customerNationality = row.dataset.nationality || 'N/A';
            const reservationType = row.dataset.reservationType || 'N/A';
            openGuestModal(customerId, customerName, customerAge, customerGender, customerNationality, reservationType);
        };

        row.addEventListener('click', openForRow);
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openForRow();
            }
        });
    });

    const applyGuestFilters = () => {
        if (!tableBody) return;

        const query = searchInput?.value.trim().toLowerCase() ?? '';
        const checkInFromValue = checkInFrom?.value ?? '';
        const checkInToValue = checkInTo?.value ?? '';
        const checkOutFromValue = checkOutFrom?.value ?? '';
        const checkOutToValue = checkOutTo?.value ?? '';
        const sortValue = sortSelect?.value ?? 'name-asc';

        const filteredRows = tableRows.filter((row) => {
            const searchMatch = !query || (row.getAttribute('data-search') ?? '').includes(query);
            const checkInDate = row.getAttribute('data-check-in') ?? '';
            const checkOutDate = row.getAttribute('data-check-out') ?? '';

            const checkInMatch = !checkInFromValue || (checkInDate >= checkInFromValue);
            const checkInToMatch = !checkInToValue || (checkInDate <= checkInToValue);
            const checkOutMatch = !checkOutFromValue || (checkOutDate && checkOutDate >= checkOutFromValue) || (!checkOutDate && !checkOutFromValue);
            const checkOutToMatch = !checkOutToValue || (checkOutDate && checkOutDate <= checkOutToValue) || (!checkOutDate && !checkOutToValue);

            return searchMatch && checkInMatch && checkInToMatch && checkOutMatch && checkOutToMatch;
        });

        filteredRows.sort((left, right) => {
            const getSortValue = (row, attr) => row.getAttribute(attr) ?? '';

            switch (sortValue) {
                case 'name-asc': return getSortValue(left, 'data-search').localeCompare(getSortValue(right, 'data-search'));
                case 'name-desc': return getSortValue(right, 'data-search').localeCompare(getSortValue(left, 'data-search'));
                case 'age-asc': return parseInt(getSortValue(left, 'data-age-value') || '999999') - parseInt(getSortValue(right, 'data-age-value') || '999999');
                case 'age-desc': return parseInt(getSortValue(right, 'data-age-value') || '999999') - parseInt(getSortValue(left, 'data-age-value') || '999999');
                default: return 0;
            }
        });

        tableRows.forEach((row) => row.classList.add('is-hidden'));
        filteredRows.forEach((row) => row.classList.remove('is-hidden'));

        if (resultsCount) resultsCount.textContent = `Showing ${filteredRows.length} records`;
    };

    [searchInput, sortSelect, checkInFrom, checkInTo, checkOutFrom, checkOutTo].forEach((element) => {
        element?.addEventListener('input', applyGuestFilters);
        element?.addEventListener('change', applyGuestFilters);
    });

    filterToggle?.addEventListener('click', () => {
        if (!filterPanel) return;
        const isExpanded = filterToggle.getAttribute('aria-expanded') === 'true';
        filterPanel.hidden = isExpanded;
        filterToggle.setAttribute('aria-expanded', String(!isExpanded));
        filterToggle.querySelector('.guest-filter-toggle__icon').textContent = isExpanded ? '▾' : '▴';
    });

    clearButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'name-asc';
        if (checkInFrom) checkInFrom.value = '';
        if (checkInTo) checkInTo.value = '';
        if (checkOutFrom) checkOutFrom.value = '';
        if (checkOutTo) checkOutTo.value = '';
        applyGuestFilters();
    });

    // =======================
    // RESERVATION TABLE LOGIC
    // =======================
    const reservationModal = document.getElementById('reservationModal');
    const reservationModalBody = document.getElementById('reservationModalBody');
    const reservationCloseButtons = document.querySelectorAll('[data-close-reservation-modal="true"]');
    const reservationData = window.staffReservationData || {};
    const reservationSearchInput = document.getElementById('reservationSearchInput');
    const reservationStatusFilter = document.getElementById('reservationStatusFilter');
    const reservationTypeFilter = document.getElementById('reservationTypeFilter');
    const reservationDateFrom = document.getElementById('reservationDateFrom');
    const reservationDateTo = document.getElementById('reservationDateTo');
    const reservationFiltersClear = document.getElementById('reservationFiltersClear');
    const reservationResultsCount = document.getElementById('reservationResultsCount');
    const reservationFilterToggle = document.getElementById('reservationFilterToggle');
    const reservationFilterPanel = document.getElementById('reservationFilterPanel');
    const reservationTableBody = document.getElementById('reservationTableBody');
    const reservationTableRows = Array.from(reservationTableBody?.querySelectorAll('.reservation-row') ?? []);

    const openReservationModal = (reservationId) => {
        const reservation = reservationData[reservationId];

        if (!reservation) {
            reservationModalBody.innerHTML = '<p class="guest-empty">No reservation details available.</p>';
            reservationModal.classList.add('is-open');
            reservationModal.setAttribute('aria-hidden', 'false');
            return;
        }

        const primaryGuest = reservation.reservation_guests.find(g => g.is_primary_guest);
        const companions = reservation.reservation_guests.filter(g => !g.is_primary_guest);

        let html = `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Main Guest</h4>
                <div style="padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem;">
                    ${primaryGuest && primaryGuest.customer ? `
                        <div><strong>${escapeHtml(primaryGuest.customer.first_name)} ${escapeHtml(primaryGuest.customer.middle_name || '')} ${escapeHtml(primaryGuest.customer.last_name)}</strong></div>
                        <div style="font-size: 0.875rem; color: #666;">Age: ${escapeHtml(primaryGuest.customer.age || 'N/A')} | Gender: ${escapeHtml(primaryGuest.customer.gender || 'N/A')} | Nationality: ${escapeHtml(primaryGuest.customer.nationality || 'N/A')}</div>
                        <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Checked Out: ${escapeHtml(primaryGuest.checked_out_at ? formatDateTime(primaryGuest.checked_out_at) : 'Not yet')}</div>
                    ` : '<div>No main guest assigned</div>'}
                </div>
            </div>
        `;

        if (companions.length > 0) {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Companions (${companions.length})</h4>
                    ${companions.map(c => `
                        <div style="padding: 0.75rem; background-color: #f5f5f5; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                            <div><strong>${escapeHtml(c.customer.first_name)} ${escapeHtml(c.customer.middle_name || '')} ${escapeHtml(c.customer.last_name)}</strong></div>
                            <div style="font-size: 0.875rem; color: #666;">Age: ${escapeHtml(c.customer.age || 'N/A')} | Gender: ${escapeHtml(c.customer.gender || 'N/A')} | Nationality: ${escapeHtml(c.customer.nationality || 'N/A')}</div>
                            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Checked Out: ${escapeHtml(c.checked_out_at ? formatDateTime(c.checked_out_at) : 'Not yet')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (reservation.reservation_amenities.length > 0) {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Amenities</h4>
                    <ul style="margin-left: 1.5rem; color: #666;">
                        ${reservation.reservation_amenities.map(a => `
                            <li>${escapeHtml(a.amenity_name)} (${escapeHtml(a.pricing_type)}) - ₱${parseFloat(a.price).toFixed(2)} x ${a.quantity}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
            <div style="border-top: 1px solid #ddd; padding-top: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <span class="guest-label">Reservation Date</span>
                        <div class="guest-value">${escapeHtml(reservation.reservation_date)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Check-in</span>
                        <div class="guest-value">${escapeHtml(reservation.check_in)}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <span class="guest-label">Check-out</span>
                        <div class="guest-value">${escapeHtml(reservation.check_out || 'Not checked out')}</div>
                    </div>
                    <div>
                        <span class="guest-label">Created</span>
                        <div class="guest-value">${escapeHtml(formatDateTime(reservation.created_at))}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <span class="guest-label">Status</span>
                        <div class="guest-value"><span class="guest-pill">${escapeHtml(reservation.status)}</span></div>
                    </div>
                    <div>
                        <span class="guest-label">Type</span>
                        <div class="guest-value">${escapeHtml(reservation.reservation_type === 'walk_in' ? 'Walk-in' : 'Online')}</div>
                    </div>
                </div>
            </div>
        `;

        reservationModalBody.innerHTML = html;
        document.getElementById('reservationModalTitle').textContent = `Reservation #${reservation.id}`;
        reservationModal.classList.add('is-open');
        reservationModal.setAttribute('aria-hidden', 'false');
    };

    const closeReservationModal = () => {
        reservationModal.classList.remove('is-open');
        reservationModal.setAttribute('aria-hidden', 'true');
    };

    reservationCloseButtons.forEach((button) => {
        button.addEventListener('click', closeReservationModal);
    });

    if (reservationModal) {
        reservationModal.addEventListener('click', (event) => {
            if (event.target === reservationModal) closeReservationModal();
        });
    }

    document.querySelectorAll('.reservation-row').forEach((row) => {
        const openForRow = () => {
            const reservationId = row.dataset.reservationId;
            openReservationModal(reservationId);
        };

        row.addEventListener('click', openForRow);
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openForRow();
            }
        });
    });

    const applyReservationFilters = () => {
        if (!reservationTableBody) return;

        const query = reservationSearchInput?.value.trim().toLowerCase() ?? '';
        const statusFilter = normalizeStatus(reservationStatusFilter?.value ?? '');
        const typeFilter = reservationTypeFilter?.value ?? '';
        const dateFromValue = reservationDateFrom?.value ?? '';
        const dateToValue = reservationDateTo?.value ?? '';

        const filteredRows = reservationTableRows.filter((row) => {
            const bookerSearch = (row.getAttribute('data-booker-name') ?? '').includes(query);
            const statusMatch = !statusFilter || (row.getAttribute('data-status') ?? '') === statusFilter;
            const typeMatch = !typeFilter || (row.getAttribute('data-type') ?? '') === typeFilter;
            const dateRow = row.getAttribute('data-date') ?? '';
            const dateMatch = !dateFromValue || (dateRow >= dateFromValue);
            const dateToMatch = !dateToValue || (dateRow <= dateToValue);

            return bookerSearch && statusMatch && typeMatch && dateMatch && dateToMatch;
        });

        reservationTableRows.forEach((row) => row.classList.add('is-hidden'));
        filteredRows.forEach((row) => row.classList.remove('is-hidden'));

        if (reservationResultsCount) reservationResultsCount.textContent = `Showing ${filteredRows.length} records`;
    };

    [reservationSearchInput, reservationStatusFilter, reservationTypeFilter, reservationDateFrom, reservationDateTo].forEach((element) => {
        element?.addEventListener('input', applyReservationFilters);
        element?.addEventListener('change', applyReservationFilters);
    });

    reservationFilterToggle?.addEventListener('click', () => {
        if (!reservationFilterPanel) return;
        const isExpanded = reservationFilterToggle.getAttribute('aria-expanded') === 'true';
        reservationFilterPanel.hidden = isExpanded;
        reservationFilterToggle.setAttribute('aria-expanded', String(!isExpanded));
        reservationFilterToggle.querySelector('.guest-filter-toggle__icon').textContent = isExpanded ? '▾' : '▴';
    });

    reservationFiltersClear?.addEventListener('click', () => {
        if (reservationSearchInput) reservationSearchInput.value = '';
        if (reservationStatusFilter) reservationStatusFilter.value = '';
        if (reservationTypeFilter) reservationTypeFilter.value = '';
        if (reservationDateFrom) reservationDateFrom.value = '';
        if (reservationDateTo) reservationDateTo.value = '';
        applyReservationFilters();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeGuestModal();
            closeReservationModal();
        }
    });
});
