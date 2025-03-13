#!/bin/bash

# Exit on error
set -e

echo "Starting Render deployment process..."

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Login to Render (if not already logged in)
echo "Authenticating with Render..."
render whoami || render login

# Deploy using render.yaml
echo "Deploying to Render..."
render blueprint apply

echo "Deployment initiated! Check the Render dashboard for progress."
echo "Your application will be available at the URLs provided in the Render dashboard once deployment is complete." 