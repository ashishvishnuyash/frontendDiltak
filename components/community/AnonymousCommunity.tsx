'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Eye, 
  Plus, 
  Send,
  EyeOff,
  Shield,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Filter,
  Lock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface CommunityPost {
  id: string;
  company_id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'general' | 'stress_relief' | 'work_life_balance' | 'mental_health' | 'success_stories' | 'seeking_support';
  tags: string[];
  is_anonymous: boolean;
  likes: number;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  likes: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AnonymousUser {
  id: string;
  employee_id: string;
  company_id: string;
  anonymous_id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
  last_active: string;
}

export default function AnonymousCommunity() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [replies, setReplies] = useState<{ [postId: string]: CommunityReply[] }>({});
  const [anonymousProfile, setAnonymousProfile] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: [] as string[]
  });
  const [newReply, setNewReply] = useState('');

  const categoryColors = {
    general: 'bg-gray-100 text-gray-700',
    stress_relief: 'bg-blue-100 text-blue-700',
    work_life_balance: 'bg-green-100 text-green-700',
    mental_health: 'bg-purple-100 text-purple-700',
    success_stories: 'bg-yellow-100 text-yellow-700',
    seeking_support: 'bg-red-100 text-red-700'
  };

  const fetchAnonymousProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_anonymous_profile',
          employee_id: user.id,
          company_id: user.company_id
        })
      });

      const result = await response.json();
      if (result.success) {
        setAnonymousProfile(result.profile);
      }
    } catch (error) {
      console.error('Error fetching anonymous profile:', error);
    }
  };

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_posts',
          company_id: user.company_id,
          data: { category: selectedCategory, limit_count: 20 }
        })
      });

      const result = await response.json();
      if (result.success) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_replies',
          data: { post_id: postId }
        })
      });

      const result = await response.json();
      if (result.success) {
        setReplies(prev => ({ ...prev, [postId]: result.replies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const createPost = async () => {
    if (!user || !anonymousProfile) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post',
          employee_id: user.id,
          company_id: user.company_id,
          data: newPost
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Post created successfully!');
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', category: 'general', tags: [] });
        fetchPosts();
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('An error occurred while creating the post');
    }
  };

  const createReply = async (postId: string) => {
    if (!user || !anonymousProfile || !newReply.trim()) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_reply',
          employee_id: user.id,
          company_id: user.company_id,
          data: { post_id: postId, content: newReply }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Reply posted successfully!');
        setNewReply('');
        fetchReplies(postId);
      } else {
        toast.error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('An error occurred while posting the reply');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like_post',
          data: { post_id: postId }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAnonymousProfile();
      await fetchPosts();
      setLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate community metrics based on actual data
  const uniqueAuthors = new Set(posts.map(p => p.author_id)).size;
  const totalPosts = posts.length;
  const postsThisWeek = posts.filter(p => {
    const postDate = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return postDate >= weekAgo;
  }).length;
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalReplies = posts.reduce((sum, p) => sum + (p.replies || 0), 0);
  const totalSupport = totalLikes + totalReplies;
  
  // Calculate active members (unique authors who posted, with a minimum based on engagement)
  // Since we only see limited posts, estimate based on unique authors + engagement
  const estimatedActiveMembers = Math.max(uniqueAuthors, Math.ceil(totalPosts * 0.8));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400 mb-3"
        >
          Community Space
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Connect with colleagues in a safe, anonymous environment. Share experiences, get support, and learn from others facing similar challenges.
        </motion.p>
      </div>

      {/* Anonymous & Confidential Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-lg">
                  Anonymous & Confidential
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  All community interactions are anonymous. Your identity is protected, and discussions remain confidential. Share openly in a judgment-free environment designed for wellness support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Discussions
            </h2>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="stress_relief">Stress Relief</SelectItem>
                  <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="success_stories">Success Stories</SelectItem>
                  <SelectItem value="seeking_support">Seeking Support</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Discussion
              </Button>
            </div>
          </div>

          {/* Create Post Modal */}
          {showCreatePost && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <span>Start New Discussion</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <Input
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What would you like to discuss?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <Select
                      value={newPost.category}
                      onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="stress_relief">Stress Relief</SelectItem>
                        <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
                        <SelectItem value="mental_health">Mental Health</SelectItem>
                        <SelectItem value="success_stories">Success Stories</SelectItem>
                        <SelectItem value="seeking_support">Seeking Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                    <Textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, experiences, or ask for support..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={createPost}
                      disabled={!newPost.title || !newPost.content}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Anonymously
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreatePost(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Discussions Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to start a discussion in your community!
                  </p>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start First Discussion
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500 dark:border-l-teal-400">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge 
                              variant="outline" 
                              className={`${categoryColors[post.category]} border-0`}
                            >
                              {post.category.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(post.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <Users className="h-4 w-4" />
                            <span>Anonymous User</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likePost(post.id)}
                            className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (selectedPost === post.id) {
                                setSelectedPost(null);
                              } else {
                                setSelectedPost(post.id);
                                fetchReplies(post.id);
                              }
                            }}
                            className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.replies}
                          </Button>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {(() => {
                            const hoursAgo = Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
                            if (hoursAgo < 1) return 'Just now';
                            if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
                            const daysAgo = Math.floor(hoursAgo / 24);
                            return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
                          })()}
                        </span>
                      </div>

                      {/* Replies Section */}
                      {selectedPost === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="space-y-3">
                            {/* Reply Input */}
                            <div className="flex space-x-2">
                              <Input
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey && newReply.trim()) {
                                    e.preventDefault();
                                    createReply(post.id);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => createReply(post.id)}
                                disabled={!newReply.trim()}
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Replies List */}
                            {replies[post.id] && replies[post.id].length > 0 ? (
                              <div className="space-y-3">
                                {replies[post.id].map((reply) => (
                                  <div key={reply.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Users className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Anonymous</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(reply.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
                                No replies yet. Be the first to respond!
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Community Impact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 border-teal-200 dark:border-teal-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                  <TrendingUp className="h-5 w-5" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Discussions</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Week</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{postsThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Engagement</span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                      {totalSupport > 0 ? totalSupport : '—'}
                    </span>
                  </div>
                  {totalLikes > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Likes</span>
                      <span className="text-base font-semibold text-teal-600 dark:text-teal-400">{totalLikes}</span>
                    </div>
                  )}
                  {totalReplies > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Replies</span>
                      <span className="text-base font-semibold text-teal-600 dark:text-teal-400">{totalReplies}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Discussion
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      fetchPosts();
                      toast.success('Discussions refreshed');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Browse All Posts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Heart className="h-5 w-5" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Be Respectful
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Treat all community members with respect and empathy. We're all here to support each other.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Share Constructively
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Focus on helpful, constructive contributions that support wellness and growth.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Stay Anonymous
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Protect your privacy and others'. Avoid sharing identifying information about yourself or your company.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Seek Professional Help
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For serious mental health concerns, please consult with qualified professionals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


