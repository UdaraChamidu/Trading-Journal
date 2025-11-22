import React, { useState, useEffect } from 'react';
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
import { ChevronRight, ChevronLeft } from 'lucide-react';

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

      if (editingTrade) {
        const { error } = await supabase
          .from('trades')
          .update(submitData)
          .eq('id', editingTrade.id);

        if (error) throw error;
        addToast('Trade updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('trades')
          .insert([submitData]);

        if (error) throw error;
        addToast('Trade created successfully', 'success');
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">{editingTrade ? 'Edit Trade' : 'New Trade'}</h2>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setCurrentTab(index)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  currentTab === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <CurrentTabComponent
              data={formData}
              onChange={handleChange}
              accountBalance={accountBalance}
            />
          </div>

          <div className="flex justify-between mt-8 gap-4">
            <div className="flex gap-2">
              {currentTab > 0 && (
                <button
                  onClick={() => setCurrentTab(currentTab - 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {currentTab < tabs.length - 1 && (
                <button
                  onClick={() => setCurrentTab(currentTab + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingTrade ? 'Update Trade' : 'Save Trade'}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors"
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
