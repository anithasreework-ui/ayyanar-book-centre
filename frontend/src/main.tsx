import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

const BASE_URL = 'https://ayyanar-book-centre-1.onrender.com';

// Check token every 6 days — refresh before expire
const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (!token || !refreshToken) return;

  try {
    // Decode token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const timeLeft = expiryTime - now;

    // If less than 1 day left — refresh!
    if (timeLeft < 86400000) {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'refresh_token',
        response.data.refresh_token
      );
    }
  } catch {
    // Silently fail — user can still use the app
  }
};

// Check on app start
checkAndRefreshToken();

// Check every 6 hours
setInterval(checkAndRefreshToken, 6 * 60 * 60 * 1000);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
