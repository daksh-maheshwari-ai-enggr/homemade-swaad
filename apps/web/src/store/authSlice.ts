import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@food-delivery/types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Restore the session from localStorage so a refresh keeps you logged in. */
function loadPersistedSession(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

    if (token && user) {
      return { user, token, isAuthenticated: true };
    }
  } catch {
    // Corrupt storage: fall through to a clean state.
  }
  return { user: null, token: null, isAuthenticated: false };
}

function persist(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); the session is still valid in memory.
  }
}

const initialState: AuthState = loadPersistedSession();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      persist(action.payload.token, action.payload.user);
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      persist(state.token, action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      persist(null, null);
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
