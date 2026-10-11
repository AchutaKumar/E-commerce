export const API_BASE_URL = (import.meta.env.VITE_DJANGO_BASE_URL || '').replace(/\/+$/, '');

export const apiUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};