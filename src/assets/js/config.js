const CONFIG = {
  // ⭐ QUAN TRỌNG: Đổi URL này khi deploy
  API_BASE_URL: 'http://localhost:8080',
  API_PREFIX: '/api/v1',
  
  getFullUrl(endpoint) {
    return `${this.API_BASE_URL}${this.API_PREFIX}${endpoint}`;
  },

  STORAGE: {
    ACCESS_TOKEN: 'organic_access_token',
    REFRESH_TOKEN: 'organic_refresh_token',
    USER_INFO: 'organic_user_info',
  },

  PAGINATION: {
    DEFAULT_SKIP: 0,
    DEFAULT_TAKE: 12,
  },
};