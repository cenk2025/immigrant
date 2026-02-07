import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CommunityPost } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Plus, X, Search, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CommunityPage.css';

const categories = ['All', 'Work Culture', 'Visa Process', 'Daily Life', 'Education', 'Other'];

export const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Work Culture' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

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
                            <div key={post.id} className="post-card">
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
                                    {/* <button className="post-like-btn">
                                        <ThumbsUp size={16} />
                                        {post.likes}
                                    </button> */}
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
        </div>
    );
};
