const API_CONFIG = {
  // Thay đổi BASE_URL khi deploy production
  BASE_URL: 'http://localhost:8080',
  
  // Timeout cho request (ms)
  TIMEOUT: 10000,
  
  // Các endpoint API
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile',
      SEND_OTP: '/auth/otp',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      UPLOAD_AVATAR: '/auth/avatar',
    },
    PRODUCTS: {
      GET_ALL: '/products',
      GET_BY_ID: '/products/:id',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id',
      SEARCH: '/products/search',
    },
    CATEGORIES: {
      GET_ALL: '/categories',
      GET_BY_ID: '/categories/:id',
    },
    CART: {
      GET: '/cart',
      ADD_ITEM: '/cart',
      UPDATE_ITEM: '/cart/:id',
      REMOVE_ITEM: '/cart/:id',
      CLEAR: '/cart/clear',
    },
    ORDERS: {
      GET_ALL: '/orders',
      GET_BY_ID: '/orders/:id',
      CREATE: '/orders',
      UPDATE_STATUS: '/orders/:id/status',
    },
  }
};

// Export để sử dụng ở các file khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}