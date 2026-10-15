const API_BASE_URL = import.meta.env.PROD
    ? ''
    : import.meta.env.VITE_DJANGO_BASE_URL || 'http://127.0.0.1:8000';

export { API_BASE_URL };

export const apiUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};