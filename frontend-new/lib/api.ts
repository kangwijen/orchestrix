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

export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActivities: async () => {
    try {
      const response = await api.get('/api/dashboard/activities');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const containerApi = {
  createContainer: async (containerData: {
    name?: string;
    image: string;
    ports?: Record<string, string>;
    environment?: Record<string, string>;
  }) => {
    try {
      const response = await api.post('/api/containers/create', containerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  listContainers: async () => {
    try {
      const response = await api.get('/api/containers/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  buildFromDockerfile: async (file: File, containerName?: string, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('dockerfile', file);
      if (containerName) {
        formData.append('name', containerName);
      }
      
      const response = await api.post('/api/containers/build/dockerfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buildFromZip: async (file: File, containerName?: string, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('zipfile', file);
      if (containerName) {
        formData.append('name', containerName);
      }
      
      const response = await api.post('/api/containers/build/zip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const networkApi = {
  createNetwork: async (networkData: {
    name: string;
    driver: string;
  }) => {
    try {
      const response = await api.post('/api/networks/create', networkData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  listNetworks: async () => {
    try {
      const response = await api.get('/api/networks/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeNetwork: async (networkId: string, password: string) => {
    try {
      const response = await api.delete(`/api/networks/remove/${networkId}`, {
        data: { password },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  connectContainer: async (networkId: string, containerId: string) => {
    try {
      const response = await api.post(`/api/networks/connect`, {
        networkId,
        containerId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  disconnectContainer: async (networkId: string, containerId: string) => {
    try {
      const response = await api.post(`/api/networks/disconnect`, {
        networkId,
        containerId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
