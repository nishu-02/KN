import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AppwriteService from '../../../appwrite/service';

interface User {
  $id: string;
  name: string;
  email: string;
}

interface AuthState {
  initialized: boolean;
  authenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  initialized: false,
  authenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const initSession = createAsyncThunk('auth/initSession', async (_, thunkAPI) => {
  try {
    const user = await AppwriteService.getCurrentUser();
    return user;
  } catch (err: any) {
    throw err.message || 'Session check failed';
  }
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const session = await AppwriteService.login({ email, password });

      const user = await AppwriteService.getCurrentUser();

      //  Optionally handle JWT from session if needed (DRF)
      // const jwt = session?.jwt; // if DRF or custom login returns token
      // thunkAPI.dispatch(setToken(jwt));

      return user;
    } catch (err: any) {
      throw err.message || 'Login failed';
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await AppwriteService.logout();
    return;
  } catch (err: any) {
    throw err.message || 'Logout failed';
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.authenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // INIT SESSION
      .addCase(initSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(initSession.fulfilled, (state, action) => {
        state.initialized = true;
        state.authenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(initSession.rejected, (state) => {
        state.initialized = true;
        state.authenticated = false;
        state.user = null;
        state.loading = false;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Login error';
        state.loading = false;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.authenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { resetError, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
