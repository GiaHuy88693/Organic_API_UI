const Storage = {
  // ========== TOKEN MANAGEMENT ==========
  
  /**
   * Lưu access token và refresh token
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Lấy access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Lấy refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Xóa tất cả tokens
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Kiểm tra user đã login chưa
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  // ========== USER INFO MANAGEMENT ==========
  
  /**
   * Lưu thông tin user
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Lấy thông tin user
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Xóa thông tin user
   */
  clearUser() {
    localStorage.removeItem('user');
  },

  // ========== CART MANAGEMENT ==========
  
  /**
   * Lưu giỏ hàng (dùng cho guest user)
   */
  setCart(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  },

  /**
   * Lấy giỏ hàng
   */
  getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  /**
   * Xóa giỏ hàng
   */
  clearCart() {
    localStorage.removeItem('cart');
  },

  // ========== GENERAL METHODS ==========
  
  /**
   * Lưu dữ liệu tùy chỉnh
   */
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Lấy dữ liệu tùy chỉnh
   */
  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Xóa dữ liệu tùy chỉnh
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Xóa tất cả dữ liệu (logout)
   */
  clearAll() {
    this.clearTokens();
    this.clearUser();
    // Giữ lại cart cho guest user
    // this.clearCart();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}