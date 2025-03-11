import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from './theme';

// Create context
const ThemeContext = createContext();

// Export the context itself
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference in localStorage
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      
      // Check if user prefers dark mode
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      // Fallback to light theme if localStorage is not available
      return 'light';
    }
  };

  const [themeMode, setThemeMode] = useState(getInitialTheme);
  
  // Create a complete theme object by merging the mode-specific theme with shared properties
  const currentTheme = {
    ...theme[themeMode] || theme.light,
    spacing: theme?.spacing || {},
    borderRadius: theme?.borderRadius || {},
    typography: theme?.typography || {},
    transition: theme?.transition || {},
    zIndex: theme?.zIndex || {},
    mode: themeMode // Add the mode to the theme object
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Could not save theme preference:', error);
    }
  };

  // Apply theme to body element
  useEffect(() => {
    document.body.dataset.theme = themeMode;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        themeMode === 'light' 
          ? theme?.light?.background?.main || '#F5F5F5' 
          : theme?.dark?.background?.main || '#212121'
      );
    }
    
    // Add a class to the html element for global CSS selectors
    document.documentElement.className = themeMode;
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only change if user hasn't explicitly set a preference
      try {
        if (!localStorage.getItem('theme')) {
          setThemeMode(e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        // If localStorage is not available, just follow system preference
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // Use the appropriate event listener based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, themeMode }}>
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
