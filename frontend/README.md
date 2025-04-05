# Verzot Frontend

Amateur soccer tournament management platform.

## Supabase Integration

This project now uses Supabase for authentication. You need to set up the following:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Project Settings > API
4. Set these values in your environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_USE_SUPABASE=true`

## Deployment to Vercel

### Environment Variables in Vercel

When deploying to Vercel, set the following environment variables in your project settings:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key
- `REACT_APP_USE_SUPABASE`: Set to "true"
- `CI`: Set to "false" to prevent warnings from breaking the build

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

## Testing the Deployment

After deploying, test the following features:

1. User registration
2. User login
3. Tournament creation
4. Team management

## Troubleshooting

If you encounter issues with authentication:

1. Check the browser console for errors
2. Verify that your Supabase environment variables are correctly set
3. Make sure you've entered the correct Supabase URL and anon key 