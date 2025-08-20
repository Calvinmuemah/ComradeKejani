
// --- Data Models ---

// House model
type Amenity = {
  name: string;
  available: boolean;
  icon: string;
};

type NearbyEssential = {
  type: string; // e.g., 'shop', 'market', 'hospital', etc.
  name: string;
  distance: number; // in meters
};

type DistanceFromUniversity = {
  walking: number; // in minutes
  boda: number; // in minutes
  matatu: number; // in minutes
};

type Coordinates = {
  lat: number;
  lng: number;
};

type Location = {
  estate: string;
  address: string;
  coordinates: Coordinates;
  distanceFromUniversity: DistanceFromUniversity;
  nearbyEssentials: NearbyEssential[];
};

type Landlord = {
  name: string;
  phone: string;
  email?: string;
  verified: boolean;
  rating: number;
};

type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
};

type Verification = {
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
  badges: string[];
};

type House = {
  id: string;
  title: string;
  price: number;
  type: string; // bedsitter, single, 1BR, 2BR, hostel
  location: Location;
  images: string[];
  amenities: Amenity[];
  landlord: Landlord;
  status: 'vacant' | 'occupied';
  rating: number;
  reviews: Review[];
  verification: Verification;
  safetyRating: number;
  createdAt: Date;
  updatedAt: Date;
};

// Price Trend model
type PriceTrend = {
  estate: string;
  houseType: string;
  averagePrice: number;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
};

// Safety Alert model
type SafetyAlert = {
  id: string;
  area: string;
  type: 'warning' | 'info';
  message: string;
  timestamp: Date;
  coordinates?: Coordinates;
};

// Notification model
type Notification = {
  id: string;
  type: 'new-listing' | 'price-drop' | 'safety-alert';
  title: string;
  message: string;
  houseId?: string;
  read: boolean;
  createdAt: Date;
};

// AI Recommendation model
type AIRecommendation = {
  houseId: string;
  score: number;
  reasons: string[];
  confidence: number;
};

// User Preferences model
type UserPreferences = {
  budget?: number;
  preferredEstates?: string[];
  requiredAmenities?: string[];
  minSafetyRating?: number;
  minLandlordRating?: number;
};





/*
POST /api/houses
{
  "title": "Modern Bedsitter in Amalemba",
  "price": 8000,
  "type": "bedsitter",
  "location": {
    "estate": "Amalemba",
    "address": "Plot 15, Amalemba Estate",
    "coordinates": { "lat": 0.6667, "lng": 34.7667 },
    "distanceFromUniversity": { "walking": 15, "boda": 5, "matatu": 10 },
    "nearbyEssentials": [
      { "type": "shop", "name": "Amalemba Supermarket", "distance": 200 },
      { "type": "market", "name": "Amalemba Market", "distance": 500 },
      { "type": "hospital", "name": "Kakamega County Hospital", "distance": 2000 }
    ]
  },
  "images": ["url1", "url2"],
  "amenities": [
    { "name": "WiFi", "available": true, "icon": "wifi" },
    { "name": "Water", "available": true, "icon": "droplets" }
  ],
  "landlord": {
    "name": "John Maina",
    "phone": "+254712345678",
    "email": "john.maina@example.com",
    "verified": true,
    "rating": 4.5
  },
  "status": "vacant",
  "rating": 4.2,
  "reviews": [],
  "verification": {
    "verified": true,
    "verifiedBy": "Admin",
    "verificationDate": "2024-01-01T00:00:00.000Z",
    "badges": ["verified-landlord", "photo-verified", "price-verified"]
  },
  "safetyRating": 4,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
*/
