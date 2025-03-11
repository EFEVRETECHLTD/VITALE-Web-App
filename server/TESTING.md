# Testing the User Account System

This guide will help you test the user account system, protocol management, and review functionality we've implemented.

## Prerequisites

1. Make sure you have all dependencies installed:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory (use the `.env.example` as a template):
   ```
   PORT=3001
   JWT_SECRET=your_jwt_secret_key_here
   USE_MONGODB=false
   MONGODB_URI=mongodb://localhost:27017/instrument-status-page
   NODE_ENV=development
   ```
   
   - Set `USE_MONGODB=true` if you want to use MongoDB
   - Set `USE_MONGODB=false` to use the in-memory database (for testing)

## Starting the Server

1. Start the server:
   ```
   cd server
   node server.js
   ```

2. You should see output like:
   ```
   Using in-memory database
   Server running on port 3001
   ```

## Testing with the REST Client

We've provided a `test-api.rest` file that you can use with the VS Code REST Client extension or as a reference for Postman/Insomnia.

### Testing Flow

1. **Register a User**: 
   - Send a POST request to `/api/users/register`
   - You should receive a 201 status code and a success message

2. **Login**: 
   - Send a POST request to `/api/users/login`
   - You should receive a JWT token and user information

3. **Get User Profile**: 
   - Copy the token from the login response
   - Replace `YOUR_TOKEN_HERE` in the Authorization header
   - Send a GET request to `/api/users/me`
   - You should receive your user profile information

4. **Create a Protocol**:
   - Use the same token in the Authorization header
   - Send a POST request to `/api/protocols`
   - You should receive the created protocol with an ID

5. **Add a Review**:
   - Use the same token in the Authorization header
   - Send a POST request to `/api/protocols/{protocol-id}/reviews`
   - You should receive the created review

## Testing with cURL

You can also test the API using cURL commands:

### Register a User
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","jobPosition":"Lab Technician"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Get User Profile (replace TOKEN with your actual token)
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

## Testing with the Frontend

If you have the React frontend running:

1. Start the React app:
   ```
   cd ..
   npm start
   ```

2. Navigate to http://localhost:3000 in your browser

3. Use the registration and login forms to test the user account system

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Make sure the server is running on port 3001
   - Check if there are any firewall issues

2. **Authentication Failed**:
   - Ensure you're using the correct token format: `Bearer YOUR_TOKEN_HERE`
   - Check if the token has expired (default expiration is 1 day)

3. **MongoDB Connection Issues**:
   - If using MongoDB, make sure MongoDB is running
   - Check the connection string in your `.env` file
   - If you don't have MongoDB installed, set `USE_MONGODB=false` to use in-memory database

### Viewing Logs

The server logs all requests to the console. Check these logs for debugging information.

## MongoDB Setup (Optional)

If you want to use MongoDB instead of the in-memory database:

1. Install MongoDB locally or use a cloud service like MongoDB Atlas

2. Update your `.env` file:
   ```
   USE_MONGODB=true
   MONGODB_URI=mongodb://localhost:27017/instrument-status-page
   ```
   
3. Restart the server

## Seeding the Database

The system automatically seeds the database with mock data when using the in-memory option.

If you're using MongoDB and want to seed it with test data:

```javascript
// Run this in Node.js
const { seedDatabase } = require('./utils/seeder');
seedDatabase(true); // Pass true to force seeding even if data exists
```
