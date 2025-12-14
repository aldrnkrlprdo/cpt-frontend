import { getToken } from "./token.service";

const parseTokenPayload = (token?: string | null) => {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null; // A JWT has 3 parts
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error("Failed to parse token:", error);
        return null;
    }
};

export const authService = {
    getUserRole: (): 'admin' | 'user' | null => {
        const token = getToken();
        const payload = parseTokenPayload(token);
        // Assuming the role is stored in a 'role' claim in the JWT payload
        return payload?.role || null;
    },

    isAdmin: (): boolean => {
        return authService.getUserRole() === 'admin';
    }
};
