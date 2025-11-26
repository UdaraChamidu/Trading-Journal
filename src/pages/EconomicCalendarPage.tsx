import React, { useState } from 'react';
import { Calendar, Globe, AlertTriangle, Clock, Filter } from 'lucide-react';

interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  forecast: string;
  previous: string;
  actual?: string;
}

const MOCK_EVENTS: EconomicEvent[] = [
  {
    id: '1',
    time: '08:30',
    currency: 'USD',
    event: 'Core CPI m/m',
    impact: 'High',
    forecast: '0.3%',
    previous: '0.3%',
  },
  {
    id: '2',
    time: '08:30',
    currency: 'USD',
    event: 'CPI y/y',
    impact: 'High',
    forecast: '3.1%',
    previous: '3.2%',
  },
  {
    id: '3',
    time: '10:30',
    currency: 'USD',
    event: 'Crude Oil Inventories',
    impact: 'Medium',
    forecast: '-1.5M',
    previous: '2.1M',
  },
  {
    id: '4',
    time: '14:00',
    currency: 'USD',
    event: 'FOMC Meeting Minutes',
    impact: 'High',
    forecast: '-',
    previous: '-',
  },
  {
    id: '5',
    time: '19:50',
    currency: 'JPY',
    event: 'GDP q/q',
    impact: 'High',
    forecast: '0.2%',
    previous: '-0.7%',
  },
  {
    id: '6',
    time: '02:00',
    currency: 'GBP',
    event: 'GDP m/m',
    impact: 'Medium',
    forecast: '0.2%',
    previous: '0.3%',
  },
  {
    id: '7',
    time: '05:00',
    currency: 'EUR',
    event: 'CPI Flash Estimate y/y',
    impact: 'High',
    forecast: '2.5%',
    previous: '2.6%',
  },
];

export const EconomicCalendarPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate live updates every hour
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filter === 'All' 
    ? MOCK_EVENTS 
    : MOCK_EVENTS.filter(e => e.impact === filter);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Low': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-indigo-500/25">
          <Calendar className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Economic Calendar</h1>
        </div>
        <p className="text-gray-400 text-lg">Track high-impact market events and economic data releases</p>
        <p className="text-sm text-indigo-400 mt-2 flex items-center justify-center gap-1">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Today, {new Date().toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 mr-2">Impact:</span>
            <div className="flex bg-slate-700 rounded-lg p-1">
              {['All', 'High', 'Medium', 'Low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 text-left">
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Time</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Currency</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Event</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Impact</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Actual</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Forecast</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-white font-mono text-sm">{event.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Globe className="w-4 h-4 text-slate-400" />
                      {event.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{event.event}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getImpactColor(event.impact)}`}>
                      {event.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
                    {event.actual || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-300">{event.forecast}</td>
                  <td className="px-6 py-4 text-right font-mono text-gray-400">{event.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomicCalendarPage;
