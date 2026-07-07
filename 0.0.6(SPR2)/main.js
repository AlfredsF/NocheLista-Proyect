document.addEventListener('DOMContentLoaded', () => {

    // 1. Validación de Formulario de Contacto
    const formContacto = document.querySelector('form');
    // Verificamos si estamos en la página de contacto viendo si existe el botón "Enviar Mensaje"
    const btnSubmit = formContacto ? formContacto.querySelector('button[type="submit"]') : null;
    
    if (formContacto && btnSubmit && btnSubmit.textContent.includes('Enviar Mensaje')) {
        formContacto.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el envío por defecto para validar primero
            
            const nombre = document.getElementById('nombre');
            const email = document.getElementById('email');
            const mensaje = document.getElementById('mensaje');

            if (!nombre.value.trim() || !email.value.trim() || !mensaje.value.trim()) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }

            // Validación simple de formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                return;
            }

            alert('¡Gracias por tu mensaje, ' + nombre.value + '! Te responderemos a ' + email.value + ' lo antes posible.');
            formContacto.reset();
        });
    }

    // 2. Lógica de Filtrado de Hoteles (unificado)
    const aplicarFiltros = () => {
        const precioMaximo = parseInt(document.getElementById('barra').value);
        const estrellasInput = document.querySelector('input[name="estrellas"]:checked');
        const estrellasFiltradas = estrellasInput ? parseInt(estrellasInput.getAttribute('data-estrellas') || estrellasInput.value) : 0;
        const radiosUbicacion = document.querySelectorAll('input[name="ubicacion"]');
        let ubicacionFiltrada = null;
        radiosUbicacion.forEach(r => { if (r.checked) ubicacionFiltrada = r.parentElement.textContent.trim().toLowerCase(); });
        const radiosAlojamiento = document.querySelectorAll('input[name="alojamiento"]');
        let alojamientoFiltrado = null;
        radiosAlojamiento.forEach(r => { if (r.checked) alojamientoFiltrado = r.parentElement.textContent.trim().toLowerCase(); });

        const hotelCards = document.querySelectorAll('.hotel-card');
        let visibles = 0;
        hotelCards.forEach(card => {
            const precioHotel = parseInt(card.getAttribute('data-precio') || 0);
            const estrellasHotel = parseInt(card.getAttribute('data-estrellas') || 0);
            const ubicacionHotel = (card.getAttribute('data-ubicacion') || '').toLowerCase();
            const alojamientoHotel = (card.getAttribute('data-alojamiento') || '').toLowerCase();
            let mostrar = true;
            if (precioHotel > precioMaximo) mostrar = false;
            if (estrellasFiltradas > 0 && estrellasHotel !== estrellasFiltradas) mostrar = false;
            if (ubicacionFiltrada && !ubicacionHotel.includes(ubicacionFiltrada)) mostrar = false;
            if (alojamientoFiltrado && !alojamientoHotel.includes(alojamientoFiltrado)) mostrar = false;
            if (mostrar) { card.style.display = 'flex'; visibles++; } else { card.style.display = 'none'; }
        });
        if (visibles === 0) {
            alert('No se encontraron hoteles con los filtros seleccionados.');
        }
        document.getElementById('numero').textContent = precioMaximo;
    };

    const btnFiltrar = document.querySelector('.btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', aplicarFiltros);
    }

    // 3. Session Navigation Logic & Dropdown
    const activeUserJSON = sessionStorage.getItem('active_user');
    if (activeUserJSON) {
        const activeUser = JSON.parse(activeUserJSON);
        const profileLinks = document.querySelectorAll('.icono-usuario a, .perfil-usuario');
        
        profileLinks.forEach(link => {
            if (link.href.includes('login.html')) {
                const isRoot = !window.location.href.includes('/detalles_pag/');
                const dashboardPath = isRoot ? 'Carp_login/dashboard.html' : '../Carp_login/dashboard.html';

                link.href = '#';
                
                link.innerHTML = `
                    <div style="position: relative; display: inline-block;" class="dropdown-container">
                        <div style="display: flex; align-items: center; gap: 8px; background: #f3f4f6; padding: 4px 12px 4px 4px; border-radius: 9999px; cursor: pointer;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #1fa2b6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                ${activeUser.user.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-weight: 600; color: #374151;">${activeUser.user}</span>
                        </div>
                        <div class="dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; width: 200px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #f3f4f6; z-index: 1000; overflow: hidden;">
                            <a href="${dashboardPath}" style="display: block; padding: 12px 16px; text-decoration: none; color: #374151; border-bottom: 1px solid #f3f4f6;">Mi Dashboard</a>
                            <button class="btn-logout-global" style="display: block; width: 100%; text-align: left; padding: 12px 16px; background: none; border: none; color: #dc2626; font-weight: 600; cursor: pointer;">Cerrar Sesión</button>
                        </div>
                    </div>
                `;

                const container = link.querySelector('.dropdown-container');
                const menu = link.querySelector('.dropdown-menu');
                const toggleArea = container.querySelector(':scope > div:first-child');
                
                toggleArea.addEventListener('click', (e) => {
                    e.preventDefault();
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                });

                const logoutBtn = link.querySelector('.btn-logout-global');
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sessionStorage.removeItem('active_user');
                    Swal.fire({
                        icon: 'success',
                        title: 'Sesión cerrada',
                        text: 'Has cerrado sesión correctamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload();
                    });
                });
                
                document.addEventListener('click', (e) => {
                    if (!container.contains(e.target)) {
                        menu.style.display = 'none';
                    }
                });
            }
        });
    }

// 5. Lógica de Filtrado de Hoteles (unificado) - ya declarada previamente

// 4. Reserva de Hotel en páginas de detalle
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btnReservar') {
    const fecha = document.getElementById('fechaReserva');
    const noches = document.getElementById('nochesReserva');
    const personas = document.getElementById('personasReserva');
    if (!fecha?.value) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha incompleta',
        text: 'Por favor selecciona la fecha de ingreso.',
      });
      return;
    }
    const entradaDate = new Date(fecha.value);
    const nochesVal = parseInt(noches?.value) || 1;
    const personasVal = parseInt(personas?.value) || 1;
    const salidaDate = new Date(entradaDate);
    salidaDate.setDate(salidaDate.getDate() + nochesVal);
    const salidaStr = salidaDate.toISOString().split('T')[0];
    const hotelName = document.querySelector('h1')?.textContent || 'Hotel';
    let reservas = JSON.parse(localStorage.getItem('nochelista_reservas')) || [];
    reservas.push({
      hotel: hotelName,
      entrada: fecha.value,
      salida: salidaStr,
      noches: nochesVal,
      personas: personasVal,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('nochelista_reservas', JSON.stringify(reservas));
    Swal.fire({
      icon: 'success',
      title: 'Reserva confirmada',
      html: `<p><strong>${hotelName}</strong></p><p>Del ${fecha.value} al ${salidaStr}</p><p>Noches: ${nochesVal} | Personas: ${personasVal}</p>`,
    });
    e.target.disabled = true;
    e.target.textContent = 'Reservado';
    e.target.classList.remove('btn-success');
    e.target.classList.add('btn-secondary');
  }
});

});
