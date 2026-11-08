import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useSelector as useReactReduxSelector } from 'react-redux'

// Interface for authentication state
export interface AuthState {
  user: any
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitializing: true,
  error: null,
}

// Async thunk for login
export const loginThunk = createAsyncThunk(
  'auth/loginThunk',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // for cookies if backend uses them
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed')
      }

      // Store tokens
      const { user, accessToken, refreshToken } = data

      return { user, accessToken, refreshToken }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for register
export const registerThunk = createAsyncThunk(
  'auth/registerThunk',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed')
      }

      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for get current user
export const getMeThunk = createAsyncThunk(
  'auth/getMeThunk',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to get user')
      }

      return data.user
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for logout
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      // Even if logout request fails, proceed with local cleanup
    } finally {
      // Dispatch local state cleanup
      dispatch(clearAuthState())
    }
  }
)

// Async thunk for refresh token (if backend supports it)
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshTokenThunk',
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = (getState() as any).auth.refreshToken
      if (!refreshToken) {
        return rejectWithValue('No refresh token available')
      }

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Refresh token failed')
      }

      return { accessToken: data.accessToken, refreshToken: data.refreshToken }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for session restoration on refresh
export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSessionThunk',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      // Check if we already have a valid session
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.user) {
        // Session is valid, restore state
        dispatch(setAuthState({
          user: data.user,
          accessToken: data.accessToken || null,
          refreshToken: data.refreshToken || null,
          isAuthenticated: true,
          isInitializing: false,
        }))
        return data
      } else {
        // No valid session
        dispatch(clearAuthState())
        return null
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Session restoration failed')
    }
  }
)

// Helper actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = action.payload.isAuthenticated
      state.isInitializing = action.payload.isInitializing
      state.error = action.payload.error || null
    },
    clearAuthState: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.isInitializing = false
      state.error = null
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setAuthState, clearAuthState, setInitializing, setError } = authSlice.reducers

export default authSlice.reducer

// Custom hook for selecting auth state
export const useAppSelector: typeof useReactReduxSelector = useReactReduxSelector

// Type exports
export type { AuthState }