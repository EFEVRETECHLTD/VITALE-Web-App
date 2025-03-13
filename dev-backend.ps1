# Run script for Instrument Status Page Backend only
# This script starts just the backend server

Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Start the backend server directly (not as a job)
Write-Host "Backend server starting on port 3001..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:3001" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Run the backend directly in the current process
Set-Location $PWD\server
npm start 