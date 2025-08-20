import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Shield,
  Phone,
  Mail,
  Wifi,
  Droplets,
  Zap,
  Car,
  Home as HomeIcon,
  Shirt,
  CheckCircle,
  Clock,
  Users,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';

const amenityIcons = {
  wifi: Wifi,
  water: Droplets,
  electricity: Zap,
  parking: Car,
  furnished: HomeIcon,
  security: Shield,
  laundry: Shirt,
};

export const HouseDetailPage: React.FC = () => {
  // Modal state for Write Review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Add review handler (simulate, since no backend)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      setErrorMsg('Please provide your name, review, and a rating.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      // Simulate adding review (in real app, call API)
      if (currentHouse) {
        currentHouse.reviews.unshift({
          id: Date.now().toString(),
          userName: reviewName,
          comment: reviewText,
          rating: reviewRating,
          createdAt: new Date(),
          helpful: 0,
        });
      }
      setSubmitting(false);
      setShowReviewModal(false);
      setReviewName('');
      setReviewText('');
      setReviewRating(0);
    }, 1200);
  };
  const { id } = useParams<{ id: string }>();
  const {
    currentHouse,
    loading,
    error,
    favorites,
    fetchHouseById,
    addToFavorites,
    removeFromFavorites,
    addToCompare,
    compareList,
  } = useStore();

  useEffect(() => {
    if (id) {
      fetchHouseById(id);
    }
  }, [id, fetchHouseById]);

  const isFavorited = currentHouse && favorites.some(fav => fav.id === currentHouse.id);
  const isInCompare = currentHouse && compareList.some(h => h.id === currentHouse.id);
  const canAddToCompare = compareList.length < 3;

  const handleFavoriteToggle = () => {
    if (!currentHouse) return;
    if (isFavorited) {
      removeFromFavorites(currentHouse.id);
    } else {
      addToFavorites(currentHouse);
    }
  };

  const handleAddToCompare = () => {
    if (!currentHouse || isInCompare || !canAddToCompare) return;
    addToCompare(currentHouse);
  };

  const getAmenityIcon = (iconName: string) => {
    const Icon = amenityIcons[iconName as keyof typeof amenityIcons] || Shield;
    return Icon;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !currentHouse) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">{error || 'House not found'}</p>
        <Link to="/">
          <Button className="mt-4">Back to Houses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Houses
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFavoriteToggle}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={currentHouse.images[0]}
            alt={currentHouse.title}
            className="w-full h-full object-cover"
          />
        </div>
        {currentHouse.images.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {currentHouse.images.slice(1, 5).map((image, index) => (
              <div key={index} className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`${currentHouse.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{currentHouse.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{currentHouse.location.estate}</span>
                  <span>• {currentHouse.location.address}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  KSh {currentHouse.price.toLocaleString()}
                </p>
                <p className="text-muted-foreground">per month</p>
              </div>
            </div>

            {/* Status and Verification */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={currentHouse.status === 'vacant' ? 'success' : 'secondary'}>
                {currentHouse.status === 'vacant' ? 'Available Now' : 'Currently Occupied'}
              </Badge>
              {currentHouse.verification.verified && (
                <Badge variant="verified">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Property
                </Badge>
              )}
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                {currentHouse.rating.toFixed(1)} ({currentHouse.reviews.length} reviews)
              </Badge>
              <Badge variant="outline">
                Safety: {currentHouse.safetyRating}/5
              </Badge>
            </div>
          </div>

          {/* Distance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distance from MMUST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {currentHouse.location.distanceFromUniversity.walking}min
                  </p>
                  <p className="text-sm text-muted-foreground">Walking</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {currentHouse.location.distanceFromUniversity.boda}min
                  </p>
                  <p className="text-sm text-muted-foreground">Boda</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {currentHouse.location.distanceFromUniversity.matatu}min
                  </p>
                  <p className="text-sm text-muted-foreground">Matatu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentHouse.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  // Color map for light theme
                  const colorMap: Record<string, string> = {
                    wifi: 'bg-blue-50 border-blue-200 text-blue-600',
                    water: 'bg-sky-50 border-sky-200 text-sky-600',
                    electricity: 'bg-yellow-50 border-yellow-200 text-yellow-600',
                    furnished: 'bg-purple-50 border-purple-200 text-purple-600',
                    security: 'bg-indigo-50 border-indigo-200 text-indigo-600',
                    parking: 'bg-orange-50 border-orange-200 text-orange-600',
                    laundry: 'bg-pink-50 border-pink-200 text-pink-600',
                  };
                  const colorClass = amenity.available
                    ? colorMap[amenity.icon] || 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-400 opacity-50';
                  return (
                    <div
                      key={amenity.name}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${colorClass} dark:bg-green-950 dark:border-green-800`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{amenity.name}</span>
                      {amenity.available && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Nearby Essentials */}
          <Card>
            <CardHeader>
              <CardTitle>Nearby Essentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentHouse.location.nearbyEssentials.map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-medium">{place.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {place.type}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {place.distance}m away
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentHouse.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {currentHouse.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-current text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {review.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Landlord</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{currentHouse.landlord.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-sm">{currentHouse.landlord.rating.toFixed(1)}</span>
                    {currentHouse.landlord.verified && (
                      <Badge variant="verified" className="text-xs ml-2">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-sm border border-primary/30 rounded-lg px-3 py-2 transition-all hover:shadow-lg hover:border-primary/70 cursor-pointer group"
                  tabIndex={0}
                >
                  <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-foreground group-hover:text-primary">{currentHouse.landlord.phone}</span>
                </div>
                {currentHouse.landlord.email && (
                  <div
                    className="flex items-center gap-2 text-sm border border-primary/30 rounded-lg px-3 py-2 transition-all hover:shadow-lg hover:border-primary/70 cursor-pointer group"
                    tabIndex={0}
                  >
                    <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground group-hover:text-primary">{currentHouse.landlord.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={handleAddToCompare}
                disabled={isInCompare || !canAddToCompare}
                className="w-full"
                variant="outline"
              >
                {isInCompare ? 'Already in Compare' : 'Add to Compare'}
              </Button>
              {/* Removed Schedule Visit and Report Issue buttons */}
              <Button variant="gradient" className="w-full mt-2" onClick={() => setShowReviewModal(true)}>
                Write Review
              </Button>
            </CardContent>
          </Card>

          {/* Write Review Modal */}
          <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)}>
            <form onSubmit={handleSubmitReview} className="space-y-5 animate-fadeIn">
              <h2 className="text-xl font-bold text-center mb-2">Write a Review</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <Input
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Review</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className={`transition-all ${star <= reviewRating ? 'text-yellow-400 scale-110' : 'text-gray-300'} hover:scale-125`}
                      onClick={() => setReviewRating(star)}
                      disabled={submitting}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star className="h-7 w-7" />
                    </button>
                  ))}
                </div>
              </div>
              {errorMsg && <p className="text-destructive text-sm text-center">{errorMsg}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </Modal>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Type</span>
                <span className="font-medium capitalize">{currentHouse.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listed Date</span>
                <span className="font-medium">
                  {currentHouse.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {currentHouse.updatedAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">127 this month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};