import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import Keycloak from 'keycloak-js';
import { AuthContext } from '../contexts/AuthContext';

const KeycloakLoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keycloak, setKeycloak] = useState(null);
  const [initAttempted, setInitAttempted] = useState(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    // Check if we've already attempted initialization in this session
    const hasAttemptedInit = localStorage.getItem('keycloak_init_attempted') === 'true';
    
    // Check if we're already being redirected back from Keycloak
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const isRedirected = code !== null;

    // Log the current authentication state
    console.log('KeycloakLoginPage - Current auth state:', {
      isAuthenticated: authContext.isAuthenticated,
      hasToken: !!localStorage.getItem('token'),
      hasAttemptedInit,
      isRedirected
    });

    // If we're already authenticated, no need to initialize Keycloak
    if (authContext.isAuthenticated) {
      console.log('User is already authenticated, skipping Keycloak initialization');
      setLoading(false);
      setInitAttempted(true);
      return;
    }

    // Only initialize Keycloak if we're not already authenticated in AuthContext
    // and we haven't already attempted initialization in this session
    if (!authContext.isAuthenticated && !initAttempted && !hasAttemptedInit && !isRedirected) {
      // Mark that we've attempted initialization
      localStorage.setItem('keycloak_init_attempted', 'true');
      setInitAttempted(true);
      
      const initKeycloak = async () => {
        try {
          setLoading(true);
          const keycloakInstance = new Keycloak({
            url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
            realm: process.env.REACT_APP_KEYCLOAK_REALM || 'vitale',
            clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'vitale-client'
          });

          console.log('Initializing Keycloak with config:', {
            url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
            realm: process.env.REACT_APP_KEYCLOAK_REALM || 'vitale',
            clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'vitale-client'
          });

          // Use check-sso instead of login-required to prevent automatic redirects
          keycloakInstance.init({
            onLoad: 'login-required',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            pkceMethod: 'S256',
            checkLoginIframe: false, // Disable iframe checking which can cause issues
            promiseType: 'native' // Use native promises
          }).then(authenticated => {
            setKeycloak(keycloakInstance);
            
            console.log('Keycloak initialized:', {
              authenticated,
              token: keycloakInstance.token ? `${keycloakInstance.token.substring(0, 20)}...` : 'No token',
              tokenParsed: keycloakInstance.tokenParsed ? 'Token parsed' : 'No parsed token',
              subject: keycloakInstance.subject
            });
            
            if (authenticated) {
              // Store token in localStorage
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
              
              // Set up token refresh
              keycloakInstance.onTokenExpired = () => {
                keycloakInstance.updateToken(30).then(refreshed => {
                  if (refreshed) {
                    localStorage.setItem('token', keycloakInstance.token);
                  }
                }).catch(() => {
                  console.error('Failed to refresh token');
                  keycloakInstance.logout();
                });
              };
              
              // Call the onLogin callback with the authenticated user
              if (onLogin) {
                console.log('Calling onLogin callback with user info:', {
                  id: keycloakInstance.subject,
                  username: keycloakInstance.tokenParsed.preferred_username
                });
                onLogin(userInfo, keycloakInstance.token);
              }
              
              // Also directly update the AuthContext
              authContext.login(userInfo, keycloakInstance.token);
            }
            
            setLoading(false);
          }).catch(error => {
            console.error('Keycloak initialization error:', error);
            setError('Failed to initialize authentication. Please try again.');
            setLoading(false);
          });
        } catch (err) {
          console.error('Failed to initialize Keycloak:', err);
          setError('Failed to initialize authentication. Please try again.');
          setLoading(false);
        }
      };

      initKeycloak();
    } else {
      // If we're already authenticated or have attempted initialization, don't show loading
      setLoading(false);
      setInitAttempted(true);
    }
    
    // Clear the initialization flag when the component unmounts
    return () => {
      // We don't want to clear this on unmount as it would cause a loop
      // localStorage.removeItem('keycloak_init_attempted');
    };
  }, [onLogin, authContext.isAuthenticated, initAttempted]);

  const handleLogin = () => {
    // Clear the initialization flag before attempting login
    localStorage.removeItem('keycloak_init_attempted');
    
    if (keycloak) {
      keycloak.login();
    } else {
      // If keycloak instance isn't available, create a new one for login
      const keycloakInstance = new Keycloak({
        url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
        realm: process.env.REACT_APP_KEYCLOAK_REALM || 'vitale',
        clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'vitale-client'
      });
      
      // Initialize Keycloak before calling login
      keycloakInstance.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        promiseType: 'native'
      }).then(() => {
        keycloakInstance.login();
      }).catch(error => {
        console.error('Keycloak initialization error:', error);
        setError('Failed to initialize authentication. Please try again.');
      });
    }
  };

  if (loading) {
    return (
      <LoginPageContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Connecting to authentication service...</LoadingText>
        </LoadingContainer>
      </LoginPageContainer>
    );
  }

  if (error) {
    return (
      <LoginPageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={handleLogin}>Try Again</RetryButton>
        </ErrorContainer>
      </LoginPageContainer>
    );
  }

  // This component will provide a manual login button
  return (
    <LoginPageContainer>
      <LoginCard>
        <Logo>VITALE Protocol Library</Logo>
        <Description>
          Please log in to access the Protocol Designer.
        </Description>
        <LoginButton onClick={handleLogin}>
          Log In with Keycloak
        </LoginButton>
      </LoginCard>
    </LoginPageContainer>
  );
};

const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem;
`;

const LoginCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #00BCD4;
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  color: #5f6368;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  background-color: #00BCD4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #00a5bb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 188, 212, 0.1);
  border-radius: 50%;
  border-top-color: #00BCD4;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #5f6368;
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RetryButton = styled.button`
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #b71c1c;
  }
`;

export default KeycloakLoginPage; 