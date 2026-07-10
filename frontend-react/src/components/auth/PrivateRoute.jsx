import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function PrivateRoute({ children, roles = null }) {
  const { isAuthenticated, rol, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
