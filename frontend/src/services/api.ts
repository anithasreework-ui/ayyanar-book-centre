import axios from 'axios';

// Backend URL
const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Token automatic-ஆ header-ல போகும்
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products
export const getProducts = (category?: string) =>
  API.get('/products/', { params: { category } });

export const getProductById = (id: number) =>
  API.get(`/products/${id}`);

export const searchProducts = (keyword: string) =>
  API.get(`/products/search/${keyword}`);

// Auth
export const registerUser = (data: object) =>
  API.post('/auth/register', data);

export const loginUser = (data: object) =>
  API.post('/auth/login', data);

// Chatbot
export const chatWithBot = (message: string, language: string) =>
  API.post('/ai/chat', { message, language });

// Recommendations
export const getRecommendations = (productId: number) =>
  API.get(`/ai/recommend/${productId}`);