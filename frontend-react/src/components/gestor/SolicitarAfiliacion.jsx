import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function SolicitarAfiliacion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [enviando, setEnviando] = useState(false);
  const [hotelExiste, setHotelExiste] = useState(false);
  const [formData, setFormData] = useState({
    nombre_hotel: '',
    descripcion: '',
    direccion: '',
    ciudad: 'Quito',
  });

  useEffect(() => {
    const verificarEstado = async () => {
      try {
        const hotel = await api.get('/gestor/hotel/').then(r => r.data);
        if (hotel && hotel.id) {
          setHotelExiste(true);
        }
      } catch (e) {
        setHotelExiste(false);
      }
      setLoading(false);
    };
    verificarEstado();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_hotel.trim() || !formData.descripcion.trim() || !formData.direccion.trim()) {
      setMensaje({ text: 'Todos los campos son obligatorios', color: 'red' });
      return;
    }
    setEnviando(true);
    setMensaje({ text: '', color: '' });
    try {
      await api.post('/solicitudes/crear/', {
        nombre_hotel: formData.nombre_hotel.trim(),
        descripcion: formData.descripcion.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
      });
      setMensaje({ text: 'Solicitud enviada correctamente. Espera la aprobación del admin.', color: 'green' });
      setFormData({ nombre_hotel: '', descripcion: '', direccion: '', ciudad: 'Quito' });
    } catch (err) {
      setMensaje({ text: 'Error: ' + (err.response?.data?.error || err.message), color: 'red' });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container my-5">
          <p className="text-muted text-center py-5">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (hotelExiste) {
    return (
      <>
        <Header />
        <main className="container my-5">
          <h1 className="fw-bold mb-4">Solicitar Afiliación</h1>
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            Ya tienes un hotel registrado. Puedes gestionarlo desde{' '}
            <a href="/gestor/mi-hotel">Gestión de Hotel</a>.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Solicitar Afiliación</h1>
        <p className="text-muted mb-4">Completa el formulario para solicitar la afiliación de tu hotel. El admin revisará tu solicitud.</p>
        {mensaje.text && (
          <div className={`alert ${mensaje.color === 'green' ? 'alert-success' : 'alert-danger'}`}>
            {mensaje.text}
          </div>
        )}
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nombre del Hotel</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre_hotel"
                  value={formData.nombre_hotel}
                  onChange={handleChange}
                  placeholder="Ej: Hotel Sol Naciente"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Descripción</label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe tu hotel, servicios principales, etc."
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Av. Principal 123"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Ciudad</label>
                <input
                  type="text"
                  className="form-control"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Quito"
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/gestor')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
