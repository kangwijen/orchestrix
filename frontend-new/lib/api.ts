import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = `${process.env.NEXT_PUBLIC_FLASK_PROTOCOL}://${process.env.NEXT_PUBLIC_FLASK_HOST}:${process.env.NEXT_PUBLIC_FLASK_PORT}`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/api/login', { username, password });
      const { access_token } = response.data;

      Cookies.set('token', access_token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      window.location.href = '/login';
    }
  },
};

export default api;
