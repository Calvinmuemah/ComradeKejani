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


// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    await delay(1000);
    // TODO: Replace with real authentication
    return { success: true, token: 'dummy-token', user: { id: '1', email: credentials.email } };
  }

  async register(_: { name: string; email: string; password: string; phone: string }) {
    await delay(1000);
    // TODO: Replace with real registration
    return { success: true, message: 'Registration successful' };
  }

  // House listings endpoints
  async getHouses(filters?: Partial<SearchFilters>): Promise<House[]> {
    // Use real backend endpoint
    const response = await fetch('https://comradekejani-k015.onrender.com/api/v1/houses/getAll');
    if (!response.ok) throw new Error('Failed to fetch houses');
    const data = await response.json();
    // Optionally filter client-side if filters are provided (backend does not support filters yet)
    let houses = data;
    if (filters) {
      houses = this.filterHouses(houses, filters);
    }
    // Map backend _id to id and landlord fields if needed
    const BASE_URL = 'https://comradekejani-k015.onrender.com';
    return houses.map((house: Record<string, unknown>) => ({
      ...house,
      id: (house as any)._id,
      images: Array.isArray((house as any).images)
        ? (house as any).images.map((img: string) =>
            img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
          )
        : [],
      landlord: {
        ...(house as any).landlord,
        name: (house as any).landlord?.name || '',
        phone: (house as any).landlord?.phone || '',
        email: (house as any).landlord?.email || '',
        verified: (house as any).landlord?.verified || false,
        rating: (house as any).landlord?.rating || 0,
      },
      verification: {
        verified: (house as any).landlord?.verified || false,
        badges: [],
      },
      createdAt: new Date((house as any).createdAt),
      updatedAt: new Date((house as any).updatedAt),
    }));
  }

  async getHouseById(id: string): Promise<House | null> {
    const response = await fetch(`https://comradekejani-k015.onrender.com/api/v1/houses/house/${id}`);
    if (!response.ok) throw new Error('Failed to fetch house');
    const house = await response.json();
    const BASE_URL = 'https://comradekejani-k015.onrender.com';
    return {
      ...house,
      id: house._id,
      images: Array.isArray(house.images)
        ? house.images.map((img: string) =>
            img.startsWith('/uploads/') ? `${BASE_URL}${img}` : img
          )
        : [],
      landlord: {
        ...house.landlord,
        name: house.landlord?.name || '',
        phone: house.landlord?.phone || '',
        email: house.landlord?.email || '',
        verified: house.landlord?.verified || false,
        rating: house.landlord?.rating || 0,
      },
      verification: {
        verified: house.landlord?.verified || false,
        badges: [],
      },
      createdAt: new Date(house.createdAt),
      updatedAt: new Date(house.updatedAt),
    };
  }

  async getFavorites(): Promise<House[]> {
    await delay(600);
    // TODO: Replace with real API call
    return dummyHouses.slice(0, 2); // Mock favorites
  }

  async addToFavorites(_: string): Promise<{ success: boolean }> {
    await delay(400);
    // TODO: Replace with real API call
    return { success: true };
  }

  async removeFromFavorites(_: string): Promise<{ success: boolean }> {
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

  async getAIRecommendations(_: UserPreferences | undefined = undefined): Promise<AIRecommendation[]> {
    await delay(1000);
    // TODO: Replace with real AI API
    return dummyAIRecommendations;
  }

  async submitAIFeedback(_: string, __: boolean): Promise<{ success: boolean }> {
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

  async markNotificationAsRead(_: string): Promise<{ success: boolean }> {
    await delay(300);
    // TODO: Replace with real API call
    return { success: true };
  }


  // Reviews endpoints
  async getReviewsByHouseId(houseId: string) {
    const res = await fetch(`https://comradekejani-k015.onrender.com/api/v1/reviews/house/${houseId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const data = await res.json();
    return Array.isArray(data)
      ? data.map(r => ({ ...r, createdAt: new Date(r.createdAt) }))
      : [];
  }

  async submitReview(houseId: string, review: {
    userName: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean }> {
    const res = await fetch('https://comradekejani-k015.onrender.com/api/v1/reviews/create', {
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
  async contactLandlord(houseId: string, _: string): Promise<{ success: boolean; houseId: string }> {
    await delay(600);
    // TODO: Replace with real API call
    return { success: true, houseId };
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