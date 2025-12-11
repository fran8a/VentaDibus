import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddDrawingModal from '../components/AddDrawingModal';
import EditDrawingModal from '../components/EditDrawingModal';
import './MisDibujos.css';

interface Drawing {
  id: number;
  image_url: string;
  instagram_link?: string;
}

const MisDibujos = () => {
  const { user, token } = useAuth();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const ADMIN_EMAIL = 'franochoarodriguez@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Cargar dibujos desde el backend
  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/drawings');
      if (response.ok) {
        const data = await response.json();
        setDrawings(data);
      }
    } catch (error) {
      console.error('Error fetching drawings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDrawing = async (file: File, instagramLink: string) => {
    if (!token) return;

    console.log('📝 Preparando FormData con:', {
      fileName: file.name,
      instagramLink: instagramLink
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('instagram_link', instagramLink);

    console.log('📤 Enviando request al backend...');

    try {
      const response = await fetch('http://localhost:8000/api/drawings/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Respuesta del servidor:', data);
        await fetchDrawings();
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error('Failed to upload drawing');
      }
    } catch (error) {
      console.error('Error uploading drawing:', error);
      throw error;
    }
  };

  const handleDeleteDrawing = async (drawingId: number) => {
    if (!token || !isAdmin) return;

    if (!confirm('¿Estás segura de que quieres eliminar este dibujo?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/drawings/${drawingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('✅ Dibujo eliminado');
        await fetchDrawings();
      } else {
        throw new Error('Failed to delete drawing');
      }
    } catch (error) {
      console.error('Error deleting drawing:', error);
      alert('Error al eliminar el dibujo');
    }
  };

  const handleEditDrawing = (drawing: Drawing) => {
    setSelectedDrawing(drawing);
    setIsEditModalOpen(true);
  };

  const handleUpdateDrawing = async (drawingId: number, instagramLink: string) => {
    if (!token) return;

    const formData = new FormData();
    formData.append('instagram_link', instagramLink);

    try {
      const response = await fetch(`http://localhost:8000/api/drawings/${drawingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dibujo actualizado:', data);
        await fetchDrawings();
      } else {
        throw new Error('Failed to update drawing');
      }
    } catch (error) {
      console.error('Error updating drawing:', error);
      throw error;
    }
  };

  return (
    <div className="mis-dibujos">
      <header className="page-header">
        <h1 className="page-title">Mis Dibujos</h1>
        <p className="page-subtitle">
          Galería de retratos de mascotas con amor y dedicación
        </p>
      </header>

      <div className="gallery">
        {isAdmin && (
          <div className="gallery-card add-drawing-card" onClick={() => setIsModalOpen(true)}>
            <div className="add-drawing-content">
              <span className="add-icon">➕</span>
              <span className="add-text">Agregar Dibujo</span>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">Cargando dibujos...</div>
        ) : (
          drawings.map((drawing) => (
            <div key={drawing.id} className="gallery-card">
              {isAdmin && (
                <div className="admin-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditDrawing(drawing)}
                    title="Editar link"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDrawing(drawing.id)}
                    title="Eliminar dibujo"
                  >
                    🗑️
                  </button>
                </div>
              )}
              {drawing.instagram_link ? (
                <a 
                  href={drawing.instagram_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="card-image-wrapper"
                >
                  <img 
                    src={`http://localhost:8000${drawing.image_url}`}
                    alt={`Retrato ${drawing.id}`}
                    className="card-image"
                  />
                  <div className="card-overlay">
                    <span className="overlay-text">Ver detalles</span>
                  </div>
                </a>
              ) : (
                <div className="card-image-wrapper">
                  <img 
                    src={`http://localhost:8000${drawing.image_url}`}
                    alt={`Retrato ${drawing.id}`}
                    className="card-image"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AddDrawingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDrawing}
      />

      <EditDrawingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDrawing(null);
        }}
        onSubmit={handleUpdateDrawing}
        drawing={selectedDrawing}
      />
    </div>
  );
};

export default MisDibujos;
