param (
    [int]$ProtocolCount = 5000
)

Write-Host "Generating $ProtocolCount protocols in MongoDB..."
Write-Host "-----------------------------------"

# Store current directory
$currentDir = Get-Location

try {
    # Change to the server directory
    Set-Location "$currentDir\server"
    
    # Run the protocol generation script
    node generate-mongodb-protocols.js $ProtocolCount
    
    Write-Host "-----------------------------------"
    Write-Host "Protocol generation complete!"
    Write-Host "MongoDB now contains $ProtocolCount additional protocols"
    Write-Host "-----------------------------------"
} catch {
    Write-Host "Error: $_"
} finally {
    # Return to the original directory
    Set-Location $currentDir
} 