import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Inicio() {
  return (
    <>
      <Header />
      <section className="seccion-principal">
        <div className="position-relative d-flex align-items-center justify-content-center text-center" style={{ height: '450px', borderRadius: '20px', overflow: 'hidden', margin: '20px auto', width: '90%', maxWidth: '1200px' }}>
          <img src="/principal.avif" className="position-absolute w-100 h-100" style={{ objectFit: 'cover', zIndex: 0 }} alt="Fondo NocheLista" />
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50" style={{ zIndex: 1 }}></div>
          <div className="position-relative px-4" style={{ zIndex: 2, maxWidth: '800px' }}>
            <h1 className="text-white fw-bold mb-3 display-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Tu próximo destino empieza aquí</h1>
            <p className="text-white fs-5 mb-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>Descubre alojamientos exclusivos, experiencias únicas y los mejores precios para tu viaje. Sin complicaciones, solo disfruta.</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/hoteles" className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg fw-bold">Explorar Hoteles</Link>
              <a href="#contacto" className="btn btn-outline-light btn-lg px-5 rounded-pill shadow-lg fw-bold">Asesoría Personal</a>
            </div>
          </div>
        </div>
      </section>

      <section className="hoteles-destacados">
        <h2>Hoteles Destacados</h2>
        <div className="contenedor-tarjetas">
          <div className="tarjeta-hotel">
            <Link to="/hoteles/plazaG" className="text-decoration-none text-dark">
              <img src="/hotel_plazaG.avif" alt="Hotel Plaza Grande" className="imagen-hotel" />
              <div className="contenido-tarjeta">
                <h3>Hotel Plaza Grande</h3>
                <p className="estrellas">{'★★★★'.split('').join('')}</p>
                <p className="duracion">2 días, 1 noche</p>
                <div className="ubicacion">
                  <img src="/ubi.jpg" alt="Ubicación" className="icono-pequeno" />
                  <span>Quito Centro, Ecuador</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="tarjeta-hotel">
            <Link to="/hoteles/gangotena" className="text-decoration-none text-dark">
              <img src="/hotel_gangotena.webp" alt="Hotel Casa Gangotena" className="imagen-hotel" />
              <div className="contenido-tarjeta">
                <h3>Hotel Casa Gangotena</h3>
                <p className="estrellas">{'★★★★★'.split('').join('')}</p>
                <p className="duracion">3 días, 2 noches</p>
                <div className="ubicacion">
                  <img src="/ubi.jpg" alt="Ubicación" className="icono-pequeno" />
                  <span>Quito Centro, Ecuador</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="tarjeta-hotel">
            <Link to="/hoteles/patioA" className="text-decoration-none text-dark">
              <img src="/hotel_patioA.webp" alt="Hotel Patio Andaluz" className="imagen-hotel" />
              <div className="contenido-tarjeta">
                <h3>Hotel Patio Andaluz</h3>
                <p className="estrellas">{'★★★'.split('').join('')}</p>
                <p className="duracion">4 días, 3 noches</p>
                <div className="ubicacion">
                  <img src="/ubi.jpg" alt="Ubicación" className="icono-pequeno" />
                  <span>Quito Centro, Ecuador</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="beneficios">
        <h2>¿Porque reservar con Nosotros?</h2>
        <div className="contenedor-beneficios">
          <div className="item-beneficio">
            <img src="/garantia.png" alt="Garantía" className="icono-beneficio" />
            <p>Garantía del Mejor Precio, es claramente promociones que convienen a estancias primarias alternativas.</p>
          </div>
          <div className="item-beneficio">
            <img src="/flexi.png" alt="Flexibilidad" className="icono-beneficio" />
            <p>Cancelación Flexible en miles de propiedades con contratos que promueven personas internacionales.</p>
          </div>
          <div className="item-beneficio">
            <img src="/soporte.png" alt="Soporte" className="icono-beneficio" />
            <p>Escoge con asesoría personalizada en un sistema sencillo y con soporte 24/7 en tu idioma.</p>
          </div>
        </div>
      </section>

      <section className="seccion-nosotros">
        <div className="informacion-nosotros">
          <h2>Nosotros</h2>
          <p>NocheLista es un sistema de reservas diseñado para simplificar tu experiencia de viaje. Nuestro compromiso es ofrecerte acceso rápido y seguro a una amplia variedad de alojamientos, asegurando los mejores estándares de calidad. Trabajamos continuamente para brindar una plataforma intuitiva y soporte constante para que tu única preocupación sea disfrutar de tu estadía.</p>
        </div>
        <div className="nosotros-mapa">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.76020584289!2d-78.58331392683838!3d-0.18606411516086884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a4002422c9f%3A0x44b991e158ef5572!2sQuito!5e0!3m2!1ses!2sec!4v1714000000000!5m2!1ses!2sec" width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa Quito"></iframe>
        </div>
      </section>

      <section id="app" className="container my-5 py-5 border-top">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
            <h2 className="fw-bold">Lleva NocheLista en tu bolsillo</h2>
            <p className="lead text-muted">Descarga nuestra aplicación móvil para gestionar tus reservas en cualquier lugar. Disponible para iOS y Android.</p>
            <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-4">
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="btn btn-dark btn-lg">App Store</a>
              <a href="https://play.google.com/store/apps" target="_blank" rel="noreferrer" className="btn btn-success btn-lg">Google Play</a>
            </div>
          </div>
          <div className="col-md-6 text-center">
            <div className="mx-auto overflow-hidden shadow-lg" style={{ maxWidth: '250px', borderRadius: '30px', border: '12px solid #222', backgroundColor: '#fff' }}>
              <img src="/movil.png" className="img-fluid w-100" alt="App móvil" />
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="container my-5 py-5 border-top">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center mb-4">
            <h2 className="fw-bold">Contáctanos</h2>
            <p className="text-muted">¿Tienes alguna duda con tu reserva? Escríbenos y te responderemos lo antes posible.</p>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <form onSubmit={(e) => { e.preventDefault(); const btn = e.target.querySelector('button'); btn.disabled = true; const msg = document.getElementById('contactoMensaje'); msg.innerHTML = '<span style=\"color:gray\">Enviando...</span>'; setTimeout(() => { msg.innerHTML = '<span style=\"color:green\">Mensaje recibido. Te responderemos pronto.</span>'; e.target.reset(); btn.disabled = false; }, 1000); }}>
              <div id="contactoMensaje"></div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre completo</label>
                  <input type="text" className="form-control" id="nombre" placeholder="Ej. Juan Pérez" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <input type="email" className="form-control" id="email" placeholder="tu@correo.com" required />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="mensaje" className="form-label">Mensaje</label>
                <textarea className="form-control" id="mensaje" rows="4" placeholder="Escribe tu consulta aquí..." required></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-primary px-5 py-2">Enviar Mensaje</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
