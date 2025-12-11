import { useState } from 'react';
import './AddDrawingModal.css';

interface AddDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, instagramLink: string) => Promise<void>;
}

const AddDrawingModal = ({ isOpen, onClose, onSubmit }: AddDrawingModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instagramLink, setInstagramLink] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    console.log('📤 Enviando dibujo:', {
      fileName: selectedFile.name,
      instagramLink: instagramLink
    });

    setIsSubmitting(true);
    try {
      await onSubmit(selectedFile, instagramLink);
      // Reset form
      setSelectedFile(null);
      setInstagramLink('');
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Error uploading drawing:', error);
      alert('Error al subir el dibujo. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedFile(null);
      setInstagramLink('');
      setPreviewUrl(null);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Agregar Dibujo</h2>
          <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Imagen *</label>
            <div className="file-input-wrapper">
              <label className={`file-input-button ${selectedFile ? 'has-file' : ''}`}>
                <span>📸</span>
                <span>{selectedFile ? selectedFile.name : 'Seleccionar imagen'}</span>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Link de Instagram (opcional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://www.instagram.com/p/..."
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="modal-button modal-button-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className="modal-button modal-button-primary"
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? 'Subiendo...' : 'Agregar Dibujo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDrawingModal;
