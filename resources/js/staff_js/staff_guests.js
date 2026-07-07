document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('guestModal');
    const addModal = document.getElementById('addGuestModal');
    const modalBody = document.getElementById('guestModalBody');
    const closeButtons = document.querySelectorAll('[data-close-modal="true"]');
    const addCloseButtons = document.querySelectorAll('[data-close-add-modal="true"]');
    const addGuestButton = document.querySelector('[data-open-add-guest-modal="true"]');
    const form = document.getElementById('addGuestForm');
    const primaryGuestSection = document.getElementById('primaryGuestSection');
    const companionList = document.getElementById('companionList');
    const companionHiddenFields = document.getElementById('companionHiddenFields');
    const addCompanionButton = document.getElementById('addCompanionBtn');
    const companionModal = document.getElementById('companionModal');
    const companionForm = document.getElementById('companionForm');
    const companionCloseButtons = document.querySelectorAll('[data-close-companion-modal="true"]');
    const amenityModal = document.getElementById('amenityModal');
    const chooseAmenitiesButton = document.getElementById('chooseAmenitiesBtn');
    const amenityCloseButtons = document.querySelectorAll('[data-close-amenity-modal="true"]');
    const companions = [];
    const amenitiesContainer = document.getElementById('amenitiesContainer');
    const selectedAmenitiesContainer = document.getElementById('selectedAmenitiesContainer');
    const reservationTotal = document.getElementById('reservationTotal');
    const totalAmountInput = document.getElementById('totalAmountInput');
    const guestData = window.staffGuestData || {};
    const primaryNationalityOption = document.getElementById('primaryGuestNationalityOption');
    const primaryNationalityTextField = document.getElementById('primaryGuestNationalityTextField');
    const primaryNationalityText = document.getElementById('primaryGuestNationalityText');
    const companionNationalityOption = document.getElementById('companionNationalityOption');
    const companionNationalityTextField = document.getElementById('companionNationalityTextField');
    const companionNationalityText = document.getElementById('companionNationalityText');
    const searchInput = document.getElementById('guestSearchInput');
    const sortSelect = document.getElementById('guestSortSelect');
    const checkInFrom = document.getElementById('guestCheckInFrom');
    const checkInTo = document.getElementById('guestCheckInTo');
    const checkOutFrom = document.getElementById('guestCheckOutFrom');
    const checkOutTo = document.getElementById('guestCheckOutTo');
    const clearButton = document.getElementById('guestFiltersClear');
    const resultsCount = document.getElementById('guestResultsCount');
    const filterToggle = document.getElementById('guestFilterToggle');
    const filterPanel = document.getElementById('guestFilterPanel');
    const summaryTotal = document.getElementById('guestSummaryTotal');
    const summaryFemale = document.getElementById('guestSummaryFemale');
    const summaryMale = document.getElementById('guestSummaryMale');
    const summaryForeign = document.getElementById('guestSummaryForeign');
    const summaryFilipino = document.getElementById('guestSummaryFilipino');
    const tableBody = document.getElementById('guestTableBody');
    const tableRows = Array.from(tableBody?.querySelectorAll('.guest-row') ?? []);

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
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
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_');
    const isCheckedOutStatus = (value) => ['checked_out', 'checkedout', 'checked-out'].includes(normalizeStatus(value));
    const toggleNationalityFields = () => {
        const primaryForeign = primaryNationalityOption?.value === 'Foreign';
        if (primaryNationalityTextField) {
            primaryNationalityTextField.style.display = primaryForeign ? 'block' : 'none';
        }
        if (primaryNationalityText && !primaryForeign) {
            primaryNationalityText.value = '';
        }

        const companionForeign = companionNationalityOption?.value === 'Foreign';
        if (companionNationalityTextField) {
            companionNationalityTextField.style.display = companionForeign ? 'block' : 'none';
        }
        if (companionNationalityText && !companionForeign) {
            companionNationalityText.value = '';
        }
    };

    const roleLabelElement = document.getElementById('guestModalRole');

    const openModal = (customerId, customerName, customerAge, customerGender, customerNationality, reservationType) => {
        const customerData = guestData?.[customerId] ?? null;
        const guestRole = customerData?.reservation_guests?.some((entry) => entry.is_primary_guest) ? 'Main Guest' : 'Companion';

        if (roleLabelElement) {
            roleLabelElement.textContent = guestRole;
            roleLabelElement.classList.toggle('guest-modal__role-badge--primary', guestRole === 'Main Guest');
            roleLabelElement.classList.toggle('guest-modal__role-badge--companion', guestRole === 'Companion');
        }

        if (!customerData) {
            modalBody.innerHTML = '<p class="guest-empty">No additional detail available.</p>';
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
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
            const amenities = (reservation?.reservation_amenities || []).map((amenity) => {
                const amenityName = amenity.amenity?.amenities_name ?? 'Unknown amenity';
                return `<li>${escapeHtml(amenityName)} (${escapeHtml(amenity.pricing_type)})</li>`;
            }).join('');

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
                    const companionName = companionGuest?.customer ? [companionGuest.customer.first_name, companionGuest.customer.last_name].filter(Boolean).join(' ').trim() : 'Unnamed companion';
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
                    <div class="guest-card__grid">
                        <div>
                            <span class="guest-label">Reservation Type</span>
                            <div class="guest-value">${escapeHtml((reservation?.reservation_type === 'walk_in' ? 'walk-in' : reservation?.reservation_type) || 'N/A')}</div>
                        </div>
                        <div>
                            <span class="guest-label">Status</span>
                            <div class="guest-value">${escapeHtml(reservation?.status ?? 'N/A')}</div>
                        </div>
                        <div>
                            <span class="guest-label">Check-in</span>
                            <div class="guest-value">${escapeHtml(reservation?.check_in ?? 'N/A')}</div>
                        </div>
                        <div>
                            <span class="guest-label">Checked Out</span>
                            <div class="guest-value">${escapeHtml(entry?.checked_out_at ? formatDateTime(entry.checked_out_at) : 'Not Yet')}</div>
                        </div>
                    </div>
                    <div class="guest-card__grid" style="margin-top:0.75rem;">
                        <div>
                            <span class="guest-label">Booker</span>
                            <div class="guest-value">${escapeHtml(reservation?.booker_name ?? 'N/A')}</div>
                        </div>
                    </div>
                    <div style="margin-top:0.75rem;">
                        <div class="guest-relationship-header">Guests in this reservation</div>
                        <div class="guest-relationship-list">
                            ${primaryGuestMarkup}
                            ${companionMarkup}
                        </div>
                    </div>
                    <div style="margin-top:0.75rem;">
                        <span class="guest-label">Reserved Amenities</span>
                        <ul class="guest-list">${amenities || '<li>No amenities listed.</li>'}</ul>
                    </div>
                    <div class="guest-form__actions" style="margin-top:0.75rem;">
                        <button type="button" class="guest-form__button guest-checkout-action" data-checkout-reservation-guest-id="${entry?.id ?? ''}" ${isCheckedOut ? 'disabled' : ''}>${isCheckedOut ? 'Checked Out' : 'Check Out'}</button>
                    </div>
                </div>
            `;
        }).join('');

        modalBody.innerHTML = `
            <div class="guest-card">
                <div class="guest-card__grid">
                    <div>
                        <span class="guest-label">Full Name</span>
                        <div class="guest-value">${customerName}</div>
                    </div>
                    <div>
                        <span class="guest-label">Age</span>
                        <div class="guest-value">${customerAge}</div>
                    </div>
                    <div>
                        <span class="guest-label">Gender</span>
                        <div class="guest-value">${customerGender}</div>
                    </div>
                    <div>
                        <span class="guest-label">Nationality</span>
                        <div class="guest-value">${customerNationality}</div>
                    </div>
                    <div>
                        <span class="guest-label">Reservation Type</span>
                        <div class="guest-value">${reservationType}</div>
                    </div>
                </div>
            </div>
            ${reservationDetails || '<div class="guest-card"><p class="guest-empty">No reservation details available.</p></div>'}
        `;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    modalBody.addEventListener('click', async (event) => {
        const checkoutButton = event.target.closest('.guest-checkout-action');
        if (!checkoutButton) {
            return;
        }

        const reservationGuestId = checkoutButton.getAttribute('data-checkout-reservation-guest-id');
        console.log('Checkout clicked:', { reservationGuestId, disabled: checkoutButton.disabled });
        
        if (!reservationGuestId || checkoutButton.disabled) {
            console.warn('Checkout blocked:', { reservationGuestId, disabled: checkoutButton.disabled });
            return;
        }

        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Checking out...';

        try {
            const url = `/staff/reservation-guests/${reservationGuestId}/check-out`;
            console.log('Posting to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({}),
            });

            console.log('Response status:', response.status);
            
            const payload = await response.json().catch(() => ({}));
            console.log('Response payload:', payload);
            
            if (!response.ok) {
                throw new Error(payload.message || 'Unable to update the reservation right now.');
            }

            window.location.reload();
        } catch (error) {
            console.error('Checkout error:', error);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Check Out';
            window.alert(error.message || 'Unable to update the reservation.');
        }
    });

    document.querySelectorAll('.guest-row').forEach((row) => {
        const openForRow = () => {
            const customerId = row.dataset.customerId;
            const customerName = row.querySelector('.guest-name')?.textContent?.trim() ?? 'Guest';
            const customerAge = row.dataset.age || 'N/A';
            const customerGender = row.dataset.gender || 'N/A';
            const customerNationality = row.dataset.nationality || 'N/A';
            const reservationType = row.dataset.reservationType || 'N/A';

            openModal(customerId, customerName, customerAge, customerGender, customerNationality, reservationType);
        };

        row.addEventListener('click', openForRow);
        row.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openForRow();
            }
        });
    });

    const updateGuestSummary = (rows) => {
        if (!summaryTotal || !summaryFemale || !summaryMale || !summaryForeign || !summaryFilipino) {
            return;
        }

        const femaleCount = rows.filter((row) => (row.getAttribute('data-gender') || '').toLowerCase() === 'female').length;
        const maleCount = rows.filter((row) => (row.getAttribute('data-gender') || '').toLowerCase() === 'male').length;
        const foreignCount = rows.filter((row) => row.getAttribute('data-is-foreign') === 'true').length;
        const filipinoCount = rows.filter((row) => row.getAttribute('data-is-foreign') !== 'true').length;

        summaryTotal.textContent = rows.length;
        summaryFemale.textContent = femaleCount;
        summaryMale.textContent = maleCount;
        summaryForeign.textContent = foreignCount;
        summaryFilipino.textContent = filipinoCount;
    };

    const applyGuestFilters = () => {
        if (!tableBody) {
            return;
        }

        const query = searchInput?.value.trim().toLowerCase() ?? '';
        const checkInFromValue = checkInFrom?.value ?? '';
        const checkInToValue = checkInTo?.value ?? '';
        const checkOutFromValue = checkOutFrom?.value ?? '';
        const checkOutToValue = checkOutTo?.value ?? '';
        const sortValue = sortSelect?.value ?? 'name-asc';

        const filteredRows = tableRows.filter((row) => {
            const searchText = (row.getAttribute('data-search') || '').toLowerCase();
            const matchesSearch = !query || searchText.includes(query);
            const checkIn = row.getAttribute('data-check-in') || '';
            const checkOut = row.getAttribute('data-check-out') || '';
            const checkedOutAt = row.getAttribute('data-checked-out-at') || '';
            const matchesActiveStatus = !summaryTotal || (!checkedOutAt && !isCheckedOutStatus(row.getAttribute('data-status')));
            const matchesCheckInFrom = !checkInFromValue || !checkIn || checkIn >= checkInFromValue;
            const matchesCheckInTo = !checkInToValue || !checkIn || checkIn <= checkInToValue;
            const matchesCheckOutFrom = !checkOutFromValue || !checkOut || checkOut >= checkOutFromValue;
            const matchesCheckOutTo = !checkOutToValue || !checkOut || checkOut <= checkOutToValue;

            return matchesSearch && matchesActiveStatus && matchesCheckInFrom && matchesCheckInTo && matchesCheckOutFrom && matchesCheckOutTo;
        });

        filteredRows.sort((left, right) => {
            const leftAge = Number(left.getAttribute('data-age-value') || 999999);
            const rightAge = Number(right.getAttribute('data-age-value') || 999999);
            const leftName = (left.querySelector('.guest-name')?.textContent ?? '').trim().toLowerCase();
            const rightName = (right.querySelector('.guest-name')?.textContent ?? '').trim().toLowerCase();
            const leftReservationType = (left.getAttribute('data-reservation-type') || '').trim().toLowerCase();
            const rightReservationType = (right.getAttribute('data-reservation-type') || '').trim().toLowerCase();

            switch (sortValue) {
                case 'name-desc':
                    return rightName.localeCompare(leftName);
                case 'age-asc':
                    return leftAge - rightAge;
                case 'age-desc':
                    return rightAge - leftAge;
                case 'reservation-asc':
                    return leftReservationType.localeCompare(rightReservationType);
                case 'name-asc':
                default:
                    return leftName.localeCompare(rightName);
            }
        });

        const existingEmptyState = document.getElementById('guestEmptyStateRow');
        if (existingEmptyState) {
            existingEmptyState.remove();
        }

        tableRows.forEach((row) => {
            row.classList.add('is-hidden');
            row.style.display = 'none';
        });

        filteredRows.forEach((row) => {
            row.classList.remove('is-hidden');
            row.style.display = '';
            tableBody.appendChild(row);
        });

        if (!filteredRows.length) {
            const emptyRow = document.createElement('tr');
            emptyRow.id = 'guestEmptyStateRow';
            emptyRow.innerHTML = '<td colspan="5" class="guest-empty">No guest records matched your filters.</td>';
            tableBody.appendChild(emptyRow);
        }

        updateGuestSummary(filteredRows);

        if (resultsCount) {
            resultsCount.textContent = `Showing ${filteredRows.length} of ${tableRows.length} active guest${tableRows.length === 1 ? '' : 's'}`;
        }
    };

    const togglePrimaryGuestSection = () => {
        if (!form || !primaryGuestSection) {
            return;
        }

        const guestMode = form.querySelector('input[name="guest_mode"]:checked')?.value;
        primaryGuestSection.style.display = guestMode === 'with_primary' ? 'block' : 'none';
    };

    const renderCompanions = () => {
        companionList.innerHTML = '';
        companionHiddenFields.innerHTML = '';

        if (!companions.length) {
            companionList.innerHTML = '<p class="guest-empty">No companions added yet.</p>';
            return;
        }

        companions.forEach((companion, index) => {
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
            deleteBtn.setAttribute('aria-label', `Remove ${name}`);
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                companions.splice(index, 1);
                renderCompanions();
            });
            item.appendChild(deleteBtn);
            
            companionList.appendChild(item);

            const hiddenFirstName = document.createElement('input');
            hiddenFirstName.type = 'hidden';
            hiddenFirstName.name = `companions[${index}][first_name]`;
            hiddenFirstName.value = companion.first_name || '';
            companionHiddenFields.appendChild(hiddenFirstName);

            const hiddenMiddleName = document.createElement('input');
            hiddenMiddleName.type = 'hidden';
            hiddenMiddleName.name = `companions[${index}][middle_name]`;
            hiddenMiddleName.value = companion.middle_name || '';
            companionHiddenFields.appendChild(hiddenMiddleName);

            const hiddenLastName = document.createElement('input');
            hiddenLastName.type = 'hidden';
            hiddenLastName.name = `companions[${index}][last_name]`;
            hiddenLastName.value = companion.last_name || '';
            companionHiddenFields.appendChild(hiddenLastName);

            const hiddenAge = document.createElement('input');
            hiddenAge.type = 'hidden';
            hiddenAge.name = `companions[${index}][age]`;
            hiddenAge.value = companion.age || '';
            companionHiddenFields.appendChild(hiddenAge);

            const hiddenGender = document.createElement('input');
            hiddenGender.type = 'hidden';
            hiddenGender.name = `companions[${index}][gender]`;
            hiddenGender.value = companion.gender || '';
            companionHiddenFields.appendChild(hiddenGender);

            const hiddenNationality = document.createElement('input');
            hiddenNationality.type = 'hidden';
            hiddenNationality.name = `companions[${index}][nationality]`;
            hiddenNationality.value = companion.nationality || '';
            companionHiddenFields.appendChild(hiddenNationality);

            const hiddenNationalityOption = document.createElement('input');
            hiddenNationalityOption.type = 'hidden';
            hiddenNationalityOption.name = `companions[${index}][nationality_option]`;
            hiddenNationalityOption.value = companion.nationality_option || 'Filipino';
            companionHiddenFields.appendChild(hiddenNationalityOption);

            const hiddenPhone = document.createElement('input');
            hiddenPhone.type = 'hidden';
            hiddenPhone.name = `companions[${index}][phone]`;
            hiddenPhone.value = companion.phone || '';
            companionHiddenFields.appendChild(hiddenPhone);

            const hiddenEmail = document.createElement('input');
            hiddenEmail.type = 'hidden';
            hiddenEmail.name = `companions[${index}][email]`;
            hiddenEmail.value = companion.email || '';
            companionHiddenFields.appendChild(hiddenEmail);
        });
    };

    const openCompanionModal = () => {
        companionForm.reset();
        companionModal.classList.add('is-open');
        companionModal.setAttribute('aria-hidden', 'false');
    };

    const closeCompanionModal = () => {
        companionModal.classList.remove('is-open');
        companionModal.setAttribute('aria-hidden', 'true');
    };

    companionForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(companionForm);
        const companion = Object.fromEntries(formData.entries());
        companions.push(companion);
        renderCompanions();
        closeCompanionModal();
    });

    const updateAmenitySelection = () => {
        const selectedEntries = [];
        amenitiesContainer.querySelectorAll('.guest-amenity-option').forEach((option) => {
            const checkbox = option.querySelector('.amenity-checkbox');
            const select = option.querySelector('.guest-amenity-option__select');
            if (!checkbox.checked) {
                return;
            }
            const chosenOption = select.options[select.selectedIndex];
            const price = Number(chosenOption?.dataset?.price || 0);
            selectedEntries.push({
                amenityId: checkbox.dataset.amenityId,
                amenityName: checkbox.dataset.amenityName,
                pricingType: chosenOption?.value || 'Daytime',
                priceAtBooking: price,
            });
        });

        selectedAmenitiesContainer.innerHTML = selectedEntries.length
            ? selectedEntries.map((entry) => `
                <div class="guest-selected-amenity">
                    <span>${entry.amenityName}</span>
                    <strong>${entry.pricingType} — ₱${Number(entry.priceAtBooking).toFixed(2)}</strong>
                </div>
            `).join('')
            : '<p class="guest-empty">No amenities selected.</p>';

        const total = selectedEntries.reduce((sum, entry) => sum + Number(entry.priceAtBooking || 0), 0);
        reservationTotal.textContent = `₱${total.toFixed(2)}`;
        totalAmountInput.value = total.toFixed(2);

        document.querySelectorAll('.selected-amenity-input').forEach((input) => input.remove());

        selectedEntries.forEach((entry, index) => {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = `selected_amenities[${index}][amenity_id]`;
            hiddenInput.value = entry.amenityId;
            hiddenInput.className = 'selected-amenity-input';

            const pricingInput = document.createElement('input');
            pricingInput.type = 'hidden';
            pricingInput.name = `selected_amenities[${index}][pricing_type]`;
            pricingInput.value = entry.pricingType;
            pricingInput.className = 'selected-amenity-input';

            const priceInput = document.createElement('input');
            priceInput.type = 'hidden';
            priceInput.name = `selected_amenities[${index}][price_at_booking]`;
            priceInput.value = entry.priceAtBooking;
            priceInput.className = 'selected-amenity-input';

            hiddenInput.dataset.index = String(index);
            pricingInput.dataset.index = String(index);
            priceInput.dataset.index = String(index);

            selectedAmenitiesContainer.appendChild(hiddenInput);
            selectedAmenitiesContainer.appendChild(pricingInput);
            selectedAmenitiesContainer.appendChild(priceInput);
        });
    };

    const resetAmenityHiddenInputs = () => {
        document.querySelectorAll('.selected-amenity-input').forEach((input) => input.remove());
    };

    const openAmenityModal = () => {
        amenityModal.classList.add('is-open');
        amenityModal.setAttribute('aria-hidden', 'false');
    };

    const closeAmenityModal = () => {
        amenityModal.classList.remove('is-open');
        amenityModal.setAttribute('aria-hidden', 'true');
    };

    const openAddGuestModal = () => {
        addModal.classList.add('is-open');
        addModal.setAttribute('aria-hidden', 'false');
    };

    const closeAddGuestModal = () => {
        addModal.classList.remove('is-open');
        addModal.setAttribute('aria-hidden', 'true');
        form.reset();
        toggleNationalityFields();
        companions.length = 0;
        renderCompanions();
        resetAmenityHiddenInputs();
        reservationTotal.textContent = '₱0.00';
        totalAmountInput.value = '0';
        selectedAmenitiesContainer.innerHTML = '<p class="guest-empty">No amenities selected.</p>';
        togglePrimaryGuestSection();
    };

    addGuestButton?.addEventListener('click', (event) => {
        event.preventDefault();
        openAddGuestModal();
    });

    addCloseButtons.forEach((button) => {
        button.addEventListener('click', closeAddGuestModal);
    });

    if (addModal) {
        addModal.addEventListener('click', (event) => {
            if (event.target === addModal || event.target.classList.contains('guest-modal__backdrop')) {
                closeAddGuestModal();
            }
        });
    }

    if (form) {
        form.querySelectorAll('input[name="guest_mode"]').forEach((radio) => {
            radio.addEventListener('change', togglePrimaryGuestSection);
        });
        primaryNationalityOption?.addEventListener('change', toggleNationalityFields);
    }

    addCompanionButton?.addEventListener('click', openCompanionModal);
    companionNationalityOption?.addEventListener('change', toggleNationalityFields);
    chooseAmenitiesButton?.addEventListener('click', openAmenityModal);

    companionCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCompanionModal);
    });

    if (companionModal) {
        companionModal.addEventListener('click', (event) => {
            if (event.target === companionModal || event.target.classList.contains('guest-modal__backdrop')) {
                closeCompanionModal();
            }
        });
    }

    amenityCloseButtons.forEach((button) => {
        button.addEventListener('click', closeAmenityModal);
    });

    if (amenityModal) {
        amenityModal.addEventListener('click', (event) => {
            if (event.target === amenityModal || event.target.classList.contains('guest-modal__backdrop')) {
                closeAmenityModal();
            }
        });
    }

    if (amenitiesContainer) {
        amenitiesContainer.querySelectorAll('.guest-amenity-option').forEach((option) => {
            const checkbox = option.querySelector('.amenity-checkbox');
            const select = option.querySelector('.guest-amenity-option__select');
            checkbox.addEventListener('change', () => {
                select.disabled = !checkbox.checked;
                updateAmenitySelection();
            });
            select.addEventListener('change', updateAmenitySelection);
        });
    }

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        });
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.classList.contains('guest-modal__backdrop')) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            closeAddGuestModal();
            closeCompanionModal();
            closeAmenityModal();
        }
    });

    [searchInput, sortSelect, checkInFrom, checkInTo, checkOutFrom, checkOutTo].forEach((element) => {
        element?.addEventListener('input', applyGuestFilters);
        element?.addEventListener('change', applyGuestFilters);
    });

    filterToggle?.addEventListener('click', () => {
        if (!filterPanel) {
            return;
        }

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

    togglePrimaryGuestSection();
    toggleNationalityFields();
    updateAmenitySelection();
    renderCompanions();
    applyGuestFilters();
});
