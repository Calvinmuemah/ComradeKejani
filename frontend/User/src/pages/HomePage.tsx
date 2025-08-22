import React, { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Shield, Star } from 'lucide-react';
import { HouseCard } from '../components/HouseCard';
// import { SearchFilters } from '../components/SearchFilters';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { House } from '../types';

interface Review {
  _id: string;
  houseId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  __v: number;
  // Add missing properties to match the House.reviews type
  id: string;
  userId: string;
  helpful: number;
}

export const HomePage: React.FC = () => {
  const { houses, loading, error, fetchHouses, searchResults, searchQuery } = useStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchHouses();
    
  // Fetch ALL reviews to properly calculate ratings
  const fetchAllReviews = async () => {
    setReviewsLoading(true);
    try {
      // Get all reviews instead of just recent ones
      const reviews = await apiService.getAllReviews();
      
      // Define a type for the API review response
      type APIReview = {
        _id?: string;
        id?: string;
        houseId?: string;
        userName?: string;
        rating?: number;
        comment?: string;
        createdAt?: Date | string;
        __v?: number;
        userId?: string;
        helpful?: number;
      };
      
      // Create properly typed reviews
      const typedReviews: Review[] = reviews.map((apiReview: APIReview) => ({
        _id: apiReview._id || '',
        id: apiReview._id || '',
        houseId: apiReview.houseId || '',
        userName: apiReview.userName || '',
        rating: apiReview.rating || 0,
        comment: apiReview.comment || '',
        createdAt: apiReview.createdAt ? apiReview.createdAt.toString() : new Date().toString(),
        __v: apiReview.__v || 0,
        userId: apiReview.userId || 'unknown',
        helpful: apiReview.helpful || 0
      }));
      
      setRecentReviews(typedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };    fetchAllReviews();
  }, [fetchHouses]);

  // Calculate reviews for each house
  const assignReviewsToHouses = (houses: House[], reviews: Review[]) => {
    // Create a map of houseId to reviews
    const reviewsByHouse: { [key: string]: Review[] } = {};

    // Group reviews by houseId
    reviews.forEach(review => {
      const houseId = review.houseId;
      if (houseId) {
        if (!reviewsByHouse[houseId]) {
          reviewsByHouse[houseId] = [];
        }
        reviewsByHouse[houseId].push(review);
      }
    });

    // Define the expected format for reviews in the House interface
    type HouseReview = {
      id: string;
      userId: string;
      userName: string;
      rating: number;
      comment: string;
      createdAt: Date;
      helpful: number;
    };

    // Assign reviews and calculate ratings for houses
    return houses.map(house => {
      const houseReviews = reviewsByHouse[house.id] || [];
      const reviewCount = houseReviews.length;

      // Calculate average rating if there are reviews
      let avgRating = 0;
      if (reviewCount > 0) {
        avgRating = houseReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
      }

      // Convert reviews to the format expected by the House interface
      const convertedReviews: HouseReview[] = houseReviews.map(review => ({
        id: review.id,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt),
        helpful: review.helpful
      }));

      // Create a type-safe house object with the properly formatted reviews
      const houseWithReviews: House = {
        ...house,
        reviews: convertedReviews,
        reviewCount: reviewCount,
        rating: avgRating || house.rating || 0
      };

      return houseWithReviews;
    });
  };

  const displayHouses = searchQuery 
    ? assignReviewsToHouses(searchResults, recentReviews) 
    : assignReviewsToHouses(houses, recentReviews);
  const featuredHouses = assignReviewsToHouses(
    houses.filter(house => house.verification.verified).slice(0, 6),
    recentReviews
  );
  const trendingEstates = ['Amalemba', 'Kefinco', 'Maraba'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchHouses()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="py-8 px-4 md:px-8 space-y-8 animate-fadeIn">
      {/* Hero Section */}
  <div className="text-center space-y-4 py-12 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl animate-fadeIn delay-100">
  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent transition-all duration-500 hover:scale-105">
          Find Your Perfect Student Home
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover verified, affordable housing near Masinde Muliro University with smart recommendations powered by AI.
        </p>
      </div>

      {/* Search Section */}
    {/* Search Section removed as per request; use header search bar only */}

      {/* Quick Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn delay-200">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{houses.length}</div>
            <div className="text-sm text-muted-foreground">Available Houses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {houses.filter(h => h.verification.verified).length}
            </div>
            <div className="text-sm text-muted-foreground">Verified Properties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {reviewsLoading ? (
                <span className="animate-pulse">...</span>
              ) : recentReviews.length > 0 ? (
                (recentReviews.reduce((acc, r) => acc + r.rating, 0) / recentReviews.length).toFixed(1)
              ) : (
                'N/A'
              )}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {reviewsLoading ? 
                <span className="animate-pulse">...</span> : 
                recentReviews.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {houses.length > 0
                ? `KSh ${Math.round(houses.reduce((acc, h) => acc + h.price, 0) / houses.length).toLocaleString()}`
                : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Average Rent</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Houses */}
      {!searchQuery && featuredHouses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-fadeIn delay-300">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Badge variant="verified">Verified</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 animate-fadeIn delay-400">
            {featuredHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Estates */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-fadeIn delay-300">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Estates</h2>
          </div>
          <div className="flex gap-2 flex-wrap animate-fadeIn delay-400">
            {trendingEstates.map((estate) => (
              <Badge key={estate} variant="outline" className="text-base py-2 px-4">
                <MapPin className="h-4 w-4 mr-2" />
                {estate}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Main Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search Results (${displayHouses.length})` : 'All Houses'}
          </h2>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {displayHouses.filter(h => h.verification.verified).length} verified
            </span>
          </div>
        </div>

        {displayHouses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No houses found matching your search.' : 'No houses available.'}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="mt-4"
            >
              Adjust Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 animate-fadeIn delay-500">
            {displayHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
            {/* Removed Demo House placeholder cards */}
          </div>
        )}
      </section>
    </div>
  );
};