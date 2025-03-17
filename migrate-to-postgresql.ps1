Write-Host "Migrating protocols to PostgreSQL database..."
Write-Host "-----------------------------------"

# Store current directory
$currentDir = Get-Location

try {
    # Change to the server directory
    Set-Location "$currentDir\server"
    
    # Make sure the PostgreSQL container is running
    $postgresRunning = docker ps | Select-String "vitale-postgres"
    if (-not $postgresRunning) {
        Write-Host "PostgreSQL container is not running. Starting it now..."
        Set-Location $currentDir
        docker-compose -f docker-compose-keycloak-postgres.yml up -d postgres
        Start-Sleep -Seconds 5  # Wait for PostgreSQL to start
        Set-Location "$currentDir\server"
    }
    
    # Run the migration script
    node scripts/migrate-to-postgresql.js
    
    Write-Host "-----------------------------------"
    Write-Host "Migration complete!"
    Write-Host "-----------------------------------"
} catch {
    Write-Host "Error: $_"
} finally {
    # Return to the original directory
    Set-Location $currentDir
} 