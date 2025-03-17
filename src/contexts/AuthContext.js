import React, { createContext, useState, useEffect, useCallback } from 'react';
import Keycloak from 'keycloak-js';

// Create the Auth Context
export const AuthContext = createContext();

// Use dynamic hostname based on current location if no environment variable is set
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? 
    `${window.location.protocol}//${window.location.hostname}:3001` : 
    'http://localhost:3001');

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keycloak, setKeycloak] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [initAttempted, setInitAttempted] = useState(false);

  // Determine which authentication provider to use
  const authProvider = process.env.REACT_APP_AUTH_PROVIDER || 'jwt';

  // Initialize authentication
  useEffect(() => {
    // Add debug logging
    console.log('AuthContext initialization - Starting with:', {
      existingToken: !!localStorage.getItem('token'),
      isAuthenticated,
      user: user ? 'User exists' : 'No user'
    });

    // Check if we're being redirected back from Keycloak
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const isRedirected = code !== null;

    // Check if we already have a token in localStorage
    const existingToken = localStorage.getItem('token');
    
    // If we have a token but isAuthenticated is false, set it to true
    if (existingToken && !isAuthenticated) {
      console.log('Token exists but isAuthenticated is false, updating state');
      try {
        // Parse the token
        const base64Url = existingToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const tokenData = JSON.parse(jsonPayload);
        
        // Add detailed debug logging
        console.log('Token data:', {
          sub: tokenData.sub,
          username: tokenData.preferred_username,
          exp: new Date(tokenData.exp * 1000).toLocaleString(),
          isExpired: tokenData.exp * 1000 < Date.now(),
          currentTime: new Date().toLocaleString()
        });
        
        // If token is not expired, use it
        if (tokenData.exp * 1000 > Date.now()) {
          const userInfo = {
            id: tokenData.sub,
            username: tokenData.preferred_username,
            email: tokenData.email,
            firstName: tokenData.given_name,
            lastName: tokenData.family_name,
            roles: tokenData.realm_access?.roles || [],
            // Add additional fields to match existing user model
            role: tokenData.realm_access?.roles?.includes('admin') ? 'admin' : 'user',
            name: `${tokenData.given_name || ''} ${tokenData.family_name || ''}`.trim(),
            // Include the raw token data for debugging
            tokenData: {
              exp: tokenData.exp,
              iat: tokenData.iat,
              auth_time: tokenData.auth_time,
              jti: tokenData.jti,
              iss: tokenData.iss,
              aud: tokenData.aud,
              sub: tokenData.sub,
              typ: tokenData.typ,
              azp: tokenData.azp,
              session_state: tokenData.session_state,
              acr: tokenData.acr,
              realm_access: tokenData.realm_access,
              scope: tokenData.scope
            }
          };
          
          setUser(userInfo);
          setToken(existingToken);
          setIsAuthenticated(true);
          console.log('Authentication state updated from token');
        } else {
          // Token is expired, remove it
          console.log('Token is expired, removing');
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error('Error parsing token:', e);
        localStorage.removeItem('token');
      }
    }
    
    // Check if KeycloakLoginPage is handling the initialization
    const loginPageHandlingInit = localStorage.getItem('keycloak_init_attempted') === 'true';
    
    // If KeycloakLoginPage is handling initialization, don't initialize here
    if (loginPageHandlingInit && authProvider === 'keycloak') {
      setLoading(false);
      setInitAttempted(true);
      return;
    }
    
    // Only initialize if we're using Keycloak, don't have a token, and aren't being redirected
    if (authProvider === 'keycloak' && !existingToken && !isRedirected && !initAttempted) {
      setInitAttempted(true);
      
      const initKeycloak = async () => {
        try {
          const keycloakInstance = new Keycloak({
            url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
            realm: process.env.REACT_APP_KEYCLOAK_REALM || 'vitale',
            clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'vitale-client'
          });

          // Use check-sso instead of login-required to prevent automatic redirects
          const authenticated = await keycloakInstance.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            pkceMethod: 'S256',
            checkLoginIframe: false, // Disable iframe checking which can cause issues
            promiseType: 'native' // Use native promises
          });

          setKeycloak(keycloakInstance);
          setIsAuthenticated(authenticated);

          if (authenticated) {
            setToken(keycloakInstance.token);
            localStorage.setItem('token', keycloakInstance.token);
            
            // Parse user info from token
            const userInfo = {
              id: keycloakInstance.subject,
              username: keycloakInstance.tokenParsed.preferred_username,
              email: keycloakInstance.tokenParsed.email,
              firstName: keycloakInstance.tokenParsed.given_name,
              lastName: keycloakInstance.tokenParsed.family_name,
              roles: keycloakInstance.tokenParsed.realm_access?.roles || [],
              // Add additional fields to match existing user model
              role: keycloakInstance.tokenParsed.realm_access?.roles?.includes('admin') ? 'admin' : 'user',
              name: `${keycloakInstance.tokenParsed.given_name || ''} ${keycloakInstance.tokenParsed.family_name || ''}`.trim(),
              // Include the raw token data for debugging
              tokenData: {
                exp: keycloakInstance.tokenParsed.exp,
                iat: keycloakInstance.tokenParsed.iat,
                auth_time: keycloakInstance.tokenParsed.auth_time,
                jti: keycloakInstance.tokenParsed.jti,
                iss: keycloakInstance.tokenParsed.iss,
                aud: keycloakInstance.tokenParsed.aud,
                sub: keycloakInstance.tokenParsed.sub,
                typ: keycloakInstance.tokenParsed.typ,
                azp: keycloakInstance.tokenParsed.azp,
                session_state: keycloakInstance.tokenParsed.session_state,
                acr: keycloakInstance.tokenParsed.acr,
                realm_access: keycloakInstance.tokenParsed.realm_access,
                scope: keycloakInstance.tokenParsed.scope
              }
            };
            
            setUser(userInfo);

            // Set up token refresh
            keycloakInstance.onTokenExpired = () => {
              keycloakInstance.updateToken(30).then((refreshed) => {
                if (refreshed) {
                  setToken(keycloakInstance.token);
                  localStorage.setItem('token', keycloakInstance.token);
                }
              }).catch(() => {
                console.error('Failed to refresh token');
                logout();
              });
            };
          }

          setLoading(false);
        } catch (err) {
          console.error('Failed to initialize Keycloak:', err);
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      };

      initKeycloak();
    } else if (authProvider === 'jwt') {
      // JWT authentication (existing implementation)
      const checkAuth = async () => {
        try {
          const storedToken = localStorage.getItem('token');
          
          if (!storedToken) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Validate token with the backend
          const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsAuthenticated(true);
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Authentication error:', err);
          setError('Authentication error');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
      };
      
      checkAuth();
    } else {
      // If we're being redirected or in some other state, just finish loading
      setLoading(false);
    }
  }, [authProvider]);

  // Login function
  const login = useCallback((userData, authToken) => {
    console.log('Login function called with:', {
      userData: userData ? {
        id: userData.id,
        username: userData.username,
        roles: userData.roles,
        role: userData.role,
        name: userData.name,
        email: userData.email
      } : 'No user data',
      tokenLength: authToken ? authToken.length : 0
    });
    
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', authToken);
    
    // Clear the initialization flag
    localStorage.removeItem('keycloak_init_attempted');
    
    console.log('Authentication state after login:', {
      isAuthenticated: true,
      user: userData ? {
        id: userData.id,
        username: userData.username,
        role: userData.role
      } : 'No user',
      token: authToken ? 'Token set' : 'No token'
    });
  }, []);

  // Logout function
  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout();
    }
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    
    // Clear the initialization flag
    localStorage.removeItem('keycloak_init_attempted');
  }, [keycloak]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    
    if (authProvider === 'keycloak') {
      return user.roles.includes(role);
    } else {
      return user.role === role;
    }
  }, [authProvider, user]);

  // Register a new user
  const register = async (username, email, password) => {
    console.log(`Registering user: ${username}, ${email}`);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Registration failed:', data);
        throw new Error(data.message || 'Registration failed');
      }
      
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Get authenticated fetch for making API calls
  const authFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };
    
    return fetch(url, authOptions);
  };
  
  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    token,
    register,
    login,
    logout,
    authFetch,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 