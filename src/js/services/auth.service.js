const AuthService = {
  /**
   * Đăng nhập
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise} Response từ API
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Xử lý lỗi từ BE
        throw {
          status: response.status,
          message: data.message || 'Đăng nhập thất bại',
          errors: data.errors || data
        };
      }

      // Lưu token vào localStorage
      if (data.accessToken && data.refreshToken) {
        Storage.setTokens(data.accessToken, data.refreshToken);
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi đăng nhập',
        errors: error.errors
      };
    }
  },

  /**
   * Đăng ký tài khoản
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise}
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Đăng ký thất bại',
          errors: data.errors || data
        };
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi đăng ký',
        errors: error.errors
      };
    }
  },

  /**
   * Gửi OTP
   * @param {string} email - Email nhận OTP
   * @param {string} type - Loại OTP (REGISTER, FORGOT_PASSWORD, etc.)
   * @returns {Promise}
   */
  async sendOTP(email, type = 'REGISTER') {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SEND_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Gửi OTP thất bại',
        };
      }

      return {
        success: true,
        message: data.message || 'OTP đã được gửi đến email của bạn'
      };

    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi gửi OTP'
      };
    }
  },

  /**
   * Đăng xuất
   * @returns {Promise}
   */
  async logout() {
    try {
      const refreshToken = Storage.getRefreshToken();
      
      if (!refreshToken) {
        // Nếu không có token, chỉ clear localStorage
        Storage.clearAll();
        return { success: true };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Storage.getAccessToken()}`
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      // Dù API có lỗi hay không, vẫn clear localStorage
      Storage.clearAll();

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn clear localStorage
      Storage.clearAll();
      return { success: true };
    }
  },

  /**
   * Lấy thông tin profile
   * @returns {Promise}
   */
  async getProfile() {
    try {
      const accessToken = Storage.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Không thể lấy thông tin profile'
        };
      }

      // Lưu thông tin user vào localStorage
      Storage.setUser(data);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy thông tin profile'
      };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise}
   */
  async refreshToken() {
    try {
      const refreshToken = Storage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Refresh token không tồn tại');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Refresh token thất bại');
      }

      // Lưu token mới
      Storage.setTokens(data.accessToken, data.refreshToken);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear token và redirect về login
      Storage.clearAll();
      window.location.href = '/src/pages/auth/login.html';
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Forgot password
   * @param {string} email 
   * @param {string} code - OTP code
   * @param {string} newPassword 
   * @returns {Promise}
   */
  async forgotPassword(email, code, newPassword) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Đổi mật khẩu thất bại'
        };
      }

      return {
        success: true,
        message: data.message
      };

    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra'
      };
    }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}