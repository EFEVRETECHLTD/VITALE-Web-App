# Deploying to Render

This document provides instructions for deploying the Instrument Status Page application to Render's free tier.

## Prerequisites

1. A [Render account](https://render.com/signup)
2. Git repository with your code (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Easiest)

1. **Log in to your Render account** at https://dashboard.render.com/

2. **Connect your Git repository**:
   - Click on "New" and select "Blueprint" from the dropdown
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select the repository containing your application
   - Render will automatically detect the `render.yaml` file and configure your services

3. **Review and Deploy**:
   - Review the services that will be created
   - Click "Apply" to start the deployment process
   - Render will create and deploy all services defined in your `render.yaml` file

4. **Access Your Application**:
   - Once deployment is complete, you can access your application at the URLs provided in the Render dashboard
   - The frontend will be available at `https://instrument-status-frontend.onrender.com`
   - The API will be available at `https://instrument-status-api.onrender.com`

### Option 2: Deploy via Render CLI

1. **Install the Render CLI**:
   ```
   npm install -g @render/cli
   ```

2. **Log in to Render via CLI**:
   ```
   render login
   ```

3. **Deploy using the blueprint**:
   ```
   render blueprint apply
   ```

4. **Monitor deployment**:
   - Check the Render dashboard for deployment progress
   - Once complete, your application will be available at the provided URLs

## Environment Variables

The `render.yaml` file configures most environment variables automatically, but you may need to set the following manually in the Render dashboard:

- `MONGODB_URI`: Connection string for your MongoDB database (automatically set if using Render's MongoDB service)
- Any other sensitive credentials not included in the `render.yaml` file

## Troubleshooting

If you encounter issues during deployment:

1. **Check Logs**: View service logs in the Render dashboard
2. **Verify Environment Variables**: Ensure all required environment variables are set correctly
3. **Check Build Errors**: Review build logs for any compilation or dependency issues
4. **Database Connection**: Verify that the MongoDB connection string is correct and accessible

## Limitations of Free Tier

Be aware of the following limitations on Render's free tier:

- **Sleep after inactivity**: Web services on the free tier will sleep after 15 minutes of inactivity
- **Startup delay**: There may be a delay of up to 30 seconds when accessing the service after it has been sleeping
- **Limited resources**: Free tier has limited CPU and memory resources
- **Monthly usage limits**: Free tier has usage limits that reset monthly

For production use, consider upgrading to a paid plan for better performance and reliability. 