import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../../api/authService';
import * as Notifications from 'expo-notifications';

interface User {
  $id: string;
  name: string;
  email: string;
  account_type?: string;
}

interface AuthState {
  initialized: boolean;
  authenticated: boolean;
  user: User | null;
  token: string | null;
  accountType: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  initialized: false,
  authenticated: false,
  user: null,
  token: null,
  accountType: null,
  loading: false,
  error: null,
};

export const initSession = createAsyncThunk(
  'auth/initSession', 
  async (_, thunkAPI) => {
    try {
      const authStatus = await AuthService.checkAuthStatus();
      if (!authStatus.isLoggedIn) {
        throw new Error('No valid session found');
      }
      
      return {
        user: authStatus.userInfo,
        token: AuthService.getJWT,
        accountType: authStatus.accountType
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
      const result = await AuthService.login(email, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return {
        user: result.appwrite_user,
        token: result.appwrite_jwt,
        accountType: result.user_info?.account_type,
        userInfo: result.user_info
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
      await AuthService.logout();
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
  async ({ email, password, name, accountType }: { email: string; password: string; name: string; accountType: 'user' | 'ngo' }, thunkAPI) => {
    try {
      const result = await AuthService.register(email, password, name, accountType);
      
      if (!result.success) {
        throw new Error(result.error || 'Account creation failed');
      }

      return {
        user: result.appwrite_user,
        token: result.appwrite_jwt,
        accountType: result.user_info?.account_type,
        userInfo: result.user_info
      };
    } catch (err: any) {
      throw err.message || 'Account creation failed';
    }
  }
);

export const saveExpoPushToken = createAsyncThunk(
  'auth/saveExpoPushToken',
  async (_, thunkAPI) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        throw new Error('Push notification permissions not granted');
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      // Optionally send tokenData.data to your backend here
      return tokenData.data;
    } catch (err: any) {
      throw err.message || 'Failed to get push token';
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
      state.accountType = null;
      state.authenticated = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      if (action.payload) {
        state.authenticated = true;
        state.token = AuthService.getJWT;
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
        state.accountType = action.payload.accountType;
        state.loading = false;
        state.error = null;
      })
      .addCase(initSession.rejected, (state, action) => {
        state.initialized = true;
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.accountType = null;
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
        state.accountType = action.payload.accountType;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Login error';
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.accountType = null;
      })
      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.accountType = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear local state
        state.authenticated = false;
        state.user = null;
        state.token = null;
        state.accountType = null;
        state.loading = false;
        state.error = null;
      })
      // CREATE ACCOUNT
      .addCase(createUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.authenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.accountType = action.payload.accountType;
        state.loading = false;
        state.error = null;
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Account creation failed';
      })
      // SAVE EXPO PUSH TOKEN
      .addCase(saveExpoPushToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveExpoPushToken.fulfilled, (state, action) => {
        // Optionally store the push token in state if you want
        // state.pushToken = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(saveExpoPushToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save push token';
      });
  },
});

export const { resetError, setToken, clearAuth, setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;