import { House, SearchFilters, PriceTrend, SafetyAlert, Notification, AIRecommendation, UserPreferences, HouseType, NearbyPlace } from '../types';
import {
  ForumPostResponse,
  ForumReplyResponse,
  HouseResponse,
  ReviewResponse,
  NotificationResponse,
  PopularEstateResponse,
  PriceTrendResponse
} from '../types/api';
const convertNearbyEssentials = (essentials: { type: string; name: string; distance: number }[] = []): NearbyPlace[] => {
  const validTypes = {
    'shop': 'shop',
    'market': 'market',
    'hospital': 'hospital',
    'police': 'police',
    'atm': 'atm',
    'restaurant': 'restaurant'
  } as const;

  return essentials.map(item => ({
    ...item,
    // Map any string type to a valid NearbyPlace type or default to 'shop'
    type: (validTypes[item.type?.toLowerCase() as keyof typeof validTypes] || 'shop') as NearbyPlace['type']
  }));
};

// API Service - Centralized API calls
// Replace dummy data with real API endpoints when backend is ready

// Base URL for all API calls
const BASE_URL = 'https://1g17qnls-3000.uks1.devtunnels.ms';

// Centralized API endpoints
export const API_ENDPOINTS = {
  // Admin auth
  ADMIN: {
    REGISTER: `${BASE_URL}/api/v1/admin/register`,
    LOGIN: `${BASE_URL}/api/v1/admin/login`,
    GET_USER: (userId: string) => `${BASE_URL}/api/v1/admin/${userId}`,
    UPDATE_USER: (userId: string) => `${BASE_URL}/api/v1/admin/${userId}`,
  },
  
  // User auth
  USER: {
    REGISTER: `${BASE_URL}/api/v1/users/register`,
    LOGIN: `${BASE_URL}/api/v1/users/login`,
    GET_USER: (userId: string) => `${BASE_URL}/api/v1/users/${userId}`,
    UPDATE_USER: (userId: string) => `${BASE_URL}/api/v1/users/${userId}`,
    FAVORITES: {
      ADD: (houseId: string) => `${BASE_URL}/api/v1/users/favorites/${houseId}`,
      REMOVE: (houseId: string) => `${BASE_URL}/api/v1/users/favorites/${houseId}`,
      GET_ALL: `${BASE_URL}/api/v1/users/favorites`,
    },
  },
  
  // Landlord
  LANDLORD: {
    CREATE: `${BASE_URL}/api/v1/landlords/addLandlord`,
    GET_ALL: `${BASE_URL}/api/v1/landlords/Landlords`,
    GET_BY_ID: (id: string) => `${BASE_URL}/api/v1/landlords/Landlord/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/api/v1/landlords/Landlord/${id}`,
    DELETE: (id: string) => `${BASE_URL}/api/v1/landlords/Landlords/${id}`,
  },
  
  // House
  HOUSE: {
    CREATE: `${BASE_URL}/api/v1/houses/create`,
    GET_ALL: `${BASE_URL}/api/v1/houses/getAll`,
    GET_BY_ID: (id: string) => `${BASE_URL}/api/v1/houses/house/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/api/v1/houses/house/${id}`,
    DELETE: (id: string) => `${BASE_URL}/api/v1/houses/house/${id}`,
    FILTER: `${BASE_URL}/api/v1/houses/filter`,
  },
  
  // Reviews
  REVIEW: {
    CREATE: `${BASE_URL}/api/v1/reviews/create`,
    GET_BY_HOUSE: (houseId: string) => `${BASE_URL}/api/v1/reviews/house/${houseId}`,
    UPDATE: (reviewId: string) => `${BASE_URL}/api/v1/reviews/review/${reviewId}`,
    DELETE: (reviewId: string) => `${BASE_URL}/api/v1/reviews/review/${reviewId}`,
    GET_RECENT: `${BASE_URL}/api/v1/reviews/recent`,
    GET_TOP: `${BASE_URL}/api/v1/reviews/top`,
  },
  
  // Notifications
  NOTIFICATION: {
    CREATE: `${BASE_URL}/api/v1/notifications/create`,
    GET_ALL: `${BASE_URL}/api/v1/notifications/getAll`,
    UPDATE: (id: string) => `${BASE_URL}/api/v1/notifications/updateNotification/${id}`,
    DELETE: (id: string) => `${BASE_URL}/api/v1/notifications/deleteNotification/${id}`,
  },
  
  // Report Issues
  REPORT: {
    CREATE: `${BASE_URL}/api/v1/reports/create`,
    GET_ALL: `${BASE_URL}/api/v1/reports/getAll`,
  },
  
  // Forum
  FORUM: {
    CREATE: `${BASE_URL}/api/v1/forums/create`,
    GET_ALL: `${BASE_URL}/api/v1/forums/getAll`,
    GET_BY_ID: (postId: string) => `${BASE_URL}/api/v1/forums/${postId}`,
    REPLY: (postId: string) => `${BASE_URL}/api/v1/forums/${postId}/reply`,
    LIKE: (postId: string) => `${BASE_URL}/api/v1/forums/${postId}/like`,
  },
  
  // AI Recommendations
  AI: {
    RECOMMENDATIONS: `${BASE_URL}/api/v1/ai/recommendations`,
    FEEDBACK: `${BASE_URL}/api/v1/ai/feedback`,
  },
  
  // Data Insights
  INSIGHTS: {
    PRICE_TRENDS: `${BASE_URL}/api/v1/insights/price-trends`,
    POPULAR_ESTATES: `${BASE_URL}/api/v1/insights/popular-estates`,
    TRENDING_SEARCHES: `${BASE_URL}/api/v1/insights/trending-searches`,
  },
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Report Issue endpoint
  async submitReportIssue(report: { description: string; type: string }): Promise<{ success: boolean }> {
    const res = await fetch(API_ENDPOINTS.REPORT.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return { success: true };
  }
  // Forum endpoints
  async getForumPosts() {
    const res = await fetch(API_ENDPOINTS.FORUM.GET_ALL);
    if (!res.ok) throw new Error('Failed to fetch forum posts');
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((p: ForumPostResponse) => ({ 
          ...p, 
          timestamp: new Date(p.timestamp), 
          replies: (p.replies || []).map((r: ForumReplyResponse) => ({ 
            ...r, 
            timestamp: new Date(r.timestamp) 
          })) 
        }))
      : [];
  }

  async createForumPost(post: { title: string; category: string; content: string; author: string; }) {
    const res = await fetch(API_ENDPOINTS.FORUM.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to create forum post');
    return await res.json();
  }

  async getForumPostById(postId: string) {
    const res = await fetch(API_ENDPOINTS.FORUM.GET_BY_ID(postId));
    if (!res.ok) throw new Error('Failed to fetch forum post');
    const data = await res.json();
    return { 
      ...data, 
      timestamp: new Date(data.timestamp), 
      replies: (data.replies || []).map((r: ForumReplyResponse) => ({ 
        ...r, 
        timestamp: new Date(r.timestamp) 
      })) 
    };
  }

  async replyToForumPost(postId: string, reply: { content: string; author: string; }) {
    const res = await fetch(API_ENDPOINTS.FORUM.REPLY(postId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply),
    });
    if (!res.ok) throw new Error('Failed to reply to forum post');
    return await res.json();
  }

  async likeForumPost(postId: string, userId: string) {
    const res = await fetch(API_ENDPOINTS.FORUM.LIKE(postId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to like forum post');
    return await res.json();
  }
  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(API_ENDPOINTS.USER.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      return { 
        success: true, 
        token: data.token, 
        user: data.user 
      };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to dummy response for development
      await delay(1000);
      return { 
        success: true, 
        token: 'dummy-token', 
        user: { id: '1', email: credentials.email } 
      };
    }
  }

  async register(userData: { 
    name: string; 
    email: string; 
    password: string; 
    phoneNumber?: string;
  }) {
    try {
      const response = await fetch(API_ENDPOINTS.USER.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      return { 
        success: true, 
        message: 'Registration successful',
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to dummy response for development
      await delay(1000);
      return { 
        success: true, 
        message: 'Registration successful' 
      };
    }
  }

  // House listings endpoints
  async getHouses(filters?: Partial<SearchFilters>): Promise<House[]> {
    // Use real backend endpoint
    const response = await fetch(API_ENDPOINTS.HOUSE.GET_ALL);
    if (!response.ok) throw new Error('Failed to fetch houses');
    const data = await response.json();
    // Optionally filter client-side if filters are provided (backend does not support filters yet)
    let houses = data;
    if (filters) {
      houses = this.filterHouses(houses, filters);
    }
    
    // Map backend _id to id and process fields
    return houses.map((house: HouseResponse) => {
      // Create a proper House object with all required fields
      const processedHouse: House = {
        id: house._id || '',
        title: house.title || '',
        description: house.description || '',
        price: house.price || 0,
        type: house.type || 'bedsitter',
        images: Array.isArray(house.images)
          ? house.images.map((img: string) =>
              img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
            )
          : [],
        status: house.status || 'vacant',
        rating: house.rating || 0,
        safetyRating: house.safetyRating || 0,
        amenities: house.amenities || [],
        location: {
          estate: house.location?.estate || '',
          address: house.location?.address || '',
          coordinates: house.location?.coordinates || { lat: 0, lng: 0 },
          distanceFromUniversity: house.location?.distanceFromUniversity || { 
            walking: 0, 
            boda: 0, 
            matatu: 0 
          },
          nearbyEssentials: convertNearbyEssentials(house.location?.nearbyEssentials)
        },
        landlord: {
          id: house.landlord?._id || '',
          name: house.landlord?.name || '',
          phone: house.landlord?.phone || '',
          email: house.landlord?.email || '',
          verified: house.landlord?.verified || false,
          rating: house.landlord?.rating || 0
        },
        verification: {
          verified: house.verification?.verified || false,
          verifiedBy: house.verification?.verifiedBy || '',
          verifiedDate: house.verification?.verificationDate ? new Date(house.verification.verificationDate) : new Date()
        },
        reviews: Array.isArray(house.reviews)
          ? house.reviews.map(review => ({
              ...review,
              createdAt: new Date(review.createdAt || Date.now())
            }))
          : [],
        createdAt: new Date(house.createdAt || Date.now()),
        updatedAt: new Date(house.updatedAt || Date.now()),
      };
      
      return processedHouse;
    });
  }

  async getHouseById(id: string): Promise<House | null> {
    const response = await fetch(API_ENDPOINTS.HOUSE.GET_BY_ID(id));
    if (!response.ok) throw new Error('Failed to fetch house');
    const house: HouseResponse = await response.json();
    
    // Create a proper House object with all required fields
    const processedHouse: House = {
      id: house._id || '',
      title: house.title || '',
      description: house.description || '',
      price: house.price || 0,
      type: house.type || 'bedsitter',
      images: Array.isArray(house.images)
        ? house.images.map((img: string) =>
            img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
          )
        : [],
      status: house.status || 'vacant',
      rating: house.rating || 0,
      safetyRating: house.safetyRating || 0,
      amenities: house.amenities || [],
      location: {
        estate: house.location?.estate || '',
        address: house.location?.address || '',
        coordinates: house.location?.coordinates || { lat: 0, lng: 0 },
        distanceFromUniversity: house.location?.distanceFromUniversity || { 
          walking: 0, 
          boda: 0, 
          matatu: 0 
        },
        nearbyEssentials: convertNearbyEssentials(house.location?.nearbyEssentials)
      },
      landlord: {
        id: house.landlord?._id || '',
        name: house.landlord?.name || '',
        phone: house.landlord?.phone || '',
        email: house.landlord?.email || '',
        verified: house.landlord?.verified || false,
        rating: house.landlord?.rating || 0
      },
      verification: {
        verified: house.verification?.verified || false,
        verifiedBy: house.verification?.verifiedBy || '',
        verifiedDate: house.verification?.verificationDate ? new Date(house.verification.verificationDate) : new Date()
      },
      reviews: Array.isArray(house.reviews)
        ? house.reviews.map(review => ({
            ...review,
            createdAt: new Date(review.createdAt || Date.now())
          }))
        : [],
      createdAt: new Date(house.createdAt || Date.now()),
      updatedAt: new Date(house.updatedAt || Date.now()),
    };
    
    return processedHouse;
  }

  async getFavorites(): Promise<House[]> {
    try {
      const token = localStorage.getItem('token'); // Get the user token
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.USER.FAVORITES.GET_ALL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      
      const data = await response.json();
      // Process the house data similar to getHouses method
      return data.map((house: HouseResponse) => {
        // Create a proper House object with all required fields
        const processedHouse: House = {
          id: house._id || '',
          title: house.title || '',
          description: house.description || '',
          price: house.price || 0,
          type: house.type || 'bedsitter',
          images: Array.isArray(house.images)
            ? house.images.map((img: string) =>
                img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
              )
            : [],
          status: house.status || 'vacant',
          rating: house.rating || 0,
          safetyRating: house.safetyRating || 0,
          amenities: house.amenities || [],
          location: {
            estate: house.location?.estate || '',
            address: house.location?.address || '',
            coordinates: house.location?.coordinates || { lat: 0, lng: 0 },
            distanceFromUniversity: house.location?.distanceFromUniversity || { 
              walking: 0, 
              boda: 0, 
              matatu: 0 
            },
            nearbyEssentials: convertNearbyEssentials(house.location?.nearbyEssentials)
          },
          landlord: {
            id: house.landlord?._id || '',
            name: house.landlord?.name || '',
            phone: house.landlord?.phone || '',
            email: house.landlord?.email || '',
            verified: house.landlord?.verified || false,
            rating: house.landlord?.rating || 0
          },
          verification: {
            verified: house.verification?.verified || false,
            verifiedBy: house.verification?.verifiedBy || '',
            verifiedDate: house.verification?.verificationDate ? new Date(house.verification.verificationDate) : new Date()
          },
          reviews: Array.isArray(house.reviews)
            ? house.reviews.map(review => ({
                ...review,
                createdAt: new Date(review.createdAt || Date.now())
              }))
            : [],
          createdAt: new Date(house.createdAt || Date.now()),
          updatedAt: new Date(house.updatedAt || Date.now()),
        };
        
        return processedHouse;
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Fallback to dummy data for development
      await delay(600);
  throw error;
    }
  }

  async addToFavorites(houseId: string): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem('token'); // Get the user token
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.USER.FAVORITES.ADD(houseId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error adding house ${houseId} to favorites:`, error);
      // Fallback to dummy response for development
      await delay(400);
      console.log(`Adding house ${houseId} to favorites`);
      return { success: true };
    }
  }

  async removeFromFavorites(houseId: string): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem('token'); // Get the user token
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.USER.FAVORITES.REMOVE(houseId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error removing house ${houseId} from favorites:`, error);
      // Fallback to dummy response for development
      await delay(400);
      console.log(`Removing house ${houseId} from favorites`);
      return { success: true };
    }
  }

  // Search and recommendations
  async searchHouses(query: string, filters?: Partial<SearchFilters>): Promise<House[]> {
    try {
      // Build URL with query parameters
      const url = new URL(`${BASE_URL}/api/v1/houses/search`);
      url.searchParams.append('query', query);
      
      // Add filters as query parameters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, String(v)));
            } else if (typeof value === 'object') {
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (subValue !== undefined && subValue !== null) {
                  url.searchParams.append(`${key}.${subKey}`, String(subValue));
                }
              });
            } else {
              url.searchParams.append(key, String(value));
            }
          }
        });
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      // Process houses like in getHouses method
      return data.map((house: HouseResponse) => {
        // Create a proper House object with all required fields
        const processedHouse: House = {
          id: house._id || '',
          title: house.title || '',
          description: house.description || '',
          price: house.price || 0,
          type: house.type || 'bedsitter',
          images: Array.isArray(house.images)
            ? house.images.map((img: string) =>
                img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
              )
            : [],
          status: house.status || 'vacant',
          rating: house.rating || 0,
          safetyRating: house.safetyRating || 0,
          amenities: house.amenities || [],
          location: {
            estate: house.location?.estate || '',
            address: house.location?.address || '',
            coordinates: house.location?.coordinates || { lat: 0, lng: 0 },
            distanceFromUniversity: house.location?.distanceFromUniversity || { 
              walking: 0, 
              boda: 0, 
              matatu: 0 
            },
            nearbyEssentials: convertNearbyEssentials(house.location?.nearbyEssentials)
          },
          landlord: {
            id: house.landlord?._id || '',
            name: house.landlord?.name || '',
            phone: house.landlord?.phone || '',
            email: house.landlord?.email || '',
            verified: house.landlord?.verified || false,
            rating: house.landlord?.rating || 0
          },
          verification: {
            verified: house.verification?.verified || false,
            verifiedBy: house.verification?.verifiedBy || '',
            verifiedDate: house.verification?.verificationDate ? new Date(house.verification.verificationDate) : new Date()
          },
          reviews: Array.isArray(house.reviews)
            ? house.reviews.map(review => ({
                ...review,
                createdAt: new Date(review.createdAt || Date.now())
              }))
            : [],
          createdAt: new Date(house.createdAt || Date.now()),
          updatedAt: new Date(house.updatedAt || Date.now()),
        };
        
        return processedHouse;
      });
    } catch (error) {
      console.error('Error searching houses:', error);
      // Fallback to client-side filtering of dummy data for development
      await delay(600);
  throw error;
    }
  }

  async getAIRecommendations(preferences: UserPreferences | undefined = undefined): Promise<AIRecommendation[]> {
    try {
      // Create endpoint URL
      const url = new URL(API_ENDPOINTS.AI.RECOMMENDATIONS);
      
      // Add user preferences as query parameters if provided
      if (preferences) {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers,
          body: JSON.stringify({ preferences })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get AI recommendations');
        }
        
        return await response.json();
      } else {
        // If no preferences provided, get general recommendations
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error('Failed to get AI recommendations');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // Fallback to dummy data for development
      await delay(1000);
  console.log('Fetching AI recommendations failed');
  throw error;
    }
  }

  async submitAIFeedback(recommendationId: string, wasHelpful: boolean): Promise<{ success: boolean }> {
    try {
      // Create endpoint URL
      const url = API_ENDPOINTS.AI.FEEDBACK;
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          recommendationId, 
          wasHelpful 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit AI feedback');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error submitting feedback for recommendation ${recommendationId}:`, error);
      // Fallback to dummy response for development
      await delay(300);
      console.log(`Submitting feedback for recommendation ${recommendationId}: ${wasHelpful ? 'helpful' : 'not helpful'}`);
      return { success: true };
    }
  }

  // Data insights endpoints
  async getPriceTrends(): Promise<PriceTrend[]> {
    try {
      const response = await fetch(API_ENDPOINTS.INSIGHTS.PRICE_TRENDS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price trends');
      }
      
      const data = await response.json();
      
      // Convert API response to PriceTrend objects
      return Array.isArray(data) 
        ? data.map((trend: PriceTrendResponse) => ({
            estate: trend.estate,
            houseType: trend.houseType as HouseType, // Convert string to HouseType
            averagePrice: trend.averagePrice,
            trend: trend.trend,
            percentageChange: trend.percentageChange,
            period: trend.period
          }))
        : [];
    } catch (error) {
      console.error('Error fetching price trends:', error);
      // Fallback to calculating from existing houses if API fails
      return this.calculatePriceTrendsFromHouses();
    }
  }
  
  // Utility method to calculate price trends from existing houses when API fails
  private calculatePriceTrendsFromHouses(): Promise<PriceTrend[]> {
    // Get all houses from local state
    const { getHouses } = this;
    return getHouses()
      .then(houses => {
        // Group houses by estate and type
        const estateTypeGroups: Record<string, Record<string, typeof houses>> = {};
        
        houses.forEach(house => {
          const estate = house.location.estate;
          const type = house.type;
          
          if (!estateTypeGroups[estate]) {
            estateTypeGroups[estate] = {};
          }
          
          if (!estateTypeGroups[estate][type]) {
            estateTypeGroups[estate][type] = [];
          }
          
          estateTypeGroups[estate][type].push(house);
        });
        
        // Calculate average price for each estate and type combination
        const priceTrends: PriceTrend[] = [];
        
        Object.entries(estateTypeGroups).forEach(([estate, typeGroups]) => {
          Object.entries(typeGroups).forEach(([type, houses]) => {
            if (houses.length >= 2) { // Ensure we have enough data
              const totalPrice = houses.reduce((sum, house) => sum + house.price, 0);
              const averagePrice = Math.round(totalPrice / houses.length);
              
              // Calculate a simulated price trend (in real system this would compare with historical data)
              // For now, we'll generate random trends
              const trends = ['up', 'down', 'stable'] as const;
              const randomTrend = trends[Math.floor(Math.random() * trends.length)];
              const percentageChange = randomTrend === 'stable' 
                ? 0.5 
                : randomTrend === 'up' 
                  ? Math.random() * 5 + 1  // 1-6%
                  : -(Math.random() * 5 + 1); // -1 to -6%
              
              priceTrends.push({
                estate,
                houseType: type as HouseType,
                averagePrice,
                trend: randomTrend,
                percentageChange: Math.round(percentageChange * 10) / 10,
                period: 'Last 3 months'
              });
            }
          });
        });
        
        // Sort by estate and return top 5
        return priceTrends
          .sort((a, b) => a.estate.localeCompare(b.estate))
          .slice(0, 5);
      })
      .catch(error => {
        console.error('Error calculating price trends:', error);
    throw error;
      });
  }

  async getPopularEstates() {
    try {
      const response = await fetch(API_ENDPOINTS.INSIGHTS.POPULAR_ESTATES);
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular estates');
      }
      
      const data = await response.json();
      
      // Process API response to include popularity percentage if not provided
      return Array.isArray(data)
        ? data.map((estate: PopularEstateResponse, index, arr) => ({
            name: estate.name,
            averageRent: estate.averageRent,
            houses: estate.houses,
            // If popularity is provided use it, otherwise calculate based on house count
            popularity: estate.popularity ?? Math.min(100, 60 + (index * (40 / Math.max(1, arr.length - 1))))
          }))
        : [];
    } catch (error) {
      console.error('Error fetching popular estates:', error);
      // Fallback to calculating from existing houses if API fails
      return this.calculatePopularEstatesFromHouses();
    }
  }
  
  // Utility method to calculate popular estates from existing houses when API fails
  private calculatePopularEstatesFromHouses() {
    // Get all houses from local state
    const { getHouses } = this;
    return getHouses()
      .then(houses => {
        // Group houses by estate
        const estateGroups: Record<string, typeof houses> = {};
        
        houses.forEach(house => {
          const estate = house.location.estate;
          if (!estateGroups[estate]) {
            estateGroups[estate] = [];
          }
          estateGroups[estate].push(house);
        });
        
        // Calculate average rent and count for each estate
        const estatesData = Object.entries(estateGroups).map(([name, houses]) => {
          const totalRent = houses.reduce((sum, house) => sum + house.price, 0);
          const averageRent = Math.round(totalRent / houses.length);
          
          return {
            name,
            houses: houses.length,
            averageRent
          };
        });
        
        // Sort by house count (popularity)
        const sortedEstates = estatesData.sort((a, b) => b.houses - a.houses);
        
        // Take top 5 and add popularity percentage
        return sortedEstates.slice(0, 5).map((estate, index, arr) => ({
          ...estate,
          popularity: Math.min(100, 60 + (index * (40 / Math.max(1, arr.length - 1))))
        }));
      })
      .catch(error => {
        console.error('Error calculating popular estates:', error);
  throw error;
      });
  }

  async getTrendingSearches() {
    try {
      const response = await fetch(API_ENDPOINTS.INSIGHTS.TRENDING_SEARCHES);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending searches');
      }
      
      return await response.json();
  } catch (error) { console.error('Error fetching trending searches:', error); throw error; }
  }

  // Safety and notifications
  async getSafetyAlerts(): Promise<SafetyAlert[]> { throw new Error('getSafetyAlerts not implemented'); }

  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATION.GET_ALL);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      return Array.isArray(data)
        ? data.map((n: NotificationResponse) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            createdAt: new Date(n.createdAt),
            updatedAt: new Date(n.updatedAt),
          }))
        : [];
    } catch (error) {
      console.error('Error fetching notifications:', error); throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATION.UPDATE(notificationId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return { success: true };
  } catch (error) { console.error('Error marking notification as read:', error); throw error; }
  }


  // Reviews endpoints
  async getRecentReviews() {
    const res = await fetch(API_ENDPOINTS.REVIEW.GET_RECENT);
    if (!res.ok) throw new Error('Failed to fetch recent reviews');
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((r: ReviewResponse) => ({ ...r, createdAt: new Date(r.createdAt) }))
      : [];
  }
  
  async getTopReviews() {
    try {
      const res = await fetch(API_ENDPOINTS.REVIEW.GET_TOP);
      if (!res.ok) throw new Error('Failed to fetch top reviews');
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      // Backend may now return AI recommendation payload without detailed reviews.
      interface NewAIRecReviewDTO { _id?: string; id?: string; houseId?: string; userName: string; rating: number; comment: string; createdAt: string | Date; }
      interface NewAIRecHouseDTO { _id: string; id?: string; title?: string; price: number; location?: { estate?: string; address?: string }; images?: string[]; reviews?: NewAIRecReviewDTO[] }
      interface NewAIRecDTO { houseId?: string; aiRecommendation?: string; house?: NewAIRecHouseDTO; totalReviews?: number; recommended?: boolean; reviews?: NewAIRecReviewDTO[] }
      return (data as NewAIRecDTO[])
        .map((item) => {
        // New payload shape detection: has aiRecommendation + house object
        if (item.aiRecommendation && item.house) {
          const houseData = item.house;
          return {
            houseId: item.houseId || houseData._id,
            totalReviews: houseData.reviews ? houseData.reviews.length : 0,
            recommended: true, // Treat all AI recommendations as recommended
            aiRecommendation: item.aiRecommendation,
            reviews: Array.isArray(houseData.reviews)
              ? houseData.reviews.map((review) => ({
                  id: review._id || review.id || '',
                  houseId: review.houseId || houseData._id,
                  userName: review.userName,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: new Date(review.createdAt)
                }))
              : [],
            house: {
              id: houseData._id,
              title: houseData.title,
              price: houseData.price,
              location: {
                estate: houseData.location?.estate || '',
                address: houseData.location?.address || ''
              },
              images: Array.isArray(houseData.images) ? houseData.images : []
            }
          };
        }
  // Fallback to old payload structure (TopReviewResponse)
        return {
          houseId: item.houseId,
            totalReviews: item.totalReviews,
            recommended: item.recommended,
            reviews: Array.isArray(item.reviews) ? item.reviews.map((review) => ({
              id: review._id || '',
              houseId: review.houseId!,
              userName: review.userName,
              rating: review.rating,
              comment: review.comment,
              createdAt: new Date(review.createdAt)
            })) : [],
        };
  })
  .filter(entry => entry && entry.house ? entry.house.title : true); // drop malformed new-shape entries lacking title
    } catch (error) {
      console.error('Error fetching top reviews:', error);
      return [];
    }
  }
    
  async getAllReviews() {
    try {
      const res = await fetch(`${API_ENDPOINTS.REVIEW.GET_RECENT}?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch all reviews');
      const data = await res.json();
      return Array.isArray(data)
        ? data.map((r: ReviewResponse) => ({ ...r, createdAt: new Date(r.createdAt) }))
        : [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  }
    
  async getReviewsByHouseId(houseId: string) {
    const res = await fetch(API_ENDPOINTS.REVIEW.GET_BY_HOUSE(houseId));
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const data = await res.json();
    return Array.isArray(data)
      ? data.map((r: ReviewResponse) => ({ ...r, createdAt: new Date(r.createdAt) }))
      : [];
  }

  async submitReview(houseId: string, review: {
    userName: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean }> {
    const res = await fetch(API_ENDPOINTS.REVIEW.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        houseId,
        ...review,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return { success: true };
  }

  // Contact and inquiries
  async contactLandlord(houseId: string, message: string): Promise<{ success: boolean; houseId: string }> {
    try {
      // Check if the user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Create the endpoint
      const endpoint = `${BASE_URL}/api/v1/houses/${houseId}/contact`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to contact landlord');
      }
      
      return { success: true, houseId };
    } catch (error) {
      console.error(`Error contacting landlord for house ${houseId}:`, error);
      // Fallback to dummy response for development
      await delay(600);
      console.log(`Contacting landlord for house ${houseId} with message: ${message}`);
      return { success: true, houseId };
    }
  }

  // Utility methods for filtering (remove when real API is implemented)
  private filterHouses(houses: House[], filters?: Partial<SearchFilters>): House[] {
    if (!filters) return houses;

    return houses.filter(house => {
      if (filters.priceRange && (house.price < filters.priceRange[0] || house.price > filters.priceRange[1])) {
        return false;
      }
      if (filters.houseTypes && filters.houseTypes.length > 0 && !filters.houseTypes.includes(house.type as HouseType)) {
        return false;
      }
      if (filters.minRating && house.rating && house.rating < filters.minRating) {
        return false;
      }
      if (filters.safetyRating && house.safetyRating < filters.safetyRating) {
        return false;
      }
      if (typeof filters.verified === 'boolean') {
        if (filters.verified && !house.verification.verified) {
          return false;
        }
        // If filters.verified is false, do not filter out unverified houses
      }
      if (filters.estate && filters.estate.length > 0 && !filters.estate.includes(house.location.estate)) {
        return false;
      }
      if (filters.amenities && filters.amenities.length > 0) {
        const houseAmenities = house.amenities.filter(a => a.available).map(a => a.name);
        if (!filters.amenities.every(amenity => houseAmenities.includes(amenity))) {
          return false;
        }
      }
      return true;
    });
  }
}

export const apiService = new ApiService();