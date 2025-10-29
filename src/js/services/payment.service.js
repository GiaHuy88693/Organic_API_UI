// src/js/services/payment.service.js

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

  const PaymentService = {
    /**
     * Create MoMo payment
     * POST /api/v1/payments/momo/create
     * @param {number} amount - Payment amount
     * @param {string} orderInfo - Order information/description
     * @returns {Promise<Object>} - { payUrl, qrCodeUrl, deeplink, deeplinkMiniApp }
     */
    async createMoMoPayment(amount, orderInfo = '') {
      const result = await window.HttpClient.request(window.API.PAYMENT.CREATE_MOMO, {
        method: 'POST',
        body: { amount, orderInfo },
        withAuth: true,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'Không thể tạo thanh toán MoMo');
      }

      return result.data;
    },

    /**
     * Handle MoMo IPN (Instant Payment Notification)
     * This is typically called by MoMo server, not directly from frontend
     * POST /api/v1/payments/momo/ipn
     * @param {Object} ipnData - IPN data from MoMo
     */
    async handleMoMoIPN(ipnData) {
      const result = await window.HttpClient.request(window.API.PAYMENT.IPN, {
        method: 'POST',
        body: ipnData,
        withAuth: false,
      });

      if (!result.ok) {
        throw new Error(normalizeMessage(result.message) || 'IPN processing failed');
      }

      return result.data;
    },

    /**
     * Parse return URL query params from MoMo
     * This helper function parses the query string when user returns from MoMo payment
     * @returns {Object} - { orderId, requestId, resultCode, message, signature, ... }
     */
    parseReturnUrl() {
      const params = new URLSearchParams(window.location.search);
      return {
        orderId: params.get('orderId'),
        requestId: params.get('requestId'),
        resultCode: params.get('resultCode'),
        message: params.get('message'),
        signature: params.get('signature'),
        payType: params.get('payType'),
        transId: params.get('transId'),
      };
    },

    /**
     * Check if payment was successful from return URL
     * @returns {boolean}
     */
    isPaymentSuccessful() {
      const params = this.parseReturnUrl();
      return params.resultCode === '0';
    },

    /**
     * Redirect to MoMo payment page
     * @param {string} payUrl - Payment URL from createMoMoPayment
     */
    redirectToMoMo(payUrl) {
      if (!payUrl) {
        throw new Error('Payment URL is required');
      }
      window.location.href = payUrl;
    },

    /**
     * Open MoMo payment in new window/tab
     * @param {string} payUrl - Payment URL from createMoMoPayment
     * @param {string} windowName - Name for the window
     * @param {string} windowFeatures - Window features
     */
    openMoMoWindow(payUrl, windowName = 'MoMoPayment', windowFeatures = 'width=600,height=800') {
      if (!payUrl) {
        throw new Error('Payment URL is required');
      }
      return window.open(payUrl, windowName, windowFeatures);
    },
  };

  window.PaymentService = PaymentService;
})();
