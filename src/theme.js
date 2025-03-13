// Modern design system with Vuesax-inspired color scheme
export const theme = {
  light: {
    // Vuesax primary colors
    primary: '#5A8DEE', // Vuesax primary blue
    secondary: '#757575', // Secondary Text color
    accent: '#5A8DEE', // Accent color
    // Vuesax status colors
    status: {
      success: '#46c93a', // Vuesax success green
      warning: '#ffba00', // Vuesax warning yellow
      danger: '#f91f43', // Vuesax danger red
      info: '#2c82e0', // Vuesax info blue
    },
    background: {
      main: '#FFFFFF', // Background color - changed to clear white
      secondary: '#FFFFFF', // Card/surface background
      tertiary: '#FFFFFF', // Control Alt background - changed to white
    },
    text: {
      primary: '#212121', // Primary Text color
      secondary: '#757575', // Secondary Text color
      tertiary: '#9E9E9E', // Tertiary Text color
      disabled: '#BDBDBD', // Disabled Text color
    },
    border: {
      light: '#E0E0E0', // Light border color
      medium: '#BDBDBD', // Medium border color
      dark: '#9E9E9E', // Dark border color
    },
    shadow: {
      small: '0 2px 8px rgba(0, 0, 0, 0.08)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
      large: '0 8px 30px rgba(0, 0, 0, 0.16)',
    },
  },
  dark: {
    // Vuesax primary colors for dark theme
    primary: '#5A8DEE', // Vuesax primary blue
    secondary: '#757575', // Secondary Text color
    accent: '#5A8DEE', // Accent color
    // Vuesax status colors
    status: {
      success: '#46c93a', // Vuesax success green
      warning: '#ffba00', // Vuesax warning yellow
      danger: '#f91f43', // Vuesax danger red
      info: '#2c82e0', // Vuesax info blue
    },
    background: {
      main: '#212121', // Dark background
      secondary: '#303030', // Dark card background
      tertiary: '#424242', // Dark tertiary background
    },
    text: {
      primary: '#FFFFFF', // White text
      secondary: '#EEEEEE', // Light gray text
      tertiary: '#BDBDBD', // Medium gray text
      disabled: '#757575', // Dark gray text
    },
    border: {
      light: '#424242', // Dark light border
      medium: '#616161', // Dark medium border
      dark: '#757575', // Dark dark border
    },
    shadow: {
      small: '0 2px 8px rgba(0, 0, 0, 0.2)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.3)',
      large: '0 8px 30px rgba(0, 0, 0, 0.4)',
    },
  },
  // Shared properties across themes
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
    circle: '50%',
  },
  typography: {
    fontFamily: {
      primary: "'DM Sans', 'Segoe UI', 'Roboto', sans-serif",
      secondary: "'DM Sans', 'Segoe UI', 'Roboto', sans-serif",
      mono: "'Roboto Mono', 'Courier New', monospace",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      xxxl: '2rem',
      display: '3rem',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  transition: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
};

export default theme;
