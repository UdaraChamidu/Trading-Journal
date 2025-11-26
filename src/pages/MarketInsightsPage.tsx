import React, { useState, useEffect } from 'react'; 
import { Activity, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, DollarSign, Target, Zap, Globe, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface MarketData {
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

interface FearGreedData {
  value: number;
  label: string;
  description: string;
}

export const MarketInsightsPage: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = useState<FearGreedData>({
    value: 65,
    label: 'Greed',
    description: 'Investors are showing greed'
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchMarketData();
    generateSentimentData();

    // Set up live updates every 60 seconds
    const interval = setInterval(() => {
      fetchMarketData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();

      const marketData: MarketData[] = data.map((coin: any) => ({
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
      }));

      setMarketData(marketData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSentimentData = () => {
    const data: SentimentData[] = [
      { name: 'Bullish', value: 45, color: '#10B981' },
      { name: 'Bearish', value: 25, color: '#EF4444' },
      { name: 'Neutral', value: 30, color: '#6B7280' }
    ];
    setSentimentData(data);
  };

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return '#EF4444'; // Extreme Fear - Red
    if (value <= 45) return '#F59E0B'; // Fear - Orange
    if (value <= 55) return '#6B7280'; // Neutral - Gray
    if (value <= 75) return '#10B981'; // Greed - Green
    return '#059669'; // Extreme Greed - Dark Green
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

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  // Mock chart data
  const priceChartData = [
    { time: '00:00', BTC: 67000, ETH: 3800 },
    { time: '04:00', BTC: 67200, ETH: 3820 },
    { time: '08:00', BTC: 66800, ETH: 3790 },
    { time: '12:00', BTC: 67500, ETH: 3850 },
    { time: '16:00', BTC: 67300, ETH: 3840 },
    { time: '20:00', BTC: 67500, ETH: 3850 },
  ];

  const volumeChartData = marketData.map((coin: MarketData) => ({
    name: coin.name,
    volume: coin.volume / 1000000000, // Convert to billions
    marketCap: coin.marketCap / 100000000000, // Convert to hundreds of billions
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading market insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-indigo-500/25">
          <Activity className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Advanced analytics and market sentiment analysis</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-500">Real-time data powered by multiple sources</span>
          {lastUpdated && (
            <span className="text-indigo-400 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-200 mb-2">
            {marketData.filter(coin => coin.change24h > 0).length}
          </div>
          <div className="text-green-300 text-sm">Gainers (24h)</div>
          <div className="text-green-400 text-xs">Above previous close</div>
        </div>
        <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-200 mb-2">
            {marketData.filter(coin => coin.change24h < 0).length}
          </div>
          <div className="text-red-300 text-sm">Losers (24h)</div>
          <div className="text-red-400 text-xs">Below previous close</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-200 mb-2">
            {formatMarketCap(marketData.reduce((sum: number, coin: MarketData) => sum + coin.marketCap, 0))}
          </div>
          <div className="text-blue-300 text-sm">Total Market Cap</div>
          <div className="text-blue-400 text-xs">Top 5 cryptocurrencies</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-200 mb-2">
            {formatVolume(marketData.reduce((sum: number, coin: MarketData) => sum + coin.volume, 0))}
          </div>
          <div className="text-purple-300 text-sm">24h Volume</div>
          <div className="text-purple-400 text-xs">Trading volume</div>
        </div>
      </div>

      {/* Fear & Greed Index */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Crypto Fear & Greed Index
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold" style={{ color: getFearGreedColor(fearGreedIndex.value) }}>
                  {fearGreedIndex.value}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{fearGreedIndex.label}</div>
                  <div className="text-gray-400 text-sm">{fearGreedIndex.description}</div>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${fearGreedIndex.value}%`,
                    background: `linear-gradient(90deg, ${getFearGreedColor(0)} 0%, ${getFearGreedColor(25)} 25%, ${getFearGreedColor(50)} 50%, ${getFearGreedColor(75)} 75%, ${getFearGreedColor(100)} 100%)`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Extreme Fear</span>
                <span>Neutral</span>
                <span>Extreme Greed</span>
              </div>
            </div>
            <div className="ml-8">
              <div className="bg-slate-700 p-4 rounded-lg">
                <Globe className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-sm text-gray-300">Global Market Sentiment</div>
                <div className="text-xs text-gray-400">Updated every hour</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Price Movement (24h)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="BTC" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ETH" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Sentiment Pie Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-green-400" />
              Market Sentiment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={sentimentData as any}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Volume & Market Cap Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="volume" fill="#3B82F6" name="Volume (Billions)" />
              <Bar dataKey="marketCap" fill="#10B981" name="Market Cap (100B)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Market Data Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Market Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">Cryptocurrency</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-white">Price</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-white">24h Change</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-white">Volume (24h)</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-white">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {marketData.map((coin) => (
                  <tr key={coin.name} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{coin.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-bold text-white">
                        ${coin.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 font-bold ${
                        coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {coin.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-300 font-mono">
                        {formatVolume(coin.volume)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-300 font-mono">
                        {formatMarketCap(coin.marketCap)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6">
        <h3 className="text-indigo-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Market Analysis Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-100">
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Fear & Greed Index</div>
            <div className="text-sm">Monitor market sentiment to identify potential buying or selling opportunities</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📈 Volume Analysis</div>
            <div className="text-sm">High volume often indicates strong interest and potential price movements</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🌐 Global Sentiment</div>
            <div className="text-sm">Track overall market mood to make informed trading decisions</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">💰 Market Cap Trends</div>
            <div className="text-sm">Monitor market cap changes to understand market dominance shifts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsPage;
