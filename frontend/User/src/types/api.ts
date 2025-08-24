export interface ForumPostResponse {
  _id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  timestamp: string;
  replies?: ForumReplyResponse[];
  likes?: string[];
}

export interface ForumReplyResponse {
  _id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface HouseResponse {
  _id: string;
  title: string;
  description: string;
  price: number;
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
    nearbyEssentials: Array<{
      type: string;
      name: string;
      distance: number;
    }>;
  };
  images: string[];
  amenities: Array<{
    name: string;
    available: boolean;
    icon: string;
  }>;
  landlord: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
    verified?: boolean;
    rating?: number;
  };
  status: 'vacant' | 'occupied';
  rating: number;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    helpful: number;
  }>;
  reviewCount?: number;
  verification?: {
    verified: boolean;
    verifiedBy?: string;
    verificationDate?: string;
    verifiedDate?: string;
    badges: string[];
  };
  safetyRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  _id: string;
  houseId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NotificationResponse {
  _id: string;
  type: 'new-listing' | 'price-drop' | 'vacancy-alert' | 'safety-alert' | 'recommendation';
  title: string;
  message: string;
  houseId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopularEstateResponse {
  name: string;
  houses: number;
  averageRent: number;
  popularity?: number;
}

export interface PriceTrendResponse {
  estate: string;
  houseType: string;
  averagePrice: number;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
}

export interface TopReviewResponse {
  houseId: string;
  totalReviews: number;
  recommended: boolean;
  reviews: {
    _id: string;
    houseId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    __v: number;
  }[];
}