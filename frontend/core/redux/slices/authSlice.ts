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

export const initSession = createAsyncThunk(
  'auth/initSession', 
  async (_, thunkAPI) => {
    try {
      // Validate if stored session is still valid
      const isValid = await AppwriteService.validateSession();
      if (!isValid) {
        throw new Error('No valid session found');
      }
      
      const user = await AppwriteService.getCurrentUser();
      return {
        user,
        token: AppwriteService.jwtToken
      };
    } catch (err: any) {
      throw err.message || 'Session check failed';
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const user = await AppwriteService.login({ email, password });
      return {
        user,
        token: AppwriteService.jwtToken
      };
    } catch (err: any) {
      throw err.message || 'Login failed';
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout', 
  async (_, thunkAPI) => {
    try {
      await AppwriteService.logout();
      return;
    } catch (err: any) {
      // Log the error but don't fail the logout process
      console.warn('Logout API call failed, but local session cleared:', err);
      return;
    }
  }
);

export const createUserAccount = createAsyncThunk(
  'auth/createAccount',
  async ({ email, password, name }: { email: string; password: string; name: string }, thunkAPI) => {
    try {
      const account = await AppwriteService.createAccount({ email, password, name });
      return account;
    } catch (err: any) {
      throw err.message || 'Account creation failed';
    }
  }
);

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
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      if (action.payload) {
        state.authenticated = true;
        state.token = AppwriteService.jwtToken;
      }
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(initSession.rejected, (state, action) => {
        state.initialized = true;
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null; // Don't show error for failed init
      })
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Login error';
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.token = null;
      })
      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear local state
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      // CREATE ACCOUNT
      .addCase(createUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Account creation failed';
      });
  },
});

export const { resetError, setToken, clearAuth, setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;