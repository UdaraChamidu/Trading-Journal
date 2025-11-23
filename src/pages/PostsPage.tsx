import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2, FileText, Plus, Calendar, MessageSquare } from 'lucide-react';
import { Post } from '../types';

export const PostsPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    addPost: true,
    recentPosts: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session) return;

      try {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        addToast('Error loading posts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [session]);

  const handleAddPost = async () => {
    if (!session || !newTitle.trim() || !newContent.trim()) {
      addToast('Please enter both title and content', 'error');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: session.user.id,
            title: newTitle,
            content: newContent,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        addToast(`Error adding post: ${error.message}`, 'error');
        throw error;
      }

      if (data) {
        setPosts([data[0], ...posts]);
        setNewTitle('');
        setNewContent('');
        addToast('Post added successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error adding post:', error);
      if (!error.message.includes('posts')) {
        addToast('Error adding post. Please check database connection.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      addToast('Post deleted', 'success');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      addToast('Error deleting post', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">My Posts</h1>
        <p className="text-gray-400 text-lg">Share your thoughts, ideas, and insights</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>Document your journey</span>
        </div>
      </div>

      {/* Add New Post Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('addPost')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">📝 Create New Post</h2>
          </div>
          <div className="text-sm text-gray-400">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </div>
        </button>

        {expandedSections.addPost && (
          <div className="border-t border-slate-700 p-6">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 rounded-lg">
              <div className="mb-4">
                <label className="block text-lg font-semibold text-white mb-3">Post Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter your post title..."
                  className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold text-white mb-3">Post Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts, ideas, or insights..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleAddPost}
                disabled={saving || !newTitle.trim() || !newContent.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {saving ? '💾 Publishing Post...' : '💾 Publish Post'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Posts Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <button
          onClick={() => toggleSection('recentPosts')}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">📚 My Posts</h2>
          </div>
          <div className="text-sm text-gray-400">
            {posts.length > 0 ? `Latest: ${new Date(posts[0]?.created_at).toLocaleDateString()}` : 'No posts yet'}
          </div>
        </button>

        {expandedSections.recentPosts && (
          <div className="border-t border-slate-700 p-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts yet</h3>
                <p className="text-gray-500">Start sharing your thoughts and ideas!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <div key={post.id} className="bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-600 rounded-lg p-6 hover:from-slate-600 hover:to-slate-500 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{post.title}</h3>
                          <div className="flex items-center gap-2 text-gray-300 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(post.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-white"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Writing Tips */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 rounded-lg p-6">
        <h3 className="text-purple-200 font-bold text-lg mb-3">✍️ Writing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-100">
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Clear Titles</div>
            <div className="text-sm">Make your titles descriptive and engaging</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Structured Content</div>
            <div className="text-sm">Organize your thoughts with paragraphs</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Personal Insights</div>
            <div className="text-sm">Share your unique perspective and experiences</div>
          </div>
          <div className="bg-purple-800/50 p-3 rounded-lg">
            <div className="font-semibold mb-1">Regular Updates</div>
            <div className="text-sm">Keep writing to track your growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};