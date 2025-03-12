# Instrument Status Page - Current Architecture Documentation

## 1. System Overview

The Instrument Status Page is a web application designed for laboratory environments to manage and monitor scientific protocols. The system includes user management, protocol library management, and a responsive user interface.

## 2. Technology Stack

### 2.1 Frontend Technologies
- **Framework**: React 19.0.0
- **State Management**: 
  - React Context API for global state
- **Styling**: 
  - Styled-components for CSS-in-JS styling
- **Animations**: Framer Motion 11.0.3
- **Icons**: 
  - React Icons
  - Font Awesome
  - Material UI Icons
  - Bootstrap Icons
- **UI Components**:
  - Custom components built with styled-components
  - Some Material UI components
- **Routing**:
  - React Router DOM v7.2.0

### 2.2 Backend Technologies
- **Server Framework**: Express.js
- **API Architecture**: RESTful API
- **Authentication**: 
  - JSON Web Tokens (jsonwebtoken v9.0.2)
  - bcrypt.js (v2.4.3) for password hashing
- **Security**:
  - Helmet for HTTP headers
  - CORS protection
  - Rate limiting with express-rate-limit
- **Performance**:
  - Compression middleware
  - Optional Redis caching

### 2.3 Database Technologies
- **Primary Database**: MongoDB
  - Mongoose ODM (v8.0.3) for schema definition and validation
  - Support for in-memory database option for development
- **Caching**: Optional Redis for data caching

### 2.4 DevOps & Infrastructure
- **Containerization**: Docker with docker-compose
- **Deployment**: 
  - Render platform support
  - Basic deployment scripts

## 3. System Architecture

### 3.1 High-Level Architecture

The application follows a monolithic architecture with the following components:

1. **Client Application**: React-based single-page application
2. **Backend Server**: Express.js REST API
3. **Database**: MongoDB for data persistence
4. **Optional Caching**: Redis for performance optimization

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React SPA      │<─────│  Express.js     │<─────│  MongoDB        │
│  (Frontend)     │─────>│  (REST API)     │─────>│  (Database)     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │                 │
                         │  Redis          │
                         │  (Optional)     │
                         │                 │
                         └─────────────────┘
```

### 3.2 Backend Structure

The backend is organized as a single Express.js application with the following components:

1. **Authentication**: User registration, login, and token verification
2. **Protocol Management**: CRUD operations for protocols
3. **Review System**: Protocol reviews and ratings
4. **Health Monitoring**: System health checks

### 3.3 Frontend Architecture

The frontend follows a component-based architecture:

1. **Component Structure**: 
   - Reusable UI components
   - Page components
   - Layout components

2. **State Management**:
   - Context API for authentication state
   - Component state for UI interactions
   - Props for component communication

3. **Styling Approach**:
   - Styled-components with theme support
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
  },
  lastLogin: {
    type: Date
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
- Optional in-memory database for development without MongoDB
- Environment variables via .env files

### 6.2 Deployment Options

- Docker containerization
- Render platform deployment
- Basic deployment scripts for different environments

## 7. Future Architecture Considerations

While the current implementation is a monolithic application, the system has been designed with potential future expansion in mind. Future architectural enhancements could include:

- Transition to microservices architecture
- Implementation of GraphQL for more efficient data fetching
- Enhanced authentication with OAuth and MFA
- Advanced caching strategies
- Integration with laboratory instruments and IoT devices
- Real-time updates with WebSockets
- Advanced analytics and reporting capabilities