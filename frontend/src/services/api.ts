export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const STATIC_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

export const resolveMediaUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith('/')) {
    return `${STATIC_BASE_URL}${pathOrUrl}`;
  }

  return `${STATIC_BASE_URL}/${pathOrUrl}`;
};

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
