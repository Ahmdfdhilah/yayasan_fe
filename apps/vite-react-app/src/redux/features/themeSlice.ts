import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

// Initialize the state - try to get from localStorage if available
const initialState: ThemeState = {
  isDarkMode: typeof window !== 'undefined' ? 
    localStorage.getItem('darkMode') === 'true' : 
    false
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', state.isDarkMode.toString());
      }
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', state.isDarkMode.toString());
      }
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;