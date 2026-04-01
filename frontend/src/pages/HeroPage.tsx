import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type Drawing, getAllDrawings, resolveMediaUrl } from '../services';
import './HeroPage.css';

const HeroPage = () => {
  const [galleryPreview, setGalleryPreview] = useState<Drawing[] | null>(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const drawings = await getAllDrawings();
        const firstThree = drawings.slice(0, 3);
        setGalleryPreview(firstThree.length > 0 ? firstThree : null);
      } catch (error) {
        console.error('Error loading hero gallery preview:', error);
        setGalleryPreview(null);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    // Esta unica llamada cumple warm-up del backend y preview de Home.
    void loadHeroData();
  }, []);

  const featuredImage = '/retratoDestacado.jpg';

  return (
    <div className="hero-page">
      <section className="hero-main">
        <div className="hero-copy">
          <p className="hero-kicker">Retratos artesanales para quienes aman a sus mascotas</p>
          <h1 className="hero-title">Sab Dibus</h1>
          <p className="hero-tagline">
            Retratos de tu mascota a lápiz, con amor y dedicación.
          </p>
          <Link to="/precios" className="hero-cta">
            Encargar mi retrato
          </Link>
        </div>

        <div className="hero-image-wrap" aria-hidden="true">
          <img src={featuredImage} alt="Retrato destacado de mascota" className="hero-image" />
        </div>
      </section>

      <section className="hero-stats" aria-label="Datos de experiencia">
        <article className="hero-stat-card">
          <p className="hero-stat-value">+50</p>
          <p className="hero-stat-label">Dibujos Creados</p>
        </article>
        <article className="hero-stat-card">
          <p className="hero-stat-value">5</p>
          <p className="hero-stat-label">Anos de Experiencia</p>
        </article>
        <article className="hero-stat-card">
          <p className="hero-stat-value">+10</p>
          <p className="hero-stat-label">Provincias Alcanzadas</p>
        </article>
      </section>

      {(isGalleryLoading || galleryPreview) && (
        <section className="hero-gallery-preview" aria-label="Galeria destacada">
          <div className="hero-gallery-header">
            <h2 className="hero-gallery-title">Primeros retratos de la galeria</h2>
            <Link to="/dibujos" className="hero-gallery-link">
              Ver todos los retratos &rarr;
            </Link>
          </div>

          {isGalleryLoading ? (
            <div className="hero-gallery-grid" aria-live="polite" aria-busy="true">
              <article className="hero-gallery-card hero-gallery-card-skeleton" aria-hidden="true" />
              <article className="hero-gallery-card hero-gallery-card-skeleton" aria-hidden="true" />
              <article className="hero-gallery-card hero-gallery-card-skeleton" aria-hidden="true" />
            </div>
          ) : (
            galleryPreview && (
              <div className="hero-gallery-grid">
                {galleryPreview.map((drawing) => (
                  <article key={drawing.id} className="hero-gallery-card">
                    <img
                      src={resolveMediaUrl(drawing.image_url)}
                      alt={`Retrato ${drawing.id}`}
                      className="hero-gallery-image"
                    />
                  </article>
                ))}
              </div>
            )
          )}
        </section>
      )}

    </div>
  );
};

export default HeroPage;
