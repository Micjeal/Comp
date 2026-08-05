import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  MapPin,
  Share2,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Heart,
  MoreVertical,
  ShieldAlert,
  Check,
  Search,
  Pin,
  X,
  Plus,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DiscussionPost } from '../types';
import { PullToRefresh } from '../components/common/PullToRefresh';
import { groupsApi } from '../api/groupsApi';

interface PostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
}

export const GroupDetailView: React.FC = () => {
  const { activeGroupId, groups, goBack, joinGroup, openShareModal, openReportModal, refreshData } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'discussions' | 'about' | 'members'>('discussions');

  const currentUserAuthorName = user?.fullName || 'Community Member';
  const currentUserAuthorAvatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
  const currentUserAuthorRole = user?.role === 'admin' ? 'Admin' : 'Active Member';
  const currentUserAuthorId = user?.id || `usr_${Date.now()}`;

  const [newPostText, setNewPostText] = useState('');
  const [attachImage, setAttachImage] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');

  const group = groups.find((g) => g.id === activeGroupId) || groups[0];

  // Track comments for posts
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<DiscussionPost[]>([]);

  // Fetch posts and comments from backend API on mount or when active group changes
  useEffect(() => {
    if (!group) return;

    const fetchPostsAndComments = async () => {
      try {
        const res = await groupsApi.getPosts(group.id);
        if (res.success && Array.isArray(res.data)) {
          setPosts(res.data);

          // Fetch comments for each post
          const commentsMap: Record<string, PostComment[]> = {};
          await Promise.all(
            res.data.map(async (p) => {
              try {
                const cRes = await groupsApi.getPostComments(p.id);
                if (cRes.success && Array.isArray(cRes.data)) {
                  commentsMap[p.id] = cRes.data;
                }
              } catch (_) {}
            })
          );
          setPostComments(commentsMap);
        }
      } catch (err) {
        console.warn('Failed to load group posts from backend API:', err);
      }
    };

    fetchPostsAndComments();
  }, [group?.id]);

  if (!group) return null;

  const groupMembers = [
    {
      id: user?.id || 'usr_me',
      name: user?.fullName || 'Active Member',
      role: user?.role === 'admin' ? 'Admin' : 'Active Member',
      avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      joined: 'Joined',
    },
    {
      id: 'usr_002',
      name: group.adminName,
      role: 'Group Admin',
      avatar: group.logoUrl,
      joined: 'Founder',
    },
    {
      id: 'usr_003',
      name: 'David Musoke',
      role: 'Civic Coordinator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      joined: 'Joined Jun 2026',
    },
    {
      id: 'usr_004',
      name: 'Dr. Jane Kigozi',
      role: 'Health Advocate',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      joined: 'Joined Jul 2026',
    },
  ];

  const filteredMembers = groupMembers.filter(
    (m) => m.name.toLowerCase().includes(memberQuery.toLowerCase()) || m.role.toLowerCase().includes(memberQuery.toLowerCase())
  );

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const postPayload = {
      body: newPostText.trim(),
      mediaUrl: attachImage
        ? 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'
        : undefined,
      authorName: currentUserAuthorName,
      authorAvatar: currentUserAuthorAvatar,
      authorRole: currentUserAuthorRole,
      authorId: currentUserAuthorId,
    };

    const newPost: DiscussionPost = {
      id: `pst_${Date.now()}`,
      groupId: group.id,
      authorId: currentUserAuthorId,
      authorName: currentUserAuthorName,
      authorAvatar: currentUserAuthorAvatar,
      authorRole: currentUserAuthorRole,
      body: newPostText.trim(),
      mediaUrl: postPayload.mediaUrl,
      likeCount: 1,
      commentCount: 0,
      isLiked: true,
      createdAt: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setAttachImage(false);

    try {
      await groupsApi.createPost(group.id, postPayload);
    } catch (err) {
      console.warn('API post creation error:', err);
    }
  };

  const toggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return { ...p, isLiked, likeCount: isLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) };
        }
        return p;
      })
    );

    try {
      await groupsApi.likePost(postId);
    } catch (_) {}
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded && (!postComments[postId] || postComments[postId].length === 0)) {
      try {
        const res = await groupsApi.getPostComments(postId);
        if (res.success && Array.isArray(res.data)) {
          setPostComments((prev) => ({ ...prev, [postId]: res.data }));
        }
      } catch (_) {}
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      authorName: currentUserAuthorName,
      authorAvatar: currentUserAuthorAvatar,
      body: text.trim(),
      createdAt: 'Just now',
    };

    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );

    setCommentInput((prev) => ({ ...prev, [postId]: '' }));

    try {
      await groupsApi.addPostComment(postId, {
        body: text.trim(),
        authorName: currentUserAuthorName,
        authorAvatar: currentUserAuthorAvatar,
      });
    } catch (err) {
      console.warn('API add comment error:', err);
    }
  };

  return (
    <PullToRefresh onRefresh={refreshData} className="min-h-full">
      <div className="min-h-screen bg-[#0A0C10] text-slate-300 pb-24 max-w-md mx-auto">
        {/* Group Cover & Header */}
        <div className="relative h-48 bg-purple-950">
          <img src={group.coverUrl} alt={group.name} className="w-full h-full object-cover opacity-75" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={goBack}
              className="p-2 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => openShareModal(group.name, window.location.href)}
              className="p-2 rounded-xl bg-[#0F1219]/80 backdrop-blur-md text-white border border-slate-700/60 hover:bg-slate-800 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Group Info Header */}
        <div className="bg-[#0F1219] p-5 rounded-b-3xl border-b border-slate-800 space-y-4 shadow-xl -mt-6 relative z-10">
          <div className="flex items-end justify-between -mt-12">
            <img
              src={group.logoUrl}
              alt={group.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-800 shadow-xl bg-[#0A0C10]"
            />

            <button
              onClick={() => joinGroup(group.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                group.isMember
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-900/40'
              }`}
            >
              {group.isMember ? 'Joined Group' : 'Join Group'}
            </button>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" /> {group.memberCount} Members
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> {group.location}
              </span>
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-t border-slate-800 pt-3 text-xs font-mono font-bold text-slate-400">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`pb-2 ${activeTab === 'discussions' ? 'text-purple-400 border-b-2 border-purple-400' : 'hover:text-white'}`}
            >
              Discussions ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 ${activeTab === 'about' ? 'text-purple-400 border-b-2 border-purple-400' : 'hover:text-white'}`}
            >
              About & Rules
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-2 ${activeTab === 'members' ? 'text-purple-400 border-b-2 border-purple-400' : 'hover:text-white'}`}
            >
              Members ({group.memberCount})
            </button>
          </div>
        </div>

        {/* Main Tab View */}
        <div className="p-4 space-y-4">
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {/* Post Composer */}
              <form onSubmit={handlePostSubmit} className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share a respectful update or suggestion with the group..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl bg-[#0A0C10] text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-purple-500"
                />

                {attachImage && (
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/30">
                    <img
                      src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
                      alt="Attachment preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachImage(false)}
                      className="absolute top-2 right-2 p-1 bg-[#0F1219]/80 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setAttachImage(!attachImage)}
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-mono ${
                      attachImage ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{attachImage ? 'Photo attached' : 'Add Photo'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!newPostText.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-purple-900/40"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Update
                  </button>
                </div>
              </form>

              {/* Posts List */}
              {posts.map((post) => {
                const isExpanded = expandedComments[post.id];
                const commentsList = postComments[post.id] || [];

                return (
                  <div key={post.id} className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-800" />
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {post.authorName}
                            {post.authorRole === 'Community Leader' && (
                              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[9px] font-mono">Leader</span>
                            )}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400">{post.createdAt}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => openReportModal('post', post.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800"
                        title="Report post"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{post.body}</p>

                    {post.mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-800/80">
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-44 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 p-1 rounded-lg ${post.isLiked ? 'text-red-400 font-bold' : 'hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likeCount}
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 p-1 rounded-lg hover:text-purple-400"
                      >
                        <MessageSquare className="w-4 h-4" /> {post.commentCount} Comments
                      </button>
                    </div>

                    {/* Interactive Comments Drawer */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-3">
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {commentsList.map((c) => (
                            <div key={c.id} className="p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800/80 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-white">{c.authorName}</span>
                                <span className="text-[9px] font-mono text-slate-500">{c.createdAt}</span>
                              </div>
                              <p className="text-[11px] text-slate-300">{c.body}</p>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInput[post.id] || ''}
                            onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                            className="flex-1 text-xs p-2.5 rounded-xl bg-[#0A0C10] text-white border border-slate-800 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="submit"
                            className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-[#0F1219] p-5 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-300">
              <h3 className="font-bold text-white text-sm">Group Purpose & Vision</h3>
              <p className="leading-relaxed">{group.description}</p>

              <div className="border-t border-slate-800 pt-3 space-y-2 font-mono text-[11px]">
                <p className="text-slate-400 font-bold uppercase tracking-wider">Group Metadata</p>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Visibility:</span> <span className="font-bold text-white uppercase">{group.visibility}</span>
                  </div>
                  <div className="p-2 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Category:</span> <span className="font-bold text-purple-400">{group.category}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl space-y-1 font-mono">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Community Safety Rules
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-purple-200">
                  <li>Respectful communication mandatory. No hate speech.</li>
                  <li>Verify community news sources before posting updates.</li>
                  <li>Organize events transparently in coordination with local leaders.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search group members..."
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0A0C10] text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-800" />
                      <div>
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-purple-400 font-mono">{m.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{m.joined}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};
