document.addEventListener('DOMContentLoaded', () => {
    const filterType = document.getElementById('filterType');
    const filterMin = document.getElementById('filterMin');
    const filterMax = document.getElementById('filterMax');
    const cards = Array.from(document.querySelectorAll('.rp-card'));
    const grid = document.querySelector('.rp-grid__list');
    const modal = document.getElementById('amenityModal');
    const modalClose = document.querySelectorAll('[data-close-modal]');
    const modalName = document.getElementById('modalName');
    const modalDate = document.getElementById('modalDate');
    const modalCapacity = document.getElementById('modalCapacity');
    const modalDaytime = document.getElementById('modalDaytime');
    const modalNighttime = document.getElementById('modalNighttime');
    const modalAdditional = document.getElementById('modalAdditional');
    const modalDescription = document.getElementById('modalDescription');
    const dateInput = document.getElementById('reservation_date');
    const reservationDay = document.getElementById('reservationDay');
    const sortSelect = document.getElementById('sortSelect');

    if (!grid || cards.length === 0) {
        return;
    }

    const getWeekday = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'long' });
    };

    const updateReservationDay = () => {
        if (!reservationDay || !dateInput.value) return;
        reservationDay.textContent = getWeekday(dateInput.value);
    };

    dateInput.addEventListener('change', () => {
        updateReservationDay();
    });

    updateReservationDay();

    const sortCards = (key) => {
        const sorted = cards.slice().sort((a, b) => {
            if (key === 'name') {
                return a.dataset.name.localeCompare(b.dataset.name);
            }
            if (key === 'capacity') {
                return Number(a.dataset.maxCapacity) - Number(b.dataset.maxCapacity);
            }
            if (key === 'price') {
                return Number(a.dataset.minPrice) - Number(b.dataset.minPrice);
            }
            return 0;
        });
        sorted.forEach(card => grid.appendChild(card));
    };

    const updateRangeInputs = () => {
        const mode = filterType.value;
        if (mode === 'all') {
            filterMin.disabled = true;
            filterMax.disabled = true;
            filterMin.value = '';
            filterMax.value = '';
            cards.forEach(card => card.style.display = '');
            return;
        }

        filterMin.disabled = false;
        filterMax.disabled = false;
        const min = Number(filterMin.value);
        const max = Number(filterMax.value);

        cards.forEach(card => {
            const minValue = Number(mode === 'capacity' ? card.dataset.minCapacity : card.dataset.minPrice);
            const maxValue = Number(mode === 'capacity' ? card.dataset.maxCapacity : card.dataset.maxPrice);
            const validMin = Number.isFinite(min) ? (mode === 'capacity' ? maxValue >= min : maxValue >= min) : true;
            const validMax = Number.isFinite(max) ? (mode === 'capacity' ? minValue <= max : minValue <= max) : true;
            card.style.display = validMin && validMax ? '' : 'none';
        });
    };

    if (sortSelect) {
        sortSelect.addEventListener('change', () => sortCards(sortSelect.value));
    }

    if (filterType) {
        filterType.addEventListener('change', () => {
            filterMin.disabled = filterType.value === 'all';
            filterMax.disabled = filterType.value === 'all';
            filterMin.value = '';
            filterMax.value = '';
            updateRangeInputs();
        });
    }

    [filterMin, filterMax].forEach(input => {
        input.addEventListener('input', () => {
            if (filterType.value !== 'all') {
                updateRangeInputs();
            }
        });
    });

    const openModal = (card) => {
        modalName.textContent = card.dataset.name;
        modalDate.textContent = dateInput.value;
        modalCapacity.textContent = `${card.dataset.minCapacity}–${card.dataset.maxCapacity} guests`;
        modalDaytime.textContent = `₱${card.dataset.daytimePrice}`;
        modalNighttime.textContent = `₱${card.dataset.nighttimePrice}`;
        modalAdditional.textContent = card.dataset.additional === '0' ? 'None' : `₱${card.dataset.additional}`;
        modalDescription.textContent = card.dataset.description || 'No additional details available.';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('[data-open-modal]').forEach(button => {
        button.addEventListener('click', () => {
            openModal(button.closest('.rp-card'));
        });
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
    