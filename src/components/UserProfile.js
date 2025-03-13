import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { 
  ChevronDownIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon, 
  PencilSquareIcon 
} from '@heroicons/react/24/outline';
import { AuthContext } from '../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  // If no user is logged in, return null
  if (!currentUser) {
    return null;
  }

  return (
    <Container>
      <ActionButton>Active</ActionButton>
      <InfoButton>
        <InfoIcon>i</InfoIcon>
      </InfoButton>
      <UserDropdown>
        <UserAvatar>
          <UserIcon width={24} height={24} />
        </UserAvatar>
        <UserInfo onClick={toggleDropdown}>
          <Username>{currentUser.username || 'Username'}</Username>
          <JobPosition>{currentUser.jobPosition || 'Job Position'}</JobPosition>
          <DropdownIcon>
            <ChevronDownIcon width={16} height={16} />
          </DropdownIcon>
        </UserInfo>
        {isDropdownOpen && (
          <DropdownMenu>
            <MenuItem onClick={() => console.log('Profile clicked')}>
              <MenuIcon><PencilSquareIcon width={18} height={18} /></MenuIcon>
              <span>Edit Profile</span>
            </MenuItem>
            <MenuItem onClick={() => console.log('Settings clicked')}>
              <MenuIcon><Cog6ToothIcon width={18} height={18} /></MenuIcon>
              <span>Settings</span>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <MenuIcon><ArrowRightOnRectangleIcon width={18} height={18} /></MenuIcon>
              <span>Logout</span>
            </MenuItem>
          </DropdownMenu>
        )}
      </UserDropdown>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  max-width: 100%;
  z-index: 45; /* Higher than sidebar but lower than protocol buttons */
  padding-right: 10px; /* Add padding to the right side */
`;

const ActionButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #45a049;
  }
`;

const InfoButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const InfoIcon = styled.span`
  font-style: italic;
  font-weight: bold;
  font-size: 14px;
  color: #666;
`;

const UserDropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  margin-right: 5px;
  max-width: 120px;
`;

const Username = styled.div`
  font-weight: 500;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JobPosition = styled.div`
  font-size: 12px;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownIcon = styled.span`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: #FFFFFF;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  z-index: 45; /* Match container z-index */
  overflow: hidden;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #212121;

  &:hover {
    background-color: #F5F5F5;
  }
`;

const MenuIcon = styled.span`
  margin-right: 10px;
  color: #757575;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #EEEEEE;
  margin: 5px 0;
`;

export default UserProfile; 