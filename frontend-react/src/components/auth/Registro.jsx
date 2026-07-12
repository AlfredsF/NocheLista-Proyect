import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
    rol: 'cliente',
  });
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'password' && formData.confirmar) {
      validateField('confirmar', formData.confirmar);
    }
    if (name === 'confirmar' && formData.password) {
      validateField('confirmar', value);
    }
  };

  const showFieldError = (name, msg) => {
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'nombre_completo':
        if (!value.trim()) { showFieldError(name, 'El nombre es obligatorio'); return false; }
        clearFieldError(name); return true;
      case 'email':
        if (!value.trim()) { showFieldError(name, 'El correo es obligatorio'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { showFieldError(name, 'Correo no válido'); return false; }
        clearFieldError(name); return true;
      case 'password':
        if (value.length < 6) { showFieldError(name, 'Mínimo 6 caracteres'); return false; }
        clearFieldError(name);
        if (formData.confirmar) validateField('confirmar', formData.confirmar);
        return true;
      case 'confirmar':
        if (value !== formData.password) { showFieldError(name, 'Las contraseñas no coinciden'); return false; }
        clearFieldError(name); return true;
      default:
        return true;
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ['nombre_completo', 'email', 'password', 'confirmar'];
    const allValid = fields.every((f) => validateField(f, formData[f]));
    if (!allValid) return;

    setMensaje({ text: 'Registrando...', color: 'gray' });

    try {
      const user = await registro({
        email: formData.email.trim(),
        password: formData.password,
        nombre_completo: formData.nombre_completo.trim(),
        telefono: formData.telefono.trim(),
        rol: formData.rol,
      });
      setMensaje({ text: 'Registro exitoso. Redirigiendo...', color: 'green' });
      setTimeout(() => {
        if (user.rol === 'admin') navigate('/admin');
        else if (user.rol === 'gestor') navigate('/gestor');
        else navigate('/hoteles');
      }, 1500);
    } catch (err) {
      setMensaje({ text: err.message, color: 'red' });
    }
  };

  const inputClassName = (name) =>
    fieldErrors[name] ? 'input-error' : '';

  return (
    <div className="auth-body" style={{ minHeight: '100vh' }}>
      <header className="auth-header">
        <Link to="/"><img src="/logo.jpeg" alt="Logo NocheLista" /></Link>
      </header>
      <main className="auth-main">
        <div className="auth-card auth-card-wide">
          <h1>Crear cuenta</h1>
          {mensaje.text && <p style={{ color: mensaje.color, marginBottom: '10px', fontSize: '14px' }}>{mensaje.text}</p>}
          <form onSubmit={handleSubmit}>
            <div className="inputs">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClassName('nombre_completo')}
              />
              {fieldErrors.nombre_completo && <small className="field-error">{fieldErrors.nombre_completo}</small>}
            </div>
            <div className="inputs">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClassName('email')}
              />
              {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
            </div>
            <div className="inputs">
              <label>Teléfono (opcional)</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={inputClassName('telefono')}
                placeholder="+593999999999"
              />
            </div>
            <div className="inputs">
              <label>Contraseña (mín. 6 caracteres)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClassName('password')}
              />
              {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
            </div>
            <div className="inputs">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                name="confirmar"
                value={formData.confirmar}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClassName('confirmar')}
              />
              {fieldErrors.confirmar && <small className="field-error">{fieldErrors.confirmar}</small>}
            </div>
            <div className="inputs">
              <label>Tipo de cuenta</label>
              <select name="rol" value={formData.rol} onChange={handleChange} className="input-select">
                <option value="cliente">Cliente - Quiero reservar hoteles</option>
                <option value="gestor">Gestor - Quiero afiliar mi hotel</option>
                <option value="admin">Admin - Quiero administrar la plataforma</option>
              </select>
            </div>
            <button type="submit">Crear cuenta</button>
            <p className="auth-bottom-text">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
