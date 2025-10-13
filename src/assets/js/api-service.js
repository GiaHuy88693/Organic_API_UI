class CoreApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.apiPrefix = CONFIG.API_PREFIX;
    // TODO: Thay token này bằng token từ Swagger
    this.fallbackToken = 'PASTE_YOUR_TOKEN_HERE';
  }

  getToken() {
    return localStorage.getItem(CONFIG.STORAGE.ACCESS_TOKEN);
  }

  saveTokens(accessToken, refreshToken) {
    localStorage.setItem(CONFIG.STORAGE.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(CONFIG.STORAGE.REFRESH_TOKEN, refreshToken);
    }
  }

  clearAuth() {
    Object.values(CONFIG.STORAGE).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  getHeaders(isFormData = false, requireAuth = true) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (requireAuth) {
      let token = this.getToken();
      
      // Nếu user chưa đăng nhập, dùng fallback token
      if (!token) {
        token = this.fallbackToken;
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  buildUrl(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${this.apiPrefix}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  }

  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (response.ok) {
      return {
        success: true,
        statusCode: data.statusCode || response.status,
        message: data.message || 'Success',
        data: data.data || data,
      };
    }

    if (response.status === 401) {
      // Nếu là user token bị lỗi, clear auth
      if (this.getToken()) {
        this.clearAuth();
        if (!window.location.pathname.includes('/auth/login')) {
          showToast('Phiên đăng nhập hết hạn', 'error');
          setTimeout(() => window.location.href = '/pages/auth/login.html', 1000);
        }
      }
    }

    throw {
      success: false,
      statusCode: data.statusCode || response.status,
      message: data.message || 'Có lỗi xảy ra',
    };
  }

  async request(endpoint, options = {}) {
    try {
      const { method = 'GET', body, params, isFormData = false, requireAuth = true } = options;
      const url = this.buildUrl(endpoint, params);
      
      const config = {
        method,
        headers: this.getHeaders(isFormData, requireAuth),
      };

      if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
      }

      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint, params, requireAuth = true) {
    return this.request(endpoint, { method: 'GET', params, requireAuth });
  }

  post(endpoint, body, isFormData = false, requireAuth = true) {
    return this.request(endpoint, { method: 'POST', body, isFormData, requireAuth });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiService = new CoreApiService();

// ============================================
// AUTH API
// ============================================
const AuthAPI = {
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', {
        fullname: userData.name,
        email: userData.email,
        phoneNumber: userData.phone,
        password: userData.password,
        confirmPassword: userData.password,
        code: userData.otp,
      }, false, false);
      
      if (response.success) {
        showToast('Đăng ký thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async sendOTP(email) {
    try {
      const response = await apiService.post('/auth/otp', { 
        email, 
        type: 'REGISTER' 
      }, false, false);
      
      if (response.success) {
        showToast('Mã OTP đã được gửi', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { 
        email, 
        password 
      }, false, false);

      console.log('Login response:', response);

      if (response.success && response.data) {
        apiService.saveTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        try {
          const profile = await this.getProfile();
          if (profile.success) {
            localStorage.setItem(
              CONFIG.STORAGE.USER_INFO,
              JSON.stringify(profile.data)
            );
          }
        } catch (profileError) {
          console.error('Get profile error:', profileError);
        }

        showToast('Đăng nhập thành công!', 'success');
      }

      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem(CONFIG.STORAGE.REFRESH_TOKEN);
      if (refreshToken) {
        await apiService.post('/auth/logout', { refreshToken: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.clearAuth();
      showToast('Đăng xuất thành công!', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);
    }
  },

  async getProfile() {
    return await apiService.get('/auth/profile');
  },

  async updateProfile(profileData) {
    try {
      const response = await apiService.patch('/auth/profile', profileData);
      if (response.success) {
        localStorage.setItem(
          CONFIG.STORAGE.USER_INFO,
          JSON.stringify(response.data)
        );
        showToast('Cập nhật thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post('/auth/avatar', formData, true);
      if (response.success) {
        showToast('Cập nhật ảnh đại diện thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  isLoggedIn() {
    return !!apiService.getToken();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(CONFIG.STORAGE.USER_INFO);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role && user.role.name === 'admin';
  },
};

// ============================================
// PRODUCT API
// ============================================
const ProductAPI = {
  async getProducts(options = {}) {
    const params = {
      page: Math.floor((options.skip || 0) / (options.take || 12)) + 1,
      limit: options.take || 12,
      search: options.search || '',
      categoryId: options.categoryId || '',
      minPrice: options.minPrice || '',
      maxPrice: options.maxPrice || '',
      sortBy: options.sortBy || '',
      sortOrder: options.sortOrder || 'desc',
    };

    return await apiService.get('/product/pagination', params, true);
  },

  async getProductById(id) {
    return await apiService.get(`/product/${id}`, {}, true);
  },

  async getAllProducts() {
    return await apiService.get('/product', {}, true);
  },

  async createProduct(data) {
    try {
      const response = await apiService.post('/product/create', data);
      if (response.success) {
        showToast('Tạo sản phẩm thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async updateProduct(id, data) {
    try {
      const response = await apiService.patch(`/product/${id}`, data);
      if (response.success) {
        showToast('Cập nhật sản phẩm thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await apiService.delete(`/product/${id}`);
      if (response.success) {
        showToast('Xóa sản phẩm thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },
};

// ============================================
// CART API
// ============================================
const CartAPI = {
  async addToCart(productId, quantity = 1) {
    try {
      const response = await apiService.post('/cart', { productId, quantity });

      if (response.success) {
        showToast('Đã thêm vào giỏ hàng!', 'success');
        this.updateCartBadge();
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async updateCartItem(cartItemId, quantity) {
    try {
      const response = await apiService.patch(`/cart/${cartItemId}`, { quantity });

      if (response.success) {
        showToast('Cập nhật thành công!', 'success');
        this.updateCartBadge();
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async removeCartItem(cartItemId) {
    try {
      const response = await apiService.delete(`/cart/${cartItemId}`);
      if (response.success) {
        showToast('Đã xóa khỏi giỏ hàng!', 'success');
        this.updateCartBadge();
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async clearCart() {
    try {
      const response = await apiService.delete('/cart');
      if (response.success) {
        showToast('Đã xóa toàn bộ giỏ hàng!', 'success');
        this.updateCartBadge();
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async getCart() {
    const params = { page: 1, limit: 100 };
    return await apiService.get('/cart/pagination', params);
  },

  async updateCartBadge() {
    try {
      if (!AuthAPI.isLoggedIn()) {
        const badges = document.querySelectorAll('.cart-count-badge');
        badges.forEach(badge => {
          badge.style.display = 'none';
        });
        return;
      }

      const response = await this.getCart();
      if (response.success && response.data && response.data.data) {
        const totalItems = response.data.data.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const badges = document.querySelectorAll('.cart-count-badge');
        badges.forEach(badge => {
          badge.textContent = totalItems;
          badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
      }
    } catch (error) {
      console.error('Update cart badge error:', error);
      const badges = document.querySelectorAll('.cart-count-badge');
      badges.forEach(badge => {
        badge.style.display = 'none';
      });
    }
  },
};

// ============================================
// CATEGORY API
// ============================================
const CategoryAPI = {
  async getCategories() {
    return await apiService.get('/category', {}, true);
  },

  async getCategoryById(id) {
    return await apiService.get(`/category/${id}`, {}, true);
  },
};

// ============================================
// ORDER API
// ============================================
const OrderAPI = {
  async checkout() {
    try {
      const response = await apiService.post('/order/checkout-from-cart');
      if (response.success) {
        showToast('Đặt hàng thành công!', 'success');
        CartAPI.updateCartBadge();
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async getOrders(options = {}) {
    const params = {
      page: Math.floor((options.skip || 0) / (options.take || 10)) + 1,
      limit: options.take || 10,
    };
    return await apiService.get('/order/pagination', params);
  },

  async getOrderDetail(orderId) {
    return await apiService.get(`/order/${orderId}`);
  },

  async deleteOrder(orderId) {
    try {
      const response = await apiService.delete(`/order/${orderId}`);
      if (response.success) {
        showToast('Xóa đơn hàng thành công!', 'success');
      }
      return response;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function showToast(message, type = 'success') {
  const colors = {
    success: 'linear-gradient(to right, #00b09b, #96c93d)',
    error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
    warning: 'linear-gradient(to right, #f7b733, #fc4a1a)',
    info: 'linear-gradient(to right, #4facfe, #00f2fe)',
  };

  if (typeof Toastify !== 'undefined') {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      stopOnFocus: true,
      style: {
        background: colors[type] || colors.success,
      },
    }).showToast();
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

function showLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'flex';
}

function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'none';
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

console.log('✅ API Service with Fallback Token loaded successfully!');