Write-Host "Starting PostgreSQL and Keycloak containers..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start the containers
docker-compose -f docker-compose-keycloak-postgres.yml up -d

# Wait for the containers to start
Write-Host "Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if the containers are running
$postgres = docker ps -q -f "name=vitale-postgres"
$keycloak = docker ps -q -f "name=vitale-keycloak"

if ($postgres -and $keycloak) {
    Write-Host "PostgreSQL and Keycloak are running!" -ForegroundColor Green
    Write-Host "PostgreSQL is available at: localhost:5433" -ForegroundColor Green
    Write-Host "Keycloak is available at: http://localhost:8080" -ForegroundColor Green
    Write-Host "Keycloak admin console: http://localhost:8080/admin" -ForegroundColor Green
    Write-Host "Admin username: admin" -ForegroundColor Green
    Write-Host "Admin password: admin" -ForegroundColor Green
} else {
    Write-Host "Failed to start containers. Please check Docker logs." -ForegroundColor Red
    if (-not $postgres) {
        Write-Host "PostgreSQL container is not running." -ForegroundColor Red
    }
    if (-not $keycloak) {
        Write-Host "Keycloak container is not running." -ForegroundColor Red
    }
}

Write-Host "-----------------------------------" -ForegroundColor Green
Write-Host "To stop the containers, run: docker-compose -f docker-compose-keycloak-postgres.yml down" -ForegroundColor Yellow 