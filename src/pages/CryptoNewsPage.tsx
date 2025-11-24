import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink, Search, Filter, Star, BookOpen, Zap } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export const CryptoNewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All News', icon: Newspaper },
    { id: 'bitcoin', name: 'Bitcoin', icon: TrendingUp },
    { id: 'ethereum', name: 'Ethereum', icon: Zap },
    { id: 'market', name: 'Market Analysis', icon: TrendingDown },
    { id: 'regulation', name: 'Regulation', icon: BookOpen },
    { id: 'defi', name: 'DeFi', icon: Star }
  ];

  useEffect(() => {
    fetchNews();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, selectedCategory, selectedSource]);

  const fetchNews = async () => {
    try {
      // Using NewsAPI for crypto news (you would need to get a free API key)
      // For demo purposes, we'll use mock data
      const mockNews: NewsArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
          description: 'Major institutions continue to add Bitcoin to their portfolios, driving prices to unprecedented levels. Tesla, MicroStrategy, and other corporations lead the charge.',
          url: 'https://example.com/bitcoin-ath',
          urlToImage: 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Bitcoin+News',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: { name: 'CryptoNews Daily' },
          category: 'bitcoin',
          sentiment: 'positive'
        },
        {
          id: '2',
          title: 'Ethereum 2.0 Staking Rewards Hit New Records',
          description: 'The latest Ethereum network upgrade has resulted in higher staking rewards, attracting more validators and increasing network security.',
          url: 'https://example.com/ethereum-staking',
          urlToImage: 'https://via.placeholder.com/400x250/2d1b69/ffffff?text=Ethereum+Update',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          source: { name: 'ETH News Hub' },
          category: 'ethereum',
          sentiment: 'positive'
        },
        {
          id: '3',
          title: 'Crypto Market Analysis: Key Trends and Predictions',
          description: 'Leading analysts predict continued growth in the cryptocurrency market with increased institutional participation and regulatory clarity.',
          url: 'https://example.com/market-analysis',
          urlToImage: 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Market+Analysis',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          source: { name: 'MarketWatch Crypto' },
          category: 'market',
          sentiment: 'neutral'
        },
        {
          id: '4',
          title: 'New Regulatory Framework Proposed for Crypto Exchanges',
          description: 'Government officials propose comprehensive regulations to protect investors while fostering innovation in the cryptocurrency space.',
          url: 'https://example.com/regulation',
          urlToImage: 'https://via.placeholder.com/400x250/7c2d12/ffffff?text=Regulation+News',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          source: { name: 'Financial Times' },
          category: 'regulation',
          sentiment: 'neutral'
        },
        {
          id: '5',
          title: 'DeFi TVL Reaches $200 Billion Milestone',
          description: 'Decentralized Finance protocols continue to grow with Total Value Locked reaching new heights, driven by innovative yield farming strategies.',
          url: 'https://example.com/defi-tvl',
          urlToImage: 'https://via.placeholder.com/400x250/0f766e/ffffff?text=DeFi+Update',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          source: { name: 'DeFi Pulse' },
          category: 'defi',
          sentiment: 'positive'
        }
      ];

      setNews(mockNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('crypto-news-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('crypto-news-favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (newsId: string) => {
    const newFavorites = favorites.includes(newsId)
      ? favorites.filter(id => id !== newsId)
      : [...favorites, newsId];
    saveFavorites(newFavorites);
  };

  const filterNews = () => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(article => article.source.name === selectedSource);
    }

    setFilteredNews(filtered);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/20';
      case 'negative': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const uniqueSources = Array.from(new Set(news.map(article => article.source.name)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading crypto news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-cyan-500/25">
          <Newspaper className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Crypto News Hub</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Stay updated with the latest cryptocurrency news</p>
        <p className="text-sm text-gray-500">Curated news from trusted crypto sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="lg:w-64">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-gray-300 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No news articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredNews.map((article) => (
            <div key={article.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="relative">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Crypto+News';
                  }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {article.sentiment && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSentimentColor(article.sentiment)}`}>
                      {article.sentiment}
                    </span>
                  )}
                  <span className="bg-slate-900/80 text-white px-2 py-1 rounded-full text-xs">
                    {article.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorite(article.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                    favorites.includes(article.id)
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-900/80 text-gray-400 hover:bg-yellow-600 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${favorites.includes(article.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                  <span className="font-medium text-cyan-400">{article.source.name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(article.publishedAt)}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* News Insights */}
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-700 rounded-lg p-6">
        <h3 className="text-cyan-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          News Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-cyan-100">
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📰 Curated Content</div>
            <div className="text-sm">Handpicked news from trusted crypto sources</div>
          </div>
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🎯 Smart Filtering</div>
            <div className="text-sm">Filter by category, source, and keywords</div>
          </div>
          <div className="bg-cyan-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">⭐ Save Favorites</div>
            <div className="text-sm">Bookmark important articles for later reading</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoNewsPage;
