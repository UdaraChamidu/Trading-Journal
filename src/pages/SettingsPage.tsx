import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Moon, Sun, Download, Upload, Settings, User, Shield, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateProfile, session } = useAuth();
  const { addToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(userProfile?.dark_mode ?? true);
  const [accountBalance, setAccountBalance] = useState(userProfile?.account_balance || 10000);
  const [defaultRisk, setDefaultRisk] = useState(userProfile?.default_risk_percent || 1);
  const [timezone, setTimezone] = useState(userProfile?.timezone || 'GMT+5:30');
  const [dailyRiskLimit, setDailyRiskLimit] = useState(userProfile?.daily_risk_limit || 6);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    account: true,
    display: true,
    data: false,
    profile: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      dark_mode: isDarkMode,
      account_balance: accountBalance,
      default_risk_percent: defaultRisk,
      timezone,
      daily_risk_limit: dailyRiskLimit,
    });

    if (error) {
      addToast('Error saving settings', 'error');
    } else {
      addToast('Settings saved successfully', 'success');
    }
    setSaving(false);
  };

  const handleExportData = async () => {
    if (!session) return;

    try {
      const [{ data: trades }, { data: reviews }, { data: goals }, { data: notes }, { data: profile }] =
        await Promise.all([
          supabase.from('trades').select('*').eq('user_id', session.user.id),
          supabase.from('weekly_reviews').select('*').eq('user_id', session.user.id),
          supabase.from('goals').select('*').eq('user_id', session.user.id),
          supabase.from('general_notes').select('*').eq('user_id', session.user.id),
          supabase.from('users_profile').select('*').eq('id', session.user.id),
        ]);

      const data = {
        profile,
        trades,
        reviews,
        goals,
        notes,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      addToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      addToast('Error exporting data', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the app? This action cannot be undone.')) {
      // Implementation for reset
      addToast('App reset not implemented', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-lg">Customize your trading experience</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Settings className="w-4 h-4" />
          <span>Manage your preferences</span>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('account')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">👤 Account Settings</h2>
          </div>
          <div className="text-sm text-gray-400">
            Trading preferences
          </div>
        </button>

        {expandedSections.account && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-blue-300 mb-3">💰 Starting Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Used for position size calculations</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-green-300 mb-3">🎯 Default Risk %</label>
                  <select
                    value={defaultRisk}
                    onChange={(e) => setDefaultRisk(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="1">1% - Conservative</option>
                    <option value="1.5">1.5% - Moderate</option>
                    <option value="2">2% - Aggressive</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">Risk per trade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-purple-300 mb-3">🕐 Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., GMT+5:30"
                  />
                  <p className="text-xs text-gray-400 mt-2">Your local timezone</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-red-300 mb-3">⚠️ Daily Risk Limit</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={dailyRiskLimit}
                      onChange={(e) => setDailyRiskLimit(parseFloat(e.target.value))}
                      className="w-full pr-8 pl-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Maximum daily risk exposure</p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {saving ? '💾 Saving Settings...' : '💾 Save Account Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Display Settings */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('display')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-6 h-6 text-blue-400" /> : <Sun className="w-6 h-6 text-yellow-400" />}
            <h2 className="text-xl font-bold text-white">🎨 Display Settings</h2>
          </div>
          <div className="text-sm text-gray-400">
            Theme preferences
          </div>
        </button>

        {expandedSections.display && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-yellow-500'}`}>
                    {isDarkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {isDarkMode ? 'Perfect for late-night trading sessions' : 'Easy on the eyes during daytime'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-500'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                      isDarkMode ? 'translate-x-14' : 'translate-x-2'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('data')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">💾 Data Management</h2>
          </div>
          <div className="text-sm text-gray-400">
            Backup & restore
          </div>
        </button>

        {expandedSections.data && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Data Operations</h3>
                <p className="text-gray-300 text-sm">Manage your trading data safely</p>
              </div>

              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                📤 Export All Data (JSON)
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-600 hover:bg-slate-500 border border-slate-500 text-white font-medium rounded-lg transition-colors opacity-50 cursor-not-allowed">
                <Upload className="w-5 h-5" />
                📥 Import Data (Coming Soon)
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Shield className="w-5 h-5" />
                🔄 Reset App (Danger Zone)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">📋 Account Information</h2>
          </div>
          <div className="text-sm text-gray-400">
            Profile details
          </div>
        </button>

        {expandedSections.profile && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Email Address</div>
                  <div className="text-white font-medium">{session?.user?.email}</div>
                  <div className="text-xs text-gray-400 mt-1">Used for account access</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">User ID</div>
                  <div className="text-white font-mono text-sm">{session?.user?.id}</div>
                  <div className="text-xs text-gray-400 mt-1">Unique identifier</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
                <h4 className="text-blue-200 font-semibold mb-2">🔒 Account Security</h4>
                <p className="text-blue-100 text-sm">
                  Your data is securely stored and encrypted. Regular backups are recommended for peace of mind.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Tips */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 rounded-lg p-6">
        <h3 className="text-purple-200 font-bold text-lg mb-3">💡 Settings Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-100">
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Risk Management</div>
            <div className="text-sm">Keep daily risk limit below 6% for safety</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Regular Backups</div>
            <div className="text-sm">Export data weekly to prevent loss</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Timezone Accuracy</div>
            <div className="text-sm">Correct timezone ensures proper session timing</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Balance Updates</div>
            <div className="text-sm">Update account balance regularly for accurate calculations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
