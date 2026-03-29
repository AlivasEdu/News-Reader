import { useState, useEffect, useCallback, useRef } from 'react';
import HeadlinesList from './components/HeadlinesList';
import { fetchNews, Article, NewsResponse } from './lib/newsapi';

const CATEGORIES = [
  'tech',
  'general',
  'science',
  'sports',
  'business',
  'health',
  'entertainment',
  'politics',
  'food',
  'travel',
];

interface PageCache {
  [page: number]: NewsResponse;
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const pageCache = useRef<PageCache>({});
  const prefetchedPages = useRef<Set<number>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('news-reader-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        console.error('Failed to parse favorites');
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('news-reader-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const loadPage = useCallback(async (page: number) => {
    // Check cache first
    if (pageCache.current[page]) {
      const cached = pageCache.current[page];
      setArticles(cached.data);
      setTotalPages(Math.ceil(cached.meta.found / cached.meta.limit));
      setCurrentIndex(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { page: page.toString() };
      
      if (activeSearchQuery.trim()) {
        params.search = activeSearchQuery.trim();
      } else {
        params.categories = selectedCategory;
      }

      const data = await fetchNews(params);
      
      // Cache the result
      pageCache.current[page] = data;
      
      setArticles(data.data);
      setTotalPages(Math.ceil(data.meta.found / data.meta.limit));
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, [activeSearchQuery, selectedCategory]);

  // Prefetch logic
  const prefetchPage = useCallback(async (page: number) => {
    if (prefetchedPages.current.has(page) || pageCache.current[page]) {
      return;
    }

    prefetchedPages.current.add(page);

    try {
      const params: Record<string, string> = { page: page.toString() };
      
      if (activeSearchQuery.trim()) {
        params.search = activeSearchQuery.trim();
      } else {
        params.categories = selectedCategory;
      }

      const data = await fetchNews(params);
      pageCache.current[page] = data;
    } catch (err) {
      console.error('Prefetch failed:', err);
    }
  }, [activeSearchQuery, selectedCategory]);

  // Initial load and category/search change
  useEffect(() => {
    // Clear cache when category or search changes
    pageCache.current = {};
    prefetchedPages.current.clear();
    setShowFavorites(false);
    loadPage(1);
  }, [selectedCategory, activeSearchQuery, loadPage]);

  // Prefetch next page when on index 1
  useEffect(() => {
    if (currentIndex === 1 && currentPage < totalPages) {
      prefetchPage(currentPage + 1);
    }
  }, [currentIndex, currentPage, totalPages, prefetchPage]);

  // Prefetch previous page when on index 0 and page > 1
  useEffect(() => {
    if (currentIndex === 0 && currentPage > 1) {
      prefetchPage(currentPage - 1);
    }
  }, [currentIndex, currentPage, prefetchPage]);

  const goToFirst = () => {
    if (showFavorites) {
      setCurrentIndex(0);
      return;
    }
    setCurrentPage(1);
    setCurrentIndex(0);
    loadPage(1);
  };

  const goToPrev = () => {
    if (showFavorites) {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      return;
    }
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentPage > 1) {
      // Move to previous page
      const prevPage = currentPage - 1;
      if (pageCache.current[prevPage]) {
        setCurrentPage(prevPage);
        setArticles(pageCache.current[prevPage].data);
        setCurrentIndex(pageCache.current[prevPage].data.length - 1);
      } else {
        setCurrentPage(prevPage);
        loadPage(prevPage);
      }
    }
  };

  const goToNext = () => {
    if (showFavorites) {
      if (currentIndex < favorites.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      return;
    }
    
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentPage < totalPages) {
      // Move to next page
      const nextPage = currentPage + 1;
      if (pageCache.current[nextPage]) {
        setCurrentPage(nextPage);
        setArticles(pageCache.current[nextPage].data);
        setCurrentIndex(0);
      } else {
        setCurrentPage(nextPage);
        loadPage(nextPage);
      }
    }
  };

  const toggleFavorite = (article: Article) => {
    const isFav = favorites.some(fav => fav.url === article.url);
    if (isFav) {
      setFavorites(favorites.filter(fav => fav.url !== article.url));
    } else {
      setFavorites([...favorites, article]);
    }
  };

  const isFavorite = (article: Article) => {
    return favorites.some(fav => fav.url === article.url);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setActiveSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = () => {
    setActiveSearchQuery(searchQuery);
  };

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites);
    setCurrentIndex(0);
  };

  // Calculate absolute article number
  const absoluteIndex = showFavorites ? currentIndex + 1 : (currentPage - 1) * 3 + currentIndex + 1;
  
  // Determine what to display
  const displayArticles = showFavorites ? favorites : articles;
  const displayIndex = showFavorites ? currentIndex : currentIndex;
  const displayTotal = showFavorites ? favorites.length : (totalPages * 3);

  return (
    <div className="app">
      <aside className={`sidebar ${showFilters ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h1>News Reader</h1>
          <button 
            className="mobile-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search news... (press Enter)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              aria-label="Search news"
            />
          </div>

          <div className="categories">
            <h2>Categories</h2>
            <ul>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`category-btn ${selectedCategory === cat && !searchQuery && !showFavorites ? 'active' : ''}`}
                    onClick={() => {
                      handleCategoryChange(cat);
                      setShowFavorites(false);
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <button 
            className={`favorites-btn ${showFavorites ? 'active' : ''}`}
            onClick={toggleFavoritesView}
          >
            ❤️ Favorites ({favorites.length})
          </button>
        </div>
      </aside>

      <main className="content">
        {showFavorites && (
          <div className="favorites-header">
            <h2>Your Favorites</h2>
            <button onClick={toggleFavoritesView}>Back to News</button>
          </div>
        )}

        {error && (
          <div className="error" role="alert">
            {error}
            <button onClick={() => loadPage(currentPage)}>Retry</button>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading news...</p>
          </div>
        )}

        {!isLoading && !error && displayArticles.length > 0 && (
          <HeadlinesList
            articles={displayArticles}
            currentIndex={displayIndex}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {!isLoading && !error && displayArticles.length === 0 && (
          <div className="empty-state">
            {showFavorites ? (
              <p>No favorites saved yet. Click the heart on any article to save it!</p>
            ) : (
              <p>No articles found. Try a different search or category.</p>
            )}
          </div>
        )}

        {!isLoading && !error && displayArticles.length > 0 && (
          <nav className="pager" aria-label="Article navigation">
            <button 
              onClick={goToFirst} 
              disabled={showFavorites ? currentIndex === 0 : (currentPage === 1 && currentIndex === 0)}
              aria-label="First page"
            >
              «
            </button>
            <button 
              onClick={goToPrev} 
              disabled={showFavorites ? currentIndex === 0 : (currentPage === 1 && currentIndex === 0)}
              aria-label="Previous article"
            >
              ‹
            </button>
            
            <div className="page-dots">
              {(() => {
                const maxDots = 5;
                let start = Math.max(1, absoluteIndex - 2);
                let end = Math.min(displayTotal, start + maxDots - 1);
                
                if (end - start < maxDots - 1) {
                  start = Math.max(1, end - maxDots + 1);
                }
                
                return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(n => (
                  <span 
                    key={n} 
                    className={`dot ${n === absoluteIndex ? 'active' : ''}`}
                  >
                    {n}
                  </span>
                ));
              })()}
            </div>
            
            <button 
              onClick={goToNext} 
              disabled={showFavorites ? currentIndex === displayArticles.length - 1 : (currentPage === totalPages && currentIndex === articles.length - 1)}
              aria-label="Next article"
            >
              ›
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default App;