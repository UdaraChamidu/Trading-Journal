import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Settings,
  TrendingUp,
  BarChart3,
  Plus,
  List,
  PieChart,
  Calendar,
  Target,
  BookOpen,
  Trophy,
  FileText,
  Wallet,
  DollarSign,
  Bell,
  Newspaper,
  Activity,
  Calculator,
  BrainCircuit,
  Users,
  RefreshCw,
  X,
} from "lucide-react";

interface NavigationProps {
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ mobileMenuOpen, onCloseMobileMenu }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [notificationCounts, setNotificationCounts] = useState<Record<string, number>>({});
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const updateNotificationCounts = () => {
      // Load notifications from localStorage
      const saved = localStorage.getItem('trading-journal-notifications');
      if (saved) {
        const notifications = JSON.parse(saved);
        const unreadNotifications = notifications.filter((n: any) => !n.read);

        // Count notifications by source
        const counts: Record<string, number> = {};
        unreadNotifications.forEach((notification: any) => {
          const source = notification.source.toLowerCase().replace(/\s+/g, '-');
          counts[source] = (counts[source] || 0) + 1;
        });

        // Map sources to navigation IDs
        const mappedCounts: Record<string, number> = {
          'price-alerts': counts['price-alerts'] || 0,
          'economic-calendar': counts['economic-calendar'] || 0,
          'market-insights': counts['market-insights'] || 0,
          'system': counts['system'] || 0,
        };

        setNotificationCounts(mappedCounts);
        setTotalUnread(unreadNotifications.length);
      }
    };

    // Initial load
    updateNotificationCounts();

    // Update every 10 seconds
    const interval = setInterval(updateNotificationCounts, 10000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "text-blue-400",
    },
    {
      id: "crypto-prices",
      label: "Live Prices",
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Wallet,
      color: "text-green-400",
    },
    {
      id: "trade-entry",
      label: "New Trade",
      icon: Plus,
      color: "text-green-400",
    },
    {
      id: "all-trades",
      label: "All Trades",
      icon: List,
      color: "text-purple-400",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: PieChart,
      color: "text-orange-400",
    },
    {
      id: "crypto-news",
      label: "Crypto News",
      icon: Newspaper,
      color: "text-cyan-400",
    },
    {
      id: "price-alerts",
      label: "Price Alerts",
      icon: Bell,
      color: "text-yellow-400",
    },
    {
      id: "market-insights",
      label: "Market Insights",
      icon: Activity,
      color: "text-indigo-400",
    },
    {
      id: "calendar",
      label: "Economic Calendar",
      icon: Calendar,
      color: "text-orange-400",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "text-red-400",
    },
    {
      id: "weekly-review",
      label: "Weekly Review",
      icon: Calendar,
      color: "text-indigo-400",
    },
    {
      id: "trading-plan",
      label: "Trading Plan",
      icon: Target,
      color: "text-red-400",
    },
    { id: "calculator", label: "Calculator", icon: Calculator, color: "text-blue-400" },
    {
      id: "ai-coach",
      label: "AI Coach",
      icon: BrainCircuit,
      color: "text-purple-400",
    },
    {
      id: "social-hub",
      label: "Social Hub",
      icon: Users,
      color: "text-pink-400",
    },
    {
      id: "exchange-sync",
      label: "Exchange Sync",
      icon: RefreshCw,
      color: "text-emerald-400",
    },
    { id: "journal", label: "Journal", icon: BookOpen, color: "text-cyan-400" },
    { id: "posts", label: "Posts", icon: FileText, color: "text-pink-400" },
    { id: "goals", label: "Goals", icon: Trophy, color: "text-yellow-400" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar - Fixed position, full height */}
      <div className={`fixed left-0 top-0 bottom-0 z-40 w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col ${
        mobileMenuOpen ? 'flex' : 'hidden md:flex'
      }`}>
        {/* Mobile Close Button */}
        <div className="md:hidden p-4 border-b border-slate-700 flex justify-end">
          <button
            onClick={onCloseMobileMenu}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Logo & Title */}
        <div className="p-6 border-b border-slate-700">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onCloseMobileMenu}
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">
              Crypto Hub
            </span>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const notificationCount = notificationCounts[item.id] || 0;

            return (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                onClick={onCloseMobileMenu}
                className={({ isActive }) =>
                  `flex items-center w-full text-left px-6 py-3 transition-all duration-200 hover:bg-slate-700 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-r-4 border-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`
                }
              >
                <IconComponent className={`w-5 h-5 mr-3 ${item.color}`} />
                <span className="font-medium flex-1">{item.label}</span>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="grid grid-cols-3 gap-2">
            <NavLink
              to="/settings"
              onClick={onCloseMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-slate-700 ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`
              }
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/notifications"
              onClick={onCloseMobileMenu}
              className={({ isActive }) =>
                `relative flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-slate-700 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`
              }
              title="Notifications Center"
            >
              <Bell className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
