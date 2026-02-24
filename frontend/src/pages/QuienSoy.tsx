import './QuienSoy.css';

const QuienSoy = () => {
  return (
    <div className="quien-soy">
      <header className="page-header">
        <h1 className="page-title">Quién Soy</h1>
        <p className="page-subtitle">
          La historia detrás de cada trazo
        </p>
      </header>

      <div className="about-container">
        <div className="profile-section">
          <div className="profile-image-wrapper">
            <img 
              src="/quienSoySabri.jpg" 
              alt="Artista"
              className="profile-image"
            />
            <div className="profile-decoration"></div>
          </div>
          
          <div className="profile-content">
            <h2 className="profile-name">Sabrina Ochoa</h2> 
            <p className="profile-title">Ilustradora Digital de Mascotas</p>
            
            <div className="profile-text">
              <p>
                Hola, soy Sabrina, arquitecta egresada de la Universidad Nacional de Córdoba 
                que encontró su verdadera pasión en el dibujo y la ilustración de mascotas. 
                Desde pequeña, he sentido una conexión especial con los animales y el arte, 
                y decidí convertir este amor en mi profesión.
              </p>
              <p>
                Cada retrato que creo es más que un simple dibujo; es un recuerdo eterno que 
                captura la esencia única y la personalidad de tu compañero peludo. Utilizo mis 
                habilidades en representación gráfica, visualización digital y herramientas de 
                inteligencia artificial para desarrollar al máximo cada ilustración, cuidando 
                cada detalle del proceso creativo.
              </p>
              <p>
                Me apasiona combinar técnica, estética y emoción en cada proyecto. Trabajo con 
                dedicación y amor, desde el boceto inicial hasta el resultado final, asegurándome 
                de que cada obra transmita todo el cariño que sientes por tu mascota. Siempre 
                con ganas de seguir aprendiendo y perfeccionando mi arte.
              </p>
            </div>
            
            <div className="social-links">
              <h3 className="social-title">Sígueme en mis Redes</h3>
              <div className="social-buttons">
                <a 
                  href="https://www.instagram.com/sabdibus_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-button instagram"
                >
                  <img src="/instagram.png" alt="Instagram" className="social-icon-img" />
                  <div className="social-info">
                    <span className="social-name">Instagram</span>
                    <span className="social-handle">@sabdibus_</span>
                  </div>
                </a>
                <a 
                  href="https://www.tiktok.com/@sabrinaochoa6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-button tiktok"
                >
                  <img src="/tikTok.png" alt="TikTok" className="social-icon-img" />
                  <div className="social-info">
                    <span className="social-name">TikTok</span>
                    <span className="social-handle">@sabrinaochoa6</span>
                  </div>
                </a>
                <a 
                  href="https://www.linkedin.com/in/sabrina-ochoa-303b6b302/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                >
                  <img src="/linkedin.png" alt="LinkedIn" className="social-icon-img" />
                  <div className="social-info">
                    <span className="social-name">LinkedIn</span>
                    <span className="social-handle">Sabrina Ochoa</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="skills-section">
          <h3 className="section-title">Mis Especialidades</h3>
          <div className="skills-grid">
            <div className="skill-card">
              <span className="skill-icon">🏛️</span>
              <h4 className="skill-name">Modelado BIM</h4>
              <p className="skill-description">Desarrollo de proyectos en Revit y documentación técnica</p>
            </div>
            <div className="skill-card">
              <span className="skill-icon">📸</span>
              <h4 className="skill-name">Renderizado 3D</h4>
              <p className="skill-description">Visualización arquitectónica fotorrealista</p>
            </div>
            <div className="skill-card">
              <span className="skill-icon">🎨</span>
              <h4 className="skill-name">Ilustración Digital</h4>
              <p className="skill-description">Retratos personalizados de mascotas</p>
            </div>
            
          </div>
        </div>

        <div className="journey-section">
          <h3 className="section-title">Mi Experiencia</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4 className="timeline-year">Actualidad</h4>
                <h5 className="timeline-role">Architectural Assistant - Studio Wood</h5>
                <p className="timeline-text">
                  Desarrollo de anteproyecto de vivienda unifamiliar, modelado 3D, 
                  renderizado y documentación municipal.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4 className="timeline-year">2024 - Actualidad</h4>
                <h5 className="timeline-role">Dibujante de Arquitectura - Arquitecto Independiente</h5>
                <p className="timeline-text">
                  Transcripción y relevamiento de planos municipales para proyectos de 
                  complejos de cabañas, viviendas unifamiliares y ampliaciones. Trabajo remoto 
                  desde Santa Rosa de Calamuchita, Córdoba.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4 className="timeline-year">2025</h4>
                <h5 className="timeline-role">Freelance - Estudio Rosatti Arquitectos</h5>
                <p className="timeline-text">
                  Desarrollo de anteproyecto de vivienda unifamiliar, modelado 3D, 
                  renderizado y documentación municipal.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4 className="timeline-year">2024</h4>
                <h5 className="timeline-role">Modelador BIM - Studio FP</h5>
                <p className="timeline-text">
                  Diseño y desarrollo de viviendas, modelado de muebles a medida utilizando 
                  Revit, SketchUp, AutoCAD, Adobe Illustrator y Excel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-cta">
          <h3 className="cta-title">¿Trabajemos Juntos?</h3>
          <p className="cta-text">
            Estoy emocionada por conocer a tu mascota y crear algo especial juntos
          </p>
          <button className="cta-button">Comenzar un Proyecto</button>
        </div>
      </div>
    </div>
  );
};

export default QuienSoy;
