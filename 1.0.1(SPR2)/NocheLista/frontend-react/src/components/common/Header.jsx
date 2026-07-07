import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const rolLabel = { cliente: 'Cliente', gestor: 'Gestor', admin: 'Admin' };

export default function Header() {
  const { user, isAuthenticated, rol, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'color: #00b2a9;' : '';

  return (
    <header className="cabecera">
      <div className="logo">
        <Link to="/"><img src="/logo.jpeg" alt="Logo NocheLista" /></Link>
      </div>

      <nav>
        <input
          type="checkbox"
          id="check"
          checked={menuOpen}
          onChange={() => setMenuOpen(!menuOpen)}
        />
        <label htmlFor="check" className="checkbtn">
          <i className="fas fa-bars"></i>
        </label>
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
          <li><Link to="/hoteles" onClick={() => setMenuOpen(false)}>Hoteles</Link></li>
          {isAuthenticated && (
            <li><Link to="/mis-reservas" onClick={() => setMenuOpen(false)}>Mis Reservas</Link></li>
          )}
          <li><Link to="/#app" onClick={() => setMenuOpen(false)}>App</Link></li>
          <li><Link to="/#contacto" onClick={() => setMenuOpen(false)}>Contacto</Link></li>
          {rol === 'admin' && (
            <li><Link to="/admin" className="nav-link-admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>
          )}
          {rol === 'gestor' && (
            <li><Link to="/gestor" className="nav-link-gestor" onClick={() => setMenuOpen(false)}>Gestor</Link></li>
          )}
        </ul>
      </nav>

      <div className="icono-usuario" style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/perfil"><img src="/perfil.png" alt="Perfil Usuario" style={{ borderRadius: '50%', height: '40px', width: '40px' }} /></Link>
            <span style={{ color: '#333', marginLeft: '8px', fontSize: '14px' }}>
              Hola, <strong>{user?.nombre_completo || user?.email}</strong>
              {rol && <span className="badge bg-secondary ms-1" style={{ fontSize: '10px' }}>{rolLabel[rol] || rol}</span>}
              <Link to="/perfil" style={{ color: '#333', textDecoration: 'none', fontSize: '12px', marginLeft: '4px' }}>Perfil</Link>
              {' | '}
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#ffc107', textDecoration: 'none', cursor: 'pointer' }}>Cerrar sesión</a>
            </span>
          </>
        ) : (
          <Link to="/login">
            <img src="/perfil.png" alt="Perfil Usuario" style={{ borderRadius: '50%', height: '40px', width: '40px' }} />
          </Link>
        )}
      </div>
    </header>
  );
}
