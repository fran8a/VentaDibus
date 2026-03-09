import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPublicTestimonials,
  getAllTestimonials,
  getMyTestimonial,
  createOrUpdateTestimonial,
  toggleTestimonialVisibility,
  deleteTestimonial,
} from '../services';
import type { Testimonial } from '../services/testimonialService';
import TestimonialModal from '../components/TestimonialModal';
import './Experiencia.css';

const ADMIN_EMAIL = 'franochoarodriguez@gmail.com';

const Experiencia = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [myTestimonial, setMyTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const estadisticas = [
    { numero: '+150', label: 'Dibujos Creados' },
    { numero: '5', label: 'Años de Experiencia' },
    { numero: '+10', label: 'Provincias Alcanzadas' },
  ];

  const fetchTestimonials = async () => {
    try {
      let data: Testimonial[];
      if (isAdmin && token) {
        data = await getAllTestimonials(token);
      } else {
        data = await getPublicTestimonials();
      }
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchMyTestimonial = async () => {
    if (!token) return;
    try {
      const data = await getMyTestimonial(token);
      setMyTestimonial(data);
    } catch (error) {
      console.error('Error fetching my testimonial:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTestimonials();
      if (token) {
        await fetchMyTestimonial();
      }
      setLoading(false);
    };
    loadData();
  }, [token, isAdmin]);

  const handleSubmitTestimonial = async (data: { pet_name: string; pet_type: string; stars: number; opinion: string }) => {
    if (!token) return;
    await createOrUpdateTestimonial(token, data);
    await fetchTestimonials();
    await fetchMyTestimonial();
  };

  const handleToggleVisibility = async (testimonialId: number, currentVisible: boolean) => {
    if (!token) return;
    await toggleTestimonialVisibility(token, testimonialId, !currentVisible);
    await fetchTestimonials();
  };

  const handleDeleteTestimonial = async (testimonialId: number) => {
    if (!token) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este testimonio?')) return;
    await deleteTestimonial(token, testimonialId);
    await fetchTestimonials();
  };

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

      {user && (
        <div className="add-testimonial-section">
          <button className="btn-add-testimonial" onClick={() => setIsModalOpen(true)}>
            {myTestimonial ? '✏️ Editar tu opinión' : '⭐ Deja tu opinión'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Cargando opiniones...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="empty-container">
          <p className="empty-text">Aún no hay opiniones. ¡Sé el primero en dejar la tuya!</p>
        </div>
      ) : (
        <div className="testimonios-container">
          {testimonials.map((testimonio) => (
            <div
              key={testimonio.id}
              className={`testimonio-card ${!testimonio.visible ? 'testimonio-hidden' : ''}`}
            >
              {isAdmin && (
                <div className="admin-controls">
                  <button
                    className={`btn-visibility ${testimonio.visible ? 'visible' : 'hidden'}`}
                    onClick={() => handleToggleVisibility(testimonio.id, testimonio.visible)}
                    title={testimonio.visible ? 'Ocultar al público' : 'Mostrar al público'}
                  >
                    {testimonio.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    className="btn-delete-testimonial"
                    onClick={() => handleDeleteTestimonial(testimonio.id)}
                    title="Eliminar testimonio"
                  >
                    🗑️
                  </button>
                  {!testimonio.visible && (
                    <span className="hidden-badge">Oculto</span>
                  )}
                </div>
              )}

              <div className="testimonio-header">
                {testimonio.user_picture ? (
                  <img
                    src={testimonio.user_picture}
                    alt={testimonio.user_name}
                    className="testimonio-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="testimonio-avatar-placeholder">
                    {testimonio.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="testimonio-info">
                  <h4 className="testimonio-nombre">{testimonio.user_name}</h4>
                  <p className="testimonio-mascota">{testimonio.pet_name} ({testimonio.pet_type})</p>
                </div>
              </div>

              <div className="estrellas">
                {[...Array(testimonio.stars)].map((_, i) => (
                  <span key={i} className="estrella">★</span>
                ))}
                {[...Array(5 - testimonio.stars)].map((_, i) => (
                  <span key={i} className="estrella empty">☆</span>
                ))}
              </div>

              <p className="testimonio-texto">"{testimonio.opinion}"</p>
            </div>
          ))}
        </div>
      )}

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

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTestimonial}
        existing={myTestimonial}
      />
    </div>
  );
};

export default Experiencia;
