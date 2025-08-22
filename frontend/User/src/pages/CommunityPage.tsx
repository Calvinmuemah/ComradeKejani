

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Users, MessageCircle, ThumbsUp, Star, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store/useStore';
import type { ForumPost, ForumReply } from '../types';
import { HouseCard } from '../components/HouseCard';
import { HouseDetailsModal } from './HouseDetailsModal';

export const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'Housing Advice', 'Amenities', 'Safety', 'General'];
  const { aiRecommendations, houses } = useStore();
  const recommendations = aiRecommendations.map((rec, idx) => {
    const house = houses.find(h => h.id === rec.houseId);
    return {
      id: rec.houseId,
      title: house ? house.title : `Recommended House #${idx + 1}`,
      description: house ? `${house.location.estate} - KSh ${house.price.toLocaleString()}` : '',
      confidence: Math.round(rec.confidence * 100),
      reasons: rec.reasons,
    };
  });

  // Forum state
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showListingsPopup, setShowListingsPopup] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  // Review form state
  const [reviewData, setReviewData] = useState({ userName: '', rating: 5, comment: '' });
  const [reviewPosting, setReviewPosting] = useState(false);
  // Report form state
  const [reportData, setReportData] = useState({ description: '', type: 'Safety' });
  const [reportPosting, setReportPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: '', content: '', author: '' });
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyPopup, setShowReplyPopup] = useState(false);
  const [pendingReplyPostId, setPendingReplyPostId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [userId] = useState('user1'); // Replace with real user id from auth
  // Browse Listings modal state
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Reviews (sidebar)
  interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
  }
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // Fetch forum posts
  const fetchForumPosts = async () => {
    setForumLoading(true);
    setForumError('');
    try {
      const data = await apiService.getForumPosts();
      // Map _id to id for posts and replies
      setForumPosts(
        data.map((p: ForumPost & { _id: string; replies?: (ForumReply & { _id: string })[] }) => ({
          ...p,
          id: p._id,
          replies: (p.replies || []).map((r: ForumReply & { _id: string }) => ({ ...r, id: r._id })),
        }))
      );
    } catch {
      setForumError('Could not load forum posts');
    } finally {
      setForumLoading(false);
    }
  };

  useEffect(() => { fetchForumPosts(); }, []);

  // Fetch reviews (sidebar)
  useEffect(() => {
    const fetchRecentReviews = async () => {
      setReviewsLoading(true);
      setReviewsError('');
      try {
        const data = await apiService.getRecentReviews();
        setAllReviews(data);
      } catch {
        setReviewsError('Could not load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchRecentReviews();
  }, []);

  // Filtered posts by category
  const filteredPosts = selectedCategory === 'all'
    ? forumPosts
    : forumPosts.filter(post => post.category === selectedCategory);

  // Handle new post submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      await apiService.createForumPost(newPost);
      setShowPostModal(false);
      setNewPost({ title: '', category: '', content: '', author: '' });
      fetchForumPosts();
    } catch {
      // handle error
    } finally {
      setPosting(false);
    }
  };

  // Handle reply submit
  // Step 1: User writes reply, then clicks Reply
  const handleReplySubmit = (postId: string) => {
    if (!replyText.trim()) return;
    setPendingReplyPostId(postId);
    setShowReplyPopup(true);
  };

  // Step 2: User enters name in modal, then clicks Done
  const handleReplyAuthorSubmit = async () => {
    if (!replyAuthor.trim() || !pendingReplyPostId) return;
    // Optimistically update UI
    setForumPosts(prevPosts => prevPosts.map(post => {
      if (post.id === pendingReplyPostId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              id: `temp-${Date.now()}`,
              content: replyText,
              author: replyAuthor,
              timestamp: new Date(),
            } as ForumReply,
          ],
        };
      }
      return post;
    }));
    setReplyingTo(null);
    setReplyText('');
    setReplyAuthor('');
    setShowReplyPopup(false);
    setPendingReplyPostId(null);
    // Send to backend in background
    try {
      await apiService.replyToForumPost(pendingReplyPostId, { content: replyText, author: replyAuthor });
      // Optionally: fetchForumPosts(); // to sync with backend
    } catch {
      // Optionally: show error or remove optimistic reply
    }
  };

  // Handle like
  const handleLike = async (postId: string) => {
    // Only allow one like at a time
    if (likeLoading) return;
    setLikeLoading(postId);
    try {
      await apiService.likeForumPost(postId, userId);
      fetchForumPosts();
    } catch {
      // handle error
    }
    setLikeLoading(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow students, share experiences, and get advice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  AI Recommendations for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {rec.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="space-y-1">
                      {rec.reasons.map((reason, index) => (
                        <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {reason}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                      <Button size="sm" variant="ghost">
                        Not useful
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ...existing code... */}

            {/* Forum Posts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Student Forums
                  </CardTitle>
                  <Button onClick={() => setShowPostModal(true)} className="animate-fadeIn">New Post</Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Posts */}
                <div className="space-y-4 animate-fadeIn">
                  {forumLoading ? (
                    <p className="text-muted-foreground">Loading posts...</p>
                  ) : forumError ? (
                    <p className="text-destructive">{forumError}</p>
                  ) : filteredPosts.length === 0 ? (
                    <p className="text-muted-foreground">No posts yet.</p>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors animate-modalPop">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                                {post.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(post.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.replies.length} replies
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                <button
                                  className={`transition-all ${likeLoading === post.id ? 'opacity-50' : ''}`}
                                  onClick={() => handleLike(post.id)}
                                  disabled={likeLoading === post.id}
                                >
                                  {post.likes.length} like{post.likes.length !== 1 ? 's' : ''}
                                </button>
                              </span>
                            </div>
                            {/* Replies */}
                            <div className="mt-3 space-y-2">
                              {/* Replies as vertical tree */}
                              {post.replies.length > 0 && (
                                <div className="relative ml-6 mt-2">
                                  {/* Vertical line */}
                                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/30" style={{ zIndex: 0 }} />
                                  <div className="flex flex-col gap-4">
                                    {post.replies.map((reply) => (
                                      <div key={reply.id} className="relative flex items-start gap-2 animate-fadeIn">
                                        {/* Node */}
                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">
                                          {reply.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-primary animate-fadeInUp">{reply.author}</span>
                                          <span className="text-xs text-muted-foreground animate-fadeInUp">{new Date(reply.timestamp).toLocaleDateString()}</span>
                                          <span className="text-sm animate-fadeInUp">{reply.content}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                               {replyingTo === post.id ? (
                                 <div className="relative">
                                   <form className={`flex gap-2 mt-2 animate-fadeIn ${showReplyPopup && pendingReplyPostId === post.id ? 'blur-sm pointer-events-none select-none' : ''}`} onSubmit={e => { e.preventDefault(); handleReplySubmit(post.id); }}>
                                     <Input
                                       value={replyText}
                                       onChange={e => setReplyText(e.target.value)}
                                       placeholder="Write a reply..."
                                       className="flex-1"
                                       autoFocus
                                       disabled={posting}
                                     />
                                     {/* Hide buttons if popup is open */}
                                     {!(showReplyPopup && pendingReplyPostId === post.id) && (
                                       <>
                                         <Button type="submit" size="sm" disabled={!replyText.trim() || posting}>{posting ? 'Continue...' : 'Reply'}</Button>
                                         <Button type="button" size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }} disabled={posting}>Cancel</Button>
                                       </>
                                     )}
                                   </form>
                                   {/* Small popup for author name */}
                                   {showReplyPopup && pendingReplyPostId === post.id && (
                                     <form
                                       className="absolute left-0 top-12 z-50 bg-background border border-primary/30 rounded shadow p-3 w-56 animate-fadeIn flex flex-col gap-2"
                                       onSubmit={e => { e.preventDefault(); handleReplyAuthorSubmit(); }}
                                     >
                                       <span className="text-sm font-semibold text-center">Enter your name</span>
                                       <Input
                                         value={replyAuthor}
                                         onChange={e => setReplyAuthor(e.target.value)}
                                         placeholder="Your name"
                                         autoFocus
                                         disabled={posting}
                                         className="text-sm px-2 py-1"
                                       />
                                       <div className="flex gap-2 mt-1">
                                         <Button type="submit" size="sm" className="flex-1 text-sm py-1" disabled={!replyAuthor.trim() || posting}>
                                           {posting ? 'Sending...' : 'Done'}
                                         </Button>
                                         <Button type="button" size="sm" variant="ghost" className="flex-1 text-sm py-1" onClick={() => { setShowReplyPopup(false); setReplyAuthor(''); setPendingReplyPostId(null); }} disabled={posting}>Cancel</Button>
                                       </div>
                                     </form>
                                   )}
                                 </div>
                               ) : (
                                 <Button size="sm" variant="ghost" className="mt-1" onClick={() => { setReplyingTo(post.id); setReplyText(''); }}>Reply</Button>
                               )}
  {/* No modal, popup handled inline above */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
      {/* New Post Modal */}
                 {/* Inline New Post Form (replaces Modal) */}
                 {showPostModal && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                     <form onSubmit={handlePostSubmit} className="w-full max-w-lg mx-auto space-y-6 bg-background p-6 rounded-lg shadow animate-fadeIn border border-primary/20">
                       <h2 className="text-2xl font-bold text-center">Create New Post</h2>
                       <div>
                         <label className="block text-sm font-medium mb-1">Title</label>
                         <Input
                           value={newPost.title}
                           onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                           placeholder="Enter post title"
                           required
                           disabled={posting}
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Category</label>
                         <select
                           className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                           value={newPost.category}
                           onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                           required
                           disabled={posting}
                         >
                           <option value="" disabled>Select category</option>
                           {categories.filter(c => c !== 'all').map(c => (
                             <option key={c} value={c}>{c}</option>
                           ))}
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Content</label>
                         <textarea
                           className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                           value={newPost.content}
                           onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                           placeholder="Write your post..."
                           required
                           disabled={posting}
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Your Name</label>
                         <Input
                           value={newPost.author}
                           onChange={e => setNewPost({ ...newPost, author: e.target.value })}
                           placeholder="Enter your name"
                           required
                           disabled={posting}
                         />
                       </div>
                       <div className="flex gap-2">
                         <Button type="submit" className="flex-1" disabled={posting}>
                           {posting ? 'Posting...' : 'Post'}
                         </Button>
                         <Button type="button" className="flex-1" variant="ghost" onClick={() => setShowPostModal(false)} disabled={posting}>
                           Cancel
                         </Button>
                       </div>
                     </form>
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Posts This Week</span>
                  <span className="font-semibold">{forumPosts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Houses Reviewed</span>
                  <span className="font-semibold">{allReviews.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => setShowPostModal(true)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
                <Button className="w-full justify-start" onClick={() => setShowReviewPopup(true)}>
                  <Star className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
                <Button className="w-full justify-start" onClick={() => setShowReportPopup(true)}>
                  <ThumbsUp className="w-4 h-4 mr-2 rotate-180" />
                  Report an Issue
                </Button>
                <Button className="w-full justify-start" onClick={() => setShowListingsPopup(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Browse Listings
                </Button>
                <Button className="w-full justify-start" onClick={() => setShowSupportPopup(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
      {/* Write a Review Popup */}
      {showReviewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form onSubmit={async e => {
            e.preventDefault();
            setReviewPosting(true);
            try {
              await apiService.submitReview('general', reviewData); // 'general' or pick a houseId if needed
              setShowReviewPopup(false);
              setReviewData({ userName: '', rating: 5, comment: '' });
              fetchForumPosts();
            } finally {
              setReviewPosting(false);
            }
          }} className="w-full max-w-md mx-auto space-y-6 bg-background p-6 rounded-lg shadow animate-fadeIn border border-primary/20">
            <h2 className="text-xl font-bold text-center">Write a Review</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <Input value={reviewData.userName} onChange={e => setReviewData(d => ({ ...d, userName: e.target.value }))} placeholder="Enter your name" required disabled={reviewPosting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={reviewData.rating} onChange={e => setReviewData(d => ({ ...d, rating: Number(e.target.value) }))} required disabled={reviewPosting}>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={reviewData.comment} onChange={e => setReviewData(d => ({ ...d, comment: e.target.value }))} placeholder="Write your review..." required disabled={reviewPosting} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={reviewPosting}>{reviewPosting ? 'Posting...' : 'Post Review'}</Button>
              <Button type="button" className="flex-1" variant="ghost" onClick={() => setShowReviewPopup(false)} disabled={reviewPosting}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Report an Issue Popup */}
      {showReportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            onSubmit={async e => {
              e.preventDefault();
              setReportPosting(true);
              try {
                const payload = { description: reportData.description, type: reportData.type };
                console.log('Submitting report issue:', payload);
                await apiService.submitReportIssue(payload);
                setShowReportPopup(false);
                setReportData({ description: '', type: 'Safety' });
              } finally {
                setReportPosting(false);
              }
            }}
            className="w-full max-w-md mx-auto space-y-6 bg-background p-6 rounded-lg shadow animate-fadeIn border border-primary/20"
          >
            <h2 className="text-xl font-bold text-center">Report an Issue</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Type of Issue</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={reportData.type}
                onChange={e => setReportData(d => ({ ...d, type: e.target.value }))}
                required
                disabled={reportPosting}
              >
                <option value="Safety">Safety</option>
                <option value="Complaint">Complaint</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={reportData.description}
                onChange={e => setReportData(d => ({ ...d, description: e.target.value }))}
                placeholder="Describe the issue..."
                required
                disabled={reportPosting}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={reportPosting}>
                {reportPosting ? 'Sending...' : 'Send Report'}
              </Button>
              <Button type="button" className="flex-1" variant="ghost" onClick={() => setShowReportPopup(false)} disabled={reportPosting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Browse Listings Popup (show all houses) */}
      {showListingsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-background p-6 rounded-lg shadow border border-primary/20 max-w-4xl w-full animate-fadeIn flex flex-col items-center relative">
            <h2 className="text-lg font-bold mb-4">Browse Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-h-[70vh] overflow-y-auto mb-4">
              {houses.length === 0 ? (
                <p className="col-span-full text-muted-foreground">No houses available.</p>
              ) : (
                houses.map(house => (
                  <HouseCard
                    key={house.id}
                    house={house}
                    showCompareButton={false}
                    onClick={() => setSelectedHouse(house)}
                  />
                ))
              )}
            </div>
            <Button onClick={() => setShowListingsPopup(false)} className="mt-2">Close</Button>
            {/* House Details Modal */}
            <HouseDetailsModal
              house={selectedHouse}
              isOpen={!!selectedHouse}
              onClose={() => setSelectedHouse(null)}
            />
          </div>
        </div>
      )}

      {/* Contact Support Popup */}
      {showSupportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn">
          <div className="bg-background p-8 rounded-2xl shadow-2xl border border-primary/20 max-w-3xl w-full animate-slideUp flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2 text-primary drop-shadow animate-fadeInUp">Contact & Emergency Support</h2>
            <div className="w-full text-left space-y-6 z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MMUST Emergency Services */}
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary animate-fadeInUp flex flex-col gap-3">
                <h3 className="font-semibold text-primary mb-1 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block animate-pulse" />MMUST Emergency Services</h3>
                <div className="relative flex flex-col gap-3 ml-2">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/30 z-0" />
                  {/* Node style for each contact */}
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">S</div>
                    <div>
                      <span className="font-semibold text-primary">School Security:</span> <a href="tel:+254700111222" className="text-blue-600 underline hover:text-blue-800 transition">+254 700 111 222</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">E</div>
                    <div>
                      <span className="font-semibold text-primary">Emergency Desk:</span> <a href="tel:+254733444555" className="text-blue-600 underline hover:text-blue-800 transition">+254 733 444 555</a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Campus Security */}
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary animate-fadeInUp flex flex-col gap-3">
                <h3 className="font-semibold text-primary mb-1 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block animate-pulse" />Campus Security</h3>
                <div className="relative flex flex-col gap-3 ml-2">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/30 z-0" />
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">S</div>
                    <div>
                      <span className="font-semibold text-primary">Security Office:</span> <a href="tel:+254700123456" className="text-blue-600 underline hover:text-blue-800 transition">+254 700 123 456</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">E</div>
                    <div>
                      <span className="font-semibold text-primary">Emergency Desk:</span> <a href="tel:+254711223344" className="text-blue-600 underline hover:text-blue-800 transition">+254 711 223 344</a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Comrade Kejani Support */}
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-blue-400 animate-fadeInUp delay-100 flex flex-col gap-3">
                <h3 className="font-semibold text-blue-700 mb-1 flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block animate-pulse" />Comrade Kejani Support</h3>
                <div className="relative flex flex-col gap-3 ml-2">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-blue-400/30 z-0" />
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">E</div>
                    <div>
                      <span className="font-semibold text-blue-700">Email:</span> <a href="mailto:comrade@kejani.com" className="text-blue-600 underline hover:text-blue-800 transition">comrade@kejani.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">I</div>
                    <div>
                      <span className="font-semibold text-pink-600">Instagram:</span> <a href="https://instagram.com/comradekejani" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline hover:text-pink-800 transition">@comradekejani</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">T</div>
                    <div>
                      <span className="font-semibold text-blue-500">Twitter/X:</span> <a href="https://twitter.com/comradekejani" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700 transition">@comradekejani</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">F</div>
                    <div>
                      <span className="font-semibold text-blue-800">Facebook:</span> <a href="https://facebook.com/comradekejani" target="_blank" rel="noopener noreferrer" className="text-blue-800 underline hover:text-blue-900 transition">Comrade Kejani</a>
                    </div>
                  </div>
                </div>
              </div>
              {/* National Emergency Contacts */}
              <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-yellow-400 animate-fadeInUp delay-200 flex flex-col gap-3">
                <h3 className="font-semibold text-yellow-700 mb-1 flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full inline-block animate-pulse" />National Emergency Contacts</h3>
                <div className="relative flex flex-col gap-3 ml-2">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-yellow-400/30 z-0" />
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">P</div>
                    <div>
                      <span className="font-semibold text-blue-600">Police:</span> <a href="tel:999" className="text-blue-600 underline hover:text-blue-800 transition">999</a> / <a href="tel:112" className="text-blue-600 underline hover:text-blue-800 transition">112</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">F</div>
                    <div>
                      <span className="font-semibold text-red-600">Fire Brigade:</span> <a href="tel:911" className="text-red-600 underline hover:text-red-800 transition">911</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">A</div>
                    <div>
                      <span className="font-semibold text-green-600">Ambulance:</span> <a href="tel:0700395395" className="text-green-600 underline hover:text-green-800 transition">0700 395 395</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-background z-10 animate-bounceIn">G</div>
                    <div>
                      <span className="font-semibold text-purple-600">GBV Helpline:</span> <a href="tel:1195" className="text-purple-600 underline hover:text-purple-800 transition">1195</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowSupportPopup(false)} className="mt-2 z-10 animate-fadeInUp delay-300">Close</Button>
          </div>
        </div>
      )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviewsLoading ? (
                  <p className="text-muted-foreground">Loading reviews...</p>
                ) : reviewsError ? (
                  <p className="text-destructive">{reviewsError}</p>
                ) : allReviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews yet.</p>
                ) : (
                  allReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
                          {review.userName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium">{review.userName}</span>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};