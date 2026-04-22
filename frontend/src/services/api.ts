import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ayyanar-book-centre-1.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token auto-add
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auto logout on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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