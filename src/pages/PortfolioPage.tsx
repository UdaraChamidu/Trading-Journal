import React, { useState, useEffect } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, Edit2, Trash2, BarChart3, PieChart, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avg_buy_price: number;
  current_price?: number;
  total_value?: number;
  pnl?: number;
  pnl_percentage?: number;
}

export const PortfolioPage: React.FC = () => {
  const { session } = useAuth();
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<CryptoHolding | null>(null);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    name: '',
    amount: '',
    avg_buy_price: ''
  });

  useEffect(() => {
    if (session) {
      fetchHoldings();
    }
  }, [session]);

  const fetchHoldings = async () => {
    try {
      console.log('Fetching holdings for user:', session?.user?.id);
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      console.log('Fetch holdings response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        if (error.message?.includes('relation "portfolio_holdings" does not exist')) {
          alert('Database table "portfolio_holdings" does not exist. Please run the SQL script in Supabase dashboard.');
        }
        throw error;
      }
      setHoldings(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio metrics (using avg_buy_price as current price since no real-time data)
  const totalValue = holdings.reduce((sum, holding) => {
    return sum + (holding.amount * holding.avg_buy_price);
  }, 0);

  const totalInvested = holdings.reduce((sum, holding) => {
    return sum + (holding.amount * holding.avg_buy_price);
  }, 0);

  const totalPnL = 0; // No P&L calculation without real-time prices
  const totalPnLPercentage = 0;

  // Enhanced holdings (simplified without real-time prices)
  const enhancedHoldings = holdings.map(holding => {
    const currentPrice = holding.avg_buy_price; // Use buy price as current price
    const totalValue = holding.amount * currentPrice;
    const investedValue = holding.amount * holding.avg_buy_price;
    const pnl = 0; // No P&L without real-time prices
    const pnlPercentage = 0;

    return {
      ...holding,
      current_price: currentPrice,
      total_value: totalValue,
      pnl,
      pnl_percentage: pnlPercentage
    };
  });

  const handleAddHolding = async () => {
    try {
      const amount = parseFloat(newHolding.amount) || 0;
      const avgBuyPrice = parseFloat(newHolding.avg_buy_price) || 0;

      console.log('Adding holding:', {
        symbol: newHolding.symbol,
        name: newHolding.name,
        amount,
        avgBuyPrice,
        userId: session?.user?.id
      });

      const insertData = {
        user_id: session?.user?.id,
        symbol: newHolding.symbol.toUpperCase(),
        name: newHolding.name,
        amount: amount,
        avg_buy_price: avgBuyPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert([insertData])
        .select();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        if (error.message?.includes('relation "portfolio_holdings" does not exist')) {
          alert('Database table "portfolio_holdings" does not exist. Please run the SQL script in Supabase dashboard.');
          return;
        }
        throw error;
      }

      if (data && data[0]) {
        const newHoldingData = {
          id: data[0].id,
          symbol: newHolding.symbol.toUpperCase(),
          name: newHolding.name,
          amount: amount,
          avg_buy_price: avgBuyPrice
        };
        setHoldings([...holdings, newHoldingData]);
        console.log('Holding added successfully');
      }

      setShowAddModal(false);
      setNewHolding({ symbol: '', name: '', amount: '', avg_buy_price: '' });
    } catch (error) {
      console.error('Error adding holding:', error);
      alert(`Error adding holding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteHolding = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this holding?')) return;

    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHoldings(holdings.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting holding:', error);
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

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-green-500/25">
          <Wallet className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Crypto Portfolio</h1>
        </div>
        <p className="text-gray-400 text-lg mb-2">Track your cryptocurrency investments</p>
        <p className="text-sm text-gray-500">
          {holdings.length} holding{holdings.length !== 1 ? 's' : ''} • Manual cost tracking
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-200 mb-2">{formatCurrency(totalValue)}</div>
          <div className="text-green-300 text-sm">Total Portfolio Value</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-200 mb-2">{formatCurrency(totalInvested)}</div>
          <div className="text-blue-300 text-sm">Total Invested</div>
        </div>
        <div className={`bg-gradient-to-br border rounded-lg p-6 text-center ${
          totalPnL >= 0 
            ? 'from-green-900 to-green-800 border-green-700' 
            : 'from-red-900 to-red-800 border-red-700'
        }`}>
          <div className={`text-3xl font-bold mb-2 ${
            totalPnL >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {formatCurrency(totalPnL)}
          </div>
          <div className={`text-sm ${
            totalPnL >= 0 ? 'text-green-300' : 'text-red-300'
          }`}>
            Total P&L
          </div>
        </div>
        <div className={`bg-gradient-to-br border rounded-lg p-6 text-center ${
          totalPnL >= 0 
            ? 'from-green-900 to-green-800 border-green-700' 
            : 'from-red-900 to-red-800 border-red-700'
        }`}>
          <div className={`text-3xl font-bold mb-2 ${
            totalPnL >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {formatPercentage(totalPnLPercentage)}
          </div>
          <div className={`text-sm ${
            totalPnL >= 0 ? 'text-green-300' : 'text-red-300'
          }`}>
            Return %
          </div>
        </div>
      </div>

      {/* Add Holding Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Your Holdings
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Holding
        </button>
      </div>

      {/* Holdings Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        {enhancedHoldings.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Holdings Yet</h3>
            <p className="text-gray-400 mb-4">Start building your crypto portfolio</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Add Your First Holding
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Asset</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">Avg Buy Price</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">Current Price</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">Value</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">P&L</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {enhancedHoldings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-slate-700/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{holding.symbol}</div>
                        <div className="text-gray-400 text-sm">{holding.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-mono">
                        {holding.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-300 font-mono">
                        {formatCurrency(holding.avg_buy_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-mono font-bold">
                        {formatCurrency(holding.current_price || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-mono font-bold">
                        {formatCurrency(holding.total_value || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-bold ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {holding.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {formatCurrency(holding.pnl || 0)}
                        </div>
                        <div className="text-sm">
                          {formatPercentage(holding.pnl_percentage || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingHolding(holding)}
                          className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-400 hover:text-white"
                          title="Edit Holding"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHolding(holding.id)}
                          className="p-2 hover:bg-red-600 rounded-lg transition-colors text-red-400 hover:text-white"
                          title="Delete Holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portfolio Insights */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Portfolio Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
           <div className="bg-blue-800/50 p-3 rounded-lg">
             <div className="font-semibold mb-1">📊 Portfolio Tracking</div>
             <div className="text-sm">Track your cryptocurrency holdings and investment amounts</div>
           </div>
           <div className="bg-blue-800/50 p-3 rounded-lg">
             <div className="font-semibold mb-1">💰 Cost Basis Tracking</div>
             <div className="text-sm">Monitor your average buy prices for each cryptocurrency</div>
           </div>
           <div className="bg-blue-800/50 p-3 rounded-lg">
             <div className="font-semibold mb-1">🎯 Investment Management</div>
             <div className="text-sm">Add, edit, and remove cryptocurrency holdings from your portfolio</div>
           </div>
           <div className="bg-blue-800/50 p-3 rounded-lg">
             <div className="font-semibold mb-1">📈 Portfolio Overview</div>
             <div className="text-sm">View total invested amount and portfolio composition</div>
           </div>
         </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Add New Holding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Symbol (e.g., BTC, ETH)</label>
                <input
                  type="text"
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({...newHolding, symbol: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="BTC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newHolding.name}
                  onChange={(e) => setNewHolding({...newHolding, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Bitcoin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="any"
                  value={newHolding.amount}
                  onChange={(e) => setNewHolding({...newHolding, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Average Buy Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={newHolding.avg_buy_price}
                  onChange={(e) => setNewHolding({...newHolding, avg_buy_price: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="45000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHolding}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
              >
                Add Holding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;