document.addEventListener('DOMContentLoaded', () => {
    const filterType = document.getElementById('filterType');
    const filterMin = document.getElementById('filterMin');
    const filterMax = document.getElementById('filterMax');
    const cards = Array.from(document.querySelectorAll('.rp-card'));
    const grid = document.getElementById('amenityGrid');
    const emptyState = document.getElementById('emptyState');
    const modal = document.getElementById('amenityModal');
    const modalClose = document.querySelectorAll('[data-close-modal]');
    const modalName = document.getElementById('modalName');
    const modalDate = document.getElementById('modalDate');
    const modalSlot = document.getElementById('modalSlot');
    const modalCapacity = document.getElementById('modalCapacity');
    const modalPriceLabel = document.getElementById('modalPriceLabel');
    const modalPriceValue = document.getElementById('modalPriceValue');
    const modalPriceHint = document.getElementById('modalPriceHint');
    const modalDescription = document.getElementById('modalDescription');
    const airconChoice = document.getElementById('airconChoice');
    const bookingForm = document.getElementById('bookingForm');
    const bookingNotice = document.getElementById('bookingNotice');
    const dateInput = document.getElementById('reservation_date');
    const reservationDay = document.getElementById('reservationDay');
    const slotButtons = document.querySelectorAll('[data-slot]');

    if (!grid || cards.length === 0) {
        return;
    }

    let selectedSlot = 'Daytime';
    let activeAmenity = null;

    const availabilityMap = {
        '2026-07-02': {
            Daytime: ['amenity-1'],
            Nighttime: ['amenity-2']
        },
        '2026-07-03': {
            Daytime: ['amenity-2'],
            Nighttime: []
        }
    };

    const getWeekday = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'long' });
    };

    const updateReservationDay = () => {
        if (!reservationDay || !dateInput.value) return;
        reservationDay.textContent = getWeekday(dateInput.value);
    };

    const isAvailableForSlot = (card, dateString, slot) => {
        const occupiedIds = availabilityMap[dateString]?.[slot] || [];
        return !occupiedIds.includes(card.dataset.amenityId);
    };

    const applyFilters = () => {
        let visibleCount = 0;
        const mode = filterType.value;
        const min = Number(filterMin.value);
        const max = Number(filterMax.value);

        cards.forEach(card => {
            const slotMatch = isAvailableForSlot(card, dateInput.value, selectedSlot);
            let filterMatch = true;

            if (mode === 'capacity') {
                const minValue = Number(card.dataset.minCapacity);
                const maxValue = Number(card.dataset.maxCapacity);
                const validMin = Number.isFinite(min) ? maxValue >= min : true;
                const validMax = Number.isFinite(max) ? minValue <= max : true;
                filterMatch = validMin && validMax;
            } else if (mode === 'price') {
                const minValue = Number(card.dataset.minPrice);
                const maxValue = Number(card.dataset.maxPrice);
                const validMin = Number.isFinite(min) ? maxValue >= min : true;
                const validMax = Number.isFinite(max) ? minValue <= max : true;
                filterMatch = validMin && validMax;
            }

            const visible = slotMatch && filterMatch;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (grid) {
            grid.style.display = visibleCount > 0 ? 'grid' : 'none';
        }

        if (emptyState) {
            emptyState.style.display = visibleCount > 0 ? 'none' : 'block';
        }
    };

    const setActiveSlot = (slot) => {
        selectedSlot = slot;
        slotButtons.forEach(button => {
            button.classList.toggle('is-active', button.dataset.slot === slot);
        });
        applyFilters();
    };

    const updateRangeInputs = () => {
        const mode = filterType.value;
        if (mode === 'all') {
            filterMin.disabled = true;
            filterMax.disabled = true;
            filterMin.value = '';
            filterMax.value = '';
            applyFilters();
            return;
        }

        filterMin.disabled = false;
        filterMax.disabled = false;
        applyFilters();
    };

    const renderBookingSelection = (card, choice) => {
        const basePrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimePrice)
            : Number(card.dataset.daytimePrice);
        const airconPrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimeAirconPrice)
            : Number(card.dataset.daytimeAirconPrice);
        const selectedPrice = choice === 'with' ? airconPrice : basePrice;
        const isAircon = choice === 'with';

        modalPriceLabel.textContent = isAircon ? 'Aircon package' : 'Standard package';
        modalPriceValue.textContent = `₱${selectedPrice.toFixed(2)}`;
        modalPriceHint.textContent = isAircon
            ? 'Air-conditioned pricing for this booking slot.'
            : 'Standard pricing for this booking slot.';

        bookingForm.classList.remove('is-hidden');
        const checkInInput = document.getElementById('bookingCheckIn');
        const checkOutInput = document.getElementById('bookingCheckOut');
        if (checkInInput) checkInInput.value = dateInput.value;
        if (checkOutInput) checkOutInput.value = dateInput.value;
        const guestInput = bookingForm.querySelector('input[name="number_of_guests"]');
        if (guestInput) guestInput.value = card.dataset.minCapacity || '1';
    };

    const openModal = (card) => {
        activeAmenity = card;
        bookingNotice.textContent = '';
        modalName.textContent = card.dataset.name;
        modalDate.textContent = dateInput.value;
        modalSlot.textContent = selectedSlot;
        modalCapacity.textContent = `${card.dataset.minCapacity}–${card.dataset.maxCapacity} guests`;
        modalDescription.textContent = card.dataset.description || 'No additional details available.';

        const hasAircon = card.dataset.hasAircon === '1';
        if (hasAircon) {
            airconChoice.innerHTML = `
                <button type="button" class="rp-choice-btn" data-aircon-choice="with">With Aircon</button>
                <button type="button" class="rp-choice-btn" data-aircon-choice="without">Without Aircon</button>
            `;
            airconChoice.style.display = 'flex';
            bookingForm.classList.add('is-hidden');
            bookingForm.reset();
        } else {
            airconChoice.innerHTML = '';
            airconChoice.style.display = 'none';
            renderBookingSelection(card, 'without');
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    dateInput.addEventListener('change', () => {
        updateReservationDay();
        applyFilters();
    });

    updateReservationDay();
    applyFilters();

    slotButtons.forEach(button => {
        button.addEventListener('click', () => setActiveSlot(button.dataset.slot));
    });

    if (filterType) {
        filterType.addEventListener('change', () => updateRangeInputs());
    }

    [filterMin, filterMax].forEach(input => {
        input.addEventListener('input', () => {
            if (filterType.value !== 'all') {
                applyFilters();
            }
        });
    });

    document.querySelectorAll('[data-open-modal]').forEach(button => {
        button.addEventListener('click', () => {
            openModal(button.closest('.rp-card'));
        });
    });

    airconChoice.addEventListener('click', (event) => {
        const button = event.target.closest('[data-aircon-choice]');
        if (!button || !activeAmenity) {
            return;
        }
        renderBookingSelection(activeAmenity, button.dataset.airconChoice);
    });

    const submitButton = bookingForm.querySelector('button[type="submit"]');
    let isSubmitting = false;

    const setSubmittingState = (submitting) => {
        isSubmitting = submitting;
        bookingForm.querySelectorAll('input, button').forEach((element) => {
            element.disabled = submitting;
        });

        if (submitButton) {
            submitButton.disabled = submitting;
            submitButton.textContent = submitting ? 'Reserving…' : 'Reserve prototype';
            submitButton.classList.toggle('is-loading', submitting);
        }
    };

    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!activeAmenity || isSubmitting) {
            if (!activeAmenity) {
                bookingNotice.textContent = 'Please select an amenity first.';
            }
            return;
        }

        const formData = new FormData(bookingForm);
        const payload = {
            booker_name: formData.get('booker_name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            number_of_guests: Number(formData.get('number_of_guests')),
            amenity_id: activeAmenity.dataset.amenityId,
            pricing_type: modalPriceLabel.textContent === 'Aircon package' ? `${selectedSlot} Aircon` : selectedSlot,
            price_at_booking: Number(modalPriceValue.textContent.replace('₱', '').replace(',', '')),
            check_in: dateInput.value,
            check_out: dateInput.value,
            slot: selectedSlot,
        };

        setSubmittingState(true);
        bookingNotice.textContent = 'Saving your reservation…';

        try {
            const response = await fetch('/reservation/prototype', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                bookingNotice.textContent = 'Prototype reservation saved and marked partially paid.';
                bookingForm.reset();
            } else {
                bookingNotice.textContent = result.message || 'Reservation could not be saved.';
            }
        } catch (error) {
            bookingNotice.textContent = 'Reservation could not be saved.';
        } finally {
            setSubmittingState(false);
        }
    });

    modalClose.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
    