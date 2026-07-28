/**
 * Centralized route path constants.
 * Use these instead of hardcoded strings throughout the app.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  SHOP: '/shop',
  PRODUCT_DETAIL: '/products/:id',
  ABOUT: '/about',
  SHIPPING_INFO: '/shipping-info',
  SAVED_ITEMS: '/saved-items',
  LOGIN: '/login',
  REGISTER: '/register',

  // Protected routes (require auth)
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',

  // Admin routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_ADD_PRODUCT: '/admin/add-product',

  // Fallback
  NOT_FOUND: '*',
};

export const productDetailPath = (id) => `/products/${id}`;

export const shopPath = (params) => {
  if (!params) return ROUTES.SHOP;
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.category) searchParams.set('category', params.category);
  const qs = searchParams.toString();
  return qs ? `${ROUTES.SHOP}?${qs}` : ROUTES.SHOP;
};

export const homePath = (params) => shopPath(params);

/**
 * Helper: returns the API base URL with fallback to Render backend if env is undefined in production.
 * @returns {string} The formatted backend API base URL
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_DJANGO_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://e-commerce-7dwo.onrender.com';
  }
  return 'http://127.0.0.1:8000';
};



