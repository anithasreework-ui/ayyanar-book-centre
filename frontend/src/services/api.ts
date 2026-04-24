import axios from 'axios';

const BASE_URL = 'https://ayyanar-book-centre-1.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (
  error: any,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

const tryRefresh = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    const { token, refresh_token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refresh_token);
    return token;
  } catch {
    // Refresh failed — clear only tokens, NOT user data
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    return null;
  }
};

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — Auto refresh, NO logout
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await tryRefresh();
      isRefreshing = false;

      if (newToken) {
        processQueue(null, newToken);
        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;
        return API(originalRequest);
      }

      processQueue(error, null);
      // No redirect — let user stay on page
    }

    return Promise.reject(error);
  }
);

// ===== EXPORTS =====
export const getProducts = (category?: string) =>
  API.get('/products/', { params: { category } });

export const getProductById = (id: number) =>
  API.get(`/products/${id}`);

export const searchProducts = (keyword: string) =>
  API.get(`/products/search/${encodeURIComponent(keyword)}`);

export const registerUser = (data: object) =>
  API.post('/auth/register', data);

export const loginUser = (data: object) =>
  API.post('/auth/login', data);

export const chatWithBot = (message: string, language: string) =>
  API.post('/ai/chat', { message, language });

export const getRecommendations = (productId: number) =>
  API.get(`/ai/recommend/${productId}`);

export default API;