// src/js/utils/storage.js
(function () {
  const KEYS = {
    ACCESS: 'access_token',
    REFRESH: 'refresh_token',
    USER: 'user_info',
  };
  const Storage = {
    setTokens({ accessToken, refreshToken }) {
      if (accessToken) localStorage.setItem(KEYS.ACCESS, accessToken);
      if (refreshToken) localStorage.setItem(KEYS.REFRESH, refreshToken);
    },
    getAccessToken() { return localStorage.getItem(KEYS.ACCESS); },
    getRefreshToken() { return localStorage.getItem(KEYS.REFRESH); },
    clearTokens() {
      localStorage.removeItem(KEYS.ACCESS);
      localStorage.removeItem(KEYS.REFRESH);
      localStorage.removeItem(KEYS.USER);
    },
    isAuthenticated() { return !!localStorage.getItem(KEYS.ACCESS); },
    setUser(user) {
      if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));
    },
    getUser() {
      const userStr = localStorage.getItem(KEYS.USER);
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        return null;
      }
    },
    
    /**
     * Decode JWT token to get payload
     */
    decodeToken(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    },
    
    /**
     * Get role from JWT token
     */
    getUserRole() {
      const token = this.getAccessToken();
      if (!token) return null;
      
      const payload = this.decodeToken(token);
      return payload?.roleName || payload?.role || null;
    },
    
    /**
     * Check if user is admin
     */
    isAdmin() {
      const role = this.getUserRole();
      return role === 'ADMIN' || role === 'admin';
    },
    
    /**
     * Check if user is regular user/client
     */
    isClient() {
      const role = this.getUserRole();
      return role === 'CLIENT' || role === 'client' || role === 'USER' || role === 'user';
    },
    
    /**
     * Get user info from token
     */
    getUserFromToken() {
      const token = this.getAccessToken();
      if (!token) return null;
      
      const payload = this.decodeToken(token);
      if (!payload) return null;
      
      return {
        userId: payload.userId,
        email: payload.email,
        roleName: payload.roleName,
        roleId: payload.roleId,
        deviceId: payload.deviceId,
      };
    },
  };
  window.Storage = Storage;
})();
