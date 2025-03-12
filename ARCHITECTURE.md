# Instrument Status Page - Development Branch Architecture

## 1. System Overview

The Instrument Status Page is a web application designed for laboratory environments to manage and monitor scientific protocols. The system includes user management, protocol library management, and a responsive user interface. This document describes the current architecture of the development branch.

## 2. Technology Stack

### 2.1 Frontend Technologies
- **Framework**: React 19.0.0
- **State Management**: 
  - React Context API for global state
- **Styling**: 
  - Styled-components 6.1.8 for CSS-in-JS styling
  - Material UI components 6.4.7
- **Animations**: Framer Motion 11.0.3
- **Icons**: 
  - Font Awesome 6.7.2
  - Material UI Icons
  - MDI Icons
  - React Icons 5.5.0
  - Bootstrap Icons 1.11.3
- **UI Components**:
  - Custom components built with styled-components
  - Material UI components
  - Range sliders (rc-slider, react-range-slider-input)
- **Routing**:
  - React Router DOM 7.2.0

### 2.2 Backend Technologies
- **Server Framework**: Express.js 4.18.2
- **API Architecture**: RESTful API
- **Authentication**: 
  - JSON Web Tokens (jsonwebtoken 9.0.2)
  - bcrypt.js 2.4.3 for password hashing
- **Security**:
  - CORS protection
- **External Communication**:
  - Axios 1.8.2 for HTTP requests

### 2.3 Database Technologies
- **Primary Database**: MongoDB
  - Mongoose ODM 8.0.3 for schema definition and validation
  - Support for in-memory database option for development

### 2.4 DevOps & Infrastructure
- **Development Tools**: 
  - Nodemon for server auto-restart
  - Environment configuration via dotenv
- **Deployment**: 
  - Basic deployment scripts

## 3. System Architecture

### 3.1 High-Level Architecture

The application follows a monolithic architecture with the following components:

1. **Client Application**: React-based single-page application
2. **Backend Server**: Express.js REST API
3. **Database**: MongoDB for data persistence

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React SPA      │<─────│  Express.js     │<─────│  MongoDB        │
│  (Frontend)     │─────>│  (REST API)     │─────>│  (Database)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 3.2 Backend Structure

The backend is organized as a single Express.js application with the following components:

1. **Authentication**: User registration, login, and token verification
2. **Protocol Management**: CRUD operations for protocols
3. **Review System**: Protocol reviews and ratings
4. **Configuration**: Environment-based configuration

### 3.3 Frontend Architecture

The frontend follows a component-based architecture:

1. **Component Structure**: 
   - Reusable UI components
   - Page components
   - Layout components

2. **State Management**:
   - Context API for theme and authentication state
   - Component state for UI interactions
   - Props for component communication

3. **Styling Approach**:
   - Styled-components with theme support
   - Global styles
   - Responsive design for mobile and desktop

## 4. Data Models

### 4.1 User Model

```javascript
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  jobPosition: {
    type: String,
    default: 'Lab Technician'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String
  }
}, {
  timestamps: true
});
```

### 4.2 Protocol Model

```javascript
const ProtocolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sample Preparation', 'Assay', 'Analysis', 'Calibration', 'Maintenance', 'Other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  datePublished: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  steps: [{
    order: Number,
    title: String,
    description: String,
    imageUrl: String,
    duration: Number,
    warningText: String,
    required: Boolean
  }],
  materials: [{
    name: String,
    quantity: String,
    notes: String
  }],
  equipment: [{
    name: String,
    model: String,
    settings: String
  }],
  safety: {
    precautions: [String],
    ppe: [String],
    hazards: [String]
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'private'
  }
});
```

### 4.3 Review Model

```javascript
const ReviewSchema = new mongoose.Schema({
  protocol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocol',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
```

## 5. API Endpoints

### 5.1 Authentication Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user and receive JWT
- `GET /api/users/me` - Get current user profile (protected)

### 5.2 Protocol Endpoints

- `GET /api/protocols` - Get all published protocols
- `GET /api/protocols/:id` - Get a specific protocol
- `POST /api/protocols` - Create a new protocol (protected)
- `PUT /api/protocols/:id` - Update a protocol (protected)
- `DELETE /api/protocols/:id` - Delete a protocol (protected)

### 5.3 Review Endpoints

- `POST /api/protocols/:id/reviews` - Add a review to a protocol (protected)
- `GET /api/protocols/:id/reviews` - Get all reviews for a protocol
- `GET /api/protocols/:id/reviews/user` - Get the current user's review (protected)

## 6. Development and Deployment

### 6.1 Development Environment

- Local development with npm scripts
- Server auto-restart with Nodemon
- Environment variables via .env files

### 6.2 Testing

- Basic API testing with REST client
- Unit testing with Jest and React Testing Library

## 7. Future Development Plans

While the current implementation is a monolithic application, future development plans include:

- Improved security with additional middleware (Helmet, rate limiting)
- Enhanced caching strategies with Redis
- Transition to TypeScript for better type safety
- Implementation of WebSockets for real-time updates
- Expanded test coverage
- CI/CD pipeline integration
- Docker containerization for consistent deployment
- Advanced analytics and reporting capabilities