const API_BASE = 'https://husked-doormat-frigidly.ngrok-free.dev';

async function request(endpoint, options = {}) {
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', 
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ errors: 'Network error' }));
    const err = new Error(error.errors || 'Something went wrong');
    err.status = response.status;
    err.data = error;
    throw err;
  }

  return response.json();
}

// ========== AUTH ==========
export const authApi = {
  register: (data) => request('/api/users', { method: 'POST', body: data }),
  login: (data) => request('/api/users/login', { method: 'POST', body: data }),
  logout: () => request('/api/users/logout', { method: 'POST' }),
  getCurrentUser: () => request('/api/users/current'),
};

// ========== PRODUCTS (Public) ==========
export const productApi = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.set('category_id', params.category_id);
    if (params.gender) query.set('gender', params.gender);
    if (params.name) query.set('name', params.name);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    return request(`/api/products?${query.toString()}`);
  },
  get: (productId) => request(`/api/products/${productId}`),
  getVariants: (productId) => request(`/api/products/${productId}/product-variants`),
  getVariant: (productId, variantId) =>
    request(`/api/products/${productId}/product-variants/${variantId}`),
};

// ========== CATEGORIES (Public) ==========
export const categoryApi = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.name) query.set('name', params.name);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    return request(`/api/categories?${query.toString()}`);
  },
  get: (id) => request(`/api/categories/${id}`),
};

// ========== COLORS (Public) ==========
export const colorApi = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.name) query.set('name', params.name);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    return request(`/api/colors?${query.toString()}`);
  },
  get: (id) => request(`/api/colors/${id}`),
};

// ========== SIZES (Public) ==========
export const sizeApi = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.label) query.set('label', params.label);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    return request(`/api/sizes?${query.toString()}`);
  },
  get: (id) => request(`/api/sizes/${id}`),
};

// ========== CART ==========
export const cartApi = {
  get: () => request('/api/carts'),
  add: (data) => request('/api/carts', { method: 'POST', body: data }),
  remove: (cartId) => request(`/api/carts/${cartId}`, { method: 'DELETE' }),
};

// ========== ORDERS ==========
export const orderApi = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return request(`/api/orders?${query.toString()}`);
  },
  get: (orderId) => request(`/api/orders/${orderId}`),
  getDestinationAddress: (search) =>
    request(`/api/orders/destination-address?search=${encodeURIComponent(search)}`),
  getShippingCost: (data) =>
    request('/api/orders/shipping-cost', { method: 'POST', body: data }),
  createTransaction: (data) =>
    request('/api/orders', { method: 'POST', body: data }),
};

// ========== ADMIN: PRODUCTS ==========
export const adminProductApi = {
  create: (data) => request('/api/admin/products', { method: 'POST', body: data }),
  update: (productId, data) =>
    request(`/api/admin/products/${productId}`, { method: 'PUT', body: data }),
  remove: (productId) =>
    request(`/api/admin/products/${productId}`, { method: 'DELETE' }),
  uploadImages: (productId, formData) =>
    request(`/api/admin/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    }),
  createVariant: (productId, data) =>
    request(`/api/admin/products/${productId}/product-variants`, {
      method: 'POST',
      body: data,
    }),
  updateVariant: (productId, variantId, data) =>
    request(`/api/admin/products/${productId}/product-variants/${variantId}`, {
      method: 'PUT',
      body: data,
    }),
  removeVariant: (productId, variantId) =>
    request(`/api/admin/products/${productId}/product-variants/${variantId}`, {
      method: 'DELETE',
    }),
};

// ========== ADMIN: CATEGORIES ==========
export const adminCategoryApi = {
  create: (data) => request('/api/admin/categories', { method: 'POST', body: data }),
  update: (id, data) =>
    request(`/api/admin/categories/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/api/admin/categories/${id}`, { method: 'DELETE' }),
};

// ========== ADMIN: COLORS ==========
export const adminColorApi = {
  create: (data) => request('/api/admin/colors', { method: 'POST', body: data }),
  update: (id, data) =>
    request(`/api/admin/colors/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/api/admin/colors/${id}`, { method: 'DELETE' }),
};

// ========== ADMIN: SIZES ==========
export const adminSizeApi = {
  create: (data) => request('/api/admin/sizes', { method: 'POST', body: data }),
  update: (id, data) =>
    request(`/api/admin/sizes/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/api/admin/sizes/${id}`, { method: 'DELETE' }),
};

// ========== ADMIN: ORDERS ==========
export const adminOrderApi = {
  remove: (orderId) =>
    request(`/api/admin/orders/${orderId}`, { method: 'DELETE' }),
};
