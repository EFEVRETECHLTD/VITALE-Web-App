#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Pull latest changes
echo "Pulling latest changes from git..."
git pull

# Build and start containers
echo "Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "Checking if services are running..."
docker-compose ps

echo "Deployment completed successfully!"
echo "The application should be available at http://localhost:3000"
echo "The API server should be available at http://localhost:3001" 