import React, { useState, useEffect, useCallback } from 'react';
// Availability toggle removed: amenities auto-marked available
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { createHouse } from '../../lib/api';

const initialNearby = [
  { type: '', name: '', distance: '' }
];
const initialAmenities = [
  { name: '', available: true, icon: '' }
];


type Amenity = { name: string; available: boolean; icon: string };
type NearbyEssential = { type: string; name: string; distance: string };
type FormDataType = {
  title: string;
  price: string;
  type: string;
  status: string;
  images: File[];
  landlordId: string;
  rating: string;
  safetyRating: string;
  location: {
    estate: string;
    address: string;
    coordinates: { lat: string; lng: string };
    distanceFromUniversity: { walking: string; boda: string; matatu: string };
    nearbyEssentials: NearbyEssential[];
  };
  amenities: Amenity[];
};

// Required field keys for validation logic
const REQUIRED_FIELDS = [
  'title',
  'price',
  'type',
  'landlordId',
  'location.estate',
  'location.address'
];

const SECTION_COLOR_MAP: Record<string, { from: string; to: string; glow: string }> = {
  basics: { from: 'from-blue-600', to: 'to-indigo-600', glow: 'shadow-blue-600/40' },
  location: { from: 'from-emerald-600', to: 'to-teal-600', glow: 'shadow-emerald-600/40' },
  media: { from: 'from-purple-600', to: 'to-fuchsia-600', glow: 'shadow-fuchsia-600/40' },
  landlord: { from: 'from-amber-600', to: 'to-orange-600', glow: 'shadow-amber-500/40' }
};

// Preset nearby essential categories
const NEARBY_TYPES = [
  'shop',
  'market',
  'supermarket',
  'hospital',
  'clinic',
  'pharmacy',
  'restaurant',
  'cafeteria',
  'bank',
  'atm',
  'police',
  'security',
  'bus-stop',
  'matatu-stage',
  'laundry',
  'gym'
];

