import { createSlice } from '@reduxjs/toolkit'

// Interface for language state
export interface LanguageState {
  language: 'en' | 'mm'
  isInitializing: boolean
}

// Initial state - check localStorage and navigator
const savedLanguage = typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null
const detectedLanguage = typeof navigator !== 'undefined' ? navigator.language?.startsWith('mm') ? 'mm' : 'en' : 'en'

const initialState: LanguageState = {
  language: savedLanguage ? (savedLanguage === 'mm' ? 'mm' : 'en') : detectedLanguage,
  isInitializing: true,
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    // Set language manually
    setLanguage: (state, action) => {
      state.language = action.payload.language
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('language', action.payload.language)
      }
      // Update i18n instance
      if (typeof i18n !== 'undefined') {
        i18n.changeLanguage(action.payload.language)
      }
    },

    // Set initial state (for hydration)
    setInitialState: (state, action) => {
      state.language = action.payload.language
      state.isInitializing = false
    },
  },
})

export const { setLanguage, setInitialState } = languageSlice.actions

export default languageSlice.reducer