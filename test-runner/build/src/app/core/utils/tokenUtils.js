"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPayload = exports.validateToken = void 0;
const validateToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < expiration;
    }
    catch {
        return false;
    }
};
exports.validateToken = validateToken;
const getTokenPayload = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    }
    catch {
        return null;
    }
};
exports.getTokenPayload = getTokenPayload;
