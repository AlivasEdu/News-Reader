# Deploying to Vercel

## Prerequisites

1. A Vercel account ([vercel.com](https://vercel.com))
2. A TheNewsApi API token

## Deployment Steps

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Connect Your Repository

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration

**Option B: Via CLI**
```bash
vercel
```

### 3. Configure Environment Variables

In your Vercel project settings, add the environment variable:

- **Name:** `THENEWSAPI_TOKEN`
- **Value:** Your TheNewsApi API token
- **Environment:** Production, Preview, Development

### 4. Deploy

**Automatic Deployment:**
- Push to your main branch and Vercel will auto-deploy

**Manual Deployment:**
```bash
vercel --prod
```

## Project Structure for Vercel

```
news-reader/
├── api/
│   └── news.js          # Serverless API function
├── web/
│   ├── src/             # React frontend source
│   ├── package.json     # Frontend dependencies
│   └── ...
├── vercel.json          # Vercel configuration
└── .env.example         # Environment variable template
```

## How It Works

1. **Frontend:** Built as a static site using Vite
2. **API:** Runs as a serverless function at `/api/news`
3. **Routing:** Vercel routes `/api/*` to the serverless function

## Important Notes

- The API token is stored securely as a Vercel environment variable
- CORS is handled in the serverless function
- The frontend automatically detects production vs development environment

## Local Development

For local development, continue using:
```bash
npm run dev
```

This runs both the Vite dev server and the Express proxy locally.

## Troubleshooting

1. **API not working:** Check that `THENEWSAPI_TOKEN` is set in Vercel environment variables
2. **Build fails:** Ensure `npm run build` works locally first
3. **CORS errors:** The API function includes CORS headers, but check browser console for details