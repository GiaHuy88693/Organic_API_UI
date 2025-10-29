// src/js/services/wishlist.service.js
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

  const WishlistService = {
    /**
     * Toggle wishlist for a product (add/remove)
     * POST /api/v1/wishlist/:productId/toggle
     */
    async toggle(productId) {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      if (!token) throw new Error("Chưa đăng nhập");

      const res = await fetch(window.API.WISHLIST.TOGGLE(productId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(normalizeMessage(json.message) || "Không thể thay đổi wishlist");

      return json.data || json;
    },

    /**
     * List my wishlist (the API uses userId from token automatically)
     * GET /api/v1/wishlist
     */
    async list(params = {}) {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      if (!token) throw new Error("Chưa đăng nhập");

      const url = window.API.WISHLIST.GET_LIST + serializeQuery(params);
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(normalizeMessage(json.message) || "Không thể tải wishlist");

      // backend NestJS trả dạng { data: { data: [...] } } hoặc { data: [...] }
      const payload = json?.data?.data || json?.data || json;
      const items = Array.isArray(payload) ? payload : [];
      const pagination = json?.data?.pagination || json?.pagination || null;

      return { items, pagination };
    },

    /**
     * Kiểm tra 1 sản phẩm có trong wishlist của user hiện tại không
     */
    async isInWishlist(productId) {
      try {
        const response = await this.list({ limit: 200 });
        const items = response.items || [];
        return items.some(
          (item) =>
            (item.product?._id || item.product?.id || item.productId) === productId
        );
      } catch (error) {
        console.error("Error checking wishlist:", error);
        return false;
      }
    },
  };

  window.WishlistService = WishlistService;
})();
