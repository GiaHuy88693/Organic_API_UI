// src/js/services/role.service.js

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

  const RoleService = {
    /**
     * Create new role
     * @param {Object} payload - { name, description?, slug, isActive? }
     */
    async create(payload) {
      const result = await window.HttpClient.request(window.API.ROLE.CREATE, {
        method: 'POST',
        body: payload,
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tạo vai trò');
      }

      return result.data;
    },

    /**
     * Update role
     * @param {string} roleId
     * @param {Object} payload - { name?, description?, slug?, isActive? }
     */
    async update(roleId, payload) {
      const result = await window.HttpClient.request(window.API.ROLE.UPDATE(roleId), {
        method: 'PATCH',
        body: payload,
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể cập nhật vai trò');
      }

      return result.data;
    },

    /**
     * Delete role (soft delete)
     * @param {string} roleId
     */
    async delete(roleId) {
      const result = await window.HttpClient.request(window.API.ROLE.DELETE(roleId), {
        method: 'DELETE',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể xóa vai trò');
      }

      return result.data;
    },

    /**
     * Restore role
     * @param {string} roleId
     */
    async restore(roleId) {
      const result = await window.HttpClient.request(window.API.ROLE.RESTORE(roleId), {
        method: 'PATCH',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể khôi phục vai trò');
      }

      return result.data;
    },

    /**
     * Get list of roles
     * @param {Object} query - { skip?, take? }
     */
    async list(query = {}) {
      const url = window.API.ROLE.GET_LIST + serializeQuery(query);

      const result = await window.HttpClient.request(url, {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải danh sách vai trò');
      }

      // Backend returns array directly
      const items = Array.isArray(result.data) ? result.data : [];
      return { items };
    },

    /**
     * Get role by ID
     * @param {string} roleId
     */
    async getById(roleId) {
      const result = await window.HttpClient.request(window.API.ROLE.GET_BY_ID(roleId), {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải thông tin vai trò');
      }

      return result.data;
    },

    /**
     * Assign permissions to role
     * @param {string} roleId
     * @param {Array<string>} permissionIds
     */
    async assignPermissions(roleId, permissionIds) {
      const result = await window.HttpClient.request(window.API.ROLE.ASSIGN_PERMISSIONS(roleId), {
        method: 'POST',
        body: { permissionIds },
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể gán quyền');
      }

      return result.data;
    },

    /**
     * Assign role to user
     * @param {string} userId
     * @param {string} roleId
     */
    async assignUserRole(userId, roleId) {
      const result = await window.HttpClient.request(window.API.ROLE.ASSIGN_USER_ROLE(userId), {
        method: 'PUT',
        body: { roleId },
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể gán vai trò cho người dùng');
      }

      return result.data;
    },
  };

  window.RoleService = RoleService;
})();
