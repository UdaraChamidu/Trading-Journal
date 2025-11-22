import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Settings, TrendingUp, BarChart3, Plus, List, PieChart, Calendar, Target, BookOpen, Trophy, User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-400' },
    { id: 'trade-entry', label: 'New Trade', icon: Plus, color: 'text-green-400' },
    { id: 'all-trades', label: 'All Trades', icon: List, color: 'text-purple-400' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'text-orange-400' },
    { id: 'weekly-review', label: 'Weekly Review', icon: Calendar, color: 'text-indigo-400' },
    { id: 'trading-plan', label: 'Trading Plan', icon: Target, color: 'text-red-400' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-cyan-400' },
    { id: 'goals', label: 'Goals', icon: Trophy, color: 'text-yellow-400' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onPageChange('dashboard')}>
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline group-hover:text-blue-300 transition-colors">
              Trading Journal
            </span>
          </div>

          <div className="hidden lg:flex gap-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPageChange('settings')}
              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                currentPage === 'settings'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              className="lg:hidden p-2 text-gray-300 hover:bg-slate-700 rounded-lg transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2 border-t border-slate-700 mt-4 pt-4">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mr-3 ${item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
