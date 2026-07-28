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

/**
 * Helper: builds the product detail path for a given product id.
 * @param {number|string} id - The product ID
 * @returns {string} The product detail URL path
 */
export const productDetailPath = (id) => `/products/${id}`;

/**
 * Helper: builds the shop path with optional search query and/or category filter.
 * @param {{ q?: string; category?: string }} [params] - Optional query parameters
 * @returns {string} The shop URL path with query string
 */
export const shopPath = (params) => {
  if (!params) return ROUTES.SHOP;
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.category) searchParams.set('category', params.category);
  const qs = searchParams.toString();
  return qs ? `${ROUTES.SHOP}?${qs}` : ROUTES.SHOP;
};

export const homePath = (params) => shopPath(params);

