import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  useEffect(() => {
    // Obtener token de la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Guardar token
      localStorage.setItem('auth_token', token);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Recargar para actualizar el contexto
      }, 1000);
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafaf8'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b5d52'
        }}>
          <h2>Iniciando sesión...</h2>
          <p>Un momento por favor</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthSuccess;
