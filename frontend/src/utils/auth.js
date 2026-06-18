export const saveToken = (token) => {
    if (token && token.access) {
        localStorage.setItem('access_token', token.access);
    }
    if (token && token.refresh) {
        localStorage.setItem('refresh_token', token.refresh);
    }
    if (token && token.is_staff !== undefined) {
        localStorage.setItem('is_staff', token.is_staff ? 'true' : 'false');
    }
};

export const clearToken = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_staff');
};

export const getAccessToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null') {
        return null;
    }
    return token;
};

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);
        const exp = decoded.exp;
        const now = Date.now() / 1000;
        return exp < now;
    } catch (e) {
        return true;
    }
};

export const isAuthenticated = () => {
    const token = getAccessToken();
    if (token) {
        if (isTokenExpired(token)) {
            clearToken();
            return false;
        }
        return true;
    }
    return false;
};

export const isAdminUser = () => {
    return localStorage.getItem('is_staff') === 'true';
};

export const authFetch = async (url, options = {}) => {
    const token = getAccessToken();
    const headers = options.headers ? { ...options.headers } : {};
    
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, { ...options, headers });
}
