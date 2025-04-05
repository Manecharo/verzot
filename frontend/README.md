# Verzot Frontend

Amateur soccer tournament management platform.

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Use the following settings:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run vercel-build
   - Output Directory: build

### Manual Deployment

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Navigate to the frontend directory:
   ```
   cd frontend
   ```

3. Run the Vercel deployment command:
   ```
   vercel
   ```

4. Follow the interactive prompts

## Environment Variables

Set the following environment variables in your Vercel project settings:

- `REACT_APP_API_URL`: URL to your backend API
- `REACT_APP_SOCKET_URL`: URL for Socket.io connections
- `CI`: Set to `false` to prevent warnings from breaking the build

## Testing the Deployment

After deploying, test the following features:

1. User registration
2. User login
3. Tournament creation
4. Team management

## Troubleshooting

If you encounter deployment issues:

1. Check the Vercel build logs
2. Ensure all environment variables are set correctly
3. Verify your package.json scripts are configured properly 