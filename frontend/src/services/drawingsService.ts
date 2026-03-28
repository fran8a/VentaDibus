import { apiFetch, authenticatedFetch } from './api';

export interface Drawing {
  id: number;
  image_url: string;
  instagram_link?: string;
}

const DRAWINGS_CACHE_TTL_MS = 60_000;

let drawingsCache: Drawing[] | null = null;
let drawingsCacheExpiresAt = 0;
let getAllDrawingsInFlight: Promise<Drawing[]> | null = null;

const invalidateDrawingsCacheInternal = () => {
  drawingsCache = null;
  drawingsCacheExpiresAt = 0;
};

export const invalidateDrawingsCache = () => {
  invalidateDrawingsCacheInternal();
};

/**
 * Obtiene todos los dibujos de la galería
 * @returns Lista de dibujos
 */
export const getAllDrawings = async (): Promise<Drawing[]> => {
  const now = Date.now();

  if (drawingsCache && now < drawingsCacheExpiresAt) {
    return drawingsCache;
  }

  if (!getAllDrawingsInFlight) {
    getAllDrawingsInFlight = (async () => {
      const response = await apiFetch('/drawings');

      if (!response.ok) {
        throw new Error('Error al obtener los dibujos');
      }

      const drawings = await response.json() as Drawing[];
      drawingsCache = drawings;
      drawingsCacheExpiresAt = Date.now() + DRAWINGS_CACHE_TTL_MS;
      return drawings;
    })();
  }

  try {
    return await getAllDrawingsInFlight;
  } finally {
    getAllDrawingsInFlight = null;
  }
};

/**
 * Sube un nuevo dibujo a la galería
 * @param token Token de autenticación
 * @param file Archivo de imagen
 * @param instagramLink Link de Instagram (opcional)
 * @returns Dibujo creado
 */
export const uploadDrawing = async (
  token: string,
  file: File,
  instagramLink: string
): Promise<Drawing> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('instagram_link', instagramLink);

  const response = await authenticatedFetch('/drawings/upload', token, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Error del servidor:', errorData);
    throw new Error('Error al subir el dibujo');
  }

  const createdDrawing = await response.json() as Drawing;
  invalidateDrawingsCacheInternal();
  return createdDrawing;
};

/**
 * Actualiza el link de Instagram de un dibujo
 * @param token Token de autenticación
 * @param drawingId ID del dibujo
 * @param instagramLink Nuevo link de Instagram
 * @returns Dibujo actualizado
 */
export const updateDrawing = async (
  token: string,
  drawingId: number,
  instagramLink: string
): Promise<Drawing> => {
  const formData = new FormData();
  formData.append('instagram_link', instagramLink);

  const response = await authenticatedFetch(`/drawings/${drawingId}`, token, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el dibujo');
  }

  const updatedDrawing = await response.json() as Drawing;
  invalidateDrawingsCacheInternal();
  return updatedDrawing;
};

/**
 * Elimina un dibujo de la galería
 * @param token Token de autenticación
 * @param drawingId ID del dibujo a eliminar
 */
export const deleteDrawing = async (
  token: string,
  drawingId: number
): Promise<void> => {
  const response = await authenticatedFetch(`/drawings/${drawingId}`, token, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el dibujo');
  }

  invalidateDrawingsCacheInternal();
};
