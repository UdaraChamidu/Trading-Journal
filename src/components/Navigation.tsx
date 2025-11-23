import React from "react";
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
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  const { signOut } = useAuth();

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
    { id: "journal", label: "Journal", icon: BookOpen, color: "text-cyan-400" },
    { id: "posts", label: "Posts", icon: FileText, color: "text-pink-400" },
    { id: "goals", label: "Goals", icon: Trophy, color: "text-yellow-400" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Top Bar */}
      <nav className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flex container justified to end to push everything to the right */}
          <div className="flex justify-end items-center h-16">
            
            <div className="flex items-center gap-6">
              {/* Logo & Title */}
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onPageChange("dashboard")}
              >
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-lg hidden sm:inline group-hover:text-blue-300 transition-colors">
                  Crypto Trading Hub
                </span>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => onPageChange("settings")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                  currentPage === "settings"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-110"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Always visible, fixed position */}
      <div
        className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 pt-16"
      >
        <div className="py-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                }}
                className={`flex items-center w-full text-left px-6 py-3 transition-all duration-200 hover:bg-slate-700 ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-r-4 border-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <IconComponent className={`w-5 h-5 mr-3 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
