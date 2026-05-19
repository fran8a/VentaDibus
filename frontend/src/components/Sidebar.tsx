'use client';

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Home, GalleryHorizontal, ClipboardList, Tag, Star, User, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../config/admin';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const location = useLocation();
  const { user, logout, handleGoogleLogin, isLoading } = useAuth();

  const isAdmin = isAdminEmail(user?.email);

  const menuItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/dibujos', label: 'Dibujos', icon: GalleryHorizontal },
    { path: '/como-adquirir', label: 'Cómo Adquirir', icon: ClipboardList },
    { path: '/precios', label: 'Precios', icon: Tag },
    { path: '/experiencia', label: 'Experiencia', icon: Star },
    { path: '/quien-soy', label: 'Quién Soy', icon: User },
  ];

  const adminMenuItems = [
    { path: '/pedidos', label: 'Pedidos', icon: Package },
  ];

  // Check window size and set initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      const frameId = window.requestAnimationFrame(() => {
        setIsOpen(false);
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [location]);

  return (
    <>
      <button 
        className={`hamburger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

        <div className="sidebar-header">
          {isOpen && (
            <NavLink to="/" className="logo-home-link" title="Ir al inicio">
              <div className="logo-container">
                <span className="logo-icon">🐾</span>
                <h2 className="logo-text">Sab Dibus</h2>
              </div>
            </NavLink>
          )}
        </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={!isOpen ? item.label : ''}
          >
            <span className="nav-icon"><item.icon size={18} strokeWidth={1.5} /></span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            {isOpen && <div className="nav-divider" />}
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item nav-item--admin ${isActive ? 'active' : ''}`}
                title={!isOpen ? item.label : ''}
              >
                <span className="nav-icon"><item.icon size={18} strokeWidth={1.5} /></span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {isOpen && (
        <div className="sidebar-footer">
          {user ? (
            <div className="user-section">
              <div className="user-info">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="user-avatar" />
                )}
                <div className="user-details">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <button onClick={logout} className="logout-btn">
                Cerrar Sesión
              </button>
            </div>
          ) : isLoading ? (
            <div className="login-loading">Cargando sesion...</div>
          ) : (
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  setLoginError('');
                  handleGoogleLogin(credentialResponse);
                }}
                onError={() => {
                  console.log('Login Failed');
                  setLoginError('Chrome bloqueo la ventana de Google. Habilita popups o el inicio de sesion de terceros para este sitio.');
                }}
                click_listener={() => setLoginError('')}
                use_fedcm_for_button
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
              {loginError && <p className="login-error">{loginError}</p>}
            </div>
          )}
          
          <div className="social-links-minimal">
            <a href="https://www.instagram.com/sabdibus_/" target="_blank" rel="noopener noreferrer" className="social-link-minimal" title="Instagram">
              <img src="/instagram.png" alt="Instagram" className="social-icon-minimal" />
            </a>
            <a href="https://www.tiktok.com/@sabrinaochoa6" target="_blank" rel="noopener noreferrer" className="social-link-minimal" title="TikTok">
              <img src="/tikTok.png" alt="TikTok" className="social-icon-minimal" />
            </a>
            <a href="https://www.linkedin.com/in/sabrina-ochoa-303b6b302/" target="_blank" rel="noopener noreferrer" className="social-link-minimal" title="LinkedIn">
              <img src="/linkedin.png" alt="LinkedIn" className="social-icon-minimal" />
            </a>
          </div>
          
          <p className="footer-text">Hecho con ❤️</p>
        </div>
      )}
      </div>
    </>
  );
};

export default Sidebar;
