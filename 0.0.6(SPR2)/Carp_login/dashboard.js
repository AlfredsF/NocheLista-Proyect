document.addEventListener('DOMContentLoaded', () => {
    // SPA Tab Navigation Logic
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            tabLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });

            // Show target tab content
            const targetId = link.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = targetId === 'informacion' ? 'grid' : 'block';
                targetContent.classList.add('active');
            }
        });
    });

    // SweetAlert "Actualizar" logic
    const btnActualizar = document.getElementById('btnActualizar');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', () => {
            Swal.fire({
                icon: 'success',
                title: '¡Datos Guardados!',
                text: 'Tu información se ha actualizado correctamente.',
                confirmButtonColor: '#1fa2b6',
                timer: 2000
            });
        });
    }

    // SweetAlert Review Actions Logic
    const approveButtons = document.querySelectorAll('.btn.aprobar');
    const deleteButtons = document.querySelectorAll('.btn.eliminar');

    approveButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.review-card');
            const status = card.querySelector('.estado');
            if (status) {
                status.textContent = 'APROBADO';
                status.style.color = '#28a745';
            }
            
            // Minimalist Toast notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: 'success',
                title: 'Reseña aprobada exitosamente'
            });
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.review-card');
            
            Swal.fire({
                title: '¿Eliminar reseña?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Hide the card
                    card.style.display = 'none';
                    
                    Swal.fire({
                        title: 'Eliminada',
                        text: 'La reseña ha sido borrada.',
                        icon: 'success',
                        confirmButtonColor: '#1fa2b6'
                    });
                }
            });
        });
    });

    // Load Reservations
    const cargarReservas = () => {
        const reservas = JSON.parse(localStorage.getItem('nochelista_reservas')) || [];
        const container = document.getElementById('reservasLista');
        const sinMsg = document.getElementById('sinReservas');
        if (!container) return;
        if (reservas.length === 0) {
            container.innerHTML = '';
            if (sinMsg) sinMsg.style.display = 'block';
            return;
        }
        if (sinMsg) sinMsg.style.display = 'none';
        container.innerHTML = reservas.map((r, i) => `
            <div style="border:1px solid #e0e0e0;border-radius:12px;padding:16px;margin-bottom:12px;background:#fafafa;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <h4 style="margin:0 0 4px;color:#1fa2b6;">${r.hotel || 'Hotel'}</h4>
                        <p style="margin:2px 0;color:#555;">📅 ${r.entrada} → ${r.salida}</p>
                        <p style="margin:2px 0;color:#555;">🌙 ${r.noches} noche(s) · 👤 ${r.personas} persona(s)</p>
                    </div>
                    <button class="btn-eliminar-reserva" data-index="${i}" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:18px;" title="Cancelar reserva">✕</button>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.btn-eliminar-reserva').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                Swal.fire({
                    title: '¿Cancelar reserva?',
                    text: 'Esta acción no se puede deshacer',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, cancelar',
                    cancelButtonText: 'Volver'
                }).then((result) => {
                    if (result.isConfirmed) {
                        let reservas = JSON.parse(localStorage.getItem('nochelista_reservas')) || [];
                        reservas.splice(idx, 1);
                        localStorage.setItem('nochelista_reservas', JSON.stringify(reservas));
                        cargarReservas();
                        Swal.fire({ icon: 'success', title: 'Reserva cancelada', confirmButtonColor: '#1fa2b6' });
                    }
                });
            });
        });
    };

    // Load reservations when tab is shown
    const reservasTabLink = document.querySelector('.tab-link[data-tab="reservas"]');
    if (reservasTabLink) {
        reservasTabLink.addEventListener('click', () => {
            setTimeout(cargarReservas, 50);
        });
    }

    // Also load on page load
    cargarReservas();

    // Logout Logic
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('active_user');
        });
    }
});
