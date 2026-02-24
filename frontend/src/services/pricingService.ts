import { apiFetch, authenticatedFetch } from './api';

export interface Pricing {
  id: number;
  size: string;
  style: string;
  price_without_frame: number;
  price_with_frame: number;
}

export interface PricingUpdateData {
  price_without_frame?: number;
  price_with_frame?: number;
  size?: string;
  style?: string;
}

export const getAllPricing = async (): Promise<Pricing[]> => {
  const response = await apiFetch('/pricing/');

  if (!response.ok) {
    throw new Error('Error al obtener los precios');
  }

  return response.json();
};


/**
 * Actualiza los precios de un item específico
 * @param token Token de autenticación
 * @param pricingId ID del precio a actualizar
 * @param data Datos a actualizar (price_without_frame, price_with_frame, size, style)
 * @returns Precio actualizado
 * @throws Error con mensaje específico según el código de estado
 */
export const updatePricing = async (
  token: string,
  pricingId: number,
  data: PricingUpdateData
): Promise<Pricing> => {

  const response = await authenticatedFetch(`/pricing/${pricingId}`, token, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 422) {
      try {
        const clone = response.clone();
        const body = await clone.json().catch(() => null);

        if (body && body.detail) {
          const parts = Array.isArray(body.detail)
            ? body.detail.map((d: any) => `${d.loc?.join('.') || d.loc}: ${d.msg || JSON.stringify(d)}`)
            : [JSON.stringify(body.detail)];
          throw new Error(`Error 422 Unprocessable Content: ${parts.join(' | ')}`);
        }

        const text = await response.text().catch(() => null);
        throw new Error(`Error 422 Unprocessable Content: ${text || 'unknown'}`);
      } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error('Error 422 Unprocessable Content');
      }
    }

    switch (response.status) {
      case 401:
        throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
      case 403:
        throw new Error('No tienes permisos de administrador para actualizar precios.');
      case 404:
        throw new Error('Precio no encontrado.');
      default:
        throw new Error('Error al actualizar el precio.');
    }
  }

  return response.json();
};


export const updateMultiplePricing = async (
  token: string,
  updates: Array<{ id: number; data: PricingUpdateData }>
): Promise<Pricing[]> => {

  const results = await Promise.all(
    updates.map(({ id, data }) => updatePricing(token, id, data))
  );

  return results;
};
