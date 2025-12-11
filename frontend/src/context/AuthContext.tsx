'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useGoogleLogin, googleLogout, type CredentialResponse } from '@react-oauth/google';

interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  handleGoogleLogin: (credentialResponse: CredentialResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to parse JWT
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    // Verificar si hay token guardado
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      // Verificar si el token está expirado antes de intentar usarlo
      const tokenPayload = parseJwt(savedToken);
      if (tokenPayload && tokenPayload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp < now) {
          console.log('⚠️ Token expirado detectado en localStorage, limpiando...');
          localStorage.removeItem('auth_token');
          setIsLoading(false);
          return;
        }
      }
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }

    // Escuchar cambios en el storage (para sincronizar pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue) {
          fetchUser(e.newValue);
        } else {
          setUser(null);
          setToken(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      // Verificar si el token está expirado antes de hacer la petición
      const tokenPayload = parseJwt(authToken);
      if (tokenPayload && tokenPayload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp < now) {
          console.log('Token expirado, limpiando sesión...');
          localStorage.removeItem('auth_token');
          setUser(null);
          setToken(null);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(authToken);
      } else {
        // Token inválido o expirado
        console.log('Token inválido o expirado (401), limpiando sesión...');
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        // Enviar el token de Google al backend para verificación
        const response = await fetch('http://localhost:8000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: credentialResponse.credential
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.access_token);
          await fetchUser(data.access_token);
        } else {
          console.error('Error authenticating with backend');
        }
      } catch (error) {
        console.error('Error during Google login:', error);
      }
    }
  };

  const login = () => {
    // Este método ahora será manejado por el botón de Google
    console.log('Use Google Login button');
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, handleGoogleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
