// Centralized API endpoints for the application
// Update these as needed for your backend

export const API_BASE_URL = 'https://comradekejani-k015.onrender.com/api/v1';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/admin/login`,
  // Users
  users: `${API_BASE_URL}/users`,
  userById: (id: string | number) => `${API_BASE_URL}/users/${id}`,
  // Listings
  listings: `${API_BASE_URL}/listings`,
  listingById: (id: string | number) => `${API_BASE_URL}/listings/${id}`,
  // Houses
  housesGetAll: `${API_BASE_URL}/houses/getAll`,
  houseById: (id: string | number) => `${API_BASE_URL}/houses/house/${id}`,
  // Landlords (case-sensitive)
  landlords: `${API_BASE_URL}/landlords/Landlords`,
  landlordById: (id: string | number) => `${API_BASE_URL}/landlords/Landlord/${id}`,
  addLandlord: `${API_BASE_URL}/landlords/addLandlord`,
  // Reviews
  reviews: `${API_BASE_URL}/reviews`,
  reviewById: (id: string | number) => `${API_BASE_URL}/reviews/${id}`,
  // Analytics
  analytics: `${API_BASE_URL}/analytics`,
  // Media
  media: `${API_BASE_URL}/media`,
  // Zones
  zones: `${API_BASE_URL}/zones`,
  // Settings
  settings: `${API_BASE_URL}/settings`,
};


// --- Auth Helpers ---

// Store token in sessionStorage
export function storeAuthToken(token: string) {
  sessionStorage.setItem('authToken', token);
}

// Retrieve token from sessionStorage
export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken');
}

// Clear auth token and session data
export function clearAuthSession() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('kejani_admin_user');
}

// Helper function for authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

// --- Centralized API Functions ---
import type { Landlord } from '../types';

// Fetch all landlords
export async function fetchLandlords(): Promise<Landlord[]> {
  // Use the correct endpoint for fetching all landlords (case-sensitive)
  const res = await fetch(API_ENDPOINTS.landlords);
  if (!res.ok) throw new Error('Failed to fetch landlords');
  const data = await res.json();
  return data || [];
}


// Create a house with images and data as multipart/form-data
// Accepts a plain object matching the form structure from AddHousePage
export async function createHouse(formData: any): Promise<any> {
  const form = new FormData();
  form.append('title', formData.title);
  form.append('price', formData.price);
  form.append('type', formData.type);
  form.append('status', formData.status);
  form.append('landlordId', formData.landlordId);
  form.append('rating', formData.rating || '0');
  form.append('safetyRating', formData.safetyRating || '0');
  // Location fields
  form.append('location[estate]', formData.location.estate);
  form.append('location[address]', formData.location.address);
  form.append('location[coordinates][lat]', formData.location.coordinates.lat);
  form.append('location[coordinates][lng]', formData.location.coordinates.lng);
  form.append('location[distanceFromUniversity][walking]', formData.location.distanceFromUniversity.walking);
  form.append('location[distanceFromUniversity][boda]', formData.location.distanceFromUniversity.boda);
  form.append('location[distanceFromUniversity][matatu]', formData.location.distanceFromUniversity.matatu);
  // Nearby essentials (array)
  formData.location.nearbyEssentials.forEach((n: any, idx: number) => {
    form.append(`location[nearbyEssentials][${idx}][type]`, n.type);
    form.append(`location[nearbyEssentials][${idx}][name]`, n.name);
    form.append(`location[nearbyEssentials][${idx}][distance]`, n.distance);
  });
  // Amenities (array)
  formData.amenities.forEach((a: any, idx: number) => {
    form.append(`amenities[${idx}][name]`, a.name);
    form.append(`amenities[${idx}][available]`, a.available ? 'true' : 'false');
    form.append(`amenities[${idx}][icon]`, a.icon);
  });
  // Images (files)
  formData.images.forEach((file: File) => {
    form.append('images', file);
  });
    // Debug: Log API endpoint and FormData content
    const endpoint = API_ENDPOINTS.housesCreate || `${API_BASE_URL}/houses/create`;
    console.log('POST endpoint:', endpoint);
    // Log all FormData entries
    const debugFormData = {};
    form.forEach((value, key) => {
      if (debugFormData[key]) {
        if (Array.isArray(debugFormData[key])) debugFormData[key].push(value);
        else debugFormData[key] = [debugFormData[key], value];
      } else {
        debugFormData[key] = value;
      }
    });
    console.log('FormData being sent:', debugFormData);
  const res = await fetch(API_ENDPOINTS.housesCreate || `${API_BASE_URL}/houses/create`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Failed to create house');
  return await res.json();
}
// Add to API_ENDPOINTS for house creation
if (!API_ENDPOINTS.housesCreate) {
  API_ENDPOINTS.housesCreate = `${API_BASE_URL}/houses/create`;
}
