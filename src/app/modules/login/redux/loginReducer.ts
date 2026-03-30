import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken?: string;
  userId?: string;
  fullName?: string;
  loggedIn: boolean;
  role?: 'admin' | 'user';
}

const initialState: AuthState = {
  accessToken: undefined,
  userId: undefined,
  fullName: undefined,
  loggedIn: false,
  role: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
      state.loggedIn = true;
      state.role = action.payload.role;
    },
    logout(state) {
      state.accessToken = undefined;
      state.userId = undefined;
      state.fullName = undefined;
      state.loggedIn = false;
      state.role = undefined;
    },
    reauthenticate(state, action: PayloadAction<AuthState>) {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
      state.loggedIn = true;
      state.role = action.payload.role;
    },
  },
});

export const { login, logout, reauthenticate } = authSlice.actions;
export default authSlice.reducer;