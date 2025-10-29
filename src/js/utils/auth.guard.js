// src/js/utils/auth.guard.js

(function () {
  const AuthGuard = {
    /**
     * Check if user is authenticated and redirect to login if not
     */
    requireAuth() {
      if (!window.Storage?.isAuthenticated?.()) {
        window.Toast?.warn?.('Vui lòng đăng nhập để tiếp tục');
        setTimeout(() => {
          window.location.href = '/src/pages/auth/login.html';
        }, 1000);
        return false;
      }
      return true;
    },

    /**
     * Check if user is admin and redirect if not
     */
    requireAdmin() {
      if (!this.requireAuth()) return false;

      if (!window.Storage?.isAdmin?.()) {
        window.Toast?.error?.('Bạn không có quyền truy cập trang này');
        setTimeout(() => {
          window.location.href = '/src/index.html';
        }, 1000);
        return false;
      }
      return true;
    },

    /**
     * Check if user is client/regular user
     */
    requireClient() {
      if (!this.requireAuth()) return false;

      if (!window.Storage?.isClient?.()) {
        window.Toast?.warn?.('Trang này chỉ dành cho người dùng thường');
        setTimeout(() => {
          window.location.href = '/src/pages/admin/dashboard.html';
        }, 1000);
        return false;
      }
      return true;
    },

    /**
     * Redirect based on role after login
     */
    redirectByRole() {
      if (!window.Storage?.isAuthenticated?.()) {
        window.location.href = '/src/pages/auth/login.html';
        return;
      }

      if (window.Storage?.isAdmin?.()) {
        window.location.href = '/src/pages/admin/dashboard.html';
      } else {
        window.location.href = '/src/index.html';
      }
    },

    /**
     * Get user role display name
     */
    getRoleDisplayName() {
      const role = window.Storage?.getUserRole?.();
      const roleMap = {
        'ADMIN': 'Quản trị viên',
        'admin': 'Quản trị viên',
        'CLIENT': 'Khách hàng',
        'client': 'Khách hàng',
        'USER': 'Người dùng',
        'user': 'Người dùng',
      };
      return roleMap[role] || role || 'Không xác định';
    },
  };

  window.AuthGuard = AuthGuard;
})();
