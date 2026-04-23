import axios from 'axios';

const BASE_URL = 'https://ayyanar-book-centre-1.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ===== TOKEN HELPERS =====
const getToken = () => localStorage.getItem('token');
const getRefreshToken = () =>
  localStorage.getItem('refresh_token');

const saveTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refresh_token', refreshToken);
};

// Token refresh function
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    );
    const { token, refresh_token } = response.data;
    saveTokens(token, refresh_token);

    // User info update
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );
    user.name = response.data.name;
    user.role = response.data.role;
    localStorage.setItem('user', JSON.stringify(user));

    return token;
  } catch (error) {
    // Refresh failed — only now clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    return null;
  }
};

// ===== REQUEST INTERCEPTOR =====
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR — Auto Refresh! =====
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 error + not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Skip refresh for login/register/refresh endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization =
            `Bearer ${token}`;
          return API(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Token refreshed! Retry original request
          processQueue(null, newToken);
          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;
          return API(originalRequest);
        } else {
          // No refresh token — redirect to login
          processQueue(error, null);
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===== API FUNCTIONS =====
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