'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, handleGoogleLogin } = useAuth();

  const menuItems = [
    { path: '/', label: 'Mis Dibujos', icon: '🎨' },
    { path: '/como-adquirir', label: 'Cómo Adquirir', icon: '📋' },
    { path: '/precios', label: 'Precios', icon: '💰' },
    { path: '/experiencia', label: 'Experiencia', icon: '✨' },
    { path: '/quien-soy', label: 'Quién Soy', icon: '👤' },
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
      setIsOpen(false);
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
            <div className="logo-container">
              <span className="logo-icon">🐾</span>
              <h2 className="logo-text">Sab Dibus</h2>
            </div>
          )}
        </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={!isOpen ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
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
          ) : (
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
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
