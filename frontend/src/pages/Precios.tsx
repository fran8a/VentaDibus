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
  const [selectedSize, setSelectedSize] = useState('15x21');
  const [selectedStyle, setSelectedStyle] = useState('Blanco y negro');
  const [withFrame, setWithFrame] = useState(false);
  const [hasAdditionalPet, setHasAdditionalPet] = useState(false);
  const [hasPetNameDesign, setHasPetNameDesign] = useState(false);

  const isAdmin = isAdminEmail(user?.email);
  const isPricePending = !isAdmin && isLoading;

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
  const sizeLabels: Record<string, string> = {
    '15x21': 'Pequeño 15 x 21',
    '20x30': 'Mediano 20 x 30',
    '30x40': 'Grande 30 x 40',
  };
  const styles = ['Blanco y negro', 'Color'];

  const selectedPricing = pricingData.find(
    (item) => item.size === selectedSize && item.style.toLowerCase() === selectedStyle.toLowerCase()
  );
  const basePriceWithoutFrame = selectedPricing?.price_without_frame ?? null;
  const basePrice = selectedPricing
    ? withFrame
      ? selectedPricing.price_with_frame
      : selectedPricing.price_without_frame
    : null;
  const additionalPetExtra =
    basePriceWithoutFrame !== null && hasAdditionalPet ? Math.round(basePriceWithoutFrame * 0.3) : 0;
  const petNameDesignExtra =
    basePriceWithoutFrame !== null && hasPetNameDesign ? Math.round(basePriceWithoutFrame * 0.1) : 0;
  const estimatedPrice = basePrice !== null ? basePrice + additionalPetExtra + petNameDesignExtra : null;

  const handleOrderCTA = () => {
    const selectedExtras: string[] = [];

    if (hasAdditionalPet) {
      selectedExtras.push('mascota adicional (+30%)');
    }

    if (hasPetNameDesign) {
      selectedExtras.push('diseno y nombre (+10%)');
    }

    const extrasText = selectedExtras.length > 0 ? `, extras: ${selectedExtras.join(', ')}` : ', sin extras';
    const totalText = estimatedPrice !== null ? ` Total estimado: $${estimatedPrice.toLocaleString()}.` : '';

    const message = encodeURIComponent(
      `Hola Sabri, quiero encargar este retrato: ${sizeLabels[selectedSize]}, ${selectedStyle}${
        withFrame ? ', con cuadro' : ', sin cuadro'
      }${extrasText}.${totalText}`
    );
    window.open(`https://wa.me/5492966563805?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="precios">
      <header className="page-header">
        <h1 className="page-title">Retratos de animales a lápiz</h1>
      </header>

      {isAdmin ? (
        isLoading ? (
          <div className="loading">Cargando precios...</div>
        ) : (
            <div className="pricing-table-container">
              <div className="pricing-admin-bar">
                <button className="btn-edit-prices" onClick={() => setIsEditModalOpen(true)}>
                  ✏️ Editar Precios
                </button>
              </div>
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
          )
      ) : (
        <section className="pricing-simulator-container" aria-label="Simulador de precio de retratos">
          <p className="simulator-kicker">Precio estimado</p>
          <h2 className="simulator-title">Simula tu retrato ideal</h2>
          <p className="simulator-subtitle">
            Elegi tamano, estilo, cuadro y extras para ver el valor actualizado al instante.
          </p>

          <div className="simulator-price-box" aria-live="polite" aria-busy={isPricePending}>
            <span className="simulator-price-label">Tu retrato</span>
            <strong className="simulator-price-value">
              {isPricePending ? (
                <span className="simulator-price-dots" aria-hidden="true">
                  <span className="simulator-price-dot" />
                  <span className="simulator-price-dot" />
                  <span className="simulator-price-dot" />
                </span>
              ) : (
                estimatedPrice !== null ? (
                  `$${estimatedPrice.toLocaleString()}`
                ) : (
                  <span className="simulator-price-unavailable">No disponible</span>
                )
              )}
            </strong>
          </div>

          <div className="simulator-field">
            <h3 className="simulator-field-title">1. Tamano</h3>
            <div className="simulator-size-grid">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`simulator-option-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {sizeLabels[size]}
                </button>
              ))}
            </div>
            <p className="simulator-size-note">Si queres otro tamano en especifico, escribime y lo cotizamos.</p>
          </div>

          <div className="simulator-field">
            <h3 className="simulator-field-title">2. Estilo</h3>
            <div className="simulator-style-grid">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`simulator-option-btn ${selectedStyle === style ? 'selected' : ''}`}
                  onClick={() => setSelectedStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="simulator-frame-row">
            <div>
              <p className="simulator-frame-title">3. Con cuadro</p>
              <p className="simulator-frame-subtitle">Activalo si queres recibirlo listo para colgar.</p>
            </div>
            <label className="frame-switch" htmlFor="frame-toggle">
              <input
                id="frame-toggle"
                type="checkbox"
                checked={withFrame}
                onChange={(event) => setWithFrame(event.target.checked)}
              />
              <span className="frame-switch-slider" />
            </label>
          </div>

          <div className="simulator-field">
            <h3 className="simulator-field-title">4. Extras</h3>
            <div className="simulator-extras-grid">
              <button
                type="button"
                className={`simulator-extra-btn ${hasAdditionalPet ? 'selected' : ''}`}
                onClick={() => setHasAdditionalPet((prev) => !prev)}
                aria-pressed={hasAdditionalPet}
              >
                <span className="simulator-extra-title">Mascota adicional</span>
                <span className="simulator-extra-description">+30% sobre el precio sin cuadro del estilo elegido.</span>
              </button>
              <button
                type="button"
                className={`simulator-extra-btn ${hasPetNameDesign ? 'selected' : ''}`}
                onClick={() => setHasPetNameDesign((prev) => !prev)}
                aria-pressed={hasPetNameDesign}
              >
                <span className="simulator-extra-title">Diseno y nombre de la mascota</span>
                <span className="simulator-extra-description">+10% sobre el precio sin cuadro del tamano elegido.</span>
              </button>
            </div>
          </div>

          <button type="button" className="simulator-cta" onClick={handleOrderCTA}>
            Quiero encargar este retrato
          </button>
        </section>
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
            <strong>Extras disponibles:</strong><br />
            Mascota adicional en el mismo retrato: +30% del estilo elegido (sin cuadro).<br />
            Diseño y agregado del nombre de la mascota: +10% del tamaño/estilo elegido (sin cuadro).
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
          <div className="info-icon">👤</div>
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
