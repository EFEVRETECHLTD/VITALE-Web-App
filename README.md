# VITALE Web App

A modern, responsive web application for instrument status monitoring and protocol management developed by EFEVRE TECH LTD.

![EFEVRE TECH Logo](./public/images/EFEVRE%20TECH%20LOGO.png)

## Overview

VITALE Web App is a comprehensive solution for laboratory instrument status monitoring and protocol management. It provides a user-friendly interface for scientists and lab technicians to monitor instrument status in real-time, manage protocols, and collaborate on laboratory procedures.

## Features

- **Real-time Instrument Status Monitoring**: Track the status of laboratory instruments with real-time updates.
- **Protocol Library**: Access, create, and manage laboratory protocols in a centralized library.
- **User Authentication**: Secure login and user management system.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Modern UI**: Clean, intuitive interface with a collapsible sidebar navigation.
- **Theme Support**: Robust theming system with fallback values for consistent styling.

## Architecture

The application follows a modern React architecture with the following components:

- **Frontend**: React.js with styled-components for styling
- **Backend**: Node.js with Express
- **Database**: MongoDB (with in-memory option for development)
- **Authentication**: JWT-based authentication system

For more details, see the [ARCHITECTURE.md](./ARCHITECTURE.md) file.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/EFEVRETECHLTD/VITALE-Web-App.git
   cd VITALE-Web-App
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd server
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

4. Create a `.env` file in the server directory with the following content:
   ```
   PORT=3001
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=your_mongodb_uri_or_leave_empty_for_in_memory_db
   ```

## Running the Application

You can use the provided PowerShell script to start both the frontend and backend:

```
powershell -ExecutionPolicy Bypass -File run.ps1
```

Or start them separately:

1. Start the backend server:
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the frontend:
   ```
   npm start
   ```

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:3001.

## Development

### Project Structure

```
instrument-status-page/
├── public/                  # Static files
├── server/                  # Backend server
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   └── server.js            # Server entry point
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── data/                # Static data
│   ├── App.js               # Main App component
│   ├── index.js             # Entry point
│   └── theme.js             # Theme configuration
└── package.json             # Project dependencies
```

### Styling

The application uses styled-components with a robust theme system. All theme property accesses include optional chaining and fallback values to ensure the UI remains functional even if theme data is incomplete.

## Contributing

1. Create a feature branch from the dev branch
2. Make your changes
3. Submit a pull request to the dev branch

## License

This software is proprietary and confidential. Unauthorized copying, distribution, modification, public display, or public performance of this software is strictly prohibited. All rights reserved.

See the [LICENSE](./LICENSE) file for detailed terms and conditions.

Copyright 2025 EFEVRE TECH LTD. All rights reserved.

# VITALE Protocol Library

A standalone, modular protocol library component that can be integrated with any database and authentication system.

## Features

- **Database Agnostic**: Can work with any database through adapter pattern
- **Authentication Agnostic**: Can work with any authentication system through adapter pattern
- **Responsive UI**: Modern, responsive user interface for protocol browsing
- **Search & Filter**: Advanced search and filtering capabilities
- **Sorting**: Sort protocols by various criteria
- **Pagination**: Efficient pagination for large protocol collections

## Architecture

The application is built with a modular architecture that separates concerns:

### Backend

- **Adapter Pattern**: Database and authentication adapters allow for easy integration with any system
- **RESTful API**: Clean API endpoints for protocol management
- **Middleware**: Configurable middleware for authentication and authorization

### Frontend

- **Standalone Component**: The `ProtocolLibrary` component can be used in any React application
- **Prop-based Configuration**: Configure the component through props
- **Event Handlers**: Callback functions for protocol selection and error handling

## Getting Started

### Backend Setup

1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Configure environment variables:
   ```
   DB_ADAPTER=inmemory  # or any other adapter you implement
   AUTH_ADAPTER=jwt     # or any other adapter you implement
   PORT=3001
   ```

3. Start the server:
   ```
   node protocol-library-server.js
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

3. Start the application:
   ```
   npm start
   ```

## Extending the System

### Adding a New Database Adapter

1. Create a new adapter that extends the `DatabaseAdapter` class:
   ```javascript
   const DatabaseAdapter = require('./DatabaseAdapter');

   class MyDatabaseAdapter extends DatabaseAdapter {
     // Implement all required methods
   }

   module.exports = MyDatabaseAdapter;
   ```

2. Register your adapter in the `AdapterFactory`:
   ```javascript
   // In AdapterFactory.js
   case 'mydatabase':
     AdapterClass = require('./MyDatabaseAdapter');
     break;
   ```

3. Configure the application to use your adapter:
   ```
   DB_ADAPTER=mydatabase
   ```

### Adding a New Authentication Adapter

1. Create a new adapter that extends the `AuthAdapter` class:
   ```javascript
   const AuthAdapter = require('./AuthAdapter');

   class MyAuthAdapter extends AuthAdapter {
     // Implement all required methods
   }

   module.exports = MyAuthAdapter;
   ```

2. Register your adapter in the `AdapterFactory`:
   ```javascript
   // In AdapterFactory.js
   case 'myauth':
     AdapterClass = require('./MyAuthAdapter');
     break;
   ```

3. Configure the application to use your adapter:
   ```
   AUTH_ADAPTER=myauth
   ```

## Using the ProtocolLibrary Component

```jsx
import ProtocolLibrary from './components/ProtocolLibrary';

function App() {
  const handleProtocolSelect = (protocolId) => {
    console.log(`Selected protocol: ${protocolId}`);
    // Navigate to protocol details or perform other actions
  };

  const handleError = (error) => {
    console.error('Protocol library error:', error);
    // Handle errors appropriately
  };

  return (
    <div>
      <ProtocolLibrary 
        authToken={yourAuthToken}
        onProtocolSelect={handleProtocolSelect}
        onError={handleError}
      />
    </div>
  );
}
```

## License

MIT
