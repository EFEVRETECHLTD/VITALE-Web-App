import React from 'react';
import {
  HandThumbUpIcon as HeroThumbUp,
  BookmarkIcon as HeroBookmark,
  ShareIcon as HeroShare,
  XMarkIcon as HeroClose,
  PlayIcon as HeroPlay,
  MagnifyingGlassIcon as HeroSearch,
  CheckCircleIcon as HeroCheckCircle,
  PencilIcon as HeroEdit,
  ExclamationTriangleIcon as HeroAlert,
  InformationCircleIcon as HeroInfo,
  HeartIcon as HeroHeart
} from '@heroicons/react/24/outline';

import {
  StarIcon as HeroStarSolid
} from '@heroicons/react/24/solid';

import {
  StarIcon as HeroStarOutline
} from '@heroicons/react/24/outline';

// Heroicons styling
const heroIconStyle = {
  transition: 'all 0.25s ease',
  cursor: 'pointer',
};

// Helper function to set icon size
const getIconSize = (size) => {
  // Heroicons uses className or width/height props
  // Convert the size multiplier to pixels (base size of 24px)
  return Math.round(24 * size);
};

export const ThumbUpIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroThumbUp 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const BookmarkIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroBookmark 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const StarIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroStarSolid 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

// For outline star, use the outline variant
export const StarOutlineIcon = ({ style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={style}
    width="1em"
    height="1em"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// For half star, create a custom component with proper alignment
export const StarHalfIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => {
  const iconSize = getIconSize(size);
  return (
    <div style={{ 
      position: 'relative', 
      width: iconSize, 
      height: iconSize, 
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style 
    }} {...props}>
      {/* Background star (outline) */}
      <HeroStarOutline 
        width={iconSize} 
        height={iconSize} 
        color="#DDD" 
        style={{ position: 'absolute', top: 0, left: 0 }} 
      />
      {/* Half filled star */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: iconSize, 
        height: iconSize, 
        overflow: 'hidden',
        clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
      }}>
        <HeroStarSolid 
          width={iconSize} 
          height={iconSize} 
          color={color} 
        />
      </div>
    </div>
  );
};

export const ShareIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroShare 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const CloseIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroClose 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const PlayIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroPlay 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const SearchIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroSearch 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const CheckCircleIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroCheckCircle 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const EditIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <HeroEdit 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

// Specialized icons with predefined colors
export const SuccessIcon = ({ size = 1, color = '#46c93a', style = {}, ...props }) => 
  <HeroCheckCircle 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const WarningIcon = ({ size = 1, color = '#ffba00', style = {}, ...props }) => 
  <HeroAlert 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const InfoIcon = ({ size = 1, color = '#2c82e0', style = {}, ...props }) => 
  <HeroInfo 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

export const HeartIcon = ({ size = 1, color = '#f91f43', style = {}, ...props }) => 
  <HeroHeart 
    width={getIconSize(size)} 
    height={getIconSize(size)} 
    color={color} 
    style={{...heroIconStyle, ...style}} 
    {...props} 
  />;

// TabIcon component
export const TabIcon = ({ children, style = {}, ...props }) => (
  <div 
    style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginRight: '8px',
      ...style 
    }} 
    {...props}
  >
    {children}
  </div>
);

// SortIcon component
export const SortIcon = ({ direction = 'ascending', size = 0.8, color = 'currentColor', style = {}, ...props }) => {
  // Use a simple arrow character for the sort icon
  return (
    <span
      style={{
        display: 'inline-block',
        marginLeft: '4px',
        fontSize: `${getIconSize(size)}px`,
        color: color,
        ...heroIconStyle,
        ...style
      }}
      {...props}
    >
      {direction === 'ascending' ? '↑' : '↓'}
    </span>
  );
};
