import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaClock, FaArrowRight } from 'react-icons/fa';

const ProtocolCard = ({ protocol, onSelect }) => {
    return (
        <Card 
            whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <CardImageContainer>
                <CardImage 
                    src={protocol.imageUrl} 
                    alt={protocol.name}
                    onError={(e) => {
                        e.target.src = 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png';
                    }}
                />
            </CardImageContainer>
            
            <CardContent>
                <CardTitle>{protocol.name}</CardTitle>
                <CardDescription>{protocol.description}</CardDescription>
                
                <CardFeatures>
                    <CardFeaturesTitle>Key Features:</CardFeaturesTitle>
                    <FeaturesList>
                        {protocol.keyFeatures.map((feature, index) => (
                            <FeatureItem key={index}>{feature}</FeatureItem>
                        ))}
                    </FeaturesList>
                </CardFeatures>
                
                <CardFooter>
                    <CardDuration>
                        <FaClock />
                        <span>{protocol.duration}</span>
                    </CardDuration>
                    <RunButton 
                        onClick={() => onSelect(protocol.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Run Protocol</span>
                        <FaArrowRight />
                    </RunButton>
                </CardFooter>
            </CardContent>
        </Card>
    );
};

const Card = styled(motion.div)`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.background?.main || '#ffffff'};
    border-radius: ${({ theme }) => theme.borderRadius?.lg || '1rem'};
    overflow: hidden;
    box-shadow: ${({ theme }) => theme.shadow?.medium || '0 4px 16px rgba(0, 0, 0, 0.12)'};
    transition: background-color ${({ theme }) => theme.transition?.normal || '0.3s ease'};
    height: 100%;
`;

const CardImageContainer = styled.div`
    position: relative;
    height: 180px;
    overflow: hidden;
`;

const CardImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.transition?.normal || '0.3s ease'};
    
    ${Card}:hover & {
        transform: scale(1.05);
    }
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

const CardTitle = styled.h3`
    margin: 0 0 ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    color: ${({ theme }) => theme.text?.primary || '#1a1a1a'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.lg || '1.125rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.semiBold || 600};
`;

const CardDescription = styled.p`
    margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'};
    color: ${({ theme }) => theme.text?.secondary || '#4a4a4a'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    line-height: ${({ theme }) => theme.typography?.lineHeight?.relaxed || 1.75};
`;

const CardFeatures = styled.div`
    margin-top: auto;
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const CardFeaturesTitle = styled.h4`
    margin: 0 0 ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    color: ${({ theme }) => theme.text?.primary || '#1a1a1a'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
`;

const FeaturesList = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
`;

const FeatureItem = styled.li`
    color: ${({ theme }) => theme.text?.tertiary || '#6c6c6c'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.xs || '0.75rem'};
    padding: ${({ theme }) => theme.spacing?.xs || '0.25rem'} 0;
    position: relative;
    padding-left: ${({ theme }) => theme.spacing?.md || '1rem'};
    
    &:before {
        content: '•';
        position: absolute;
        left: 0;
        color: ${({ theme }) => theme.secondary || '#0070f3'};
    }
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const CardDuration = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    color: ${({ theme }) => theme.text?.tertiary || '#6c6c6c'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.xs || '0.75rem'};
    
    svg {
        color: ${({ theme }) => theme.secondary || '#0070f3'};
    }
`;

const RunButton = styled(motion.button)`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    background-color: ${({ theme }) => theme.primary || '#0070f3'};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius?.md || '0.5rem'};
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} ${({ theme }) => theme.spacing?.md || '1rem'};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || 500};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transition?.fast || '0.1s ease'};
    
    &:hover {
        background-color: ${({ theme }) => theme.accent || '#0059b3'};
    }
`;

export default ProtocolCard;
