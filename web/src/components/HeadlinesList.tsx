import React from 'react';
import { Article } from '../lib/newsapi';

interface HeadlinesListProps {
  articles: Article[];
  currentIndex: number;
  onToggleFavorite: (article: Article) => void;
  isFavorite: (article: Article) => boolean;
}

function HeadlinesList({ articles, currentIndex, onToggleFavorite, isFavorite }: HeadlinesListProps) {
  const currentArticle = articles[currentIndex];

  if (!currentArticle) {
    return null;
  }

  const placeholderImage = '/placeholder.png';
  
  // Check if image_url is valid, otherwise use placeholder
  const isValidImageUrl = currentArticle.image_url && 
    currentArticle.image_url.trim() !== '' && 
    !currentArticle.image_url.includes('placeholder');
  
  const imageUrl = isValidImageUrl ? currentArticle.image_url : placeholderImage;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Only set placeholder if not already showing it
    if (target.src !== placeholderImage && !target.src.endsWith('placeholder.png')) {
      target.src = placeholderImage;
    }
  };

  // Format the published date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMins = Math.floor(diffTime / (1000 * 60));
          return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="article-container">
      <article className="article-card" role="article">
        <img
          className="article-image"
          src={imageUrl}
          alt={currentArticle.title || 'News article image'}
          onError={handleImageError}
        />
        <div className="article-overlay">
          {currentArticle.source && (
            <span className="article-source">{currentArticle.source}</span>
          )}
          <h2 className="article-title">{currentArticle.title}</h2>
          {currentArticle.description && (
            <p className="article-description">{currentArticle.description}</p>
          )}
          {currentArticle.published_at && (
            <p className="article-date">{formatDate(currentArticle.published_at)}</p>
          )}
          <div className="article-actions">
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="article-link"
              onClick={(e) => e.stopPropagation()}
            >
              View Full Article
            </a>
            <button
              className={`favorite-btn ${isFavorite(currentArticle) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(currentArticle);
              }}
              aria-label={isFavorite(currentArticle) ? 'Remove from favorites' : 'Save to favorites'}
            >
              {isFavorite(currentArticle) ? '❤️ Saved' : '🤍 Save to Favorites'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default HeadlinesList;