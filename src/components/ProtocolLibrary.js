import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { StarOutlineIcon } from './icons';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? 
    `${window.location.protocol}//${window.location.hostname}:3001` : 
    'http://localhost:3001');

/**
 * Protocol Library Component
 * 
 * A standalone component for displaying and interacting with a protocol library.
 * This component can be integrated into any React application.
 */
const ProtocolLibrary = ({ 
  authToken, 
  onProtocolSelect,
  onError
}) => {
  // State
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['all']);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Fetch protocols
  const fetchProtocols = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);
      
      // Make API request
      const response = await fetch(`${API_URL}/api/protocols?${params.toString()}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to load protocols');
      }
      
      const data = await response.json();
      setProtocols(data.protocols || []);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(data.protocols.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (onError) {
        onError(err);
      }
    }
  }, [authToken, selectedCategory, searchTerm, sortBy, sortDirection, onError]);
  
  // Initial fetch
  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);
  
  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProtocols();
  };
  
  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchProtocols();
  };
  
  // Toggle sort
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  
  // Handle protocol selection
  const handleProtocolSelect = async (protocolId) => {
    try {
      // Fetch the protocol details
      const response = await fetch(`${API_URL}/api/protocols/${protocolId}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to load protocol details');
      }
      
      const protocol = await response.json();
      setSelectedProtocol(protocol);
      setShowDetailsModal(true);
      
      // Call the parent's onProtocolSelect if provided
      if (onProtocolSelect) {
        onProtocolSelect(protocolId);
      }
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    }
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = protocols.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(protocols.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Add a modal component for protocol details
  const ProtocolDetailsModal = () => {
    if (!selectedProtocol) return null;
    
    return (
      <ModalOverlay onClick={() => setShowDetailsModal(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>{selectedProtocol.name}</h2>
            <CloseButton onClick={() => setShowDetailsModal(false)}>×</CloseButton>
          </ModalHeader>
          <ModalBody>
            <ProtocolDetail>
              <Label>Category:</Label>
              <Value>{selectedProtocol.category}</Value>
            </ProtocolDetail>
            <ProtocolDetail>
              <Label>Author:</Label>
              <Value>{typeof selectedProtocol.author === 'string' 
                ? selectedProtocol.author 
                : (selectedProtocol.author && selectedProtocol.author.displayName 
                  ? selectedProtocol.author.displayName 
                  : 'Unknown')}</Value>
            </ProtocolDetail>
            <ProtocolDetail>
              <Label>Date Published:</Label>
              <Value>{selectedProtocol.datePublished}</Value>
            </ProtocolDetail>
            <ProtocolDetail>
              <Label>Rating:</Label>
              <Value>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StarOutlineIcon 
                    style={{ 
                      color: "#212121",
                      fontSize: '1rem',
                      marginRight: '0.25rem'
                    }} 
                  />
                  <span>{parseFloat(selectedProtocol.rating || 0).toFixed(1)}/5</span>
                </div>
              </Value>
            </ProtocolDetail>
            <ProtocolDescription>
              <h3>Description</h3>
              <p>{selectedProtocol.description}</p>
            </ProtocolDescription>
            {/* Add more protocol details as needed */}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };
  
  // Add these styled components
  const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  const ModalContent = styled.div`
    background-color: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    
    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }
  `;
  
  const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    
    &:hover {
      color: #333;
    }
  `;
  
  const ModalBody = styled.div`
    padding: 1.5rem;
  `;
  
  const ProtocolDetail = styled.div`
    display: flex;
    margin-bottom: 1rem;
  `;
  
  const Label = styled.div`
    font-weight: bold;
    width: 150px;
    color: #666;
  `;
  
  const Value = styled.div`
    flex: 1;
  `;
  
  const ProtocolDescription = styled.div`
    margin-top: 1.5rem;
    
    h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      color: #333;
    }
  `;
  
  return (
    <Container>
      <Header>
        <h1>Protocol Library</h1>
        <p>Browse and search laboratory protocols</p>
      </Header>
      
      <ControlsSection>
        <CategoryTabs>
          {categories.map(category => (
            <CategoryTab 
              key={category}
              active={selectedCategory === category}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </CategoryTab>
          ))}
        </CategoryTabs>
        
        <SearchAndFilterSection>
          <SearchContainer>
            <form onSubmit={handleSearchSubmit}>
              <SearchInput
                type="text"
                placeholder="Search protocols..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <SearchButton type="submit">
                Search
              </SearchButton>
              {searchTerm && (
                <ClearSearchButton type="button" onClick={clearSearch}>
                  ×
                </ClearSearchButton>
              )}
            </form>
          </SearchContainer>
        </SearchAndFilterSection>
      </ControlsSection>
      
      <ResultsCount>
        {protocols.length === 0 ? 'No protocols found' : 
         protocols.length === 1 ? '1 protocol found' : 
         `${protocols.length} protocols found`}
        {searchTerm && ` for "${searchTerm}"`}
        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
      </ResultsCount>
      
      {loading ? (
        <LoadingMessage>Loading protocols...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <>
          <TableContainer>
            <TableHeader>
              <ProtocolNameHeader onClick={() => toggleSort('name')}>
                Protocol Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </ProtocolNameHeader>
              <AuthorHeader onClick={() => toggleSort('author')}>
                Author {sortBy === 'author' && (sortDirection === 'asc' ? '↑' : '↓')}
              </AuthorHeader>
              <DateHeader onClick={() => toggleSort('date')}>
                Date Published {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DateHeader>
              <RatingHeader onClick={() => toggleSort('rating')}>
                Rating {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
              </RatingHeader>
            </TableHeader>
            
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((protocol) => (
                  <TableRow
                    key={protocol.id}
                    onClick={() => handleProtocolSelect(protocol.id)}
                  >
                    <ProtocolNameCell>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {protocol.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          {protocol.category}
                        </div>
                      </div>
                    </ProtocolNameCell>
                    <AuthorCell>
                      {typeof protocol.author === 'string' 
                        ? protocol.author 
                        : (protocol.author && protocol.author.displayName 
                          ? protocol.author.displayName 
                          : 'Unknown')}
                    </AuthorCell>
                    <DateCell>{protocol.datePublished}</DateCell>
                    <RatingCell>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <StarOutlineIcon 
                          style={{ 
                            color: "#212121",
                            fontSize: '1rem',
                            marginRight: '0.25rem'
                          }} 
                        />
                        <span style={{ color: '#212121' }}>
                          {parseFloat(protocol.rating || 0).toFixed(1)}/5
                        </span>
                      </div>
                    </RatingCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>
                  <h3>No protocols found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </NoResults>
              )}
            </TableBody>
          </TableContainer>
          
          <PaginationContainer>
            <PaginationInfo>
              {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, protocols.length)} of {protocols.length} items
            </PaginationInfo>
            <Pagination>
              <PaginationButton 
                disabled={currentPage === 1} 
                onClick={() => paginate(1)}
              >
                «
              </PaginationButton>
              <PaginationButton 
                disabled={currentPage === 1} 
                onClick={() => paginate(currentPage - 1)}
              >
                {'<'}
              </PaginationButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationButton 
                    key={pageNum}
                    active={currentPage === pageNum}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}
              
              <PaginationButton 
                disabled={currentPage === totalPages} 
                onClick={() => paginate(currentPage + 1)}
              >
                {'>'}
              </PaginationButton>
              <PaginationButton 
                disabled={currentPage === totalPages} 
                onClick={() => paginate(totalPages)}
              >
                »
              </PaginationButton>
            </Pagination>
          </PaginationContainer>
        </>
      )}
      
      {showDetailsModal && (
        <ProtocolDetailsModal />
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  p {
    font-size: 1rem;
    color: #666;
  }
`;

const ControlsSection = styled.div`
  margin-bottom: 2rem;
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CategoryTab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: ${props => props.active ? '#4a6cf7' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#3a5ce7' : '#e0e0e0'};
  }
`;

const SearchAndFilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  position: relative;
  
  form {
    display: flex;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem 0 0 0.25rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4a6cf7;
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 0 0.25rem 0.25rem 0;
  cursor: pointer;
  
  &:hover {
    background-color: #3a5ce7;
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 4.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #666;
  }
`;

const ResultsCount = styled.div`
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const TableContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  background-color: #f9f9f9;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #eee;
`;

const HeaderCell = styled.div`
  cursor: pointer;
  
  &:hover {
    color: #4a6cf7;
  }
`;

const ProtocolNameHeader = styled(HeaderCell)``;
const AuthorHeader = styled(HeaderCell)``;
const DateHeader = styled(HeaderCell)``;
const RatingHeader = styled(HeaderCell)``;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProtocolNameCell = styled.div`
  padding-right: 1rem;
`;

const AuthorCell = styled.div``;
const DateCell = styled.div``;
const RatingCell = styled.div``;

const NoResults = styled.div`
  padding: 3rem;
  text-align: center;
  color: #666;
  
  h3 {
    margin-bottom: 0.5rem;
  }
`;

const LoadingMessage = styled.div`
  padding: 3rem;
  text-align: center;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fff0f0;
  color: #e53e3e;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#4a6cf7' : 'white'};
  color: ${props => props.active ? 'white' : props.disabled ? '#ccc' : '#333'};
  border-radius: 0.25rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${props => props.active ? '#3a5ce7' : props.disabled ? 'white' : '#f5f5f5'};
  }
`;

export default ProtocolLibrary; 