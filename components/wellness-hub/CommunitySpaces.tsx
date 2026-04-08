'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Heart, Share2, Plus, Lock, Globe, Clock, MessageSquare } from 'lucide-react';

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

const categoryColor: Record<string, string> = {
  support: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  wellness: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  social: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  professional: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};

const subTabs = [
  { id: 'feed',   label: 'Feed',        icon: MessageCircle },
  { id: 'spaces', label: 'Spaces',      icon: Users },
  { id: 'create', label: 'New Post',    icon: Plus },
];

export default function CommunitySpaces({ userRole, userId }: CommunitySpacesProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'spaces' | 'create'>('feed');

  const [spaces, setSpaces] = useState<CommunitySpace[]>([
    { id: '1', name: 'Mental Health Support', description: 'Anonymous safe space for mental health discussions and peer support', type: 'anonymous', memberCount: 127, category: 'support',      isJoined: true },
    { id: '2', name: 'Wellness Warriors',      description: 'Share wellness tips, challenges, and celebrate healthy habits',       type: 'public',    memberCount: 89,  category: 'wellness',     isJoined: true },
    { id: '3', name: 'Work-Life Balance',      description: 'Strategies and discussions about maintaining healthy work-life balance', type: 'public',  memberCount: 156, category: 'professional', isJoined: false },
    { id: '4', name: 'New Parent Support',     description: 'Private group for new parents navigating work and family life',       type: 'private',   memberCount: 23,  category: 'support',      isJoined: false },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    { id: '1', author: 'Anonymous', content: 'Having a tough week with anxiety. The breathing exercises from our wellness program have been really helpful. Anyone else find specific techniques that work?', timestamp: new Date('2024-01-15T10:30:00'), likes: 12, comments: 8,  isAnonymous: true,  category: 'Mental Health Support', isLiked: false },
    { id: '2', author: 'Sarah M.',  content: 'Completed my first 30-day meditation streak! 🧘‍♀️ Started with just 5 minutes and now doing 20 minutes daily. The difference in my stress levels is incredible.', timestamp: new Date('2024-01-15T14:20:00'), likes: 24, comments: 15, isAnonymous: false, category: 'Wellness Warriors',      isLiked: true },
    { id: '3', author: 'Mike K.',   content: 'Pro tip: I started blocking "focus time" in my calendar and treating it like a meeting. Game changer for productivity and reducing after-hours work.',           timestamp: new Date('2024-01-14T16:45:00'), likes: 18, comments: 6,  isAnonymous: false, category: 'Work-Life Balance',      isLiked: false },
  ]);

  const [newPost, setNewPost] = useState({ content: '', isAnonymous: false, category: 'Mental Health Support' });

  const toggleLike = (id: string) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));

  const toggleJoin = (id: string) =>
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, isJoined: !s.isJoined, memberCount: s.isJoined ? s.memberCount - 1 : s.memberCount + 1 } : s));

  const submitPost = () => {
    if (!newPost.content.trim()) return;
    setPosts(prev => [{
      id: Date.now().toString(),
      author: newPost.isAnonymous ? 'Anonymous' : 'You',
      content: newPost.content,
      timestamp: new Date(),
      likes: 0, comments: 0,
      isAnonymous: newPost.isAnonymous,
      category: newPost.category,
      isLiked: false,
    }, ...prev]);
    setNewPost({ content: '', isAnonymous: false, category: 'Mental Health Support' });
    setActiveTab('feed');
  };

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1">
        {subTabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                active ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${post.isAnonymous ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}`}>
                    {post.isAnonymous ? '?' : post.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{post.author}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{post.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColor['support']}`}>{post.category}</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{post.content}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${post.isLiked ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${post.isLiked ? 'fill-current' : ''}`} />{post.likes}
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />{post.comments}
                  </button>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Share2 className="h-3.5 w-3.5" />Share
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Spaces */}
      {activeTab === 'spaces' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spaces.map((s, i) => {
            const TypeIcon = s.type === 'public' ? Globe : s.type === 'private' ? Lock : Users;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{s.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${categoryColor[s.category]}`}>{s.category}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{s.type}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{s.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Users className="h-3 w-3" />{s.memberCount} members</span>
                  <button
                    onClick={() => toggleJoin(s.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      s.isJoined
                        ? 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {s.isJoined ? 'Leave' : 'Join'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create post */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Share with the Community</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Community Space</label>
              <select
                value={newPost.category}
                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-400"
              >
                {spaces.filter(s => s.isJoined).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your Message</label>
              <textarea
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share your thoughts, ask a question, or offer support..."
                rows={5}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newPost.isAnonymous} onChange={e => setNewPost({ ...newPost, isAnonymous: e.target.checked })} className="rounded" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Post anonymously</span>
            </label>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">Posts are moderated to ensure a safe environment for all members.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={submitPost}
                disabled={!newPost.content.trim()}
                className="flex-1 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                Share Post
              </button>
              <button
                onClick={() => setNewPost({ content: '', isAnonymous: false, category: 'Mental Health Support' })}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
