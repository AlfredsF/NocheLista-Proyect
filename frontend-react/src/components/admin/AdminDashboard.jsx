import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState({
    solicitudes_pendientes: 0,
    total_usuarios: 0,
    total_hoteles: 0,
    ingresos_totales: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/admin/metricas/').then(r => r.data);
        setMetricas(data);
      } catch (e) {
        console.error('Error cargando métricas:', e);
      }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Panel de Administración</h1>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-hotel text-primary me-2"></i>Solicitudes Pendientes</h5>
                <p className="display-6 fw-bold text-primary">{metricas.solicitudes_pendientes}</p>
                <Link to="/admin/solicitudes" className="btn btn-primary btn-sm">Gestionar</Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-users text-success me-2"></i>Usuarios Registrados</h5>
                <p className="display-6 fw-bold text-success">{metricas.total_usuarios}</p>
                <Link to="/admin/usuarios" className="btn btn-success btn-sm">Gestionar</Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-building text-info me-2"></i>Hoteles Activos</h5>
                <p className="display-6 fw-bold text-info">{metricas.total_hoteles}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-dollar-sign text-warning me-2"></i>Ingresos Totales</h5>
                <p className="display-6 fw-bold text-warning">${(metricas.ingresos_totales || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title"><i className="fas fa-tag text-danger me-2"></i>Promociones</h5>
                <p className="text-muted mb-2">Gestiona las promociones de todos los hoteles</p>
                <Link to="/admin/promociones" className="btn btn-danger btn-sm">Gestionar</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
