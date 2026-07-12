import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({
    hotel_id: '',
    titulo: '',
    descripcion: '',
    descuento_porcentaje: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const cargarHoteles = async () => {
    try {
      const data = await api.get('/hoteles/').then(r => r.data);
      setHoteles(data);
    } catch (e) {
      console.error('Error cargando hoteles:', e);
    }
  };

  const cargarPromociones = async () => {
    setLoading(true);
    try {
      const data = await api.get('/promociones/').then(r => r.data);
      setPromociones(data);
    } catch (e) {
      setMensaje({ text: 'Error: ' + e.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHoteles();
    cargarPromociones();
  }, []);

  const resetForm = () => {
    setEditId('');
    setFormData({ hotel_id: '', titulo: '', descripcion: '', descuento_porcentaje: '', fecha_inicio: '', fecha_fin: '' });
  };

  const getHotelName = (hotelId) => {
    const hotel = hoteles.find(h => h.id === hotelId);
    return hotel ? hotel.nombre : 'Hotel desconocido';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      hotel_id: formData.hotel_id,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      descuento_porcentaje: parseInt(formData.descuento_porcentaje),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
    };
    try {
      if (editId) {
        await api.put(`/promociones/${editId}/`, body);
      } else {
        await api.post('/promociones/', body);
      }
      setShowModal(false);
      setMensaje({ text: 'Promoción guardada correctamente', color: 'green' });
      cargarPromociones();
    } catch (err) {
      setMensaje({ text: 'Error: ' + err.message, color: 'red' });
    }
  };

  const handleToggle = async (id, activo) => {
    try {
      await api.put(`/promociones/${id}/`, { activo });
      cargarPromociones();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return;
    try {
      await api.delete(`/promociones/${id}/`);
      cargarPromociones();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleEdit = (promo) => {
    setEditId(promo.id);
    setFormData({
      hotel_id: promo.hotel_id,
      titulo: promo.titulo,
      descripcion: promo.descripcion || '',
      descuento_porcentaje: promo.descuento_porcentaje,
      fecha_inicio: promo.fecha_inicio,
      fecha_fin: promo.fecha_fin,
    });
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">Gestión de Promociones</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Nueva Promoción</button>
        </div>
        {mensaje.text && <p className="mb-3" style={{ color: mensaje.color }}>{mensaje.text}</p>}
        <div id="adminPromocionesContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando...</p>
          ) : promociones.length === 0 ? (
            <p className="text-muted text-center py-5">No hay promociones registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Título</th>
                    <th>Hotel</th>
                    <th>Descuento</th>
                    <th>Período</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promociones.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.titulo}</td>
                      <td>{getHotelName(p.hotel_id)}</td>
                      <td><span className="badge bg-danger">-{p.descuento_porcentaje}%</span></td>
                      <td><small>{p.fecha_inicio} → {p.fecha_fin}</small></td>
                      <td>
                        {p.activo
                          ? <span className="badge bg-success">Activa</span>
                          : <span className="badge bg-secondary">Inactiva</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}>Editar</button>
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggle(p.id, !p.activo)}>
                            {p.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <label className="form-label">Hotel</label>
                  <select className="form-select" value={formData.hotel_id} onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })} required>
                    <option value="">Seleccionar hotel...</option>
                    {hoteles.map(h => (
                      <option key={h.id} value={h.id}>{h.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input type="text" className="form-control" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows="2" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Descuento (%)</label>
                  <input type="number" className="form-control" min="1" max="100" value={formData.descuento_porcentaje} onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })} required />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Fecha Inicio</label>
                    <input type="date" className="form-control" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label">Fecha Fin</label>
                    <input type="date" className="form-control" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} required />
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
