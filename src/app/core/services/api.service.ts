import axios from 'axios';
import { getToken } from './token.service';

const API_BASE_URL = `${process.env.REACT_APP_BASE_API_URL}`;

const controller = new AbortController();

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    signal: controller.signal,
    withCredentials: true
});

// Add request interceptor to inject auth token
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
