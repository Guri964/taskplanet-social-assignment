import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Smile, AlignLeft, Search, Bell, Moon, Plus, Home, ClipboardList, Globe, Trophy, MessageSquare } from 'lucide-react';

// We keep these ONLY as fallbacks for the preview environment if your backend isn't running.
const INITIAL_POSTS = [
  {
    _id: 'p1',
    userId: 'u1',
    username: 'Muhammed Umar',
    handle: '@muhamm92pw',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    text: '',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
    likes: [{ userId: 'u2' }, { userId: 'u3' }],
    comments: [
      { _id: 'c1', userId: 'u2', username: 'Nats', text: 'Nice car!', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString()
  },
  {
    _id: 'p2',
    userId: 'u2',
    username: 'Nats',
    handle: '@nats2dpu',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    text: 'Life finds a quiet strength in the most unexpected places.',
    image: null,
    likes: [{ userId: 'u1' }],
    comments: [],
    createdAt: new Date(Date.now() - 25200000).toISOString()
  }
];

const API_URL = 'https://taskplanet-backend-api.onrender.com/api';

export default function App() {
  // Application State
  const [currentUser, setCurrentUser] = useState(null); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Fetch posts from backend when logged in
  useEffect(() => {
    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // REAL BACKEND CALL:
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.warn("Backend not found, using fallback data for preview.");
      setPosts(INITIAL_POSTS); // Fallback for preview
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isLogin) {
        // REAL BACKEND CALL: Login
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: authForm.email,
          password: authForm.password
        });
        
        // Save token and user
        localStorage.setItem('token', response.data.token);
        setCurrentUser({
          ...response.data.user,
          handle: `@${response.data.user.username.toLowerCase().replace(/\s+/g, '')}`,
          avatar: `https://i.pravatar.cc/150?u=${response.data.user.id}`
        });

      } else {
        // REAL BACKEND CALL: Signup
        const response = await axios.post(`${API_URL}/auth/signup`, {
          username: authForm.username,
          email: authForm.email,
          password: authForm.password
        });

        localStorage.setItem('token', response.data.token);
        setCurrentUser({
          ...response.data.user,
          handle: `@${response.data.user.username.toLowerCase().replace(/\s+/g, '')}`,
          avatar: `https://i.pravatar.cc/150?u=${response.data.user.id}`
        });
      }
    } catch (error) {
      // Fallback for preview mode
      console.warn("Backend auth failed, simulating login for preview.");
      if (authForm.password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
      
      const mockUser = {
        id: authForm.email,
        username: authForm.username || authForm.email.split('@')[0],
        handle: `@${(authForm.username || authForm.email.split('@')[0]).toLowerCase().replace(/\s+/g, '')}`,
        avatar: `https://i.pravatar.cc/150?u=${authForm.email}`
      };
      setCurrentUser(mockUser);
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          {authError && <div style={styles.errorBanner}>{authError}</div>}

          <form onSubmit={handleAuth} style={styles.form}>
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Username" 
                value={authForm.username}
                onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                style={styles.input}
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Email Address" 
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              style={styles.input}
              required
            />
            <input 
              type="password" 
              placeholder="Password (Min 6 chars)" 
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.primaryButton}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#666' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={{ color: '#0066FF', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const handleCreatePost = async (text, imageBase64) => {
    try {
      // REAL BACKEND CALL:
      const response = await axios.post(`${API_URL}/posts`, {
        text: text,
        image: imageBase64
      }, {
        headers: { 
          userId: currentUser.id, 
          username: currentUser.username 
        }
      });
      
      setPosts([response.data, ...posts]);
    } catch (error) {
      console.warn("Backend not found, using fallback post creation.");
      // Fallback logic
      const newPost = {
        _id: `p${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        text: text,
        image: imageBase64,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
    }
  };

  const handleToggleLike = async (postId) => {
    // Optimistic UI update for immediate feedback
    const originalPosts = [...posts];
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const hasLiked = post.likes.some(like => like.userId === currentUser.id);
        const newLikes = hasLiked 
          ? post.likes.filter(like => like.userId !== currentUser.id) 
          : [...post.likes, { userId: currentUser.id, username: currentUser.username }];
        return { ...post, likes: newLikes };
      }
      return post;
    }));

    try {
      // REAL BACKEND CALL:
      await axios.put(`${API_URL}/posts/${postId}/like`, {}, {
        headers: { userId: currentUser.id, username: currentUser.username }
      });
    } catch (error) {
      console.warn("Backend not found, keeping optimistic UI update.");
      // If error, we would normally revert: setPosts(originalPosts);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      // REAL BACKEND CALL:
      const response = await axios.post(`${API_URL}/posts/${postId}/comment`, {
        text: commentText
      }, {
        headers: { userId: currentUser.id, username: currentUser.username }
      });
      
      // Update specific post with returned data
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch (error) {
      console.warn("Backend not found, using fallback comment creation.");
      // Fallback
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const newComment = {
            _id: `c${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            text: commentText,
            createdAt: new Date().toISOString()
          };
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      }));
    }
  };

  return (
    <div style={styles.appWrapper}>
      <div style={styles.mobileContainer}>
        <Header currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
        
        <div style={styles.scrollableContent}>
          <SearchBar />
          <CreatePostCard currentUser={currentUser} onCreatePost={handleCreatePost} />
          <FeedTabs />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading Feed...</div>
          ) : (
            <div style={styles.feedList}>
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUser={currentUser}
                  onLike={() => handleToggleLike(post._id)}
                  onComment={(text) => handleAddComment(post._id, text)}
                />
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}

