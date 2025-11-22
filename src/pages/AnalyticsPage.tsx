import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { StatCard } from '../components/StatCard';

export const AnalyticsPage: React.FC = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session) return;

      try {
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', session.user.id);

        if (trades) {
          const completed = trades.filter((t) => t.pl_dollar !== null);

          const bySession: Record<string, any> = {};
          const byEntryType: Record<string, any> = {};
          const byDayOfWeek: Record<string, any> = {};

          completed.forEach((trade) => {
            if (trade.session) {
              if (!bySession[trade.session]) {
                bySession[trade.session] = { wins: 0, losses: 0, pl: 0, trades: 0 };
              }
              bySession[trade.session].trades++;
              bySession[trade.session].pl += trade.pl_dollar;
              if (trade.trade_result === 'Win') bySession[trade.session].wins++;
              else if (trade.trade_result === 'Loss') bySession[trade.session].losses++;
            }

            if (trade.m1_entry_type) {
              if (!byEntryType[trade.m1_entry_type]) {
                byEntryType[trade.m1_entry_type] = { wins: 0, losses: 0, pl: 0, trades: 0, rrs: [] };
              }
              byEntryType[trade.m1_entry_type].trades++;
              byEntryType[trade.m1_entry_type].pl += trade.pl_dollar;
              if (trade.risk_reward_ratio) byEntryType[trade.m1_entry_type].rrs.push(trade.risk_reward_ratio);
              if (trade.trade_result === 'Win') byEntryType[trade.m1_entry_type].wins++;
              else if (trade.trade_result === 'Loss') byEntryType[trade.m1_entry_type].losses++;
            }

            if (trade.day_of_week) {
              if (!byDayOfWeek[trade.day_of_week]) {
                byDayOfWeek[trade.day_of_week] = { wins: 0, losses: 0, pl: 0, trades: 0 };
              }
              byDayOfWeek[trade.day_of_week].trades++;
              byDayOfWeek[trade.day_of_week].pl += trade.pl_dollar;
              if (trade.trade_result === 'Win') byDayOfWeek[trade.day_of_week].wins++;
              else if (trade.trade_result === 'Loss') byDayOfWeek[trade.day_of_week].losses++;
            }
          });

          setStats({
            bySession,
            byEntryType,
            byDayOfWeek,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Detailed performance analysis</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">By Session</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Session</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Trades</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Win Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Total P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Object.entries(stats.bySession || {}).map(([session, data]: any) => (
                <tr key={session} className="hover:bg-slate-700">
                  <td className="px-6 py-3 text-sm text-white">{session}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{data.trades}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                  </td>
                  <td className={`px-6 py-3 text-sm font-semibold ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${data.pl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">By Entry Type</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Entry Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Trades</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Win Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Avg R:R</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Total P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Object.entries(stats.byEntryType || {}).map(([type, data]: any) => (
                <tr key={type} className="hover:bg-slate-700">
                  <td className="px-6 py-3 text-sm text-white">{type}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{data.trades}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {data.rrs.length > 0 ? (data.rrs.reduce((a: number, b: number) => a + b, 0) / data.rrs.length).toFixed(2) : '-'}
                  </td>
                  <td className={`px-6 py-3 text-sm font-semibold ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${data.pl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">By Day of Week</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Day</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Trades</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Win Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Total P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Object.entries(stats.byDayOfWeek || {}).map(([day, data]: any) => (
                <tr key={day} className="hover:bg-slate-700">
                  <td className="px-6 py-3 text-sm text-white">{day}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{data.trades}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                  </td>
                  <td className={`px-6 py-3 text-sm font-semibold ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${data.pl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
