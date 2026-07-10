document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reservationModal');
    const modalBody = document.getElementById('reservationModalBody');
    const modalStatus = document.getElementById('reservationModalStatus');
    const closeButtons = document.querySelectorAll('[data-close-reservation-modal="true"]');
    const checkInModal = document.getElementById('checkInModal');
    const checkInForm = document.getElementById('checkInForm');
    const checkInCompanionModal = document.getElementById('checkInCompanionModal');
    const checkInCompanionForm = document.getElementById('checkInCompanionForm');
    const checkInCloseButtons = document.querySelectorAll('[data-close-check-in-modal="true"]');
    const checkInCompanionCloseButtons = document.querySelectorAll('[data-close-check-in-companion-modal="true"]');
    const checkInAddCompanionBtn = document.getElementById('checkInAddCompanionBtn');
    const checkInCompanionList = document.getElementById('checkInCompanionList');
    const checkInCompanionHiddenFields = document.getElementById('checkInCompanionHiddenFields');
    const checkInPrimaryNationalityOption = document.getElementById('checkInPrimaryNationalityOption');
    const checkInPrimaryNationalityTextField = document.getElementById('checkInPrimaryNationalityTextField');
    const checkInPrimaryNationalityText = document.getElementById('checkInPrimaryNationalityText');
    const checkInCompanionNationalityOption = document.getElementById('checkInCompanionNationalityOption');
    const checkInCompanionNationalityTextField = document.getElementById('checkInCompanionNationalityTextField');
    const checkInCompanionNationalityText = document.getElementById('checkInCompanionNationalityText');
    const tableBody = document.getElementById('reservationTableBody');
    const rows = Array.from(tableBody?.querySelectorAll('.reservation-row') ?? []);
    const searchInput = document.getElementById('reservationSearchInput');
    const sortSelect = document.getElementById('reservationSortSelect');
    const statusFilter = document.getElementById('reservationStatusFilter');
    const checkInFrom = document.getElementById('reservationCheckInFrom');
    const checkInTo = document.getElementById('reservationCheckInTo');
    const clearButton = document.getElementById('reservationFiltersClear');
    const resultsCount = document.getElementById('reservationResultsCount');
    const filterToggle = document.getElementById('reservationFilterToggle');
    const filterPanel = document.getElementById('reservationFilterPanel');
    const reservationData = window.staffReservationData || {};
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    let pendingReservationId = null;
    let checkInCompanions = [];
    let existingReservationGuests = [];
    let primaryGuestToUpdate = null;

    const toggleCheckInNationalityFields = () => {
        const primaryForeign = checkInPrimaryNationalityOption?.value === 'Foreign';
        if (checkInPrimaryNationalityTextField) {
            checkInPrimaryNationalityTextField.style.display = primaryForeign ? 'block' : 'none';
        }
        if (checkInPrimaryNationalityText && !primaryForeign) {
            checkInPrimaryNationalityText.value = '';
        }

        const companionForeign = checkInCompanionNationalityOption?.value === 'Foreign';
        if (checkInCompanionNationalityTextField) {
            checkInCompanionNationalityTextField.style.display = companionForeign ? 'block' : 'none';
        }
        if (checkInCompanionNationalityText && !companionForeign) {
            checkInCompanionNationalityText.value = '';
        }
    };

    checkInPrimaryNationalityOption?.addEventListener('change', toggleCheckInNationalityFields);
    checkInCompanionNationalityOption?.addEventListener('change', toggleCheckInNationalityFields);

    const renderCheckInCompanions = () => {
        checkInCompanionList.innerHTML = '';
        checkInCompanionHiddenFields.innerHTML = '';

        if (!checkInCompanions.length) {
            checkInCompanionList.innerHTML = '<p class="guest-empty">No companions added yet.</p>';
            return;
        }

        checkInCompanions.forEach((companion, index) => {
            const name = [companion.first_name, companion.middle_name, companion.last_name].filter(Boolean).join(' ').trim() || 'Unnamed companion';
            const item = document.createElement('div');
            item.className = 'guest-companion-pill';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            item.appendChild(nameSpan);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'guest-companion-pill__delete';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                checkInCompanions.splice(index, 1);
                renderCheckInCompanions();
            });
            item.appendChild(deleteBtn);
            checkInCompanionList.appendChild(item);
        });

        checkInCompanions.forEach((companion, index) => {
            Object.entries(companion).forEach(([key, value]) => {
                const field = document.createElement('input');
                field.type = 'hidden';
                field.name = `check_in_companions[${index}][${key}]`;
                field.value = value;
                checkInCompanionHiddenFields.appendChild(field);
            });
        });
    };

    const openCheckInCompanionModal = () => {
        checkInCompanionForm.reset();
        toggleCheckInNationalityFields();
        if (checkInCompanionModal) {
            checkInCompanionModal.classList.add('is-open');
            checkInCompanionModal.setAttribute('aria-hidden', 'false');
        }
    };

    const closeCheckInCompanionModal = () => {
        if (checkInCompanionModal) {
            checkInCompanionModal.classList.remove('is-open');
            checkInCompanionModal.setAttribute('aria-hidden', 'true');
        }
    };

    const fillFormWithGuestData = (guestData, namePrefix) => {
        if (!guestData || !checkInForm) return;

        const firstNameInput = checkInForm.querySelector(`input[name="${namePrefix}[first_name]"]`);
        const middleNameInput = checkInForm.querySelector(`input[name="${namePrefix}[middle_name]"]`);
        const lastNameInput = checkInForm.querySelector(`input[name="${namePrefix}[last_name]"]`);
        const ageInput = checkInForm.querySelector(`input[name="${namePrefix}[age]"]`);
        const genderSelect = checkInForm.querySelector(`select[name="${namePrefix}[gender]"]`);
        const nationalityOptionSelect = checkInForm.querySelector(`select[name="${namePrefix}[nationality_option]"]`);
        const nationalityInput = checkInForm.querySelector(`input[name="${namePrefix}[nationality]"]`);
        const phoneInput = checkInForm.querySelector(`input[name="${namePrefix}[phone]"]`);
        const emailInput = checkInForm.querySelector(`input[name="${namePrefix}[email]"]`);

        if (firstNameInput) firstNameInput.value = guestData.first_name || '';
        if (middleNameInput) middleNameInput.value = guestData.middle_name || '';
        if (lastNameInput) lastNameInput.value = guestData.last_name || '';
        if (ageInput) ageInput.value = guestData.age || '';
        if (genderSelect) genderSelect.value = guestData.gender || 'Male';
        
        if (nationalityOptionSelect) {
            nationalityOptionSelect.value = guestData.is_foreigner ? 'Foreign' : 'Filipino';
        }
        if (nationalityInput) {
            nationalityInput.value = guestData.is_foreigner ? (guestData.nationality || '') : '';
        }
        
        if (phoneInput) phoneInput.value = guestData.phone || '';
        if (emailInput) emailInput.value = guestData.email || '';
    };

    const toggleCheckInPrimaryGuestSection = () => {
        if (!checkInForm) return;
        const guestMode = checkInForm.querySelector('input[name="check_in_guest_mode"]:checked')?.value;
        const primarySection = document.getElementById('checkInPrimaryGuestSection');
        if (primarySection) {
            primarySection.style.display = guestMode === 'with_primary' ? 'block' : 'none';
        }
    };

    checkInForm?.addEventListener('change', (e) => {
        if (e.target.name === 'check_in_guest_mode') {
            toggleCheckInPrimaryGuestSection();
        }
    });

    checkInAddCompanionBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openCheckInCompanionModal();
    });

    checkInCompanionForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(checkInCompanionForm);
        const companion = {
            first_name: formData.get('first_name'),
            middle_name: formData.get('middle_name'),
            last_name: formData.get('last_name'),
            age: formData.get('age'),
            gender: formData.get('gender'),
            nationality_option: formData.get('nationality_option'),
            nationality: formData.get('nationality_option') === 'Foreign' ? formData.get('nationality') : formData.get('nationality_option'),
            phone: formData.get('phone'),
            email: formData.get('email'),
        };
        checkInCompanions.push(companion);
        renderCheckInCompanions();
        closeCheckInCompanionModal();
    });

    checkInCompanionCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCheckInCompanionModal);
    });

    const openCheckInModal = (reservationId) => {
        pendingReservationId = reservationId;
        checkInCompanions = [];
        primaryGuestToUpdate = null;
        existingReservationGuests = [];

        // Get existing guests from reservation data
        const reservation = reservationData[reservationId];
        if (reservation && reservation.reservation_guests) {
            existingReservationGuests = [...reservation.reservation_guests];

            // Find primary guest
            const primaryGuest = existingReservationGuests.find(g => g.is_primary_guest);
            if (primaryGuest && primaryGuest.customer) {
                primaryGuestToUpdate = primaryGuest;
                // Set mode to with_primary since we have a primary guest
                checkInForm.querySelector('input[name="check_in_guest_mode"][value="with_primary"]').checked = true;
            }
        }

        checkInForm.reset();
        
        // Auto-fill with existing primary guest
        if (primaryGuestToUpdate && primaryGuestToUpdate.customer) {
            fillFormWithGuestData(primaryGuestToUpdate.customer, 'check_in_primary_guest');
        } else {
            checkInForm.querySelector('input[name="check_in_guest_mode"][value="with_primary"]').checked = true;
        }

        toggleCheckInPrimaryGuestSection();
        renderCheckInCompanions();
        toggleCheckInNationalityFields();
        if (checkInModal) {
            checkInModal.classList.add('is-open');
            checkInModal.setAttribute('aria-hidden', 'false');
        }
    };

    const closeCheckInModal = () => {
        pendingReservationId = null;
        checkInCompanions = [];
        if (checkInModal) {
            checkInModal.classList.remove('is-open');
            checkInModal.setAttribute('aria-hidden', 'true');
        }
    };

    const openModal = (reservationId) => {
        const reservation = reservationData?.[reservationId] ?? null;
        if (!reservation) {
            modalBody.innerHTML = '<p class="guest-empty">No reservation details available.</p>';
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            return;
        }

        const guests = (reservation.reservation_guests || []).map((guest) => {
            const name = [guest.customer?.first_name, guest.customer?.last_name].filter(Boolean).join(' ').trim() || 'Unnamed guest';
            const role = guest.is_primary_guest ? 'Primary Guest' : 'Companion';
            return `
                <div class="guest-relationship-item">
                    <div class="guest-relationship-label">${escapeHtml(role)}</div>
                    <div class="guest-relationship-name">${escapeHtml(name)}</div>
                    <div class="guest-meta">${escapeHtml(guest.customer?.email || 'No email')}</div>
                </div>
            `;
        }).join('');

        const amenities = (reservation.reservation_amenities || []).map((amenity) => {
            const name = amenity.amenity?.amenities_name || 'Unknown amenity';
            return `<li>${escapeHtml(name)} — ${escapeHtml(amenity.pricing_type)} · ₱${Number(amenity.price_at_booking || 0).toFixed(2)}</li>`;
        }).join('');

        modalStatus.textContent = reservation.status;
        modalStatus.className = `guest-modal__role-badge reservation-status reservation-status--${String(reservation.status || '').toLowerCase()}`;
        modalBody.innerHTML = `
            <div class="guest-card">
                <div class="guest-card__grid">
                    <div>
                        <span class="guest-label">Booker</span>
                        <div class="guest-value">${escapeHtml(reservation.booker_name || 'N/A')}</div>
                    </div>
                    <div>
                        <span class="guest-label">Contact</span>
                        <div class="guest-value">${escapeHtml(reservation.phone || 'N/A')}<br>${escapeHtml(reservation.email || 'N/A')}</div>
                    </div>
                    <div>
                        <span class="guest-label">Check-in</span>
                        <div class="guest-value">${escapeHtml(reservation.check_in || 'N/A')}</div>
                    </div>
                    <div>
                        <span class="guest-label">Guests</span>
                        <div class="guest-value">${escapeHtml(reservation.number_of_guests || 'N/A')}</div>
                    </div>
                    <div>
                        <span class="guest-label">Payment</span>
                        <div class="guest-value">₱${Number(reservation.total_amount || 0).toFixed(2)} · Paid ₱${Number(reservation.amount_paid || 0).toFixed(2)} · Balance ₱${Number(reservation.remaining_balance || 0).toFixed(2)}</div>
                    </div>
                    <div>
                        <span class="guest-label">Payment Status</span>
                        <div class="guest-value">${escapeHtml(reservation.payment_status || 'N/A')}</div>
                    </div>
                </div>
                <div style="margin-top:0.75rem;">
                    <div class="guest-relationship-header">Guests on this reservation</div>
                    <div class="guest-relationship-list">${guests || '<div class="guest-relationship-item"><div class="guest-relationship-name">No guest details listed.</div></div>'}</div>
                </div>
                <div style="margin-top:0.75rem;">
                    <span class="guest-label">Reserved Amenities</span>
                    <ul class="guest-list">${amenities || '<li>No amenities listed.</li>'}</ul>
                </div>
                <div class="guest-form__actions" style="margin-top:0.75rem;">
                    <button type="button" class="guest-form__button" data-open-check-in-modal="${reservation.id}">Check In</button>
                </div>
            </div>
        `;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    checkInCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCheckInModal);
    });

    modalBody.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-open-check-in-modal]');
        if (!trigger) {
            return;
        }

        openCheckInModal(trigger.getAttribute('data-open-check-in-modal'));
    });

    checkInForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!pendingReservationId) {
            return;
        }

        const submitButton = checkInForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Checking in...';
        }

        const formData = new FormData(checkInForm);
        const guestMode = formData.get('check_in_guest_mode');
        const primaryGuest = guestMode === 'with_primary' ? {
            first_name: formData.get('check_in_primary_guest[first_name]'),
            middle_name: formData.get('check_in_primary_guest[middle_name]'),
            last_name: formData.get('check_in_primary_guest[last_name]'),
            age: formData.get('check_in_primary_guest[age]'),
            gender: formData.get('check_in_primary_guest[gender]'),
            nationality_option: formData.get('check_in_primary_guest[nationality_option]'),
            nationality: formData.get('check_in_primary_guest[nationality_option]') === 'Foreign' ? formData.get('check_in_primary_guest[nationality]') : formData.get('check_in_primary_guest[nationality_option]'),
            phone: formData.get('check_in_primary_guest[phone]'),
            email: formData.get('check_in_primary_guest[email]'),
        } : null;

        try {
            const response = await fetch(`/staff/reservations/${pendingReservationId}/check-in`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    guest_mode: guestMode,
                    primary_guest: primaryGuest,
                    primary_guest_id: primaryGuestToUpdate?.customer_id || null,
                    companions: checkInCompanions,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.message || 'Unable to check in this reservation.');
            }

            window.location.reload();
        } catch (error) {
            window.alert(error.message || 'Unable to check in this reservation.');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Create Reservation';
            }
        }
    });

    rows.forEach((row) => {
        const openForRow = () => {
            openModal(row.dataset.reservationId);
        };

        row.addEventListener('click', openForRow);
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openForRow();
            }
        });
    });

    const applyFilters = () => {
        const query = searchInput?.value.trim().toLowerCase() || '';
        const sortValue = sortSelect?.value || 'date-asc';
        const statusValue = statusFilter?.value || 'all';
        const checkInFromValue = checkInFrom?.value || '';
        const checkInToValue = checkInTo?.value || '';

        let filteredRows = rows.filter((row) => {
            const searchText = (row.getAttribute('data-search') || '').toLowerCase();
            const matchesSearch = !query || searchText.includes(query);
            const matchesStatus = statusValue === 'all' || row.getAttribute('data-status') === statusValue;
            const checkIn = row.getAttribute('data-check-in') || '';
            const matchesCheckInFrom = !checkInFromValue || !checkIn || checkIn >= checkInFromValue;
            const matchesCheckInTo = !checkInToValue || !checkIn || checkIn <= checkInToValue;
            return matchesSearch && matchesStatus && matchesCheckInFrom && matchesCheckInTo;
        });

        filteredRows.sort((left, right) => {
            const leftName = (left.getAttribute('data-booker-name') || '').trim().toLowerCase();
            const rightName = (right.getAttribute('data-booker-name') || '').trim().toLowerCase();
            const leftDate = left.getAttribute('data-check-in') || '';
            const rightDate = right.getAttribute('data-check-in') || '';
            const leftAmount = Number(left.getAttribute('data-total-amount') || 0);
            const rightAmount = Number(right.getAttribute('data-total-amount') || 0);

            switch (sortValue) {
                case 'date-desc':
                    return rightDate.localeCompare(leftDate);
                case 'name-asc':
                    return leftName.localeCompare(rightName);
                case 'name-desc':
                    return rightName.localeCompare(leftName);
                case 'amount-desc':
                    return rightAmount - leftAmount;
                case 'date-asc':
                default:
                    return leftDate.localeCompare(rightDate);
            }
        });

        rows.forEach((row) => {
            row.classList.add('is-hidden');
            row.style.display = 'none';
        });

        filteredRows.forEach((row) => {
            row.classList.remove('is-hidden');
            row.style.display = '';
            tableBody.appendChild(row);
        });

        if (resultsCount) {
            resultsCount.textContent = `Showing ${filteredRows.length} of ${rows.length} reservation${rows.length === 1 ? '' : 's'}`;
        }
    };

    [searchInput, sortSelect, statusFilter, checkInFrom, checkInTo].forEach((control) => {
        control?.addEventListener('input', applyFilters);
        control?.addEventListener('change', applyFilters);
    });

    clearButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'date-asc';
        if (statusFilter) statusFilter.value = 'all';
        if (checkInFrom) checkInFrom.value = '';
        if (checkInTo) checkInTo.value = '';
        applyFilters();
    });

    filterToggle?.addEventListener('click', () => {
        const isExpanded = filterToggle.getAttribute('aria-expanded') === 'true';
        filterToggle.setAttribute('aria-expanded', String(!isExpanded));
        filterPanel?.toggleAttribute('hidden', isExpanded);
        filterPanel?.classList.toggle('guest-toolbar--collapsed', isExpanded);
    });

    applyFilters();
});
