// src/js/services/category.service.js

(function () {
  function normalizeMessage(message) {
    if (!message) return '';

    if (Array.isArray(message)) {
      return message
        .map((item) =>
          typeof item === 'object' && item !== null
            ? item.message || JSON.stringify(item)
            : String(item)
        )
        .join(', ');
    }

    if (typeof message === 'object') {
      return message.message || JSON.stringify(message);
    }

    return String(message);
  }

  function serializeQuery(params = {}) {
    const prepared = Object.entries(params).reduce((acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      acc[key] = typeof value === 'string' ? value : String(value);
      return acc;
    }, {});

    const qs = new URLSearchParams(prepared).toString();
    return qs ? `?${qs}` : '';
  }

  const CategoryService = {
    /**
     * Create new category
     * @param {Object} payload - { name, description?, image? }
     */
    async create(payload) {
      const result = await window.HttpClient.request(window.API.CATEGORY.CREATE, {
        method: 'POST',
        body: payload,
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tạo danh mục');
      }

      return result.data;
    },

    /**
     * Update category
     * @param {string} categoryId
     * @param {Object} payload - { name?, description?, image? }
     */
    async update(categoryId, payload) {
      const result = await window.HttpClient.request(window.API.CATEGORY.UPDATE(categoryId), {
        method: 'PATCH',
        body: payload,
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể cập nhật danh mục');
      }

      return result.data;
    },

    /**
     * Delete category (soft delete)
     * @param {string} categoryId
     */
    async delete(categoryId) {
      const result = await window.HttpClient.request(window.API.CATEGORY.DELETE(categoryId), {
        method: 'DELETE',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể xóa danh mục');
      }

      return result.data;
    },

    /**
     * Get paginated list of categories
     * @param {Object} query - { page?, limit?, includeDeleted?, search? }
     */
    async list(query = {}) {
      const url = window.API.CATEGORY.GET_LIST + serializeQuery(query);

      const result = await window.HttpClient.request(url, {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải danh sách danh mục');
      }

      // Backend returns: { data: [...], pagination: {...} }
      const payload = result.data;
      const items = Array.isArray(payload?.data) 
        ? payload.data 
        : Array.isArray(payload) 
          ? payload 
          : [];

      const pagination = payload?.pagination || payload?.meta || null;

      return { items, pagination };
    },

    /**
     * Get category by ID
     * @param {string} categoryId
     */
    async getById(categoryId) {
      const result = await window.HttpClient.request(window.API.CATEGORY.GET_BY_ID(categoryId), {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải thông tin danh mục');
      }

      return result.data;
    },

    /**
     * Get all categories (non-paginated)
     */
    async getAll() {
      const result = await window.HttpClient.request(window.API.CATEGORY.GET_ALL, {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải danh sách danh mục');
      }

      // Backend might return { data: [...] } or just [...]
      const payload = result.data;
      return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    },
  };

  window.CategoryService = CategoryService;
})();
