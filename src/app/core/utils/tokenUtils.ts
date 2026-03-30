export const validateToken = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < expiration;
    } catch {
        return false;
    }
};

export const getTokenPayload = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export const parseTokenPayload = (token: string | undefined): any | null => {
  if (!token) {
    return null;
  }
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse token payload:', error);
    return null;
  }
};