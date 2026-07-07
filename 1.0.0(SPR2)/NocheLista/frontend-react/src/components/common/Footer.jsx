export default function Footer() {
  return (
    <footer className="pie-pagina">
      <div className="columna-pie informacion-marca">
        <img src="/logo.jpeg" alt="Logo NocheLista" />
        <p className="nombres">Alfredo Fuel, Merchan, Sanches</p>
        <p className="derechos">2026 Derechos Reservados</p>
      </div>
      <div className="columna-pie">
        <h4>Servicio al Cliente</h4>
        <a href="#contacto">Contáctanos</a>
        <a href="#">Ayuda/FAQ</a>
        <a href="#">Soporte experto</a>
      </div>
      <div className="columna-pie">
        <h4>Legal</h4>
        <a href="#">Términos y Condiciones</a>
        <a href="#">Política de Privacidad</a>
      </div>
      <div className="columna-pie redes-sociales">
        <div className="iconos-redes">
          <a href="https://wa.me/0000000000" target="_blank" rel="noreferrer"><img src="/whatsapp.png" alt="WhatsApp" /></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><img src="/instagram.png" alt="Instagram" /></a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer"><img src="/yotube.png" alt="YouTube" /></a>
          <a href="https://twitter.com/" target="_blank" rel="noreferrer"><img src="/x.png" alt="Twitter" /></a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer"><img src="/facebook.png" alt="Facebook" /></a>
          <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer"><img src="/printerest.png" alt="Pinterest" /></a>
        </div>
      </div>
    </footer>
  );
}
