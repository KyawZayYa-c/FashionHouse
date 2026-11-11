import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi, setAuthToken } from '../../services/baseApi.jsx'

// Normalise the two user shapes the backend returns:
//  - login/register -> { id, username, email, role }
//  - GET /auth/me   -> the full user document { _id, username, email, role, ... }
const normalizeUser = (user) => {
  if (!user) return null
  return {
    id: user.id || user._id || null,
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'customer',
    phone: user.phone || '',
    addresses: user.addresses || [],
  }
}

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true, // true until the first session-restore attempt finishes
  loading: false, // true while a login/register request is in flight
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials)
      setAuthToken(data.token)
      return { user: normalizeUser(data.user), token: data.token }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData)
      setAuthToken(data.token)
      return { user: normalizeUser(data.user), token: data.token }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

// Restore the session from the httpOnly cookie on app boot / page refresh.
export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.me()
      return { user: normalizeUser(user) }
    } catch (error) {
      // A 401 here just means "guest" — not an app error.
      return rejectWithValue(error.message || 'No active session')
    }
  }
)

export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.me()
      return { user: normalizeUser(user) }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load profile')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } catch {
    // Even if the network call fails, clear the local session.
  }
  setAuthToken(null)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isInitializing = false
      state.loading = false
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.token
        state.isAuthenticated = true
        state.isInitializing = false
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload || 'Login failed'
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.token
        state.isAuthenticated = true
        state.isInitializing = false
        state.error = null
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
      // Session restore
      .addCase(restoreSessionThunk.pending, (state) => {
        state.isInitializing = true
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.isInitializing = false
        state.user = action.payload.user
        state.isAuthenticated = Boolean(action.payload.user)
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        // Guest — clear quietly without surfacing an error.
        state.isInitializing = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
      // Refresh profile
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = Boolean(action.payload.user)
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearAuthState, clearAuthError } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsInitializing = (state) => state.auth.isInitializing
export const selectAuthError = (state) => state.auth.error
export const selectAuthLoading = (state) => state.auth.loading
export const selectUserRole = (state) => state.auth.user?.role || null

export default authSlice.reducer