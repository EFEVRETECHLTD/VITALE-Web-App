import React from 'react';
import ProtocolSelection from './components/ProtocolSelection';
import styled from 'styled-components';
import './App.css';

function App() {
  return (
    <AppContainer className="App">
      <Header>
        <Title>VITALE Protocol Library</Title>
      </Header>
      <ProtocolSelection />
    </AppContainer>
  );
}

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #666;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default App; 