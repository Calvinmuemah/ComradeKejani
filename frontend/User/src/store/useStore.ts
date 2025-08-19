import { create } from 'zustand';
import { House, SearchFilters, Notification, UserPreferences, AIRecommendation } from '../types';
import { apiService } from '../services/api';

interface AppState {
  // Houses state
  houses: House[];
  loading: boolean;
  error: string | null;
  currentHouse: House | null;
  favorites: House[];
  
  // Search state
  searchFilters: SearchFilters;
  searchQuery: string;
  searchResults: House[];
  
  // AI Recommendations
  aiRecommendations: AIRecommendation[];
  userPreferences: UserPreferences | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  darkMode: boolean;
  sidebarOpen: boolean;
  compareList: House[];
  
  // Actions
  fetchHouses: () => Promise<void>;
  fetchHouseById: (id: string) => Promise<void>;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setSearchQuery: (query: string) => void;
  searchHouses: () => Promise<void>;
  addToFavorites: (house: House) => Promise<void>;
  removeFromFavorites: (houseId: string) => Promise<void>;
  addToCompare: (house: House) => void;
  removeFromCompare: (houseId: string) => void;
  clearCompare: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  fetchAIRecommendations: () => Promise<void>;
  setUserPreferences: (preferences: UserPreferences) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const initialSearchFilters: SearchFilters = {
  priceRange: [0, 50000],
  houseTypes: [],
  maxDistance: 30,
  amenities: [],
  minRating: 0,
  safetyRating: 0,
  verified: false,
  estate: [],
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  houses: [],
  loading: false,
  error: null,
  currentHouse: null,
  favorites: [],
  searchFilters: initialSearchFilters,
  searchQuery: '',
  searchResults: [],
  aiRecommendations: [],
  userPreferences: null,
  notifications: [],
  unreadCount: 0,
  darkMode: true,
  sidebarOpen: false,
  compareList: [],

  // Actions
  fetchHouses: async () => {
    set({ loading: true, error: null });
    try {
      const houses = await apiService.getHouses(get().searchFilters);
      set({ houses, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch houses', loading: false });
    }
  },

  fetchHouseById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const house = await apiService.getHouseById(id);
      set({ currentHouse: house, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch house details', loading: false });
    }
  },

  setSearchFilters: (filters: Partial<SearchFilters>) => {
    set({ 
      searchFilters: { ...get().searchFilters, ...filters } 
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchHouses: async () => {
    set({ loading: true, error: null });
    try {
      const { searchQuery, searchFilters } = get();
      const results = await apiService.searchHouses(searchQuery, searchFilters);
      set({ searchResults: results, loading: false });
    } catch (error) {
      set({ error: 'Search failed', loading: false });
    }
  },

  addToFavorites: async (house: House) => {
    try {
      await apiService.addToFavorites(house.id);
      const currentFavorites = get().favorites;
      if (!currentFavorites.find(fav => fav.id === house.id)) {
        set({ favorites: [...currentFavorites, house] });
      }
    } catch (error) {
      set({ error: 'Failed to add to favorites' });
    }
  },

  removeFromFavorites: async (houseId: string) => {
    try {
      await apiService.removeFromFavorites(houseId);
      const currentFavorites = get().favorites;
      set({ favorites: currentFavorites.filter(fav => fav.id !== houseId) });
    } catch (error) {
      set({ error: 'Failed to remove from favorites' });
    }
  },

  addToCompare: (house: House) => {
    const currentCompare = get().compareList;
    if (currentCompare.length < 3 && !currentCompare.find(h => h.id === house.id)) {
      set({ compareList: [...currentCompare, house] });
    }
  },

  removeFromCompare: (houseId: string) => {
    const currentCompare = get().compareList;
    set({ compareList: currentCompare.filter(h => h.id !== houseId) });
  },

  clearCompare: () => {
    set({ compareList: [] });
  },

  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode });
  },

  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen });
  },

  fetchNotifications: async () => {
    try {
      const notifications = await apiService.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      set({ error: 'Failed to fetch notifications' });
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      set({ error: 'Failed to mark notification as read' });
    }
  },

  fetchAIRecommendations: async () => {
    try {
      const recommendations = await apiService.getAIRecommendations(get().userPreferences);
      set({ aiRecommendations: recommendations });
    } catch (error) {
      set({ error: 'Failed to fetch AI recommendations' });
    }
  },

  setUserPreferences: (preferences: UserPreferences) => {
    set({ userPreferences: preferences });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));