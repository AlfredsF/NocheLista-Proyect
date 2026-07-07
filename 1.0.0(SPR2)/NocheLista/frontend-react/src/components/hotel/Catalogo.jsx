import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import HotelCard from './HotelCard';
import { buscarHoteles } from '../../services/hotelService';
import useAuth from '../../hooks/useAuth';

export default function Catalogo() {
  const { user } = useAuth();
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    nombre: '',
    ciudad: '',
    estrellas: '',
    precio_max: '',
  });

  const cargarHoteles = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await buscarHoteles(params);
      setHoteles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHoteles();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    cargarHoteles({
      nombre: filtros.nombre.trim(),
      ciudad: filtros.ciudad.trim(),
      estrellas: filtros.estrellas,
      precio_max: filtros.precio_max,
    });
  };

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Todos los Hoteles</h1>

        <div className="filtros mb-4">
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">Buscar</label>
              <input type="text" className="form-control" name="nombre" value={filtros.nombre} onChange={handleChange} placeholder="Nombre del hotel..." />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Ciudad</label>
              <input type="text" className="form-control" name="ciudad" value={filtros.ciudad} onChange={handleChange} placeholder="Quito" />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Estrellas</label>
              <select className="form-select" name="estrellas" value={filtros.estrellas} onChange={handleChange}>
                <option value="">Todas</option>
                <option value="3">3 ★</option>
                <option value="4">4 ★</option>
                <option value="5">5 ★</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Precio máx.</label>
              <input type="number" className="form-control" name="precio_max" value={filtros.precio_max} onChange={handleChange} placeholder="500" min="1" />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100"><i className="fas fa-search me-1"></i>Buscar</button>
            </div>
          </form>
        </div>

        <div id="hotelesContainer" className="row g-4">
          {loading ? (
            <div className="col-12"><p className="text-muted text-center py-5">Cargando hoteles...</p></div>
          ) : error ? (
            <div className="col-12"><p className="text-danger text-center">Error: {error}</p></div>
          ) : hoteles.length === 0 ? (
            <div className="col-12"><p className="text-muted text-center py-5">No se encontraron hoteles.</p></div>
          ) : (
            hoteles.map((h) => <HotelCard key={h.id} hotel={h} />)
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
