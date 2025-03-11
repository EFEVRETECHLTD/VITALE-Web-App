Write-Host "Starting Instrument Status Page with MongoDB..."
Write-Host "-----------------------------------"

# Store current directory
$currentDir = Get-Location

# Set environment variables
$env:ALLOW_IN_MEMORY = "true"
$env:USE_MONGODB = "true"
$env:MONGODB_URI = "mongodb://localhost:27017/instrument-status"

# Start the backend server
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$currentDir\server"

# Wait a moment for the backend to start
Start-Sleep -Seconds 2

# Start the frontend application
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$currentDir"

Write-Host "-----------------------------------"
Write-Host "Backend server starting on port 3001..."
Write-Host "Frontend application starting on port 3002..."
Write-Host "-----------------------------------"
Write-Host "Access the application at: http://localhost:3002"
Write-Host "Backend API is available at: http://localhost:3001"
Write-Host "Using MongoDB for data storage"
Write-Host "-----------------------------------"
Write-Host "Press Ctrl+C to stop both services"

# Keep the script running
while ($true) {
    Start-Sleep -Seconds 1
} 