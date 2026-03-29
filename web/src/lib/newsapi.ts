export interface Article {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
}

export interface Meta {
  found: number;
  returned: number;
  limit: number;
  page: number;
}

export interface NewsResponse {
  data: Article[];
  meta: Meta;
}

export async function fetchNews(params: Record<string, string>): Promise<NewsResponse> {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, value);
  }
  
  // Always sort by most recent
  searchParams.append('sort', 'published_on');

  // Use appropriate endpoint based on environment
  // In production (Vercel), use /api/news, in dev use /api/news/all
  const isProduction = window.location.hostname !== 'localhost';
  const endpoint = isProduction ? '/api/news' : '/api/news/all';
  const url = `${endpoint}?${searchParams.toString()}`;
  
  // Log proxied URL for debugging (no token exposed)
  console.log('Fetching:', url);

  const response = await fetch(url);
  
  if (response.status === 429) {
    throw new Error('Daily request limit reached. Please try again later.');
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('TheNewsApi authentication failed. Please check your API token.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}