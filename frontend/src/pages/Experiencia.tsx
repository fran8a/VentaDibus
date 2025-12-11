import './Experiencia.css';

const Experiencia = () => {
  const testimonios = [
    {
      nombre: 'María González',
      mascota: 'Luna (Gata)',
      testimonio: 'El retrato de Luna superó todas mis expectativas. Capturaste perfectamente su personalidad y esos ojitos traviesos. ¡Ahora decora mi sala!',
      imagen: 'https://i.pravatar.cc/150?img=1',
      estrellas: 5
    },
    {
      nombre: 'Carlos Ruiz',
      mascota: 'Max (Perro)',
      testimonio: 'Increíble atención al detalle. El proceso fue muy profesional y el resultado final es una obra de arte. Lo recomiendo 100%.',
      imagen: 'https://i.pravatar.cc/150?img=12',
      estrellas: 5
    },
    {
      nombre: 'Ana Martínez',
      mascota: 'Coco (Conejo)',
      testimonio: 'Quedé enamorada del dibujo. Es el regalo perfecto para recordar a mi pequeño Coco. El estilo acuarela es hermoso.',
      imagen: 'https://i.pravatar.cc/150?img=5',
      estrellas: 5
    },
    {
      nombre: 'Pedro López',
      mascota: 'Simba (Gato)',
      testimonio: 'Excelente trabajo y muy rápido. La comunicación fue fluida y el resultado simplemente perfecto. Volveré a encargar más.',
      imagen: 'https://i.pravatar.cc/150?img=13',
      estrellas: 5
    }
  ];

  const estadisticas = [
    { numero: '500+', label: 'Dibujos Creados' },
    { numero: '98%', label: 'Clientes Satisfechos' },
    { numero: '5', label: 'Años de Experiencia' },
    { numero: '20+', label: 'Países Alcanzados' }
  ];

  return (
    <div className="experiencia">
      <header className="page-header">
        <h1 className="page-title">Experiencia</h1>
        <p className="page-subtitle">
          Lo que dicen nuestros clientes sobre su experiencia
        </p>
      </header>

      <div className="stats-container">
        {estadisticas.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-numero">{stat.numero}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="testimonios-container">
        {testimonios.map((testimonio, index) => (
          <div key={index} className="testimonio-card">
            <div className="testimonio-header">
              <img 
                src={testimonio.imagen} 
                alt={testimonio.nombre}
                className="testimonio-avatar"
              />
              <div className="testimonio-info">
                <h4 className="testimonio-nombre">{testimonio.nombre}</h4>
                <p className="testimonio-mascota">{testimonio.mascota}</p>
              </div>
            </div>
            
            <div className="estrellas">
              {[...Array(testimonio.estrellas)].map((_, i) => (
                <span key={i} className="estrella">★</span>
              ))}
            </div>
            
            <p className="testimonio-texto">"{testimonio.testimonio}"</p>
          </div>
        ))}
      </div>

      <div className="gallery-preview">
        <h2 className="gallery-title">Momentos que Cobran Vida</h2>
        <div className="gallery-grid">
          <div className="gallery-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400)'}}>
            <div className="gallery-overlay">Antes & Después</div>
          </div>
          <div className="gallery-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400)'}}>
            <div className="gallery-overlay">Proceso Creativo</div>
          </div>
          <div className="gallery-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400)'}}>
            <div className="gallery-overlay">Detalles Únicos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiencia;
