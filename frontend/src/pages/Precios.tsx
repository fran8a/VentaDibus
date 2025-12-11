import './Precios.css';

const Precios = () => {
  return (
    <div className="precios">
      <header className="page-header">
        <h1 className="page-title">Retratos de animales a lápiz</h1>
      </header>

      <div className="pricing-table-container">
        <table className="pricing-table">
          <thead>
            <tr>
              <th className="col-medidas">MEDIDAS</th>
              <th className="col-estilo">ESTILO</th>
              <th className="col-precio">SIN CUADRO</th>
              <th className="col-precio">CON CUADRO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="medida" rowSpan={2}>15 x 21</td>
              <td className="estilo">Blanco y negro</td>
              <td className="precio">$37.000</td>
              <td className="precio">$43.000</td>
            </tr>
            <tr>
              <td className="estilo">Color</td>
              <td className="precio">$47.000</td>
              <td className="precio">$53.000</td>
            </tr>
            
            <tr>
              <td className="medida" rowSpan={2}>20 x 30</td>
              <td className="estilo">Blanco y negro</td>
              <td className="precio">$51.000</td>
              <td className="precio">$61.000</td>
            </tr>
            <tr>
              <td className="estilo">Color</td>
              <td className="precio">$67.000</td>
              <td className="precio">$77.000</td>
            </tr>
            
            <tr>
              <td className="medida" rowSpan={2}>30 x 40</td>
              <td className="estilo">Blanco y negro</td>
              <td className="precio">$75.000</td>
              <td className="precio">$90.000</td>
            </tr>
            <tr>
              <td className="estilo">Color</td>
              <td className="precio">$98.000</td>
              <td className="precio">$113.000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="additional-info">
        <div className="info-card">
          <div className="info-icon">✏️</div>
          <h3 className="info-title">INFORMACIÓN ADMINISTRATIVA</h3>
          <p className="info-text">
            En el caso de querer algún tamaño en específico, no dudes en consultarme!<br />
            <strong>Si querés adicionar una mascota en el mismo retrato, se le suma un 50% del estilo que elijas!</strong>
          </p>
        </div>
        
        <div className="info-card">
          <div className="info-icon">💳</div>
          <h3 className="info-title">FORMAS DE PAGO</h3>
          <p className="info-text">
            Efectivo o transferencia. Seña del 50% - saldo al terminar el pedido.
          </p>
        </div>

        <div className="info-card">
          <div className="info-icon">📦</div>
          <h3 className="info-title">ENVÍOS</h3>
          <p className="info-text">
            Retiros sin costo, Nueva Córdoba.<br />
            Envíos a todo el país, pago a cargo del cliente / monto adicional por embalaje y gestión del envío.
          </p>
        </div>

        <div className="info-card contact-info">
          <h3 className="contact-name">Sabrina Ochoa Rodriguez</h3>
          <p className="contact-detail">
            <a href="https://www.instagram.com/sabdibus_/" target="_blank" rel="noopener noreferrer">
              @sabdibus
            </a>
          </p>
          <p className="contact-detail">
            <a href="mailto:sabri.ochoa18@gmail.com">sabri.ochoa18@gmail.com</a>
          </p>
          <p className="contact-detail">Córdoba, Argentina</p>
        </div>
      </div>
    </div>
  );
};

export default Precios;
