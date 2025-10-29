// src/js/services/product.service.js

(function () {
  const ProductService = {
    /**
     * Tạo sản phẩm mới
     * POST /api/product/create
     * @param {Object} data - { name, description, price, categoryId, stock, images, ... }
     */
    async create(data) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.CREATE,
        {
          method: 'POST',
          body: data,
          withAuth: true,
        }
      );

      if (!result.ok) {
        // Chuẩn hóa lỗi validation (422)
        if (result.status === 422 && result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
        }
        throw new Error(result.message || 'Không thể tạo sản phẩm');
      }

      return result.data;
    },

    /**
     * Cập nhật sản phẩm
     * PATCH /api/product/:productId
     * @param {string} productId - ID sản phẩm
     * @param {Object} data - Dữ liệu cần update
     */
    async update(productId, data) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.UPDATE(productId),
        {
          method: 'PATCH',
          body: data,
          withAuth: true,
        }
      );

      if (!result.ok) {
        if (result.status === 422 && result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
        }
        throw new Error(result.message || 'Không thể cập nhật sản phẩm');
      }

      return result.data;
    },

    /**
     * Xóa sản phẩm (soft delete)
     * DELETE /api/product/:productId
     * @param {string} productId - ID sản phẩm
     */
    async delete(productId) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.DELETE(productId),
        {
          method: 'DELETE',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể xóa sản phẩm');
      }

      return result.data;
    },

    /**
     * Lấy danh sách sản phẩm (có phân trang)
     * GET /api/product/pagination
     * @param {Object} params - { page, limit, search, includeDeleted }
     * @returns {Promise<{ items: Array, pagination: Object }>}
     */
    async list(params = {}) {
      // Build query params
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 10);
      
      // Search must be at least 2 characters or don't send it
      const searchTerm = (params.search || '').trim();
      if (searchTerm.length >= 2) {
        queryParams.append('search', searchTerm);
      }
      
      // Ensure includeDeleted is sent as proper boolean string
      queryParams.append('includeDeleted', params.includeDeleted === true ? 'true' : 'false');
      
      const queryString = queryParams.toString();
      const url = window.API.PRODUCT.GET_LIST + '?' + queryString;

      console.log('Product list URL:', url);
      console.log('Query string:', queryString);

      const result = await window.HttpClient.request(url, {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        console.error('Product list error:', result);
        
        if (result.status === 401) {
          window.Toast?.error?.('Vui lòng đăng nhập để xem sản phẩm');
          setTimeout(() => {
            window.location.href = '/src/pages/auth/login.html';
          }, 1500);
          throw new Error('Unauthorized');
        }

        // Parse validation errors if available
        if (result.status === 422) {
          let errorMsg = 'Dữ liệu không hợp lệ';
          
          if (result.data?.message) {
            if (Array.isArray(result.data.message)) {
              errorMsg = result.data.message.map(err => {
                if (typeof err === 'object' && err !== null) {
                  return `${err.path?.join?.('.') || 'field'}: ${err.message || JSON.stringify(err)}`;
                }
                return String(err);
              }).join(', ');
            } else {
              errorMsg = result.data.message;
            }
          }
          
          console.error('Validation error:', errorMsg);
          throw new Error(errorMsg);
        }

        throw new Error(result.message || 'Không thể tải danh sách sản phẩm');
      }

      // Backend returns: { data: [...], pagination: {...} }
      const payload = result.data;
      
      return {
        items: payload?.data || [],
        pagination: payload?.pagination || null,
      };
    },

    /**
     * Lấy chi tiết sản phẩm
     * GET /api/product/:productId
     * @param {string} productId - ID sản phẩm
     */
    async getById(productId) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.GET_BY_ID(productId),
        {
          method: 'GET',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể tải chi tiết sản phẩm');
      }

      return result.data;
    },

    /**
     * Lấy tất cả sản phẩm (không phân trang)
     * GET /api/product
     */
    async getAll() {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.GET_ALL,
        {
          method: 'GET',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể tải danh sách sản phẩm');
      }

      // Backend returns { data: [...] }
      return result.data?.data || result.data || [];
    },

    /**
     * Upload ảnh sản phẩm
     * POST /api/product/:productId/images
     * @param {string} productId - ID sản phẩm
     * @param {File[]|File} files - File hoặc mảng file
     */
    async uploadImages(productId, files) {
      const formData = new FormData();

      // Thêm file vào FormData với key "images"
      if (Array.isArray(files)) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      } else {
        formData.append('images', files);
      }

      const token = window.Storage?.getAccessToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(window.API.PRODUCT.UPLOAD_IMAGES(productId), {
        method: 'POST',
        headers,
        body: formData,
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {}

      if (!res.ok) {
        throw new Error(data.message || 'Không thể upload ảnh');
      }
      
      return data.data || data;
    },

    /**
     * Lấy danh sách ảnh sản phẩm
     * GET /api/product/:productId/images
     * @param {string} productId - ID sản phẩm
     */
    async listImages(productId) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.GET_IMAGES(productId),
        {
          method: 'GET',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể tải danh sách ảnh');
      }

      return result.data?.data || result.data || [];
    },

    /**
     * Đặt ảnh chính cho sản phẩm
     * PATCH /api/product/:productId/images/:imageId/primary
     * @param {string} productId - ID sản phẩm
     * @param {string} imageId - ID ảnh
     */
    async setPrimaryImage(productId, imageId) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.SET_PRIMARY_IMAGE(productId, imageId),
        {
          method: 'PATCH',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể đặt ảnh chính');
      }

      return result.data;
    },

    /**
     * Xóa ảnh sản phẩm
     * DELETE /api/product/:productId/images/:imageId
     * @param {string} productId - ID sản phẩm
     * @param {string} imageId - ID ảnh
     */
    async deleteImage(productId, imageId) {
      const result = await window.HttpClient.request(
        window.API.PRODUCT.DELETE_IMAGE(productId, imageId),
        {
          method: 'DELETE',
          withAuth: true,
        }
      );

      if (!result.ok) {
        throw new Error(result.message || 'Không thể xóa ảnh');
      }

      return result.data;
    },
  };

  window.ProductService = ProductService;
})();
