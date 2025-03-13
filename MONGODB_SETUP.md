# MongoDB Setup for Instrument Status Page

This guide explains how to set up and use MongoDB with the Instrument Status Page application.

## Prerequisites

1. Install MongoDB Community Edition on your local machine:
   - [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
   - Make sure MongoDB is running on the default port (27017)

2. Make sure you have Node.js and npm installed.

## Setup Steps

### 1. Seed MongoDB with Initial Data

Run the following command to seed MongoDB with initial users, protocols, and reviews:

```powershell
.\seed-mongodb.ps1
```

This script will:
- Connect to your local MongoDB instance
- Create a database called `instrument-status`
- Seed it with initial users, protocols, and reviews

### 2. Generate 5000 Protocols in MongoDB

Run the following command to generate 5000 protocols and store them in MongoDB:

```powershell
.\generate-mongodb-protocols.ps1 -ProtocolCount 5000
```

You can adjust the number of protocols by changing the `-ProtocolCount` parameter.

### 3. Run the Application with MongoDB

Run the following command to start the application using MongoDB as the data source:

```powershell
.\run-with-mongodb.ps1
```

This script will:
- Start the backend server on port 3001
- Start the frontend application on port 3002
- Configure the application to use MongoDB

## Environment Variables

The application uses the following environment variables for MongoDB configuration:

- `USE_MONGODB`: Set to `true` to use MongoDB
- `ALLOW_IN_MEMORY`: Set to `true` to allow fallback to in-memory database if MongoDB connection fails
- `MONGODB_URI`: The connection URI for MongoDB (default: `mongodb://localhost:27017/instrument-status`)

## Troubleshooting

If you encounter any issues:

1. Make sure MongoDB is running:
   ```powershell
   mongod --version
   ```

2. Check MongoDB connection:
   ```powershell
   mongo --eval "db.version()"
   ```

3. If the application fails to connect to MongoDB, check the logs for error messages.

4. If you need to reset the database, run the seed script again:
   ```powershell
   .\seed-mongodb.ps1
   ``` 