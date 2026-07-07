import { Link } from 'react-router-dom';
import { getStarsHtml } from '../../utils/validaciones';

export default function HotelCard({ hotel }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card shadow-sm h-100 border-0">
        <img
          src={hotel.imagen_url || '/principal.avif'}
          className="card-img-top"
          alt={hotel.nombre}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/principal.avif'; }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold">{hotel.nombre}</h5>
          <p className="text-warning mb-1" dangerouslySetInnerHTML={{ __html: getStarsHtml(hotel.estrellas) }}></p>
          <p className="text-muted small mb-1">📍 {hotel.direccion || hotel.ciudad || 'Quito'}</p>
          <p className="text-muted small flex-grow-1">{(hotel.descripcion || '').substring(0, 120)}...</p>
          <Link to={`/hoteles/${hotel.id}`} className="btn btn-primary w-100 mt-2">Ver Detalles</Link>
        </div>
      </div>
    </div>
  );
}
