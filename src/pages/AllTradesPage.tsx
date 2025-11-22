import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trade } from '../types';
import { Trash2, Edit2, Eye } from 'lucide-react';

interface AllTradesPageProps {
  onEditTrade?: (trade: Trade) => void;
  onViewTrade?: (trade: Trade) => void;
}

export const AllTradesPage: React.FC<AllTradesPageProps> = ({ onEditTrade, onViewTrade }) => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    result: '',
    session: '',
    entryType: '',
    direction: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'pl' | 'rr'>('date');

  useEffect(() => {
    fetchTrades();
  }, [session]);

  const fetchTrades = async () => {
    if (!session) return;

    try {
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', session.user.id)
        .order('trade_date', { ascending: false });

      if (filters.result) query = query.eq('trade_result', filters.result);
      if (filters.session) query = query.eq('session', filters.session);
      if (filters.direction) query = query.eq('direction', filters.direction);
      if (filters.entryType) query = query.eq('m1_entry_type', filters.entryType);

      const { data } = await query;

      if (data) {
        let sorted = [...data];
        if (sortBy === 'pl') {
          sorted.sort((a, b) => (b.pl_dollar || 0) - (a.pl_dollar || 0));
        } else if (sortBy === 'rr') {
          sorted.sort((a, b) => (b.risk_reward_ratio || 0) - (a.risk_reward_ratio || 0));
        }
        setTrades(sorted);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      addToast('Error loading trades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      setTrades(trades.filter((t) => t.id !== tradeId));
      addToast('Trade deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting trade:', error);
      addToast('Error deleting trade', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Session',
      'Direction',
      'Entry Type',
      'Entry',
      'Exit',
      'R:R',
      'Result',
      'P/L ($)',
      'P/L (%)',
    ];
    const rows = trades.map((t) => [
      t.trade_date,
      t.trade_time,
      t.session,
      t.direction,
      t.m1_entry_type || '-',
      t.entry_price.toFixed(2),
      t.exit_price ? t.exit_price.toFixed(2) : '-',
      t.risk_reward_ratio ? `1:${t.risk_reward_ratio}` : '-',
      t.trade_result || '-',
      t.pl_dollar ? t.pl_dollar.toFixed(2) : '-',
      t.pl_percent ? t.pl_percent.toFixed(2) : '-',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">All Trades</h1>
        <p className="text-gray-400">View and manage all your trades</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={filters.result}
            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
            onChangeCapture={() => setLoading(true)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Results</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Break Even">Break Even</option>
          </select>

          <select
            value={filters.session}
            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            onChangeCapture={() => setLoading(true)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Sessions</option>
            <option value="London Close">London Close</option>
            <option value="NY Session">NY Session</option>
            <option value="Asian Session">Asian Session</option>
          </select>

          <select
            value={filters.direction}
            onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
            onChangeCapture={() => setLoading(true)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Directions</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="pl">Sort by P/L</option>
            <option value="rr">Sort by R:R</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-white transition-colors font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date/Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Session</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Direction</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Entry Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Entry / Exit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">R:R</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Result</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">P/L</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    No trades found
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-3 text-sm text-white">
                      {trade.trade_date}
                      <br />
                      <span className="text-gray-400 text-xs">{trade.trade_time}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-white">{trade.session}</td>
                    <td className="px-6 py-3 text-sm text-white">
                      <span className={trade.direction === 'Long' ? 'text-green-400' : 'text-red-400'}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-white">{trade.m1_entry_type || '-'}</td>
                    <td className="px-6 py-3 text-sm text-white">
                      {trade.entry_price.toFixed(2)}
                      {trade.exit_price && (
                        <>
                          <br />
                          <span className="text-gray-400 text-xs">{trade.exit_price.toFixed(2)}</span>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-white">
                      {trade.risk_reward_ratio ? `1:${trade.risk_reward_ratio}` : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.trade_result === 'Win'
                            ? 'bg-green-900 text-green-100'
                            : trade.trade_result === 'Loss'
                              ? 'bg-red-900 text-red-100'
                              : 'bg-yellow-900 text-yellow-100'
                        }`}
                      >
                        {trade.trade_result || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={trade.pl_dollar && trade.pl_dollar >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${trade.pl_dollar ? trade.pl_dollar.toFixed(2) : '0.00'}
                      </span>
                      {trade.pl_percent && (
                        <div className="text-xs text-gray-400">{trade.pl_percent.toFixed(2)}%</div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewTrade?.(trade)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors text-blue-400"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTrade?.(trade)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors text-yellow-400"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
