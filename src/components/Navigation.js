import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import { 
  Speedometer2, 
  Book, 
  PencilSquare, 
  List, 
  SunFill, 
  MoonFill 
} from 'react-bootstrap-icons';

const Navigation = ({ isCollapsed, toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  return (
    <NavigationContainer>
      {/* Add a spacer at the top to reserve space for the TopRightCorner */}
      <TopRightSpacer />
      
      {/* User profile and theme toggle in top right */}
      <TopRightCorner theme={theme}>
        <ThemeToggle onClick={toggleTheme} theme={theme}>
          {theme?.mode === 'dark' ? <SunFill size={20} /> : <MoonFill size={20} />}
        </ThemeToggle>
        
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <AuthLinks>
            <AuthLink 
              isActive={location.pathname === '/login'} 
              theme={theme}
            >
              <Link to="/login">Login</Link>
            </AuthLink>
            
            <AuthLink 
              isActive={location.pathname === '/register'} 
              theme={theme}
            >
              <Link to="/register">Register</Link>
            </AuthLink>
          </AuthLinks>
        )}
      </TopRightCorner>

      {/* Sidebar for navigation */}
      <SidebarContainer isCollapsed={isCollapsed} theme={theme}>
        <SidebarHeader>
          <Logo theme={theme} isCollapsed={isCollapsed}>
            <Link to="/">
              {isCollapsed ? (
                <LogoImageSmall src="/images/egg.png" alt="Logo" />
              ) : (
                <LogoImage src="/images/EFEVRE TECH LOGO.png" alt="EFEVRE TECH Logo" />
              )}
            </Link>
          </Logo>
        </SidebarHeader>
        
        <NavLinks>
          <MenuToggleItem theme={theme} isCollapsed={isCollapsed}>
            <SidebarToggleLink onClick={toggleSidebar} theme={theme} title={isCollapsed ? "Expand Menu" : "Collapse Menu"}>
              <NavIcon>
                <List size={24} />
              </NavIcon>
              {!isCollapsed}
            </SidebarToggleLink>
          </MenuToggleItem>
          
          <NavItem 
            isActive={location.pathname.includes('/status')} 
            theme={theme}
          >
            <Link to="/status">
              <NavIcon>
                <Speedometer2 size={20} />
              </NavIcon>
              {!isCollapsed && <NavText>Status</NavText>}
            </Link>
          </NavItem>
          
          <NavItem 
            isActive={location.pathname.includes('/protocols')} 
            theme={theme}
          >
            <Link to="/protocols">
              <NavIcon>
                <Book size={20} />
              </NavIcon>
              {!isCollapsed && <NavText>Protocol Library</NavText>}
            </Link>
          </NavItem>
          
          {currentUser && (
            <NavItem 
              isActive={location.pathname.includes('/create-protocol')} 
              theme={theme}
            >
              <Link to="/create-protocol">
                <NavIcon>
                  <PencilSquare size={20} />
                </NavIcon>
                {!isCollapsed && <NavText>Protocol Designer</NavText>}
              </Link>
            </NavItem>
          )}
        </NavLinks>
      </SidebarContainer>
      <MainContentPadding isCollapsed={isCollapsed} />
    </NavigationContainer>
  );
};

// Styled components
const NavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopRightCorner = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  z-index: 50; /* Higher than SidebarContainer */
  background-color: #FFFFFF;
  border-radius: 0 0 0 8px;
  box-shadow: ${props => props.theme?.shadow?.small ?? '0 2px 4px rgba(0, 0, 0, 0.1)'};
  pointer-events: auto; /* Make this element clickable */
  
  /* Make all direct children clickable again */
  & > * {
    pointer-events: auto;
  }
`;

const TopRightSpacer = styled.div`
  height: 60px;
  width: 100%;
