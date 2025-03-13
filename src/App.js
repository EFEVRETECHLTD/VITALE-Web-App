import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StatusPage from './components/StatusPage';
import Navigation from './components/Navigation';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtocolSelection from './components/ProtocolSelection';
import ProtocolForm from './components/ProtocolForm';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import GlobalStyles from './GlobalStyles';
import './App.css';
import styled from 'styled-components';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyles />
        <Router>
          <AppContainer>
            <Navigation isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <MainContent sidebarWidth={isCollapsed ? '60px' : '240px'}>
              <Routes>
                <Route path="/" element={<Navigate to="/status" replace />} />
                <Route path="/protocols" element={<ProtocolSelection />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/status/:protocol" element={<StatusPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-protocol" element={
                  <ProtectedRoute>
                    <ProtocolForm />
                  </ProtectedRoute>
                } />
              </Routes>
            </MainContent>
          </AppContainer>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Styled components for the layout
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background-color: #FFFFFF;
`;

const MainContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: ${props => props?.sidebarWidth ?? '240px'};
  padding-top: 80px; /* Add extra padding at the top to account for the user profile component */
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 0;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
  background-color: #FFFFFF;
  
  @media (max-width: 768px) {
    left: 0; /* Reset on mobile */
    width: 100%; /* Full width on mobile */
  }
`;

export default App;
