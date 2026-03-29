export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const token = process.env.THENEWSAPI_TOKEN;
    
    if (!token) {
      console.error('THENEWSAPI_TOKEN not configured');
      return res.status(500).json({ error: 'API token not configured' });
    }

    const { page, categories, search, language = 'en', limit = 3, sort = 'published_on' } = req.query;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('api_token', token);
    params.append('language', language);
    params.append('limit', limit);
    params.append('sort', sort);
    
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
}