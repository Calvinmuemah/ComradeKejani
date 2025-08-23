// Forum types
export interface ForumReply {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

export interface ForumPost {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  timestamp: Date;
  replies: ForumReply[];
  likes: string[]; // userIds who liked
}
// Core type definitions for the application

export interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  type: string;
  location: {
    estate: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    distanceFromUniversity: {
      walking: number;
      boda: number;
      matatu: number;
    };
  };
  amenities: {
    name: string;
    icon: string;
    available: boolean;
  }[];
  landlord: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    rating: number;
    verified: boolean;
  };
  status: 'vacant' | 'occupied';
  verification: {
    verified: boolean;
    verifiedBy: string;
    verifiedDate: Date;
  };
  safetyRating: number;
  reviews?: {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    helpful: number;
  }[];
  reviewCount?: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  estate: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceFromUniversity: {
    walking: number; // in minutes
    boda: number; // in minutes
    matatu: number; // in minutes
  };
  nearbyEssentials: NearbyPlace[];
}

export interface NearbyPlace {
  type: 'shop' | 'market' | 'hospital' | 'police' | 'atm' | 'restaurant';
  name: string;
  distance: number; // in meters
}

export type HouseType = 'bedsitter' | 'single' | '1BR' | 'hostel' | '2BR' | '3BR';

export interface Amenity {
  name: string;
  available: boolean;
  icon: string;
}

export interface Landlord {
  name: string;
  phone: string;
  email?: string;
  verified: boolean;
  rating: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

export interface VerificationStatus {
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
  badges: VerificationBadge[];
}

export type VerificationBadge = 'verified-landlord' | 'photo-verified' | 'price-verified' | 'safety-checked';

export interface SearchFilters {
  priceRange: [number, number];
  houseTypes: HouseType[];
  maxDistance: number; // from university in minutes
  amenities: string[];
  minRating: number;
  safetyRating: number;
  verified: boolean;
  estate: string[];
}

export interface AIRecommendation {
  houseId: string;
  score: number;
  reasons: string[];
  confidence: number;
}

export interface UserPreferences {
  budget: [number, number];
  preferredEstates: string[];
  requiredAmenities: string[];
  maxDistance: number;
  browsingHistory: string[];
}

export interface Notification {
  id: string;
  type: 'new-listing' | 'price-drop' | 'vacancy-alert' | 'safety-alert' | 'recommendation';
  title: string;
  message: string;
  houseId?: string;
  read: boolean;
  createdAt: Date;
}

export interface PriceTrend {
  estate: string;
  houseType: HouseType;
  averagePrice: number;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
}

export interface SafetyAlert {
  id: string;
  area: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: Date;
  coordinates?: {
    lat: number;
    lng: number;
  };
}