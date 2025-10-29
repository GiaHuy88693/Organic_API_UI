// src/js/config/api.config.js

(function () {
  const BASE = 'http://localhost:8080/api/v1';
  window.API = {
    BASE_URL: BASE,
    AUTH: {
      REGISTER: `${BASE}/auth/register`,
      SEND_OTP: `${BASE}/auth/otp`,
      LOGIN: `${BASE}/auth/login`,
      REFRESH_TOKEN: `${BASE}/auth/refresh-token`,
      LOGOUT: `${BASE}/auth/logout`,
      FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
      RESET_PASSWORD: `${BASE}/auth/reset-password`,
      GET_PROFILE: `${BASE}/auth/profile`,
      UPDATE_PROFILE: `${BASE}/auth/profile`,
      GET_ALL_USERS: `${BASE}/auth`,
      LOCK_USER: (userId) => `${BASE}/auth/${userId}/lock`,
      UNLOCK_USER: (userId) => `${BASE}/auth/${userId}/unlock`,
      MARK_VIOLATION: (userId) => `${BASE}/auth/${userId}/violations`,
      UPLOAD_AVATAR: `${BASE}/auth/avatar`,
    },
    PRODUCT: {
      CREATE: `${BASE}/product/create`,
      UPDATE: (id) => `${BASE}/product/${id}`,
      DELETE: (id) => `${BASE}/product/${id}`,
      GET_LIST: `${BASE}/product/pagination`,
      GET_BY_ID: (id) => `${BASE}/product/${id}`,
      GET_ALL: `${BASE}/product`,
      UPLOAD_IMAGES: (id) => `${BASE}/product/${id}/images`,
      GET_IMAGES: (id) => `${BASE}/product/${id}/images`,
      SET_PRIMARY_IMAGE: (pId, iId) => `${BASE}/product/${pId}/images/${iId}/primary`,
      DELETE_IMAGE: (pId, iId) => `${BASE}/product/${pId}/images/${iId}`,
    },
    CART: {
      GET: `${BASE}/cart`,
      ADD: `${BASE}/cart`,
      UPDATE: (id) => `${BASE}/cart/${id}`,
      REMOVE: (id) => `${BASE}/cart/${id}`,
      CLEAR: `${BASE}/cart`,
      GET_LIST: `${BASE}/cart/pagination`,
    },
    CATEGORY: {
      CREATE: `${BASE}/category/create`,
      UPDATE: (id) => `${BASE}/category/${id}`,
      DELETE: (id) => `${BASE}/category/${id}`,
      GET_LIST: `${BASE}/category/pagination`,
      GET_BY_ID: (id) => `${BASE}/category/${id}`,
      GET_ALL: `${BASE}/category`,
    },
    ROLE: {
      GET_LIST: `${BASE}/role`,
    },
    ORDER: {
      CHECKOUT_FROM_CART: `${BASE}/order/checkout-from-cart`,
      GET_LIST: `${BASE}/order/pagination`,
      GET_DETAIL: (orderId) => `${BASE}/order/${orderId}`,
      DELETE: (orderId) => `${BASE}/order/${orderId}`,
    },
    WISHLIST: {
      TOGGLE: (productId) => `${BASE}/wishlist/${productId}/toggle`,
      GET_LIST: `${BASE}/wishlist`,
    },
    PAYMENT: {
      CREATE_MOMO: `${BASE}/payments/momo/create`,
      IPN: `${BASE}/payments/momo/ipn`,
      RETURN: `${BASE}/payments/momo/return`,
    },
  };
})();
