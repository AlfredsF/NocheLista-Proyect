import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ text: 'Iniciando sesión...', color: 'gray' });

    try {
      const user = await login(email.trim(), password, remember);
      setMensaje({ text: 'Inicio exitoso. Redirigiendo...', color: 'green' });
      setTimeout(() => {
        if (user.rol === 'admin') navigate('/admin');
        else if (user.rol === 'gestor') navigate('/gestor');
        else navigate('/hoteles');
      }, 1000);
    } catch (err) {
      setMensaje({ text: err.message, color: 'red' });
    }
  };

  return (
    <div className="auth-body" style={{ minHeight: '100vh' }}>
      <header className="auth-header">
        <Link to="/"><img src="/logo.jpeg" alt="Logo NocheLista" /></Link>
      </header>
      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Inicia sesión</h2>
          {mensaje.text && <p style={{ color: mensaje.color, marginBottom: '10px', fontSize: '14px' }}>{mensaje.text}</p>}
          <div className="inputs">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="inputs">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="inputs">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="recordar">Recordar sesión</label>
          </div>
          <button type="submit">Inicia sesión</button>
          <Link to="/registro" className="auth-link-registro">Registrarse</Link>
        </form>
      </main>
    </div>
  );
}
