import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const TradingPlanPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vision: true,
    rules: true,
    risk: true,
    entry: true,
    exit: true,
    psychology: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!session) return;

      try {
        const { data } = await supabase
          .from('trading_plan')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setPlan(
          data || {
            user_id: session.user.id,
            vision: '',
            rules: '',
            risk_management: '',
            entry_strategy: '',
            exit_strategy: '',
            psychology_notes: '',
          }
        );
      } catch (error) {
        console.error('Error fetching plan:', error);
        addToast('Error loading trading plan', 'error');
      }
    };

    fetchPlan();
  }, [session]);

  const handleSave = async () => {
    if (!session || !plan) return;

    setSaving(true);
    try {
      if (plan.id) {
        const { error } = await supabase
          .from('trading_plan')
          .update(plan)
          .eq('id', plan.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trading_plan')
          .insert([{ ...plan, user_id: session.user.id }]);

        if (error) throw error;
      }

      addToast('Trading plan saved successfully', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving plan:', error);
      addToast('Error saving plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading trading plan...</div>
      </div>
    );
  }

  const sections = [
    { id: 'vision', title: 'Vision & Goals', field: 'vision' },
    { id: 'rules', title: 'Trading Rules', field: 'rules' },
    { id: 'risk', title: 'Risk Management', field: 'risk_management' },
    { id: 'entry', title: 'Entry Strategy', field: 'entry_strategy' },
    { id: 'exit', title: 'Exit Strategy', field: 'exit_strategy' },
    { id: 'psychology', title: 'Psychology Notes', field: 'psychology_notes' },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Plan</h1>
          <p className="text-gray-400">Your complete trading system</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Edit Plan
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
            >
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              {expandedSections[section.id] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections[section.id] && (
              <div className="border-t border-slate-700 p-6">
                {isEditing ? (
                  <textarea
                    value={plan[section.field] || ''}
                    onChange={(e) => setPlan({ ...plan, [section.field]: e.target.value })}
                    placeholder={`Enter your ${section.title.toLowerCase()}...`}
                    rows={6}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {plan[section.field] || <span className="text-gray-500 italic">Not filled in yet</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-100">
          💡 <strong>Tip:</strong> Your trading plan is the foundation of consistent trading. Update it regularly and
          refer to it before every trade.
        </p>
      </div>
    </div>
  );
};
