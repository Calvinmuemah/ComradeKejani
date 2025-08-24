// Core Types for Comrade Kejani Admin System

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: Permission[];
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  // Only Super Admin exists - they have all permissions
}

export enum Permission {
  // Listings
  CREATE_LISTING = 'create_listing',
  EDIT_LISTING = 'edit_listing',
  DELETE_LISTING = 'delete_listing',
  PUBLISH_LISTING = 'publish_listing',
  BULK_IMPORT_LISTINGS = 'bulk_import_listings',
  BULK_EXPORT_LISTINGS = 'bulk_export_listings',
  // Landlords
  MANAGE_LANDLORDS = 'manage_landlords',
  // Safety
  MANAGE_SAFETY = 'manage_safety',
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  // System
  MANAGE_USERS = 'manage_users',
  SYSTEM_SETTINGS = 'system_settings'
}

// Listing Types
export interface Listing {
  id: string;
  _id?: string; // Adding MongoDB style ID for compatibility
  title: string;
  description: string;
  houseType: HouseType;
  status: ListingStatus;
  pricePerMonth: number;
  deposit?: number;
  currency: string;
  availability: AvailabilityStatus;
  unitsAvailable?: number;
  expectedVacancyDate?: string;
  
  // Location
  estateZone: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  distanceFromMMUST: number;
  walkingTime: number;
  bodaTime: number;
  matatuTime: number;
  
  // Backward compatibility fields
  location?: { estate?: string; };
  type?: string;
  price?: number;
  views?: number;
  
  // Media
  photos: Media[];
  videoUrl?: string;
  virtualTourUrl?: string;
  
  // Amenities & Features
  amenities: string[];
  verificationBadge: boolean;
  badgeType?: string;
  verifiedAt?: string;
  verifier?: string;
  
  // Safety & Quality
  securityRating: number;
  safetyNotes?: string;
  adminRiskFlags: string[];
  
  // Landlord
  landlordId: string;
  landlord?: Landlord;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  publishedAt?: string;
  
  // SEO
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  indexable: boolean;
  
  // Analytics
  viewCount: number;
  contactClicks: number;
  avgRating?: number;
  totalReviews: number;
}

export enum HouseType {
  BEDSITTER = 'bedsitter',
  SINGLE = 'single',
  ONE_BEDROOM = '1br',
  TWO_BEDROOM = '2br',
  THREE_BEDROOM = '3br',
  HOSTEL = 'hostel',
  APARTMENT = 'apartment',
  MANSION = 'mansion'
}

export enum ListingStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export enum AvailabilityStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
  PARTIALLY_VACANT = 'partially_vacant'
}

// Landlord Types
export interface Landlord {
  id: string;
  name: string;
  phonePrimary: string;
  phoneAlt?: string;
  email?: string;
  nationalId?: string;
  kraPin?: string;
  verified: boolean;
  verifiedAt?: string;
  notes?: string;
  
  // Backward compatibility fields
  phone?: string;
  
  // Performance Metrics
  responseRate: number;
  avgResponseTime: number;
  complaintCount: number;
  rating: number;
  
  // Status
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Safety & Alerts
export interface SafetyAlert {
  id: string;
  title: string;
  content: string;
  severity: AlertSeverity;
  zones: string[];
  startAt: string;
  endAt?: string;
  pinned: boolean;
  visibleOnHomepage: boolean;
  createdBy: string;
  createdAt: string;
  status: AlertStatus;
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger'
}

export enum AlertStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
}

// Zone Management
export interface Zone {
  id: string;
  name: string;
  aliases: string[];
  securityScore: number;
  bounds?: GeoPolygon;
  landmarks: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoPolygon {
  coordinates: [number, number][];
}

// Media
export interface Media {
  id: string;
  listingId: string;
  url: string;
  type: MediaType;
  alt: string;
  order: number;
  isPrimary: boolean;
  width?: number;
  height?: number;
  fileSize?: number;
  hash: string;
  processedAt?: string;
  createdAt: string;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  VIRTUAL_TOUR = 'virtual_tour'
}

// Reviews & Feedback
export interface Review {
  id: string;
  listingId: string;
  rating: number;
  text: string;
  tags: string[];
  source: ReviewSource;
  deviceId: string;
  status: ReviewStatus;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
}

export enum ReviewSource {
  WEB_FORM = 'web_form',
  SURVEY = 'survey',
  PARTNER = 'partner'
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Analytics
export interface AnalyticsEvent {
  id: string;
  deviceId: string;
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
}

export enum EventType {
  SEARCH = 'search',
  LISTING_VIEW = 'listing_view',
  CONTACT_CLICK = 'contact_click',
  MEDIA_OPEN = 'media_open',
  MAP_OPEN = 'map_open',
  DIRECTIONS_REQUEST = 'directions_request',
  ZONE_VIEW = 'zone_view',
  FILTER_USE = 'filter_use',
  FEEDBACK_SUBMIT = 'feedback_submit'
}

// Homepage Configuration
export interface HomepageConfig {
  id: string;
  hero: HeroConfig;
  featuredBlocks: FeaturedBlock[];
  quickFilters: QuickFilter[];
  mapSnapshot: MapSnapshotConfig;
  contentPages: ContentPage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface HeroConfig {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
  backgroundVideo?: string;
}

export interface FeaturedBlock {
  id: string;
  title: string;
  type: BlockType;
  items: unknown[];
  order: number;
  visible: boolean;
}

export enum BlockType {
  VERIFIED_HOUSES = 'verified_houses',
  TRENDING_ZONES = 'trending_zones',
  NEW_LISTINGS = 'new_listings',
  SAFETY_BANNERS = 'safety_banners'
}

export interface QuickFilter {
  id: string;
  label: string;
  query: Record<string, unknown>;
  order: number;
  visible: boolean;
}

export interface MapSnapshotConfig {
  centerLat: number;
  centerLng: number;
  zoom: number;
  pinStrategy: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  ip: string;
  userAgent: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export type ListingFormData = Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

export type LandlordFormData = Omit<Landlord, 'id' | 'createdAt' | 'updatedAt'>;

export type SafetyAlertFormData = Omit<SafetyAlert, 'id' | 'createdAt' | 'createdBy'>;