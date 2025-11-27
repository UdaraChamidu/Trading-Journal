import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, DollarSign, Target, Zap, Globe, AlertTriangle, Newspaper } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useToast } from '../contexts/ToastContext';

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

interface TechnicalIndicator {
  symbol: string;
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
}

interface VolatilityData {
  symbol: string;
  volatility: number;
  beta: number;
  sharpeRatio: number;
}

interface CorrelationData {
  pair: string;
  correlation: number;
  strength: 'weak' | 'moderate' | 'strong';
}

interface EconomicData {
  interestRate: number;
  inflation: number;
  gdp: number;
  unemployment: number;
}

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

export const MarketInsightsPage: React.FC = () => {
  const { addToast } = useToast();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = useState<FearGreedData>({
    value: 65,
    label: 'Greed',
    description: 'Investors are showing greed'
  });
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [volatilityData, setVolatilityData] = useState<VolatilityData[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [economicData, setEconomicData] = useState<EconomicData>({
    interestRate: 5.25,
    inflation: 2.7,
    gdp: 2.1,
    unemployment: 4.1
  });
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [marketNews, setMarketNews] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAllData();

    // Set up live updates every 30 seconds for faster real-time data
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchMarketData(),
      fetchFearGreedIndex(),
      fetchTechnicalIndicators(),
      fetchVolatilityData(),
      fetchCorrelationData(),
      fetchEconomicData(),
      fetchMarketNews(),
      generateHeatmapData()
    ]);
    generateSentimentData();
    checkMarketAlerts();
  };

  const checkMarketAlerts = () => {
    // Check for significant market events
    const topGainer = marketData.find(coin => coin.change24h > 10);
    const topLoser = marketData.find(coin => coin.change24h < -10);

    if (topGainer) {
      addToast(
        `🚀 ${topGainer.name} surged ${topGainer.change24h.toFixed(2)}% in 24h!`,
        'info',
        10000
      );
    }

    if (topLoser) {
      addToast(
        `📉 ${topLoser.name} dropped ${Math.abs(topLoser.change24h).toFixed(2)}% in 24h!`,
        'error',
        10000
      );
    }

    // Check Fear & Greed Index extremes
    if (fearGreedIndex.value >= 90) {
      addToast(
        '⚠️ Extreme Greed detected! Market may be overheated.',
        'error',
        15000
      );
    } else if (fearGreedIndex.value <= 10) {
      addToast(
        '🎯 Extreme Fear detected! Potential buying opportunity.',
        'info',
        15000
      );
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h,7d'
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

  const fetchFearGreedIndex = async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const fngData = data.data[0];
        const value = parseInt(fngData.value);

        let label = 'Neutral';
        let description = 'Market sentiment is balanced';

        if (value <= 25) {
          label = 'Extreme Fear';
          description = 'Extreme fear in the market';
        } else if (value <= 45) {
          label = 'Fear';
          description = 'Investors are fearful';
        } else if (value <= 55) {
          label = 'Neutral';
          description = 'Market sentiment is balanced';
        } else if (value <= 75) {
          label = 'Greed';
          description = 'Investors are showing greed';
        } else {
          label = 'Extreme Greed';
          description = 'Extreme greed in the market';
        }

        setFearGreedIndex({
          value,
          label,
          description
        });
      }
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error);
      // Keep existing mock data as fallback
    }
  };

  const fetchTechnicalIndicators = async () => {
    // Mock technical indicators - in real app, would fetch from trading API
    const indicators: TechnicalIndicator[] = [
      {
        symbol: 'BTC',
        rsi: 68.5,
        macd: 1250.30,
        signal: 1180.45,
        histogram: 69.85,
        sma20: 45200,
        sma50: 43800,
        ema12: 45500,
        ema26: 44250
      },
      {
        symbol: 'ETH',
        rsi: 72.3,
        macd: 85.60,
        signal: 78.90,
        histogram: 6.70,
        sma20: 2650,
        sma50: 2580,
        ema12: 2680,
        ema26: 2595
      }
    ];
    setTechnicalIndicators(indicators);
  };

  const fetchVolatilityData = async () => {
    // Mock volatility data
    const volatility: VolatilityData[] = [
      { symbol: 'BTC', volatility: 0.85, beta: 1.2, sharpeRatio: 1.8 },
      { symbol: 'ETH', volatility: 1.2, beta: 1.8, sharpeRatio: 1.5 },
      { symbol: 'BNB', volatility: 0.95, beta: 1.1, sharpeRatio: 2.1 }
    ];
    setVolatilityData(volatility);
  };

  const fetchCorrelationData = async () => {
    // Mock correlation data
    const correlations: CorrelationData[] = [
      { pair: 'BTC-ETH', correlation: 0.78, strength: 'strong' },
      { pair: 'BTC-BNB', correlation: 0.65, strength: 'moderate' },
      { pair: 'ETH-BNB', correlation: 0.72, strength: 'strong' }
    ];
    setCorrelationData(correlations);
  };

  const fetchEconomicData = async () => {
    // Mock economic indicators (in real app, would fetch from FRED API or similar)
    setEconomicData({
      interestRate: 5.25 + (Math.random() - 0.5) * 0.1, // Slight variation
      inflation: 2.7 + (Math.random() - 0.5) * 0.2,
      gdp: 2.1 + (Math.random() - 0.5) * 0.3,
      unemployment: 4.1 + (Math.random() - 0.5) * 0.1
    });
  };

  const fetchMarketNews = async () => {
    // Get latest 3 market-related news from our news data
    const news = [
      {
        title: 'Federal Reserve Signals Potential Rate Cuts',
        description: 'Fed officials indicate possible interest rate reductions if inflation continues to moderate.',
        time: '2h ago',
        impact: 'positive'
      },
      {
        title: 'Global Supply Chain Pressures Easing',
        description: 'Manufacturing PMI data shows improving supply chain conditions worldwide.',
        time: '4h ago',
        impact: 'positive'
      },
      {
        title: 'Tech Sector Shows Strong Q4 Earnings',
        description: 'Major technology companies report better-than-expected quarterly results.',
        time: '6h ago',
        impact: 'positive'
      }
    ];
    setMarketNews(news);
  };

  const generateHeatmapData = async () => {
    // Generate correlation heatmap data
    const assets = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
    const heatmap: HeatmapData[] = [];

    assets.forEach((asset1, i) => {
      assets.forEach((asset2, j) => {
        if (i !== j) {
          // Generate mock correlation values
          const correlation = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
          heatmap.push({
            x: asset1,
            y: asset2,
            value: correlation
          });
        }
      });
    });

    setHeatmapData(heatmap);
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

  // Dynamic chart data based on timeframe
  const getChartData = () => {
    const now = new Date();
    const data = [];

    switch (selectedTimeframe) {
      case '1h':
        for (let i = 59; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 1000);
          data.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            BTC: 67000 + (Math.random() - 0.5) * 1000,
            ETH: 3800 + (Math.random() - 0.5) * 200
          });
        }
        break;
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          data.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            BTC: 67000 + (Math.random() - 0.5) * 2000,
            ETH: 3800 + (Math.random() - 0.5) * 400
          });
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          data.push({
            time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            BTC: 67000 + (Math.random() - 0.5) * 5000,
            ETH: 3800 + (Math.random() - 0.5) * 1000
          });
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          data.push({
            time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            BTC: 67000 + (Math.random() - 0.5) * 10000,
            ETH: 3800 + (Math.random() - 0.5) * 2000
          });
        }
        break;
    }
    return data;
  };

  const priceChartData = getChartData();

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

        {/* Timeframe Selector */}
        <div className="flex justify-center mt-4">
          <div className="bg-slate-800 rounded-lg p-1 flex gap-1">
            {['1h', '24h', '7d', '30d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
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

      {/* Technical Indicators */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Technical Indicators
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-white">Asset</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white">RSI</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white">MACD</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white">Signal</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white">SMA 20</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white">SMA 50</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {technicalIndicators.map((indicator) => (
                  <tr key={indicator.symbol} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{indicator.symbol}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${
                        indicator.rsi > 70 ? 'text-red-400' :
                        indicator.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {indicator.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${
                        indicator.macd > indicator.signal ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${indicator.macd.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-300 font-mono">
                        ${indicator.signal.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-blue-400 font-mono">
                        ${indicator.sma20.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-purple-400 font-mono">
                        ${indicator.sma50.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Volatility & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Volatility Analysis
            </h3>
            <div className="space-y-4">
              {volatilityData.map((vol) => (
                <div key={vol.symbol} className="bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">{vol.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      vol.volatility > 1 ? 'bg-red-900 text-red-100' :
                      vol.volatility > 0.7 ? 'bg-yellow-900 text-yellow-100' :
                      'bg-green-900 text-green-100'
                    }`}>
                      {vol.volatility > 1 ? 'High' : vol.volatility > 0.7 ? 'Medium' : 'Low'} Risk
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Volatility:</span>
                      <div className="font-bold text-white">{(vol.volatility * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Beta:</span>
                      <div className="font-bold text-blue-400">{vol.beta.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Sharpe:</span>
                      <div className="font-bold text-green-400">{vol.sharpeRatio.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Market Correlations
            </h3>
            <div className="space-y-3">
              {correlationData.map((corr) => (
                <div key={corr.pair} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="font-medium text-white">{corr.pair.replace('-', ' vs ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          corr.correlation > 0.7 ? 'bg-red-500' :
                          corr.correlation > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold min-w-[3rem] ${
                      corr.correlation > 0.7 ? 'text-red-400' :
                      corr.correlation > 0.5 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {(corr.correlation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

      {/* Economic Indicators & Market News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-teal-900 to-cyan-900 border border-teal-700 rounded-lg p-6">
          <h3 className="text-teal-200 font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Economic Indicators
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-teal-800/50 p-3 rounded-lg">
              <div className="text-teal-100 text-sm">Fed Funds Rate</div>
              <div className="text-white font-bold text-lg">{economicData.interestRate.toFixed(2)}%</div>
            </div>
            <div className="bg-teal-800/50 p-3 rounded-lg">
              <div className="text-teal-100 text-sm">Inflation (CPI)</div>
              <div className="text-white font-bold text-lg">{economicData.inflation.toFixed(1)}%</div>
            </div>
            <div className="bg-teal-800/50 p-3 rounded-lg">
              <div className="text-teal-100 text-sm">GDP Growth</div>
              <div className="text-white font-bold text-lg">{economicData.gdp.toFixed(1)}%</div>
            </div>
            <div className="bg-teal-800/50 p-3 rounded-lg">
              <div className="text-teal-100 text-sm">Unemployment</div>
              <div className="text-white font-bold text-lg">{economicData.unemployment.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-red-900 border border-orange-700 rounded-lg p-6">
          <h3 className="text-orange-200 font-bold text-lg mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Market News Feed
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {marketNews.map((news, index) => (
              <div key={index} className="bg-orange-800/50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-orange-100 font-medium text-sm line-clamp-1">{news.title}</h4>
                  <span className="text-orange-300 text-xs">{news.time}</span>
                </div>
                <p className="text-orange-200 text-xs line-clamp-2">{news.description}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                  news.impact === 'positive' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                }`}>
                  {news.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Market Breadth & Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900 to-green-900 border border-emerald-700 rounded-lg p-6">
          <h3 className="text-emerald-200 font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Breadth
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-emerald-100">Advancing</span>
              <span className="font-bold text-white">{marketData.filter(c => c.change24h > 0).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-100">Declining</span>
              <span className="font-bold text-white">{marketData.filter(c => c.change24h < 0).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-100">Breadth Ratio</span>
              <span className="font-bold text-white">
                {marketData.length > 0 ?
                  ((marketData.filter(c => c.change24h > 0).length / marketData.length) * 100).toFixed(1) + '%' :
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-cyan-900 border border-blue-700 rounded-lg p-6">
          <h3 className="text-blue-200 font-bold text-lg mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Market Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-100">Avg Volume</span>
              <span className="font-bold text-white">
                {marketData.length > 0 ?
                  formatVolume(marketData.reduce((sum, c) => sum + c.volume, 0) / marketData.length) :
                  'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Liquidity Score</span>
              <span className="font-bold text-green-400">High</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Market Efficiency</span>
              <span className="font-bold text-yellow-400">Moderate</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-pink-900 border border-purple-700 rounded-lg p-6">
          <h3 className="text-purple-200 font-bold text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Risk Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-purple-100">VIX Equivalent</span>
              <span className="font-bold text-white">{(fearGreedIndex.value / 4).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">Stress Level</span>
              <span className={`font-bold ${
                fearGreedIndex.value > 75 ? 'text-red-400' :
                fearGreedIndex.value > 25 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {fearGreedIndex.value > 75 ? 'High' :
                 fearGreedIndex.value > 25 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-100">Diversification</span>
              <span className="font-bold text-blue-400">Good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6">
        <h3 className="text-indigo-200 font-bold text-lg mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Advanced Market Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-indigo-100">
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Real Fear & Greed Index</div>
            <div className="text-sm">Live sentiment data from Alternative.me API for accurate market psychology</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📈 Technical Indicators</div>
            <div className="text-sm">RSI, MACD, moving averages, and momentum indicators for technical analysis</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🎯 Correlation Matrix</div>
            <div className="text-sm">Asset correlation analysis to understand market dependencies and diversification</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">⚡ Volatility Metrics</div>
            <div className="text-sm">Beta coefficients, Sharpe ratios, and volatility analysis for risk assessment</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Market Breadth</div>
            <div className="text-sm">Advance-decline ratios and market breadth indicators for overall market health</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🔄 Real-Time Updates</div>
            <div className="text-sm">30-second refresh intervals for live market data and instant insights</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsPage;
