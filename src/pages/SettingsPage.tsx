import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Moon, Sun, Download, Upload } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateProfile, session } = useAuth();
  const { addToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(userProfile?.dark_mode ?? true);
  const [accountBalance, setAccountBalance] = useState(userProfile?.account_balance || 10000);
  const [defaultRisk, setDefaultRisk] = useState(userProfile?.default_risk_percent || 1);
  const [timezone, setTimezone] = useState(userProfile?.timezone || 'GMT+5:30');
  const [dailyRiskLimit, setDailyRiskLimit] = useState(userProfile?.daily_risk_limit || 6);
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Account Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Starting Account Balance</label>
          <input
            type="number"
            step="0.01"
            value={accountBalance}
            onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Used for initial calculations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Risk %</label>
            <select
              value={defaultRisk}
              onChange={(e) => setDefaultRisk(parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">1%</option>
              <option value="1.5">1.5%</option>
              <option value="2">2%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Daily Risk Limit (%)</label>
          <input
            type="number"
            step="0.1"
            value={dailyRiskLimit}
            onChange={(e) => setDailyRiskLimit(parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Maximum risk allowed per day</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Display</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            <span className="text-gray-300">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Data Management</h2>

        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All Data (JSON)
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-medium rounded-lg transition-colors disabled opacity-50 cursor-not-allowed">
          <Upload className="w-4 h-4" />
          Import Data (Coming Soon)
        </button>

        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Reset App
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Account Info</h2>
        <div className="space-y-2 text-gray-300 text-sm">
          <div>
            <span className="text-gray-400">Email:</span> {session?.user?.email}
          </div>
          <div>
            <span className="text-gray-400">User ID:</span> {session?.user?.id}
          </div>
        </div>
      </div>
    </div>
  );
};
