import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  const cargarSolicitudes = async (estado = '') => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/admin/solicitudes/';
      if (estado) endpoint += `?estado=${estado}`;
      const data = await api.get(endpoint).then(r => r.data);
      setSolicitudes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleAprobar = async (id) => {
    if (!window.confirm('¿Aprobar esta solicitud? Se creará un hotel y el usuario será gestor.')) return;
    try {
      await api.put(`/admin/solicitudes/${id}/`, { estado: 'aprobada' });
      cargarSolicitudes(filtro);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm('¿Rechazar esta solicitud?')) return;
    try {
      await api.put(`/admin/solicitudes/${id}/`, { estado: 'rechazada' });
      cargarSolicitudes(filtro);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Solicitudes de Afiliación</h1>
        <div className="mb-3">
          <select
            className="form-select w-auto"
            value={filtro}
            onChange={(e) => { setFiltro(e.target.value); cargarSolicitudes(e.target.value); }}
          >
            <option value="">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
        <div id="solicitudesContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando...</p>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : solicitudes.length === 0 ? (
            <p className="text-muted text-center py-5">No hay solicitudes.</p>
          ) : (
            solicitudes.map((s) => (
              <div key={s.id} className="card shadow-sm mb-3 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold">{s.nombre_hotel}</h5>
                      <p className="mb-1 text-muted">{s.descripcion?.substring(0, 150)}...</p>
                      <p className="mb-1 small text-muted">📍 {s.direccion}, {s.ciudad}</p>
                      <span className={`badge ${s.estado === 'pendiente' ? 'bg-warning' : s.estado === 'aprobada' ? 'bg-success' : 'bg-danger'}`}>{s.estado}</span>
                      <small className="text-muted ms-2">Creado: {new Date(s.creado_en).toLocaleDateString()}</small>
                    </div>
                    {s.estado === 'pendiente' && (
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => handleAprobar(s.id)}>Aprobar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRechazar(s.id)}>Rechazar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
