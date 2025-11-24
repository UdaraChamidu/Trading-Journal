import React from 'react';
import { User, MapPin, Calendar, Award, TrendingUp, BarChart3 } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  // Mock user data
  const profile = {
    name: 'Alex Thompson',
    handle: '@crypto_alex',
    bio: 'Full-time crypto trader since 2017. Focusing on BTC and ETH swing trades. 🚀',
    location: 'New York, USA',
    joined: 'March 2023',
    stats: {
      winRate: 68,
      totalTrades: 452,
      profitFactor: 2.4,
    },
    badges: ['Top Trader', 'Early Adopter', 'Consistent'],
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-slate-900 p-1">
              <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <button className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors">
              Follow
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-gray-400 text-lg mb-4">{profile.handle}</p>
            <p className="text-gray-300 max-w-2xl mb-6">{profile.bio}</p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {profile.joined}
              </div>
            </div>

            <div className="flex gap-2">
              {profile.badges.map((badge) => (
                <span key={badge} className="px-3 py-1 rounded-full bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-green-400">{profile.stats.winRate}%</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Total Trades</div>
          <div className="text-3xl font-bold text-white">{profile.stats.totalTrades}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-gray-400 text-sm mb-2">Profit Factor</div>
          <div className="text-3xl font-bold text-blue-400">{profile.stats.profitFactor}</div>
        </div>
      </div>

      {/* Public Trades */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          Recent Public Trades
        </h2>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i % 2 === 0 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white">BTC/USD</div>
                  <div className="text-sm text-gray-400">Long • 5x Leverage</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${i % 2 === 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {i % 2 === 0 ? '-2.4%' : '+12.5%'}
                </div>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
