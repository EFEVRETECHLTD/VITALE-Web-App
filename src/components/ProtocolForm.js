import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

const ProtocolForm = () => {
  const { theme } = useContext(ThemeContext);
  const { authFetch, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    keyFeatures: ['', '', ''],
    imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png' // Default image
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.keyFeatures];
    updatedFeatures[index] = value;
    
    setFormData(prev => ({
      ...prev,
      keyFeatures: updatedFeatures
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    if (!formData.name || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty key features
    const keyFeatures = formData.keyFeatures.filter(feature => feature.trim() !== '');
    
    if (keyFeatures.length === 0) {
      setError('Please add at least one key feature');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiUrl = `${window.location.protocol}//${window.location.hostname}:3001/api/protocols`;
      const response = await authFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          keyFeatures,
          author: 'You', // This would be replaced with the actual user's name
          dateCreated: new Date().toISOString().split('T')[0],
          status: 'draft'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create protocol');
      }
      
      const data = await response.json();
      setSuccess('Protocol created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        keyFeatures: ['', '', ''],
        imageUrl: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png'
      });
      
      // Redirect to protocols page after a delay
      setTimeout(() => {
        navigate('/protocols');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'An error occurred while creating the protocol');
    } finally {
      setIsLoading(false);
    }
  };
  
  const categories = [
    'Sample Preparation',
    'Assay',
    'Analysis',
    'Purification',
    'Extraction',
    'Generation',
    'Screening',
    'Other'
  ];
  
  return (
    <Container theme={theme}>
      <FormCard theme={theme}>
        <Title theme={theme}>Create New Protocol</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name" theme={theme}>Protocol Name*</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="category" theme={theme}>Category*</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              theme={theme}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description" theme={theme}>Description*</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Key Features*</Label>
            {formData.keyFeatures.map((feature, index) => (
              <Input
                key={index}
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                theme={theme}
              />
            ))}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="imageUrl" theme={theme}>Image URL</Label>
            <Input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              theme={theme}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button type="submit" disabled={isLoading} theme={theme}>
              {isLoading ? 'Creating...' : 'Create Protocol'}
            </Button>
            <CancelButton 
              type="button" 
              onClick={() => navigate('/protocols')}
              theme={theme}
            >
              Cancel
            </CancelButton>
          </ButtonGroup>
        </Form>
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
  max-width: 600px;
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

const Select = styled.select`
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

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
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

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: transparent;
  color: ${props => props.theme.text};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.backgroundHover};
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

const SuccessMessage = styled.div`
  padding: 10px;
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-size: 14px;
`;

export default ProtocolForm; 