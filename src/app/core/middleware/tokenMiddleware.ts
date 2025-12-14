import { toast } from 'react-toastify';
import { Middleware } from 'redux';
import { getToken } from '../services/token.service';
export const tokenMiddleware: Middleware = _store => next => action => {
    const token = typeof window !== 'undefined' ? getToken() : null;

    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length < 2) throw new Error('Invalid token format');

            const payload = JSON.parse(atob(parts[1]));
            const expiration = payload.exp * 1000; // Convert to milliseconds

            if (Date.now() >= expiration) {
                localStorage.removeItem('persist:auth');
                if (typeof window !== 'undefined') window.location.href = '/login';
                toast.error('Session expired. Please login again.');
                return;
            }
        } catch (error) {
            localStorage.removeItem('persist:auth');
            if (typeof window !== 'undefined') window.location.href = '/login';
            toast.error('Invalid token. Please login again.');
            return;
        }
    }

    return next(action);
};
