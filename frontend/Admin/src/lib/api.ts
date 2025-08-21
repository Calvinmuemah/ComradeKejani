// Centralized API endpoints for the application
// Update these as needed for your backend

export const API_BASE_URL = 'https://1g17qnls-3000.uks1.devtunnels.ms/api/v1';

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


// Store token in sessionStorage
export function storeAuthToken(token: string) {
  sessionStorage.setItem('authToken', token);
}

// Retrieve token from sessionStorage
export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken');
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
export async function createHouse(form: FormData): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/houses/create`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Failed to create house');
  return await res.json();
}
