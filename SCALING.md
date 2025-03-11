# Scaling the Instrument Status Page Application

This document provides instructions for deploying and scaling the Instrument Status Page application for production use.

## Architecture Overview

The application has been redesigned for scalability with the following components:

- **Frontend**: React application served via Nginx
- **Backend API**: Node.js/Express server with improved error handling and security
- **Database**: MongoDB with connection pooling and replica set support
- **Caching**: Redis for caching frequently accessed data
- **Containerization**: Docker for consistent deployment across environments

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- MongoDB 6+ (for local development without Docker)
- Redis 7+ (for local development without Docker)

## Deployment Instructions

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```
   git clone <repository-url>
   cd instrument-status-page
   ```

2. Create a `.env` file in the server directory based on `.env.example`:
   ```
   cp server/.env.example server/.env
   ```

3. Edit the `.env` file with your production settings.

4. Run the deployment script:
   ```
   ./deploy.sh
   ```

5. Access the application at http://localhost:3000

### Manual Deployment

1. Build and start the Docker containers:
   ```
   docker-compose build
   docker-compose up -d
   ```

2. Verify that all services are running:
   ```
   docker-compose ps
   ```

## Scaling Strategies

### Horizontal Scaling

1. **API Servers**: Deploy multiple instances of the API server behind a load balancer.
   - Update the `docker-compose.yml` file to include multiple server instances.
   - Use a load balancer like Nginx or HAProxy to distribute traffic.

2. **Database Scaling**:
   - Configure MongoDB replica sets for high availability.
   - Consider sharding for very large datasets.

3. **Redis Cluster**:
   - Set up Redis in cluster mode for distributed caching.

### Vertical Scaling

- Increase resources (CPU, memory) for Docker containers in production environments.
- Adjust MongoDB and Redis configurations for optimal performance with available resources.

## Performance Optimization

1. **Caching Strategy**:
   - The application uses Redis to cache frequently accessed data.
   - Adjust cache TTL in the server code based on data volatility.

2. **Database Indexes**:
   - Ensure proper indexes are created for frequently queried fields.

3. **Connection Pooling**:
   - MongoDB connection pooling is configured for optimal performance.
   - Adjust pool size based on server capacity and load.

## Monitoring and Maintenance

1. **Logging**:
   - Application logs are available via Docker:
     ```
     docker-compose logs -f server
     ```

2. **Backup Strategy**:
   - Set up regular MongoDB backups:
     ```
     docker exec -it instrument-status-page_mongodb_1 mongodump --out /backup
     ```

3. **Health Checks**:
   - The API server includes health check endpoints at `/api/health`.

## Security Considerations

1. The application implements:
   - Rate limiting to prevent abuse
   - Helmet for HTTP security headers
   - CORS protection
   - Input validation

2. In production, consider:
   - Setting up HTTPS with proper certificates
   - Implementing authentication and authorization
   - Regular security audits

## Troubleshooting

1. **Container Issues**:
   - Check container logs: `docker-compose logs -f <service-name>`
   - Restart services: `docker-compose restart <service-name>`

2. **Database Connection Issues**:
   - Verify MongoDB connection string in `.env`
   - Check MongoDB logs: `docker-compose logs -f mongodb`

3. **Redis Connection Issues**:
   - Verify Redis connection string in `.env`
   - Check Redis logs: `docker-compose logs -f redis` 