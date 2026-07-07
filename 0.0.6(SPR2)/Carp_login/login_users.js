// Utility function for SweetAlert
const showAlert = (icon, title, text) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#007bff'
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------
    // REGISTRATION LOGIC
    // -----------------------
    const formRegistro = document.getElementById('form_registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = document.getElementById('reg_usuario').value.trim();
            const email = document.getElementById('reg_correo').value.trim();
            const pass = document.getElementById('reg_password').value;
            const confirm = document.getElementById('reg_confirmar').value;

            if (!user || !email || !pass || !confirm) {
                showAlert('error', 'Oops...', 'Todos los campos son obligatorios.');
                return;
            }

            if (pass !== confirm) {
                showAlert('error', 'Error', 'Las contraseñas no coinciden.');
                return;
            }

            // Get existing users or init empty array
            let users = JSON.parse(localStorage.getItem('nochelista_users')) || [];

            // Check if user already exists
            const userExists = users.some(u => u.user === user || u.email === email);
            if (userExists) {
                showAlert('error', 'Usuario existente', 'El nombre de usuario o correo ya está registrado.');
                return;
            }

            // Save user
            users.push({ user, email, pass });
            localStorage.setItem('nochelista_users', JSON.stringify(users));

            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                confirmButtonColor: '#007bff'
            }).then(() => {
                window.location.href = 'login.html';
            });
        });
    }

    // -----------------------
    // LOGIN LOGIC
    // -----------------------
    const formLogin = document.getElementById('form_login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = document.getElementById('Usuario').value.trim();
            const pass = document.getElementById('contrasena').value;

            // Default admin user
            if (user === 'root' && pass === 'root') {
                sessionStorage.setItem('active_user', JSON.stringify({ user: 'Administrador', role: 'admin' }));
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido Administrador!',
                    text: 'Iniciando sesión...',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
                return;
            }

            // Check localStorage users
            let users = JSON.parse(localStorage.getItem('nochelista_users')) || [];
            const validUser = users.find(u => u.user === user && u.pass === pass);

            if (validUser) {
                sessionStorage.setItem('active_user', JSON.stringify(validUser));
                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${validUser.user}!`,
                    text: 'Iniciando sesión...',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                showAlert('error', 'Acceso denegado', 'Usuario o contraseña incorrectos.');
            }
        });
    }
});