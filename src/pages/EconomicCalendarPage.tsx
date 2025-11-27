import React, { useState, useEffect } from 'react';
import { Calendar, Globe, AlertTriangle, Clock, Filter, Bitcoin, Zap, TrendingUp, Bell, Timer, BarChart3 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface CryptoEvent {
  id: string;
  date: string;
  time: string;
  crypto: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'network' | 'regulatory' | 'market' | 'exchange' | 'conference';
  status: 'upcoming' | 'live' | 'completed';
  description: string;
  expectedImpact?: string;
  actualOutcome?: string;
  priceReaction?: number;
  countdown?: number; // seconds until event
}

const MOCK_CRYPTO_EVENTS: CryptoEvent[] = [
  // Upcoming High-Impact Events
  {
    id: '1',
    date: '2024-04-20',
    time: '00:00',
    crypto: 'BTC',
    event: 'Bitcoin Halving',
    impact: 'High',
    category: 'network',
    status: 'upcoming',
    description: 'Bitcoin block reward reduces from 6.25 to 3.125 BTC',
    expectedImpact: '+50-100% price surge expected',
  },
  {
    id: '2',
    date: '2024-03-15',
    time: '14:00',
    crypto: 'ETH',
    event: 'Dencun Upgrade',
    impact: 'High',
    category: 'network',
    status: 'upcoming',
    description: 'Proto-danksharding implementation for layer 2 scaling',
    expectedImpact: 'Reduced gas fees, increased DeFi activity',
  },
  {
    id: '3',
    date: '2024-02-28',
    time: '10:00',
    crypto: 'BTC',
    event: 'SEC Spot ETF Decision',
    impact: 'High',
    category: 'regulatory',
    status: 'upcoming',
    description: 'Final approval of spot Bitcoin ETFs',
    expectedImpact: 'Massive institutional inflow expected',
  },
  {
    id: '4',
    date: '2024-05-10',
    time: '15:00',
    crypto: 'ETH',
    event: 'Ethereum Shanghai Upgrade',
    impact: 'High',
    category: 'network',
    status: 'upcoming',
    description: 'Full withdrawal functionality for staked ETH',
    expectedImpact: 'Increased staking participation',
  },
  {
    id: '5',
    date: '2024-06-01',
    time: '12:00',
    crypto: 'SOL',
    event: 'Solana 2.0 Mainnet Launch',
    impact: 'High',
    category: 'network',
    status: 'upcoming',
    description: 'Major network overhaul with improved performance',
    expectedImpact: 'TPS increase to 100k+, reduced outages',
  },
  {
    id: '6',
    date: '2024-03-20',
    time: '09:00',
    crypto: 'ADA',
    event: 'Cardano Voltaire Era Launch',
    impact: 'Medium',
    category: 'network',
    status: 'upcoming',
    description: 'Full decentralization with governance activation',
    expectedImpact: 'Community-driven development acceleration',
  },
  {
    id: '7',
    date: '2024-04-15',
    time: '16:00',
    crypto: 'DOT',
    event: 'Polkadot 2.0 Release',
    impact: 'High',
    category: 'network',
    status: 'upcoming',
    description: 'Elastic scaling and advanced interoperability',
    expectedImpact: 'Mass adoption of parachain ecosystem',
  },
  {
    id: '8',
    date: '2024-05-25',
    time: '11:00',
    crypto: 'AVAX',
    event: 'Avalanche Vancouver Upgrade',
    impact: 'Medium',
    category: 'network',
    status: 'upcoming',
    description: 'Cross-chain communication and DeFi enhancements',
    expectedImpact: 'Improved subnet interoperability',
  },
  {
    id: '9',
    date: '2024-03-05',
    time: '08:00',
    crypto: 'MATIC',
    event: 'Polygon 2.0 Migration',
    impact: 'Medium',
    category: 'network',
    status: 'upcoming',
    description: 'Unified scaling solution with ZK technology',
    expectedImpact: 'Lower fees, faster transactions',
  },
  {
    id: '10',
    date: '2024-06-15',
    time: '10:00',
    crypto: 'LINK',
    event: 'Chainlink 3.0 Launch',
    impact: 'Medium',
    category: 'network',
    status: 'upcoming',
    description: 'Advanced oracle network with AI integration',
    expectedImpact: 'Smarter DeFi applications',
  },

  // Recent Events with Outcomes
  {
    id: '11',
    date: '2024-01-15',
    time: '09:00',
    crypto: 'ETH',
    event: 'Ethereum Staking Reward Increase',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'Validator rewards increased by 12%',
    actualOutcome: 'Successfully implemented',
    priceReaction: 8.5,
  },
  {
    id: '12',
    date: '2024-01-10',
    time: '16:30',
    crypto: 'BNB',
    event: 'Binance Quarterly Burn',
    impact: 'Medium',
    category: 'market',
    status: 'completed',
    description: 'Quarterly token burn of 1.2M BNB',
    actualOutcome: '1.15M BNB burned',
    priceReaction: 3.2,
  },
  {
    id: '13',
    date: '2024-01-05',
    time: '08:00',
    crypto: 'SOL',
    event: 'Solana Network Upgrade',
    impact: 'High',
    category: 'network',
    status: 'completed',
    description: 'Performance and stability improvements',
    actualOutcome: 'TPS increased by 25%',
    priceReaction: -2.1,
  },
  {
    id: '14',
    date: '2024-01-08',
    time: '14:00',
    crypto: 'BTC',
    event: 'Bitcoin ETF Approval Announcement',
    impact: 'High',
    category: 'regulatory',
    status: 'completed',
    description: 'SEC approves first Bitcoin spot ETFs',
    actualOutcome: '11 ETFs approved',
    priceReaction: 15.3,
  },
  {
    id: '15',
    date: '2024-01-12',
    time: '11:00',
    crypto: 'ETH',
    event: 'Ethereum Spot ETF Filing',
    impact: 'High',
    category: 'regulatory',
    status: 'completed',
    description: 'Major banks file for Ethereum ETFs',
    actualOutcome: '8 ETF applications submitted',
    priceReaction: 12.7,
  },
  {
    id: '16',
    date: '2024-01-18',
    time: '10:00',
    crypto: 'AVAX',
    event: 'Avalanche Subnet Expansion',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'New subnet launches for gaming and DeFi',
    actualOutcome: '5 new subnets deployed',
    priceReaction: 6.4,
  },
  {
    id: '17',
    date: '2024-01-22',
    time: '13:00',
    crypto: 'MATIC',
    event: 'Polygon zkEVM Mainnet',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'Zero-knowledge Ethereum scaling solution',
    actualOutcome: 'Mainnet successfully launched',
    priceReaction: 9.1,
  },
  {
    id: '18',
    date: '2024-01-28',
    time: '15:00',
    crypto: 'DOT',
    event: 'Polkadot OpenGov Launch',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'Decentralized governance system activation',
    actualOutcome: '100+ proposals submitted',
    priceReaction: 4.8,
  },

  // Conference Events
  {
    id: '19',
    date: '2024-03-10',
    time: '09:00',
    crypto: 'MULTI',
    event: 'Consensus 2024',
    impact: 'Medium',
    category: 'conference',
    status: 'upcoming',
    description: 'Major crypto conference in Austin, TX',
    expectedImpact: 'Industry announcements and networking',
  },
  {
    id: '20',
    date: '2024-04-05',
    time: '08:00',
    crypto: 'MULTI',
    event: 'ETH Denver 2024',
    impact: 'Medium',
    category: 'conference',
    status: 'upcoming',
    description: 'Ethereum-focused conference in Denver',
    expectedImpact: 'Layer 2 announcements and partnerships',
  },
  {
    id: '21',
    date: '2024-05-20',
    time: '10:00',
    crypto: 'MULTI',
    event: 'Blockchain Expo 2024',
    impact: 'Low',
    category: 'conference',
    status: 'upcoming',
    description: 'Global blockchain and crypto exhibition',
    expectedImpact: 'Industry networking and education',
  },

  // Exchange Events
  {
    id: '22',
    date: '2024-02-15',
    time: '12:00',
    crypto: 'LINK',
    event: 'Chainlink Mainnet Upgrade',
    impact: 'Medium',
    category: 'network',
    status: 'upcoming',
    description: 'Cross-chain interoperability enhancements',
    expectedImpact: 'Improved oracle network efficiency',
  },
  {
    id: '23',
    date: '2024-03-25',
    time: '14:00',
    crypto: 'UNI',
    event: 'Uniswap V4 Launch',
    impact: 'High',
    category: 'exchange',
    status: 'upcoming',
    description: 'Next generation decentralized exchange protocol',
    expectedImpact: 'Improved liquidity and reduced fees',
  },
  {
    id: '24',
    date: '2024-04-30',
    time: '16:00',
    crypto: 'SUSHI',
    event: 'SushiSwap V3 Deployment',
    impact: 'Medium',
    category: 'exchange',
    status: 'upcoming',
    description: 'Concentrated liquidity AMM launch',
    expectedImpact: 'Enhanced yield farming opportunities',
  },

  // Additional Historical Events
  {
    id: '25',
    date: '2024-01-20',
    time: '11:00',
    crypto: 'ADA',
    event: 'Cardano Hydra Scaling Testnet',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'Layer 1 scaling solution testing',
    actualOutcome: '1000+ TPS achieved',
    priceReaction: 5.8,
  },
  {
    id: '26',
    date: '2024-01-25',
    time: '15:00',
    crypto: 'DOT',
    event: 'Polkadot Parachain Auction',
    impact: 'Low',
    category: 'network',
    status: 'completed',
    description: 'New parachain slot auction completed',
    actualOutcome: 'Successful slot allocation',
    priceReaction: 1.2,
  },
  {
    id: '27',
    date: '2024-01-30',
    time: '12:00',
    crypto: 'LTC',
    event: 'Litecoin Halving',
    impact: 'Medium',
    category: 'network',
    status: 'completed',
    description: 'Block reward reduced from 12.5 to 6.25 LTC',
    actualOutcome: 'Successfully implemented',
    priceReaction: 7.3,
  },
  {
    id: '28',
    date: '2024-02-05',
    time: '09:00',
    crypto: 'XRP',
    event: 'Ripple vs SEC Court Update',
    impact: 'High',
    category: 'regulatory',
    status: 'completed',
    description: 'Major court ruling on XRP classification',
    actualOutcome: 'Partial victory for Ripple',
    priceReaction: 18.9,
  },
  {
    id: '29',
    date: '2024-02-10',
    time: '13:00',
    crypto: 'DOGE',
    event: 'Tesla DOGE Payment Integration',
    impact: 'Medium',
    category: 'market',
    status: 'completed',
    description: 'Tesla announces DOGE payment acceptance',
    actualOutcome: 'Integration planned for Q2',
    priceReaction: 22.4,
  },
  {
    id: '30',
    date: '2024-02-20',
    time: '11:00',
    crypto: 'SHIB',
    event: 'Shiba Inu Ecosystem Expansion',
    impact: 'Low',
    category: 'market',
    status: 'completed',
    description: 'New DeFi and NFT platform launches',
    actualOutcome: 'SHIB Metaverse beta released',
    priceReaction: -3.1,
  },
];

export const EconomicCalendarPage: React.FC = () => {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'network' | 'regulatory' | 'market' | 'exchange' | 'conference'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [cryptoFilter, setCryptoFilter] = useState<string>('all');
  const [events, setEvents] = useState<CryptoEvent[]>(MOCK_CRYPTO_EVENTS);
  const [eventReminders, setEventReminders] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load saved reminders and set up real-time updates
  useEffect(() => {
    loadEventReminders();

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      updateEventStatuses();
      checkEventNotifications();
      cleanupCompletedEventReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadEventReminders = () => {
    const saved = localStorage.getItem('crypto-event-reminders');
    if (saved) {
      setEventReminders(new Set(JSON.parse(saved)));
    }
  };

  const saveEventReminders = (reminders: Set<string>) => {
    localStorage.setItem('crypto-event-reminders', JSON.stringify([...reminders]));
    setEventReminders(reminders);
  };

  const toggleEventReminder = (eventId: string, eventName: string, crypto: string) => {
    const newReminders = new Set(eventReminders);
    if (newReminders.has(eventId)) {
      newReminders.delete(eventId);
      addToast(`🔕 Reminder removed for ${crypto} ${eventName}`, 'info');
    } else {
      newReminders.add(eventId);
      addToast(`🔔 Reminder set for ${crypto} ${eventName}`, 'success');
    }
    saveEventReminders(newReminders);
  };

  const cleanupCompletedEventReminders = () => {
    const completedEventIds = events
      .filter(event => event.status === 'completed')
      .map(event => event.id);

    const newReminders = new Set(eventReminders);
    let cleaned = false;

    completedEventIds.forEach(id => {
      if (newReminders.has(id)) {
        newReminders.delete(id);
        cleaned = true;
      }
    });

    if (cleaned) {
      saveEventReminders(newReminders);
    }
  };

  const updateEventStatuses = () => {
    const now = new Date();
    setEvents(prevEvents =>
      prevEvents.map(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`);
        const timeDiff = eventDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        let newStatus: 'upcoming' | 'live' | 'completed' = event.status;
        let countdown: number | undefined;

        if (timeDiff <= 0) {
          newStatus = 'completed';
        } else if (hoursDiff <= 1) {
          newStatus = 'live';
          countdown = Math.floor(timeDiff / 1000);
        } else {
          newStatus = 'upcoming';
          countdown = Math.floor(timeDiff / 1000);
        }

        return { ...event, status: newStatus, countdown };
      })
    );
  };

  const checkEventNotifications = () => {
    events.forEach(event => {
      if (event.status === 'live' && event.countdown && event.countdown <= 300 && event.countdown > 270) {
        // Notify 5 minutes before event
        addToast(`🚨 ${event.crypto} ${event.event} starts in 5 minutes!`, 'info', 10000);

        // Add to main notifications system if user has reminder set
        if (eventReminders.has(event.id)) {
          const existingNotifications = JSON.parse(localStorage.getItem('trading-journal-notifications') || '[]');
          const newNotification = {
            id: `event-${event.id}-${Date.now()}`,
            type: 'event_reminder',
            title: `${event.crypto} Event Starting Soon!`,
            message: `${event.event} begins in 5 minutes (${new Date(`${event.date}T${event.time}`).toLocaleTimeString()})`,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high',
            source: 'Economic Calendar',
            actionUrl: '/calendar',
            metadata: { eventId: event.id }
          };

          const updatedNotifications = [newNotification, ...existingNotifications];
          localStorage.setItem('trading-journal-notifications', JSON.stringify(updatedNotifications));
        }
      }
    });
  };

  const filteredEvents = events.filter(event => {
    const impactMatch = filter === 'All' || event.impact === filter;
    const categoryMatch = categoryFilter === 'all' || event.category === categoryFilter;
    const statusMatch = statusFilter === 'all' || event.status === statusFilter;
    const cryptoMatch = cryptoFilter === 'all' || event.crypto === cryptoFilter;

    return impactMatch && categoryMatch && statusMatch && cryptoMatch;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Low': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'live': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network': return <Zap className="w-4 h-4" />;
      case 'regulatory': return <AlertTriangle className="w-4 h-4" />;
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'exchange': return <BarChart3 className="w-4 h-4" />;
      case 'conference': return <Globe className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCountdown = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const uniqueCryptos = Array.from(new Set(events.map(e => e.crypto)));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-indigo-500/25">
          <Calendar className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Crypto Events Calendar</h1>
        </div>
        <p className="text-gray-400 text-lg">Track high-impact cryptocurrency events, network upgrades, and market catalysts</p>
        <div className="flex items-center justify-center gap-6 mt-2 text-sm">
          <span className="text-indigo-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <span className="text-green-400 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Real-time updates every 30s
          </span>
          <span className="text-yellow-400 flex items-center gap-1">
            <Bell className="w-4 h-4" />
            {events.filter(e => e.status === 'live').length} live events
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        {/* Enhanced Toolbar */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Impact Filter */}
            <div>
              <span className="text-sm text-gray-400 block mb-2">Impact Level:</span>
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

            {/* Category Filter */}
            <div>
              <span className="text-sm text-gray-400 block mb-2">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="network">Network Upgrades</option>
                <option value="regulatory">Regulatory</option>
                <option value="market">Market Events</option>
                <option value="exchange">Exchange Events</option>
                <option value="conference">Conferences</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <span className="text-sm text-gray-400 block mb-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Crypto Filter */}
            <div>
              <span className="text-sm text-gray-400 block mb-2">Crypto Asset:</span>
              <select
                value={cryptoFilter}
                onChange={(e) => setCryptoFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Cryptos</option>
                {uniqueCryptos.map((crypto) => (
                  <option key={crypto} value={crypto}>
                    {crypto}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Crypto Events Calendar</span>
            </div>
            <div className="text-sm text-gray-400">
              {filteredEvents.length} events • Updated every 30 seconds
            </div>
          </div>
        </div>

        {/* Enhanced Events List */}
        <div className="divide-y divide-slate-700">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events found for current filters.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-slate-700/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Bitcoin className="w-5 h-5 text-orange-400" />
                        {event.crypto}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getImpactColor(event.impact)}`}>
                        {event.impact} Impact
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{event.event}</h3>
                    <p className="text-gray-300 text-sm mb-3">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white font-mono">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getCategoryIcon(event.category)}
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white capitalize">{event.category}</span>
                      </div>

                      {event.countdown && event.status !== 'completed' && (
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">Countdown:</span>
                          <span className="text-green-400 font-mono font-bold">
                            {formatCountdown(event.countdown)}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.expectedImpact && event.status === 'upcoming' && (
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <div className="text-blue-300 text-sm">
                          <strong>Expected Impact:</strong> {event.expectedImpact}
                        </div>
                      </div>
                    )}

                    {event.actualOutcome && event.status === 'completed' && (
                      <div className="mt-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                        <div className="text-green-300 text-sm">
                          <strong>Actual Outcome:</strong> {event.actualOutcome}
                        </div>
                        {event.priceReaction && (
                          <div className="text-green-400 text-sm mt-1">
                            <strong>Price Reaction:</strong> {event.priceReaction > 0 ? '+' : ''}{event.priceReaction}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => toggleEventReminder(event.id, event.event, event.crypto)}
                      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                        eventReminders.has(event.id)
                          ? event.status === 'completed'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-600 text-white shadow-lg'
                          : 'bg-slate-600 text-yellow-400 hover:bg-yellow-600 hover:text-white'
                      }`}
                      title={eventReminders.has(event.id) ? 'Remove Reminder' : 'Set Reminder'}
                      disabled={event.status === 'completed'}
                    >
                      <Bell className={`w-4 h-4 ${eventReminders.has(event.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No events found for this filter.</p>
          </div>
        )}
      </div>

      {/* Event Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-200 mb-2">
            {events.filter(e => e.status === 'upcoming').length}
          </div>
          <div className="text-blue-300 text-sm">Upcoming Events</div>
          <div className="text-blue-400 text-xs">Next 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-200 mb-2">
            {events.filter(e => e.status === 'live').length}
          </div>
          <div className="text-green-300 text-sm">Live Events</div>
          <div className="text-green-400 text-xs">Happening now</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-200 mb-2">
            {events.filter(e => e.status === 'completed').length}
          </div>
          <div className="text-purple-300 text-sm">Completed Events</div>
          <div className="text-purple-400 text-xs">Historical data</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-800 border border-orange-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-200 mb-2">
            {events.filter(e => e.impact === 'High').length}
          </div>
          <div className="text-orange-300 text-sm">High Impact Events</div>
          <div className="text-orange-400 text-xs">Market movers</div>
        </div>
      </div>

      {/* Event Categories Overview */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6">
        <h3 className="text-indigo-200 font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Event Categories Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-indigo-100">
          <div className="bg-indigo-800/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold mb-1">{events.filter(e => e.category === 'network').length}</div>
            <div className="text-sm">Network Upgrades</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold mb-1">{events.filter(e => e.category === 'regulatory').length}</div>
            <div className="text-sm">Regulatory</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold mb-1">{events.filter(e => e.category === 'market').length}</div>
            <div className="text-sm">Market Events</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold mb-1">{events.filter(e => e.category === 'exchange').length}</div>
            <div className="text-sm">Exchange Events</div>
          </div>
          <div className="bg-indigo-800/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold mb-1">{events.filter(e => e.category === 'conference').length}</div>
            <div className="text-sm">Conferences</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendarPage;
