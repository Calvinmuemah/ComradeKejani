// Centralized API endpoints for the application
// Update these as needed for your backend

export const API_BASE_URL = 'https://comradekejani-k015.onrender.com/api/v1';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/admin/login`,
  adminUserById: (id: string | number) => `${API_BASE_URL}/admin/${id}`,
  // Users
  users: `${API_BASE_URL}/users`,
  userById: (id: string | number) => `${API_BASE_URL}/users/${id}`,
  // Listings
  listings: `${API_BASE_URL}/listings`,
  listingById: (id: string | number) => `${API_BASE_URL}/listings/${id}`,
  // Houses
  housesGetAll: `${API_BASE_URL}/houses/getAll`,
  houseById: (id: string | number) => `${API_BASE_URL}/houses/house/${id}`,
  // House creation
  housesCreate: `${API_BASE_URL}/houses/create`,
  // House views & landlord views
  houseViews: (houseId: string | number) => `${API_BASE_URL}/house-views/${houseId}`,
  landlordViews: (landlordId: string | number) => `${API_BASE_URL}/landlord-views/${landlordId}`,
  // Landlords (case-sensitive)
  landlords: `${API_BASE_URL}/landlords/Landlords`,
  landlordById: (id: string | number) => `${API_BASE_URL}/landlords/Landlord/${id}`,
  deleteLandlordById: (id: string | number) => `${API_BASE_URL}/landlords/Landlords/${id}`,
  addLandlord: `${API_BASE_URL}/landlords/addLandlord`,
  // Reviews
  reviews: `${API_BASE_URL}/reviews`,
  reviewsRecent: `${API_BASE_URL}/reviews/recent`,
  reviewsByHouse: (id: string | number) => `${API_BASE_URL}/reviews/house/${id}`,
  reviewById: (id: string | number) => `${API_BASE_URL}/reviews/${id}`,
  // Analytics
  analytics: `${API_BASE_URL}/analytics`,
  // Media
  media: `${API_BASE_URL}/media`,
  // Zones
  zones: `${API_BASE_URL}/zones`,
  // Settings
  settings: `${API_BASE_URL}/settings`,
  // Notifications (safety alerts)
  notificationsCreate: `${API_BASE_URL}/notifications/create`,
  notificationsGetAll: `${API_BASE_URL}/notifications/getAll`,
  notificationsUpdate: (id: string | number) => `${API_BASE_URL}/notifications/updateNotification/${id}`,
  notificationsDelete: (id: string | number) => `${API_BASE_URL}/notifications/deleteNotification/${id}`,
  // Reported Issues (user submitted safety reports)
  reportIssuesGetAll: `${API_BASE_URL}/reports/getAll`,
};

// --- Admin Profile ---
export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export async function uploadAdminAvatar(userId: string, file: File): Promise<AdminProfile> {
  const form = new FormData();
  form.append('avatar', file);
  const res = await apiFetch(`${API_ENDPOINTS.adminUserById(userId)}/avatar`, { method: 'POST', auth: true, body: form });
  if (!res.ok) throw new Error('Failed to upload avatar');
  return res.json();
}

export async function deleteAdminAvatar(userId: string): Promise<AdminProfile> {
  const res = await apiFetch(`${API_ENDPOINTS.adminUserById(userId)}/avatar`, { method: 'DELETE', auth: true });
  if (!res.ok) throw new Error('Failed to delete avatar');
  return res.json();
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile> {
  const res = await apiFetch(API_ENDPOINTS.adminUserById(userId), { auth: true });
  if(!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateAdminProfile(userId: string, payload: UpdateAdminProfilePayload): Promise<AdminProfile> {
  const res = await apiFetch(API_ENDPOINTS.adminUserById(userId), {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('Failed to update profile');
  return res.json();
}


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
// --- Internal Logging Utilities ---
interface ApiFetchOptions extends RequestInit {
  auth?: boolean; // inject bearer token automatically
  logBody?: boolean; // force logging of request body (stringifiable)
  suppressLog?: boolean; // disable logging for this call
  forceVerbose?: boolean; // if true, log even if global fetch logger active
}

interface LoggedResponseMeta {
  status: number;
  ok: boolean;
  url: string;
  durationMs: number;
  contentType?: string | null;
  size?: number; // bytes of logged body snippet
}

function maskAuthHeader(headers: Record<string, string>): Record<string, string> {
  const clone: Record<string, string> = { ...headers };
  const authKey = Object.keys(clone).find(k => k.toLowerCase() === 'authorization');
  if (authKey && typeof clone[authKey] === 'string') {
    clone[authKey] = 'Bearer ***';
  }
  return clone;
}

async function extractResponsePreview(res: Response): Promise<{ preview: unknown; size: number; contentType?: string | null; }>{
  const contentType = res.headers.get('content-type');
  try {
    if (contentType && contentType.includes('application/json')) {
      const cloned = res.clone();
      const json = await cloned.json();
      const str = JSON.stringify(json);
      return { preview: str.length > 5000 ? JSON.parse(str.slice(0, 5000)) : json, size: str.length, contentType };
    }
    if (contentType && (contentType.startsWith('text/') || contentType.includes('application/xml'))) {
      const cloned = res.clone();
      const text = await cloned.text();
      return { preview: text.slice(0, 5000) + (text.length > 5000 ? '…(truncated)' : ''), size: text.length, contentType };
    }
    return { preview: `[non-text body: ${contentType || 'unknown'}]`, size: 0, contentType };
  } catch {
    return { preview: '[unavailable body]', size: 0, contentType };
  }
}

export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth, suppressLog, logBody, forceVerbose, headers: optHeaders, body, ...rest } = options;
  const token = auth ? getAuthToken() : null;
  // If a global fetch logger is installed, avoid duplicate logs unless forceVerbose set
  interface FetchLoggerWindow { __FETCH_LOGGER_INSTALLED__?: boolean }
  const globalLoggerInstalled = (window as unknown as FetchLoggerWindow).__FETCH_LOGGER_INSTALLED__;
  // Normalize headers to Record<string,string>
  const headers: Record<string, string> = {};
  if (optHeaders) {
    if (optHeaders instanceof Headers) {
      optHeaders.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(optHeaders)) {
      for (const [k, v] of optHeaders) headers[k] = v;
    } else {
      for (const [k, v] of Object.entries(optHeaders as Record<string, unknown>)) {
        if (v !== undefined && v !== null) headers[k] = String(v);
      }
    }
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const start = performance.now();
  let requestBodyPreview: string | undefined = undefined;
  if (!suppressLog && !globalLoggerInstalled || forceVerbose) {
    if (body && (logBody || typeof body === 'string')) {
    requestBodyPreview = typeof body === 'string' ? (body.length > 1000 ? body.slice(0, 1000) + '…(truncated)' : body) : '[body omitted]';
    }
  }
  if (!suppressLog && (!globalLoggerInstalled || forceVerbose)) {
    console.debug('%cAPI REQUEST','color:#1976d2;font-weight:bold;', {
      method: (rest.method || 'GET').toUpperCase(),
      url,
      headers: maskAuthHeader(headers),
      body: requestBodyPreview
    });
  }
  let response: Response;
  try {
    response = await fetch(url, { ...rest, headers, body });
  } catch (err) {
    if (!suppressLog) {
      console.error('%cAPI NETWORK ERROR','color:#d32f2f;font-weight:bold;', { url, error: err });
    }
    throw err;
  }
  const durationMs = Math.round(performance.now() - start);
  if (!suppressLog && (!globalLoggerInstalled || forceVerbose)) {
    extractResponsePreview(response).then(({ preview, size, contentType }) => {
      const meta: LoggedResponseMeta = { status: response.status, ok: response.ok, url: response.url, durationMs, contentType, size };
      const style = response.ok ? 'color:#2e7d32;font-weight:bold;' : 'color:#d32f2f;font-weight:bold;';
      console.debug('%cAPI RESPONSE', style, meta, preview);
    });
  }
  return response;
}

// Backwards-compatible helper for authenticated requests
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, { ...options, auth: true });
}

// --- Centralized API Functions ---
import type { Landlord } from '../types';
// --- Types for Notifications & Report Issues ---
export interface NotificationItem {
  _id: string;
  type: 'new-listing' | 'price-drop' | 'safety-alert' | string; // allow passthrough
  title: string;
  message: string;
  houseId?: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type?: 'safety-alert' | 'new-listing' | 'price-drop'; // default safety-alert in UI
  houseId?: string;
  startAt?: string;
  endAt?: string; // optional expiry
}

export type UpdateNotificationPayload = Partial<CreateNotificationPayload>;

export interface SafetyIssueItem {
  _id: string;
  description: string;
  type: string; // backend enum mixed case; keep string
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}
// Local form data type for house creation (matches AddHousePage structure)
export interface CreateHouseFormData {
  title: string;
  price: number | string;
  type: string; // could be enum if defined elsewhere
  status: string;
  landlordId: string;
  rating?: number | string;
  safetyRating?: number | string;
  location: {
    estate: string;
    address: string;
    coordinates: { lat: number | string; lng: number | string };
    distanceFromUniversity: { walking: number | string; boda: number | string; matatu: number | string };
    nearbyEssentials: { type: string; name: string; distance: number | string }[];
  };
  amenities: { name: string; available: boolean; icon: string }[];
  images: File[];
}

// Response shape for house creation (adjust when backend schema is finalized)
export interface HouseCreateResponse {
  success?: boolean;
  message?: string;
  data?: unknown; // backend may wrap created house here
  [key: string]: unknown; // allow additional fields until fully typed
}

// Fetch all landlords
export async function fetchLandlords(): Promise<Landlord[]> {
  // Use the correct endpoint for fetching all landlords (case-sensitive)
  const res = await apiFetch(API_ENDPOINTS.landlords, { auth: true });
  if (!res.ok) throw new Error('Failed to fetch landlords');
  const data = await res.json();
  return data || [];
}


// Create a house with images and data as multipart/form-data
// Accepts a plain object matching the form structure from AddHousePage
export async function createHouse(formData: CreateHouseFormData): Promise<HouseCreateResponse> {
  const form = new FormData();
  form.append('title', String(formData.title));
  form.append('price', String(formData.price));
  form.append('type', String(formData.type));
  form.append('status', String(formData.status));
  form.append('landlordId', String(formData.landlordId));
  form.append('rating', String(formData.rating ?? '0'));
  form.append('safetyRating', String(formData.safetyRating ?? '0'));
  // Location fields
  form.append('location[estate]', String(formData.location.estate));
  form.append('location[address]', String(formData.location.address));
  form.append('location[coordinates][lat]', String(formData.location.coordinates.lat));
  form.append('location[coordinates][lng]', String(formData.location.coordinates.lng));
  form.append('location[distanceFromUniversity][walking]', String(formData.location.distanceFromUniversity.walking));
  form.append('location[distanceFromUniversity][boda]', String(formData.location.distanceFromUniversity.boda));
  form.append('location[distanceFromUniversity][matatu]', String(formData.location.distanceFromUniversity.matatu));
  // Nearby essentials (array)
  formData.location.nearbyEssentials.forEach((n, idx: number) => {
    form.append(`location[nearbyEssentials][${idx}][type]`, String(n.type));
    form.append(`location[nearbyEssentials][${idx}][name]`, String(n.name));
    form.append(`location[nearbyEssentials][${idx}][distance]`, String(n.distance));
  });
  // Amenities (array)
  formData.amenities.forEach((a, idx: number) => {
    form.append(`amenities[${idx}][name]`, String(a.name));
    form.append(`amenities[${idx}][available]`, a.available ? 'true' : 'false');
    form.append(`amenities[${idx}][icon]`, String(a.icon));
  });
  // Images (files)
  formData.images.forEach((file: File) => {
    form.append('images', file);
  });
    // Debug: Log API endpoint and FormData content
    const endpoint = API_ENDPOINTS.housesCreate;
    console.log('POST endpoint:', endpoint);
    // Log all FormData entries
    const debugFormData: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    for (const [key, value] of form.entries()) {
      const existing = debugFormData[key];
      if (existing === undefined) {
        debugFormData[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        debugFormData[key] = [existing, value];
      }
    }
    console.log('FormData being sent:', debugFormData);
  const res = await apiFetch(API_ENDPOINTS.housesCreate, {
    method: 'POST',
    auth: true,
    body: form,
  });
  if (!res.ok) throw new Error('Failed to create house');
  return await res.json() as HouseCreateResponse;
}

// Update a house (partial update JSON)
export interface UpdateHousePayload {
  title?: string;
  price?: number;
  status?: string;
  type?: string;
  houseType?: string; // allow updating canonical houseType alongside legacy type
  landlordId?: string;
  location?: {
    estate?: string;
    address?: string;
  };
}

export interface UpdateHouseResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  [k: string]: unknown;
}

export async function updateHouse(id: string, payload: UpdateHousePayload): Promise<UpdateHouseResponse> {
  const res = await apiFetch(API_ENDPOINTS.houseById(id), {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update house');
  return res.json() as Promise<UpdateHouseResponse>;
}

// --- Notifications (Safety Alerts) ---
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await apiFetch(API_ENDPOINTS.notificationsGetAll, { auth: true });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function createNotification(payload: CreateNotificationPayload): Promise<NotificationItem> {
  const body = { type: payload.type || 'safety-alert', title: payload.title, message: payload.message, houseId: payload.houseId };
  const res = await apiFetch(API_ENDPOINTS.notificationsCreate, {
    method: 'POST',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    logBody: true,
  });
  if (!res.ok) throw new Error('Failed to create notification');
  return res.json();
}

export async function updateNotification(id: string, payload: UpdateNotificationPayload): Promise<NotificationItem> {
  const res = await apiFetch(API_ENDPOINTS.notificationsUpdate(id), {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    logBody: true,
  });
  if (!res.ok) throw new Error('Failed to update notification');
  return res.json();
}

export async function deleteNotification(id: string): Promise<{ message: string }> {
  const res = await apiFetch(API_ENDPOINTS.notificationsDelete(id), { method: 'DELETE', auth: true });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
}

// --- Report Issues ---
export async function fetchReportIssues(): Promise<SafetyIssueItem[]> {
  const res = await apiFetch(API_ENDPOINTS.reportIssuesGetAll, { auth: true });
  if (!res.ok) throw new Error('Failed to fetch reported issues');
  return res.json();
}

// Fetch views count for a house (returns array or object with count)
export async function fetchHouseViewsCount(houseId: string): Promise<number> {
  try {
  const res = await apiFetch(API_ENDPOINTS.houseViews(houseId), { auth: true });
    if (!res.ok) return 0;
  const data = await res.json();
  const count = extractCount(data);
  console.debug('[Views] House', houseId, 'raw:', data, 'parsedCount:', count);
  return count;
  } catch { return 0; }
}

// Fetch landlord contact/views count
export async function fetchLandlordViewsCount(landlordId: string): Promise<number> {
  try {
    const res = await apiFetch(API_ENDPOINTS.landlordViews(landlordId), { auth: true });
    if (!res.ok) return 0;
    const data = await res.json();
  const count = extractCount(data);
  console.debug('[Views] Landlord', landlordId, 'raw:', data, 'parsedCount:', count);
  return count;
  } catch { return 0; }
}

// Generic extraction of count from varied backend shapes
function extractCount(data: unknown): number {
  if (data == null) return 0;
  if (typeof data === 'number') return data;
  if (Array.isArray(data)) return data.length;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Common patterns
    if (typeof obj.count === 'number') return obj.count;
    if (typeof obj.totalViews === 'number') return obj.totalViews as number;
    if (Array.isArray(obj.data)) return obj.data.length;
    if (typeof obj.total === 'number') return obj.total;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (typeof inner.count === 'number') return inner.count;
      if (typeof inner.totalViews === 'number') return inner.totalViews as number;
      if (Array.isArray(inner.items)) return inner.items.length;
    }
  }
  return 0;
}
