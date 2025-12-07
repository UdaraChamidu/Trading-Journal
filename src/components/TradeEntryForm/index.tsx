import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { calculatePnL, determineTradeResult, formatDuration } from '../../lib/calculations';
import { BasicInfoTab } from './BasicInfoTab';
import { H4AnalysisTab } from './H4AnalysisTab';
import { M15ConfirmationTab } from './M15ConfirmationTab';
import { M1EntryTab } from './M1EntryTab';
import { ExecutionTab } from './ExecutionTab';
import { PsychologyTab } from './PsychologyTab';
import { ChevronRight, ChevronLeft, Plus, Edit3, CheckCircle } from 'lucide-react';

interface TradeFormData {
  trade_date?: string;
  trade_time?: string;
  day_of_week?: string;
  session?: string;
  account_balance?: number;
  news_event?: boolean;
  news_details?: string;
  h4_trend?: string;
  h4_poi_type?: string;
  h4_poi_price?: number;
  h4_target_price?: number;
  h4_notes?: string;
  m15_choch?: boolean;
  m15_choch_price?: number;
  m15_poi_type?: string;
  m15_poi_price?: number;
  m15_retracement?: boolean;
  m15_notes?: string;
  m1_choch?: boolean;
  m1_entry_type?: string;
  m1_entry_count?: number;
  m1_notes?: string;
  trade_type?: 'RISKY' | 'SAFE';
  m15_bos?: boolean;
  m15_golden_ratio?: boolean;
  m1_golden_ratio?: boolean;
  direction?: string;
  entry_price?: number;
  position_size?: number;
  stop_loss?: number;
  take_profit?: number;
  exit_price?: number;
  risk_percent?: number;
  break_even_applied?: boolean;
  exit_reason?: string;
  risk_dollar?: number;
  risk_reward_ratio?: number;
  pre_emotion?: string;
  during_emotion?: string;
  post_feeling?: string;
  plan_followed?: string;
  mistakes_made?: string;
  lesson_learned?: string;
  screenshot_url?: string;
}

interface TradeEntryFormProps {
  onClose?: () => void;
  editingTrade?: any;
}

export const TradeEntryForm: React.FC<TradeEntryFormProps> = ({ onClose, editingTrade }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState<TradeFormData>(editingTrade || {});
  const [loading, setLoading] = useState(false);
  const { userProfile, session } = useAuth();
  const { addToast } = useToast();

  const tabs = [
    { name: 'Basic Info', component: BasicInfoTab },
    { name: '4H Analysis', component: H4AnalysisTab },
    { name: '15m Confirmation', component: M15ConfirmationTab },
    { name: '1m Entry', component: M1EntryTab },
    { name: 'Execution', component: ExecutionTab },
    { name: 'Psychology', component: PsychologyTab },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.trade_date) {
      addToast('Please fill in trade date', 'error');
      return false;
    }
    if (!formData.trade_time) {
      addToast('Please fill in trade time', 'error');
      return false;
    }
    if (!formData.session) {
      addToast('Please select a trading session', 'error');
      return false;
    }
    if (!formData.account_balance) {
      addToast('Please fill in account balance', 'error');
      return false;
    }
    if (!formData.direction) {
      addToast('Please select trade direction', 'error');
      return false;
    }
    if (!formData.entry_price) {
      addToast('Please fill in entry price', 'error');
      return false;
    }
    if (!formData.stop_loss) {
      addToast('Please fill in stop loss', 'error');
      return false;
    }
    if (!formData.risk_percent) {
      addToast('Please select risk percentage', 'error');
      return false;
    }

    if (formData.direction === 'Long' && formData.stop_loss >= formData.entry_price) {
      addToast('For long trades, stop loss must be below entry price', 'error');
      return false;
    }
    if (formData.direction === 'Short' && formData.stop_loss <= formData.entry_price) {
      addToast('For short trades, stop loss must be above entry price', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let submitData: any = {
        user_id: session?.user.id,
        ...formData,
      };

      if (formData.exit_price && formData.entry_price) {
        const { plDollar, plPercent } = calculatePnL(
          formData.entry_price,
          formData.exit_price,
          formData.position_size || 0,
          formData.direction as 'Long' | 'Short'
        );
        submitData.pl_dollar = plDollar;
        submitData.pl_percent = plPercent;
        submitData.trade_result = determineTradeResult(plDollar);

        if (formData.trade_time && submitData.trade_time) {
          submitData.trade_duration = formatDuration(formData.trade_time, submitData.trade_time);
        }
      }

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 15000);
      });

      // Execute the appropriate Supabase query
      const supabasePromise = (async () => {
        if (editingTrade) {
          const { error } = await supabase
            .from('trades')
            .update(submitData)
            .eq('id', editingTrade.id);
          if (error) throw error;
          return 'updated';
        } else {
          const { error } = await supabase
            .from('trades')
            .insert([submitData]);
          if (error) throw error;
          return 'created';
        }
      })();

      // Race against the timeout
      const result = await Promise.race([supabasePromise, timeoutPromise]);

      addToast(`Trade ${result} successfully`, 'success');
      
      if (result === 'created') {
        setFormData({});
        setCurrentTab(0);
      }

      onClose?.();
    } catch (error: any) {
      console.error('Error saving trade:', error);
      addToast(error.message || 'Error saving trade', 'error');
    } finally {
      setLoading(false);
    }
  };

  const CurrentTabComponent = tabs[currentTab].component;
  const accountBalance = formData.account_balance || userProfile?.account_balance || 10000;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="text-center p-6 border-b border-slate-600">
          <h1 className="text-4xl font-bold text-white mb-2">
            {editingTrade ? 'Edit Trade' : 'New Trade Entry'}
          </h1>
          <p className="text-gray-400 text-lg">
            {editingTrade ? 'Update your trade details' : 'Record a new trading opportunity'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            {editingTrade ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{editingTrade ? 'Modify existing trade' : 'Step-by-step trade recording'}</span>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-300">Progress</span>
              <span className="text-sm text-gray-400">
                Step {currentTab + 1} of {tabs.length}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentTab + 1) / tabs.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setCurrentTab(index)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 transform hover:scale-105 ${
                  currentTab === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : index < currentTab
                      ? 'bg-green-700 text-green-100 hover:bg-green-600'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index < currentTab && <CheckCircle className="w-4 h-4" />}
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px] bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg p-6 mb-8">
            <CurrentTabComponent
              data={formData}
              onChange={handleChange}
              accountBalance={accountBalance}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-3">
              {currentTab > 0 && (
                <button
                  onClick={() => setCurrentTab(currentTab - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {currentTab < tabs.length - 1 && (
                <button
                  onClick={() => setCurrentTab(currentTab + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? '💾 Saving...' : editingTrade ? '💾 Update Trade' : '💾 Save Trade'}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors hover:scale-105"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
