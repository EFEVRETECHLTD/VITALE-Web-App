Write-Host "Starting VITALE Protocol Library Single Page App..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

# Start the backend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\server\run-protocol-library.ps1"

# Wait a moment for the backend to start
Start-Sleep -Seconds 2

# Set environment variables for the frontend
$env:REACT_APP_API_URL = "http://localhost:3001"
$env:REACT_APP_SINGLE_PAGE_MODE = "true"

# Start the frontend
Write-Host "Starting frontend..." -ForegroundColor Green
Write-Host "Single Page Application will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green
npm start 