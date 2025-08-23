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
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';

// MMUST Library exact coordinates
const MMUST_LIBRARY_LAT = 0.290482;
const MMUST_LIBRARY_LNG = 34.7640097;

// Animation that plays when component enters viewport
const fadeInUpAnimation = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  .fade-in-up-0 {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .fade-in-up-0.animate {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
  
  .fade-in-up-1 {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .fade-in-up-1.animate {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s ease-out 0.15s, transform 0.5s ease-out 0.15s;
  }
  
  .fade-in-up-2 {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .fade-in-up-2.animate {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s ease-out 0.3s, transform 0.5s ease-out 0.3s;
  }
  
  .map-pin-bounce {
    animation: bounce 1s ease-in-out infinite;
  }
  
  .map-float {
    animation: float 1s ease-in-out infinite;
  }
  
  @keyframes bounce {
    0%, 100% { 
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

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
  // Always get id from useParams at the very top
  const { id } = useParams<{ id: string }>();

  const [hoveredImgIdx, setHoveredImgIdx] = useState<number | null>(null);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  // Auto slideshow interval
  const [isAutoSlideshow, setIsAutoSlideshow] = useState(true);
  // Review popup state (inline, not Modal)
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  // Landlord details popup state
  const [showLandlordDetails, setShowLandlordDetails] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  type Review = {
    _id: string;
    houseId: string;
    userName: string;
    comment: string;
    rating: number;
    createdAt: Date;
    helpful: number;
    // Add any other fields your review object has
  };
  const [reviews, setReviews] = useState<Review[]>([]); // fetched reviews
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  // Fetch reviews for this house
  // Use apiService for reviews

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      setReviewsError('');
      try {
        const data = await apiService.getReviewsByHouseId(id);
        setReviews(data);
      } catch {
        setReviewsError('Could not load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Add review handler (real API)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      setErrorMsg('Please provide your name, review, and a rating.');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.submitReview(id!, {
        userName: reviewName,
        comment: reviewText,
        rating: reviewRating,
      });
  setShowReviewPopup(false);
      setReviewName('');
      setReviewText('');
      setReviewRating(0);
      // Refetch reviews
      const data = await apiService.getReviewsByHouseId(id!);
      setReviews(data);
    } catch {
      setErrorMsg('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };
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
    removeFromCompare,
  } = useStore();

  useEffect(() => {
    if (id) {
      fetchHouseById(id);
    }
  }, [id, fetchHouseById]);

  // Auto slideshow effect
  useEffect(() => {
    if (!currentHouse || !isAutoSlideshow) return;
    
    const intervalId = setInterval(() => {
      if (currentHouse.images.length > 1) {
        setMainImgIdx(prev => (prev + 1) % currentHouse.images.length);
      }
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [currentHouse, isAutoSlideshow]);

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

  const handleRemoveFromCompare = () => {
    if (!currentHouse || !isInCompare) return;
    removeFromCompare(currentHouse.id);
  };

  const getAmenityIcon = (iconName: string) => {
    const Icon = amenityIcons[iconName as keyof typeof amenityIcons] || Shield;
    return Icon;
  };

  // Animation states for distance information
  const [animateDistance, setAnimateDistance] = useState(false);
  const distanceCardRef = React.useRef<HTMLDivElement>(null);
  // State for map link hover effect
  const [mapLinkHovered, setMapLinkHovered] = useState(false);
  // State to control the map view modal
  const [showMapModal, setShowMapModal] = useState(false);
  // State to control map loading spinner
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Set up intersection observer to animate when the card comes into view
    if (!distanceCardRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setAnimateDistance(true);
            // We've removed the timeout that was making the content disappear
            // Now the distance details will stay visible permanently once they appear
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    );
    
    const currentRef = distanceCardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [currentHouse]);

  // Reset map loaded state when modal is opened or closed
  useEffect(() => {
    if (showMapModal) {
      setMapLoaded(false);
    }
  }, [showMapModal]);

  // Add CSS for the animation to the document
  useEffect(() => {
    // Add the animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fadeInUpAnimation;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
      {/* Removed divider line below header */}

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className={`aspect-video overflow-hidden rounded-lg border border-primary/30 transition-all duration-300 ${hoveredImgIdx === 0 ? 'z-50 scale-110 shadow-2xl ring-4 ring-primary/40' : ''}`}
          style={{ position: hoveredImgIdx === 0 ? 'relative' : undefined }}
          onMouseEnter={() => {
            setHoveredImgIdx(0);
            setIsAutoSlideshow(false);
          }}
          onMouseLeave={() => {
            setHoveredImgIdx(null);
            setIsAutoSlideshow(true);
          }}
        >
          <img
            src={currentHouse.images[mainImgIdx]}
            alt={currentHouse.title}
            className="w-full h-full object-cover border border-primary/40 transition-all duration-300"
          />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {mainImgIdx + 1} / {currentHouse.images.length}
          </div>
        </div>
        {currentHouse.images.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {currentHouse.images
              .map((img, idx) => ({ img, idx }))
              .filter(({ idx }) => idx !== mainImgIdx)
              .slice(0, 4)
              .map(({ img, idx }, i) => (
                <div
                  key={idx}
                  className={`aspect-video overflow-hidden rounded-lg border border-primary/30 transition-all duration-300 ${hoveredImgIdx === i + 1 ? 'z-50 scale-110 shadow-2xl ring-4 ring-primary/40' : ''}`}
                  style={{ position: hoveredImgIdx === i + 1 ? 'relative' : undefined }}
                  onMouseEnter={() => {
                    setHoveredImgIdx(i + 1);
                    setIsAutoSlideshow(false);
                  }}
                  onMouseLeave={() => {
                    setHoveredImgIdx(null);
                    setIsAutoSlideshow(true);
                  }}
                  onClick={() => {
                    setMainImgIdx(idx);
                    setIsAutoSlideshow(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={img}
                    alt={`${currentHouse.title} ${idx + 1}`}
                    className={`w-full h-full object-cover border border-primary/40 transition-all duration-300 cursor-pointer ${mainImgIdx === idx ? 'ring-2 ring-primary' : ''}`}
                  />
                  {mainImgIdx === idx && (
                    <div className="absolute bottom-1 right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                      Active
                    </div>
                  )}
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
                  <div className={mapLinkHovered ? 'map-pin-bounce' : ''}>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div 
                    className="flex items-center cursor-pointer group"
                    onClick={() => setShowMapModal(true)}
                    onMouseEnter={() => setMapLinkHovered(true)}
                    onMouseLeave={() => setMapLinkHovered(false)}
                  >
                    <span className={`text-primary font-medium transition-all duration-300 ${
                      mapLinkHovered ? 'underline decoration-wavy decoration-primary/70' : ''
                    } ${mapLinkHovered ? 'map-float' : ''}`}
                    >
                      {currentHouse.location.estate}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{currentHouse.location.address}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 text-xs transition-all duration-300 ${
                        mapLinkHovered ? 'bg-primary/10 text-primary scale-110' : ''
                      }`}
                    >
                      View Map
                    </Badge>
                  </div>
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
                {reviews.length > 0
                  ? (
                      (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    )
                  : '0.0'}
                ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </Badge>
              <Badge variant="outline">
                Safety: {currentHouse.safetyRating}/5
              </Badge>
            </div>
          </div>

          {/* Distance Information */}
          <Card 
            ref={distanceCardRef}
            className={`relative overflow-hidden transition-all duration-500 ${
              animateDistance ? 'shadow-lg ring-2 ring-primary/30' : ''
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent ${
              animateDistance ? 'opacity-70' : 'opacity-0'
            } transition-opacity duration-500`}></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className={animateDistance ? 'animate-[bounce_3s_ease-in-out_1]' : ''}>
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="relative">
                  Distance from MMUST
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div 
                  className={`p-3 rounded-lg transition-all duration-300 fade-in-up-0 ${
                    animateDistance ? 'bg-primary/10 transform scale-105 animate' : ''
                  }`}
                >
                  <p className={`text-2xl font-bold text-primary transition-all duration-500 ${
                    animateDistance ? 'transform scale-110' : ''
                  }`}>
                    {currentHouse.location.distanceFromUniversity.walking}min
                  </p>
                  <p className="text-sm text-muted-foreground">Walking</p>
                </div>
                <div 
                  className={`p-3 rounded-lg transition-all duration-300 fade-in-up-1 ${
                    animateDistance ? 'bg-primary/10 transform scale-105 animate' : ''
                  }`}
                >
                  <p className={`text-2xl font-bold text-primary transition-all duration-500 ${
                    animateDistance ? 'transform scale-110' : ''
                  }`}>
                    {currentHouse.location.distanceFromUniversity.boda}min
                  </p>
                  <p className="text-sm text-muted-foreground">Boda</p>
                </div>
                <div 
                  className={`p-3 rounded-lg transition-all duration-300 fade-in-up-2 ${
                    animateDistance ? 'bg-primary/10 transform scale-105 animate' : ''
                  }`}
                >
                  <p className={`text-2xl font-bold text-primary transition-all duration-500 ${
                    animateDistance ? 'transform scale-110' : ''
                  }`}>
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
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium">MMUST Main Gate</span>
                    <Badge variant="outline" className="text-xs">
                      Campus
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(350 + Math.random() * 150)}m away
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">Green Light Supermarket</span>
                    <Badge variant="outline" className="text-xs">
                      Shopping
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(250 + Math.random() * 150)}m away
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-medium">Lurambi Health Center</span>
                    <Badge variant="outline" className="text-xs">
                      Healthcare
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(400 + Math.random() * 200)}m away
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="font-medium">Kakamega Highway Bus Stop</span>
                    <Badge variant="outline" className="text-xs">
                      Transport
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(200 + Math.random() * 100)}m away
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-medium">Cheers Restaurant</span>
                    <Badge variant="outline" className="text-xs">
                      Food
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(150 + Math.random() * 100)}m away
                  </span>
                </div>
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
              {reviewsLoading ? (
                <p className="text-muted-foreground">Loading reviews...</p>
              ) : reviewsError ? (
                <p className="text-destructive">{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
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
                            {review.createdAt instanceof Date ? review.createdAt.toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}
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

              <Button
                variant="outline"
                onClick={() => setShowLandlordDetails(true)}
                className="w-full"
              >
                View Landlord Contact Details
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {!isInCompare ? (
                <Button
                  onClick={handleAddToCompare}
                  disabled={isInCompare || !canAddToCompare}
                  className="w-full"
                  variant="outline"
                >
                  Add to Compare
                </Button>
              ) : (
                <Button
                  onClick={handleRemoveFromCompare}
                  className="w-full"
                  variant="destructive"
                >
                  Remove from Compare
                </Button>
              )}
              {/* Removed Schedule Visit and Report Issue buttons */}
              <Button variant="gradient" className="w-full mt-2" onClick={() => setShowReviewPopup(true)}>
                Write Review
              </Button>
            </CardContent>
          </Card>

          {/* Write Review Popup (inline, not Modal) */}
          {showReviewPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <form
                onSubmit={handleSubmitReview}
                className="w-full max-w-md mx-auto space-y-6 bg-background p-6 rounded-lg shadow animate-fadeIn border border-primary/20"
              >
                <h2 className="text-xl font-bold text-center">Write a Review</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <Input
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Review</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    required
                    disabled={submitting}
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
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button type="button" className="flex-1" variant="ghost" onClick={() => setShowReviewPopup(false)} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Landlord Details Popup */}
          {showLandlordDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="w-full max-w-md mx-auto space-y-4 bg-background p-6 rounded-lg shadow animate-fadeIn border border-primary/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Landlord Contact Details</h2>
                  <button 
                    onClick={() => setShowLandlordDetails(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4 mt-4">
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

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        try {
                          // Create and click a native link element to ensure browser treats it as user action
                          const link = document.createElement('a');
                          link.href = `tel:${currentHouse.landlord.phone}`;
                          link.style.display = 'none';
                          document.body.appendChild(link);
                          link.click();
                          setTimeout(() => {
                            document.body.removeChild(link);
                          }, 100);
                        } catch (err) {
                          console.error('Error opening phone dialer:', err);
                          // Fallback to alert with number if click fails
                          alert(`Please call: ${currentHouse.landlord.phone}`);
                        }
                      }}
                      className="w-full flex items-center gap-2 text-sm border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors cursor-pointer"
                      aria-label="Call landlord"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{currentHouse.landlord.phone}</span>
                      <span className="text-xs text-muted-foreground ml-auto">Tap to call</span>
                    </button>
                    {currentHouse.landlord.email && (
                      <button 
                        onClick={() => {
                          try {
                            // Create and click a native link element to ensure browser treats it as user action
                            const link = document.createElement('a');
                            link.href = `mailto:${currentHouse.landlord.email}?subject=Inquiry about ${encodeURIComponent(currentHouse.title)}&body=Hello ${encodeURIComponent(currentHouse.landlord.name)},%0D%0A%0D%0AI am interested in your property: ${encodeURIComponent(currentHouse.title)}.%0D%0A%0D%0APlease provide more information.%0D%0A%0D%0AThank you.`;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => {
                              document.body.removeChild(link);
                            }, 100);
                          } catch (err) {
                            console.error('Error opening email client:', err);
                            // Fallback to alert with email if click fails
                            alert(`Please email: ${currentHouse.landlord.email}`);
                          }
                        }}
                        className="w-full flex items-center gap-2 text-sm border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors cursor-pointer"
                        aria-label="Email landlord"
                      >
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{currentHouse.landlord.email}</span>
                        <span className="text-xs text-muted-foreground ml-auto">Tap to email</span>
                      </button>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => setShowLandlordDetails(false)}
                    className="w-full mt-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

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

      {/* Map View Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl mx-auto bg-background p-4 rounded-lg shadow-lg animate-fadeIn border border-primary/20 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                {currentHouse.location.estate}, {currentHouse.location.address}
              </h2>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 bg-muted rounded-lg overflow-hidden border border-primary/20 relative">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center flex-col z-10 bg-background/80">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">Loading map view...</p>
                </div>
              )}
              <iframe
                title="Property Location"
                className="w-full h-full"
                src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
                  &origin=${MMUST_LIBRARY_LAT},${MMUST_LIBRARY_LNG}
                  &destination=${currentHouse.location.coordinates.lat},${currentHouse.location.coordinates.lng}
                  &mode=walking&avoid=highways&units=metric`}
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                loading="lazy"
                onLoad={() => setMapLoaded(true)}
              />
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <Button
                  onClick={() => window.open(
                    `https://www.google.com/maps/dir/?api=1&origin=${MMUST_LIBRARY_LAT},${MMUST_LIBRARY_LNG}&destination=${currentHouse.location.coordinates.lat},${currentHouse.location.coordinates.lng}&travelmode=walking`,
                    '_blank'
                  )}
                  className="flex items-center gap-2"
                >
                  Get Directions
                </Button>
                <Button variant="outline" onClick={() => setShowMapModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};