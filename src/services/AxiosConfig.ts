import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const value = await localStorage.getItem('apexcare-token');
    if (value) {
      config.headers = {
        Authorization: `Bearer ${value}`,
      };
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

const API = {
  get: (method: string) => {
    return apiClient.get(method);
  },
  put(method: string, payload: any) {
    return apiClient.put(method, payload);
  },
  post(method: string, payload: any) {
    return apiClient.post(method, payload);
  },
  delete(method: string) {
    return apiClient.delete(method);
  },
};

export default API;
