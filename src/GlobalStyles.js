import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme?.typography?.fontFamily?.primary || "'Inter', 'Segoe UI', 'Roboto', sans-serif"};
    background-color: ${({ theme }) => theme?.background?.main || (theme?.mode === 'dark' ? '#212121' : '#F5F5F5')};
    color: ${({ theme }) => theme?.text?.primary || (theme?.mode === 'dark' ? '#FFFFFF' : '#212121')};
    transition: background-color ${({ theme }) => theme?.transition?.normal || '0.3s ease'}, color ${({ theme }) => theme?.transition?.normal || '0.3s ease'};
    line-height: ${({ theme }) => theme?.typography?.lineHeight?.normal || 1.5};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Global theme classes for CSS selector access */
  html.dark body {
    background-color: ${({ theme }) => theme?.dark?.background?.main || '#212121'};
    color: ${({ theme }) => theme?.dark?.text?.primary || '#FFFFFF'};
  }

  html.light body {
    background-color: ${({ theme }) => theme?.light?.background?.main || '#F5F5F5'};
    color: ${({ theme }) => theme?.light?.text?.primary || '#212121'};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme?.typography?.fontFamily?.secondary || "'Poppins', 'Segoe UI', 'Roboto', sans-serif"};
    font-weight: ${({ theme }) => theme?.typography?.fontWeight?.semiBold || 600};
    margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
    line-height: ${({ theme }) => theme?.typography?.lineHeight?.tight || 1.2};
  }

  h1 {
    font-size: ${({ theme }) => theme?.typography?.fontSize?.xxxl || '2rem'};
  }

  h2 {
    font-size: ${({ theme }) => theme?.typography?.fontSize?.xxl || '1.5rem'};
  }

  h3 {
    font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.25rem'};
  }

  p {
    margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
  }

  a {
    color: ${({ theme }) => theme?.primary || '#5A8DEE'};
    text-decoration: none;
    transition: color ${({ theme }) => theme?.transition?.fast || '0.15s ease'};
    
    &:hover {
      text-decoration: underline;
    }
  }

  button, input, select, textarea {
    font-family: ${({ theme }) => theme?.typography?.fontFamily?.primary || "'Inter', 'Segoe UI', 'Roboto', sans-serif"};
    font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '1rem'};
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme?.background?.secondary || (theme?.mode === 'dark' ? '#303030' : '#FFFFFF')};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme?.border?.medium || (theme?.mode === 'dark' ? '#616161' : '#BDBDBD')};
    border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.5rem'};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme?.border?.dark || (theme?.mode === 'dark' ? '#757575' : '#9E9E9E')};
  }

  /* Focus styles for accessibility */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme?.primary || '#5A8DEE'};
    outline-offset: 2px;
  }

  /* Remove focus outline for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Utility classes */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Responsive breakpoints */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
  }
`;

export default GlobalStyles;
