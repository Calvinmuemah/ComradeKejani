import { 
  House, 
  SearchFilters, 
  PriceTrend, 
  SafetyAlert, 
  Notification, 
  AIRecommendation,
  UserPreferences 
} from '../types';
import { 
  dummyHouses, 
  dummyPriceTrends, 
  dummySafetyAlerts, 
  dummyNotifications,
  dummyAIRecommendations,
  popularEstates,
  trendingSearches
} from '../data/dummyData';

// API Service - Centralized API calls
// Replace dummy data with real API endpoints when backend is ready

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    await delay(1000);
    // TODO: Replace with real authentication
    return { success: true, token: 'dummy-token', user: { id: '1', email: credentials.email } };
  }

  async register(userData: { name: string; email: string; password: string; phone: string }) {
    await delay(1000);
    // TODO: Replace with real registration
    return { success: true, message: 'Registration successful' };
  }

  // House listings endpoints
  async getHouses(filters?: Partial<SearchFilters>): Promise<House[]> {
    await delay(800);
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/houses`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(filters)
    // });
    // return response.json();
    
    return this.filterHouses(dummyHouses, filters);
  }

  async getHouseById(id: string): Promise<House | null> {
    await delay(500);
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/houses/${id}`);
    // return response.json();
    
    return dummyHouses.find(house => house.id === id) || null;
  }

  async getFavorites(): Promise<House[]> {
    await delay(600);
    // TODO: Replace with real API call
    return dummyHouses.slice(0, 2); // Mock favorites
  }

  async addToFavorites(houseId: string): Promise<{ success: boolean }> {
    await delay(400);
    // TODO: Replace with real API call
    return { success: true };
  }

  async removeFromFavorites(houseId: string): Promise<{ success: boolean }> {
    await delay(400);
    // TODO: Replace with real API call
    return { success: true };
  }

  // Search and recommendations
  async searchHouses(query: string, filters?: Partial<SearchFilters>): Promise<House[]> {
    await delay(600);
    // TODO: Replace with real search API
    const filtered = this.filterHouses(dummyHouses, filters);
    return filtered.filter(house => 
      house.title.toLowerCase().includes(query.toLowerCase()) ||
      house.location.estate.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAIRecommendations(preferences?: UserPreferences): Promise<AIRecommendation[]> {
    await delay(1000);
    // TODO: Replace with real AI API
    return dummyAIRecommendations;
  }

  async submitAIFeedback(recommendationId: string, helpful: boolean): Promise<{ success: boolean }> {
    await delay(300);
    // TODO: Replace with real API call
    return { success: true };
  }

  // Data insights endpoints
  async getPriceTrends(): Promise<PriceTrend[]> {
    await delay(700);
    // TODO: Replace with real API call
    return dummyPriceTrends;
  }

  async getPopularEstates() {
    await delay(500);
    // TODO: Replace with real API call
    return popularEstates;
  }

  async getTrendingSearches() {
    await delay(400);
    // TODO: Replace with real API call
    return trendingSearches;
  }

  // Safety and notifications
  async getSafetyAlerts(): Promise<SafetyAlert[]> {
    await delay(600);
    // TODO: Replace with real API call
    return dummySafetyAlerts;
  }

  async getNotifications(): Promise<Notification[]> {
    await delay(500);
    // TODO: Replace with real API call
    return dummyNotifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    await delay(300);
    // TODO: Replace with real API call
    return { success: true };
  }

  // Reviews endpoints
  async submitReview(houseId: string, review: {
    rating: number;
    comment: string;
  }): Promise<{ success: boolean }> {
    await delay(800);
    // TODO: Replace with real API call
    return { success: true };
  }

  // Contact and inquiries
  async contactLandlord(houseId: string, message: string): Promise<{ success: boolean }> {
    await delay(600);
    // TODO: Replace with real API call
    return { success: true };
  }

  // Utility methods for filtering (remove when real API is implemented)
  private filterHouses(houses: House[], filters?: Partial<SearchFilters>): House[] {
    if (!filters) return houses;

    return houses.filter(house => {
      if (filters.priceRange && (house.price < filters.priceRange[0] || house.price > filters.priceRange[1])) {
        return false;
      }
      if (filters.houseTypes && filters.houseTypes.length > 0 && !filters.houseTypes.includes(house.type)) {
        return false;
      }
      if (filters.minRating && house.rating < filters.minRating) {
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