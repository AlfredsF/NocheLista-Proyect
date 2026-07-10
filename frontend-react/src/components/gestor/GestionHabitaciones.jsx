import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';
import { tipoHabitacionLabels, formatCurrency } from '../../utils/validaciones';

export default function GestionHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [hotelId, setHotelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'standard',
    nombre: '',
    descripcion: '',
    precio_por_noche: '',
    capacidad: '2',
  });

  const getHotelId = async () => {
    if (hotelId) return hotelId;
    const data = await api.get('/gestor/hotel/').then(r => r.data);
    setHotelId(data.id);
    return data.id;
  };

  const cargarHabitaciones = async () => {
    setLoading(true);
    try {
      const hid = await getHotelId();
      const data = await api.get(`/habitaciones/?hotel_id=${hid}`).then(r => r.data);
      setHabitaciones(data);
    } catch (e) {
      setMensaje({ text: 'Error: ' + e.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarHabitaciones(); }, []);

  const resetForm = () => {
    setEditId('');
    setFormData({ tipo: 'standard', nombre: '', descripcion: '', precio_por_noche: '', capacidad: '2' });
  };

  const handleEdit = async (id) => {
    try {
      const data = await api.get(`/habitaciones/${id}/`).then(r => r.data);
      setEditId(id);
      setFormData({
        tipo: data.tipo,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        precio_por_noche: String(data.precio_por_noche),
        capacidad: String(data.capacidad),
      });
      setShowModal(true);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta habitación?')) return;
    try {
      await api.delete(`/habitaciones/${id}/`);
      cargarHabitaciones();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hid = await getHotelId();
    const body = {
      hotel_id: hid,
      tipo: formData.tipo,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      precio_por_noche: parseFloat(formData.precio_por_noche),
      capacidad: parseInt(formData.capacidad),
    };
    try {
      if (editId) {
        await api.put(`/habitaciones/${editId}/`, body);
        setMensaje({ text: 'Habitación actualizada', color: 'green' });
      } else {
        await api.post('/habitaciones/', body);
        setMensaje({ text: 'Habitación creada', color: 'green' });
      }
      setShowModal(false);
      cargarHabitaciones();
    } catch (err) {
      setMensaje({ text: 'Error: ' + err.message, color: 'red' });
    }
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Habitaciones</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Nueva Habitación</button>
        </div>
        {mensaje.text && <p className="mb-3" style={{ color: mensaje.color }}>{mensaje.text}</p>}
        <div id="habitacionesContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando...</p>
          ) : habitaciones.length === 0 ? (
            <p className="text-muted text-center py-5">No hay habitaciones registradas.</p>
          ) : (
            habitaciones.map((h) => (
              <div key={h.id} className="card shadow-sm mb-3 border-0">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-1">{h.nombre}</h5>
                    <span className="badge bg-info me-2">{tipoHabitacionLabels[h.tipo] || h.tipo}</span>
                    <span className="fw-bold text-success">{formatCurrency(h.precio_por_noche)}/noche</span>
                    <p className="mb-0 text-muted small">
                      Capacidad: {h.capacidad} personas{' '}
                      {h.disponible ? <span className="badge bg-success">Disponible</span> : <span className="badge bg-danger">No disponible</span>}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(h.id)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(h.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <div className="modal-header">
              <h5 className="modal-title">{editId ? 'Editar Habitación' : 'Nueva Habitación'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" name="tipo" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} required>
                    <option value="standard">Estándar</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" name="descripcion" rows="2" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}></textarea>
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Precio por noche ($)</label>
                    <input type="number" className="form-control" name="precio_por_noche" step="0.01" min="1" value={formData.precio_por_noche} onChange={(e) => setFormData({ ...formData, precio_por_noche: e.target.value })} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Capacidad</label>
                    <input type="number" className="form-control" name="capacidad" min="1" value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
