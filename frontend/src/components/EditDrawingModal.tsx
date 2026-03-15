import { useState, useEffect } from 'react';
import { STATIC_BASE_URL } from '../services/api';
import './EditDrawingModal.css';

interface Drawing {
  id: number;
  image_url: string;
  instagram_link?: string;
}

interface EditDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (drawingId: number, instagramLink: string) => Promise<void>;
  drawing: Drawing | null;
}

const EditDrawingModal = ({ isOpen, onClose, onSubmit, drawing }: EditDrawingModalProps) => {
  const [instagramLink, setInstagramLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (drawing) {
      setInstagramLink(drawing.instagram_link || '');
    }
  }, [drawing]);

  if (!isOpen || !drawing) return null;

  const handleSubmit = async () => {
    if (!drawing) return;

    console.log('📝 Actualizando link de Instagram:', {
      drawingId: drawing.id,
      newLink: instagramLink
    });

    setIsSubmitting(true);
    try {
      await onSubmit(drawing.id, instagramLink);
      onClose();
    } catch (error) {
      console.error('Error updating drawing:', error);
      alert('Error al actualizar el dibujo. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setInstagramLink('');
      onClose();
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={handleClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">Editar Dibujo</h2>
          <button className="edit-modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="edit-modal-body">
          <img 
            src={`${STATIC_BASE_URL}${drawing.image_url}`}
            alt="Preview" 
            className="edit-preview-image" 
          />

          <div className="edit-form-group">
            <label className="edit-form-label">Link de Instagram</label>
            <input
              type="url"
              className="edit-form-input"
              placeholder="https://www.instagram.com/p/..."
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              disabled={isSubmitting}
            />
            <small style={{ color: '#8b7765', fontSize: '13px' }}>
              Deja vacío si no quieres link en esta imagen
            </small>
          </div>
        </div>

        <div className="edit-modal-footer">
          <button
            className="edit-modal-button edit-modal-button-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className="edit-modal-button edit-modal-button-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDrawingModal;
