document.addEventListener('DOMContentLoaded', () => {
    const filterType = document.getElementById('filterType');
    const filterMin = document.getElementById('filterMin');
    const filterMax = document.getElementById('filterMax');
    const cards = Array.from(document.querySelectorAll('.rp-card'));
    const grid = document.getElementById('amenityGrid');
    const emptyState = document.getElementById('emptyState');
    const modal = document.getElementById('amenityModal');
    const modalClose = document.querySelectorAll('[data-close-modal]');
    const multiSelectionToggle = document.getElementById('multiSelectionToggle');
    const selectionFloatingBar = document.getElementById('selectionFloatingBar');
    const selectionCountLabel = document.getElementById('selectionCountLabel');
    const selectionCheckoutBtn = document.getElementById('selectionCheckoutBtn');
    const selectionSheet = document.getElementById('selectionSheet');
    const selectionSummaryList = document.getElementById('selectionSummaryList');
    const selectionContinueBtn = document.getElementById('selectionContinueBtn');
    const selectionCloseButtons = document.querySelectorAll('[data-close-selection]');
    const selectionMathText = document.getElementById('selectionMathText');
    const selectionTotalPrice = document.getElementById('selectionTotalPrice');
    const modalName = document.getElementById('modalName');
    const modalDate = document.getElementById('modalDate');
    const modalSlot = document.getElementById('modalSlot');
    const modalCapacity = document.getElementById('modalCapacity');
    const modalPriceLabel = document.getElementById('modalPriceLabel');
    const modalPriceValue = document.getElementById('modalPriceValue');
    const modalPriceHint = document.getElementById('modalPriceHint');
    const modalDescription = document.getElementById('modalDescription');
    const airconChoice = document.getElementById('airconChoice');
    const multiAirconModal = document.getElementById('multiAirconModal');
    const multiAirconName = document.getElementById('multiAirconName');
    const multiAirconDate = document.getElementById('multiAirconDate');
    const multiAirconSlot = document.getElementById('multiAirconSlot');
    const multiAirconCapacity = document.getElementById('multiAirconCapacity');
    const multiAirconPriceValue = document.getElementById('multiAirconPriceValue');
    const multiAirconPriceHint = document.getElementById('multiAirconPriceHint');
    const multiAirconDescription = document.getElementById('multiAirconDescription');
    const multiAirconChoice = document.getElementById('multiAirconChoice');
    const bookingForm = document.getElementById('bookingForm');
    const bookingNotice = document.getElementById('bookingNotice');
    const dateInput = document.getElementById('reservation_date');
    const reservationDay = document.getElementById('reservationDay');
    const weatherPreview = document.getElementById('reservationWeatherPreview');
    const slotButtons = document.querySelectorAll('[data-slot]');

    if (!grid || cards.length === 0) {
        return;
    }

    let selectedSlot = 'Daytime';
    let activeAmenity = null;
    let pendingMultiAmenity = null;
    let multiSelectionEnabled = false;
    let selectedCards = [];
    let multiSelectionChoices = {};

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

    const renderWeatherPreview = (forecast) => {
        if (!weatherPreview) return;

        if (!forecast || !forecast.available) {
            weatherPreview.innerHTML = '<p class="rp-weather-preview__empty">No info about the weather.</p>';
            return;
        }

        const icon = forecast.icon
            ? `<img src="${forecast.icon}" alt="${forecast.condition || 'Weather'}" class="rp-weather-preview__icon">`
            : '';
        const tempRange = forecast.is_current && forecast.temp_c !== null && forecast.feelslike_c !== null
            ? `Now ${Math.round(forecast.temp_c)}°C · Feels like ${Math.round(forecast.feelslike_c)}°C`
            : (forecast.max_temp_c !== null && forecast.min_temp_c !== null
                ? `High ${Math.round(forecast.max_temp_c)}°C · Low ${Math.round(forecast.min_temp_c)}°C`
                : 'Forecast available for this date');
        const rainHint = forecast.chance_of_rain !== null && forecast.chance_of_rain !== undefined
            ? `<span class="rp-weather-preview__rain">Rain chance: ${forecast.chance_of_rain}%</span>`
            : '';

        weatherPreview.innerHTML = `
            <div class="rp-weather-preview__wrap">
                ${icon}
                <div class="rp-weather-preview__content">
                    <strong>${forecast.condition || 'Forecast available'}</strong>
                    <span>${tempRange}</span>
                    ${rainHint}
                </div>
            </div>
        `;
    };

    const loadWeatherPreview = async (dateString) => {
        if (!weatherPreview || !dateString) return;

        const minDate = dateInput?.dataset.minDate;

        if (minDate && dateString < minDate) {
            dateInput.value = minDate;
        }

        if (!dateInput.value) return;

        try {
            const url = new URL('/reservation/weather-preview', window.location.origin);
            url.searchParams.set('date', dateInput.value);

            const response = await fetch(url.toString(), {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Weather preview request failed');
            }

            const payload = await response.json();
            renderWeatherPreview(payload);
        } catch (error) {
            renderWeatherPreview({ available: false });
        }
    };

    const syncReservationDate = () => {
        if (!dateInput) return;

        const minDate = dateInput.dataset.minDate;

        if (minDate && dateInput.value < minDate) {
            dateInput.value = minDate;
        }

        updateReservationDay();
        applyFilters();
        loadWeatherPreview(dateInput.value);
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

        if (multiSelectionEnabled && selectedCards.length > 0) {
            const total = getSelectionTotal();
            const calculation = selectedCards.map(c => {
                const choiceForCard = multiSelectionChoices[c.dataset.amenityId] || 'without';
                return getAmenityPrice(c, choiceForCard).toFixed(2);
            }).join(' + ');
            modalPriceLabel.textContent = 'Total from selection';
            modalPriceValue.textContent = `₱${total.toFixed(2)}`;
            modalPriceHint.textContent = `${calculation} = ₱${total.toFixed(2)}`;
            
            // Build the descriptions list for all selected amenities
            const descriptionsHtml = selectedCards.map(c => {
                const desc = c.dataset.description || 'No additional details available.';
                return `<div class="rp-amenity-desc-item"><strong>${c.dataset.name}</strong><p>${desc}</p></div>`;
            }).join('');
            modalDescription.innerHTML = descriptionsHtml;
        } else {
            modalPriceLabel.textContent = isAircon ? 'Aircon package' : 'Standard package';
            modalPriceValue.textContent = `₱${selectedPrice.toFixed(2)}`;
            modalPriceHint.textContent = isAircon
                ? 'Air-conditioned pricing for this booking slot.'
                : 'Standard pricing for this booking slot.';
            modalDescription.textContent = card.dataset.description || 'No additional details available.';
        }

        bookingForm.classList.remove('is-hidden');
        const checkInInput = document.getElementById('bookingCheckIn');
        const checkOutInput = document.getElementById('bookingCheckOut');
        if (checkInInput) checkInInput.value = dateInput.value;
        if (checkOutInput) checkOutInput.value = dateInput.value;
        const guestInput = bookingForm.querySelector('input[name="number_of_guests"]');
        if (guestInput) guestInput.value = card.dataset.minCapacity || '1';
    };

    const getSelectionTotal = () => {
        return selectedCards.reduce((total, card) => {
            const choice = multiSelectionChoices[card.dataset.amenityId] || 'without';
            return total + getAmenityPrice(card, choice);
        }, 0);
    };

    const updateSelectionUi = () => {
        const count = selectedCards.length;
        const total = getSelectionTotal();
        if (selectionFloatingBar) {
            selectionFloatingBar.hidden = !multiSelectionEnabled || count === 0;
        }
        if (selectionCountLabel) {
            selectionCountLabel.textContent = count === 1 ? '1 amenity selected' : `${count} amenities selected`;
        }
        if (selectionCheckoutBtn) {
            selectionCheckoutBtn.textContent = count === 1 ? 'Review selection' : 'Review selections';
        }
        const summaryHint = selectionFloatingBar?.querySelector('.rp-floating-actions__copy span');
        if (summaryHint) {
            summaryHint.textContent = count === 0 ? 'Tap to review your picks' : `₱${total.toFixed(2)} total`;
        }

        cards.forEach(card => {
            const isSelected = selectedCards.includes(card);
            card.classList.toggle('is-selected', multiSelectionEnabled && isSelected);
            const overlay = card.querySelector('.rp-card__overlay');
            if (overlay) {
                overlay.classList.toggle('is-selected', multiSelectionEnabled && isSelected);
            }
        });
    };

    const renderMultiAirconSelection = (card, choice) => {
        const basePrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimePrice)
            : Number(card.dataset.daytimePrice);
        const airconPrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimeAirconPrice)
            : Number(card.dataset.daytimeAirconPrice);
        const selectedPrice = choice === 'with' ? airconPrice : basePrice;
        const isAircon = choice === 'with';

        if (multiAirconName) multiAirconName.textContent = card.dataset.name || 'Amenity name';
        if (multiAirconDate) multiAirconDate.textContent = dateInput.value;
        if (multiAirconSlot) multiAirconSlot.textContent = selectedSlot;
        if (multiAirconCapacity) multiAirconCapacity.textContent = `${card.dataset.minCapacity}–${card.dataset.maxCapacity} guests`;
        if (multiAirconPriceValue) multiAirconPriceValue.textContent = `₱${selectedPrice.toFixed(2)}`;
        if (multiAirconPriceHint) multiAirconPriceHint.textContent = isAircon
            ? 'With air-conditioning included in this package.'
            : 'Standard package without air-conditioning.';
        if (multiAirconDescription) multiAirconDescription.textContent = card.dataset.description || 'No additional details available.';

        if (multiAirconChoice) {
            const baseDisplay = `₱${basePrice.toFixed(2)}`;
            const airconDisplay = airconPrice ? `₱${airconPrice.toFixed(2)}` : 'N/A';
            multiAirconChoice.innerHTML = `
                <button type="button" class="rp-choice-btn ${choice === 'with' ? 'is-selected' : ''}" data-aircon-choice="with" data-price="${airconPrice}">
                    <span>With Aircon</span>
                    <span class="rp-choice-btn__price">${airconDisplay}</span>
                </button>
                <button type="button" class="rp-choice-btn ${choice === 'without' ? 'is-selected' : ''}" data-aircon-choice="without" data-price="${basePrice}">
                    <span>Without Aircon</span>
                    <span class="rp-choice-btn__price">${baseDisplay}</span>
                </button>
            `;
        }
    };

    const openMultiAirconModal = (card) => {
        pendingMultiAmenity = card;
        const currentChoice = multiSelectionChoices[card.dataset.amenityId] || 'without';
        renderMultiAirconSelection(card, currentChoice);
        if (multiAirconModal) {
            multiAirconModal.classList.add('is-open');
            multiAirconModal.setAttribute('aria-hidden', 'false');
        }
        if (selectionFloatingBar) {
            selectionFloatingBar.hidden = true;
        }
    };

    const closeMultiAirconModal = () => {
        if (multiAirconModal) {
            multiAirconModal.classList.remove('is-open');
            multiAirconModal.setAttribute('aria-hidden', 'true');
        }
        if (selectionFloatingBar && multiSelectionEnabled) {
            const count = selectedCards.length;
            selectionFloatingBar.hidden = count === 0;
        }
    };

    const toggleCardSelection = (card) => {
        if (!card) return;
        const exists = selectedCards.includes(card);
        const hasAircon = card.dataset.hasAircon === '1';

        if (exists) {
            selectedCards = selectedCards.filter(item => item !== card);
            delete multiSelectionChoices[card.dataset.amenityId];
            updateSelectionUi();
            updateSelectionSummary();
            return;
        }

        if (multiSelectionEnabled && hasAircon) {
            openMultiAirconModal(card);
            return;
        }

        selectedCards.push(card);
        multiSelectionChoices[card.dataset.amenityId] = 'without';
        updateSelectionUi();
        updateSelectionSummary();
    };

    const getAmenityPrice = (card, choice) => {
        const basePrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimePrice)
            : Number(card.dataset.daytimePrice);
        const airconPrice = selectedSlot === 'Nighttime'
            ? Number(card.dataset.nighttimeAirconPrice)
            : Number(card.dataset.daytimeAirconPrice);

        return choice === 'with' ? airconPrice : basePrice;
    };

    const updateSelectionSummary = () => {
        if (!selectionSummaryList || !selectionMathText || !selectionTotalPrice) return;

        if (selectedCards.length === 0) {
            selectionMathText.textContent = 'No items selected';
            selectionTotalPrice.textContent = '₱0.00';
            selectionSummaryList.innerHTML = '<li class="rp-selection-sheet__empty">Select an amenity to review it here.</li>';
            return;
        }

        let total = 0;
        const parts = [];
        selectionSummaryList.innerHTML = '';

        selectedCards.forEach(card => {
            const choice = multiSelectionChoices[card.dataset.amenityId] || 'without';
            const price = getAmenityPrice(card, choice);
            total += price;
            const choiceLabel = choice === 'with' ? 'with aircon' : 'without aircon';
            const line = document.createElement('li');
            line.className = 'rp-selection-sheet__item';
            line.innerHTML = `
                <div class="rp-selection-sheet__item-main">
                    <strong>${card.dataset.name || 'Selected amenity'}</strong>
                    <span>${choiceLabel}</span>
                </div>
                <div class="rp-selection-sheet__item-price">₱${price.toFixed(2)}</div>
            `;
            selectionSummaryList.appendChild(line);
            parts.push(`₱${price.toFixed(2)}`);
        });

        selectionMathText.textContent = parts.join(' + ');
        selectionTotalPrice.textContent = `₱${total.toFixed(2)}`;
    };

    const openSelectionSheet = () => {
        updateSelectionSummary();
        if (selectionSheet) {
            selectionSheet.classList.add('is-open');
            selectionSheet.setAttribute('aria-hidden', 'false');
        }
    };

    const closeSelectionSheet = () => {
        if (selectionSheet) {
            selectionSheet.classList.remove('is-open');
            selectionSheet.setAttribute('aria-hidden', 'true');
        }
    };

    const openModal = (card) => {
        activeAmenity = card;
        bookingNotice.textContent = '';
        const currentChoice = multiSelectionChoices[card.dataset.amenityId] || 'without';
        
        if (multiSelectionEnabled && selectedCards.length > 0) {
            const allNames = selectedCards.map(c => c.dataset.name).join(' + ');
            modalName.textContent = allNames;
        } else {
            modalName.textContent = card.dataset.name;
        }
        
        modalDate.textContent = dateInput.value;
        modalSlot.textContent = selectedSlot;
        modalCapacity.textContent = `${card.dataset.minCapacity}–${card.dataset.maxCapacity} guests`;

        const hasAircon = card.dataset.hasAircon === '1';
        if (hasAircon) {
            airconChoice.innerHTML = `
                <button type="button" class="rp-choice-btn ${currentChoice === 'with' ? 'is-selected' : ''}" data-aircon-choice="with">With Aircon</button>
                <button type="button" class="rp-choice-btn ${currentChoice === 'without' ? 'is-selected' : ''}" data-aircon-choice="without">Without Aircon</button>
            `;
            airconChoice.style.display = 'flex';
            bookingForm.classList.add('is-hidden');
            bookingForm.reset();
            renderBookingSelection(card, currentChoice);
        } else {
            airconChoice.innerHTML = '';
            airconChoice.style.display = 'none';
            renderBookingSelection(card, 'without');
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        if (selectionFloatingBar) {
            selectionFloatingBar.hidden = true;
        }
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (selectionFloatingBar && multiSelectionEnabled) {
            const count = selectedCards.length;
            selectionFloatingBar.hidden = count === 0;
        }
    };

    if (dateInput) {
        dateInput.addEventListener('change', syncReservationDate);
        dateInput.addEventListener('input', syncReservationDate);
    }

    updateReservationDay();
    applyFilters();
    syncReservationDate();

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

    if (multiSelectionToggle) {
        multiSelectionToggle.addEventListener('change', () => {
            multiSelectionEnabled = multiSelectionToggle.checked;
            if (!multiSelectionEnabled) {
                selectedCards = [];
            }
            updateSelectionUi();
        });
    }

    document.querySelectorAll('[data-open-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.rp-card');
            if (multiSelectionEnabled) {
                toggleCardSelection(card);
                return;
            }
            openModal(card);
        });
    });

    if (selectionCheckoutBtn) {
        selectionCheckoutBtn.addEventListener('click', () => {
            openSelectionSheet();
        });
    }

    if (selectionContinueBtn) {
        selectionContinueBtn.addEventListener('click', () => {
            const firstCard = selectedCards[0];
            closeSelectionSheet();
            if (firstCard) {
                openModal(firstCard);
            }
        });
    }

    airconChoice.addEventListener('click', (event) => {
        const button = event.target.closest('[data-aircon-choice]');
        if (!button || !activeAmenity) {
            return;
        }
        const choice = button.dataset.airconChoice;
        const amenityId = activeAmenity.dataset.amenityId;
        if (amenityId) {
            multiSelectionChoices[amenityId] = choice;
        }
        if (multiSelectionEnabled && !selectedCards.includes(activeAmenity)) {
            selectedCards.push(activeAmenity);
        }
        renderBookingSelection(activeAmenity, choice);
        updateSelectionUi();
        updateSelectionSummary();
        if (multiSelectionEnabled) {
            closeModal();
        }
        airconChoice.querySelectorAll('[data-aircon-choice]').forEach(btn => {
            btn.classList.toggle('is-selected', btn.dataset.airconChoice === choice);
        });
    });

    if (multiAirconChoice) {
        multiAirconChoice.addEventListener('click', (event) => {
            const button = event.target.closest('[data-aircon-choice]');
            if (!button || !pendingMultiAmenity) {
                return;
            }
            const choice = button.dataset.airconChoice;
            renderMultiAirconSelection(pendingMultiAmenity, choice);
            multiAirconChoice.querySelectorAll('[data-aircon-choice]').forEach(btn => {
                btn.classList.toggle('is-selected', btn.dataset.airconChoice === choice);
            });
        });
    }

    const multiAirconConfirmBtn = document.getElementById('multiAirconConfirmBtn');
    if (multiAirconConfirmBtn) {
        multiAirconConfirmBtn.addEventListener('click', () => {
            if (!pendingMultiAmenity) return;
            const selectedBtn = multiAirconChoice?.querySelector('[data-aircon-choice].is-selected');
            const choice = selectedBtn ? selectedBtn.dataset.airconChoice : 'without';
            const amenityId = pendingMultiAmenity.dataset.amenityId;
            if (amenityId) {
                multiSelectionChoices[amenityId] = choice;
            }
            if (!selectedCards.includes(pendingMultiAmenity)) {
                selectedCards.push(pendingMultiAmenity);
            }
            updateSelectionUi();
            updateSelectionSummary();
            closeMultiAirconModal();
        });
    }

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
        
        // Build amenities array for multi-selection
        let amenitiesArray = [];
        if (multiSelectionEnabled && selectedCards.length > 0) {
            amenitiesArray = selectedCards.map(card => {
                const choice = multiSelectionChoices[card.dataset.amenityId] || 'without';
                const price = getAmenityPrice(card, choice);
                const pricingType = choice === 'with' ? `${selectedSlot} Aircon` : selectedSlot;
                return {
                    amenity_id: card.dataset.amenityId,
                    pricing_type: pricingType,
                    price_at_booking: price,
                };
            });
        } else {
            // Single selection mode
            amenitiesArray = [{
                amenity_id: activeAmenity.dataset.amenityId,
                pricing_type: modalPriceLabel.textContent === 'Aircon package' ? `${selectedSlot} Aircon` : selectedSlot,
                price_at_booking: Number(modalPriceValue.textContent.replace('₱', '').replace(',', '')),
            }];
        }

        const payload = {
            booker_name: formData.get('booker_name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            number_of_guests: Number(formData.get('number_of_guests')),
            check_in: dateInput.value,
            check_out: dateInput.value,
            slot: selectedSlot,
            amenities: amenitiesArray,
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

    selectionCloseButtons.forEach(button => {
        button.addEventListener('click', closeSelectionSheet);
    });

    if (multiAirconModal) {
        document.querySelectorAll('[data-close-multi-aircon-modal]').forEach(button => {
            button.addEventListener('click', closeMultiAirconModal);
        });
    }

    if (multiAirconModal) {
        multiAirconModal.addEventListener('click', (event) => {
            if (event.target === multiAirconModal) {
                closeMultiAirconModal();
            }
        });
    }

    if (selectionSheet) {
        selectionSheet.addEventListener('click', (event) => {
            if (event.target === selectionSheet) {
                closeSelectionSheet();
            }
        });
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
    