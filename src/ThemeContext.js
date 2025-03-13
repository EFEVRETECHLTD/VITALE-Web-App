import React, { createContext, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from './theme';

// Create context with only light theme
const ThemeContext = createContext();

// Export the context itself
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  // Use only light theme
  const currentTheme = {
    ...theme.light,
    spacing: theme?.spacing || {},
    borderRadius: theme?.borderRadius || {},
    typography: theme?.typography || {},
    transition: theme?.transition || {},
    zIndex: theme?.zIndex || {},
    mode: 'light' // Always light mode
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeMode: 'light' }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
