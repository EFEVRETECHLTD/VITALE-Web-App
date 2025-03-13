# Run script for Instrument Status Page
# This script starts both the backend server and frontend application

Write-Host "Starting Instrument Status Page..." -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Start the backend server
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\server
    npm start
}

Write-Host "Backend server starting on port 3001..." -ForegroundColor Green

# Wait a moment for the server to initialize
Start-Sleep -Seconds 2

# Start the frontend application on port 3002 with hot reloading enabled
$env:PORT = 3002
$env:FAST_REFRESH = "true"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = 3002
    $env:FAST_REFRESH = "true"
    $env:CHOKIDAR_USEPOLLING = "true"
    npm start
}

Write-Host "Frontend application starting on port 3002..." -ForegroundColor Green
Write-Host "Hot reloading is enabled - changes will be applied automatically" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Access the application at: http://localhost:3002" -ForegroundColor Yellow
Write-Host "Backend API is available at: http://localhost:3001" -ForegroundColor Yellow
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
