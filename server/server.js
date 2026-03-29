require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5177;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// News proxy endpoint
app.get('/api/news/all', async (req, res) => {
  try {
    const token = process.env.THENEWSAPI_TOKEN;
    
    if (!token) {
      console.error('THENEWSAPI_TOKEN not configured');
      return res.status(500).json({ error: 'API token not configured' });
    }

    const { page, categories, search, language = 'en', limit = 3 } = req.query;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('api_token', token);
    params.append('language', language);
    params.append('limit', limit);
    
    if (page) params.append('page', page);
    if (categories) params.append('categories', categories);
    if (search) params.append('search', search);

    const url = `https://api.thenewsapi.com/v1/news/all?${params.toString()}`;
    
    // Log proxied URL without token for debugging
    const logUrl = url.replace(token, '***');
    console.log(`Proxying request: ${logUrl}`);

    // Make request to TheNewsApi
    const response = await fetch(url);
    const data = await response.json();

    // Handle different error responses
    if (response.status === 429) {
      return res.status(429).json({ 
        error: 'Daily request limit reached. Please try again later.' 
      });
    }

    if (response.status === 401 || response.status === 403) {
      return res.status(response.status).json({ 
        error: 'TheNewsApi authentication failed. Please check your API token.' 
      });
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});