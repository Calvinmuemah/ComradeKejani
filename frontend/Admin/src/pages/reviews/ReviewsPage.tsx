import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Eye, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Flag
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
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (!authLoading) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
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
        // Extract the houseId information
        let listingId = '';
        let listingTitle = 'Unknown Property';
        
        if (typeof apiReview.houseId === 'object' && apiReview.houseId !== null) {
          const houseIdObj = apiReview.houseId as ApiReviewHouseId;
          listingId = houseIdObj._id || '';
          listingTitle = houseIdObj.title || 'Unknown Property';
        } else if (typeof apiReview.houseId === 'string') {
          listingId = apiReview.houseId;
        }
        
        return {
          id: apiReview._id || apiReview.id || '',
          listingId,
          listingTitle,
          rating: apiReview.rating,
          text: apiReview.comment || apiReview.text || '',
          tags: apiReview.tags || [],
          source: (apiReview.source as ReviewSource) || ReviewSource.WEB_FORM,
          deviceId: apiReview.deviceId || `device_${Math.random().toString(36).substring(2, 8)}`,
          status: (apiReview.status as ReviewStatus) || ReviewStatus.PENDING,
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
        // Extract the houseId information
        let listingId = '';
        let listingTitle = 'Unknown Property';
        
        if (typeof apiReview.houseId === 'object' && apiReview.houseId !== null) {
          const houseIdObj = apiReview.houseId as ApiReviewHouseId;
          listingId = houseIdObj._id || '';
          listingTitle = houseIdObj.title || 'Unknown Property';
        } else if (typeof apiReview.houseId === 'string') {
          listingId = apiReview.houseId;
        }
        
        return {
          id: apiReview._id || apiReview.id || '',
          listingId,
          listingTitle,
          rating: apiReview.rating,
          text: apiReview.comment || apiReview.text || '',
          tags: apiReview.tags || [],
          source: (apiReview.source as ReviewSource) || ReviewSource.WEB_FORM,
          deviceId: apiReview.deviceId || `device_${Math.random().toString(36).substring(2, 8)}`,
          status: (apiReview.status as ReviewStatus) || ReviewStatus.PENDING,
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
    setReviews(formattedReviews);
    
    // Calculate stats
    const pending = formattedReviews.filter((r) => r.status === ReviewStatus.PENDING).length;
    const approved = formattedReviews.filter((r) => r.status === ReviewStatus.APPROVED).length;
    const rejected = formattedReviews.filter((r) => r.status === ReviewStatus.REJECTED).length;
    const avgRating = approved > 0 
      ? (formattedReviews.filter((r) => r.status === ReviewStatus.APPROVED)
          .reduce((acc: number, r) => acc + r.rating, 0) / approved).toFixed(1)
      : '0.0';
    
    setStats({
      pending,
      approved,
      rejected,
      averageRating: Number(avgRating)
    });
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const variants = {
      [ReviewStatus.PENDING]: 'warning',
      [ReviewStatus.APPROVED]: 'success',
      [ReviewStatus.REJECTED]: 'destructive'
    } as const;

    const icons = {
      [ReviewStatus.PENDING]: <Clock className="h-3 w-3 mr-1" />,
      [ReviewStatus.APPROVED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [ReviewStatus.REJECTED]: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {status}
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

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.tags && review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(reviewId);
      
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
      console.error(`Error ${action}ing review:`, error);
      // Provide user feedback about the error
      addToast(`Failed to ${action} review: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    } finally {
      setActionLoading(null);
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
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getRatingStars(review.rating)}
                        {getStatusBadge(review.status)}
                        {getSourceBadge(review.source)}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{review.listingTitle}</h3>
                      <p className="text-gray-300 mb-4">{review.text}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.tags && review.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
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

                    <div className="flex items-center space-x-2 ml-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {review.status === ReviewStatus.PENDING && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewAction(review.id, 'approve')}
                            className="text-green-600 hover:text-green-700"
                            disabled={actionLoading === review.id}
                          >
                            {actionLoading === review.id ? (
                              <div className="animate-spin h-4 w-4 border-b-2 border-green-600 rounded-full"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewAction(review.id, 'reject')}
                            className="text-red-600 hover:text-red-700"
                            disabled={actionLoading === review.id}
                          >
                            {actionLoading === review.id ? (
                              <div className="animate-spin h-4 w-4 border-b-2 border-red-600 rounded-full"></div>
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center py-10">
                <p className="text-gray-400">No reviews found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getRatingStars(selectedReview.rating)}
                {getStatusBadge(selectedReview.status)}
                {getSourceBadge(selectedReview.source)}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Property</h3>
              <p className="text-gray-300">{selectedReview.listingTitle}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Review Text</h3>
              <p className="text-gray-300">{selectedReview.text}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedReview.tags && selectedReview.tags.length > 0 ? (
                  selectedReview.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-400">No tags available</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Device ID:</span> <span className="text-white">{selectedReview.deviceId}</span></p>
                  <p><span className="text-gray-400">Source:</span> <span className="text-white">{selectedReview.source}</span></p>
                  <p><span className="text-gray-400">Submitted:</span> <span className="text-white">{formatDate(selectedReview.createdAt)}</span></p>
                </div>
              </div>
              
              {selectedReview.moderatedBy && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Moderation Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Moderated By:</span> <span className="text-white">{selectedReview.moderatedBy}</span></p>
                    <p><span className="text-gray-400">Moderated At:</span> <span className="text-white">{formatDate(selectedReview.moderatedAt!)}</span></p>
                  </div>
                </div>
              )}
            </div>

            {selectedReview.status === ReviewStatus.PENDING && (
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleReviewAction(selectedReview.id, 'reject');
                    setShowReviewModal(false);
                  }}
                  disabled={actionLoading === selectedReview.id}
                >
                  {actionLoading === selectedReview.id ? 'Processing...' : 'Reject Review'}
                </Button>
                <Button 
                  onClick={() => {
                    handleReviewAction(selectedReview.id, 'approve');
                    setShowReviewModal(false);
                  }}
                  disabled={actionLoading === selectedReview.id}
                >
                  {actionLoading === selectedReview.id ? 'Processing...' : 'Approve Review'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewsPage;