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

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

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
                            <span class="guest-label">Check-out</span>
                            <div class="guest-value">${escapeHtml(reservation?.check_out ?? 'N/A')}</div>
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

    const togglePrimaryGuestSection = () => {
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
            item.textContent = name;
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

    addModal.addEventListener('click', (event) => {
        if (event.target === addModal || event.target.classList.contains('guest-modal__backdrop')) {
            closeAddGuestModal();
        }
    });

    form.querySelectorAll('input[name="guest_mode"]').forEach((radio) => {
        radio.addEventListener('change', togglePrimaryGuestSection);
    });

    addCompanionButton?.addEventListener('click', openCompanionModal);
    chooseAmenitiesButton?.addEventListener('click', openAmenityModal);

    companionCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCompanionModal);
    });

    companionModal.addEventListener('click', (event) => {
        if (event.target === companionModal || event.target.classList.contains('guest-modal__backdrop')) {
            closeCompanionModal();
        }
    });

    amenityCloseButtons.forEach((button) => {
        button.addEventListener('click', closeAmenityModal);
    });

    amenityModal.addEventListener('click', (event) => {
        if (event.target === amenityModal || event.target.classList.contains('guest-modal__backdrop')) {
            closeAmenityModal();
        }
    });

    amenitiesContainer.querySelectorAll('.guest-amenity-option').forEach((option) => {
        const checkbox = option.querySelector('.amenity-checkbox');
        const select = option.querySelector('.guest-amenity-option__select');
        checkbox.addEventListener('change', () => {
            select.disabled = !checkbox.checked;
            updateAmenitySelection();
        });
        select.addEventListener('change', updateAmenitySelection);
    });

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

    togglePrimaryGuestSection();
    updateAmenitySelection();
    renderCompanions();
});
