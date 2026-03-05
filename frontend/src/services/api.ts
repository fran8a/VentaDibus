export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  return fetch(url, config);
};

export const authenticatedFetch = async (
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
