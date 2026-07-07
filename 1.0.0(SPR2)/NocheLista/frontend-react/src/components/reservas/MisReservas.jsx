import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { misReservas as fetchReservas, cancelarReserva } from '../../services/reservaService';
import { formatDate, formatCurrency, tipoHabitacionLabels } from '../../utils/validaciones';

const estadoLabels = {
  pendiente: { text: 'Pendiente', class: 'bg-warning' },
  confirmada: { text: 'Confirmada', class: 'bg-success' },
  cancelada: { text: 'Cancelada', class: 'bg-danger' },
  completada: { text: 'Completada', class: 'bg-info' },
};

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReservas();
      setReservas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    try {
      await cancelarReserva(id);
      cargarReservas();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Mis Reservas</h1>
          <Link to="/hoteles" className="btn btn-primary">+ Nueva Reserva</Link>
        </div>
        <div id="reservasContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando tus reservas...</p>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : reservas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted fs-5">No tienes reservas aún.</p>
              <Link to="/hoteles" className="btn btn-primary mt-3">Explorar Hoteles</Link>
            </div>
          ) : (
            reservas.map((r) => {
              const est = estadoLabels[r.estado] || { text: r.estado, class: 'bg-secondary' };
              return (
                <div key={r.id} className="card shadow-sm mb-3 border-0">
                  <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold mb-1">{r.hotel_nombre || 'Hotel'}</h5>
                        <p className="mb-1 text-muted small">
                          Habitación: {r.habitacion_nombre || tipoHabitacionLabels[r.habitacion_tipo] || 'N/A'} | {formatCurrency(r.precio_total)}
                        </p>
                        <p className="mb-0 text-muted small">{formatDate(r.fecha_entrada)} → {formatDate(r.fecha_salida)}</p>
                        <small className="text-muted">Reservado: {new Date(r.creado_en).toLocaleDateString()}</small>
                        <span className={`badge ${est.class} ms-2`}>{est.text}</span>
                      </div>
                      <div className="mt-2 mt-md-0">
                        {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelar(r.id)}>Cancelar</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
