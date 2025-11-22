import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { StatCard } from '../components/StatCard';
import { BarChart3, TrendingUp, Calendar, Target, ChevronDown, ChevronUp, PieChart, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    session: true,
    entryType: true,
    dayOfWeek: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Trading Analytics</h1>
        <p className="text-gray-400 text-lg">Deep insights into your trading performance</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>Data-driven analysis</span>
        </div>
      </div>

      {/* Performance by Session */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('session')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">🌍 Performance by Session</h2>
          </div>
          {expandedSections.session ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.session && (
          <div className="border-t border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">🌍 Session</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 Trades</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📈 Win Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">💰 Total P/L</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 W/L Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Object.entries(stats.bySession || {}).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No session data available yet
                      </td>
                    </tr>
                  ) : (
                    Object.entries(stats.bySession || {}).map(([session, data]: any) => (
                      <tr key={session} className="hover:bg-slate-700/50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {session === 'London Close' && '🌅'}
                              {session === 'NY Session' && '🌆'}
                              {session === 'Asian Session' && '🌄'}
                            </span>
                            <span className="text-white font-medium">{session}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {data.trades}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            data.trades > 0 && (data.wins / data.trades) * 100 >= 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${data.pl.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-900 text-purple-100 px-3 py-1 rounded-full text-sm font-bold">
                            {data.wins}:{data.losses}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Performance by Entry Type */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('entryType')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">🎯 Performance by Entry Type</h2>
          </div>
          {expandedSections.entryType ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.entryType && (
          <div className="border-t border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">🎯 Entry Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 Trades</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📈 Win Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">⚖️ Avg R:R</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">💰 Total P/L</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 W/L Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Object.entries(stats.byEntryType || {}).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No entry type data available yet
                      </td>
                    </tr>
                  ) : (
                    Object.entries(stats.byEntryType || {}).map(([type, data]: any) => (
                      <tr key={type} className="hover:bg-slate-700/50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {data.trades}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            data.trades > 0 && (data.wins / data.trades) * 100 >= 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-900 text-purple-100 px-3 py-1 rounded-full text-sm font-bold">
                            {data.rrs.length > 0 ? (data.rrs.reduce((a: number, b: number) => a + b, 0) / data.rrs.length).toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${data.pl.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-orange-900 text-orange-100 px-3 py-1 rounded-full text-sm font-bold">
                            {data.wins}:{data.losses}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Performance by Day of Week */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('dayOfWeek')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">📅 Performance by Day of Week</h2>
          </div>
          {expandedSections.dayOfWeek ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.dayOfWeek && (
          <div className="border-t border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📅 Day</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 Trades</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📈 Win Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">💰 Total P/L</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">📊 W/L Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {Object.entries(stats.byDayOfWeek || {}).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No day of week data available yet
                      </td>
                    </tr>
                  ) : (
                    Object.entries(stats.byDayOfWeek || {}).map(([day, data]: any) => (
                      <tr key={day} className="hover:bg-slate-700/50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {day === 'Monday' && '🌅'}
                              {day === 'Tuesday' && '📅'}
                              {day === 'Wednesday' && '📊'}
                              {day === 'Thursday' && '💼'}
                              {day === 'Friday' && '🎉'}
                              {day === 'Saturday' && '🏖️'}
                              {day === 'Sunday' && '☀️'}
                            </span>
                            <span className="text-white font-medium">{day}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {data.trades}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            data.trades > 0 && (data.wins / data.trades) * 100 >= 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${data.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${data.pl.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-900 text-indigo-100 px-3 py-1 rounded-full text-sm font-bold">
                            {data.wins}:{data.losses}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Insights */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3">💡 Analytics Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Session Analysis</div>
            <div className="text-sm">Identify your most profitable trading sessions and times</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Entry Type Performance</div>
            <div className="text-sm">Discover which entry strategies work best for you</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Weekly Patterns</div>
            <div className="text-sm">Find patterns in your performance throughout the week</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Optimization Focus</div>
            <div className="text-sm">Use data to improve weak areas and strengthen strengths</div>
          </div>
        </div>
      </div>
    </div>
  );
};
