import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Settings, TrendingUp } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'trade-entry', label: 'New Trade', icon: '📝' },
    { id: 'all-trades', label: 'All Trades', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'weekly-review', label: 'Weekly Review', icon: '📅' },
    { id: 'trading-plan', label: 'Trading Plan', icon: '🎯' },
    { id: 'journal', label: 'Journal', icon: '📔' },
    { id: 'goals', label: 'Goals', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onPageChange('dashboard')}>
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span className="text-white font-bold text-lg hidden sm:inline">Trading Journal</span>
          </div>

          <div className="hidden lg:flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onPageChange('settings')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              className="lg:hidden p-2 text-gray-300 hover:bg-slate-700 rounded-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
