// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken?: string;
  userId?: string;
  fullName?: string;
  loggedIn: boolean;
}

const initialState: AuthState = {
  accessToken: undefined,
  userId: undefined,
  fullName: undefined,
  loggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState>) => {
      return { ...action.payload, loggedIn: true };
    },
    logout: () => initialState,
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
