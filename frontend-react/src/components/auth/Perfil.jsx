import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { fetchProfile, updateProfile } from '../../services/authService';
import useAuth from '../../hooks/useAuth';

export default function Perfil() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProfile();
        setNombre(data.nombre_completo || '');
        setEmail(data.email || '');
      } catch (e) {
        showMsg('Error al cargar perfil: ' + e.message, 'error');
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, []);

  const showMsg = (text, type = 'info') => {
    const colors = { info: 'gray', success: 'green', error: 'red' };
    setMensaje({ text, color: colors[type] || 'gray' });
    setTimeout(() => setMensaje({ text: '', color: '' }), 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) { showMsg('El nombre es obligatorio', 'error'); return; }
    if (!email || !email.includes('@')) { showMsg('Correo no válido', 'error'); return; }
    try {
      await updateProfile({ nombre_completo: nombre, email });
      showMsg('Perfil actualizado correctamente', 'success');
      const storedUser = user;
      if (storedUser) {
        storedUser.nombre_completo = nombre;
        storedUser.email = email;
        const storage = localStorage.getItem('nochelista_user') ? localStorage : sessionStorage;
        storage.setItem('nochelista_user', JSON.stringify(storedUser));
      }
    } catch (e) {
      showMsg('Error: ' + e.message, 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { showMsg('La nueva contraseña debe tener al menos 8 caracteres', 'error'); return; }
    if (newPassword !== confirmPassword) { showMsg('Las contraseñas nuevas no coinciden', 'error'); return; }
    try {
      await updateProfile({ current_password: currentPassword, new_password: newPassword });
      showMsg('Contraseña actualizada correctamente', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      showMsg('Error: ' + e.message, 'error');
    }
  };

  if (profileLoading) {
    return (
      <>
        <Header />
        <main className="container my-5"><p className="text-center text-muted">Cargando perfil...</p></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container my-5">
        <div className="perfil-card">
          <h1 className="fw-bold mb-4 text-center">Mi Perfil</h1>

          {mensaje.text && <p style={{ color: mensaje.color, textAlign: 'center' }}>{mensaje.text}</p>}

          <div className="card shadow-sm p-4 mb-4" style={{ border: 'none', borderRadius: '16px' }}>
            <div className="section-title">Información Personal</div>
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre_completo" className="form-label">Nombre completo</label>
                <input type="text" className="form-control" id="nombre_completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo electrónico</label>
                <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
            </form>
          </div>

          <div className="card shadow-sm p-4" style={{ border: 'none', borderRadius: '16px' }}>
            <div className="section-title">Cambiar Contraseña</div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label htmlFor="current_password" className="form-label">Contraseña actual</label>
                <input type="password" className="form-control" id="current_password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required minLength="6" />
              </div>
              <div className="mb-3">
                <label htmlFor="new_password" className="form-label">Nueva contraseña (mín. 8 caracteres)</label>
                <input type="password" className="form-control" id="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="8" />
              </div>
              <div className="mb-3">
                <label htmlFor="confirm_password" className="form-label">Confirmar nueva contraseña</label>
                <input type="password" className="form-control" id="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-outline-primary w-100">Actualizar Contraseña</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
