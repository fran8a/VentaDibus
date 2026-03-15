'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { googleLogout, type CredentialResponse } from '@react-oauth/google';
import { 
  type User,
  loginWithGoogle, 
  getCurrentUser, 
  isTokenExpired 
} from '../services';

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

  useEffect(() => {
    // Verificar si hay token guardado
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      // Verificar si el token está expirado antes de intentar usarlo
      if (isTokenExpired(savedToken)) {
        console.log('⚠️ Token expirado detectado en localStorage, limpiando...');
        localStorage.removeItem('auth_token');
        setIsLoading(false);
        return;
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
      if (isTokenExpired(authToken)) {
        console.log('Token expirado, limpiando sesión...');
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      const userData = await getCurrentUser(authToken);
      setUser(userData);
      setToken(authToken);
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
        const data = await loginWithGoogle(credentialResponse.credential);
        localStorage.setItem('auth_token', data.access_token);
        await fetchUser(data.access_token);
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
