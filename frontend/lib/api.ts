import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
});

// ── Axios interceptor: auto-refresh on 401 ───────────────────
//
// When a request fails with 401, we try POST /auth/refresh once.
// If refresh succeeds (new cookies are set), we retry the original
// request. If refresh also fails, the user is truly unauthenticated.
//
// A queue prevents multiple concurrent refresh attempts.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
}

function retryQueue() {
  const queue = [...failedQueue];
  failedQueue = [];
  queue.forEach(({ resolve, config }) => {
    resolve(api.request(config));
  });
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only intercept 401s, and never retry the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      // Refresh succeeded — cookies are updated. Retry queued + original.
      retryQueue();
      return api.request(originalRequest);
    } catch (refreshError) {
      // Refresh failed — user must log in again.
      processQueue(refreshError);
      // Clear user state by dispatching a custom event that AuthContext listens to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Articles ──────────────────────────────────────────────────
export const getArticles = (params?: Record<string, unknown>) =>
  api.get('/articles', { params }).then(r => r.data);

export const getFeaturedArticles = () =>
  api.get('/articles/featured').then(r => r.data);

export const getArticleBySlug = (slug: string) =>
  api.get(`/articles/${slug}`).then(r => r.data);

export const searchArticles = (q: string, page = 1) =>
  api.get('/search', { params: { q, page } }).then(r => r.data);

// ── Categories ────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/categories').then(r => r.data);

// ── Auth ──────────────────────────────────────────────────────
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data).then(r => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then(r => r.data);

export const logout = () => api.post('/auth/logout').then(r => r.data);

export const getMe = () => api.get('/auth/me').then(r => r.data);

export const refreshToken = () => api.post('/auth/refresh').then(r => r.data);

// ── Comments ──────────────────────────────────────────────────
export const getComments = (articleId: string) =>
  api.get(`/comments/${articleId}`).then(r => r.data);

export const addComment = (data: { article_id: string; content: string }) =>
  api.post('/comments', data).then(r => r.data);

export const deleteComment = (id: string) =>
  api.delete(`/comments/${id}`).then(r => r.data);

// ── Likes ─────────────────────────────────────────────────────
export const toggleLike = (articleId: string) =>
  api.post(`/likes/${articleId}`).then(r => r.data);

export const getLikeCount = (articleId: string) =>
  api.get(`/likes/${articleId}/count`).then(r => r.data);

export const checkLike = (articleId: string) =>
  api.get(`/likes/${articleId}/check`).then(r => r.data);

// ── Bookmarks ─────────────────────────────────────────────────
export const toggleBookmark = (articleId: string) =>
  api.post(`/bookmarks/${articleId}`).then(r => r.data);

export const getBookmarks = () => api.get('/bookmarks').then(r => r.data);

export const checkBookmark = (articleId: string) =>
  api.get(`/bookmarks/${articleId}/check`).then(r => r.data);

// ── Admin ─────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats').then(r => r.data);
export const getAdminArticles = (params?: Record<string, unknown>) =>
  api.get('/admin/articles', { params }).then(r => r.data);
export const createAdminArticle = (data: Record<string, unknown>) =>
  api.post('/admin/articles', data).then(r => r.data);
export const updateAdminArticle = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/articles/${id}`, data).then(r => r.data);
export const deleteAdminArticle = (id: string) =>
  api.delete(`/admin/articles/${id}`).then(r => r.data);

export const getAdminUsers = (params?: Record<string, unknown>) =>
  api.get('/admin/users', { params }).then(r => r.data);
export const toggleLockUser = (id: string) =>
  api.put(`/admin/users/${id}/lock`).then(r => r.data);
export const changeUserRole = (id: string, role: 'user' | 'admin') =>
  api.put(`/admin/users/${id}/role`, { role }).then(r => r.data);
export const deleteAdminUser = (id: string) =>
  api.delete(`/admin/users/${id}`).then(r => r.data);

export const getAdminComments = (params?: Record<string, unknown>) =>
  api.get('/admin/comments', { params }).then(r => r.data);
export const deleteAdminComment = (id: string) =>
  api.delete(`/admin/comments/${id}`).then(r => r.data);

export const getAdminCategories = () => api.get('/admin/categories').then(r => r.data);
export const createAdminCategory = (data: { name: string; description?: string }) =>
  api.post('/admin/categories', data).then(r => r.data);
export const updateAdminCategory = (id: number, data: { name?: string; description?: string }) =>
  api.put(`/admin/categories/${id}`, data).then(r => r.data);
export const deleteAdminCategory = (id: number) =>
  api.delete(`/admin/categories/${id}`).then(r => r.data);

export const syncNYT = () =>
  api.post('/admin/articles/sync-nyt').then(r => r.data);

export default api;
