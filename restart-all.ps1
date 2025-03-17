# Script to stop all running processes and restart the application
Write-Host "=== VITALE Web App Restart Script ===" -ForegroundColor Cyan

# 1. Stop all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | ForEach-Object {
    Write-Host "Stopping process with ID $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "All Node.js processes stopped." -ForegroundColor Green

# 2. Wait for ports to be released
Write-Host "Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 3. Check if ports are free
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Port $port is still in use. Attempting to force close..." -ForegroundColor Red
        foreach ($conn in $connections) {
            if ($conn.OwningProcess -ne 0) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# 4. Wait a bit more to ensure everything is closed
Start-Sleep -Seconds 3

# 5. Restart Docker containers
Write-Host "Restarting Docker containers..." -ForegroundColor Yellow
docker restart vitale-postgres vitale-keycloak
Write-Host "Docker containers restarted." -ForegroundColor Green

# 6. Wait for containers to be fully up
Write-Host "Waiting for containers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 7. Clear browser cache instructions
Write-Host "IMPORTANT: Please clear your browser cache before accessing the application again." -ForegroundColor Magenta
Write-Host "This can typically be done with Ctrl+Shift+Delete in most browsers." -ForegroundColor Magenta

# 8. Start the server
Write-Host "Starting the server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command cd server; npm start"

# 9. Wait for server to start
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 10. Start the UI
Write-Host "Starting the UI..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command npm start"

Write-Host "=== Restart Complete ===" -ForegroundColor Cyan
Write-Host "The application should now be accessible at:" -ForegroundColor Green
Write-Host "- UI: http://localhost:3000" -ForegroundColor Green
Write-Host "- API: http://localhost:3001" -ForegroundColor Green
Write-Host "- Keycloak: http://localhost:8080" -ForegroundColor Green
Write-Host "If you encounter the 'Something is already running on port 3000' message, press Y to use an alternative port." -ForegroundColor Yellow
Write-Host "Login with username 'testuser' and password 'password'" -ForegroundColor Green 