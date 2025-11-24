import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  target_price: number;
  current_price: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered' | 'paused';
  created_at: string;
  triggered_at?: string;
}

export const PriceAlertsPage: React.FC = () => {
  const { session } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    name: '',
    target_price: 0,
    condition: 'above' as 'above' | 'below'
  });

  useEffect(() => {
    if (session) {
      fetchAlerts();
      fetchCryptoPrices();
    }
  }, [session]);

  useEffect(() => {
    // Check alerts against current prices
    checkAlerts();
  }, [alerts, cryptoPrices]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      // Fetch prices for common cryptocurrencies
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,polkadot,matic-network,chainlink,avalanche-2,uniswap&vs_currencies=usd'
      );
      const data = await response.json();
      
      const prices: Record<string, number> = {};
      const symbolMap: Record<string, string> = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'binancecoin': 'BNB',
        'cardano': 'ADA',
        'solana': 'SOL',
        'polkadot': 'DOT',
        'matic-network': 'MATIC',
        'chainlink': 'LINK',
        'avalanche-2': 'AVAX',
        'uniswap': 'UNI'
      };

      Object.entries(data).forEach(([id, priceData]: [string, any]) => {
        prices[symbolMap[id] || id.toUpperCase()] = priceData.usd;
      });
      setCryptoPrices(prices);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const checkAlerts = () => {
    alerts.forEach(alert => {
      if (alert.status === 'active') {
        const currentPrice = cryptoPrices[alert.symbol];
        if (currentPrice) {
          const shouldTrigger = 
            (alert.condition === 'above' && currentPrice >= alert.target_price) ||
            (alert.condition === 'below' && currentPrice <= alert.target_price);

          if (shouldTrigger) {
            triggerAlert(alert.id);
          }
        }
      }
    });
  };

  const triggerAlert = async (alertId: string) => {
    try {
      await supabase
        .from('price_alerts')
        .update({ 
          status: 'triggered',
          triggered_at: new Date().toISOString()
        })
        .eq('id', alertId);

      // Show notification (you can implement browser notifications here)
      if (Notification.permission === 'granted') {
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
          new Notification('Price Alert Triggered!', {
            body: `${alert.symbol} has ${alert.condition} your target price of $${alert.target_price}`,
            icon: '/favicon.ico'
          });
        }
      }

      // Refresh alerts
      fetchAlerts();
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  };

  const handleAddAlert = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert([
          {
            user_id: session?.user?.id,
            symbol: newAlert.symbol.toUpperCase(),
            name: newAlert.name,
            target_price: newAlert.target_price,
            current_price: cryptoPrices[newAlert.symbol.toUpperCase()] || 0,
            condition: newAlert.condition,
            status: 'active'
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setAlerts([data[0], ...alerts]);
      }

      setShowAddModal(false);
      setNewAlert({ symbol: '', name: '', target_price: 0, condition: 'above' });
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleToggleStatus = async (alert: PriceAlert) => {
    const newStatus = alert.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ status: newStatus })
        .eq('id', alert.id);

      if (error) throw error;

      setAlerts(alerts.map(a => 
        a.id === alert.id ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading price alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-yellow-500/25">
          <Bell className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Get notified when cryptocurrencies reach your target prices</p>
        <p className="text-sm text-gray-500">
          {alerts.filter(a => a.status === 'active').length} active alerts • 
          {alerts.filter(a => a.status === 'triggered').length} triggered
        </p>
      </div>

      {/* Add Alert Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-yellow-400" />
          Your Price Alerts
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Alert
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Price Alerts Yet</h3>
            <p className="text-gray-400 mb-4">Set up alerts to get notified when cryptocurrencies reach your target prices</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {alerts.map((alert) => {
              const currentPrice = cryptoPrices[alert.symbol];
              const priceDiff = currentPrice - alert.target_price;
              const isNearTarget = Math.abs(priceDiff) / alert.target_price < 0.05; // Within 5%
              
              return (
                <div key={alert.id} className="p-6 hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{alert.symbol}</h3>
                        <span className="text-gray-400 text-sm">{alert.name}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          alert.status === 'active' ? 'bg-green-900 text-green-100' :
                          alert.status === 'triggered' ? 'bg-yellow-900 text-yellow-100' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {alert.status}
                        </div>
                        {isNearTarget && alert.status === 'active' && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-900 text-orange-100">
                            Near Target
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Current Price:</span>
                          <div className="font-mono font-bold text-white">
                            {currentPrice ? formatCurrency(currentPrice) : 'Loading...'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Target Price:</span>
                          <div className="font-mono font-bold text-white">
                            {formatCurrency(alert.target_price)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Condition:</span>
                          <div className={`font-bold flex items-center gap-1 ${
                            alert.condition === 'above' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {alert.condition === 'above' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {alert.condition === 'above' ? 'Above' : 'Below'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            {alert.status === 'triggered' ? 'Triggered:' : 'Created:'}
                          </span>
                          <div className="text-white">
                            {formatDate(alert.status === 'triggered' ? alert.triggered_at! : alert.created_at)}
                          </div>
                        </div>
                      </div>

                      {currentPrice && alert.status === 'active' && (
                        <div className="mt-3">
                          <div className={`text-sm ${
                            priceDiff > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceDiff > 0 ? '+' : ''}{formatCurrency(priceDiff)} from target
                            {isNearTarget && ' • Very close to target!'}
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full ${
                                alert.condition === 'above' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.min(Math.abs(priceDiff) / alert.target_price * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(alert)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.status === 'active'
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title={alert.status === 'active' ? 'Pause Alert' : 'Activate Alert'}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 hover:bg-red-600 rounded-lg transition-colors text-red-400 hover:text-white"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Settings */}
      <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-700 rounded-lg p-6">
        <h3 className="text-yellow-200 font-bold text-lg mb-3">💡 Alert Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-100">
          <div className="bg-yellow-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🎯 Smart Targets</div>
            <div className="text-sm">Set alerts at realistic price levels based on technical analysis</div>
          </div>
          <div className="bg-yellow-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">🔔 Browser Notifications</div>
            <div className="text-sm">Enable notifications to get instant alerts when targets are hit</div>
          </div>
          <div className="bg-yellow-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">📊 Multiple Alerts</div>
            <div className="text-sm">Create multiple alerts for different price points and conditions</div>
          </div>
          <div className="bg-yellow-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">⏰ Monitor Active Alerts</div>
            <div className="text-sm">Regularly review and update your alerts based on market conditions</div>
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create Price Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cryptocurrency Symbol</label>
                <select
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({
                    ...newAlert, 
                    symbol: e.target.value,
                    name: e.target.selectedOptions[0]?.text || ''
                  })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select a cryptocurrency</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="ADA">Cardano (ADA)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="DOT">Polkadot (DOT)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                  <option value="LINK">Chainlink (LINK)</option>
                  <option value="AVAX">Avalanche (AVAX)</option>
                  <option value="UNI">Uniswap (UNI)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Alert Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewAlert({...newAlert, condition: 'above'})}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      newAlert.condition === 'above'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Price Goes Above
                  </button>
                  <button
                    onClick={() => setNewAlert({...newAlert, condition: 'below'})}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      newAlert.condition === 'below'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 inline mr-1" />
                    Price Goes Below
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={newAlert.target_price}
                  onChange={(e) => setNewAlert({...newAlert, target_price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="50000"
                />
              </div>
              {newAlert.symbol && cryptoPrices[newAlert.symbol] && (
                <div className="text-sm text-gray-400">
                  Current {newAlert.symbol} price: {formatCurrency(cryptoPrices[newAlert.symbol])}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAlert}
                disabled={!newAlert.symbol || !newAlert.target_price}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlertsPage;