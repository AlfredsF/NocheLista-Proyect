import { Link } from 'react-router-dom';
import { getStarsHtml } from '../../utils/validaciones';
import { getHotelDataByApiData } from '../../data/hotelesData';

export default function HotelCard({ hotel }) {
  const localData = getHotelDataByApiData(hotel);
  const imgSrc = localData?.imagen_url || hotel.imagen_url || '/principal.avif';
  const nombre = hotel.nombre || localData?.nombre || 'Hotel';
  const estrellas = hotel.estrellas || localData?.estrellas || 0;
  const ciudad = hotel.ciudad || localData?.ciudad || 'Quito';
  const descripcion = hotel.descripcion || localData?.descripcion || '';
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card shadow-sm h-100 border-0">
        <img
          src={imgSrc}
          className="card-img-top"
          alt={nombre}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/principal.avif'; }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold">{nombre}</h5>
          <p className="text-warning mb-1" dangerouslySetInnerHTML={{ __html: getStarsHtml(estrellas) }}></p>
          <p className="text-muted small mb-1">📍 {hotel.direccion || ciudad}</p>
          <p className="text-muted small flex-grow-1">{descripcion.substring(0, 120)}...</p>
          <Link to={`/hoteles/${hotel.id}`} className="btn btn-primary w-100 mt-2">Ver Detalles</Link>
        </div>
      </div>
    </div>
  );
}
