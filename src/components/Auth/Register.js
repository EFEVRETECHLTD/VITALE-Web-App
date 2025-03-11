import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../../ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

const Register = () => {
  const { theme } = useContext(ThemeContext);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container theme={theme}>
      <FormCard theme={theme}>
        <Title theme={theme}>Create Account</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username" theme={theme}>Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email" theme={theme}>Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password" theme={theme}>Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword" theme={theme}>Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              theme={theme}
            />
          </FormGroup>
          
          <Button type="submit" disabled={isLoading} theme={theme}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </Form>
        
        <Footer theme={theme}>
          Already have an account? <Link to="/login">Login</Link>
        </Footer>
      </FormCard>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: ${props => props.theme.background};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: ${props => props.theme.cardBackground};
`;

const Title = styled.h2`
  margin-bottom: 24px;
  text-align: center;
  color: ${props => props.theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryLight};
  }
`;

const Button = styled.button`
  padding: 12px;
  margin-top: 8px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme.primary};
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabled};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 10px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: #ffebee;
  color: #c62828;
  font-size: 14px;
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Register; 