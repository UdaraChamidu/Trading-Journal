import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2, BookOpen, Plus, Calendar, MessageSquare } from 'lucide-react';

interface GeneralNote {
  id: string;
  note_date: string;
  content: string;
  created_at: string;
}

export const JournalPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [notes, setNotes] = useState<GeneralNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    addNote: true,
    recentNotes: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (!session) return;

      try {
        const { data } = await supabase
          .from('general_notes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('note_date', { ascending: false });

        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        addToast('Error loading journal', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [session]);

  const handleAddNote = async () => {
    if (!session || !newNote.trim()) {
      addToast('Please enter a note', 'error');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('general_notes')
        .insert([
          {
            user_id: session.user.id,
            note_date: new Date().toISOString().split('T')[0],
            content: newNote,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setNotes([data[0], ...notes]);
        setNewNote('');
        addToast('Note added successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error adding note:', error);
      addToast('Error adding note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      const { error } = await supabase
        .from('general_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter((n) => n.id !== noteId));
      addToast('Note deleted', 'success');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      addToast('Error deleting note', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Trading Journal</h1>
        <p className="text-gray-400 text-lg">Market observations and trading insights</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <BookOpen className="w-4 h-4" />
          <span>Document your journey</span>
        </div>
      </div>

      {/* Add New Note Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('addNote')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">📝 Add New Note</h2>
          </div>
          <div className="text-sm text-gray-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''} total
          </div>
        </button>

        {expandedSections.addNote && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 rounded-lg">
              <div className="mb-4">
                <label className="block text-lg font-semibold text-white mb-3">Today's Market Insights</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="What patterns did you notice today? Any market observations? Key lessons learned? Technical analysis insights?"
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {saving ? '💾 Adding Note...' : '💾 Add Market Note'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Notes Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('recentNotes')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📚 Recent Notes</h2>
          </div>
          <div className="text-sm text-gray-400">
            {notes.length > 0 ? `Latest: ${notes[0]?.note_date}` : 'No notes yet'}
          </div>
        </button>

        {expandedSections.recentNotes && (
          <div className="border-t border-slate-700 p-6">
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No notes yet</h3>
                <p className="text-gray-500">Start documenting your market observations and insights!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div key={note.id} className="bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-600 rounded-lg p-6 hover:from-slate-600 hover:to-slate-500 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{note.note_date}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(note.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-white"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Journal Tips */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 rounded-lg p-6">
        <h3 className="text-purple-200 font-bold text-lg mb-3">📖 Journaling Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-100">
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Market Patterns</div>
            <div className="text-sm">Note recurring price action patterns</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Emotional State</div>
            <div className="text-sm">Track how emotions affect decisions</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Technical Insights</div>
            <div className="text-sm">Document indicator effectiveness</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Lessons Learned</div>
            <div className="text-sm">Key takeaways from each session</div>
          </div>
        </div>
      </div>
    </div>
  );
};
