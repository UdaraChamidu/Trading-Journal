import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

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
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Trading Journal</h1>
        <p className="text-gray-400">General observations and market notes</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Add New Note</h2>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="What observations do you have about the market today? What patterns did you notice?"
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleAddNote}
          disabled={saving || !newNote.trim()}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Notes</h2>

        {notes.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No notes yet. Start journaling!</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-sm">{note.note_date}</p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