const AddHouse: React.FC = () => {
  const navigate = useNavigate();
  // Amenity options and icons
  const amenityOptions = [
    { name: 'WiFi', icon: 'wifi' },
    { name: 'Water', icon: 'droplets' },
    { name: 'Parking', icon: 'car' },
    { name: 'CCTV', icon: 'camera' },
    { name: 'Laundry', icon: 'washer' },
    { name: 'Balcony', icon: 'columns' },
    { name: 'Furnished', icon: 'sofa' },
    { name: 'Security', icon: 'shield' },
    { name: 'Hot Shower', icon: 'flame' },
    { name: 'Kitchen', icon: 'utensils' },
  ];

    // Landlord options (fetched from backend)
    const [landlordOptions, setLandlordOptions] = useState<{ id: string; name: string }[]>([]);
    const [loadingLandlords, setLoadingLandlords] = useState(false);
    const [landlordError, setLandlordError] = useState<string | null>(null);

    useEffect(() => {
  // Minimal landlord shape; allow extra properties from API without type conflict
  interface LandlordLite { _id: string; name: string; [k: string]: unknown }
      async function loadLandlords() {
        setLoadingLandlords(true);
        setLandlordError(null);
        try {
          const { fetchLandlords } = await import('../../lib/api');
          const landlords = (await fetchLandlords()) as unknown as LandlordLite[];
          setLandlordOptions(landlords.map(l => ({ id: l._id, name: l.name })));
  } catch {
          setLandlordError('Failed to load landlords');
        } finally {
          setLoadingLandlords(false);
        }
      }
      loadLandlords();
    }, []);

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    price: '',
    type: '',
    status: 'vacant',
    images: [],
    landlordId: '',
    rating: '',
    safetyRating: '',
    location: {
      estate: '',
      address: '',
      coordinates: { lat: '', lng: '' },
      distanceFromUniversity: { walking: '', boda: '', matatu: '' },
      nearbyEssentials: initialNearby,
    },
    amenities: initialAmenities,
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [activeSection, setActiveSection] = useState<'basics' | 'location' | 'media' | 'landlord'>('basics');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; id: number } | null>(null);

  const markTouched = (name: string) => setTouched(prev => ({ ...prev, [name]: true }));

  // Derive validity for a field by path
  const getValueByPath = useCallback((path: string): unknown => {
    const parts = path.split('.');
    let cur: unknown = formData;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      // Using index signature via casting for dynamic traversal
      cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
  }, [formData]);

  const isFieldInvalid = (path: string) => {
    const val = getValueByPath(path);
    return (touched[path] || attemptedSubmit) && (val === '' || val == null);
  };

  const formIsValid = REQUIRED_FIELDS.every(f => {
    const v = getValueByPath(f);
    return !(v === '' || v == null);
  });

  // Active section detection based on scroll position
  useEffect(() => {
    const handler = () => {
      const sections: NodeListOf<HTMLElement> = document.querySelectorAll('section[data-section]');
      const allowed = new Set(['basics','location','media','landlord']);
      let candidate: 'basics' | 'location' | 'media' | 'landlord' = activeSection;
      let bestDist = Infinity;
      const targetLine = window.innerHeight * 0.25;
      sections.forEach(sec => {
        const id = (sec.getAttribute('data-section') || '') as string;
        if (!allowed.has(id)) return;
        const rect = sec.getBoundingClientRect();
        const dist = Math.abs(rect.top - targetLine);
        if (dist < bestDist) { bestDist = dist; candidate = id as typeof candidate; }
      });
      if (candidate !== activeSection) setActiveSection(candidate);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [activeSection]);

  // Toast auto dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, id: Date.now() });
  };

  // Handle input changes for nested fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (name.startsWith('location.')) {
      const path = name.split('.');
      setFormData((prev) => {
        const updated = { ...prev };
        if (path[1] === 'coordinates') {
          updated.location.coordinates = {
            ...updated.location.coordinates,
            [path[2]]: value,
          };
        } else if (path[1] === 'distanceFromUniversity') {
          updated.location.distanceFromUniversity = {
            ...updated.location.distanceFromUniversity,
            [path[2]]: value,
          };
        } else {
          if (path[1] === 'estate') updated.location.estate = value;
          else if (path[1] === 'address') updated.location.address = value;
        }
        return updated;
      });
    } else if (name.startsWith('amenity.')) {
      const [, idx, field] = name.split('.');
      setFormData((prev) => {
        const amenities = [...prev.amenities];
        if (field === 'available') {
          amenities[+idx].available = (e.target as HTMLInputElement).checked;
        } else if (field === 'name') {
          // Find icon for selected amenity
          const found = amenityOptions.find(opt => opt.name === value);
          amenities[+idx].name = value;
          amenities[+idx].icon = found ? found.icon : '';
        }
        return { ...prev, amenities };
      });
    } else if (name.startsWith('nearby.')) {
      const [, idx, field] = name.split('.');
      setFormData((prev) => {
        const nearbyEssentials = [...prev.location.nearbyEssentials];
        if (field === 'type') nearbyEssentials[+idx].type = value;
        else if (field === 'name') nearbyEssentials[+idx].name = value;
        else if (field === 'distance') nearbyEssentials[+idx].distance = value;
        return {
          ...prev,
          location: {
            ...prev.location,
            nearbyEssentials,
          },
        };
      });
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image upload (max 5)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArr = Array.from(files).slice(0, 5);
      setFormData((prev) => ({ ...prev, images: fileArr }));
      setImagePreviews(fileArr.map((file) => URL.createObjectURL(file)));
    }
  };

  // Add/Remove amenities
  const addAmenity = () => {
    setFormData((prev) => ({
      ...prev,
    amenities: [...prev.amenities, { name: '', available: true, icon: '' }],
    }));
  };
  const removeAmenity = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== idx),
    }));
  };

  // Add/Remove nearby essentials
  const addNearby = () => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        nearbyEssentials: [
          ...prev.location.nearbyEssentials,
          { type: '', name: '', distance: '' },
        ],
      },
    }));
  };
  const removeNearby = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        nearbyEssentials: prev.location.nearbyEssentials.filter((_, i) => i !== idx),
      },
    }));
  };

  // Autofill latitude and longitude using browser geolocation
  const autofillLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude.toString(),
                lng: position.coords.longitude.toString(),
              },
            },
          }));
        },
  () => {
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    // Mark all required as touched to reveal errors
    REQUIRED_FIELDS.forEach(f => markTouched(f));
    if (!formIsValid) {
      // Scroll to first invalid field smoothly
      const firstInvalid = REQUIRED_FIELDS.find(f => isFieldInvalid(f));
      if (firstInvalid) {
        const el = document.querySelector(`[data-field="${firstInvalid}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Deep clone formData for logging without File objects heavy data
      const logPayload: Record<string, unknown> = JSON.parse(JSON.stringify({
        ...formData,
        images: formData.images.map(f => ({ name: f.name, size: f.size, type: f.type }))
      }));
      console.groupCollapsed('%c[AddHouse] Submitting listing payload','color:#60a5fa');
      console.log('Active Section:', activeSection);
      console.log('Payload (sanitized):', logPayload);
      console.groupEnd();
      // Sanitize amenities: keep only those with a name; force available true
      const sanitizedAmenities = formData.amenities
        .filter(a => a.name && a.name.trim() !== '')
        .map(a => ({ ...a, available: true }));
      const payload = { ...formData, amenities: sanitizedAmenities };
      console.debug('[AddHouse] Final payload amenities:', payload.amenities);
      await createHouse(payload as typeof formData);
      console.info('%c[AddHouse] Success: house created','color:#10b981');
      showToast('success','Listing created successfully');
      
      // Immediately navigate back while maintaining the state
      navigate('/listings', { 
        state: { 
          newListing: { ...payload, createdAt: new Date().toISOString() },
          refreshNeeded: true
        } 
      });
  } catch {
      setSubmitError('Failed to add house. Please check your details and try again.');
      console.error('[AddHouse] Submission failed');
      showToast('error','Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-oxford-950 text-white flex flex-col">
      <div className="w-full bg-oxford-900 px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-oxford-900/90">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/listings')} className="text-gray-400 hover:text-white transition-colors" aria-label="Back to listings">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Add New House</h1>
            <p className="text-xs md:text-sm text-gray-400">Fields marked <span className="text-red-400">*</span> are required</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs">
          {formIsValid ? (
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={14}/> Ready to submit</span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400"><AlertCircle size={14}/> Complete required fields</span>
          )}
        </div>
      </div>
  <form onSubmit={handleSubmit} className="flex-1 w-full px-0 md:px-4 py-10 relative">

        <div className="space-y-16">
          {/* Section 1: Basics */}
          <section className="relative pl-4 md:pl-5" data-section="basics">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            <header className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">House Basics <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h2>
              <p className="text-sm text-gray-400">Provide the minimal core details to create the house listing.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-field="title">
                <label className="flex items-center text-sm font-medium mb-1">Title <span className="text-red-400 ml-0.5">*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => markTouched('title')}
                  className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3 transition ${isFieldInvalid('title') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                  autoComplete="off"
                  aria-invalid={isFieldInvalid('title')}
                />
                {isFieldInvalid('title') && <p className="text-xs text-red-400 mt-1">Title is required.</p>}
              </div>
              <div data-field="type">
                <label className="flex items-center text-sm font-medium mb-1">Type <span className="text-red-400 ml-0.5">*</span></label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  onBlur={() => markTouched('type')}
                  className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3 transition ${isFieldInvalid('type') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                  autoComplete="off"
                  aria-invalid={isFieldInvalid('type')}
                >
                  <option value="">Select Type</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="single">Single Room</option>
                  <option value="1br">1 Bedroom</option>
                  <option value="2br">2 Bedroom</option>
                  <option value="hostel">Hostel</option>
                </select>
                {isFieldInvalid('type') && <p className="text-xs text-red-400 mt-1">Type is required.</p>}
              </div>
              <div data-field="price">
                <label className="flex items-center text-sm font-medium mb-1">Monthly Rent (KES) <span className="text-red-400 ml-0.5">*</span></label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={() => markTouched('price')}
                  className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3 transition ${isFieldInvalid('price') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                  autoComplete="off"
                  aria-invalid={isFieldInvalid('price')}
                />
                {isFieldInvalid('price') && <p className="text-xs text-red-400 mt-1">Price is required.</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">Status <span className="text-[10px] font-normal text-gray-400 ml-1">Optional</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3"
                  autoComplete="off"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">Rating <span className="text-[10px] font-normal text-gray-400 ml-1">Optional</span></label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3"
                >
                  <option value="">Select rating</option>
                  {[0,1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">Safety Rating <span className="text-[10px] font-normal text-gray-400 ml-1">Optional</span></label>
                <select
                  name="safetyRating"
                  value={formData.safetyRating}
                  onChange={handleChange}
                  className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm p-3"
                >
                  <option value="">Select rating</option>
                  {[0,1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Location */}
          <section className="relative pl-4 md:pl-5" data-section="location">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]" />
            <header className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">Location <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h2>
              <p className="text-sm text-gray-400">Only Estate & Address required. Everything else improves search quality.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-field="location.estate">
                <label className="flex items-center text-sm font-medium mb-1">Estate <span className="text-red-400 ml-0.5">*</span></label>
                <input
                  type="text"
                  name="location.estate"
                  required
                  value={formData.location.estate}
                  onChange={handleChange}
                  onBlur={() => markTouched('location.estate')}
                  className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm p-3 transition ${isFieldInvalid('location.estate') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                  autoComplete="off"
                  aria-invalid={isFieldInvalid('location.estate')}
                />
                {isFieldInvalid('location.estate') && <p className="text-xs text-red-400 mt-1">Estate is required.</p>}
              </div>
              <div data-field="location.address">
                <label className="flex items-center text-sm font-medium mb-1">Address <span className="text-red-400 ml-0.5">*</span></label>
                <input
                  type="text"
                  name="location.address"
                  required
                  value={formData.location.address}
                  onChange={handleChange}
                  onBlur={() => markTouched('location.address')}
                  className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm p-3 transition ${isFieldInvalid('location.address') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                  autoComplete="off"
                  aria-invalid={isFieldInvalid('location.address')}
                />
                {isFieldInvalid('location.address') && <p className="text-xs text-red-400 mt-1">Address is required.</p>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-1">Latitude <span className="text-[10px] font-normal text-gray-400 ml-1">Optional</span></label>
                <input type="number" name="location.coordinates.lat" value={formData.location.coordinates.lat} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 sm:text-sm p-3" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="flex items-center text-sm font-medium mb-1">Longitude <span className="text-[10px] font-normal text-gray-400 ml-1">Optional</span></label>
                  <input type="number" name="location.coordinates.lng" value={formData.location.coordinates.lng} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 sm:text-sm p-3" />
                </div>
                <button type="button" onClick={autofillLocation} className="h-11 px-4 bg-emerald-600/20 text-emerald-300 rounded-md hover:bg-emerald-600/30 text-xs font-medium border border-emerald-600/30 backdrop-blur transition">Use My Location</button>
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div>
                  <label className="flex items-center text-xs font-medium mb-1">Walking (min) <span className="text-[9px] font-normal text-gray-500 ml-1">Optional</span></label>
                  <input type="number" name="location.distanceFromUniversity.walking" value={formData.location.distanceFromUniversity.walking} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 text-xs p-2.5" />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium mb-1">Boda (min) <span className="text-[9px] font-normal text-gray-500 ml-1">Optional</span></label>
                  <input type="number" name="location.distanceFromUniversity.boda" value={formData.location.distanceFromUniversity.boda} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 text-xs p-2.5" />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium mb-1">Tuktuk (min) <span className="text-[9px] font-normal text-gray-500 ml-1">Optional</span></label>
                  <input type="number" name="location.distanceFromUniversity.matatu" value={formData.location.distanceFromUniversity.matatu} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 text-xs p-2.5" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium mb-2">Nearby Essentials <span className="text-[10px] font-normal text-gray-400 ml-2">Optional</span></label>
                <div className="space-y-2">
                  {formData.location.nearbyEssentials.map((item: NearbyEssential, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 md:items-center bg-oxford-900/40 border border-gray-800 rounded-lg p-3 group animate-[fadeSlide_.25s_ease]">
                      <div className="relative md:w-40">
                        <select
                          name={`nearby.${idx}.type`}
                          value={item.type}
                          onChange={handleChange}
                          className="w-full bg-oxford-900 border border-gray-800 rounded-md text-gray-200 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-xs p-2 pr-6 appearance-none transition"
                        >
                          <option value="">Type...</option>
                          {NEARBY_TYPES.map(t => (
                            <option key={t} value={t}>{t.replace(/-/g,' ')}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">▼</span>
                      </div>
                      <input type="text" name={`nearby.${idx}.name`} placeholder="Name" value={item.name} onChange={handleChange} className="flex-1 bg-oxford-900 border border-gray-800 rounded-md text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-xs p-2" />
                      <input type="number" name={`nearby.${idx}.distance`} placeholder="Distance (m)" value={item.distance} onChange={handleChange} className="md:w-32 bg-oxford-900 border border-gray-800 rounded-md text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-xs p-2" />
                      <button type="button" onClick={() => removeNearby(idx)} className="text-red-400 hover:text-red-500 text-xs font-medium self-start md:self-center">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addNearby} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">+ Add Nearby</button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Media & Amenities */}
          <section className="relative pl-4 md:pl-5" data-section="media">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 border border-fuchsia-400/30 shadow-[0_0_0_2px_rgba(192,38,211,0.35)]" />
            <header className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">Media & Amenities <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h2>
              <p className="text-sm text-gray-400">Enhance your listing. These are optional but improve attractiveness.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-oxford-900 to-oxford-950 border border-gray-800 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                  {imagePreviews.length > 0 ? (
                    <img src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={34} className="text-gray-500" />
                  )}
                </div>
                <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs md:text-sm font-medium py-2 px-4 rounded-md transition duration-200 shadow relative overflow-hidden">
                  <span className="relative z-10">Upload Images</span>
                  <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                </label>
                {imagePreviews.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreviews.slice(1).map((src: string, idx: number) => (
                      <img key={idx} src={src} alt="Preview" className="w-14 h-14 object-cover rounded border border-gray-800 shadow" />
                    ))}
                  </div>
                )}
                {formData.images.length > 5 && <div className="text-red-400 text-xs mt-2">Maximum 5 images allowed.</div>}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium mb-2">Amenities <span className="text-[10px] font-normal text-gray-400 ml-2">Optional</span></label>
                <div className="space-y-2">
                  {formData.amenities.map((item: Amenity, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 md:items-center bg-oxford-900/40 border border-gray-800 rounded-lg p-3 group">
                      <select
                        name={`amenity.${idx}.name`}
                        value={item.name}
                        onChange={handleChange}
                        className="md:w-1/2 bg-oxford-900 border border-gray-800 rounded-md text-gray-200 focus:ring-1 focus:ring-purple-600 focus:border-purple-600 text-xs p-2"
                      >
                        <option value="">Select Amenity</option>
                        {amenityOptions.map(opt => (
                          <option key={opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-400 flex items-center md:w-24 h-6">
                        {item.icon && <span className="inline-block mr-1 px-2 py-0.5 bg-oxford-950 rounded border border-gray-800 text-[10px] uppercase tracking-wide text-gray-500">{item.icon}</span>}
                      </div>
                      {/* Availability always true; label omitted */}
                      <button type="button" onClick={() => removeAmenity(idx)} className="text-red-400 hover:text-red-500 text-xs font-medium self-start md:self-center">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addAmenity} className="text-purple-400 hover:text-purple-300 text-xs font-medium">+ Add Amenity</button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Landlord & Submit */}
          <section className="relative pl-4 md:pl-5 pb-10" data-section="landlord">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
            <header className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">Landlord & Submit <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 4</span></h2>
              <p className="text-sm text-gray-400">Select an existing landlord to associate with this property.</p>
            </header>
            <div className="max-w-md" data-field="landlordId">
              <label className="flex items-center text-sm font-medium mb-1">Landlord <span className="text-red-400 ml-0.5">*</span></label>
              <select
                name="landlordId"
                required
                value={formData.landlordId}
                onChange={handleChange}
                onBlur={() => markTouched('landlordId')}
                className={`block w-full bg-oxford-900 border rounded-lg text-gray-200 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 sm:text-sm p-3 transition ${isFieldInvalid('landlordId') ? 'border-red-500 focus:ring-red-600 focus:border-red-600' : 'border-gray-800'}`}
                disabled={loadingLandlords}
                aria-invalid={isFieldInvalid('landlordId')}
              >
                <option value="">{loadingLandlords ? 'Loading landlords...' : 'Select Landlord'}</option>
                {landlordOptions.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              {isFieldInvalid('landlordId') && <p className="text-xs text-red-400 mt-1">Landlord is required.</p>}
              {landlordError && <div className="text-red-400 text-xs mt-1">{landlordError}</div>}
            </div>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <button type="button" onClick={() => navigate('/listings')} className="px-5 py-2.5 bg-oxford-900 border border-gray-800 text-gray-300 rounded-md hover:bg-oxford-800 hover:text-white text-sm font-medium transition">Cancel</button>
              {(() => {
                const colors = SECTION_COLOR_MAP[activeSection] || SECTION_COLOR_MAP.basics;
                const enabledClasses = `bg-gradient-to-r ${colors.from} ${colors.to} hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 ${colors.glow}`;
                const disabledClasses = 'bg-oxford-800 text-gray-500 border border-gray-700 cursor-not-allowed';
                return (
                  <button
                    type="submit"
                    disabled={submitting || !formIsValid}
                    className={`px-6 py-2.5 rounded-md text-sm font-semibold tracking-wide transition shadow ${formIsValid && !submitting ? enabledClasses : disabledClasses}`}
                  >
                    {submitting ? 'Adding...' : 'Create Listing'}
                  </button>
                );
              })()}
              {!formIsValid && attemptedSubmit && (
                <div className="flex items-center gap-1 text-xs text-amber-400"><AlertCircle size={14}/> Complete required fields above.</div>
              )}
              {submitError && <div className="text-red-400 text-xs">{submitError}</div>}
            </div>
          </section>
        </div>
    {/* Keyframes for dropdown row animation */}
    <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {/* Toast Notification */}
          <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {toast && (
              <div
                key={toast.id}
                className={`pointer-events-auto select-none w-64 p-4 rounded-lg shadow-lg border backdrop-blur transition transform animate-[fadeIn_0.25s_ease] ${toast.type === 'success' ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300' : 'bg-red-600/15 border-red-500/40 text-red-300'}`}
              >
                <p className="text-sm font-medium leading-tight">{toast.message}</p>
                <div className="h-1 mt-3 rounded bg-white/10 overflow-hidden">
                  <div className={`h-full ${toast.type === 'success' ? 'bg-emerald-400/80' : 'bg-red-400/80'} animate-[shrink_3s_linear_forwards]`} />
                </div>
              </div>
            )}
          </div>
          {/* Toast animations */}
          <style>{`@keyframes fadeIn{from{opacity:0;translate:0 -4px}to{opacity:1;translate:0 0}}@keyframes shrink{from{width:100%}to{width:0}}`}</style>
      </form>
    </div>
  );
};

export default AddHouse;
