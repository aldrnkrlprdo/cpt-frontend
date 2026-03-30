
export const getToken = (): string | null => {
  const persistedState = localStorage.getItem('persist:auth');
  if (!persistedState) {
    return null;
  }

  try {
    const authState = JSON.parse(persistedState);
    // The value is a stringified JSON, so it needs to be parsed again.
    const accessToken = authState.accessToken;
    if (accessToken) {
      const token = JSON.parse(accessToken);
      return token;
    }
  } catch (error) {
    console.error('Failed to parse token from localStorage:', error);
    return null;
  }
  
  return null;
};
