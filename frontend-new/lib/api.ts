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

  getProfile: async () => {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData: { email?: string }) => {
    try {
      const response = await api.put('/api/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
  }) => {
    try {
      const response = await api.post('/api/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
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

  buildFromDockerfile: async (
    file: File,
    containerName?: string,
    onProgress?: (progress: number) => void,
  ) => {
    try {
      const formData = new FormData();
      formData.append('dockerfile', file);
      if (containerName) {
        formData.append('name', containerName);
      }

      const response = await api.post(
        '/api/containers/build/dockerfile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(progress);
            }
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buildFromZip: async (
    file: File,
    containerName?: string,
    onProgress?: (progress: number) => void,
  ) => {
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
        onUploadProgress: progressEvent => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buildFromCompose: async (
    file: File,
    onProgress?: (progress: number) => void,
  ) => {
    try {
      const formData = new FormData();
      formData.append('composefile', file);

      const response = await api.post(
        '/api/containers/build/compose',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(progress);
            }
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  pauseContainer: async (containerId: string) => {
    try {
      const response = await api.post(`/api/containers/pause/${containerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unpauseContainer: async (containerId: string) => {
    try {
      const response = await api.post(`/api/containers/unpause/${containerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  inspectContainer: async (containerId: string) => {
    try {
      const response = await api.get(`/api/containers/inspect/${containerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getContainerStats: async (containerId: string) => {
    try {
      const response = await api.get(`/api/containers/stats/${containerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const networkApi = {
  createNetwork: async (networkData: { name: string; driver: string }) => {
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

  inspectNetwork: async (networkId: string) => {
    try {
      const response = await api.get(`/api/networks/inspect/${networkId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNetworkContainers: async (networkId: string) => {
    try {
      const response = await api.get(`/api/networks/containers/${networkId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const volumeApi = {
  listVolumes: async () => {
    try {
      const response = await api.get('/api/volumes/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createVolume: async (volumeData: {
    name?: string;
    driver?: string;
    options?: Record<string, string>;
    labels?: Record<string, string>;
  }) => {
    try {
      const response = await api.post('/api/volumes/create', volumeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeVolume: async (
    volumeName: string,
    data: { password: string; force?: boolean },
  ) => {
    try {
      const response = await api.delete(`/api/volumes/remove/${volumeName}`, {
        data,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  inspectVolume: async (volumeName: string) => {
    try {
      const response = await api.get(`/api/volumes/inspect/${volumeName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getVolumeContainers: async (volumeName: string) => {
    try {
      const response = await api.get(
        `/api/volumes/containers/${volumeName}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
