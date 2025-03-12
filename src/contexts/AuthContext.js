import React, { createContext, useState, useEffect } from 'react';

// Create the Auth Context
export const AuthContext = createContext();

// Use dynamic hostname based on current location if no environment variable is set
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? 
    `${window.location.protocol}//${window.location.hostname}:3001` : 
    'http://localhost:3001');

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Verifying token...');
        // Get user data with token
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Token verified, user data:', userData);
          setCurrentUser(userData);
        } else {
          console.error('Token verification failed:', await response.text());
          // Token is invalid or expired
          logout();
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
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
  
  // Login user
  const login = async (username, password) => {
    console.log(`Logging in user: ${username}`);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('Login successful:', data);
      
      // Add job position if not present
      if (!data.user.jobPosition) {
        data.user.jobPosition = 'Job Position';
      }
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout user
  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
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
    currentUser,
    token,
    loading,
    register,
    login,
    logout,
    authFetch,
    isAuthenticated: !!currentUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 