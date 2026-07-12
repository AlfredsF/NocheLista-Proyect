import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function Promociones() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [hotelId, setHotelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    descuento_porcentaje: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const getHotelId = async () => {
    if (hotelId) return hotelId;
    const data = await api.get('/gestor/mi-hotel/').then(r => r.data);
    setHotelId(data.id);
    return data.id;
  };

  const cargarPromociones = async () => {
    setLoading(true);
    try {
      const hid = await getHotelId();
      const data = await api.get(`/gestor/promociones/?hotel_id=${hid}`).then(r => r.data);
      setPromociones(data);
    } catch (e) {
      setMensaje({ text: 'Error: ' + e.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPromociones(); }, []);

  const resetPromoForm = () => {
    setEditId('');
    setFormData({ titulo: '', descripcion: '', descuento_porcentaje: '', fecha_inicio: '', fecha_fin: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hid = await getHotelId();
    const body = {
      hotel_id: hid,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      descuento_porcentaje: parseInt(formData.descuento_porcentaje),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
    };
    try {
      if (editId) {
        await api.put(`/gestor/promociones/${editId}/`, body);
      } else {
        await api.post('/gestor/promociones/', body);
      }
      setShowModal(false);
      setMensaje({ text: 'Promoción guardada', color: 'green' });
      cargarPromociones();
    } catch (err) {
      setMensaje({ text: 'Error: ' + err.message, color: 'red' });
    }
  };

  const handleToggle = async (id, activo) => {
    try {
      await api.put(`/gestor/promociones/${id}/`, { activo });
      cargarPromociones();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return;
    try {
      await api.delete(`/gestor/promociones/${id}/`);
      cargarPromociones();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Promociones</h1>
          <button className="btn btn-primary" onClick={() => { resetPromoForm(); setShowModal(true); }}>+ Nueva Promoción</button>
        </div>
        {mensaje.text && <p className="mb-3" style={{ color: mensaje.color }}>{mensaje.text}</p>}
        <div id="promocionesContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando...</p>
          ) : promociones.length === 0 ? (
            <p className="text-muted text-center py-5">No hay promociones.</p>
          ) : (
            promociones.map((p) => (
              <div key={p.id} className="card shadow-sm mb-3 border-0">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-1">{p.titulo}</h5>
                    <span className="badge bg-danger me-2">-{p.descuento_porcentaje}%</span>
                    <small className="text-muted">{p.fecha_inicio} → {p.fecha_fin}</small>
                    {p.activo ? <span className="badge bg-success ms-2">Activa</span> : <span className="badge bg-secondary ms-2">Inactiva</span>}
                    {p.descripcion && <p className="mb-0 text-muted small mt-1">{p.descripcion}</p>}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleToggle(p.id, !p.activo)}>{p.activo ? 'Desactivar' : 'Activar'}</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
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
              <h5 className="modal-title">{editId ? 'Editar Promoción' : 'Nueva Promoción'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input type="text" className="form-control" name="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" name="descripcion" rows="2" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Descuento (%)</label>
                  <input type="number" className="form-control" name="descuento_porcentaje" min="1" max="100" value={formData.descuento_porcentaje} onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })} required />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Fecha Inicio</label>
                    <input type="date" className="form-control" name="fecha_inicio" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Fecha Fin</label>
                    <input type="date" className="form-control" name="fecha_fin" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} required />
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
