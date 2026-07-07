import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

export default function GestionHotel() {
  const [formData, setFormData] = useState({
    nombre: '',
    estrellas: '3',
    ciudad: 'Quito',
    direccion: '',
    descripcion: '',
    imagen_principal: '',
  });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [sinHotel, setSinHotel] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/gestor/hotel/').then(r => r.data);
        setFormData({
          nombre: data.nombre || '',
          estrellas: String(data.estrellas || '3'),
          ciudad: data.ciudad || 'Quito',
          direccion: data.direccion || '',
          descripcion: data.descripcion || '',
          imagen_principal: data.imagen_principal || '',
        });
        setSinHotel(false);
      } catch {
        setSinHotel(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ text: 'Guardando...', color: 'gray' });
    try {
      await api.put('/gestor/hotel/', {
        nombre: formData.nombre.trim(),
        estrellas: parseInt(formData.estrellas),
        ciudad: formData.ciudad.trim(),
        direccion: formData.direccion.trim(),
        descripcion: formData.descripcion.trim(),
        imagen_principal: formData.imagen_principal.trim(),
      });
      setMensaje({ text: 'Hotel actualizado correctamente', color: 'green' });
    } catch (err) {
      setMensaje({ text: 'Error: ' + err.message, color: 'red' });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container my-5"><p className="text-center text-muted">Cargando...</p></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Datos de mi Hotel</h1>
        {mensaje.text && <p className="mb-3" style={{ color: mensaje.color }}>{mensaje.text}</p>}
        {sinHotel ? (
          <div className="text-center py-5">
            <p className="text-muted">No tienes un hotel registrado. Si has enviado una solicitud de afiliación, espera a que sea aprobada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre del Hotel</label>
              <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estrellas</label>
              <select className="form-select" name="estrellas" value={formData.estrellas} onChange={handleChange}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Ciudad</label>
              <input type="text" className="form-control" name="ciudad" value={formData.ciudad} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" name="descripcion" rows="4" value={formData.descripcion} onChange={handleChange} required></textarea>
            </div>
            <div className="col-12">
              <label className="form-label">URL Imagen Principal</label>
              <input type="text" className="form-control" name="imagen_principal" value={formData.imagen_principal} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
