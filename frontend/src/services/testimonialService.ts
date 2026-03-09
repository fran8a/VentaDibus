import { apiFetch, authenticatedFetch } from './api';

export interface Testimonial {
  id: number;
  user_id: number;
  user_name: string;
  user_picture: string | null;
  pet_name: string;
  pet_type: string;
  stars: number;
  opinion: string;
  visible: boolean;
  created_at: string;
}

export interface TestimonialCreate {
  pet_name: string;
  pet_type: string;
  stars: number;
  opinion: string;
}

export const getPublicTestimonials = async (): Promise<Testimonial[]> => {
  const response = await apiFetch('/testimonials');
  if (!response.ok) {
    throw new Error('Error al obtener los testimonios');
  }
  return response.json();
};

export const getAllTestimonials = async (token: string): Promise<Testimonial[]> => {
  const response = await authenticatedFetch('/testimonials/all', token);
  if (!response.ok) {
    throw new Error('Error al obtener todos los testimonios');
  }
  return response.json();
};

export const getMyTestimonial = async (token: string): Promise<Testimonial | null> => {
  const response = await authenticatedFetch('/testimonials/mine', token);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al obtener tu testimonio');
  }
  return response.json();
};

export const createOrUpdateTestimonial = async (
  token: string,
  data: TestimonialCreate
): Promise<Testimonial> => {
  const response = await authenticatedFetch('/testimonials', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al guardar el testimonio');
  }
  return response.json();
};

export const toggleTestimonialVisibility = async (
  token: string,
  testimonialId: number,
  visible: boolean
): Promise<Testimonial> => {
  const response = await authenticatedFetch(
    `/testimonials/${testimonialId}/visibility`,
    token,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visible }),
    }
  );
  if (!response.ok) {
    throw new Error('Error al cambiar visibilidad del testimonio');
  }
  return response.json();
};

export const deleteTestimonial = async (
  token: string,
  testimonialId: number
): Promise<void> => {
  const response = await authenticatedFetch(
    `/testimonials/${testimonialId}`,
    token,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error('Error al eliminar el testimonio');
  }
};