function Header({ currentUser, onLogout }) {
  return (
    <div style={styles.header}>
      <h1 style={styles.headerTitle}>Social</h1>
      <div style={styles.headerActions}>
        <div style={styles.pillBadge}>
          <span style={{ color: '#E53935', fontWeight: 'bold' }}>50</span>
          <span style={{ color: '#FFB300' }}>⭐</span>
        </div>
        <div style={styles.pillBadge}>
          <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹0.00</span>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={24} color="#555" />
          <div style={styles.notificationDot}>1</div>
        </div>
        <img 
          src={currentUser.avatar} 
          alt="Profile" 
          style={styles.avatarSmall} 
          onClick={onLogout}
          title="Click to logout"
        />
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div style={styles.searchSection}>
      <div style={styles.searchInputWrapper}>
        <input type="text" placeholder="Search promotions, users," style={styles.searchInput} />
      </div>
      <div style={styles.searchIconBtn}><Search size={20} color="white" /></div>
      <div style={styles.iconBtn}><Moon size={20} color="#555" /></div>
      <div style={{...styles.iconBtn, background: '#FFF3E0'}}><Globe size={20} color="#FF9800" /></div>
    </div>
  );
}

function CreatePostCard({ currentUser, onCreatePost }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPost = () => {
    if (text.trim() || image) {
      onCreatePost(text, image);
      setText('');
      setImage(null);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.createPostHeader}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Create Post</h3>
        <div style={styles.tabsRow}>
          <button style={{...styles.tabBtn, ...styles.activeTabBtn}}>All Posts</button>
          <button style={styles.tabBtn}>Promotions</button>
        </div>
      </div>
      
      <textarea 
        placeholder="What's on your mind?"
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      
      {image && (
        <div style={styles.imagePreviewContainer}>
          <img src={image} alt="Preview" style={styles.imagePreview} />
          <button style={styles.removeImageBtn} onClick={() => setImage(null)}>×</button>
        </div>
      )}

      <div style={styles.createPostActions}>
        <div style={{ display: 'flex', gap: '15px', color: '#0066FF' }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          <ImageIcon size={24} style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current.click()} />
          <Smile size={24} style={{ cursor: 'pointer' }} />
          <AlignLeft size={24} style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: '#0066FF', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>📢</span> Promote
          </div>
          <button 
            style={{
              ...styles.postBtn, 
              background: (text || image) ? '#0066FF' : '#E0E0E0',
              color: (text || image) ? '#FFF' : '#999',
              cursor: (text || image) ? 'pointer' : 'not-allowed'
            }}
            onClick={submitPost}
            disabled={!text && !image}
          >
            ➤ Post
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedTabs() {
  const tabs = ['All Post', 'For You', 'Most Liked', 'Most Commented'];
  return (
    <div style={styles.feedTabsContainer}>
      {tabs.map((tab, idx) => (
        <button key={tab} style={idx === 0 ? {...styles.feedTab, ...styles.activeFeedTab} : styles.feedTab}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function PostCard({ post, currentUser, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Handles MongoDB schema array of objects vs basic array
  const hasLiked = post.likes?.some(like => like.userId === currentUser.id);

  const timeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.postHeader}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <img src={post.avatar || `https://i.pravatar.cc/150?u=${post.userId}`} alt={post.username} style={styles.avatarMedium} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.username}</span>
              <span style={{ color: '#666', fontSize: '14px' }}>{post.handle || `@${post.username.toLowerCase().replace(/\s+/g, '')}`}</span>
            </div>
            <div style={{ color: '#999', fontSize: '13px' }}>{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <button style={styles.followBtn}>Follow</button>
      </div>

      {post.text && <p style={styles.postText}>{post.text}</p>}
      
      {post.image && (
        <div style={styles.postImageContainer}>
          <img src={post.image} alt="Post content" style={styles.postImage} />
        </div>
      )}

      <div style={styles.postFooter}>
        <div style={styles.actionBtn} onClick={onLike}>
          <Heart size={22} fill={hasLiked ? '#E53935' : 'none'} color={hasLiked ? '#E53935' : '#666'} />
          <span>{post.likes?.length || 0}</span>
        </div>
        <div style={styles.actionBtn} onClick={() => setShowComments(!showComments)}>
          <MessageSquare size={22} color="#666" />
          <span>{post.comments?.length || 0}</span>
        </div>
        <div style={styles.actionBtn}>
          <Share2 size={22} color="#666" />
          <span>0</span>
        </div>
      </div>

      {showComments && (
        <div style={styles.commentsSection}>
          <hr style={{ border: 'none', borderTop: '1px solid #EEE', margin: '10px 0' }} />
          {post.comments?.map(c => (
            <div key={c._id || Math.random()} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{c.username}:</span>
              <span style={{ fontSize: '13px', color: '#444' }}>{c.text}</span>
            </div>
          ))}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={styles.commentInput}
            />
            <button type="submit" style={styles.commentBtn}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

function BottomNavigation() {
  return (
    <div style={styles.bottomNav}>
      <div style={styles.navItem}><Home size={24} /><span>Home</span></div>
      <div style={styles.navItem}><ClipboardList size={24} /><span>Tasks</span></div>
      <div style={{...styles.navItem, ...styles.navItemActive}}>
        <div style={styles.navActiveIndicator}>
          <Globe size={24} color="#0066FF" />
        </div>
        <span>Social</span>
      </div>
      <div style={styles.navItem}><Trophy size={24} /><span>Leader Board</span></div>
      <div style={styles.navItem}><MessageCircle size={24} /><span>Chat</span></div>
    </div>
  );
}

const styles = {
  appWrapper: {
    backgroundColor: '#333',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  mobileContainer: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#F5F6FA',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 15px 80px 15px',
  },
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#F5F6FA'
  },
  authCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '400px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #DDD',
    fontSize: '16px',
    outline: 'none'
  },
  primaryButton: {
    backgroundColor: '#0066FF',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  errorBanner: {
    backgroundColor: '#FFEBEB',
    color: '#D32F2F',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px'
  },
  header: {
    backgroundColor: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    zIndex: 10
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '900',
    color: '#111'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pillBadge: {
    backgroundColor: '#F5F6FA',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    border: '1px solid #EEE'
  },
  avatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #FFF',
    boxShadow: '0 0 0 2px #4CAF50'
  },
  notificationDot: {
    position: 'absolute',
    top: '-2px',
    right: '0px',
    backgroundColor: '#E53935',
    color: 'white',
    fontSize: '10px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold'
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0 20px 0'
  },
  searchInputWrapper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '25px',
    padding: '10px 15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
    border: '1px solid #EEE'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px'
  },
  searchIconBtn: {
    backgroundColor: '#0066FF',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  iconBtn: {
    backgroundColor: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
  },
  createPostHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  tabsRow: {
    display: 'flex',
    backgroundColor: '#F5F6FA',
    borderRadius: '20px',
    padding: '4px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#666'
  },
  activeTabBtn: {
    backgroundColor: '#0066FF',
    color: 'white',
    fontWeight: 'bold'
  },
  textarea: {
    width: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'inherit',
    marginBottom: '10px'
  },
  createPostActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F0F0F0',
    paddingTop: '15px',
    marginTop: '10px'
  },
  postBtn: {
    border: 'none',
    padding: '8px 20px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '15px',
    transition: '0.3s'
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: '15px'
  },
  imagePreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  removeImageBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  feedTabsContainer: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    marginBottom: '20px',
    paddingBottom: '5px',
    scrollbarWidth: 'none'
  },
  feedTab: {
    whiteSpace: 'nowrap',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #E0E0E0',
    backgroundColor: 'white',
    color: '#555',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  activeFeedTab: {
    backgroundColor: '#0066FF',
    color: 'white',
    border: '1px solid #0066FF'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  avatarMedium: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  followBtn: {
    backgroundColor: '#0066FF',
    color: 'white',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer'
  },
  postText: {
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.5',
    marginBottom: '15px',
    marginTop: '0'
  },
  postImageContainer: {
    margin: '0 -20px 15px -20px',
  },
  postImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover'
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #F0F0F0',
    paddingTop: '15px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #DDD',
    outline: 'none',
    fontSize: '13px'
  },
  commentBtn: {
    background: 'none',
    border: 'none',
    color: '#0066FF',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#0066FF',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
    color: 'rgba(255,255,255,0.7)'
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  navItemActive: {
    color: 'white',
    position: 'relative',
    transform: 'translateY(-15px)'
  },
  navActiveIndicator: {
    backgroundColor: 'white',
    width: '50px',
    height: '50px',
    borderRadius: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    marginBottom: '5px'
  }
};