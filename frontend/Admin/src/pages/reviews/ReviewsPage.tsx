import React, { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ReviewStatus, ReviewSource } from '../../types';
import { formatDate } from '../../lib/utils';

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    listingId: '1',
    listingTitle: '2 Bedroom Apartment near MMUST Gate B',
    rating: 4,
    text: 'Great place to stay! The landlord is very responsive and the house is clean. Water is available most of the time and the location is perfect for students.',
    tags: ['clean', 'responsive landlord', 'good location'],
    source: ReviewSource.WEB_FORM,
    deviceId: 'device_123',
    status: ReviewStatus.APPROVED,
    createdAt: '2024-01-15T10:30:00Z',
    moderatedBy: 'Super Admin',
    moderatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    listingId: '2',
    listingTitle: 'Single Room with WiFi - Kefinco Estate',
    rating: 2,
    text: 'The room is okay but there are frequent water shortages. The WiFi is not as fast as advertised. Landlord takes time to respond to issues.',
    tags: ['water issues', 'slow wifi', 'unresponsive landlord'],
    source: ReviewSource.WEB_FORM,
    deviceId: 'device_456',
    status: ReviewStatus.PENDING,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    listingId: '3',
    listingTitle: 'Bedsitter near Matatu Stage',
    rating: 5,
    text: 'Excellent value for money! Everything works perfectly and the landlord is very helpful. Highly recommend this place.',
    tags: ['value for money', 'helpful landlord', 'everything works'],
    source: ReviewSource.SURVEY,
    deviceId: 'device_789',
    status: ReviewStatus.APPROVED,
    createdAt: '2024-01-14T16:22:00Z',
    moderatedBy: 'Super Admin',
    moderatedAt: '2024-01-14T17:00:00Z'
  },
  {
    id: '4',
    listingId: '1',
    listingTitle: '2 Bedroom Apartment near MMUST Gate B',
    rating: 1,
    text: 'This is a scam! The photos are fake and the actual place is completely different. The landlord is fraudulent.',
    tags: ['scam', 'fake photos', 'fraudulent'],
    source: ReviewSource.WEB_FORM,
    deviceId: 'device_101',
    status: ReviewStatus.REJECTED,
    createdAt: '2024-01-13T14:45:00Z',
    moderatedBy: 'Super Admin',
    moderatedAt: '2024-01-13T15:00:00Z'
  }
];

const ReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    console.log(`${action} review ${reviewId}`);
    // Implementation would update the review status
  };

  return (
    <div className="space-y-6">
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
                  {mockReviews.filter(r => r.status === ReviewStatus.PENDING).length}
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
                  {mockReviews.filter(r => r.status === ReviewStatus.APPROVED).length}
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
                  {mockReviews.filter(r => r.status === ReviewStatus.REJECTED).length}
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
                  {(mockReviews.filter(r => r.status === ReviewStatus.APPROVED)
                    .reduce((acc, r) => acc + r.rating, 0) / 
                    mockReviews.filter(r => r.status === ReviewStatus.APPROVED).length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
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
            {filteredReviews.map((review) => (
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
                      {review.tags.map((tag, index) => (
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
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewAction(review.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
                {selectedReview.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
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
                >
                  Reject Review
                </Button>
                <Button 
                  onClick={() => {
                    handleReviewAction(selectedReview.id, 'approve');
                    setShowReviewModal(false);
                  }}
                >
                  Approve Review
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