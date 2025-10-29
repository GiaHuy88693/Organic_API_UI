// src/js/services/auth.service.js
(function () {
  /**
   * Register new user
   * @param {Object} data - { email, password, fullName, phone, address }
   */
  async function register(data) {
    const result = await window.HttpClient.request(window.API.AUTH.REGISTER, {
      method: 'POST',
      body: data,
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Đăng ký thành công';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Send OTP for verification
   * @param {Object} data - { email or phone }
   */
  async function sendOTP(data) {
    const result = await window.HttpClient.request(window.API.AUTH.SEND_OTP, {
      method: 'POST',
      body: data,
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'OTP đã được gửi';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Login with email/phone and password
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    const result = await window.HttpClient.request(window.API.AUTH.LOGIN, {
      method: 'POST',
      body: { email, password },
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;

    // Nhiều backend đặt token ở các khóa khác nhau -> gom về 1 chuẩn
    const accessToken =
      payload?.accessToken || payload?.token || payload?.jwt || payload?.data?.accessToken || payload?.data?.token;
    const refreshToken =
      payload?.refreshToken || payload?.data?.refreshToken;

    // lưu token nếu có
    window.Storage.setTokens({ accessToken, refreshToken });

    // Lưu thông tin user nếu có
    const user = payload?.user || payload?.data?.user;
    if (user) {
      window.Storage.setUser(user);
    }

    // lấy message thành công (nếu có)
    const successMessage = payload?.message || payload?.data?.message || 'Đăng nhập thành công';

    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken
   */
  async function refreshToken(refreshToken) {
    const result = await window.HttpClient.request(window.API.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: { refreshToken },
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const accessToken = payload?.accessToken || payload?.data?.accessToken;
    const newRefreshToken = payload?.refreshToken || payload?.data?.refreshToken;

    if (accessToken) {
      window.Storage.setTokens({ 
        accessToken, 
        refreshToken: newRefreshToken || refreshToken 
      });
    }

    return { success: true, data: payload };
  }

  /**
   * Logout current session
   * @param {string} refreshToken
   */
  async function logout(refreshToken) {
    const result = await window.HttpClient.request(window.API.AUTH.LOGOUT, {
      method: 'POST',
      body: { refreshToken },
      withAuth: true,
    });

    window.Storage.clearTokens();

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Đăng xuất thành công';
    return { success: true, message: successMessage };
  }

  /**
   * Request password reset
   * @param {Object} data - { email }
   */
  async function forgotPassword(data) {
    const result = await window.HttpClient.request(window.API.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: data,
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Email đặt lại mật khẩu đã được gửi';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Reset password with token
   * @param {Object} data - { token, newPassword }
   */
  async function resetPassword(data) {
    const result = await window.HttpClient.request(window.API.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: data,
      withAuth: false,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Đặt lại mật khẩu thành công';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Get current user profile
   */
  async function getProfile() {
    const result = await window.HttpClient.request(window.API.AUTH.GET_PROFILE, {
      method: 'GET',
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const user = payload?.user || payload?.data?.user || payload;
    
    if (user) {
      window.Storage.setUser(user);
    }

    return { success: true, data: user };
  }

  /**
   * Update user profile
   * @param {Object} data - { fullName, phone, address, etc }
   */
  async function updateProfile(data) {
    const result = await window.HttpClient.request(window.API.AUTH.UPDATE_PROFILE, {
      method: 'PATCH',
      body: data,
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const user = payload?.user || payload?.data?.user || payload;
    
    if (user) {
      window.Storage.setUser(user);
    }

    const successMessage = payload?.message || 'Cập nhật profile thành công';
    return { success: true, message: successMessage, data: user };
  }

  /**
   * Upload avatar
   * @param {File} file - Image file
   */
  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    const result = await fetch(window.API.AUTH.UPLOAD_AVATAR, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.Storage.getAccessToken()}`,
      },
      body: formData,
    });

    const data = await result.json().catch(() => ({}));

    if (!result.ok) {
      return { 
        success: false, 
        message: data?.message || 'Không thể upload avatar' 
      };
    }

    const avatarUrl = data?.avatarUrl || data?.data?.avatarUrl;
    const successMessage = data?.message || 'Upload avatar thành công';
    return { success: true, message: successMessage, data: { avatarUrl } };
  }

  /**
   * Get all users (admin only)
   */
  async function getAllUsers() {
    const result = await window.HttpClient.request(window.API.AUTH.GET_ALL_USERS, {
      method: 'GET',
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const users = payload?.users || payload?.data?.users || payload;
    return { success: true, data: users };
  }

  /**
   * Lock user (admin only)
   * @param {string} userId
   * @param {Object} data - { reason, duration }
   */
  async function lockUser(userId, data) {
    const result = await window.HttpClient.request(window.API.AUTH.LOCK_USER(userId), {
      method: 'PUT',
      body: data,
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Khóa user thành công';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Unlock user (admin only)
   * @param {string} userId
   */
  async function unlockUser(userId) {
    const result = await window.HttpClient.request(window.API.AUTH.UNLOCK_USER(userId), {
      method: 'PUT',
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Mở khóa user thành công';
    return { success: true, message: successMessage, data: payload };
  }

  /**
   * Mark violation for user (admin only)
   * @param {string} userId
   * @param {Object} data - { type, description }
   */
  async function markViolation(userId, data) {
    const result = await window.HttpClient.request(window.API.AUTH.MARK_VIOLATION(userId), {
      method: 'POST',
      body: data,
      withAuth: true,
    });

    if (!result.ok) {
      const { message, errors } = result;
      return { success: false, message, errors };
    }

    const payload = result.data;
    const successMessage = payload?.message || 'Đánh dấu vi phạm thành công';
    return { success: true, message: successMessage, data: payload };
  }

  window.AuthService = { 
    register,
    sendOTP,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    uploadAvatar,
    getAllUsers,
    lockUser,
    unlockUser,
    markViolation,
  };
})();
