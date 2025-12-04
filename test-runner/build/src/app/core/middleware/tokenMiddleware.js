"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenMiddleware = void 0;
const react_toastify_1 = require("react-toastify");
const tokenMiddleware = _store => next => action => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length < 2)
                throw new Error('Invalid token format');
            const payload = JSON.parse(atob(parts[1]));
            const expiration = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() >= expiration) {
                localStorage.removeItem('token');
                if (typeof window !== 'undefined')
                    window.location.href = '/login';
                react_toastify_1.toast.error('Session expired. Please login again.');
                return;
            }
        }
        catch (error) {
            localStorage.removeItem('token');
            if (typeof window !== 'undefined')
                window.location.href = '/login';
            react_toastify_1.toast.error('Invalid token. Please login again.');
            return;
        }
    }
    return next(action);
};
exports.tokenMiddleware = tokenMiddleware;
