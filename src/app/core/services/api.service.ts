import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BASE_API_URL}`;

let api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const setupAxios = () => {
  api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // Add request interceptor to inject auth token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (err) => Promise.reject(err));
};

setupAxios(); // Initial setup

export { api };