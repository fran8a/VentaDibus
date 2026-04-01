import './ComoAdquirir.css';

const ComoAdquirir = () => {
  const pasos = [
    {
      numero: '01',
      titulo: 'Elegí el Tamaño',
      descripcion: '¡Tenés varias opciones!',
      icon: '📏',
      detalles: ['Pequeño: 15x21cm', 'Mediano: 20x30cm', 'Grande: 30x40cm', '¡Personalizado a tu gusto!']
    },
    {
      numero: '02',
      titulo: 'Mandame las Fotos',
      descripcion: 'Compartí conmigo las fotos que más te gusten de tu mascota y juntos elegimos la mejor para el retrato',
      icon: '📸',
      detalles: []
    },
    {
      numero: '03',
      titulo: 'Confirmamos Todo',
      descripcion: 'Reviso tu foto, hablamos de los detalles que querés y arrancamos con tu pedido',
      icon: '✓',
      detalles: []
    },
    {
      numero: '04',
      titulo: 'Manos a la Obra',
      descripcion: 'Acá es donde la magia pasa. Tu retrato se crea con mucho amor en aproximadamente 5-7 días',
      icon: '🎨',
      detalles: []
    },
    {
      numero: '05',
      titulo: '¡Ya está Listo!',
      descripcion: 'Tu obra está terminada. Podés retirarlo en Córdoba Capital o Santa Rosa de Calamuchita, o arreglamos un envío',
      icon: '📦',
      detalles: []
    }
  ];

  const tipsCalidad = [
    {
      icon: '💡',
      titulo: 'Buena Luz',
      descripcion: 'La luz natural es tu mejor amiga. Evitá las sombras muy marcadas en la carita'
    },
    {
      icon: '👁️',
      titulo: 'Cara Completa',
      descripcion: 'Que se vea toda la cara, de frente o de costado. Nada de que le tape algo'
    },
    {
      icon: '✨',
      titulo: 'Calidad Alta',
      descripcion: 'Foto nítida, bien enfocada y sin filtros. ¡La original es perfecta!'
    },
    {
      icon: '📷',
      titulo: 'De Cerca',
      descripcion: 'Tu mascota bien cerquita de la cámara para que pueda capturar cada detalle'
    }
  ];

  return (
    <div className="como-adquirir">
      <header className="page-header">
        <h1 className="page-title">Cómo Encargar tu Dibujo</h1>
        <p className="page-description">
          Es súper simple crear el retrato perfecto de tu mascota
        </p>
      </header>

      <div className="steps-container">
        {pasos.map((paso, index) => (
          <div key={index} className="step-card">
            <div className="step-number">{paso.numero}</div>
            <div className="step-icon">{paso.icon}</div>
            <h3 className="step-title">{paso.titulo}</h3>
            <p className="step-description">{paso.descripcion}</p>
            {paso.detalles.length > 0 && (
              <ul className="step-details">
                {paso.detalles.map((detalle, idx) => (
                  <li key={idx}>{detalle}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="tips-section">
        <h2 className="section-title">Tips para la Mejor Foto</h2>
        <p className="section-subtitle">
          Para que tu retrato quede espectacular, necesito fotos de buena calidad. Acá te dejo algunos consejos:
        </p>
        
        <div className="tips-grid">
          {tipsCalidad.map((tip, index) => (
            <div key={index} className="tip-card">
              <span className="tip-icon">{tip.icon}</span>
              <h4 className="tip-title">{tip.titulo}</h4>
              <p className="tip-description">{tip.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="examples-section">
          <h3 className="examples-title">Ejemplos de Buenas Referencias</h3>
          <div className="examples-grid">
            <div className="example-card">
              <img 
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80" 
                alt="Ejemplo 1"
                className="example-image"
              />
              <div className="example-badge good">✓ Excelente</div>
            </div>
            <div className="example-card">
              <img 
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" 
                alt="Ejemplo 2"
                className="example-image"
              />
              <div className="example-badge good">✓ Perfecta</div>
            </div>
            <div className="example-card">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80" 
                alt="Ejemplo 3"
                className="example-image"
              />
              <div className="example-badge good">✓ Ideal</div>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <div className="contact-card">
          <h2 className="contact-title">¿Arrancamos?</h2>
          <p className="contact-text">
            Escribime y creemos algo único juntos
          </p>
          <a 
            href="https://wa.me/5492966563805?text=Hola%20Sabrii%2C%20quiero%20un%20dibujo%20de%20mi%20mascota%20%3C3%21" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-button"
          >
            Contactar Ahora
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComoAdquirir;
