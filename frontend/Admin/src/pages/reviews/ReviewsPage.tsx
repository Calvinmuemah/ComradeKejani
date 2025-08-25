import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ReviewStatus, ReviewSource } from '../../types';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/useAuth';
import { API_ENDPOINTS } from '../../lib/api';
import useToast from '../../components/ui/useToast';
import ToastContainer from '../../components/ui/ToastContainer';

// Define a type for our review as it appears in the UI
interface Review {
  id: string;
  listingId: string;
  listingTitle: string;
  rating: number;
  text: string;
  tags?: string[];
  source: ReviewSource;
  deviceId: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

// Define the shape of the review data from the API
interface ApiReviewHouseId {
  _id?: string;
  title?: string;
}

interface ApiReview {
  _id?: string;
  id?: string;
  houseId?: ApiReviewHouseId | string;
  listingId?: string;
  listingTitle?: string;
  rating: number;
  comment?: string;
  text?: string;
  tags?: string[];
  source?: string;
  deviceId?: string;
  status?: string;
  createdAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

const ReviewsPage: React.FC = () => {
  const { isLoading: authLoading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [editReviewData, setEditReviewData] = useState<{
    status: ReviewStatus;
    originalStatus: ReviewStatus;
  } | null>(null);
  const loadingTimeoutRef = React.useRef<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    reviewId: '',
    action: '' as 'approve' | 'reject'
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loading complete, fetching reviews');
      fetchReviews();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch reviews...');
      
      // Set a timeout to ensure we don't get stuck in loading state
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Loading timeout reached, forcing loading state to false');
        setLoading(false);
      }, 10000); // 10 second timeout as fallback
      
      // Get auth token from session storage
      const token = sessionStorage.getItem('authToken');
      
      // Use the authenticated endpoint with proper Authorization header
      const response = await fetch(API_ENDPOINTS.reviews, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If unauthorized, try the public endpoint as fallback
        if (response.status === 401) {
          console.warn('Unauthorized access to admin reviews endpoint, falling back to public endpoint');
          return fetchPublicReviews();
        }
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }
      
      // Log the response for debugging
      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      let apiReviews: ApiReview[];
      try {
        apiReviews = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        addToast('Invalid JSON response from server', 'error');
        throw new Error('Invalid JSON response from server');
      }
      
      // Transform the data to match our Review interface
      const formattedReviews: Review[] = apiReviews.map(apiReview => {
        // Check if we already have listingId and listingTitle directly in the API response
        let listingId = apiReview.listingId || '';
        let listingTitle = apiReview.listingTitle || 'Unknown Property';
        
        // Fallback to the old format if the direct properties don't exist
        if (!listingId && !listingTitle && apiReview.houseId) {
          if (typeof apiReview.houseId === 'object' && apiReview.houseId !== null) {
            const houseIdObj = apiReview.houseId as ApiReviewHouseId;
            listingId = houseIdObj._id || '';
            listingTitle = houseIdObj.title || 'Unknown Property';
          } else if (typeof apiReview.houseId === 'string') {
            listingId = apiReview.houseId;
          }
        }
        
        // Map status string to ReviewStatus enum
        let reviewStatus: ReviewStatus;
        if (apiReview.status === 'pending' || apiReview.status === 'PENDING') {
          reviewStatus = ReviewStatus.PENDING;
        } else if (apiReview.status === 'approved' || apiReview.status === 'APPROVED') {
          reviewStatus = ReviewStatus.APPROVED;
        } else if (apiReview.status === 'rejected' || apiReview.status === 'REJECTED') {
          reviewStatus = ReviewStatus.REJECTED;
        } else {
          // Default to pending if status is undefined or unknown
          reviewStatus = ReviewStatus.PENDING;
        }
        
        console.log(`Review ${apiReview.id || apiReview._id}: Raw status = ${apiReview.status}, Mapped to = ${reviewStatus}`);
        
        return {
          id: apiReview.id || apiReview._id || '',
          listingId,
          listingTitle,
          rating: apiReview.rating,
          text: apiReview.text || apiReview.comment || '',
          tags: apiReview.tags || [],
          source: (apiReview.source as ReviewSource) || ReviewSource.WEB_FORM,
          deviceId: apiReview.deviceId || `device_${Math.random().toString(36).substring(2, 8)}`,
          status: reviewStatus,
          createdAt: apiReview.createdAt,
          moderatedBy: apiReview.moderatedBy,
          moderatedAt: apiReview.moderatedAt
        };
      });
      
      processReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addToast(`Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Set empty reviews but don't crash the UI
      setReviews([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0
      });
    } finally {
      // Clear any loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      console.log('Fetch completed, setting loading state to false');
      setLoading(false);
    }
  };
  
  // Fallback to public endpoint if auth fails
  const fetchPublicReviews = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.reviewsRecent);
      if (!response.ok) {
        throw new Error(`Failed to fetch public reviews: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Public API Response:', responseText);
      
      let apiReviews: ApiReview[];
      try {
        apiReviews = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      // Transform the data to match our Review interface
      const formattedReviews: Review[] = apiReviews.map(apiReview => {
        // Check if we already have listingId and listingTitle directly in the API response
        let listingId = apiReview.listingId || '';
        let listingTitle = apiReview.listingTitle || 'Unknown Property';
        
        // Fallback to the old format if the direct properties don't exist
        if (!listingId && !listingTitle && apiReview.houseId) {
          if (typeof apiReview.houseId === 'object' && apiReview.houseId !== null) {
            const houseIdObj = apiReview.houseId as ApiReviewHouseId;
            listingId = houseIdObj._id || '';
            listingTitle = houseIdObj.title || 'Unknown Property';
          } else if (typeof apiReview.houseId === 'string') {
            listingId = apiReview.houseId;
          }
        }
        
        // Map status string to ReviewStatus enum
        let reviewStatus: ReviewStatus;
        if (apiReview.status === 'pending' || apiReview.status === 'PENDING') {
          reviewStatus = ReviewStatus.PENDING;
        } else if (apiReview.status === 'approved' || apiReview.status === 'APPROVED') {
          reviewStatus = ReviewStatus.APPROVED;
        } else if (apiReview.status === 'rejected' || apiReview.status === 'REJECTED') {
          reviewStatus = ReviewStatus.REJECTED;
        } else {
          // Default to pending if status is undefined or unknown
          reviewStatus = ReviewStatus.PENDING;
        }
        
        console.log(`Public Review ${apiReview.id || apiReview._id}: Raw status = ${apiReview.status}, Normalized = ${status}`);
        
        return {
          id: apiReview.id || apiReview._id || '',
          listingId,
          listingTitle,
          rating: apiReview.rating,
          text: apiReview.text || apiReview.comment || '',
          tags: apiReview.tags || [],
          source: (apiReview.source as ReviewSource) || ReviewSource.WEB_FORM,
          deviceId: apiReview.deviceId || `device_${Math.random().toString(36).substring(2, 8)}`,
          status: reviewStatus,
          createdAt: apiReview.createdAt,
          moderatedBy: apiReview.moderatedBy,
          moderatedAt: apiReview.moderatedAt
        };
      });
      
      processReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching public reviews:', error);
      setReviews([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Process and set the reviews data
  const processReviews = (formattedReviews: Review[]) => {
    console.log(`Processing ${formattedReviews.length} reviews...`);
    
    // Performance optimization - batch the state update
    setTimeout(() => {
      setReviews(formattedReviews);
      console.log("Reviews state updated");
    }, 0);
    
    // Only log a limited number for performance
    console.log("Sample reviews:", formattedReviews.slice(0, 3).map(r => ({ id: r.id, status: r.status })));
    
    // Calculate stats - compare with enum values
    const pending = formattedReviews.filter((r) => r.status === ReviewStatus.PENDING).length;
    const approved = formattedReviews.filter((r) => r.status === ReviewStatus.APPROVED).length;
    const rejected = formattedReviews.filter((r) => r.status === ReviewStatus.REJECTED).length;
    const avgRating = approved > 0 
      ? (formattedReviews.filter((r) => r.status === ReviewStatus.APPROVED)
          .reduce((acc: number, r) => acc + r.rating, 0) / approved).toFixed(1)
      : '0.0';
    
    console.log(`Stats - Pending: ${pending}, Approved: ${approved}, Rejected: ${rejected}, Avg: ${avgRating}`);
    
    setStats({
      pending,
      approved,
      rejected,
      averageRating: Number(avgRating)
    });
  };

  const getStatusBadge = (status: ReviewStatus) => {
    // Map the enum status to variant and icon
    let variant: "default" | "destructive" | "outline" | "secondary" | "warning" | "success" = "default";
    let icon, label;
    
    if (status === ReviewStatus.PENDING) {
      variant = 'warning';
      icon = <Clock className="h-3 w-3 mr-1" />;
      label = 'Pending';
    } else if (status === ReviewStatus.APPROVED) {
      variant = 'success';
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      label = 'Approved';
    } else if (status === ReviewStatus.REJECTED) {
      variant = 'destructive';
      icon = <XCircle className="h-3 w-3 mr-1" />;
      label = 'Rejected';
    } else {
      variant = 'default';
      icon = <Clock className="h-3 w-3 mr-1" />;
      label = String(status) || 'Unknown';
    }

    return (
      <Badge variant={variant}>
        {icon}
        {label}
      </Badge>
    );
  };

  const getSourceBadge = (source: ReviewSource) => {
    const labels = {
      [ReviewSource.WEB_FORM]: 'Web Form',
      [ReviewSource.SURVEY]: 'Survey',
      [ReviewSource.PARTNER]: 'Partner'
    };

    return <Badge variant="outline">{labels[source]}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">({rating})</span>
      </div>
    );
  };

  // Use useMemo to only recalculate filtered reviews when dependencies change
  const filteredReviews = React.useMemo(() => {
    // Early return for empty reviews to improve performance
    if (reviews.length === 0) return [];
    
    return reviews.filter(review => {
      const matchesSearch = !searchTerm || 
                           review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (review.tags && review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesStatus = statusFilter === 'all' || 
                        (statusFilter === 'pending' && review.status === ReviewStatus.PENDING) ||
                        (statusFilter === 'approved' && review.status === ReviewStatus.APPROVED) ||
                        (statusFilter === 'rejected' && review.status === ReviewStatus.REJECTED);
      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
    // Open confirmation dialog instead of immediately performing the action
    setConfirmDialog({
      open: true,
      title: `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`,
      message: `Are you sure you want to ${action} this review?`,
      reviewId,
      action,
    });
  };
  
  const confirmReviewAction = async () => {
    try {
      const { reviewId, action } = confirmDialog;
      if (!reviewId || !action) return;
      
      setActionLoading(reviewId);
      
      // Close dialog
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      // Get auth token from session storage
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        addToast('Authentication token is missing. Please log in again.', 'error');
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      // Use the authenticated endpoint for approving/rejecting reviews
      const response = await fetch(`${API_ENDPOINTS.reviews}/${reviewId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If unauthorized, fall back to simulating the action on the client side
        if (response.status === 401) {
          console.warn(`Unauthorized access to ${action} review endpoint, simulating action`);
          simulateReviewAction(reviewId, action);
          addToast(`Review ${action === 'approve' ? 'approved' : 'rejected'} (client-side only)`, 'info');
          return;
        }
        throw new Error(`Failed to ${action} review: ${response.status} ${response.statusText}`);
      }
      
      // Refresh reviews after update
      fetchReviews();
      
      // Show success notification
      addToast(`Review successfully ${action === 'approve' ? 'approved' : 'rejected'}`, 'success');
      
    } catch (error) {
      console.error(`Error processing review action:`, error);
      // Provide user feedback about the error
      addToast(`Failed to process review: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handler for opening the edit modal
  const handleEditReview = (review: Review) => {
    setEditReviewId(review.id);
    setEditReviewData({
      status: review.status,
      originalStatus: review.status
    });
    setShowEditModal(true);
  };
  
  // Handler for updating a review
  const handleUpdateReview = async () => {
    if (!editReviewId || !editReviewData) return;
    
    // If status hasn't changed, just close the modal
    if (editReviewData.status === editReviewData.originalStatus) {
      setShowEditModal(false);
      setEditReviewId(null);
      setEditReviewData(null);
      return;
    }
    
    setActionLoading(editReviewId);
    
    try {
      // Get auth token from session storage
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        addToast('Authentication token is missing. Please log in again.', 'error');
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      // Determine action based on new status
      let action: string;
      let endpoint: string;
      
      if (editReviewData.status === ReviewStatus.APPROVED) {
        action = 'approve';
        endpoint = `${API_ENDPOINTS.reviews}/${editReviewId}/${action}`;
      } else if (editReviewData.status === ReviewStatus.REJECTED) {
        action = 'reject';
        endpoint = `${API_ENDPOINTS.reviews}/${editReviewId}/${action}`;
      } else {
        // For pending status, use the generic update endpoint
        action = 'update';
        endpoint = `${API_ENDPOINTS.reviews}/review/${editReviewId}`;
      }
      
      // Use the appropriate endpoint for updating review status
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: editReviewData.status === ReviewStatus.PENDING 
          ? JSON.stringify({ status: 'PENDING' }) 
          : undefined
      });
      
      if (!response.ok) {
        // If unauthorized, fall back to simulating the action on the client side
        if (response.status === 401) {
          console.warn(`Unauthorized access to update review endpoint, simulating action`);
          // Update the review locally
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === editReviewId 
                ? { 
                    ...review, 
                    status: editReviewData.status,
                    moderatedBy: 'Admin User',
                    moderatedAt: new Date().toISOString()
                  } 
                : review
            )
          );
          addToast(`Review status updated to ${editReviewData.status} (client-side only)`, 'info');
          setShowEditModal(false);
          setEditReviewId(null);
          setEditReviewData(null);
          return;
        }
        throw new Error(`Failed to update review: ${response.status} ${response.statusText}`);
      }
      
      // Refresh reviews after update
      fetchReviews();
      
      // Show success notification
      addToast(`Review status successfully updated to ${editReviewData.status}`, 'success');
      
    } catch (error) {
      console.error(`Error updating review:`, error);
      // Provide user feedback about the error
      addToast(`Failed to update review: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    } finally {
      setActionLoading(null);
      setShowEditModal(false);
      setEditReviewId(null);
      setEditReviewData(null);
    }
  };
  
  // Fallback function to simulate approve/reject on client side
  const simulateReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    // Update the reviews state locally to reflect the change
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              status: action === 'approve' ? ReviewStatus.APPROVED : ReviewStatus.REJECTED,
              moderatedBy: 'Admin User',
              moderatedAt: new Date().toISOString()
            } 
          : review
      )
    );
    
    // Recalculate stats
    setStats(prevStats => {
      const reviewToUpdate = reviews.find(r => r.id === reviewId);
      if (!reviewToUpdate) return prevStats;
      
      const newStats = { ...prevStats };
      
      // Decrement pending count
      if (reviewToUpdate.status === ReviewStatus.PENDING) {
        newStats.pending = Math.max(0, newStats.pending - 1);
      }
      
      // Increment approved or rejected count
      if (action === 'approve') {
        newStats.approved += 1;
        
        // Recalculate average rating
        const approvedReviews = reviews.filter(r => 
          r.id === reviewId ? true : r.status === ReviewStatus.APPROVED
        );
        const totalRating = approvedReviews.reduce((acc, r) => 
          acc + (r.id === reviewId ? r.rating : 0), 0);
        newStats.averageRating = Number((totalRating / approvedReviews.length).toFixed(1));
      } else {
        newStats.rejected += 1;
      }
      
      return newStats;
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reviews & Feedback</h1>
          <p className="text-gray-400">Moderate and manage student reviews and feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-white">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-white">
                  {stats.approved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-white">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">
                  {stats.averageRating}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-oxford-900 border border-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Review Management</CardTitle>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-600/70 via-indigo-600/40 to-indigo-600/10"></div>
            
            {/* Reviews list */}
            <div className="space-y-8">
              {loading ? (
                <div className="relative pl-16 py-10">
                  <div className="absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center bg-oxford-800 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/20 border-t-blue-500"></div>
                  </div>
                  <div className="relative bg-oxford-900 bg-opacity-50 p-8 text-center">
                    {/* Curved corner borders */}
                    {/* Top left */}
                    <div className="absolute top-0 left-0 w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 31C1 14.4315 14.4315 1 31 1" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    {/* Top right */}
                    <div className="absolute top-0 right-0 w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31 31C14.4315 31 1 17.5685 1 1" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    {/* Bottom left */}
                    <div className="absolute bottom-0 left-0 w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1C17.5685 1 31 14.4315 31 31" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    {/* Bottom right */}
                    <div className="absolute bottom-0 right-0 w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31 1C31 17.5685 17.5685 31 1 31" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    <div className="text-blue-400 font-medium">Loading reviews...</div>
                  </div>
                </div>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div key={review.id} className="relative pl-16">
                    {/* Timeline node */}
                    <div 
                      className={`absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center
                      ${review.status === ReviewStatus.PENDING 
                        ? "bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30" 
                        : review.status === ReviewStatus.APPROVED
                          ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-500/30"
                          : "bg-gradient-to-br from-rose-500/20 to-rose-600/30 border border-rose-500/30"
                      }
                      shadow-lg`}
                    >
                      {review.status === ReviewStatus.PENDING ? (
                        <Clock className="h-6 w-6 text-amber-400" />
                      ) : review.status === ReviewStatus.APPROVED ? (
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-rose-400" />
                      )}
                    </div>
                    
                    {/* Review content card with corner-only borders */}
                    <div className="relative bg-oxford-900 bg-opacity-50 backdrop-blur-sm p-6 hover:bg-opacity-70 transition-all">
                      {/* Curved corner borders */}
                      {/* Top left */}
                      <div className="absolute top-0 left-0 w-8 h-8">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 31C1 14.4315 14.4315 1 31 1" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      
                      {/* Top right */}
                      <div className="absolute top-0 right-0 w-8 h-8">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M31 31C14.4315 31 1 17.5685 1 1" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      
                      {/* Bottom left */}
                      <div className="absolute bottom-0 left-0 w-8 h-8">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1C17.5685 1 31 14.4315 31 31" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      
                      {/* Bottom right */}
                      <div className="absolute bottom-0 right-0 w-8 h-8">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M31 1C31 17.5685 17.5685 31 1 31" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header with rating and badges */}
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <div>{getRatingStars(review.rating)}</div>
                            {getStatusBadge(review.status)}
                            {getSourceBadge(review.source)}
                            <span className="text-sm text-gray-400">{formatDate(review.createdAt)}</span>
                          </div>
                          
                          {/* Title and content */}
                          <h3 className="text-lg font-semibold text-white mb-2">{review.listingTitle}</h3>
                          <p className="text-gray-300 mb-4 line-clamp-3 hover:line-clamp-none transition-all">{review.text}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {review.tags && review.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Details grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <div>
                              <p>Device ID</p>
                              <p className="text-white">{review.deviceId}</p>
                            </div>
                            <div>
                              <p>Submitted</p>
                              <p className="text-white">{formatDate(review.createdAt)}</p>
                            </div>
                            {review.moderatedBy && (
                              <>
                                <div>
                                  <p>Moderated By</p>
                                  <p className="text-white">{review.moderatedBy}</p>
                                </div>
                                <div>
                                  <p>Moderated At</p>
                                  <p className="text-white">{formatDate(review.moderatedAt!)}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions column */}
                        <div className="flex-shrink-0 flex flex-col items-end space-y-3">
                          {review.status === ReviewStatus.PENDING ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReviewAction(review.id, 'approve')}
                                className="bg-green-500 text-white border border-green-600 hover:bg-green-600 w-full"
                                disabled={actionLoading === review.id}
                              >
                                {actionLoading === review.id ? (
                                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                                ) : (
                                  <span className="flex items-center justify-center"><CheckCircle className="h-4 w-4 mr-1" /> Approve</span>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReviewAction(review.id, 'reject')}
                                className="bg-red-500 text-white border border-red-600 hover:bg-red-600 w-full"
                                disabled={actionLoading === review.id}
                              >
                                {actionLoading === review.id ? (
                                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                                ) : (
                                  <span className="flex items-center justify-center"><XCircle className="h-4 w-4 mr-1" /> Reject</span>
                                )}
                              </Button>
                            </>
                          ) : (
                            <div className="flex flex-col items-end space-y-2">
                              <Badge 
                                className={
                                  review.status === ReviewStatus.APPROVED 
                                    ? "bg-green-500/20 text-green-400 border-green-600" 
                                    : "bg-red-500/20 text-red-400 border-red-600"
                                }
                              >
                                {review.status === ReviewStatus.APPROVED ? 'Approved' : 'Rejected'}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditReview(review)}
                                className="bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                                disabled={actionLoading === review.id}
                              >
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  Edit
                                </span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative pl-16 py-10">
                  <div className="absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center bg-oxford-800 border border-gray-700">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="relative bg-oxford-900 bg-opacity-50 p-6 text-center">
                    {/* Corner borders - top left */}
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Corner borders - top right */}
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Corner borders - bottom left */}
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Corner borders - bottom right */}
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    <p className="text-gray-400">No reviews found matching your filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.action === 'approve' ? "Approve Review" : "Reject Review"}
        tone={confirmDialog.action === 'approve' ? "default" : "danger"}
        className="border border-gray-800 max-w-lg w-full"
      >
        <div className="space-y-6">
          <div className="relative pl-5" data-section="action">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className={`absolute left-[-6px] top-0 w-5 h-5 rounded-full ${
              confirmDialog.action === 'approve'
                ? "bg-gradient-to-br from-emerald-600 to-green-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]"
                : "bg-gradient-to-br from-rose-600 to-red-600 border border-rose-400/30 shadow-[0_0_0_2px_rgba(225,29,72,0.35)]"
            }`} />
            
            <div className="pl-2">
              <p className="text-gray-300 mb-2">{confirmDialog.message}</p>
              <div className={`${
                confirmDialog.action === 'approve'
                  ? "bg-emerald-950/20 text-emerald-200 border border-emerald-900/50"
                  : "bg-rose-950/20 text-rose-200 border border-rose-900/50"
              } p-4 rounded-md text-sm`}>
                <p className="flex items-center gap-2">
                  {confirmDialog.action === 'approve' 
                    ? <CheckCircle size={16} className="text-emerald-400" /> 
                    : <XCircle size={16} className="text-rose-400" />
                  } 
                  {confirmDialog.action === 'approve'
                    ? "This review will be publicly visible to all users."
                    : "This review will be hidden from public view."
                  }
                </p>
                <p className="mt-1 text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              variant="secondary"
              disabled={actionLoading === confirmDialog.reviewId}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReviewAction}
              disabled={actionLoading === confirmDialog.reviewId}
              className={confirmDialog.action === 'approve'
                ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white shadow-md shadow-emerald-600/20"
                : "bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-md shadow-rose-600/20"
              }
            >
              {actionLoading === confirmDialog.reviewId ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                  Processing...
                </div>
              ) : (
                confirmDialog.action === 'approve' ? 'Approve Review' : 'Reject Review'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditReviewId(null);
          setEditReviewData(null);
        }}
        title="Edit Review Status"
        tone="default"
        className="border border-gray-800 max-w-lg w-full"
      >
        <div className="space-y-6">
          <div className="relative pl-5" data-section="edit-status">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            
            <div className="pl-2">
              <p className="text-gray-300 mb-2">Select the new status for this review</p>
              <div className="bg-blue-950/20 text-blue-200 border border-blue-900/50 p-4 rounded-md text-sm">
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Changing a review's status will update its visibility to users.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="status-pending"
                      name="review-status"
                      value={ReviewStatus.PENDING}
                      checked={editReviewData?.status === ReviewStatus.PENDING}
                      onChange={() => setEditReviewData(prev => prev ? {...prev, status: ReviewStatus.PENDING} : null)}
                      className="mr-2"
                    />
                    <label htmlFor="status-pending" className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>Pending (awaiting moderation)</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="status-approved"
                      name="review-status"
                      value={ReviewStatus.APPROVED}
                      checked={editReviewData?.status === ReviewStatus.APPROVED}
                      onChange={() => setEditReviewData(prev => prev ? {...prev, status: ReviewStatus.APPROVED} : null)}
                      className="mr-2"
                    />
                    <label htmlFor="status-approved" className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
                      <span>Approved (publicly visible)</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="status-rejected"
                      name="review-status"
                      value={ReviewStatus.REJECTED}
                      checked={editReviewData?.status === ReviewStatus.REJECTED}
                      onChange={() => setEditReviewData(prev => prev ? {...prev, status: ReviewStatus.REJECTED} : null)}
                      className="mr-2"
                    />
                    <label htmlFor="status-rejected" className="flex items-center">
                      <XCircle className="h-4 w-4 mr-1 text-red-400" />
                      <span>Rejected (hidden from public)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              onClick={() => {
                setShowEditModal(false);
                setEditReviewId(null);
                setEditReviewData(null);
              }}
              variant="secondary"
              disabled={actionLoading === editReviewId}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReview}
              disabled={actionLoading === editReviewId || !editReviewData || editReviewData.status === editReviewData.originalStatus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-blue-600/20"
            >
              {actionLoading === editReviewId ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                  Processing...
                </div>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewsPage;