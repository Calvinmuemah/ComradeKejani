import { House, SearchFilters, PriceTrend, SafetyAlert, Notification, AIRecommendation, UserPreferences, HouseType, NearbyPlace, PriceTrendsResponseData, PopularEstatesResponseData } from '../types';
import {
  ForumPostResponse,
  ForumReplyResponse,
  HouseResponse,
  ReviewResponse,
  NotificationResponse
} from '../types/api';

// Logger utility for API requests and responses
const APILogger = {
  // Enable/disable logging based on environment
  // You can set this to false in production by checking process.env.NODE_ENV
  enabled: import.meta.env.DEV, // Enabled in development, disabled in production
  
  // Log levels
  logLevel: {
    info: true,
    error: true,
    debug: true
  },
  
  /**
   * Logs API request details
   * @param category Category for grouping logs (e.g., 'ANALYTICS', 'AUTH')
   * @param message Log message
   * @param data Optional data to log
   */
  request(category: string, message: string, data?: unknown): void {
    if (!this.enabled || !this.logLevel.info) return;
    console.log(`📤 [${category}] ${message}`);
    if (data) console.log(`📦 [${category}] Request payload:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  },
  
  /**
   * Logs API success response
   * @param category Category for grouping logs
   * @param message Log message
   * @param status HTTP status code
   * @param responseTime Response time in ms
   * @param data Response data
   */
  success(category: string, message: string, status: number, responseTime: number, data?: unknown): void {
    if (!this.enabled || !this.logLevel.info) return;
    console.log(`✅ [${category}] ${message}. Status: ${status}. Response time: ${responseTime}ms`);
    if (data) console.log(`📥 [${category}] Response data:`, data);
  },
  
  /**
   * Logs API error response
   * @param category Category for grouping logs
   * @param message Error message
   * @param error Error object or message
   * @param status HTTP status code if available
   * @param responseTime Response time in ms if available
   */
  error(category: string, message: string, error: unknown, status?: number, responseTime?: number): void {
    if (!this.enabled || !this.logLevel.error) return;
    const statusInfo = status ? ` Status: ${status}.` : '';
    const timeInfo = responseTime ? ` Response time: ${responseTime}ms.` : '';
    console.error(`❌ [${category}] ${message}.${statusInfo}${timeInfo}`);
    console.error('Error details:', error);
  },
  
  /**
   * Simple debug logging utility
   * @param category Category for grouping logs
   * @param message Debug message
   * @param data Optional data to log
   */
  debug(category: string, message: string, data?: unknown): void {
    if (!this.enabled || !this.logLevel.debug) return;
    console.debug(`🔍 [${category}] ${message}`);
    if (data) console.debug(`Debug data:`, data);
  },
  
  /**
   * Formats and logs the structure of a response object (useful for development)
   * @param data The data to analyze and format
   * @param label Optional label for the logged output
   */
  formatResponseStructure(data: unknown, label = 'Response Structure'): void {
    if (!this.enabled || !this.logLevel.debug) return;
    
    const getType = (val: unknown): string => {
      if (val === null) return 'null';
      if (Array.isArray(val)) return `Array[${val.length}]`;
      if (typeof val === 'object') return 'Object';
      return typeof val;
    };
    
    const formatObject = (obj: Record<string, unknown>, depth = 0): Record<string, string> => {
      const result: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (value === null) {
          result[key] = 'null';
        } else if (Array.isArray(value)) {
          result[key] = `Array[${value.length}]`;
          if (value.length > 0 && depth < 2) {
            result[`${key}[0]`] = getType(value[0]);
            if (typeof value[0] === 'object' && value[0] !== null) {
              Object.entries(formatObject(value[0] as Record<string, unknown>, depth + 1))
                .forEach(([subKey, subValue]) => {
                  result[`${key}[0].${subKey}`] = subValue;
                });
            }
          }
        } else if (typeof value === 'object') {
          result[key] = 'Object';
          if (depth < 2) {
            Object.entries(formatObject(value as Record<string, unknown>, depth + 1))
              .forEach(([subKey, subValue]) => {
                result[`${key}.${subKey}`] = subValue;
              });
          }
        } else {
          result[key] = typeof value;
        }
      }
      
      return result;
    };
    
    try {
      console.group(`🔍 ${label}`);
      
      if (typeof data !== 'object' || data === null) {
        console.log(`Value: ${data} (${typeof data})`);
      } else if (Array.isArray(data)) {
        console.log(`Array with ${data.length} items`);
        if (data.length > 0) {
          console.log('First item structure:');
          console.table(formatObject(data[0] as Record<string, unknown>));
        }
      } else {
        console.table(formatObject(data as Record<string, unknown>));
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('Error formatting response structure:', error);
      console.log('Original data:', data);
    }
  }
};

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
const BASE_URL = 'https://comradekejani-k015.onrender.com';

// Network interceptor to log all API requests and responses
const fetchWithLogging = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Determine category based on URL
  const category = url.includes('/house-views') 
    ? 'HOUSE-VIEWS' 
    : url.includes('/landlord-views') 
      ? 'LANDLORD-VIEWS' 
      : url.includes('/users') 
        ? 'AUTH'
        : url.includes('/ai')
          ? 'AI'
          : 'API';
  
  const method = options.method || 'GET';
  const requestBody = options.body ? 
    (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : 
    undefined;
  
  // Log request details
  APILogger.request(category, `${method} ${url}`, requestBody);
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const responseTime = Math.round(performance.now() - startTime);
    
    // Clone response to avoid consuming it
    const clonedResponse = response.clone();
    
    try {
      // Try to parse as JSON, but handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await clonedResponse.json();
        
        // For successful responses with JSON data, also log the structure
        // This is helpful for development and debugging
        if (response.ok && import.meta.env.DEV) {
          APILogger.formatResponseStructure(
            responseData, 
            `${method} ${url.split('/').slice(-2).join('/')} Response Structure`
          );
        }
      } else {
        responseData = await clonedResponse.text();
        if (!responseData) responseData = '[No response body]';
      }
      
      if (response.ok) {
        APILogger.success(category, `${method} ${url} succeeded`, response.status, responseTime, responseData);
      } else {
        APILogger.error(
          category, 
          `${method} ${url} failed`, 
          responseData,
          response.status,
          responseTime
        );
      }
    } catch (error) {
      // Error parsing response
      APILogger.error(
        category, 
        `Error parsing ${method} ${url} response`, 
        error,
        response.status,
        responseTime
      );
    }
    
    return response;
  } catch (error) {
    // Network error
    const responseTime = Math.round(performance.now() - startTime);
    APILogger.error(category, `${method} ${url} network error`, error, undefined, responseTime);
    throw error;
  }
};

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
  
  // Analytics
  ANALYTICS: {
    HOUSE_VIEWS: {
      INCREMENT: `${BASE_URL}/api/v1/house-views/increment-view`,
      GET_BY_HOUSE: (houseId: string) => `${BASE_URL}/api/v1/house-views/${houseId}`,
      GET_ALL: `${BASE_URL}/api/v1/house-views`,
    },
    LANDLORD_VIEWS: {
      INCREMENT: `${BASE_URL}/api/v1/landlord-views/increment-view`,
      GET_BY_LANDLORD: (landlordId: string) => `${BASE_URL}/api/v1/landlord-views/${landlordId}`,
      GET_ALL: `${BASE_URL}/api/v1/landlord-views`,
    },
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
  async getPriceTrends(): Promise<PriceTrendsResponseData> {
    try {
      const response = await fetchWithLogging(API_ENDPOINTS.INSIGHTS.PRICE_TRENDS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If the endpoint returns 404, use fallback data instead of throwing an error
      if (response.status === 404) {
        APILogger.debug('INSIGHTS', 'Price trends endpoint returned 404, using fallback data');
        const fallbackData = await this.calculatePriceTrendsFromHouses();
        // Convert fallback data to the new response format
        return {
          priceTrends: fallbackData.map(trend => ({
            month: new Date().toISOString().slice(0, 7), // Format: YYYY-MM
            averagePrice: trend.averagePrice
          }))
        };
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price trends: ${response.status}`);
      }
      
      const data = await response.json();
      APILogger.debug('INSIGHTS', 'Received price trends data', data);
      
      return data;
    } catch (error) {
      APILogger.error('INSIGHTS', 'Error fetching price trends', error);
      // Fallback to calculating from existing houses if API fails
      const fallbackData = await this.calculatePriceTrendsFromHouses();
      // Convert fallback data to the new response format
      return {
        priceTrends: fallbackData.map(trend => ({
          month: new Date().toISOString().slice(0, 7), // Format: YYYY-MM
          averagePrice: trend.averagePrice
        }))
      };
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
        // Return default price trends if calculation fails
        return [
          {
            estate: 'Lurambi',
            houseType: 'bedsitter',
            averagePrice: 7500,
            trend: 'up',
            percentageChange: 3.2,
            period: 'Last 3 months'
          },
          {
            estate: 'Shirere',
            houseType: 'single',
            averagePrice: 6800,
            trend: 'up',
            percentageChange: 2.1,
            period: 'Last 3 months'
          },
          {
            estate: 'Kakamega CBD',
            houseType: 'bedsitter',
            averagePrice: 9500,
            trend: 'stable',
            percentageChange: 0.5,
            period: 'Last 3 months'
          },
          {
            estate: 'Milimani',
            houseType: 'single',
            averagePrice: 8200,
            trend: 'down',
            percentageChange: -1.3,
            period: 'Last 3 months'
          },
          {
            estate: 'Amalemba',
            houseType: 'bedsitter',
            averagePrice: 7000,
            trend: 'up',
            percentageChange: 4.2,
            period: 'Last 3 months'
          }
        ];
      });
  }

  async getPopularEstates(): Promise<PopularEstatesResponseData> {
    try {
      const response = await fetchWithLogging(API_ENDPOINTS.INSIGHTS.POPULAR_ESTATES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // If the endpoint returns 404, use fallback data instead of throwing an error
      if (response.status === 404) {
        APILogger.debug('INSIGHTS', 'Popular estates endpoint returned 404, using fallback data');
        const fallbackData = await this.calculatePopularEstatesFromHouses();
        // Convert fallback data to the new response format
        return {
          popularEstates: fallbackData.map(estate => ({
            estate: estate.name,
            views: Math.round(estate.popularity * 0.5), // Convert popularity to views
            houseTypes: ['bedsitter', 'single']
          }))
        };
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch popular estates: ${response.status}`);
      }
      
      const data = await response.json();
      APILogger.debug('INSIGHTS', 'Received popular estates data', data);
      
      return data;
    } catch (error) {
      APILogger.error('INSIGHTS', 'Error fetching popular estates', error);
      // Fallback to calculating from existing houses if API fails
      const fallbackData = await this.calculatePopularEstatesFromHouses();
      // Convert fallback data to the new response format
      return {
        popularEstates: fallbackData.map(estate => ({
          estate: estate.name,
          views: Math.round(estate.popularity * 0.5), // Convert popularity to views
          houseTypes: ['bedsitter', 'single']
        }))
      };
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
        // Return default data if calculation fails
        return [
          { name: 'Lurambi', houses: 28, averageRent: 8500, popularity: 100 },
          { name: 'Shirere', houses: 22, averageRent: 7800, popularity: 90 },
          { name: 'Kakamega CBD', houses: 17, averageRent: 10500, popularity: 80 },
          { name: 'Amalemba', houses: 15, averageRent: 6500, popularity: 70 },
          { name: 'Milimani', houses: 12, averageRent: 12000, popularity: 60 }
        ];
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

  // Analytics methods
  
  // Track house view
  async incrementHouseView(houseId: string): Promise<{ success: boolean; views?: number }> {
    try {
      const payload = { houseId };
      
      const res = await fetchWithLogging(API_ENDPOINTS.ANALYTICS.HOUSE_VIEWS.INCREMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to track house view: ${res.status} ${res.statusText}`);
      }
      
      return await res.json();
    } catch {
      // Error already logged by fetchWithLogging
      return { success: false };
    }
  }

  // Get house views
  async getHouseViews(houseId: string): Promise<{ total: number; monthly: number; weekly: number }> {
    try {
      const res = await fetchWithLogging(API_ENDPOINTS.ANALYTICS.HOUSE_VIEWS.GET_BY_HOUSE(houseId));
      
      if (!res.ok) {
        throw new Error(`Failed to get house views: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Map the actual API response to the expected format
      // The API returns { houseId: string, totalViews: number }
      return {
        total: data.totalViews || 0,
        // These fields aren't in the API response yet, so we'll estimate them
        // In a real app, you'd want the API to provide these values
        monthly: Math.round(data.totalViews * 0.7) || 0, // Assume ~70% of views are from this month
        weekly: Math.round(data.totalViews * 0.3) || 0,  // Assume ~30% of views are from this week
      };
    } catch {
      // Error already logged by fetchWithLogging
      return { total: 0, monthly: 0, weekly: 0 };
    }
  }

  // Track landlord view
  async incrementLandlordView(landlordId: string): Promise<{ success: boolean; views?: number }> {
    try {
      const payload = { landlordId };
      
      const res = await fetchWithLogging(API_ENDPOINTS.ANALYTICS.LANDLORD_VIEWS.INCREMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to track landlord view: ${res.status} ${res.statusText}`);
      }
      
      return await res.json();
    } catch {
      // Error already logged by fetchWithLogging
      return { success: false };
    }
  }

  // Get landlord views
  async getLandlordViews(landlordId: string): Promise<{ total: number; monthly: number; weekly: number }> {
    try {
      const res = await fetchWithLogging(API_ENDPOINTS.ANALYTICS.LANDLORD_VIEWS.GET_BY_LANDLORD(landlordId));
      
      if (!res.ok) {
        throw new Error(`Failed to get landlord views: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Map the actual API response to the expected format
      // The API likely returns { landlordId: string, totalViews: number }
      return {
        total: data.totalViews || 0,
        // These fields aren't in the API response yet, so we'll estimate them
        monthly: Math.round(data.totalViews * 0.7) || 0, // Assume ~70% of views are from this month
        weekly: Math.round(data.totalViews * 0.3) || 0,  // Assume ~30% of views are from this week
      };
    } catch {
      // Error already logged by fetchWithLogging
      return { total: 0, monthly: 0, weekly: 0 };
    }
  }

  // Get total active students looking for housing
  async getTotalActiveStudents(): Promise<number> {
    try {
      const res = await fetchWithLogging(API_ENDPOINTS.ANALYTICS.HOUSE_VIEWS.GET_ALL);
      
      if (!res.ok) {
        throw new Error(`Failed to get active students data: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Server returns { totalViews: number } based on your console logs
      return data.totalViews || 0;
    } catch {
      // Error already logged by fetchWithLogging
      return 0;
    }
  }
}

export const apiService = new ApiService();