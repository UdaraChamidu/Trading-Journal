import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2, Edit2 } from 'lucide-react';

interface Goal {
  id: string;
  month: string;
  process_goal: string;
  outcome_goal: string;
  process_progress: number;
  outcome_progress: number;
}

export const GoalsPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    process_goal: '',
    outcome_goal: '',
    process_progress: 0,
    outcome_progress: 0,
  });

  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!session) return;

      try {
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.user.id)
          .order('month', { ascending: false });

        setGoals(data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
        addToast('Error loading goals', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [session]);

  const handleAddGoal = async () => {
    if (!session || !formData.process_goal || !formData.outcome_goal) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('goals')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        setGoals(goals.map((g) => (g.id === editingId ? { ...g, ...formData } : g)));
        addToast('Goal updated successfully', 'success');
      } else {
        const { data, error } = await supabase
          .from('goals')
          .insert([
            {
              user_id: session.user.id,
              month: currentMonth,
              ...formData,
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          setGoals([data[0], ...goals]);
          addToast('Goal added successfully', 'success');
        }
      }

      setFormData({
        process_goal: '',
        outcome_goal: '',
        process_progress: 0,
        outcome_progress: 0,
      });
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving goal:', error);
      addToast('Error saving goal', 'error');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData({
      process_goal: goal.process_goal,
      outcome_goal: goal.outcome_goal,
      process_progress: goal.process_progress,
      outcome_progress: goal.outcome_progress,
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter((g) => g.id !== goalId));
      addToast('Goal deleted', 'success');
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      addToast('Error deleting goal', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Monthly Goals</h1>
        <p className="text-gray-400">Set and track your trading goals</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Goal' : 'Add New Goal'}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Process Goal</label>
          <input
            type="text"
            value={formData.process_goal}
            onChange={(e) => setFormData({ ...formData, process_goal: e.target.value })}
            placeholder="e.g., Follow trading plan 100% of the time"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Outcome Goal</label>
          <input
            type="text"
            value={formData.outcome_goal}
            onChange={(e) => setFormData({ ...formData, outcome_goal: e.target.value })}
            placeholder="e.g., Achieve 60% win rate"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Process Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.process_progress}
              onChange={(e) => setFormData({ ...formData, process_progress: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Outcome Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.outcome_progress}
              onChange={(e) => setFormData({ ...formData, outcome_progress: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddGoal}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {editingId ? 'Update Goal' : 'Add Goal'}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  process_goal: '',
                  outcome_goal: '',
                  process_progress: 0,
                  outcome_progress: 0,
                });
              }}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Goals</h2>

        {goals.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No goals yet. Set your first goal!</div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{goal.month}</p>
                  <h3 className="text-white font-semibold">{goal.process_goal}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors text-yellow-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{goal.outcome_goal}</p>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Process Progress</span>
                    <span className="text-sm text-white font-semibold">{goal.process_progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.process_progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Outcome Progress</span>
                    <span className="text-sm text-white font-semibold">{goal.outcome_progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.outcome_progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
