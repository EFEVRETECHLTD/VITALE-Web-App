import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiThumbUpOutline, 
  mdiBookmarkOutline, 
  mdiStar, 
  mdiStarOutline, 
  mdiStarHalfFull, 
  mdiShareOutline, 
  mdiClose, 
  mdiPlayOutline,
  mdiMagnify,
  mdiCheckCircleOutline,
  mdiAlertOutline,
  mdiInformationOutline,
  mdiHeartOutline,
  mdiPencilOutline
} from '@mdi/js';

// Vuesax-inspired styling with subtle transition effects for linear icons
const vuesaxIconStyle = {
  transition: 'all 0.25s ease',
  cursor: 'pointer',
};

export const ThumbUpIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiThumbUpOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const BookmarkIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiBookmarkOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const StarIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiStar} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const StarOutlineIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiStarOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const StarHalfIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiStarHalfFull} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const ShareIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiShareOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const CloseIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiClose} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const PlayIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiPlayOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const SearchIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiMagnify} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const CheckCircleIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiCheckCircleOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const EditIcon = ({ size = 1, color = 'currentColor', style = {}, ...props }) => 
  <Icon path={mdiPencilOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

// New Vuesax-inspired icons with linear style
export const SuccessIcon = ({ size = 1, color = '#46c93a', style = {}, ...props }) => 
  <Icon path={mdiCheckCircleOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const WarningIcon = ({ size = 1, color = '#ffba00', style = {}, ...props }) => 
  <Icon path={mdiAlertOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const InfoIcon = ({ size = 1, color = '#2c82e0', style = {}, ...props }) => 
  <Icon path={mdiInformationOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;

export const HeartIcon = ({ size = 1, color = '#f91f43', style = {}, ...props }) => 
  <Icon path={mdiHeartOutline} size={size} color={color} style={{...vuesaxIconStyle, ...style}} {...props} />;
