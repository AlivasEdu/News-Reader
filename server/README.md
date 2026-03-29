# News Reader Server

Express proxy server for TheNewsApi.

## Setup

1. Copy `.env.example` to `.env` in the root directory
2. Add your TheNewsApi token to `.env`:
   ```
   THENEWSAPI_TOKEN=your_actual_token_here
   ```

## Running

```bash
npm install
node server.js
```

Server runs on port 5177 by default.

## Endpoints

- `GET /api/health` - Health check
- `GET /api/news/all` - Proxy to TheNewsApi
  - Query params: `page`, `categories`, `search`, `language` (default: en), `limit` (default: 3)