`;

const SidebarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.isCollapsed ? '60px' : '240px'};
  background-color: #FFFFFF;
  color: ${props => props.theme?.text?.primary ?? '#212121'};
  box-shadow: ${props => props.theme?.shadow?.medium ?? '2px 0 5px rgba(0, 0, 0, 0.05)'};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 40; /* Lower than TopRightCorner but higher than content */
  overflow-x: hidden;
  border-right: 1px solid ${props => props.theme?.border?.light ?? '#E0E0E0'};
  
  @media (max-width: 768px) {
    width: ${props => props.isCollapsed ? '0' : '240px'};
    left: ${props => props.isCollapsed ? '-60px' : '0'};
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  border-bottom: 1px solid ${props => props.theme?.border?.light ?? '#E0E0E0'};
`;

const Logo = styled.div`
  a {
    color: ${props => props.theme?.text?.primary ?? '#212121'};
    text-decoration: none;
    display: flex;
    align-items: center;
  }
`;

const LogoImage = styled.img`
  height: auto;
  max-height: 30px;
  max-width: 150px;
  object-fit: contain;
`;

const LogoImageSmall = styled.img`
  height: auto;
  max-height: 30px;
  max-width: 30px;
  object-fit: contain;
`;

const NavLinks = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 15px 0;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const MenuToggleItem = styled.li`
  margin: 0;
  position: relative;
  
  a {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    color: ${props => props.theme?.text?.secondary ?? '#757575'};
    text-decoration: none;
    transition: all 0.3s ease;
    background-color: #FFFFFF;
    
    &:hover {
      background-color: #f8f8f8;
      color: ${props => props.theme?.primary ?? '#5A8DEE'};
    }
    
    ${props => props.isCollapsed && `
      justify-content: center;
      padding: 12px 0;
    `}
  }
`;

const SidebarToggleLink = styled.a`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: ${props => props.theme?.text?.primary ?? '#212121'};
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #FFFFFF;
  
  &:hover {
    background-color: #f8f8f8;
    color: ${props => props.theme?.primary ?? '#5A8DEE'};
  }
`;

const NavItem = styled.li`
  margin: 5px 0;
  position: relative;
  
  a {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    color: ${props => props.isActive ? (props.theme?.primary ?? '#5A8DEE') : (props.theme?.text?.primary ?? '#212121')};
    text-decoration: none;
    font-weight: ${props => props.isActive ? 'bold' : 'normal'};
    transition: color 0.3s ease;
    border-left: 4px solid ${props => props.isActive ? (props.theme?.primary ?? '#5A8DEE') : 'transparent'};
    background-color: #FFFFFF;
    
    &:hover {
      background-color: #f8f8f8;
      color: ${props => props.theme?.primary ?? '#5A8DEE'};
    }
  }
  
  @media (max-width: 768px) {
    a {
      padding: ${props => props.isCollapsed ? '10px 0' : '10px 15px'};
      justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
    }
  }
`;

const NavIcon = styled.span`
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  
  & > svg {
    font-size: 20px;
  }
`;

const NavText = styled.span`
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s ease;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  margin-right: 15px;
  color: ${props => props.theme?.text?.primary ?? '#212121'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  & > svg {
    font-size: 20px;
  }
  
  &:hover {
    background-color: #f8f8f8;
  }
`;

const AuthLinks = styled.div`
  display: flex;
`;

const AuthLink = styled.div`
  margin-left: 15px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.theme?.primary ?? '#5A8DEE'};
    transform: scaleX(${props => props.isActive ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
  
  a {
    color: ${props => props.isActive ? (props.theme?.primary ?? '#5A8DEE') : (props.theme?.text?.primary ?? '#212121')};
    text-decoration: none;
    font-weight: ${props => props.isActive ? 'bold' : 'normal'};
    transition: color 0.3s ease;
    
    &:hover {
      color: ${props => props.theme?.primary ?? '#5A8DEE'};
    }
  }
`;

const MainContentPadding = styled.div`
  width: ${props => props.isCollapsed ? '60px' : '240px'};
  flex-shrink: 0;
  transition: width 0.3s ease;
  
  @media (max-width: 768px) {
    width: 0;
  }
`;

export default Navigation;