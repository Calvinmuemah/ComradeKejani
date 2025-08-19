import { House, PriceTrend, SafetyAlert, Notification, AIRecommendation } from '../types';

// Dummy data for development - Replace with real API calls when backend is ready
// Helper to ensure every house has at least one image
// (for real data, this would be handled by backend validation)
// If images array is empty, add a placeholder
export const dummyHouses: House[] = [
  {
    id: '1',
    title: 'Modern Bedsitter in Amalemba',
    price: 8000,
    type: 'bedsitter',
    location: {
      estate: 'Amalemba',
      address: 'Plot 15, Amalemba Estate',
      coordinates: { lat: 0.6667, lng: 34.7667 },
      distanceFromUniversity: { walking: 15, boda: 5, matatu: 10 },
      nearbyEssentials: [
        { type: 'shop', name: 'Amalemba Supermarket', distance: 200 },
        { type: 'market', name: 'Amalemba Market', distance: 500 },
        { type: 'hospital', name: 'Kakamega County Hospital', distance: 2000 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'WiFi', available: true, icon: 'wifi' },
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Furnished', available: true, icon: 'home' },
      { name: 'Security', available: true, icon: 'shield' },
    ],
    landlord: {
      name: 'John Maina',
      phone: '+254712345678',
      email: 'john.maina@example.com',
      verified: true,
      rating: 4.5,
    },
    status: 'vacant',
    rating: 4.2,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah K.',
        rating: 4,
        comment: 'Great location, close to university. WiFi is reliable.',
        createdAt: new Date('2024-01-15'),
        helpful: 12,
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike O.',
        rating: 5,
        comment: 'Excellent landlord, very responsive. Highly recommended!',
        createdAt: new Date('2024-01-10'),
        helpful: 8,
      },
    ],
    verification: {
      verified: true,
      verifiedBy: 'Admin',
      verificationDate: new Date('2024-01-01'),
      badges: ['verified-landlord', 'photo-verified', 'price-verified'],
    },
    safetyRating: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    title: 'Luxury 2BR Apartment in Amalemba',
    price: 25000,
    type: '2BR',
    location: {
      estate: 'Amalemba',
      address: 'Palm Heights, Amalemba',
      coordinates: { lat: 0.6670, lng: 34.7690 },
      distanceFromUniversity: { walking: 18, boda: 7, matatu: 12 },
      nearbyEssentials: [
        { type: 'shop', name: 'Palm Mini Mart', distance: 150 },
        { type: 'restaurant', name: 'Palm Dine', distance: 100 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'WiFi', available: true, icon: 'wifi' },
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Parking', available: true, icon: 'car' },
      { name: 'Furnished', available: true, icon: 'home' },
    ],
    landlord: {
      name: 'Alice Njeri',
      phone: '+254701234567',
      email: 'alice.njeri@example.com',
      verified: true,
      rating: 4.9,
    },
    status: 'vacant',
    rating: 4.8,
    reviews: [
      {
        id: '5',
        userId: 'user5',
        userName: 'Brian O.',
        rating: 5,
        comment: 'Spacious, modern, and very secure. Worth every shilling!',
        createdAt: new Date('2024-02-01'),
        helpful: 10,
      },
    ],
    verification: {
      verified: true,
      verifiedBy: 'Admin',
      verificationDate: new Date('2024-02-01'),
      badges: ['verified-landlord', 'photo-verified', 'safety-checked'],
    },
    safetyRating: 5,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '6',
    title: 'Budget Bedsitter in Maraba',
    price: 6500,
    type: 'bedsitter',
    location: {
      estate: 'Maraba',
      address: 'Maraba Lane 3',
      coordinates: { lat: 0.6640, lng: 34.7640 },
      distanceFromUniversity: { walking: 30, boda: 12, matatu: 18 },
      nearbyEssentials: [
        { type: 'market', name: 'Maraba Market', distance: 300 },
        { type: 'atm', name: 'Equity ATM', distance: 200 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Security', available: true, icon: 'shield' },
    ],
    landlord: {
      name: 'Peter Otieno',
      phone: '+254799999999',
      verified: false,
      rating: 3.5,
    },
    status: 'vacant',
    rating: 3.7,
    reviews: [],
    verification: {
      verified: false,
      badges: [],
    },
    safetyRating: 3,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '2',
    title: 'Spacious Single Room in Kefinco',
    price: 12000,
    type: 'single',
    location: {
      estate: 'Kefinco',
      address: 'Block C, Kefinco Estate',
      coordinates: { lat: 0.6700, lng: 34.7700 },
      distanceFromUniversity: { walking: 20, boda: 8, matatu: 12 },
      nearbyEssentials: [
        { type: 'shop', name: 'Kefinco Mall', distance: 300 },
        { type: 'atm', name: 'KCB ATM', distance: 150 },
        { type: 'restaurant', name: 'Student Café', distance: 100 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'WiFi', available: true, icon: 'wifi' },
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Furnished', available: false, icon: 'home' },
      { name: 'Parking', available: true, icon: 'car' },
    ],
    landlord: {
      name: 'Grace Wanjiku',
      phone: '+254798765432',
      verified: true,
      rating: 4.8,
    },
    status: 'vacant',
    rating: 4.6,
    reviews: [
      {
        id: '3',
        userId: 'user3',
        userName: 'Peter M.',
        rating: 5,
        comment: 'Spacious and well-maintained. Great value for money.',
        createdAt: new Date('2024-01-20'),
        helpful: 15,
      },
    ],
    verification: {
      verified: true,
      verifiedBy: 'Admin',
      verificationDate: new Date('2024-01-05'),
      badges: ['verified-landlord', 'photo-verified'],
    },
    safetyRating: 5,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'Affordable 1BR in Maraba',
    price: 15000,
    type: '1BR',
    location: {
      estate: 'Maraba',
      address: 'Maraba Estate, Behind Shell Station',
      coordinates: { lat: 0.6650, lng: 34.7650 },
      distanceFromUniversity: { walking: 25, boda: 10, matatu: 15 },
      nearbyEssentials: [
        { type: 'market', name: 'Maraba Market', distance: 400 },
        { type: 'hospital', name: 'Maraba Clinic', distance: 600 },
        { type: 'police', name: 'Maraba Police Post', distance: 800 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'WiFi', available: false, icon: 'wifi' },
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Furnished', available: true, icon: 'home' },
    ],
    landlord: {
      name: 'David Kimani',
      phone: '+254723456789',
      verified: false,
      rating: 3.8,
    },
    status: 'occupied',
    rating: 3.9,
    reviews: [
      {
        id: '4',
        userId: 'user4',
        userName: 'Ann W.',
        rating: 4,
        comment: 'Good space but WiFi is not available. Otherwise comfortable.',
        createdAt: new Date('2024-01-18'),
        helpful: 6,
      },
    ],
    verification: {
      verified: false,
      badges: ['photo-verified'],
    },
    safetyRating: 3,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    title: 'Modern Hostel Room',
    price: 6000,
    type: 'hostel',
    location: {
      estate: 'University Area',
      address: 'MMUST Hostels, Block A',
      coordinates: { lat: 0.6680, lng: 34.7680 },
      distanceFromUniversity: { walking: 5, boda: 2, matatu: 5 },
      nearbyEssentials: [
        { type: 'shop', name: 'Campus Shop', distance: 100 },
        { type: 'restaurant', name: 'Cafeteria', distance: 50 },
      ],
    },
    images: [
      'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    amenities: [
      { name: 'WiFi', available: true, icon: 'wifi' },
      { name: 'Water', available: true, icon: 'droplets' },
      { name: 'Electricity', available: true, icon: 'zap' },
      { name: 'Security', available: true, icon: 'shield' },
      { name: 'Laundry', available: true, icon: 'shirt' },
    ],
    landlord: {
      name: 'MMUST Administration',
      phone: '+254733456789',
      verified: true,
      rating: 4.0,
    },
    status: 'vacant',
    rating: 4.0,
    reviews: [],
    verification: {
      verified: true,
      verifiedBy: 'University',
      verificationDate: new Date('2024-01-01'),
      badges: ['verified-landlord', 'safety-checked'],
    },
    safetyRating: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const dummyPriceTrends: PriceTrend[] = [
  {
    estate: 'Amalemba',
    houseType: 'bedsitter',
    averagePrice: 8500,
    trend: 'up',
    percentageChange: 5.2,
    period: 'Last 3 months',
  },
  {
    estate: 'Kefinco',
    houseType: 'single',
    averagePrice: 11800,
    trend: 'stable',
    percentageChange: 0.5,
    period: 'Last 3 months',
  },
  {
    estate: 'Maraba',
    houseType: '1BR',
    averagePrice: 14200,
    trend: 'down',
    percentageChange: -3.1,
    period: 'Last 3 months',
  },
];

export const dummySafetyAlerts: SafetyAlert[] = [
  {
    id: '1',
    area: 'Maraba Estate',
    type: 'warning',
    message: 'Increased theft reports in the evening. Students advised to travel in groups after 8 PM.',
    timestamp: new Date('2024-01-20'),
    coordinates: { lat: 0.6650, lng: 34.7650 },
  },
  {
    id: '2',
    area: 'Amalemba',
    type: 'info',
    message: 'New police patrol unit deployed. Security improved.',
    timestamp: new Date('2024-01-15'),
  },
];

export const dummyNotifications: Notification[] = [
  {
    id: '1',
    type: 'new-listing',
    title: 'New Bedsitter Available!',
    message: 'A new bedsitter in Amalemba matching your preferences is now available.',
    houseId: '1',
    read: false,
    createdAt: new Date('2024-01-21'),
  },
  {
    id: '2',
    type: 'price-drop',
    title: 'Price Drop Alert!',
    message: 'The single room in Kefinco you favorited has dropped by KSh 1,000.',
    houseId: '2',
    read: false,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    type: 'safety-alert',
    title: 'Safety Update',
    message: 'New safety measures implemented in Maraba Estate.',
    read: true,
    createdAt: new Date('2024-01-19'),
  },
];

export const dummyAIRecommendations: AIRecommendation[] = [
  {
    houseId: '1',
    score: 0.92,
    reasons: [
      'Matches your budget range perfectly',
      'Close to university (15 min walk)',
      'Has all your required amenities',
      'High safety rating in your preferred area',
    ],
    confidence: 0.88,
  },
  {
    houseId: '4',
    score: 0.85,
    reasons: [
      'Most affordable option',
      'Shortest distance to university',
      'High security rating',
    ],
    confidence: 0.82,
  },
  {
    houseId: '2',
    score: 0.78,
    reasons: [
      'Spacious single room',
      'Popular estate among students',
      'Good landlord rating',
    ],
    confidence: 0.75,
  },
];

// Popular estates data
export const popularEstates = [
  { name: 'Amalemba', houses: 156, averageRent: 9200 },
  { name: 'Kefinco', houses: 89, averageRent: 12500 },
  { name: 'Maraba', houses: 67, averageRent: 13800 },
  { name: 'University Area', houses: 45, averageRent: 7500 },
];

// Trending searches
export const trendingSearches = [
  'Bedsitter Amalemba',
  'Single room with WiFi',
  'Furnished 1BR',
  'Hostel near university',
  'Budget under 10k',
];