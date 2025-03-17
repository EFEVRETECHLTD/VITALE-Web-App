Write-Host "Starting VITALE Web App with PostgreSQL and Keycloak..."
Write-Host "-----------------------------------"

# Set environment variables for PostgreSQL
$env:DB_TYPE = "postgresql"
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5433"
$env:POSTGRES_DB = "vitale"
$env:POSTGRES_USER = "postgres"
$env:POSTGRES_PASSWORD = "postgres"

# Set environment variables for Keycloak
$env:AUTH_TYPE = "keycloak"
$env:KEYCLOAK_URL = "http://localhost:8080"
$env:KEYCLOAK_REALM = "vitale"
$env:KEYCLOAK_CLIENT_ID = "vitale-client"

# Make sure the PostgreSQL and Keycloak containers are running
$containersRunning = docker ps | Select-String "vitale-postgres|vitale-keycloak"
if (-not $containersRunning) {
    Write-Host "Starting PostgreSQL and Keycloak containers..."
    docker-compose -f docker-compose-keycloak-postgres.yml up -d
    Write-Host "Waiting for containers to start..."
    Start-Sleep -Seconds 10
}

# Start the backend server
Write-Host "Starting backend server..."
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-File", ".\server\run-protocol-library.ps1"

# Start the frontend
Write-Host "Starting frontend..."
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command", "npm start"

Write-Host "-----------------------------------"
Write-Host "VITALE Web App is now running!"
Write-Host "Backend: http://localhost:3001"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Keycloak: http://localhost:8080"
Write-Host "-----------------------------------"
Write-Host "Press Ctrl+C to stop all processes"

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # This block will execute when the user presses Ctrl+C
    Write-Host "Stopping all processes..."
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
    Write-Host "All processes stopped."
} 