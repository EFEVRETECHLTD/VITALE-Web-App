import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ThumbUpIcon, 
    BookmarkIcon, 
    StarIcon, 
    StarOutlineIcon, 
    StarHalfIcon, 
    ShareIcon,
    CloseIcon,
    PlayIcon,
    EditIcon,
    CheckCircleIcon,
    TabIcon
} from './icons';
import { AuthContext } from '../contexts/AuthContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ProtocolSelection = () => {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const { isAuthenticated } = useContext(AuthContext);
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch protocols from the API
    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3001/api/protocols');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch protocols');
                }
                
                const data = await response.json();
                setProtocols(data);
            } catch (err) {
                console.error('Error fetching protocols:', err);
                setError('Failed to load protocols. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProtocols();
    }, []);
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        averageRatingScore: false,
        efficiency: false,
        consistency: false,
        accuracy: false,
        safety: false,
        easeOfExecution: false,
        scalability: false,
        datePublished: false,
        worksForMe: false,
        protocolVariants: false,
        protocolBugs: false
    });
    
    // Rating range filters
    const [ratingRanges, setRatingRanges] = useState({
        averageRatingScore: { min: 0, max: 5 },
        efficiency: { min: 0, max: 5 },
        consistency: { min: 0, max: 5 },
        accuracy: { min: 0, max: 5 },
        safety: { min: 0, max: 5 },
        easeOfExecution: { min: 0, max: 5 },
        scalability: { min: 0, max: 5 }
    });
    
    // First, let's update the activeTab state to allow null value for "all protocols"
    const [activeTab, setActiveTab] = useState(null); // null means 'all'

    // Then, let's update the handleTabClick function to toggle selection
    const handleTabClick = (tabName) => {
        // If the tab is already active, deselect it (set to null)
        if (activeTab === tabName) {
            setActiveTab(null);
        } else {
            setActiveTab(tabName);
        }
    };

    const [sortBy, setSortBy] = useState('name'); // 'name', 'author', 'date', 'rating'
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Add state for protocol detail view
    const [isProtocolOpen, setIsProtocolOpen] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [reviewTitle, setReviewTitle] = useState('');
    const [detailedReview, setDetailedReview] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [ratings, setRatings] = useState({
        efficiency: 0,
        consistency: 0,
        accuracy: 0,
        safety: 0,
        easeOfExecution: 0,
        scalability: 0
    });
    // Add state to distinguish between protocol view and review view
    const [viewMode, setViewMode] = useState('protocol'); // 'protocol' or 'review'
    const [protocolReviews, setProtocolReviews] = useState([]); // Add a state for protocol reviews

    // Add a new state for the input value
    const [searchInput, setSearchInput] = useState(searchTerm);

    const categories = ['all', ...new Set(protocols.map(p => p.category))];
    
    // Filter protocols based on search term, category, and selected filters
    const filteredProtocols = protocols
        .filter(p => {
            // Filter by tab
            if (activeTab === 'drafted') return p.status === 'draft';
            if (activeTab === 'saved') return p.status === 'saved';
            if (activeTab === 'published') return p.status === 'published';
            return true; // null tab (show all)
        })
        .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
        .filter(p => {
            // Apply scoring type filters with range filtering
            if (selectedFilters.averageRatingScore) {
                const rating = parseFloat(p.rating || 0);
                if (rating < ratingRanges.averageRatingScore.min || rating > ratingRanges.averageRatingScore.max) {
                    return false;
                }
            }
            
            if (selectedFilters.efficiency) {
                const efficiency = parseFloat(p.efficiency || 0);
                if (efficiency < ratingRanges.efficiency.min || efficiency > ratingRanges.efficiency.max) {
                    return false;
                }
            }
            
            if (selectedFilters.consistency) {
                const consistency = parseFloat(p.consistency || 0);
                if (consistency < ratingRanges.consistency.min || consistency > ratingRanges.consistency.max) {
                    return false;
                }
            }
            
            if (selectedFilters.accuracy) {
                const accuracy = parseFloat(p.accuracy || 0);
                if (accuracy < ratingRanges.accuracy.min || accuracy > ratingRanges.accuracy.max) {
                    return false;
                }
            }
            
            if (selectedFilters.safety) {
                const safety = parseFloat(p.safety || 0);
                if (safety < ratingRanges.safety.min || safety > ratingRanges.safety.max) {
                    return false;
                }
            }
            
            if (selectedFilters.easeOfExecution) {
                const easeOfExecution = parseFloat(p.easeOfExecution || 0);
                if (easeOfExecution < ratingRanges.easeOfExecution.min || easeOfExecution > ratingRanges.easeOfExecution.max) {
                    return false;
                }
            }
            
            if (selectedFilters.scalability) {
                const scalability = parseFloat(p.scalability || 0);
                if (scalability < ratingRanges.scalability.min || scalability > ratingRanges.scalability.max) {
                    return false;
                }
            }
            
            return true;
        })
        .filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof p.author === 'string' ? 
                p.author.toLowerCase().includes(searchTerm.toLowerCase()) : 
                (p.author && p.author.username ? 
                    p.author.username.toLowerCase().includes(searchTerm.toLowerCase()) : 
                    false))
        );

    // Sort protocols
    const sortedProtocols = [...filteredProtocols].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'author':
                const authorA = typeof a.author === 'string' ? a.author : (a.author && a.author.username ? a.author.username : '');
                const authorB = typeof b.author === 'string' ? b.author : (b.author && b.author.username ? b.author.username : '');
                comparison = authorA.localeCompare(authorB);
                break;
            case 'date':
                comparison = new Date(a.datePublished) - new Date(b.datePublished);
                break;
            case 'rating':
                comparison = parseFloat(a.rating || 0) - parseFloat(b.rating || 0);
                break;
            default:
                comparison = a.name.localeCompare(b.name);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProtocols.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProtocols.length / itemsPerPage);

    const handleProtocolSelect = (protocolId) => {
        // Find the selected protocol
        const protocol = protocols.find(p => p.id === protocolId);
        if (protocol) {
            setSelectedProtocol(protocol);
            setIsProtocolOpen(true);
            setViewMode('protocol');
            
            // Fetch reviews for the selected protocol
            fetchProtocolReviews(protocolId);
            
            // Reset review form
            setReviewTitle('');
            setDetailedReview('');
            setUploadedImages([]);
            setRatings({
                efficiency: 0,
                consistency: 0,
                accuracy: 0,
                safety: 0,
                easeOfExecution: 0,
                scalability: 0
            });
        }
    };

    const toggleFilter = (filter) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filter]: !prev[filter]
        }));
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    // Check if any filters are active
    const hasActiveFilters = () => {
        return Object.values(selectedFilters).some(value => value === true);
    };

    const clearFilters = () => {
        setSelectedFilters({
            averageRatingScore: false,
            efficiency: false,
            consistency: false,
            accuracy: false,
            safety: false,
            easeOfExecution: false,
            scalability: false,
            datePublished: false,
            worksForMe: false,
            protocolVariants: false,
            protocolBugs: false
        });
    };

    const handleCloseProtocol = () => {
        setIsProtocolOpen(false);
        setSelectedProtocol(null);
    };

    // Function to handle star click to open review mode
    const handleStarClick = (e, protocolId) => {
        e.stopPropagation(); // Prevent triggering the row click
        
        // Find the selected protocol
        const protocol = protocols.find(p => p.id === protocolId);
        if (protocol) {
            setSelectedProtocol(protocol);
            setIsProtocolOpen(true);
            setViewMode('review');
            
            // Reset review form
            setReviewTitle('');
            setDetailedReview('');
            setUploadedImages([]);
            setRatings({
                efficiency: 0,
                consistency: 0,
                accuracy: 0,
                safety: 0,
                easeOfExecution: 0,
                scalability: 0
            });
        }
    };

    // Reusable star rating component with improved click areas
    const StarRating = ({ category, value, onChange }) => {
        // Function to handle star clicks
        const handleStarClick = (starValue) => {
            // Toggle off if clicking the same value
            if (value === starValue) {
                onChange(category, 0);
            } else {
                onChange(category, starValue);
            }
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Stars with full and half-star functionality */}
                {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} style={{ position: 'relative', margin: '0 2px', cursor: 'pointer' }}>
                        {/* Display the appropriate star based on current value */}
                        {value >= star ? (
                            <StarIcon size={0.8} color="#F9D100" />
                        ) : value >= star - 0.5 ? (
                            <StarHalfIcon size={0.8} color="#F9D100" />
                        ) : (
                            <StarOutlineIcon size={0.8} color="#DDD" />
                        )}
                        
                        {/* Left half - for half star */}
                        <div 
                            style={{ 
                                position: 'absolute',
                                top: 0, 
                                left: 0, 
                                width: '50%', 
                                height: '100%', 
                                cursor: 'pointer',
                                zIndex: 1
                            }}
                            onClick={() => handleStarClick(star - 0.5)}
                            title={`${star - 0.5} stars`}
                        />
                        
                        {/* Right half - for full star */}
                        <div 
                            style={{ 
                                position: 'absolute',
                                top: 0, 
                                left: '50%', 
                                width: '50%', 
                                height: '100%', 
                                cursor: 'pointer',
                                zIndex: 1
                            }}
                            onClick={() => handleStarClick(star)}
                            title={`${star} stars`}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const handleRatingChange = (category, value) => {
        // If clicking on the same value, reset to 0
        if (ratings[category] === value) {
            setRatings(prev => ({
                ...prev,
                [category]: 0
            }));
        } else {
            setRatings(prev => ({
                ...prev,
                [category]: value
            }));
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        
        // Maximum file size in bytes (1MB)
        const MAX_FILE_SIZE = 1024 * 1024;
        
        files.forEach(file => {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`File ${file.name} is too large. Maximum size is 1MB.`);
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Compress image if it's an image file
                if (file.type.startsWith('image/')) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // Calculate new dimensions while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        
                        // Max dimensions
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;
                        
                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw resized image to canvas
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get compressed data URL (JPEG at 80% quality)
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                        setUploadedImages(prev => [...prev, compressedDataUrl]);
                    };
                    img.src = reader.result;
                } else {
                    // For non-image files, just use the original data URL
                    setUploadedImages(prev => [...prev, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Calculate overall score based on all ratings
    const calculateOverallScore = () => {
        const values = Object.values(ratings).filter(val => val > 0);
        if (values.length === 0) return '0.0';
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(1);
    };

    // RangeSlider component for filter section
    const RangeSlider = ({ category, range, onChange, minValue, maxValue }) => {
        // If this is a display-only slider (in protocol list)
        const isDisplayOnly = minValue !== undefined && maxValue !== undefined;
        
        // If minValue and maxValue are provided directly (for display only), use those
        // Otherwise use the range from props
        const min = isDisplayOnly ? minValue : (range ? range.min : 0);
        const max = isDisplayOnly ? maxValue : (range ? range.max : 5);
        
        // Use local state for smooth dragging
        const [localValues, setLocalValues] = useState([min, max]);
        
        // Update local state when props change
        useEffect(() => {
            setLocalValues([min, max]);
        }, [min, max]);
        
        // Handle range change during dragging (updates local state only)
        const handleDragging = (values) => {
            if (!isDisplayOnly) {
                setLocalValues(values);
            }
        };
        
        // Handle range change when dragging ends (updates parent state)
        const handleAfterChange = (values) => {
            if (!isDisplayOnly && onChange) {
                if (values[0] !== min) {
                    onChange(category, 'min', values[0]);
                }
                if (values[1] !== max) {
                    onChange(category, 'max', values[1]);
                }
            }
        };

        return (
            <div style={{ marginTop: '4px', marginBottom: '16px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#757575' }}>{localValues[0]}</div>
                    <div style={{ fontSize: '12px', color: '#757575' }}>{localValues[1]}</div>
                </div>
                
                <div style={{ padding: '10px 0' }}>
                    <Slider
                        range
                        min={0}
                        max={5}
                        step={0.5}
                        value={localValues}
                        onChange={handleDragging}
                        onAfterChange={handleAfterChange}
                        disabled={isDisplayOnly}
                        trackStyle={{ backgroundColor: '#3ab2b4', height: 5 }}
                        railStyle={{ backgroundColor: '#8a8a8a', height: 5 }}
                        handleStyle={[
                            {
                                backgroundColor: '#3ab2b4',
                                border: '3px solid white',
                                boxShadow: '0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25)',
                                height: 25,
                                width: 25,
                                marginTop: -10,
                            },
                            {
                                backgroundColor: '#3ab2b4',
                                border: '3px solid white',
                                boxShadow: '0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25)',
                                height: 25,
                                width: 25,
                                marginTop: -10,
                            }
                        ]}
                    />
                </div>
            </div>
        );
    };
    
    // Handle range slider changes
    const handleRangeChange = (category, type, value) => {
        setRatingRanges(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: value
            }
        }));
    };

    // Add a function to fetch reviews for a protocol
    const fetchProtocolReviews = async (protocolId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/protocols/${protocolId}/reviews`);
            if (response.ok) {
                const data = await response.json();
                setProtocolReviews(data);
            } else {
                console.error('Failed to fetch reviews');
                setProtocolReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setProtocolReviews([]);
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedProtocol) return;
        
        // Validate required fields
        if (!reviewTitle.trim()) {
            alert('Please provide a review title');
            return;
        }
        
        if (!detailedReview.trim()) {
            alert('Please provide detailed review comments');
            return;
        }
        
        // Check if at least one rating is provided
        const hasRating = Object.values(ratings).some(rating => rating > 0);
        if (!hasRating) {
            alert('Please provide at least one rating');
            return;
        }
        
        try {
            // Calculate overall rating as average of provided ratings
            const providedRatings = Object.values(ratings).filter(r => r > 0);
            const overallRating = providedRatings.length > 0 
                ? providedRatings.reduce((sum, r) => sum + r, 0) / providedRatings.length 
                : 0;
            
            const reviewData = {
                rating: parseFloat(overallRating.toFixed(1)),
                title: reviewTitle,
                comment: detailedReview,
                metrics: ratings,
                attachments: uploadedImages
            };
            
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to submit a review');
                return;
            }
            
            const response = await fetch(`http://localhost:3001/api/protocols/${selectedProtocol.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });
            
            let errorData;
            try {
                // Try to parse response as JSON
                errorData = await response.json();
            } catch (parseError) {
                // If JSON parsing fails, get text content instead
                const textContent = await response.text();
                console.error('Error parsing response:', textContent);
                throw new Error('Server returned an invalid response. The file attachments may be too large.');
            }
            
            // Handle case where user has already reviewed this protocol
            if (response.status === 400) {
                if (errorData.message === 'You have already reviewed this protocol') {
                    alert('You have already reviewed this protocol. Currently, you can only submit one review per protocol.');
                    return;
                } else {
                    throw new Error(errorData.message || 'Failed to submit review');
                }
            } else if (!response.ok) {
                throw new Error(errorData.message || 'Failed to submit review');
            } else {
                // Success message for new review
                alert('Review submitted successfully!');
            }
            
            // Reset form and go back to protocol view
            setViewMode('protocol');
            
            // Reset review form
            setReviewTitle('');
            setDetailedReview('');
            setUploadedImages([]);
            setRatings({
                efficiency: 0,
                consistency: 0,
                accuracy: 0,
                safety: 0,
                easeOfExecution: 0,
                scalability: 0
            });
            
            // Refresh protocols to get updated ratings
            const protocolsResponse = await fetch('http://localhost:3001/api/protocols');
            if (protocolsResponse.ok) {
                const data = await protocolsResponse.json();
                setProtocols(data);
                
                // Update selected protocol with new data
                const updatedProtocol = data.find(p => p.id === selectedProtocol.id);
                if (updatedProtocol) {
                    setSelectedProtocol(updatedProtocol);
                    
                    // Fetch updated reviews
                    fetchProtocolReviews(updatedProtocol.id);
                }
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.message || 'Failed to submit review. Please try again.');
        }
    };

    // Update the search input handler
    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    // Add a handler for the search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Add a function to clear the search
    const clearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1); // Reset to first page
    };

    return (
        <Container
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header with title and create button removed */}
            
            {/* Show loading state */}
            {loading && (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Loading protocols...</LoadingText>
                </LoadingContainer>
            )}
            
            {/* Show error state */}
            {error && (
                <ErrorContainer>
                    <ErrorMessage>{error}</ErrorMessage>
                    <RetryButton onClick={() => window.location.reload()}>
                        Retry
                    </RetryButton>
                </ErrorContainer>
            )}
            
            <FiltersAndContentWrapper>
                <FiltersWrapper>
                    <FiltersSection>
                        <ProtocolTypeSection>
                            <ProtocolTypeButtons>
                                <ProtocolTypeButton 
                                    active={activeTab === 'drafted'}
                                    onClick={() => handleTabClick('drafted')}
                                >
                                    <TabIcon>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
                                        </svg>
                                    </TabIcon>
                                    Drafted Protocols
                                </ProtocolTypeButton>
                                <ProtocolTypeButton 
                                    active={activeTab === 'saved'}
                                    onClick={() => handleTabClick('saved')}
                                >
                                    <TabIcon>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" fill="currentColor"/>
                                        </svg>
                                    </TabIcon>
                                    Bookmarked Protocols
                                </ProtocolTypeButton>
                                <ProtocolTypeButton 
                                    active={activeTab === 'published'}
                                    onClick={() => handleTabClick('published')}
                                >
                                    <TabIcon>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="currentColor"/>
                                        </svg>
                                    </TabIcon>
                                    Published Protocols
                                </ProtocolTypeButton>
                            </ProtocolTypeButtons>
                        </ProtocolTypeSection>

                        <ScoringTypeSection>
                            <SectionTitle>SCORING TYPE</SectionTitle>
                            <FilterCheckboxes>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="averageRatingScore" 
                                        checked={selectedFilters.averageRatingScore}
                                        onChange={() => toggleFilter('averageRatingScore')}
                                    />
                                    <label htmlFor="averageRatingScore">Average Rating Score</label>
                                    {selectedFilters.averageRatingScore && (
                                        <RangeSlider 
                                            category="averageRatingScore" 
                                            range={ratingRanges.averageRatingScore} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="efficiency" 
                                        checked={selectedFilters.efficiency}
                                        onChange={() => toggleFilter('efficiency')}
                                    />
                                    <label htmlFor="efficiency">Efficiency</label>
                                    {selectedFilters.efficiency && (
                                        <RangeSlider 
                                            category="efficiency" 
                                            range={ratingRanges.efficiency} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="consistency" 
                                        checked={selectedFilters.consistency}
                                        onChange={() => toggleFilter('consistency')}
                                    />
                                    <label htmlFor="consistency">Consistency</label>
                                    {selectedFilters.consistency && (
                                        <RangeSlider 
                                            category="consistency" 
                                            range={ratingRanges.consistency} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="accuracy" 
                                        checked={selectedFilters.accuracy}
                                        onChange={() => toggleFilter('accuracy')}
                                    />
                                    <label htmlFor="accuracy">Accuracy</label>
                                    {selectedFilters.accuracy && (
                                        <RangeSlider 
                                            category="accuracy" 
                                            range={ratingRanges.accuracy} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="safety" 
                                        checked={selectedFilters.safety}
                                        onChange={() => toggleFilter('safety')}
                                    />
                                    <label htmlFor="safety">Safety</label>
                                    {selectedFilters.safety && (
                                        <RangeSlider 
                                            category="safety" 
                                            range={ratingRanges.safety} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="easeOfExecution" 
                                        checked={selectedFilters.easeOfExecution}
                                        onChange={() => toggleFilter('easeOfExecution')}
                                    />
                                    <label htmlFor="easeOfExecution">Ease Of Execution</label>
                                    {selectedFilters.easeOfExecution && (
                                        <RangeSlider 
                                            category="easeOfExecution" 
                                            range={ratingRanges.easeOfExecution} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="scalability" 
                                        checked={selectedFilters.scalability}
                                        onChange={() => toggleFilter('scalability')}
                                    />
                                    <label htmlFor="scalability">Scalability</label>
                                    {selectedFilters.scalability && (
                                        <RangeSlider 
                                            category="scalability" 
                                            range={ratingRanges.scalability} 
                                            onChange={handleRangeChange} 
                                        />
                                    )}
                                </FilterCheckbox>
                            </FilterCheckboxes>
                        </ScoringTypeSection>
                        
                        <AttributeProtocolSection>
                            <SectionTitle>ATTRIBUTE PROTOCOL</SectionTitle>
                            <FilterCheckboxes>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="datePublished" 
                                        checked={selectedFilters.datePublished}
                                        onChange={() => toggleFilter('datePublished')}
                                    />
                                    <label htmlFor="datePublished">Date Published</label>
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="worksForMe" 
                                        checked={selectedFilters.worksForMe}
                                        onChange={() => toggleFilter('worksForMe')}
                                    />
                                    <label htmlFor="worksForMe">Works For Me</label>
                                </FilterCheckbox>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="protocolVariants" 
                                        checked={selectedFilters.protocolVariants}
                                        onChange={() => toggleFilter('protocolVariants')}
                                    />
                                    <label htmlFor="protocolVariants">Protocol Variants</label>
                                </FilterCheckbox>
                            </FilterCheckboxes>
                        </AttributeProtocolSection>
                        
                        <ProtocolContributionSection>
                            <SectionTitle>PROTOCOL CONTRIBUTION</SectionTitle>
                            <FilterCheckboxes>
                                <FilterCheckbox>
                                    <input 
                                        type="checkbox" 
                                        id="protocolBugs" 
                                        checked={selectedFilters.protocolBugs}
                                        onChange={() => toggleFilter('protocolBugs')}
                                    />
                                    <label htmlFor="protocolBugs">Protocol Bugs</label>
                                </FilterCheckbox>
                            </FilterCheckboxes>
                        </ProtocolContributionSection>
                        
                        <ClearFiltersButton 
                            onClick={clearFilters} 
                            disabled={!hasActiveFilters()}
                        >
                            Clear Applied Filters
                        </ClearFiltersButton>
                    </FiltersSection>
                </FiltersWrapper>
                
                <ContentWrapper>
                    <SearchContainer>
                        <form onSubmit={handleSearchSubmit}>
                            <SearchInput 
                                type="text" 
                                placeholder="Search protocols..." 
                                value={searchInput}
                                onChange={handleSearchInputChange}
                            />
                            {searchInput && (
                                <ClearButton 
                                    type="button" 
                                    onClick={clearSearch}
                                    title="Clear search"
                                >
                                    ×
                                </ClearButton>
                            )}
                            <SearchButton type="submit" title="Search">
                                <FaSearch />
                            </SearchButton>
                        </form>
                    </SearchContainer>
                    
                    <ResultsCount>
                        {filteredProtocols.length === 0 ? 'No protocols found' : 
                         filteredProtocols.length === 1 ? '1 protocol found' : 
                         `${filteredProtocols.length} protocols found`}
                        {searchTerm && ` for "${searchTerm}"`}
                        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                        {hasActiveFilters() && ' with applied filters'}
                    </ResultsCount>
                    
                    <TableContainer>
                        <TableHeader>
                            <ProtocolNameHeader onClick={() => toggleSort('name')}>
                                Protocol Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </ProtocolNameHeader>
                            <AuthorHeader onClick={() => toggleSort('author')}>
                                Author Name {sortBy === 'author' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </AuthorHeader>
                            <DateHeader onClick={() => toggleSort('date')}>
                                Date Published {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </DateHeader>
                            <RatingHeader onClick={() => toggleSort('rating')}>
                                Rating Score {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </RatingHeader>
                        </TableHeader>
                        
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {currentItems.length > 0 ? (
                                    currentItems.map((protocol) => (
                                        <TableRow
                                            key={protocol.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => handleProtocolSelect(protocol.id)}
                                        >
                                            <ProtocolNameCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{ marginLeft: '0.5rem' }}>
                                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                            {protocol.name}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            {protocol.category && (
                                                                <CategoryBadge>{protocol.category}</CategoryBadge>
                                                            )}
                                                        </div>
                                                        <div style={{ marginTop: '5px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap' }}>
                                                                {selectedFilters.efficiency && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Efficiency:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.efficiency || 0).toFixed(1)}</span>
                                                                            <StarIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.consistency && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Consistency:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.consistency || 0).toFixed(1)}</span>
                                                                            <StarHalfIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.accuracy && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Accuracy:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.accuracy || 0).toFixed(1)}</span>
                                                                            <StarOutlineIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.safety && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Safety:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.safety || 0).toFixed(1)}</span>
                                                                            <StarOutlineIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.easeOfExecution && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Ease of Execution:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.easeOfExecution || 0).toFixed(1)}</span>
                                                                            <StarHalfIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.scalability && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Scalability:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.scalability || 0).toFixed(1)}</span>
                                                                            <StarIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {selectedFilters.averageRatingScore && (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px', marginBottom: '8px', width: '100px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ color: '#757575', marginRight: '5px' }}>Average Rating:</span>
                                                                            <span style={{ color: '#F9D100' }}>{parseFloat(protocol.rating || 0).toFixed(1)}</span>
                                                                            <StarIcon size={0.5} color="#F9D100" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ProtocolNameCell>
                                            <AuthorCell>{
                                                typeof protocol.author === 'string' 
                                                    ? protocol.author 
                                                    : (protocol.author && protocol.author.displayName 
                                                        ? protocol.author.displayName 
                                                        : (protocol.author && protocol.author.username 
                                                            ? protocol.author.username 
                                                            : 'Unknown'))
                                            }</AuthorCell>
                                            <DateCell>{protocol.datePublished} at {protocol.publishTime}</DateCell>
                                            <RatingCell>
                                                <RatingStars onClick={(e) => handleStarClick(e, protocol.id)}>
                                                    <StarRating category="rating" value={parseFloat(protocol.rating || 0)} onChange={handleRatingChange} />
                                                </RatingStars>
                                                <RatingValue>{parseFloat(protocol.rating || 0).toFixed(1)} / 5.0</RatingValue>
                                            </RatingCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <NoResults>
                                        <h3>No protocols found</h3>
                                        <p>Try adjusting your search or filter criteria</p>
                                    </NoResults>
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </TableContainer>
                    
                    <PaginationContainer>
                        <PaginationInfo>
                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProtocols.length)} of {sortedProtocols.length} items
                        </PaginationInfo>
                        <Pagination>
                            <PaginationButton 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(1)}
                                title="First Page"
                            >
                                «
                            </PaginationButton>
                            <PaginationButton 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(currentPage - 1)}
                                title="Go Back"
                            >
                                {'<'}
                            </PaginationButton>
                            {currentPage > 1 && (
                                <PaginationButton onClick={() => setCurrentPage(currentPage - 1)}>
                                    {currentPage - 1}
                                </PaginationButton>
                            )}
                            <PaginationButton active>
                                {currentPage}
                            </PaginationButton>
                            {currentPage < totalPages && (
                                <PaginationButton onClick={() => setCurrentPage(currentPage + 1)}>
                                    {currentPage + 1}
                                </PaginationButton>
                            )}
                            <PaginationButton 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(currentPage + 1)}
                                title="Go Forward"
                            >
                                {'>'}
                            </PaginationButton>
                            <PaginationButton 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(totalPages)}
                                title="Last Page"
                            >
                                »
                            </PaginationButton>
                        </Pagination>
                    </PaginationContainer>
                </ContentWrapper>
            </FiltersAndContentWrapper>
            
            {isProtocolOpen && (
                <ProtocolDetailContainer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <ProtocolDetailHeader>
                        <h2>{selectedProtocol.name}</h2>
                        <ProtocolDetailActions>
                            <div>
                                <button onClick={handleCloseProtocol}>Close</button>
                            </div>
                        </ProtocolDetailActions>
                    </ProtocolDetailHeader>
                    <ProtocolInfo>
                        <span>By {typeof selectedProtocol.author === 'string' 
                            ? selectedProtocol.author 
                            : (selectedProtocol.author && selectedProtocol.author.displayName 
                                ? selectedProtocol.author.displayName 
                                : (selectedProtocol.author && selectedProtocol.author.username 
                                    ? selectedProtocol.author.username 
                                    : 'Unknown'))}</span>
                        <span>•</span>
                        <span>Published: {selectedProtocol.datePublished}</span>
                        <span>•</span>
                        <span>Rating: {parseFloat(selectedProtocol.rating || 0).toFixed(1)}/5.0</span>
                    </ProtocolInfo>
                    
                    {viewMode === 'protocol' ? (
                        // Protocol Overview Content
                        <div style={{ padding: '0 1rem' }}>
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                borderBottom: '1px solid #EEEEEE',
                                paddingBottom: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#757575', fontWeight: 'bold' }}>
                                        Protocol Details
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <button
                                    style={{
                                        backgroundColor: '#F5F5F5',
                                        color: '#212121',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '1rem',
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Protocol Overview
                                </button>
                                <button
                                    style={{
                                        backgroundColor: '#F5F5F5',
                                        color: '#212121',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '1rem',
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Versioning
                                </button>
                            </div>
                            
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                color: '#212121', 
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                Overview
                            </h3>
                            <h4 style={{
                                fontSize: '1rem',
                                color: '#212121',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold'
                            }}>
                                Analysis of Free Amino Acids is Essential to the Study of Biopharmaceuticals, Foods, and Feeds
                            </h4>
                            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
                                {selectedProtocol.description || 
                                `The amino acid content of a protein is a critical parameter for characterizing a protein and it's unique to a particular peptide or protein. Determining amino acid composition in proteins/peptide hydrolysates, food & feed, and pharmaceutical preparations is important. Amino acids are key ingredients in the cell culture medium used to prepare recombinant proteins. It is vital to monitor the composition of a medium batch to ensure the consistency of individual amino acids reaction in the bioreactor as the conditions in the bioreactor can be optimized.`}
                            </p>
                            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
                                AccQ•Tag Ultra and AccQ•Tag chemistries are the first steps to enabling your laboratory to obtain an accurate amino acid composition from protein/peptide hydrolysates, physiologic fluids, feeds, foods, pharmaceutical preparations, and many other sample matrices. Waters has developed a comprehensive system-based approach to the analysis of amino acids that takes advantage of UPLC separations, application-specific columns for AAA, and standards and kits for AAA and now includes easy automation with the Alliance+.
                            </p>
                            <div style={{
                                position: 'relative',
                                margin: '20px 0',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <RunProtocolButton
                                    onClick={() => navigate(`/status/${selectedProtocol.id}`)}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <PlayIcon size={1.2} color="#00BCD4" />
                                    </span>
                                    Run Protocol
                                </RunProtocolButton>
                            </div>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                color: '#212121', 
                                marginTop: '1.5rem',
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                AccQ•Tag Ultra and AccQ•Tag chemistry kits include:
                            </h3>
                            <ul style={{ marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5', paddingLeft: '1.5rem' }}>
                                <li>Pre-column derivatization reagents</li>
                                <li>Dedicated reversed-phase columns QC tested for amino acid analysis</li>
                                <li>Fluents and standards</li>
                            </ul>
                            
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                color: '#212121', 
                                marginTop: '1.5rem',
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                Labware:
                            </h3>
                            <ol style={{ marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5', paddingLeft: '1.5rem' }}>
                                <li>96 Well Plates Well Block</li>
                                <li>2.0 mL Tube U-bottom</li>
                                <li>96 Tip Rack 300uL</li>
                                <li>2.0 Tube Rack with Generic 2mL Screw-Cap</li>
                                <li>96 Labware Vial Reservoir 22mL</li>
                                <li>96 Tip Rack 1000uL</li>
                                <li>7 Vial Reservoir 290 mL</li>
                            </ol>
                            
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                color: '#212121', 
                                marginTop: '1.5rem',
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                Reagents:
                            </h3>
                            <ol style={{ marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5', paddingLeft: '1.5rem' }}>
                                <li>Liquid 1 (Catalogue No 205)</li>
                                <li>Liquid 2 (Catalogue No 206)</li>
                                <li>Liquid 3 (Catalogue No 203)</li>
                            </ol>
                            
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                color: '#212121', 
                                marginTop: '1.5rem',
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                Protocol Steps:
                            </h3>
                            <ol style={{ marginBottom: '3rem', fontSize: '0.875rem', lineHeight: '1.5', paddingLeft: '1.5rem' }}>
                                <li>Binding Step</li>
                                <li>Wash 1</li>
                                <li>Wash 2</li>
                                <li>Wash 3</li>
                                <li>Wash 4</li>
                            </ol>
                        </div>
                    ) : (
                        // Review Form Content
                        <ReviewSection>
                            <ReviewLabel>Review Title:</ReviewLabel>
                            <ReviewInput 
                                type="text" 
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                            />
                            <ReviewLabel>Detailed Review:</ReviewLabel>
                            <ReviewTextarea 
                                value={detailedReview}
                                onChange={(e) => setDetailedReview(e.target.value)}
                            />
                            <RatingContainer>
                                <RatingRow>
                                    <RatingCategory>Efficiency:</RatingCategory>
                                    <StarRating category="efficiency" value={ratings.efficiency} onChange={handleRatingChange} />
                                </RatingRow>
                                <RatingRow>
                                    <RatingCategory>Consistency:</RatingCategory>
                                    <StarRating category="consistency" value={ratings.consistency} onChange={handleRatingChange} />
                                </RatingRow>
                                <RatingRow>
                                    <RatingCategory>Accuracy:</RatingCategory>
                                    <StarRating category="accuracy" value={ratings.accuracy} onChange={handleRatingChange} />
                                </RatingRow>
                                <RatingRow>
                                    <RatingCategory>Safety:</RatingCategory>
                                    <StarRating category="safety" value={ratings.safety} onChange={handleRatingChange} />
                                </RatingRow>
                                <RatingRow>
                                    <RatingCategory>Ease Of Execution:</RatingCategory>
                                    <StarRating category="easeOfExecution" value={ratings.easeOfExecution} onChange={handleRatingChange} />
                                </RatingRow>
                                <RatingRow>
                                    <RatingCategory>Scalability:</RatingCategory>
                                    <StarRating category="scalability" value={ratings.scalability} onChange={handleRatingChange} />
                                </RatingRow>
                            </RatingContainer>
                            <ReviewLabel>Add Pictures</ReviewLabel>
                            <div style={{
                                border: '2px dashed #BDBDBD',
                                borderRadius: '0.5rem',
                                padding: '1.5rem',
                                textAlign: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div>Drag files to upload</div>
                                <div>or</div>
                                <label 
                                    htmlFor="fileUpload"
                                    style={{
                                        backgroundColor: '#00BCD4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                        margin: '0.5rem 0'
                                    }}
                                >
                                    Browse for files
                                </label>
                                <input 
                                    type="file" 
                                    id="fileUpload" 
                                    multiple 
                                    accept="image/jpeg,image/png,image/gif,image/svg+xml" 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileUpload}
                                />
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#9E9E9E',
                                    marginTop: '0.5rem'
                                }}>
                                    Maximum file size: 5MB<br />
                                    Supported file types: JPG, PNG, GIF, SVG
                                </div>
                            </div>
                            {uploadedImages.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <ReviewLabel>Uploaded Images</ReviewLabel>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem'
                                    }}>
                                        {uploadedImages.map((url, index) => (
                                            <img 
                                                key={index} 
                                                src={url} 
                                                alt={`Preview ${index + 1}`} 
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    border: '1px solid #E0E0E0'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ 
                                    fontSize: '1.25rem', 
                                    color: '#212121', 
                                    marginBottom: '1rem' 
                                }}>
                                    Review Summary
                                </h3>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: '1rem' 
                                }}>
                                    <div style={{ 
                                        fontWeight: 500, 
                                        color: '#212121', 
                                        marginRight: '1rem' 
                                    }}>
                                        Overall Score:
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const score = parseFloat(calculateOverallScore());
                                            if (score >= star) {
                                                // Full star
                                                return (
                                                    <StarIcon 
                                                        key={star} 
                                                        style={{ 
                                                            color: "#F9D100",
                                                            marginRight: '0.25rem'
                                                        }} 
                                                    />
                                                );
                                            } else if (score >= star - 0.5) {
                                                // Half star
                                                return (
                                                    <StarHalfIcon 
                                                        key={star} 
                                                        style={{ 
                                                            color: "#F9D100",
                                                            marginRight: '0.25rem'
                                                        }} 
                                                    />
                                                );
                                            } else {
                                                // Empty star
                                                return (
                                                    <StarOutlineIcon 
                                                        key={star} 
                                                        style={{ 
                                                            color: '#DDD',
                                                            marginRight: '0.25rem'
                                                        }} 
                                                    />
                                                );
                                            }
                                        })}
                                        <span style={{ marginLeft: '0.5rem', color: '#757575' }}>
                                            {calculateOverallScore()} / 5.0
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '1.5rem',
                                right: '1.5rem'
                            }}>
                                <button
                                    onClick={() => setViewMode('protocol')}
                                    style={{
                                        backgroundColor: '#757575',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        marginRight: '0.5rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    style={{
                                        backgroundColor: '#00BCD4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Submit Review
                                </button>
                            </div>
                        </ReviewSection>
                    )}
                    
                    {/* Add Reviews section to the protocol detail view */}
                    {viewMode === 'protocol' && (
                        <>
                            <div style={{ marginTop: '2rem' }}>
                                <h2 style={{ 
                                    fontSize: '1.5rem', 
                                    color: '#212121', 
                                    marginBottom: '1.5rem',
                                    fontWeight: '500'
                                }}>
                                    Reviews
                                </h2>
                                
                                {protocolReviews.length > 0 ? (
                                    <div>
                                        {protocolReviews.map((review, index) => (
                                            <div 
                                                key={review.id || index} 
                                                style={{
                                                    border: '1px solid #E0E0E0',
                                                    borderRadius: '0.5rem',
                                                    padding: '1.5rem',
                                                    marginBottom: '1.5rem',
                                                    backgroundColor: '#FFFFFF'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <div style={{ 
                                                        width: '40px', 
                                                        height: '40px', 
                                                        borderRadius: '50%', 
                                                        backgroundColor: '#E0E0E0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '1rem',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {review.user?.profileImage ? (
                                                            <img 
                                                                src={review.user.profileImage} 
                                                                alt={review.user?.username || 'User'} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{ 
                                                                fontSize: '1.25rem', 
                                                                fontWeight: 'bold', 
                                                                color: '#757575' 
                                                            }}>
                                                                {(review.user?.username || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: '#212121' }}>
                                                            {review.user?.username || 'Anonymous User'}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '0.875rem', 
                                                            color: '#757575',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {review.user?.role === 'admin' ? 'Lab Director' : 'Lab Technician'}
                                                            <span style={{ margin: '0 0.5rem' }}>•</span>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <StarIcon 
                                                                        key={star} 
                                                                        style={{ 
                                                                            color: star <= review.rating ? "#F9D100" : "#DDD",
                                                                            fontSize: '1rem',
                                                                            marginRight: '0.125rem'
                                                                        }} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h3 style={{ 
                                                    fontSize: '1.125rem', 
                                                    fontWeight: '500',
                                                    color: '#212121', 
                                                    marginBottom: '0.5rem' 
                                                }}>
                                                    {review.title}
                                                </h3>
                                                <div style={{ marginTop: '1rem' }}>
                                                    {review.comment}
                                                </div>
                                                
                                                {/* Display file attachments if available */}
                                                {review.attachments && review.attachments.length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{ 
                                                            fontSize: '0.875rem', 
                                                            fontWeight: 'bold',
                                                            marginBottom: '0.5rem',
                                                            color: theme?.text?.primary || '#212121'
                                                        }}>
                                                            Attachments:
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '0.5rem'
                                                        }}>
                                                            {review.attachments.map((url, index) => (
                                                                <img 
                                                                    key={index} 
                                                                    src={url} 
                                                                    alt={`Attachment ${index + 1}`} 
                                                                    style={{
                                                                        width: '100px',
                                                                        height: '100px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                        border: `1px solid ${theme?.border?.light || '#E0E0E0'}`
                                                                    }}
                                                                    onClick={() => window.open(url, '_blank')}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {review.metrics && (
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: '1rem',
                                                        marginBottom: '1rem',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {Object.entries(review.metrics).map(([key, value]) => {
                                                            if (value > 0) {
                                                                return (
                                                                    <div key={key} style={{ 
                                                                        backgroundColor: '#F5F5F5',
                                                                        padding: '0.5rem 0.75rem',
                                                                        borderRadius: '1rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <span style={{ 
                                                                            textTransform: 'capitalize',
                                                                            color: '#616161',
                                                                            marginRight: '0.5rem'
                                                                        }}>
                                                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                                        </span>
                                                                        <span style={{ 
                                                                            fontWeight: '500',
                                                                            color: '#212121',
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            {value}
                                                                            <StarIcon style={{ 
                                                                                color: '#F9D100',
                                                                                fontSize: '0.875rem',
                                                                                marginLeft: '0.25rem'
                                                                            }} />
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                )}
                                                
                                                <div style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: '#9E9E9E',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <div>
                                                        {review.dateCreated ? new Date(review.dateCreated).toLocaleDateString() : 'Recently added'}
                                                    </div>
                                                    {review.verified && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center',
                                                            color: '#4CAF50'
                                                        }}>
                                                            <CheckCircleIcon style={{ fontSize: '1rem', marginRight: '0.25rem' }} />
                                                            Verified Review
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {protocolReviews.length > 2 && (
                                            <button
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: '#00BCD4',
                                                    border: '1px solid #00BCD4',
                                                    borderRadius: '0.25rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    display: 'block',
                                                    margin: '0 auto',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Read All Reviews
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        backgroundColor: '#FFFFFF'
                                    }}>
                                        <div style={{ 
                                            fontSize: '1.125rem', 
                                            color: '#757575',
                                            marginBottom: '1rem'
                                        }}>
                                            No reviews yet
                                        </div>
                                        <p style={{ color: '#9E9E9E', marginBottom: '1.5rem' }}>
                                            Be the first to review this protocol
                                        </p>
                                        <button
                                            onClick={() => setViewMode('review')}
                                            style={{
                                                backgroundColor: '#00BCD4',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Write a Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </ProtocolDetailContainer>
            )}
        </Container>
    );
};

const Container = styled(motion.div)`
    padding: 0;
    margin: 0;
    max-width: 100%;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    border-bottom: 1px solid ${props => props.theme?.border?.light ?? '#E0E0E0'};
`;

const Title = styled.h1`
    font-size: ${({ theme }) => theme.typography?.fontSize?.xl || '1.5rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.bold || 700};
    color: ${({ theme }) => theme.text?.primary || '#212121'};
    margin: 0;
`;

const CreateButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: ${props => props.theme.primary};
    color: white;
    border: none;
    border-radius: 4px;
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.15s ease'}, color ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    
    &:hover {
        background-color: ${props => props.theme.primaryDark};
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: ${props => props.theme.primary};
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const LoadingText = styled.p`
    font-size: 16px;
    color: ${props => props.theme.textSecondary};
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: 20px;
    background-color: #ffebee;
    border-radius: 8px;
    margin: 20px 0;
`;

const ErrorMessage = styled.p`
    font-size: 16px;
    color: #c62828;
    margin-bottom: 16px;
    text-align: center;
`;

const RetryButton = styled.button`
    padding: 8px 16px;
    background-color: #c62828;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.15s ease'}, color ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    
    &:hover {
        background-color: #b71c1c;
    }
`;

const FiltersAndContentWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
    width: 100%;
    margin-top: 0;
    padding-top: 0;
    flex: 1;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const FiltersWrapper = styled.div`
    width: 250px;
    min-width: 250px;
    border-right: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
    overflow-y: auto;
    background-color: ${({ theme }) => theme.background?.secondary || '#FFFFFF'};
`;

const ContentWrapper = styled.div`
    flex: 1;
    padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
    overflow-y: auto;
    width: calc(100% - 250px);
    background-color: ${({ theme }) => theme.background?.main || '#F5F5F5'};
`;

const FiltersSection = styled.div`
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
    background-color: ${({ theme }) => theme.background?.secondary || '#FFFFFF'};
`;

const ProtocolTypeSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const ScoringTypeSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const AttributeProtocolSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const ProtocolContributionSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const SectionTitle = styled.h4`
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.xs || '0.75rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.bold || 700};
    color: ${({ theme }) => theme.text?.tertiary || '#777777'};
    text-transform: uppercase;
`;

const FilterCheckboxes = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
`;

const FilterCheckbox = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center; /* Changed from flex-start to center for vertical alignment */
    flex-wrap: wrap;
    margin-bottom: 8px;
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    
    input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border: 1px solid #ccc;
        border-radius: 3px;
        outline: none;
        cursor: pointer;
        position: relative;
        margin: 0;
        
        &:checked {
            background-color: #3ab2b4;
            border-color: #3ab2b4;
        }
        
        &:checked::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        
        &:focus {
            box-shadow: 0 0 0 2px rgba(58, 178, 180, 0.3);
        }
    }
    
    label {
        margin-left: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
        cursor: pointer;
        display: flex;
        align-items: center;
        min-height: 16px; /* Match the height of the checkbox */
    }
    
    & > div {
        width: 100%;
        margin-top: 4px;
    }
`;

const ClearFiltersButton = styled.button`
    width: 100%;
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    border-radius: ${({ theme }) => theme.borderRadius?.md || '0.5rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    background-color: ${({ disabled }) => disabled ? '#F0F0F0' : '#3ab2b4'};
    color: ${({ disabled }) => disabled ? '#555555' : '#FFFFFF'};
    border: none;
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.15s ease'}, color ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    margin-top: ${({ theme }) => theme.spacing?.md || '1rem'};
    cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
    opacity: ${({ disabled }) => disabled ? 0.7 : 1};
    
    &:hover {
        background-color: ${({ disabled }) => disabled ? '#E0E0E0' : '#333333'};
    }
`;

const SearchContainer = styled.div`
    position: relative;
    width: 300px;
    margin-bottom: 0.75rem;
    
    form {
        display: flex;
        position: relative;
        width: 100%;
    }
    
    @media (max-width: 768px) {
        max-width: 100%;
        width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.5rem;
    padding-left: 1rem; /* Adjusted to start text from a reasonable position */
    padding-right: 40px;
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    transition: border-color ${({ theme }) => theme.transition?.fast || '0.15s ease'}, box-shadow ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    background-color: ${({ theme }) => theme.background?.secondary || '#FFFFFF'};
    height: 32px;
    
    &:focus {
        outline: none;
        border-color: #3ab2b4;
        box-shadow: 0 0 0 2px rgba(58, 178, 180, 0.2);
    }
    
    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#777777'};
    }
`;

const SearchButton = styled.button`
    position: absolute;
    right: 0;
    top: 0;
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: ${({ theme }) => theme.text?.tertiary || '#777777'};
    cursor: pointer;
    font-size: 0.875rem;
    
    &:hover {
        color: #3ab2b4;
    }
`;

const ResultsCount = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text?.secondary || '#757575'};
    margin-top: 0.25rem;
    margin-bottom: 0.75rem;
`;

const TableContainer = styled.div`
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
    border-radius: ${({ theme }) => theme.borderRadius?.md || '0.5rem'};
    margin-bottom: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: ${({ theme }) => theme.background?.secondary || '#FFFFFF'};
`;

const TableHeader = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
    background-color: ${({ theme }) => theme.background?.tertiary || '#F0F0F0'};
    border-bottom: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
`;

const ProtocolNameHeader = styled.div`
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    
    &:hover {
        color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const AuthorHeader = styled.div`
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    
    &:hover {
        color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const DateHeader = styled.div`
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    
    &:hover {
        color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const RatingHeader = styled.div`
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    
    &:hover {
        color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const TableBody = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const TableRow = styled(motion.div)`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
    border-bottom: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    
    &:hover {
        background-color: ${({ theme }) => theme.background?.tertiary || '#F0F0F0'};
    }
    
    &:last-child {
        border-bottom: none;
    }
`;

const ProtocolNameCell = styled.div`
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    color: ${({ theme }) => theme.primary || '#00BCD4'};
`;

const AuthorCell = styled.div`
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

const DateCell = styled.div`
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    color: ${({ theme }) => theme.text?.tertiary || '#777777'};
`;

const RatingCell = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
`;

const RatingStars = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.status?.warning || '#FFC107'};
    cursor: pointer;
    
    &:hover {
        color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const RatingValue = styled.span`
    margin-left: 0.5rem;
    color: ${({ theme }) => theme.text?.secondary || '#757575'};
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
    border-top: 1px solid ${({ theme }) => theme.border?.light || '#e0e0e0'};
    background-color: ${({ theme }) => theme.background?.main || '#F5F5F5'};
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
    }
`;

const PaginationInfo = styled.div`
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    color: ${({ theme }) => theme.text?.tertiary || '#777777'};
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        margin-top: 10px;
        width: 100%;
        justify-content: center;
    }
`;

const PaginationButton = styled.button`
    padding: ${({ theme }) => theme.spacing?.xs || '0.25rem'} ${({ theme }) => theme.spacing?.md || '0.75rem'};
    border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.25rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    background-color: ${({ theme, active }) => active ? theme.primary || '#00BCD4' : theme.background?.tertiary || '#EEEEEE'};
    color: ${({ theme, active }) => active ? 'white' : theme.text?.secondary || '#757575'};
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.15s ease'}, color ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    opacity: ${({ disabled }) => disabled ? 0.5 : 1};
    cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
    border: none;
    margin: 0 2px;
    min-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover:not(:disabled) {
        background-color: ${({ theme, active }) => active ? theme.primary || '#00BCD4' : theme.background?.tertiary || '#E0E0E0'};
        color: ${({ theme, active }) => active ? 'white' : theme.primary || '#00BCD4'};
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary || '#00BCD4'}33` || 'rgba(0, 188, 212, 0.2)'};
    }
`;

const NoResults = styled.div`
    text-align: center;
    padding: ${({ theme }) => theme.spacing?.xl || '2rem'};
    color: ${({ theme }) => theme.text?.secondary || '#555555'};
    
    h3 {
        margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    }
    
    p {
        color: ${({ theme }) => theme.text?.tertiary || '#777777'};
    }
`;

const ProtocolDetailContainer = styled(motion.div)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.background?.main || '#F5F5F5'};
    z-index: 1000; /* Increased from 20 to be higher than user status component */
    padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
    overflow-y: auto;
    height: 100%;
`;

const ProtocolDetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    position: relative;
    z-index: 100; /* Ensure buttons are clickable */
`;

const ProtocolDetailActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    z-index: 100; /* Ensure buttons are clickable */
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} ${({ theme }) => theme.spacing?.md || '1rem'};
    background-color: ${({ primary, theme }) => primary ? theme.primary ?? '#00BCD4' : 'transparent'};
    color: ${({ primary, theme }) => primary ? 'white' : theme.text?.secondary ?? '#757575'};
    border: ${({ primary, theme }) => primary ? 'none' : `1px solid ${theme.border?.light ?? '#E0E0E0'}`};
    border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.25rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transition?.fast || '0.15s ease'};
    position: relative;
    z-index: 100;
    
    &:hover {
        background-color: ${({ primary, theme }) => primary ? theme.primary ?? '#00BCD4' : theme.background?.tertiary ?? '#EEEEEE'};
        opacity: 0.9;
    }
    
    svg {
        margin-right: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    }
`;

const ProtocolTitle = styled.h2`
    font-size: ${({ theme }) => theme.typography?.fontSize?.xl || '1.5rem'};
    color: ${({ theme }) => theme.text?.primary || '#212121'};
    margin: 0;
`;

const ProtocolInfo = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    color: ${({ theme }) => theme.text?.secondary || '#757575'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

const ReviewSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

const ReviewLabel = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    color: ${({ theme }) => theme.text?.secondary || '#757575'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

const ReviewInput = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    border: 1px solid ${({ theme }) => theme.border?.light || '#E0E0E0'};
    border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.25rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.md || '1rem'};
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const ReviewTextarea = styled.textarea`
    width: 100%;
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    border: 1px solid ${({ theme }) => theme.border?.light || '#E0E0E0'};
    border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.25rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.md || '1rem'};
    min-height: 100px;
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.primary || '#00BCD4'};
    }
`;

const RatingContainer = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const RatingRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

const RatingCategory = styled.div`
    width: 120px;
    color: ${({ theme }) => theme.text?.secondary || '#757575'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

const StarContainer = styled.div`
    display: flex;
    align-items: center;
    
    .star-icon {
        font-size: ${({ theme }) => theme.typography?.fontSize?.md || '1rem'};
    }
`;

const StarButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ active, theme }) => active ? "#F9D100" : theme.text?.tertiary || '#DDD'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.md || '1rem'};
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: ${({ theme }) => "#F9D100"};
    }
    
    /* Remove margin from half-star buttons */
    &:nth-child(odd) {
        margin-right: -3px;
    }
    
    /* Add margin between star pairs */
    &:nth-child(even) {
        margin-right: 4px;
    }
`;

const RunProtocolButton = styled.button`
    background-color: white;
    color: #00BCD4; /* Turquoise color */
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    transition: all 0.2s ease;\r\n    width: 100%; /* Make button fill the whole width */
    
    &:hover {
        background-color: #f8f9fa;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(44, 130, 224, 0.2);
    }
`;

// Add these styled components at the end of the file before export default ProtocolSelection;
const ProtocolTypeButtons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
`;

const ProtocolTypeButton = styled.button`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: ${({ active }) => active ? 'rgba(58, 178, 180, 0.1)' : 'white'};
    color: ${({ active }) => active ? '#3ab2b4' : '#757575'};
    border: 1px solid ${({ active }) => active ? '#3ab2b4' : '#E0E0E0'};
    border-radius: 50px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: ${({ active }) => active ? '0 2px 4px rgba(58, 178, 180, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)'};
    width: 100%;
    text-align: left;
    position: relative;
    height: 40px;
    min-width: 200px;
    
    &:hover {
        background-color: ${({ active }) => active ? 'rgba(58, 178, 180, 0.1)' : '#F5F5F5'};
    }
    
    svg {
        fill: ${({ active }) => active ? '#3ab2b4' : '#757575'};
    }
`;

const ClearButton = styled.button`
    position: absolute;
    right: 32px;
    top: 0;
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: ${({ theme }) => theme.text?.tertiary || '#777777'};
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1;
    padding: 0;
    margin: 0;
    
    &:hover {
        color: #ff6b6b;
    }
`;

const CategoryBadge = styled.span`
    display: inline-block;
    padding: 2px 8px;
    background-color: rgba(58, 178, 180, 0.1);
    color: #3ab2b4;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
`;

export default ProtocolSelection;
