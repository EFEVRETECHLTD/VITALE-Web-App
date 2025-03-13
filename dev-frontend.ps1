# Run script for Instrument Status Page Frontend only
# This script starts just the frontend application with hot reloading enabled

Write-Host "Starting Frontend in Development Mode..." -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Make sure the backend server is already running on port 3001" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Set environment variables for hot reloading
$env:PORT = 3002
$env:FAST_REFRESH = "true"
$env:CHOKIDAR_USEPOLLING = "true"
$env:BROWSER = "none"  # Prevent opening browser automatically

# Start the frontend application directly (not as a job)
Write-Host "Frontend application starting on port 3002..." -ForegroundColor Green
Write-Host "Hot reloading is enabled - changes will be applied automatically" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Access the application at: http://localhost:3002" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Run the frontend directly in the current process
Set-Location $PWD
npm start
