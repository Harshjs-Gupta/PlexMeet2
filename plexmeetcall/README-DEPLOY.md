# Deploying PlexMeetCall to Vercel

This guide explains how to deploy the PlexMeetCall application to Vercel with Socket.io support.

## Pre-deployment Steps

1. Ensure your code is pushed to a Git repository (GitHub, GitLab, etc.)

2. Make sure you have the following files in your repository:
   - `server-prod.js`: Custom Node.js server that integrates Next.js with Socket.io
   - `vercel.json`: Configuration file for Vercel deployment
   - `.env.production`: Environment variables for production

## Deploying to Vercel

1. Create an account on [Vercel](https://vercel.com) if you don't have one already

2. Import your Git repository:

   - Click "New Project"
   - Select your repository
   - Click "Import"

3. Configure project settings:

   - **Framework Preset**: Select "Other" (not Next.js, since we're using a custom server)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install` (or `pnpm install` if using pnpm)

4. Add environment variables:

   - Click on "Environment Variables"
   - Add a variable named `NEXT_PUBLIC_SOCKET_SERVER_URL` with the value of your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`)

5. Click "Deploy"

## Testing the Deployment

1. Once deployed, your application should be accessible at the Vercel URL provided.

2. Test the video calling functionality to ensure Socket.io is working correctly.

## Troubleshooting

If you encounter issues with Socket.io connections:

1. Check the browser console for connection errors
2. Verify that the `NEXT_PUBLIC_SOCKET_SERVER_URL` is set correctly
3. Ensure the Socket.io path in `socketProvider.tsx` matches the one in `server-prod.js`

## Additional Notes

- This deployment uses Vercel's Node.js serverless functions to run the Socket.io server
- The `server-prod.js` file ensures that Socket.io works in a serverless environment
- For local development, you can continue using the original `server.js` file with `npm run dev:socket`
