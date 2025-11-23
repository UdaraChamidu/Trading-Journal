import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2, Edit2, Target, TrendingUp, Plus, Calendar, CheckCircle } from 'lucide-react';

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    addGoal: true,
    yourGoals: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Monthly Goals</h1>
        <p className="text-gray-400 text-lg">Set, track, and achieve your trading objectives</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>Process + Outcome Goals</span>
        </div>
      </div>

      {/* Add/Edit Goal Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('addGoal')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">
              {editingId ? '✏️ Edit Goal' : '🎯 Add New Goal'}
            </h2>
          </div>
          <div className="text-sm text-gray-400">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} set
          </div>
        </button>

        {expandedSections.addGoal && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-600 p-6 rounded-lg space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {editingId ? 'Update Your Goal' : 'Set Your Monthly Goal'}
                </h3>
                <p className="text-gray-300 text-sm">
                  Define both process (what you'll do) and outcome (what you'll achieve) goals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-blue-300 mb-3">🎯 Process Goal</label>
                  <input
                    type="text"
                    value={formData.process_goal}
                    onChange={(e) => setFormData({ ...formData, process_goal: e.target.value })}
                    placeholder="e.g., Follow trading plan 100% of the time"
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">What actions will you take?</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-green-300 mb-3">📈 Outcome Goal</label>
                  <input
                    type="text"
                    value={formData.outcome_goal}
                    onChange={(e) => setFormData({ ...formData, outcome_goal: e.target.value })}
                    placeholder="e.g., Achieve 60% win rate"
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">What results do you want?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-blue-300 mb-3">
                    Process Progress: {formData.process_progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.process_progress}
                    onChange={(e) => setFormData({ ...formData, process_progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-green-300 mb-3">
                    Outcome Progress: {formData.outcome_progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.outcome_progress}
                    onChange={(e) => setFormData({ ...formData, outcome_progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddGoal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {editingId ? '💾 Update Goal' : '🎯 Set Goal'}
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
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Your Goals Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('yourGoals')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">📋 Your Goals</h2>
          </div>
          <div className="text-sm text-gray-400">
            Track your progress
          </div>
        </button>

        {expandedSections.yourGoals && (
          <div className="border-t border-slate-700 p-6">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No goals set yet</h3>
                <p className="text-gray-500">Set your first goal to start tracking your progress!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <div key={goal.id} className="bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-600 rounded-lg p-6 hover:from-slate-600 hover:to-slate-500 transition-all duration-200">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-300 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{goal.month}</span>
                          </div>
                          <div className="text-sm text-gray-400">Monthly Goal</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-2 hover:bg-yellow-600 rounded transition-colors text-yellow-400 hover:text-white"
                          title="Edit goal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-white"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h4 className="text-blue-300 font-semibold">Process Goal</h4>
                        </div>
                        <p className="text-gray-200 mb-3">{goal.process_goal}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-blue-300 font-bold">{goal.process_progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-3 mt-2">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${goal.process_progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <h4 className="text-green-300 font-semibold">Outcome Goal</h4>
                        </div>
                        <p className="text-gray-200 mb-3">{goal.outcome_goal}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-green-300 font-bold">{goal.outcome_progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-3 mt-2">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${goal.outcome_progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-400">Overall Progress</div>
                          <div className="text-lg font-bold text-white">
                            {Math.round((goal.process_progress + goal.outcome_progress) / 2)}%
                          </div>
                        </div>
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal Setting Tips */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h3 className="text-blue-200 font-bold text-lg mb-3">💡 Goal Setting Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Process Goals</div>
            <div className="text-sm">Focus on habits and actions you can control</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Outcome Goals</div>
            <div className="text-sm">Results that depend on process execution</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">SMART Goals</div>
            <div className="text-sm">Specific, Measurable, Achievable, Relevant, Time-bound</div>
          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Regular Review</div>
            <div className="text-sm">Update progress weekly to stay on track</div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default GoalsPage;
