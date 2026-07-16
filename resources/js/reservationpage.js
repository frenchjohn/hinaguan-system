document.addEventListener('DOMContentLoaded', () => {

    const siteHeader = document.getElementById('rpSiteHeader');

    const menuToggle = document.querySelector('.rp-menu-toggle');

    const mobileNav = document.querySelector('.rp-mobile-nav');

    const mobileLinks = mobileNav?.querySelectorAll('a');

    const animatedElements = document.querySelectorAll('[data-animate]');



    const syncHeaderOffset = () => {

        if (!siteHeader) return;

        document.documentElement.style.setProperty('--rp-header-offset', `${siteHeader.offsetHeight}px`);

    };



    syncHeaderOffset();

    window.addEventListener('resize', syncHeaderOffset, { passive: true });



    const updateOverlayScrollLock = () => {

        const hasOpenOverlay = Boolean(

            document.querySelector('.rp-modal.is-open, .rp-selection-sheet.is-open, .rp-mobile-nav.is-open')

        );

        document.body.style.overflow = hasOpenOverlay ? 'hidden' : '';

    };



    const closeMobileNav = () => {

        mobileNav?.classList.remove('is-open');

        menuToggle?.setAttribute('aria-expanded', 'false');

        updateOverlayScrollLock();

    };



    menuToggle?.addEventListener('click', () => {

        const isOpen = mobileNav?.classList.toggle('is-open');

        menuToggle.setAttribute('aria-expanded', String(isOpen));

        updateOverlayScrollLock();

    });



    mobileLinks?.forEach((link) => {

        link.addEventListener('click', closeMobileNav);

    });



    const animateObserver = new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;



                const el = entry.target;

                const delay = parseInt(el.dataset.delay ?? '0', 10);



                window.setTimeout(() => {

                    el.classList.add('is-visible');

                }, delay);



                animateObserver.unobserve(el);

            });

        },

        {

            rootMargin: '0px 0px -6% 0px',

            threshold: 0.08,

        }

    );



    animatedElements.forEach((el) => animateObserver.observe(el));



    document.querySelectorAll('.rp-hero [data-animate]').forEach((el, index) => {

        window.setTimeout(() => {

            el.classList.add('is-visible');

        }, 200 + index * 120);

    });



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

    const availabilityModal = document.getElementById('availabilityModal');

    const availabilityCalendar = document.getElementById('availabilityCalendar');

    const availabilityModalTitle = document.getElementById('availabilityModalTitle');

    const availabilitySlotButtons = document.querySelectorAll('[data-slot-toggle]');

    const availabilityCloseButtons = document.querySelectorAll('[data-close-availability-modal]');

    const urlParams = new URLSearchParams(window.location.search);

    const preselectedAmenityId = urlParams.get('amenity');

    const preselectedDate = urlParams.get('date');

    const availabilityLoading = document.getElementById('availabilityLoading');



    if (!grid || cards.length === 0) {

        return;

    }



    let selectedSlot = 'Daytime';

    let activeAmenity = null;

    let pendingMultiAmenity = null;

    let multiSelectionEnabled = false;

    let selectedCards = [];

    let multiSelectionChoices = {};

    let occupiedAmenityIds = [];

    let isLoadingAvailability = false;

    let availabilityRequestId = 0;

    let calendarAmenityId = null;

    let calendarAmenityName = '';

    let calendarAvailability = [];

    let calendarSlot = 'Daytime';

    let calendarSourceCard = null;



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



    const setAvailabilityLoading = (loading) => {

        isLoadingAvailability = loading;

        if (grid) {

            grid.classList.toggle('is-busy', loading);

        }



        if (availabilityLoading) {

            availabilityLoading.hidden = !loading;

        }



        cards.forEach(card => {

            card.classList.toggle('is-disabled', loading);

        });



        slotButtons.forEach(button => {

            button.disabled = loading;

        });

    };



    const syncReservationDate = () => {

        if (!dateInput) return;



        const minDate = dateInput.dataset.minDate;



        if (minDate && dateInput.value && dateInput.value < minDate) {

            dateInput.value = minDate;

        }



        updateReservationDay();

        refreshAvailability();

        loadWeatherPreview(dateInput.value);

    };



    const refreshAvailability = async () => {

        if (!dateInput || !dateInput.value || !selectedSlot) {

            occupiedAmenityIds = [];

            applyFilters();

            return;

        }



        const requestId = ++availabilityRequestId;

        setAvailabilityLoading(true);

        cards.forEach(card => {

            card.style.display = 'none';

        });

        if (emptyState) {

            emptyState.style.display = 'none';

        }



        try {

            const url = new URL('/reservation/availability', window.location.origin);

            url.searchParams.set('date', dateInput.value);

            url.searchParams.set('slot', selectedSlot);



            const response = await fetch(url.toString(), {

                headers: { Accept: 'application/json' },

            });



            if (!response.ok) {

                throw new Error('Availability request failed');

            }



            const payload = await response.json();

            if (requestId === availabilityRequestId) {

                occupiedAmenityIds = payload.occupied_amenity_ids || [];

            }

        } catch (error) {

            if (requestId === availabilityRequestId) {

                occupiedAmenityIds = [];

            }

        }



        if (requestId === availabilityRequestId) {

            applyFilters();

            setAvailabilityLoading(false);

        }

    };



    const openAvailabilityModal = async (card) => {

        if (!availabilityModal || !card) return;

        calendarSourceCard = card;

        calendarAmenityId = card.dataset.amenityId;

        calendarAmenityName = card.dataset.name || 'Amenity';

        availabilityModalTitle.textContent = `${calendarAmenityName} availability`;

        calendarSlot = 'Daytime';

        availabilitySlotButtons.forEach(button => {

            button.classList.toggle('is-active', button.dataset.slotToggle === calendarSlot);

        });

        

        // Initialize month and year dropdowns

        const calendarMonthSelect = document.getElementById('calendarMonth');

        const calendarYearSelect = document.getElementById('calendarYear');

        

        if (calendarMonthSelect && calendarYearSelect) {

            // Set current month

            const today = new Date();

            calendarMonthSelect.value = today.getMonth();

            

            // Populate year dropdown (current year to 4 years ahead, total 5 years)

            const currentYear = today.getFullYear();

            calendarYearSelect.innerHTML = '';

            for (let year = currentYear; year <= currentYear + 4; year++) {

                const option = document.createElement('option');

                option.value = year;

                option.textContent = year;

                calendarYearSelect.appendChild(option);

            }

            calendarYearSelect.value = currentYear;

            

            // Add event listeners for dropdown changes

            const fetchCalendarData = async () => {

                const selectedMonth = calendarMonthSelect.value;

                const selectedYear = calendarYearSelect.value;

                

                // Add loading state

                availabilityCalendar.classList.add('is-loading');

                

                try {

                    const url = new URL('/reservation/availability/calendar', window.location.origin);

                    url.searchParams.set('amenity_id', calendarAmenityId);

                    url.searchParams.set('slot', calendarSlot);

                    url.searchParams.set('month', selectedMonth);

                    url.searchParams.set('year', selectedYear);



                    const response = await fetch(url.toString(), {

                        headers: { Accept: 'application/json' },

                    });



                    if (!response.ok) {

                        throw new Error('Calendar availability request failed');

                    }



                    const payload = await response.json();

                    calendarAvailability = payload.availability || [];

                    renderAvailabilityCalendar();

                } catch (error) {

                    calendarAvailability = [];

                    renderAvailabilityCalendar();

                } finally {

                    // Remove loading state

                    availabilityCalendar.classList.remove('is-loading');

                }

            };

            

            calendarMonthSelect.addEventListener('change', fetchCalendarData);

            calendarYearSelect.addEventListener('change', fetchCalendarData);

        }

        

        calendarAvailability = [];

        renderAvailabilityCalendar();

        availabilityModal.classList.add('is-open');

        availabilityModal.setAttribute('aria-hidden', 'false');

        updateOverlayScrollLock();



        try {

            const url = new URL('/reservation/availability/calendar', window.location.origin);

            url.searchParams.set('amenity_id', calendarAmenityId);

            url.searchParams.set('slot', calendarSlot);



            const response = await fetch(url.toString(), {

                headers: { Accept: 'application/json' },

            });



            if (!response.ok) {

                throw new Error('Calendar availability request failed');

            }



            const payload = await response.json();

            calendarAvailability = payload.availability || [];

            renderAvailabilityCalendar();

        } catch (error) {

            calendarAvailability = [];

            renderAvailabilityCalendar();

        }

    };



    const closeAvailabilityModal = () => {

        if (!availabilityModal) return;

        availabilityModal.classList.remove('is-open');

        availabilityModal.setAttribute('aria-hidden', 'true');

        updateOverlayScrollLock();

    };



    const renderAvailabilityCalendar = () => {

        if (!availabilityCalendar || !calendarAmenityId) return;



        availabilityCalendar.innerHTML = '';



        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((weekday) => {

            const label = document.createElement('span');

            label.className = 'rp-calendar__weekday';

            label.textContent = weekday;

            availabilityCalendar.appendChild(label);

        });



        // Get the selected month and year from dropdowns, or use current date

        const calendarMonthSelect = document.getElementById('calendarMonth');

        const calendarYearSelect = document.getElementById('calendarYear');

        

        let selectedMonth, selectedYear;

        

        if (calendarMonthSelect && calendarYearSelect && calendarMonthSelect.value !== '' && calendarYearSelect.value !== '') {

            selectedMonth = parseInt(calendarMonthSelect.value);

            selectedYear = parseInt(calendarYearSelect.value);

        } else {

            // Default to current month/year

            const today = new Date();

            selectedMonth = today.getMonth();

            selectedYear = today.getFullYear();

        }



        // Create date for the first day of the selected month

        const firstDate = new Date(selectedYear, selectedMonth, 1);

        const startOffset = firstDate.getDay();

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();



        // Add empty cells for days before the first day of the month

        for (let i = 0; i < startOffset; i += 1) {

            const spacer = document.createElement('span');

            spacer.className = 'rp-calendar__day rp-calendar__day--empty';

            spacer.setAttribute('aria-hidden', 'true');

            availabilityCalendar.appendChild(spacer);

        }



        const days = Array.from({ length: daysInMonth }, (_, index) => {

            const date = new Date(selectedYear, selectedMonth, index + 1);

            // Use local date formatting to avoid timezone offset issues

            const isoDate = date.getFullYear() + '-' + 

                String(date.getMonth() + 1).padStart(2, '0') + '-' + 

                String(date.getDate()).padStart(2, '0');

            

            // Determine the slot key to check in availability data
            let slotKey = calendarSlot.toLowerCase();
            let isAvailable = false;

            const entry = calendarAvailability.find((e) => e.date === isoDate);

            if (entry) {
                if (slotKey === 'daytime') {
                    isAvailable = entry.daytime === true;
                } else if (slotKey === 'nighttime') {
                    isAvailable = entry.nighttime === true;
                } else if (slotKey === 'daynight time' || slotKey === 'daynight') {
                    // For Daynight Time, both daytime and nighttime must be available
                    isAvailable = entry.daytime === true && entry.nighttime === true;
                }
            }



            const dayButton = document.createElement('button');

            dayButton.type = 'button';

            dayButton.className = `rp-calendar__day ${isAvailable ? 'is-available' : 'is-disabled'}`;

            dayButton.disabled = !isAvailable;

            dayButton.innerHTML = `

                <span class="rp-calendar__day-num">${date.getDate()}</span>

                <span class="rp-calendar__day-month">${date.toLocaleDateString('en', { month: 'short' })}</span>

            `;

            dayButton.addEventListener('click', () => {

                if (!isAvailable) return;

                if (dateInput) {

                    dateInput.value = isoDate;

                }

                updateReservationDay();

                

                // Update the main selected slot to match the calendar slot

                selectedSlot = calendarSlot;

                slotButtons.forEach(button => {

                    button.classList.toggle('is-active', button.dataset.slot === selectedSlot);

                });

                

                closeAvailabilityModal();

                

                // Refresh availability after a short delay to ensure date is set

                window.setTimeout(() => {

                    refreshAvailability();

                    

                    if (calendarSourceCard) {

                        openModal(calendarSourceCard);

                    }

                }, 100);

            });

            return dayButton;

        });



        days.forEach((day) => availabilityCalendar.appendChild(day));

    };



    const isAvailableForSlot = (card, dateString, slot) => {

        if (!dateString || !slot) {

            return true;

        }



        return !occupiedAmenityIds.includes(card.dataset.amenityId);

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



            const visible = filterMatch;

            const isBooked = !slotMatch;

            card.style.display = visible ? '' : 'none';

            card.classList.toggle('is-booked', visible && isBooked);

            const overlay = card.querySelector('.rp-card__overlay');

            if (overlay) {

                overlay.classList.toggle('is-booked', visible && isBooked);

                overlay.querySelector('span') && (overlay.querySelector('span').textContent = visible && isBooked ? `${card.dataset.name} — Already booked` : card.dataset.name);

            }

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

        refreshAvailability();

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

        let basePrice, airconPrice;

        

        if (selectedSlot === 'Nighttime') {

            basePrice = Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.nighttimeAirconPrice);

        } else if (selectedSlot === 'DayNight Time') {

            // For DayNight Time, combine daytime and nighttime prices

            basePrice = Number(card.dataset.daytimePrice) + Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice) + Number(card.dataset.nighttimeAirconPrice);

        } else {

            // Daytime (default)

            basePrice = Number(card.dataset.daytimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice);

        }

        

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

        let basePrice, airconPrice;

        

        if (selectedSlot === 'Nighttime') {

            basePrice = Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.nighttimeAirconPrice);

        } else if (selectedSlot === 'DayNight Time') {

            // For DayNight Time, combine daytime and nighttime prices

            basePrice = Number(card.dataset.daytimePrice) + Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice) + Number(card.dataset.nighttimeAirconPrice);

        } else {

            // Daytime (default)

            basePrice = Number(card.dataset.daytimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice);

        }

        

        const selectedPrice = choice === 'with' ? airconPrice : basePrice;

        const isAircon = choice === 'with';



        if (multiAirconName) multiAirconName.textContent = card.dataset.name || 'Amenity name';

        

        // Ensure date is properly formatted and displayed

        if (multiAirconDate && dateInput && dateInput.value) {

            const dateObj = new Date(dateInput.value);

            const formattedDate = dateObj.toLocaleDateString('en-US', { 

                weekday: 'short', 

                year: 'numeric', 

                month: 'short', 

                day: 'numeric' 

            });

            multiAirconDate.textContent = formattedDate;

        } else if (multiAirconDate) {

            multiAirconDate.textContent = 'Select a date';

        }

        

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

            updateOverlayScrollLock();

        }

        if (selectionFloatingBar) {

            selectionFloatingBar.hidden = true;

        }

    };



    const closeMultiAirconModal = () => {

        if (multiAirconModal) {

            multiAirconModal.classList.remove('is-open');

            multiAirconModal.setAttribute('aria-hidden', 'true');

            updateOverlayScrollLock();

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

        let basePrice, airconPrice;

        

        if (selectedSlot === 'Nighttime') {

            basePrice = Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.nighttimeAirconPrice);

        } else if (selectedSlot === 'DayNight Time') {

            // For DayNight Time, combine daytime and nighttime prices

            basePrice = Number(card.dataset.daytimePrice) + Number(card.dataset.nighttimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice) + Number(card.dataset.nighttimeAirconPrice);

        } else {

            // Daytime (default)

            basePrice = Number(card.dataset.daytimePrice);

            airconPrice = Number(card.dataset.daytimeAirconPrice);

        }



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

            updateOverlayScrollLock();

        }

    };



    const closeSelectionSheet = () => {

        if (selectionSheet) {

            selectionSheet.classList.remove('is-open');

            selectionSheet.setAttribute('aria-hidden', 'true');

            updateOverlayScrollLock();

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

        

        // Ensure date is properly formatted and displayed

        if (dateInput && dateInput.value) {

            const dateObj = new Date(dateInput.value);

            const formattedDate = dateObj.toLocaleDateString('en-US', { 

                weekday: 'short', 

                year: 'numeric', 

                month: 'short', 

                day: 'numeric' 

            });

            modalDate.textContent = formattedDate;

        } else {

            modalDate.textContent = 'Select a date';

        }

        

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

        updateOverlayScrollLock();

        if (selectionFloatingBar) {

            selectionFloatingBar.hidden = true;

        }

    };



    const closeModal = () => {

        modal.classList.remove('is-open');

        modal.setAttribute('aria-hidden', 'true');

        updateOverlayScrollLock();

        if (selectionFloatingBar && multiSelectionEnabled) {

            const count = selectedCards.length;

            selectionFloatingBar.hidden = count === 0;

        }

    };



    if (dateInput) {

        if (preselectedDate) {

            dateInput.value = preselectedDate;

            updateReservationDay();

            refreshAvailability();

            loadWeatherPreview(dateInput.value);

            // If date is preselected, hide CTA and show controls

            if (dateCtaSection) {

                dateCtaSection.hidden = true;

            }

            if (dateControlsSection) {

                dateControlsSection.hidden = false;

            }

            if (slotControlsSection) {

                slotControlsSection.hidden = false;

            }

        }

        

        // Handle date selection to show controls

        const handleDateSelection = () => {

            if (dateInput.value) {

                if (dateCtaSection) {

                    dateCtaSection.hidden = true;

                }

                if (dateControlsSection) {

                    dateControlsSection.hidden = false;

                }

                if (slotControlsSection) {

                    slotControlsSection.hidden = false;

                }

            }

        };

        

        dateInput.addEventListener('change', () => {

            syncReservationDate();

            handleDateSelection();

        });

        dateInput.addEventListener('input', () => {

            syncReservationDate();

            handleDateSelection();

        });

    }



    updateReservationDay();

    applyFilters();



    if (preselectedAmenityId) {

        const preselectedCard = cards.find(card => card.dataset.amenityId === preselectedAmenityId);

        if (preselectedCard) {

            preselectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            preselectedCard.classList.add('is-highlighted');

            setTimeout(() => preselectedCard.classList.remove('is-highlighted'), 2200);

        }

    }



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



    // Handle "Pick a Date" CTA button

    const pickDateBtn = document.getElementById('pickDateBtn');

    const dateCtaSection = document.getElementById('dateCtaSection');

    const dateControlsSection = document.getElementById('dateControlsSection');

    const slotControlsSection = document.getElementById('slotControlsSection');



    if (pickDateBtn) {

        pickDateBtn.addEventListener('click', () => {

            // Hide CTA section

            if (dateCtaSection) {

                dateCtaSection.hidden = true;

            }

            // Show date and slot controls

            if (dateControlsSection) {

                dateControlsSection.hidden = false;

            }

            if (slotControlsSection) {

                slotControlsSection.hidden = false;

            }

            // Trigger date picker

            if (dateInput) {

                dateInput.showPicker ? dateInput.showPicker() : dateInput.focus();

            }

        });

    }



    document.querySelectorAll('[data-open-modal]').forEach(button => {

        button.addEventListener('click', () => {

            if (isLoadingAvailability) {

                return;

            }



            const card = button.closest('.rp-card');

            if (!card) {

                return;

            }



            if (multiSelectionEnabled) {

                toggleCardSelection(card);

                return;

            }



            if (card.classList.contains('is-booked')) {

                return;

            }



            // If no date selected yet, open the calendar modal first

            if (!dateInput || !dateInput.value) {

                openAvailabilityModal(card);

                return;

            }



            // Date is already selected, open the booking details modal

            openModal(card);

        });

    });



    if (selectionCheckoutBtn) {

        selectionCheckoutBtn.addEventListener('click', () => {

            if (multiSelectionEnabled && selectedCards.length > 0) {

                const targetCard = selectedCards[0];

                if (targetCard) {

                    openAvailabilityModal(targetCard);

                    return;

                }

            }



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

            reservation_date: dateInput.value,

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

                

                // Show success modal

                const successModal = document.getElementById('reservationSuccessModal');

                if (successModal) {

                    successModal.classList.add('is-open');

                    successModal.setAttribute('aria-hidden', 'false');

                    updateOverlayScrollLock();

                }

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



    availabilityCloseButtons.forEach(button => {

        button.addEventListener('click', closeAvailabilityModal);

    });



    if (availabilityModal) {

        availabilityModal.addEventListener('click', (event) => {

            if (event.target === availabilityModal) {

                closeAvailabilityModal();

            }

        });

    }



    availabilitySlotButtons.forEach(button => {

        button.addEventListener('click', async () => {

            calendarSlot = button.dataset.slotToggle;

            availabilitySlotButtons.forEach(slotButton => {

                slotButton.classList.toggle('is-active', slotButton.dataset.slotToggle === calendarSlot);

            });

            // Add loading state
            availabilityCalendar.classList.add('is-loading');

            try {

                const url = new URL('/reservation/availability/calendar', window.location.origin);
                url.searchParams.set('amenity_id', calendarAmenityId || '');
                url.searchParams.set('slot', calendarSlot);

                // Include month and year from dropdowns
                const calendarMonthSelect = document.getElementById('calendarMonth');
                const calendarYearSelect = document.getElementById('calendarYear');
                
                if (calendarMonthSelect && calendarYearSelect && calendarMonthSelect.value !== '' && calendarYearSelect.value !== '') {
                    url.searchParams.set('month', calendarMonthSelect.value);
                    url.searchParams.set('year', calendarYearSelect.value);
                } else {
                    // Default to current month/year
                    const today = new Date();
                    url.searchParams.set('month', today.getMonth());
                    url.searchParams.set('year', today.getFullYear());
                }



                const response = await fetch(url.toString(), {

                    headers: { Accept: 'application/json' },

                });



                if (!response.ok) {

                    throw new Error('Calendar availability request failed');

                }



                const payload = await response.json();

                calendarAvailability = payload.availability || [];
            } catch (error) {
                calendarAvailability = [];
            } finally {
                // Remove loading state and render calendar
                availabilityCalendar.classList.remove('is-loading');
                renderAvailabilityCalendar();
            }

        });

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



    // Success modal functionality

    const successModal = document.getElementById('reservationSuccessModal');

    const successConfirmBtn = document.getElementById('successConfirmBtn');

    const successCloseButtons = document.querySelectorAll('[data-close-success-modal]');



    const closeSuccessModal = () => {

        if (successModal) {

            successModal.classList.remove('is-open');

            successModal.setAttribute('aria-hidden', 'true');

            updateOverlayScrollLock();

            // Refresh page after closing success modal

            window.location.reload();

        }

    };



    if (successConfirmBtn) {

        successConfirmBtn.addEventListener('click', closeSuccessModal);

    }



    successCloseButtons.forEach(button => {

        button.addEventListener('click', closeSuccessModal);

    });



    if (successModal) {

        successModal.addEventListener('click', (event) => {

            if (event.target === successModal) {

                closeSuccessModal();

            }

        });

    }

});

    