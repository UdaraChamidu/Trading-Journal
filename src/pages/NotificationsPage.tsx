import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, TrendingUp, Calendar, DollarSign, X, CheckCircle, Clock, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationItem {
  id: string;
  type: 'price_alert' | 'event_reminder' | 'market_alert' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
  actionUrl?: string;
  metadata?: any;
}

export const NotificationsPage: React.FC = () => {
  const { addToast } = useToast();
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'price_alert' | 'event_reminder' | 'market_alert'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any existing demo data on first load
    const clearedDemo = localStorage.getItem('demo-cleared');
    if (!clearedDemo) {
      localStorage.removeItem('trading-journal-notifications');
      localStorage.removeItem('notifications-demo-shown');
      localStorage.setItem('demo-cleared', 'true');
    }

    loadNotifications();

    // Set up real-time updates
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const saved = localStorage.getItem('trading-journal-notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      const notificationsWithDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(notificationsWithDates);
    }
    setLoading(false);
  };

  const saveNotifications = (notifs: NotificationItem[]) => {
    localStorage.setItem('trading-journal-notifications', JSON.stringify(notifs));
    setNotifications(notifs);
  };

  const generateDemoNotifications = () => {
    const mockNotifications: NotificationItem[] = [
      // Price Alerts (User-created)
      {
        id: '1',
        type: 'price_alert',
        title: 'Bitcoin Price Alert',
        message: 'BTC has reached your target price of $45,000 (Current: $45,250)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        source: 'Price Alerts',
        actionUrl: '/price-alerts'
      },
      {
        id: '2',
        type: 'price_alert',
        title: 'Ethereum Alert Triggered',
        message: 'ETH dropped below $2,500 as expected (Current: $2,480)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: 'medium',
        source: 'Price Alerts',
        actionUrl: '/price-alerts'
      },
      {
        id: '3',
        type: 'price_alert',
        title: 'Solana Target Reached',
        message: 'SOL has hit your upper target of $150 (Current: $152.30)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: false,
        priority: 'high',
        source: 'Price Alerts',
        actionUrl: '/price-alerts'
      },
      // Event Reminders (User-created)
      {
        id: '4',
        type: 'event_reminder',
        title: 'Bitcoin Halving Reminder',
        message: 'Bitcoin Halving event starts in 5 minutes (April 20, 2024)',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        priority: 'high',
        source: 'Economic Calendar',
        actionUrl: '/calendar'
      },
      {
        id: '5',
        type: 'event_reminder',
        title: 'Ethereum Upgrade Alert',
        message: 'Dencun Upgrade begins in 2 hours (March 15, 2024)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        source: 'Economic Calendar',
        actionUrl: '/calendar'
      },
      {
        id: '6',
        type: 'event_reminder',
        title: 'Consensus 2024 Conference',
        message: 'Crypto conference starts tomorrow in Austin, TX',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        priority: 'medium',
        source: 'Economic Calendar',
        actionUrl: '/calendar'
      },
      {
        id: '7',
        type: 'event_reminder',
        title: 'SEC ETF Decision Reminder',
        message: 'Spot Bitcoin ETF decision in 1 hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        read: false,
        priority: 'high',
        source: 'Economic Calendar',
        actionUrl: '/calendar'
      }
    ];

    // Add demo notifications only once for new users
    const existingNotifications = JSON.parse(localStorage.getItem('trading-journal-notifications') || '[]');
    if (existingNotifications.length === 0) {
      saveNotifications(mockNotifications);
    }
  };

  const checkForNewNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      // Check for newly triggered price alerts from database
      const { data: alerts, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'triggered')
        .gt('triggered_at', new Date(Date.now() - 60000).toISOString()); // Last minute

      if (!alertsError && alerts && alerts.length > 0) {
        alerts.forEach((alert: any) => {
          // Check if we haven't already notified about this trigger
          const existingNotification = notifications.find(n =>
            n.type === 'price_alert' &&
            n.metadata?.alertId === alert.id &&
            n.timestamp > new Date(Date.now() - 60000) // Within last minute
          );

          if (!existingNotification) {
            const newNotification: NotificationItem = {
              id: `price-${alert.id}-${Date.now()}`,
              type: 'price_alert',
              title: `${alert.symbol} Alert Triggered!`,
              message: `${alert.symbol} has gone ${alert.condition} $${alert.target_price} (Current: $${alert.current_price})`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
              source: 'Price Alerts',
              actionUrl: '/price-alerts',
              metadata: { alertId: alert.id }
            };
            addNotification(newNotification);
          }
        });
      }

      // Check for upcoming event reminders (from localStorage events)
      const eventReminders = new Set(JSON.parse(localStorage.getItem('crypto-event-reminders') || '[]'));
      if (eventReminders.size > 0) {
        // Import the mock events (since they're stored locally)
        const MOCK_CRYPTO_EVENTS = [
          // Copy the events from EconomicCalendarPage
          {
            id: '1',
            crypto: 'BTC',
            event: 'Bitcoin Halving',
            date: '2024-04-20',
            time: '12:00',
            status: 'upcoming',
            impact: 'high',
            description: 'Bitcoin supply reduction event',
            expectedOutcome: 'Price surge expected'
          },
          {
            id: '2',
            crypto: 'ETH',
            event: 'Dencun Upgrade',
            date: '2024-03-15',
            time: '14:00',
            status: 'upcoming',
            impact: 'high',
            description: 'Ethereum network upgrade with proto-danksharding',
            expectedOutcome: 'Reduced gas fees, improved scalability'
          },
          {
            id: '3',
            crypto: 'BTC',
            event: 'SEC ETF Decision',
            date: '2024-02-28',
            time: '16:00',
            status: 'upcoming',
            impact: 'high',
            description: 'Final decision on spot Bitcoin ETF applications',
            expectedOutcome: 'Potential major price movement'
          },
          {
            id: '4',
            crypto: 'ETH',
            event: 'Staking Rewards Update',
            date: '2024-03-01',
            time: '10:00',
            status: 'upcoming',
            impact: 'medium',
            description: 'Ethereum staking rewards adjustment',
            expectedOutcome: 'Minor staking yield changes'
          },
          {
            id: '5',
            crypto: 'BTC',
            event: 'Consensus 2024',
            date: '2024-03-10',
            time: '09:00',
            status: 'upcoming',
            impact: 'medium',
            description: 'Major Bitcoin conference in Austin, TX',
            expectedOutcome: 'Industry networking and announcements'
          }
        ];

        MOCK_CRYPTO_EVENTS.forEach((event: any) => {
          if (eventReminders.has(event.id)) {
            const eventTime = new Date(`${event.date}T${event.time}`);
            const timeDiff = eventTime.getTime() - Date.now();
            const minutesUntil = timeDiff / (1000 * 60);

            // 5-minute warning for live events
            if (minutesUntil <= 5 && minutesUntil > 4.5 && event.status === 'live') {
              const existingNotification = notifications.find(n =>
                n.type === 'event_reminder' &&
                n.metadata?.eventId === event.id &&
                n.timestamp > new Date(Date.now() - 300000) // Within last 5 minutes
              );

              if (!existingNotification) {
                const newNotification: NotificationItem = {
                  id: `event-${event.id}-${Date.now()}`,
                  type: 'event_reminder',
                  title: `${event.crypto} Event Starting Soon!`,
                  message: `${event.event} begins in 5 minutes (${new Date(eventTime).toLocaleTimeString()})`,
                  timestamp: new Date(),
                  read: false,
                  priority: 'high',
                  source: 'Economic Calendar',
                  actionUrl: '/calendar',
                  metadata: { eventId: event.id }
                };
                addNotification(newNotification);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  const addNotification = (notification: NotificationItem) => {
    const newNotifications = [notification, ...notifications];
    saveNotifications(newNotifications);
    addToast(notification.message, notification.priority === 'high' ? 'error' : 'info', 8000);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    addToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    addToast('Notification deleted', 'info');
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
    // Reset demo flag and clear any existing demo data
    localStorage.removeItem('notifications-demo-shown');
    localStorage.removeItem('trading-journal-notifications');
    addToast('All notifications cleared - page will show empty until you create alerts', 'info');
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'price_alert':
      case 'event_reminder':
      case 'market_alert':
        return notification.type === filter;
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_alert':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'event_reminder':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'market_alert':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      case 'system':
        return <Bell className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-900/20';
      case 'medium':
        return 'border-orange-500 bg-orange-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-blue-500/25">
          <Bell className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Notifications Center</h1>
        </div>
        <p className="text-gray-400 text-lg">Central hub for all your alerts and notifications</p>
        <div className="flex items-center justify-center gap-6 mt-2 text-sm">
          <span className="text-blue-400 flex items-center gap-1">
            <Bell className="w-4 h-4" />
            {notifications.filter(n => !n.read).length} unread
          </span>
          <span className="text-green-400 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {notifications.filter(n => n.read).length} read
          </span>
          <span className="text-purple-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Real-time updates
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 mr-2">Filter:</span>
              <div className="flex bg-slate-700 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'price_alert', label: 'Price Alerts' },
                  { key: 'event_reminder', label: 'Event Reminders' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      filter === f.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Mark All Read
              </button>
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No notifications found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for new alerts.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 border rounded-lg overflow-hidden shadow-xl transition-all duration-300 hover:scale-102 ${
                !notification.read ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-700'
              } ${getPriorityColor(notification.priority)}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-200' : 'text-gray-400'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                          {notification.source}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          notification.priority === 'high' ? 'bg-red-900 text-red-100' :
                          notification.priority === 'medium' ? 'bg-orange-900 text-orange-100' :
                          'bg-blue-900 text-blue-100'
                        }`}>
                          {notification.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        View
                      </a>
                    )}

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-green-600 rounded-lg transition-colors text-green-400 hover:text-white"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-red-600 rounded-lg transition-colors text-red-400 hover:text-white"
                      title="Delete Notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-200 mb-2">
            {notifications.filter(n => !n.read).length}
          </div>
          <div className="text-blue-300 text-sm">Unread Notifications</div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-200 mb-2">
            {notifications.filter(n => n.type === 'price_alert').length}
          </div>
          <div className="text-green-300 text-sm">Price Alerts</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-200 mb-2">
            {notifications.filter(n => n.type === 'event_reminder').length}
          </div>
          <div className="text-purple-300 text-sm">Event Reminders</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;