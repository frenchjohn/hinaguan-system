document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('availabilityModal');
    const calendar = document.getElementById('availabilityCalendar');
    const slotButtons = document.querySelectorAll('[data-slot-toggle]');
    const openButtons = document.querySelectorAll('[data-open-availability-modal]');
    const closeButtons = document.querySelectorAll('[data-close-availability-modal]');

    let currentAmenityId = null;
    let currentSlot = 'Daytime';
    let availabilityByDate = [];

    const openModal = (amenityId, amenityName) => {
        currentAmenityId = amenityId;
        document.getElementById('availabilityModalTitle').textContent = `${amenityName} availability`;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        renderCalendar();
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    };

    const renderCalendar = () => {
        if (!calendar || !currentAmenityId) return;

        calendar.innerHTML = '';
        const days = Array.from({ length: 30 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);
            const isoDate = date.toISOString().slice(0, 10);
            const availabilityEntry = availabilityByDate.find(entry => entry.date === isoDate);
            const isAvailable = availabilityEntry ? availabilityEntry[currentSlot === 'Nighttime' ? 'nighttime' : 'daytime'] === true : true;
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.className = `am-calendar__day ${isAvailable ? 'is-available' : 'is-disabled'}`;
            dayButton.textContent = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
            dayButton.disabled = !isAvailable;
            dayButton.addEventListener('click', () => {
                if (!isAvailable) return;
                const url = new URL('/reservation', window.location.origin);
                url.searchParams.set('date', isoDate);
                url.searchParams.set('amenity', currentAmenityId);
                window.location.href = url.toString();
            });
            return dayButton;
        });

        days.forEach((day) => calendar.appendChild(day));
    };

    openButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const amenityId = button.dataset.amenityId;
            const amenityName = button.dataset.amenityName;
            currentSlot = 'Daytime';
            slotButtons.forEach((slotButton) => {
                slotButton.classList.toggle('is-active', slotButton.dataset.slotToggle === currentSlot);
            });
            availabilityByDate = JSON.parse(button.dataset.availability || '[]');
            openModal(amenityId, amenityName);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    slotButtons.forEach((button) => {
        button.addEventListener('click', () => {
            currentSlot = button.dataset.slotToggle;
            slotButtons.forEach((slotButton) => {
                slotButton.classList.toggle('is-active', slotButton.dataset.slotToggle === currentSlot);
            });
            renderCalendar();
        });
    });
});
