import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function HotelDashboard() {
  const [metricas, setMetricas] = useState({
    confirmadas: 0,
    pendientes: 0,
    ingresos_totales: 0,
    ocupacion: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/dashboard/hotel/').then(r => r.data);
        setMetricas(data);
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Dashboard de Gestor</h1>
        {error ? (
          <div className="row g-4 mb-5">
            <div className="col-12"><p className="text-danger">{error}</p></div>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5>Reservas Confirmadas</h5>
                  <p className="display-6 fw-bold text-success">{metricas.confirmadas}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5>Reservas Pendientes</h5>
                  <p className="display-6 fw-bold text-warning">{metricas.pendientes}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5>Ingresos</h5>
                  <p className="display-6 fw-bold text-primary">${(metricas.ingresos_totales || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5>Ocupación</h5>
                  <p className="display-6 fw-bold text-info">{metricas.ocupacion}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
