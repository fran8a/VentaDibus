import { useState, useEffect } from 'react';
import type { Testimonial } from '../services/testimonialService';
import './TestimonialModal.css';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { pet_name: string; pet_type: string; stars: number; opinion: string }) => Promise<void>;
  existing?: Testimonial | null;
}

const TestimonialModal = ({ isOpen, onClose, onSubmit, existing }: TestimonialModalProps) => {
  const [petName, setPetName] = useState('');
  const [stars, setStars] = useState(5);
  const [petType, setPetType] = useState('');
  const [opinion, setOpinion] = useState('');
  const [hoverStars, setHoverStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setPetName(existing.pet_name);
      setPetType(existing.pet_type);
      setStars(existing.stars);
      setOpinion(existing.opinion);
    } else {
      setPetName('');
      setPetType('');
      setStars(5);
      setOpinion('');
    }
  }, [existing, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!petName.trim() || !petType.trim() || !opinion.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ pet_name: petName.trim(), pet_type: petType.trim(), stars, opinion: opinion.trim() });
      onClose();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="testimonial-modal-overlay" onClick={onClose}>
      <div className="testimonial-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {existing ? 'Editar tu opinión' : 'Deja tu opinión'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre de tu mascota</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Luna"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Animal</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Perro, Gata, Conejo..."
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              maxLength={40}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Calificación</label>
            <div className="stars-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star-select ${star <= (hoverStars || stars) ? 'active' : ''}`}
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoverStars(star)}
                  onMouseLeave={() => setHoverStars(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tu opinión</label>
            <textarea
              className="form-textarea"
              placeholder="Cuéntanos tu experiencia con el dibujo de tu mascota..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <span className="char-count">{opinion.length}/1000</span>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !petName.trim() || !petType.trim() || !opinion.trim()}
            >
              {isSubmitting ? 'Guardando...' : existing ? 'Actualizar' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;
