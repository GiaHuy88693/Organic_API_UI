// src/js/services/cart.service.js

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

	const CartService = {
		async get() {
			// Use list endpoint without pagination to get all cart items
			const result = await window.HttpClient.request(window.API.CART.GET_LIST, {
				method: 'GET',
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể tải giỏ hàng');
			}

			// Backend returns: { data: [], pagination: {...} }
			const payload = result.data;
			const items = Array.isArray(payload?.data) 
				? payload.data 
				: Array.isArray(payload) 
					? payload 
					: [];

			// Calculate total
			let total = 0;
			items.forEach(item => {
				total += (item.price || 0) * (item.quantity || 0);
			});

			return { items, total };
		},

		async add(payload) {
			const result = await window.HttpClient.request(window.API.CART.ADD, {
				method: 'POST',
				body: payload,
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể thêm sản phẩm vào giỏ');
			}

			return result.data;
		},

		async update(cartItemId, payload) {
			const result = await window.HttpClient.request(window.API.CART.UPDATE(cartItemId), {
				method: 'PATCH',
				body: payload,
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể cập nhật giỏ hàng');
			}

			return result.data;
		},

		async remove(cartItemId) {
			const result = await window.HttpClient.request(window.API.CART.REMOVE(cartItemId), {
				method: 'DELETE',
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể xóa sản phẩm khỏi giỏ');
			}

			return result.data;
		},

		async clear() {
			const result = await window.HttpClient.request(window.API.CART.CLEAR, {
				method: 'DELETE',
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể xóa toàn bộ giỏ hàng');
			}

			return result.data;
		},

		async list(query = {}) {
			const url = window.API.CART.GET_LIST + serializeQuery(query);

			const result = await window.HttpClient.request(url, {
				method: 'GET',
				withAuth: true,
			});

			if (!result.ok) {
				throw new Error(normalizeMessage(result.message) || 'Không thể tải giỏ hàng');
			}

			// Backend returns: { data: [], pagination: {...} }
			const payload = result.data;
			const items = Array.isArray(payload?.data) 
				? payload.data 
				: Array.isArray(payload) 
					? payload 
					: [];

			const meta = payload?.pagination || payload?.meta || null;

			return { items, meta };
		},
	};

	window.CartService = CartService;
})();
