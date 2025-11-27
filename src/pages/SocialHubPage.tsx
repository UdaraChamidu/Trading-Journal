import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, MessageSquare, Heart, Share2, Image, X, Send, Plus, Camera, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface SocialPost {
  id: string;
  user_id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  images?: string[];
  type: 'trade' | 'post' | 'idea';
  tradeDetails?: {
    symbol: string;
    direction: 'Long' | 'Short';
    roi?: number;
  };
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  created_at: string;
}

export const SocialHubPage: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [postType, setPostType] = useState<'post' | 'trade' | 'idea'>('post');
  const [tradeDetails, setTradeDetails] = useState({
    symbol: '',
    direction: 'Long' as 'Long' | 'Short',
    roi: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
      // First check if table exists by trying a simple query
      const { data: testData, error: testError } = await supabase
        .from('social_posts')
        .select('id')
        .limit(1);

      if (testError) {
        console.log('Social posts table not found, using mock data');
        setPosts([]);
        setLoading(false);
        return;
      }

      // Fetch posts without join to avoid relationship issues
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Use mock user data for now (since we can't fetch user details from client)
      const postsWithUsers = (data || []).map((post: any) => {
        const userInfo = {
          name: post.user_id === session?.user?.id ? 'You' : `User ${post.user_id.slice(0, 8)}`,
          handle: post.user_id === session?.user?.id ? '@you' : `@user${post.user_id.slice(0, 6)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`
        };

        return {
          id: post.id,
          user_id: post.user_id,
          user: userInfo,
          content: post.content,
          images: post.images || [],
          type: post.type,
          tradeDetails: post.trade_details,
          likes: post.likes || [],
          comments: post.comments || [],
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      });

      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data if database fails
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + newPostImages.length > 4) {
      addToast('Maximum 4 images allowed', 'error');
      return;
    }

    setNewPostImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `social-posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleCreatePost = async () => {
    if (!session?.user?.id) {
      addToast('Please log in to create posts', 'error');
      return;
    }

    if (!newPostContent.trim() && newPostImages.length === 0) {
      addToast('Please add some content or images', 'error');
      return;
    }

    try {
      let imageUrls: string[] = [];

      if (newPostImages.length > 0) {
        imageUrls = await uploadImages(newPostImages);
      }

      const postData = {
        user_id: session.user.id,
        content: newPostContent.trim(),
        images: imageUrls,
        type: postType,
        trade_details: postType === 'trade' ? {
          symbol: tradeDetails.symbol.toUpperCase(),
          direction: tradeDetails.direction,
          roi: tradeDetails.roi ? parseFloat(tradeDetails.roi) : null
        } : null,
        likes: [],
        comments: []
      };

      const { data, error } = await supabase
        .from('social_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newPost: SocialPost = {
        id: data.id,
        user_id: session.user.id,
        user: {
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'You',
          handle: `@${session.user.email?.split('@')[0] || 'user'}`,
          avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        },
        content: newPostContent.trim(),
        images: imageUrls,
        type: postType,
        tradeDetails: postType === 'trade' ? {
          symbol: tradeDetails.symbol.toUpperCase(),
          direction: tradeDetails.direction,
          roi: tradeDetails.roi ? parseFloat(tradeDetails.roi) : undefined
        } : undefined,
        likes: [],
        comments: [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setPosts(prev => [newPost, ...prev]);

      // Reset form
      setNewPostContent('');
      setNewPostImages([]);
      setImagePreviews([]);
      setPostType('post');
      setTradeDetails({ symbol: '', direction: 'Long', roi: '' });
      setShowCreateModal(false);

      addToast('Post created successfully!', 'success');
    } catch (error) {
      console.error('Error creating post:', error);
      addToast('Failed to create post', 'error');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user?.id) {
      addToast('Please log in to like posts', 'error');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(session.user.id);
    const newLikes = isLiked
      ? post.likes.filter(id => id !== session.user.id)
      : [...post.likes, session.user.id];

    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ likes: newLikes })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: newLikes } : p
      ));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!session?.user?.id) {
      addToast('Please log in to comment', 'error');
      return;
    }

    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user_id: session.user.id,
      user: {
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'You',
        handle: `@${session.user.email?.split('@')[0] || 'user'}`,
        avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
      },
      content: commentContent,
      created_at: new Date().toISOString()
    };

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComments = [...post.comments, newComment];

    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ comments: newComments })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: newComments } : p
      ));

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost || !session?.user?.id) return;

    try {
      let imageUrls = editingPost.images || [];

      // Handle new images
      if (newPostImages.length > 0) {
        const newUploadedUrls = await uploadImages(newPostImages);
        imageUrls = [...imageUrls, ...newUploadedUrls];
      }

      const updateData = {
        content: newPostContent.trim(),
        images: imageUrls,
        type: postType,
        trade_details: postType === 'trade' ? {
          symbol: tradeDetails.symbol.toUpperCase(),
          direction: tradeDetails.direction,
          roi: tradeDetails.roi ? parseFloat(tradeDetails.roi) : null
        } : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('social_posts')
        .update(updateData)
        .eq('id', editingPost.id);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(p =>
        p.id === editingPost.id ? { ...p, ...updateData } : p
      ));

      // Reset form
      setShowEditModal(false);
      setEditingPost(null);
      setNewPostContent('');
      setNewPostImages([]);
      setImagePreviews([]);
      setPostType('post');
      setTradeDetails({ symbol: '', direction: 'Long', roi: '' });

      addToast('Post updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating post:', error);
      addToast('Failed to update post', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      addToast('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      addToast('Failed to delete post', 'error');
    }
  };

  const startEditPost = (post: SocialPost) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    setPostType(post.type);
    setTradeDetails({
      symbol: post.tradeDetails?.symbol || '',
      direction: post.tradeDetails?.direction || 'Long',
      roi: post.tradeDetails?.roi?.toString() || ''
    });
    setImagePreviews(post.images || []);
    setShowEditModal(true);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg">Loading social hub...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 rounded-full mb-4 shadow-lg shadow-pink-500/25">
          <Users className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Social Hub</h1>
        </div>
        <p className="text-gray-400 text-lg">Connect with other traders and share your journey</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          {/* Create Post Button */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {session?.user?.user_metadata?.full_name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 text-left bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-gray-400 hover:text-white hover:border-pink-500 transition-colors"
              >
                Share your thoughts, trades, or ideas...
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Post
              </button>
              <button
                onClick={() => {
                  setPostType('trade');
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Trade
              </button>
              <button
                onClick={() => {
                  setPostType('idea');
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                Idea
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-4">Be the first to share your trading journey!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link to="/profile">
                      <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full bg-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" />
                    </Link>
                    <div>
                      <Link to="/profile" className="hover:text-blue-400 transition-colors">
                        <div className="font-bold text-white cursor-pointer">
                          {post.user.name}
                        </div>
                      </Link>
                      <div className="text-sm text-gray-400">{post.user.handle} • {formatTimeAgo(post.created_at)}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    post.type === 'trade' ? 'bg-green-900 text-green-100' :
                    post.type === 'idea' ? 'bg-purple-900 text-purple-100' :
                    'bg-blue-900 text-blue-100'
                  }`}>
                    {post.type}
                  </div>
                </div>

                <p className="text-gray-200 mb-4 text-lg whitespace-pre-wrap">{post.content}</p>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className={`grid gap-2 mb-4 ${
                    post.images.length === 1 ? 'grid-cols-1' :
                    post.images.length === 2 ? 'grid-cols-2' :
                    post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                  }`}>
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className={`rounded-lg object-cover ${
                          post.images!.length === 1 ? 'max-h-96 w-full' :
                          post.images!.length === 3 && index === 0 ? 'row-span-2' : 'h-48'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {post.type === 'trade' && post.tradeDetails && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-white">{post.tradeDetails.symbol}</div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        post.tradeDetails.direction === 'Long' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                      }`}>
                        {post.tradeDetails.direction}
                      </div>
                      {post.tradeDetails.roi && (
                        <div className="flex items-center gap-1 text-green-400 font-bold ml-auto">
                          <TrendingUp className="w-4 h-4" />
                          +{post.tradeDetails.roi}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <img src={comment.user.avatar} alt={comment.user.name} className="w-6 h-6 rounded-full" />
                          <span className="font-bold text-white text-sm">{comment.user.name}</span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    ))}
                    {post.comments.length > 3 && (
                      <div className="text-sm text-gray-400">
                        View all {post.comments.length} comments
                      </div>
                    )}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 text-sm"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-6 text-gray-400">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 transition-colors group ${
                      post.likes.includes(session?.user?.id || '') ? 'text-pink-400' : 'hover:text-pink-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.likes.includes(session?.user?.id || '') ? 'fill-pink-400' : 'group-hover:fill-pink-400'}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.comments?.length || 0}</span>
                  </button>

                  {/* Edit and Delete buttons for post creator */}
                  {post.user_id === session?.user?.id && (
                    <>
                      <button
                        onClick={() => startEditPost(post)}
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-2 hover:text-red-400 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <button className="flex items-center gap-2 hover:text-green-400 transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          {/* Trending Topics */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Trending
            </h3>
            <div className="space-y-4">
              {['#Bitcoin', '#SolanaSummer', '#TradingPsychology', '#Altseason', '#CryptoNews'].map((tag) => (
                <div key={tag} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-gray-400 group-hover:text-pink-400 transition-colors">{tag}</span>
                  <span className="text-xs text-gray-600">{Math.floor(Math.random() * 10) + 1}k posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-3">
                  <img src={post.user.avatar} alt={post.user.name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      <span className="font-bold">{post.user.name}</span> shared a {post.type}
                    </div>
                    <div className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Post</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Post Type Selector */}
                <div className="flex gap-2 mb-4">
                  {[
                    { type: 'post', label: 'Post', icon: MessageSquare },
                    { type: 'trade', label: 'Trade', icon: TrendingUp },
                    { type: 'idea', label: 'Idea', icon: Camera }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        postType === type
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Content Input */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={
                    postType === 'trade' ? 'Share your latest trade...' :
                    postType === 'idea' ? 'Share your trading idea...' :
                    'Share your thoughts...'
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  rows={4}
                />

                {/* Trade Details */}
                {postType === 'trade' && (
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Symbol (BTC, ETH)"
                      value={tradeDetails.symbol}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, symbol: e.target.value }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                    <select
                      value={tradeDetails.direction}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, direction: e.target.value as 'Long' | 'Short' }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ROI % (optional)"
                      value={tradeDetails.roi}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, roi: e.target.value }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    Add Images ({newPostImages.length}/4)
                  </button>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() && newPostImages.length === 0}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Post</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPost(null);
                    setNewPostContent('');
                    setNewPostImages([]);
                    setImagePreviews([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Post Type Selector */}
                <div className="flex gap-2 mb-4">
                  {[
                    { type: 'post', label: 'Post', icon: MessageSquare },
                    { type: 'trade', label: 'Trade', icon: TrendingUp },
                    { type: 'idea', label: 'Idea', icon: Camera }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        postType === type
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Content Input */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Update your post..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  rows={4}
                />

                {/* Trade Details */}
                {postType === 'trade' && (
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Symbol (BTC, ETH)"
                      value={tradeDetails.symbol}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, symbol: e.target.value }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                    <select
                      value={tradeDetails.direction}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, direction: e.target.value as 'Long' | 'Short' }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ROI % (optional)"
                      value={tradeDetails.roi}
                      onChange={(e) => setTradeDetails(prev => ({ ...prev, roi: e.target.value }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}

                {/* Current Images */}
                {editingPost.images && editingPost.images.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Current Images:</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {editingPost.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Current image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const newImages = editingPost.images?.filter((_, i) => i !== index) || [];
                              setEditingPost(prev => prev ? { ...prev, images: newImages } : null);
                              setImagePreviews(newImages);
                            }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add More Images */}
                <div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    Add More Images ({newPostImages.length}/4)
                  </button>
                </div>

                {/* New Image Previews */}
                {imagePreviews.length > (editingPost.images?.length || 0) && (
                  <div>
                    <h4 className="text-white font-medium mb-2">New Images:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.slice(editingPost.images?.length || 0).map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`New preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage((editingPost.images?.length || 0) + index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPost(null);
                      setNewPostContent('');
                      setNewPostImages([]);
                      setImagePreviews([]);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPost}
                    disabled={!newPostContent.trim() && (editingPost.images?.length || 0) + newPostImages.length === 0}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialHubPage;
