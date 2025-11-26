import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Star, DollarSign, BarChart3, Activity, Coins } from 'lucide-react';

interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export const CryptoPricesPage: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'price_change_percentage_24h'>('market_cap');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchCryptos();
    loadFavorites();

    // Set up live updates every 60 seconds
    const interval = setInterval(() => {
      fetchCryptos();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortCryptos();
  }, [cryptos, searchTerm, sortBy]);

  const fetchCryptos = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h'
      );
      const data = await response.json();
      setCryptos(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('crypto-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('crypto-favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (cryptoId: string) => {
    const newFavorites = favorites.includes(cryptoId)
      ? favorites.filter(id => id !== cryptoId)
      : [...favorites, cryptoId];
    saveFavorites(newFavorites);
  };

  const filterAndSortCryptos = () => {
    let filtered = cryptos.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'price':
          return b.current_price - a.current_price;
        case 'price_change_percentage_24h':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        default:
          return 0;
      }
    });

    setFilteredCryptos(filtered);
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 100) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading crypto prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-green-500/25">
          <DollarSign className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Live Crypto Prices</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Real-time cryptocurrency market data</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-500">Powered by CoinGecko API</span>
          {lastUpdated && (
            <span className="text-green-400 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sort */}
            <div className="md:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="market_cap">Sort by Market Cap</option>
                <option value="price">Sort by Price</option>
                <option value="price_change_percentage_24h">Sort by 24h Change</option>
              </select>
            </div>
          </div>

          {/* Favorites Filter */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-gray-300 text-sm">Show:</span>
            <button
              onClick={() => setFilteredCryptos(searchTerm ? filteredCryptos : cryptos)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
            >
              All Cryptos
            </button>
            <button
              onClick={() => setFilteredCryptos(cryptos.filter(crypto => favorites.includes(crypto.id)))}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-200 mb-2">{filteredCryptos.length}</div>
          <div className="text-blue-300 text-sm">Total Cryptos</div>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-200 mb-2">
            {filteredCryptos.filter(c => c.price_change_percentage_24h > 0).length}
          </div>
          <div className="text-green-300 text-sm">Gainers (24h)</div>
        </div>
        <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-200 mb-2">
            {filteredCryptos.filter(c => c.price_change_percentage_24h < 0).length}
          </div>
          <div className="text-red-300 text-sm">Losers (24h)</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-200 mb-2">{favorites.length}</div>
          <div className="text-purple-300 text-sm">Favorites</div>
        </div>
      </div>

      {/* Crypto Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-400" />
            Cryptocurrency Prices
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">#</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">24h Change</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">Market Cap</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">Volume (24h)</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCryptos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No cryptocurrencies found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCryptos.map((crypto, index) => (
                  <tr key={crypto.id} className="hover:bg-slate-700/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-medium">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-white font-medium">{crypto.name}</div>
                          <div className="text-gray-400 text-sm uppercase">{crypto.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-mono font-bold">
                        {formatPrice(crypto.current_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 font-bold ${
                        crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-300 font-mono">
                        {formatMarketCap(crypto.market_cap)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-300 font-mono">
                        {formatMarketCap(crypto.total_volume)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleFavorite(crypto.id)}
                        className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                          favorites.includes(crypto.id)
                            ? 'bg-yellow-600 text-white'
                            : 'bg-slate-600 text-gray-400 hover:bg-yellow-600 hover:text-white'
                        }`}
                        title={favorites.includes(crypto.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${favorites.includes(crypto.id) ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 rounded-lg p-6">
        <h3 className="text-green-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-100">
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🔍 Real-time Data</div>
            <div className="text-sm">Live prices update every 30 seconds from CoinGecko</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">⭐ Watchlist</div>
            <div className="text-sm">Save your favorite cryptocurrencies for quick access</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Market Analysis</div>
            <div className="text-sm">24h price changes and market cap rankings</div>
          </div>
          <div className="bg-green-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">💰 Trading Ready</div>
            <div className="text-sm">Perfect for researching before making trades</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPricesPage;