# PowerShell script to prepare the application for Render deployment

Write-Host "Preparing Instrument Status Page for Render deployment..." -ForegroundColor Green

# Ensure we're in the project root
$projectRoot = $PSScriptRoot

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "Git is installed." -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# Check if the project is a git repository
if (-not (Test-Path -Path "$projectRoot\.git")) {
    Write-Host "This project is not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
}

# Install dependencies for server
Write-Host "Installing server dependencies..." -ForegroundColor Green
Set-Location -Path "$projectRoot\server"
npm install
Set-Location -Path $projectRoot

# Install dependencies for client
Write-Host "Installing client dependencies..." -ForegroundColor Green
npm install

# Create a production build of the client
Write-Host "Creating production build..." -ForegroundColor Green
npm run build

Write-Host "Application is ready for deployment to Render!" -ForegroundColor Green
Write-Host "Follow the instructions in RENDER-DEPLOYMENT.md to deploy your application." -ForegroundColor Green 