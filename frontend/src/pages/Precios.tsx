import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../config/admin';
import EditPricingModal from '../components/EditPricingModal';
import { type Pricing, getAllPricing } from '../services';
import './Precios.css';

const Precios = () => {
  const { user, token } = useAuth();
  const [pricingData, setPricingData] = useState<Pricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const data = await getAllPricing();
      setPricingData(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar precios por tamaño
  const groupedPricing = pricingData.reduce((acc, item) => {
    if (!acc[item.size]) {
      acc[item.size] = [];
    }
    acc[item.size].push(item);
    return acc;
  }, {} as Record<string, Pricing[]>);

  const sizes = ['15x21', '20x30', '30x40'];

  return (
    <div className="precios">
      <header className="page-header">
        <h1 className="page-title">Retratos de animales a lápiz</h1>
      </header>

      {isLoading ? (
        <div className="loading">Cargando precios...</div>
      ) : (
        <div className="pricing-table-container">
          {isAdmin && (
            <div className="pricing-admin-bar">
              <button className="btn-edit-prices" onClick={() => setIsEditModalOpen(true)}>
                ✏️ Editar Precios
              </button>
            </div>
          )}
          <div className="pricing-table-scroll">
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
                {sizes.map(size => {
                  const items = groupedPricing[size] || [];
                  return items.map((item, idx) => (
                    <tr key={item.id}>
                      {idx === 0 && (
                        <td className="medida" rowSpan={items.length}>
                          {item.size.replace('x', ' x ')}
                        </td>
                      )}
                      <td className="estilo">{item.style}</td>
                      <td className="precio">
                        {`$${item.price_without_frame.toLocaleString()}`}
                      </td>
                      <td className="precio">
                        {`$${item.price_with_frame.toLocaleString()}`}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          <p className="table-mobile-hint">Desliza horizontalmente para ver toda la tabla en celular.</p>
        </div>
      )}

      {isAdmin && token && (
        <EditPricingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          pricingData={pricingData}
          token={token}
          onUpdated={fetchPricing}
        />
      )}

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
