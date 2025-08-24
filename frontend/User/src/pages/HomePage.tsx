import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, MapPin, Shield, Star } from 'lucide-react';
import { HouseCard } from '../components/HouseCard';
// import { SearchFilters } from '../components/SearchFilters';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { House } from '../types';
import { useTheme } from '../contexts/useTheme';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const refreshTimerRef = useRef<number | null>(null);

  // Function to fetch all reviews
  const fetchAllReviews = async () => {
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
    }
  };
  
  // Custom function to fetch houses without showing loading state
  const fetchHousesSilently = async () => {
    try {
      const houses = await apiService.getHouses(undefined);
      // Update houses in store without changing loading state
      useStore.setState({ houses });
    } catch (error) {
      console.error('Error fetching houses silently:', error);
    }
  };
  
  // Function to refresh data in the background
  const refreshDataSilently = async () => {
    try {
      // Fetch new data in the background without any UI indicators
      const [newHouses] = await Promise.all([
        apiService.getHouses(undefined),
        fetchAllReviews()
      ]);
      
      // Make sure we don't disrupt the UI by updating houses only if we have new data
      if (newHouses && newHouses.length > 0) {
        // Update the store without changing loading state
        useStore.setState({ houses: newHouses });
      }
    } catch (error) {
      console.error('Error in background refresh:', error);
    }
  };

  // Initial data load and set up background refresh
  useEffect(() => {
    // Initial data load without showing loading state
    Promise.all([
      fetchHousesSilently(),
      fetchAllReviews()
    ]);
    
    // Set up background refresh timer (every 5 seconds)
    // Delay the first refresh by 1 second to ensure initial load is complete
    const initialTimeout = setTimeout(() => {
      refreshDataSilently();
      
      // Then set up the regular interval
      refreshTimerRef.current = window.setInterval(() => {
        refreshDataSilently();
      }, 5000);
    }, 1000);
    
    // Clean up timer on component unmount
    return () => {
      clearTimeout(initialTimeout);
      if (refreshTimerRef.current !== null) {
        clearInterval(refreshTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    
  // Algorithm to select 4 featured houses based on multiple criteria
  const selectFeaturedHouses = (houses: House[]): House[] => {
    // Only consider verified houses
    const verifiedHouses = houses.filter(house => house.verification.verified);
    
    if (verifiedHouses.length === 0) {
      // If no verified houses, take any houses up to 4
      return houses.slice(0, 4);
    }
    
    if (verifiedHouses.length <= 4) {
      // If 4 or fewer verified houses, return all of them
      return verifiedHouses;
    }
    
    // Score each house based on multiple criteria
    const scoredHouses = verifiedHouses.map(house => {
      let score = 0;
      
      // Score based on rating (0-5 points)
      score += house.rating || 0;
      
      // Score based on number of amenities (0-3 points)
      const amenitiesCount = house.amenities.filter(a => a.available).length;
      score += Math.min(amenitiesCount / 3, 3);
      
      // Score based on safety rating (0-5 points)
      score += house.safetyRating || 0;
      
      // Score based on review count (0-2 points)
      score += Math.min((house.reviewCount || 0) / 5, 2);
      
      // Score based on proximity to university (0-2 points)
      const walkingDistance = house.location.distanceFromUniversity.walking;
      score += walkingDistance <= 10 ? 2 : walkingDistance <= 20 ? 1 : 0;
      
      // Score based on vacancy (1 point bonus for vacant houses)
      score += house.status === 'vacant' ? 1 : 0;
      
      return { house, score };
    });
    
    // Sort by score (highest first) and take the top 4
    return scoredHouses
      .sort((a, b) => b.score - a.score)
      .map(item => item.house)
      .slice(0, 4);
  };
  
  const featuredHouses = assignReviewsToHouses(
    selectFeaturedHouses(houses),
    recentReviews
  );
  const trendingEstates = ['Amalemba', 'Kefinco', 'Maraba'];

  // Skip loading screen for background refreshes - only show on first load when there are no houses
  if (loading && houses.length === 0) {
    return (
  <div className={`w-full px-4 md:px-8 py-8 ${isLight ? 'bg-white' : 'bg-oxford-900'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-80 rounded-lg animate-pulse ${isLight ? 'bg-gray-100' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className={`w-full px-4 md:px-8 py-8 ${isLight ? 'bg-white' : 'bg-oxford-900'}`}>
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
  <div className={`py-8 px-4 md:px-8 space-y-8 animate-fadeIn ${isLight ? 'bg-white' : 'bg-oxford-900'}`}>
      {/* Hero Section */}
  <div className={`text-center space-y-4 py-12 rounded-2xl animate-fadeIn delay-100 ${
    isLight 
      ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
      : 'bg-gradient-to-r from-blue-500/10 to-purple-600/10'
  }`}>
  <h1 className={`text-4xl md:text-6xl font-bold transition-all duration-500 hover:scale-105 ${
    isLight 
      ? 'text-blue-600' 
      : 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent'
  }`}>
          Find Your Perfect Student Home
        </h1>
        <p className={`text-xl max-w-2xl mx-auto ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>
          Find the perfect student accommodation near Masinde Muliro University
        </p>
      </div>

      {/* Quick Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn delay-200">
        <Card className={isLight ? 'bg-white border border-gray-200 shadow-sm' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{houses.length}</div>
            <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>Available Houses</div>
          </CardContent>
        </Card>
        <Card className={isLight ? 'bg-white border border-gray-200 shadow-sm' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {houses.filter(h => h.verification.verified).length}
            </div>
            <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>Verified Properties</div>
          </CardContent>
        </Card>
        <Card className={isLight ? 'bg-white border border-gray-200 shadow-sm' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {recentReviews.length > 0 
                ? (recentReviews.reduce((acc, r) => acc + r.rating, 0) / recentReviews.length).toFixed(1)
                : 'N/A'
              }
            </div>
            <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>Average Rating</div>
          </CardContent>
        </Card>
        <Card className={isLight ? 'bg-white border border-gray-200 shadow-sm' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {recentReviews.length}
            </div>
            <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>Total Reviews</div>
          </CardContent>
        </Card>
        <Card className={isLight ? 'bg-white border border-gray-200 shadow-sm' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {houses.length > 0
                ? `KSh ${Math.round(houses.reduce((acc, h) => acc + h.price, 0) / houses.length).toLocaleString()}`
                : 'N/A'}
            </div>
            <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-blue-200'}`}>Average Rent</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Houses */}
      {!searchQuery && featuredHouses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between animate-fadeIn delay-300">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Properties</h2>
              <Badge variant="verified">Verified</Badge>
            </div>
            <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-blue-300'}`}>
              Selected based on amenities, ratings, and location
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 animate-fadeIn delay-400">
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
            <p className="text-blue-200 text-lg">
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