# Run script for Instrument Status Page with Protocol Generation
# This script starts both the backend server and frontend application
# and optionally generates hundreds of test protocols

param (
    [int]$ProtocolCount = 0  # Default to 0 (no generation)
)

Write-Host "Starting Instrument Status Page..." -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Generate protocols if requested
if ($ProtocolCount -gt 0) {
    Write-Host "Generating $ProtocolCount test protocols..." -ForegroundColor Magenta
    $currentDir = Get-Location
    Set-Location "$currentDir\server"
    node generate-test-protocols.js $ProtocolCount
    Set-Location $currentDir
    Write-Host "Protocol generation complete!" -ForegroundColor Magenta
    Write-Host "-----------------------------------" -ForegroundColor Cyan
}

# Set environment variables for the server
$env:ALLOW_IN_MEMORY = "true"
$env:USE_MONGODB = "false"
$env:NODE_ENV = "development"
$env:JWT_SECRET = "your_jwt_secret_key_here"

# Start the backend server
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\server
    $env:ALLOW_IN_MEMORY = "true"
    $env:USE_MONGODB = "false"
    $env:NODE_ENV = "development"
    $env:JWT_SECRET = "your_jwt_secret_key_here"
    npm start
}

Write-Host "Backend server starting on port 3001..." -ForegroundColor Green

# Wait a moment for the server to initialize
Start-Sleep -Seconds 2

# Start the frontend application on port 3002
$env:PORT = 3002
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = 3002
    npm start
}

Write-Host "Frontend application starting on port 3002..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Access the application at: http://localhost:3002" -ForegroundColor Yellow
Write-Host "Backend API is available at: http://localhost:3001" -ForegroundColor Yellow
if ($ProtocolCount -gt 0) {
    Write-Host "Database contains $ProtocolCount additional test protocols" -ForegroundColor Yellow
}
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Red

# Wait for jobs to complete or user to cancel
try {
    while ($true) {
        # Display any new output from the jobs
        Receive-Job -Job $serverJob
        Receive-Job -Job $frontendJob
        Start-Sleep -Seconds 1
    }
} finally {
    # Clean up jobs when script is terminated
    Stop-Job -Job $serverJob, $frontendJob
    Remove-Job -Job $serverJob, $frontendJob -Force
    Write-Host "Services stopped." -ForegroundColor Cyan
} 