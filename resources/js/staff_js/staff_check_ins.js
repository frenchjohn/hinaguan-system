// Check Ins specific JS — delegate to staff_guests for shared behaviors
import './staff_guests.js';

document.addEventListener('DOMContentLoaded', () => {
    const tabGuestBtn = document.getElementById('tabGuestBtn');
    const tabReservationBtn = document.getElementById('tabReservationBtn');
    const guestTableSection = document.getElementById('guestTableSection');
    const reservationTableSection = document.getElementById('reservationTableSection');
    const reservationTableBody = document.getElementById('reservationTableBody');
    const reservationModal = document.getElementById('reservationModal');
    const reservationModalBody = document.getElementById('reservationModalBody');
    const reservationCheckOutBtn = document.getElementById('reservationCheckOutBtn');
    const reservationCloseButtons = document.querySelectorAll('[data-close-reservation-modal="true"]');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const reservationData = window.staffReservationData || {};

    let currentReservationId = null;

    // Tab switching
    const switchToGuest = () => {
        guestTableSection.style.display = '';
        reservationTableSection.style.display = 'none';
        tabGuestBtn.style.backgroundColor = '#667eea';
        tabGuestBtn.style.color = 'white';
        tabReservationBtn.style.backgroundColor = '#e0e0e0';
        tabReservationBtn.style.color = '#333';
    };

    const switchToReservation = () => {
        guestTableSection.style.display = 'none';
        reservationTableSection.style.display = '';
        tabGuestBtn.style.backgroundColor = '#e0e0e0';
        tabGuestBtn.style.color = '#333';
        tabReservationBtn.style.backgroundColor = '#667eea';
        tabReservationBtn.style.color = 'white';
    };

    tabGuestBtn?.addEventListener('click', switchToGuest);
    tabReservationBtn?.addEventListener('click', switchToReservation);

    // Reservation modal functions
    const openReservationModal = (reservationId) => {
        currentReservationId = reservationId;
        const reservation = reservationData[reservationId];
        
        if (!reservation) return;

        // Build modal content
        const primaryGuest = reservation.reservation_guests.find(g => g.is_primary_guest);
        const companions = reservation.reservation_guests.filter(g => !g.is_primary_guest);

        let html = `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Main Guest</h4>
                <div style="padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem;">
                    ${primaryGuest && primaryGuest.customer ? `
                        <div><strong>${primaryGuest.customer.first_name} ${primaryGuest.customer.middle_name || ''} ${primaryGuest.customer.last_name}</strong></div>
                        <div style="font-size: 0.875rem; color: #666;">Age: ${primaryGuest.customer.age || 'N/A'} | Gender: ${primaryGuest.customer.gender || 'N/A'} | Nationality: ${primaryGuest.customer.nationality || 'N/A'}</div>
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
                            <div><strong>${c.customer.first_name} ${c.customer.middle_name || ''} ${c.customer.last_name}</strong></div>
                            <div style="font-size: 0.875rem; color: #666;">Age: ${c.customer.age || 'N/A'} | Gender: ${c.customer.gender || 'N/A'} | Nationality: ${c.customer.nationality || 'N/A'}</div>
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
                            <li>${a.amenity_name} (${a.pricing_type}) - ₱${parseFloat(a.price).toFixed(2)} x ${a.quantity}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
            <div style="border-top: 1px solid #ddd; padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Check-in:</span>
                    <strong>${reservation.check_in}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Reservation Type:</span>
                    <strong>${reservation.reservation_type === 'walk_in' ? 'Walk-in' : 'Online'}</strong>
                </div>
            </div>
        `;

        reservationModalBody.innerHTML = html;
        reservationModal.classList.add('is-open');
        reservationModal.setAttribute('aria-hidden', 'false');
    };

    const closeReservationModal = () => {
        currentReservationId = null;
        reservationModal.classList.remove('is-open');
        reservationModal.setAttribute('aria-hidden', 'true');
    };

    // Reservation row click handlers
    const reservationRows = reservationTableBody?.querySelectorAll('.reservation-row') ?? [];
    reservationRows.forEach(row => {
        row.addEventListener('click', () => {
            const reservationId = row.dataset.reservationId;
            openReservationModal(reservationId);
        });
    });

    // Reservation checkout
    reservationCheckOutBtn?.addEventListener('click', async () => {
        if (!currentReservationId) return;

        if (!confirm('Check out all guests in this reservation?')) return;

        const submitButton = reservationCheckOutBtn;
        submitButton.disabled = true;
        submitButton.textContent = 'Checking out...';

        try {
            const response = await fetch(`/staff/reservations/${currentReservationId}/check-out`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.message || 'Unable to check out this reservation.');
            }

            window.location.reload();
        } catch (error) {
            window.alert(error.message || 'Unable to check out this reservation.');
            submitButton.disabled = false;
            submitButton.textContent = 'Check Out';
        }
    });

    // Modal close handlers
    reservationCloseButtons.forEach(button => {
        button.addEventListener('click', closeReservationModal);
    });
});
