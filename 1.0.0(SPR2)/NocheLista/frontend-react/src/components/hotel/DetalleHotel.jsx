import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { obtenerDetalle, buscarHoteles } from '../../services/hotelService';
import { crearReserva } from '../../services/reservaService';
import { getStarsHtml, calcularNoches, tipoHabitacionLabels, formatCurrency } from '../../utils/validaciones';
import useAuth from '../../hooks/useAuth';

export default function DetalleHotel() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otrosHoteles, setOtrosHoteles] = useState([]);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', color: '' });
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No se especificó un hotel.');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await obtenerDetalle(id);
        setHotel(data);
        document.title = data.nombre + ' - NocheLista';
        const habs = data.habitaciones || [];
        setHabitaciones(habs);
        if (habs.length > 0) {
          setHabitacionId(habs[0].id);
        }
        const all = await buscarHoteles();
        setOtrosHoteles(all.filter((h) => h.id !== id).slice(0, 4));
      } catch (e) {
        setError('Error al cargar el hotel: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const minDate = () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  };

  const selectedHabitacion = habitaciones.find((h) => h.id === habitacionId);
  const precioPorNoche = selectedHabitacion ? parseFloat(selectedHabitacion.precio_por_noche) : 0;
  const noches = calcularNoches(fechaEntrada, fechaSalida);
  const total = precioPorNoche * noches;

  const handleReservar = async () => {
    if (!isAuthenticated) {
      setMensaje({ text: 'Debes iniciar sesión para reservar', color: 'red' });
      return;
    }
    if (!fechaEntrada || !fechaSalida) {
      setMensaje({ text: 'Selecciona fecha de entrada y salida', color: 'red' });
      return;
    }
    if (!habitacionId) {
      setMensaje({ text: 'Selecciona una habitación', color: 'red' });
      return;
    }
    setReservando(true);
    setMensaje({ text: 'Reservando...', color: 'gray' });
    try {
      await crearReserva({
        habitacion_id: habitacionId,
        hotel_id: id,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
      });
      setMensaje({ text: 'Reserva creada exitosamente!', color: 'green' });
    } catch (err) {
      setMensaje({ text: err.message, color: 'red' });
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container my-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
            <p className="mt-2 text-muted">Cargando información del hotel...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="container my-5">
          <div className="text-center py-5">
            <p className="text-danger">{error}</p>
            <Link to="/hoteles" className="btn btn-primary">Volver a Hoteles</Link>
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
        <div className="row mb-4">
          <div className="col-12 text-center text-md-start">
            <h1 className="fw-bold text-uppercase">{hotel.nombre}</h1>
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: getStarsHtml(hotel.estrellas) + ' <span class="text-muted small">' + (hotel.ciudad || 'Quito') + '</span>' }}></p>
          </div>
        </div>

        <div className="row mb-5 align-items-center">
          <div className="col-md-7 mb-4 mb-md-0">
            <img
              src={hotel.imagen_url || '/principal.avif'}
              className="img-fluid rounded shadow"
              alt={hotel.nombre}
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/principal.avif'; }}
            />
          </div>
          <div className="col-md-5 d-flex flex-column align-items-center">
            <h5 className="mb-4">Elige tu reserva</h5>
            <div className="w-75 mb-3 p-3 bg-light rounded shadow-sm text-center">
              <p className="mb-1 text-muted small">Precio por noche desde</p>
              <p className="fw-bold text-success fs-4 mb-0">{formatCurrency(precioPorNoche)}</p>
            </div>
            <select
              className="form-select mb-3 shadow-sm w-75"
              value={habitacionId}
              onChange={(e) => setHabitacionId(e.target.value)}
            >
              {habitaciones.length === 0 ? (
                <option value="">No hay habitaciones disponibles</option>
              ) : (
                habitaciones.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nombre} ({tipoHabitacionLabels[h.tipo] || h.tipo}) - {formatCurrency(h.precio_por_noche)}/noche
                  </option>
                ))
              )}
            </select>
            <input
              type="date"
              className="form-control mb-3 shadow-sm w-75 p-2"
              style={{ cursor: 'pointer' }}
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              min={minDate()}
            />
            <input
              type="date"
              className="form-control mb-3 shadow-sm w-75 p-2"
              style={{ cursor: 'pointer' }}
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              min={fechaEntrada || minDate()}
            />
            {noches > 0 && (
              <div className="w-75 text-center mb-3 text-muted small">
                Total: {formatCurrency(total)} ({noches} noche{noches > 1 ? 's' : ''})
              </div>
            )}
            <div className="d-flex gap-3 w-100 justify-content-center">
              <button
                className="btn btn-success fw-bold px-4"
                onClick={handleReservar}
                disabled={reservando || habitaciones.length === 0}
              >
                RESERVAR
              </button>
              <a href="https://wa.me/0000000000" target="_blank" rel="noreferrer" className="btn btn-outline-success fw-bold px-3">
                HABLA CON EL GERENTE
              </a>
            </div>
            {mensaje.text && (
              <div className="mt-3 text-center fw-bold" style={{ color: mensaje.color }}>{mensaje.text}</div>
            )}
          </div>
        </div>

        <div className="row mb-4 mt-5">
          <div className="col-12 text-center">
            <h3 className="fw-normal" style={{ borderBottom: '1px solid #333', display: 'inline-block', paddingBottom: '5px' }}>Descripción</h3>
          </div>
        </div>
        <div className="row mb-5">
          <div className="col-12">
            <p className="text-muted" style={{ textAlign: 'justify' }}>{hotel.descripcion || ''}</p>
          </div>
        </div>

        <div className="row mb-4 mt-5">
          <div className="col-12 text-center">
            <h3 className="fw-normal" style={{ borderBottom: '1px solid #333', display: 'inline-block', paddingBottom: '5px' }}>Habitaciones Disponibles</h3>
          </div>
        </div>
        <div className="row mb-5">
          {habitaciones.length === 0 ? (
            <p className="text-muted text-center">No hay habitaciones registradas.</p>
          ) : (
            habitaciones.map((h) => (
              <div key={h.id} className="col-md-4 mb-3">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body text-center">
                    <h5 className="fw-bold">{h.nombre}</h5>
                    <span className="badge bg-info mb-2">{tipoHabitacionLabels[h.tipo] || h.tipo}</span>
                    <p className="fw-bold text-success fs-5">{formatCurrency(h.precio_por_noche)} <span className="small fw-normal text-muted">/noche</span></p>
                    <p className="small text-muted">Capacidad: {h.capacidad} personas</p>
                    {h.descripcion && <p className="small text-muted">{h.descripcion}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <h4 className="fw-normal mb-3">Otros Hoteles</h4>
          </div>
          <div className="row g-3">
            {otrosHoteles.map((h) => (
              <div key={h.id} className="col-6 col-md-3">
                <Link to={`/hoteles/${h.id}`} className="text-decoration-none text-dark">
                  <div className="card shadow-sm h-100 text-center border-0 bg-light">
                    <img
                      src={h.imagen_url || '/principal.avif'}
                      className="card-img-top"
                      alt={h.nombre}
                      style={{ height: '100px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/principal.avif'; }}
                    />
                    <div className="card-body p-2">
                      <h6 className="card-title mb-1 fw-bold">{h.nombre}</h6>
                      <small className="text-warning d-block" dangerouslySetInnerHTML={{ __html: getStarsHtml(h.estrellas) }}></small>
                      <small className="text-muted">📍 {h.ciudad || 'Quito'}</small>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
