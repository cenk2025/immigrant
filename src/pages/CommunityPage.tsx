import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CommunityPost, CommunityComment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Plus, X, Search, User, Calendar, Send, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CommunityPage.css';

const categories = ['All', 'Work Culture', 'Visa Process', 'Daily Life', 'Education', 'Other'];

export const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<(CommunityPost & { comment_count?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Work Culture' });
    const [submitting, setSubmitting] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [postComments, setPostComments] = useState<CommunityComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
        // Restore the user's liked posts from local storage on first render.
        const savedLikes = localStorage.getItem('liked_posts');
        return savedLikes ? new Set<string>(JSON.parse(savedLikes)) : new Set<string>();
    });

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        // We'll fetch just posts for now, and try to get counts if possible
        const { data, error } = await supabase
            .from('community_posts')
            .select('*, community_comments(count)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            // Fallback for when comments functionality isn't set up in backend yet
            const { data: fallbackData } = await supabase
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (fallbackData) setPosts(fallbackData);
        } else {
            // Transform data to flat comment_count structure
            const postsWithCounts = data?.map(post => ({
                ...post,
                comment_count: post.community_comments ? post.community_comments[0]?.count : 0
            })) || [];

            setPosts(postsWithCounts as (CommunityPost & { comment_count?: number })[]);
        }
        setLoading(false);
    }, []);

    const fetchComments = useCallback(async (postId: string) => {
        const { data, error } = await supabase
            .from('community_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setPostComments(data);
        }
    }, []);

    useEffect(() => {
        // Intentional initial data load on mount (toggles `loading`).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPosts();
    }, [fetchPosts]);

    // Load comments when a post is opened; clear them when the modal closes.
    useEffect(() => {
        if (selectedPost) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchComments(selectedPost.id);
        } else {
            setPostComments([]);
            setNewComment('');
        }
    }, [selectedPost, fetchComments]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        const { error } = await supabase.from('community_posts').insert([
            {
                user_id: user.id,
                title: newPost.title,
                content: newPost.content,
                category: newPost.category,
                author_name: user.user_metadata?.full_name || 'Anonymous User',
                likes: 0,
            },
        ]);

        if (error) {
            alert('Error creating post: ' + error.message);
        } else {
            setShowNewPostModal(false);
            setNewPost({ title: '', content: '', category: 'Work Culture' });
            fetchPosts();
        }
        setSubmitting(false);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedPost || !newComment.trim()) return;

        setCommentSubmitting(true);
        const { error } = await supabase.from('community_comments').insert([
            {
                post_id: selectedPost.id,
                user_id: user.id,
                content: newComment.trim(),
                author_name: user.user_metadata?.full_name || 'Anonymous User',
            }
        ]);

        if (error) {
            alert('Failed to post comment: ' + error.message);
        } else {
            setNewComment('');
            fetchComments(selectedPost.id);
            // Refresh post list to update counts
            fetchPosts();
        }
        setCommentSubmitting(false);
    };

    const handleLike = async (e: React.MouseEvent, post: CommunityPost) => {
        e.stopPropagation();
        if (likedPosts.has(post.id)) return; // Already liked

        // Optimistic UI update
        const newLikes = (post.likes || 0) + 1;

        // Update local state
        const newLikedPosts = new Set(likedPosts);
        newLikedPosts.add(post.id);
        const arrayLikes = Array.from(newLikedPosts);
        setLikedPosts(newLikedPosts);
        localStorage.setItem('liked_posts', JSON.stringify(arrayLikes));

        // Update post list state
        setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
        if (selectedPost && selectedPost.id === post.id) {
            setSelectedPost({ ...selectedPost, likes: newLikes });
        }

        // Update database
        const { error } = await supabase
            .from('community_posts')
            .update({ likes: newLikes })
            .eq('id', post.id);

        if (error) {
            console.error('Error updating likes:', error);
            // Revert state on error (optional but good practice)
        }
    };

    const filteredPosts = posts.filter((post) => {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="community-page">
            <div className="community-header">
                <div className="container">
                    <h1>Community Experiences</h1>
                    <p>Share your journey, ask questions, and connect with others working in Finland.</p>
                </div>
            </div>

            <div className="container community-content">
                <div className="community-actions">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {user && (
                        <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                            <Plus size={18} />
                            Share Experience
                        </button>
                    )}
                </div>

                <div className="category-filters">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">Loading discussions...</div>
                ) : filteredPosts.length > 0 ? (
                    <div className="posts-grid">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                                <div className="post-header">
                                    <div className="post-category">{post.category}</div>
                                    <div className="post-date">
                                        <Calendar size={14} />
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-excerpt">{post.content}</p>
                                <div className="post-footer">
                                    <div className="post-author">
                                        <User size={16} />
                                        <span>{post.author_name}</span>
                                    </div>
                                    <div className="post-stats">
                                        <button
                                            className={`post-stat-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                                            onClick={(e) => handleLike(e, post)}
                                        >
                                            <Heart size={16} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                                            <span>{post.likes || 0}</span>
                                        </button>
                                        <div className="post-stat-item">
                                            <MessageSquare size={16} />
                                            <span>{post.comment_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <MessageSquare size={48} />
                        <h3>No posts found</h3>
                        <p>Be the first to share your experience!</p>
                        {user ? (
                            <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                                Create Post
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-secondary">
                                Log in to post
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* New Post Modal */}
            {showNewPostModal && (
                <div className="modal-overlay" onClick={() => setShowNewPostModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Your Experience</h2>
                            <button onClick={() => setShowNewPostModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Topic Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder="e.g., My first week in Helsinki..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Your Story</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="Share your experience, tips, or questions..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewPostModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Posting...' : 'Post Story'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Post Modal */}
            {selectedPost && (
                <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="modal-content post-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="post-header-details">
                                <span className="post-category tag">{selectedPost.category}</span>
                                <span className="post-date-detail">
                                    <Calendar size={14} />
                                    {new Date(selectedPost.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <button onClick={() => setSelectedPost(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="post-scroll-area">
                            <h2 className="post-detail-title">{selectedPost.title}</h2>

                            <div className="post-detail-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
                                <div className="post-detail-author" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                                    <User size={16} />
                                    <span>{selectedPost.author_name}</span>
                                </div>
                                <button
                                    className={`post-stat-btn large ${likedPosts.has(selectedPost.id) ? 'liked' : ''}`}
                                    onClick={(e) => handleLike(e, selectedPost)}
                                >
                                    <Heart size={20} fill={likedPosts.has(selectedPost.id) ? "currentColor" : "none"} />
                                    <span>{selectedPost.likes || 0} Likes</span>
                                </button>
                            </div>

                            <div className="post-detail-content">
                                {selectedPost.content.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>

                            <div className="comments-section">
                                <h3>Comments ({postComments.length})</h3>

                                <div className="comments-list">
                                    {postComments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.author_name}</span>
                                                <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="comment-content">{comment.content}</p>
                                        </div>
                                    ))}
                                    {postComments.length === 0 && (
                                        <p className="no-comments">No comments yet. Be the first to reply!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="comment-input-area">
                            {user ? (
                                <form onSubmit={handlePostComment} className="comment-form">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a reply..."
                                        disabled={commentSubmitting}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!newComment.trim() || commentSubmitting}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            ) : (
                                <div className="login-to-comment">
                                    <Link to="/login">Log in to reply</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
