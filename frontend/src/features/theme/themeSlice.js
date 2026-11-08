import { createSlice } from '@reduxjs/toolkit'

// Interface for theme state
export interface ThemeState {
  isDark: boolean
  isInitializing: boolean
}

// Initial state - check localStorage and system preference
const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null

const initialState: ThemeState = {
  isDark: savedTheme === 'dark'
    ? true
    : savedTheme === 'light'
      ? false
      : typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  isInitializing: true,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Set theme manually
    setTheme: (state, action) => {
      state.isDark = action.payload.isDark
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        if (action.payload.isDark) {
          localStorage.setItem('theme', 'dark')
        } else {
          localStorage.setItem('theme', 'light')
        }
      }
      // Apply to documentElement
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        if (action.payload.isDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    },

    // Toggle theme
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        if (state.isDark) {
          localStorage.setItem('theme', 'dark')
        } else {
          localStorage.setItem('theme', 'light')
        }
      }
      // Apply to documentElement
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        if (state.isDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    },

    // Set initial state (for hydration)
    setInitialState: (state, action) => {
      state.isDark = action.payload.isDark
      state.isInitializing = false
    },
  },
})

export const { setTheme, toggleTheme, setInitialState } = themeSlice.actions

export default themeSlice.reducer