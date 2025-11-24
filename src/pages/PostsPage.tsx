import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Trash2, FileText, Plus, Calendar, MessageSquare, Edit2, Save, X, ArrowLeft, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Post } from '../types';

export const PostsPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);


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
      if (selectedPost && selectedPost.id === postId) {
        handleBackToList();
      }
      addToast('Post deleted', 'success');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      addToast('Error deleting post', 'error');
    }
  };

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setViewMode('reading');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPost(null);
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!session || !editingPostId || !editTitle.trim() || !editContent.trim()) {
      addToast('Please enter both title and content', 'error');
      return;
    }

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          content: editContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPostId)
        .eq('user_id', session.user.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        addToast(`Error updating post: ${error.message}`, 'error');
        throw error;
      }

      if (data) {
        const updatedPost = data[0];
        setPosts(posts.map((p) => (p.id === editingPostId ? updatedPost : p)));
        if (selectedPost && selectedPost.id === editingPostId) {
          setSelectedPost(updatedPost);
        }
        setEditingPostId(null);
        setEditTitle('');
        setEditContent('');
        addToast('Post updated successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      addToast('Error updating post', 'error');
    } finally {
      setUpdating(false);
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
      {viewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">My Posts</h1>
            <p className="text-gray-400 text-lg">Share your thoughts, ideas, and insights</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Document your journey</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📝</span>
                <span>Markdown supported</span>
              </div>
            </div>
          </div>

          {/* Create New Post Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">📝 Create New Post</h2>
              </div>
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
                  <label className="block text-lg font-semibold text-white mb-3">
                    Post Content
                    <span className="text-sm text-gray-400 ml-2">(Markdown supported)</span>
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="# Your Title

Write your post content here using **Markdown** formatting:

- Bullet points
- *Italic* and **bold** text
- `code snippets`
- [Links](https://example.com)

## Subheadings

> Blockquotes for important notes"
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
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
          </div>

          {/* Posts List */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">📚 My Posts</h2>
                </div>
                <div className="text-sm text-gray-400">
                  {posts.length} post{posts.length !== 1 ? 's' : ''} total
                </div>
              </div>
            </div>

            <div className="p-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Start sharing your thoughts and ideas!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className="bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-600 rounded-lg p-6 hover:from-slate-600 hover:to-slate-500 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Reading Mode */
        selectedPost && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Posts
            </button>

            {/* Post Content */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {editingPostId === selectedPost.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-3xl font-bold bg-slate-700 border border-slate-500 rounded px-3 py-2 text-white w-full mb-4"
                        placeholder="Post title..."
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-white mb-4">{selectedPost.title}</h1>
                    )}
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(selectedPost.created_at).toLocaleTimeString()}</span>
                      {selectedPost.updated_at !== selectedPost.created_at && (
                        <>
                          <span>•</span>
                          <span>Updated {new Date(selectedPost.updated_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {editingPostId === selectedPost.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={updating || !editTitle.trim() || !editContent.trim()}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {updating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(selectedPost)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(selectedPost.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6 border-l-4 border-blue-500">
                  {editingPostId === selectedPost.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-3 text-gray-200 resize-none font-mono text-sm"
                      placeholder="Write your post in Markdown format..."
                    />
                  ) : (
                    <div className="prose prose-invert prose-slate max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedPost.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PostsPage;
