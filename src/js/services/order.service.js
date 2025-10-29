// src/js/services/order.service.js

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

  const OrderService = {
    /**
     * Checkout from cart - Create order from current user's cart
     * POST /api/v1/order/checkout-from-cart
     */
    async checkoutFromCart() {
      const result = await window.HttpClient.request(window.API.ORDER.CHECKOUT_FROM_CART, {
        method: 'POST',
        body: {},
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tạo đơn hàng');
      }

      return result.data;
    },

    /**
     * List my orders with pagination
     * GET /api/v1/order/pagination
     * @param {Object} params - { page, limit, search }
     */
    async list(params = {}) {
      const url = window.API.ORDER.GET_LIST + serializeQuery(params);

      const result = await window.HttpClient.request(url, {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải danh sách đơn hàng');
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
     * Get order detail by ID
     * GET /api/v1/order/:orderId
     * @param {string} orderId - Order ID
     */
    async getDetail(orderId) {
      const result = await window.HttpClient.request(window.API.ORDER.GET_DETAIL(orderId), {
        method: 'GET',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tải chi tiết đơn hàng');
      }

      return result.data;
    },

    /**
     * Delete order (soft delete)
     * DELETE /api/v1/order/:orderId
     * @param {string} orderId - Order ID
     */
    async delete(orderId) {
      const result = await window.HttpClient.request(window.API.ORDER.DELETE(orderId), {
        method: 'DELETE',
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể xóa đơn hàng');
      }

      return result.data;
    },
  };

  window.OrderService = OrderService;
})();
