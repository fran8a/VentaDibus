import { apiFetch, authenticatedFetch } from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
}

export interface GoogleLoginResponse {
  access_token: string;
}

/**
 * Verifica las credenciales de Google con el backend
 * @param googleToken Token de credenciales de Google
 * @returns Token de acceso del backend
 */
export const loginWithGoogle = async (googleToken: string): Promise<GoogleLoginResponse> => {
  const response = await apiFetch('/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: googleToken
    })
  });

  if (!response.ok) {
    throw new Error('Error al autenticar con Google');
  }

  return response.json();
};

/**
 * Obtiene la información del usuario autenticado
 * @param token Token de autenticación
 * @returns Datos del usuario
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await authenticatedFetch('/auth/me', token);

  if (!response.ok) {
    throw new Error('Error al obtener información del usuario');
  }

  return response.json();
};

/**
 * Helper para parsear JWT
 * @param token Token JWT
 * @returns Payload del token o null si hay error
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT está expirado
 * @param token Token JWT
 * @returns true si el token está expirado, false en caso contrario
 */
export const isTokenExpired = (token: string): boolean => {
  const tokenPayload = parseJwt(token);
  if (tokenPayload && tokenPayload.exp) {
    const now = Math.floor(Date.now() / 1000);
    return tokenPayload.exp < now;
  }
  return true;
};
