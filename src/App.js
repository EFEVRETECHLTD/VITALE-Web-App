import React, { useState } from 'react';
import ProtocolLibrary from './components/ProtocolLibrary';
import styled from 'styled-components';
import './App.css';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [selectedProtocolId, setSelectedProtocolId] = useState(null);
  
  // Handle protocol selection
  const handleProtocolSelect = (protocolId) => {
    setSelectedProtocolId(protocolId);
    // In a real app, you might navigate to a protocol detail page
    console.log(`Selected protocol: ${protocolId}`);
  };
  
  // Handle errors
  const handleError = (error) => {
    console.error('Protocol library error:', error);
  };
  
  return (
    <AppContainer>
      <Header>
        <Logo>VITALE Protocol Library</Logo>
        {authToken ? (
          <AuthButton onClick={() => {
            localStorage.removeItem('token');
            setAuthToken(null);
          }}>
            Logout
          </AuthButton>
        ) : (
          <AuthButton onClick={() => {
            // In a real app, this would open a login form
            const mockToken = 'mock-jwt-token';
            localStorage.setItem('token', mockToken);
            setAuthToken(mockToken);
          }}>
            Login
          </AuthButton>
        )}
      </Header>
      
      <MainContent>
        <ProtocolLibrary 
          authToken={authToken}
          onProtocolSelect={handleProtocolSelect}
          onError={handleError}
        />
      </MainContent>
      
      <Footer>
        <p>© 2023 VITALE Protocol Library. All rights reserved.</p>
        <p>This component can be integrated with any database and authentication system.</p>
      </Footer>
    </AppContainer>
  );
}

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #4a6cf7;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const AuthButton = styled.button`
  background-color: white;
  color: #4a6cf7;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  background-color: #f9f9f9;
`;

const Footer = styled.footer`
  background-color: #333;
  color: white;
  padding: 1.5rem 2rem;
  text-align: center;
  
  p {
    margin: 0.5rem 0;
  }
`;

export default App; 