'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share, 
  Plus, 
  Lock, 
  Globe, 
  Clock,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface CommunitySpacesProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

interface CommunitySpace {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'anonymous';
  memberCount: number;
  category: 'support' | 'wellness' | 'social' | 'professional';
  isJoined: boolean;
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  category: string;
  isLiked: boolean;
}

export default function CommunitySpaces({ userRole, userId }: CommunitySpacesProps) {
  const [activeTab, setActiveTab] = useState<'spaces' | 'feed' | 'create'>('feed');
  
  const [communitySpaces, setCommunitySpaces] = useState<CommunitySpace[]>([
    {
      id: '1',
      name: 'Mental Health Support',
      description: 'Anonymous safe space for mental health discussions and peer support',
      type: 'anonymous',
      memberCount: 127,
      category: 'support',
      isJoined: true
    },
    {
      id: '2',
      name: 'Wellness Warriors',
      description: 'Share wellness tips, challenges, and celebrate healthy habits',
      type: 'public',
      memberCount: 89,
      category: 'wellness',
      isJoined: true
    },
    {
      id: '3',
      name: 'Work-Life Balance',
      description: 'Strategies and discussions about maintaining healthy work-life balance',
      type: 'public',
      memberCount: 156,
      category: 'professional',
      isJoined: false
    },
    {
      id: '4',
      name: 'New Parent Support',
      description: 'Private group for new parents navigating work and family life',
      type: 'private',
      memberCount: 23,
      category: 'support',
      isJoined: false
    }
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Anonymous',
      content: 'Having a tough week with anxiety. The breathing exercises from our wellness program have been really helpful. Anyone else find specific techniques that work?',
      timestamp: new Date('2024-01-15T10:30:00'),
      likes: 12,
      comments: 8,
      isAnonymous: true,
      category: 'Mental Health Support',
      isLiked: false
    },
    {
      id: '2',
      author: 'Sarah M.',
      content: 'Completed my first 30-day meditation streak! 🧘‍♀️ Started with just 5 minutes and now doing 20 minutes daily. The difference in my stress levels is incredible.',
      timestamp: new Date('2024-01-15T14:20:00'),
      likes: 24,
      comments: 15,
      isAnonymous: false,
      category: 'Wellness Warriors',
      isLiked: true
    },
    {
      id: '3',
      author: 'Mike K.',
      content: 'Pro tip: I started blocking "focus time" in my calendar and treating it like a meeting. Game changer for productivity and reducing after-hours work.',
      timestamp: new Date('2024-01-14T16:45:00'),
      likes: 18,
      comments: 6,
      isAnonymous: false,
      category: 'Work-Life Balance',
      isLiked: false
    }
  ]);

  const [newPost, setNewPost] = useState({
    content: '',
    isAnonymous: false,
    category: 'Mental Health Support'
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'support': return 'bg-red-100 text-red-800';
      case 'wellness': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return Globe;
      case 'private': return Lock;
      case 'anonymous': return Users;
      default: return Users;
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked 
            }
          : post
      )
    );
  };

  const handleJoinSpace = (spaceId: string) => {
    setCommunitySpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? { ...space, isJoined: !space.isJoined, memberCount: space.isJoined ? space.memberCount - 1 : space.memberCount + 1 }
          : space
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: newPost.isAnonymous ? 'Anonymous' : 'You',
      content: newPost.content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isAnonymous: newPost.isAnonymous,
      category: newPost.category,
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost({ content: '', isAnonymous: false, category: 'Mental Health Support' });
    setActiveTab('feed');
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border-0">
          {[
            { id: 'feed', label: 'Community Feed', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
            { id: 'spaces', label: 'Spaces', icon: Users, color: 'from-purple-500 to-pink-500' },
            { id: 'create', label: 'Create Post', icon: Plus, color: 'from-green-500 to-emerald-500' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Community Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-br ${
                          post.isAnonymous 
                            ? 'from-gray-500 to-gray-700' 
                            : 'from-blue-500 to-purple-600'
                        } rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {post.isAnonymous ? '🎭' : post.author[0]}
                      </motion.div>
                      <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {post.author}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {post.timestamp.toLocaleDateString()} at {post.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge className={`${getCategoryColor('support')} px-3 py-1 text-sm font-semibold shadow-md`}>
                        {post.category}
                      </Badge>
                    </motion.div>
                  </div>
                  
                  <motion.p 
                    className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-base bg-gray-50/50 dark:bg-gray-700/50 p-4 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {post.content}
                  </motion.p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                          post.isLiked 
                            ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 shadow-md' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </motion.button>
                      
                      <motion.button 
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300 font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post.comments}
                      </motion.button>
                    </div>
                    
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share className="h-4 w-4" />
                      Share
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Community Spaces */}
      {activeTab === 'spaces' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communitySpaces.map((space) => {
            const IconComponent = getTypeIcon(space.type);
            return (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{space.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(space.category)}>
                              {space.category}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {space.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {space.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {space.memberCount} members
                      </div>
                      <Button
                        onClick={() => handleJoinSpace(space.id)}
                        variant={space.isJoined ? "outline" : "default"}
                        size="sm"
                      >
                        {space.isJoined ? 'Leave' : 'Join'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Post */}
      {activeTab === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Share with the Community</CardTitle>
            <p className="text-sm text-gray-600">
              Share your thoughts, experiences, or ask for support from the community
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Community Space</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {communitySpaces
                  .filter(space => space.isJoined)
                  .map(space => (
                    <option key={space.id} value={space.name}>
                      {space.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Message</label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share your thoughts, ask a question, or offer support..."
                rows={6}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newPost.isAnonymous}
                  onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Post anonymously
                </label>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Community Guidelines:</strong> Be respectful, supportive, and maintain confidentiality. 
                  Posts are moderated to ensure a safe environment for all members.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleCreatePost} className="flex-1">
                Share Post
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNewPost({ content: '', isAnonymous: false, category: 'Mental Health Support' })}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}