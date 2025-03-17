Write-Host "Starting Protocol Library Server..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green
Write-Host "Protocol Library server starting on port 3001..." -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green
Write-Host "API will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

# Set environment variables
$env:DB_ADAPTER = "inmemory"
$env:AUTH_ADAPTER = "jwt"
$env:PORT = 3001

# Run the server
# Change to the server directory and run the script from there
cd $PSScriptRoot
node protocol-library-server.js 