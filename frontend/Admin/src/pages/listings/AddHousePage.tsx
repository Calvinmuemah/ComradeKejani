import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { createHouse } from '../../lib/api';

const initialNearby = [
  { type: '', name: '', distance: '' }
];
const initialAmenities = [
  { name: '', available: false, icon: '' }
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
      async function loadLandlords() {
        setLoadingLandlords(true);
        setLandlordError(null);
        try {
          const { fetchLandlords } = await import('../../lib/api');
          const landlords = await fetchLandlords();
          setLandlordOptions(landlords.map((l: any) => ({ id: l._id, name: l.name })));
        } catch (err: any) {
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
      amenities: [...prev.amenities, { name: '', available: false, icon: '' }],
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
        (error) => {
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
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Use centralized API utility
      await createHouse(formData);
      navigate('/listings');
    } catch (err: any) {
      setSubmitError('Failed to add house. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-oxford-950 text-white flex flex-col py-8">
      <div className="w-full bg-oxford-900 border-b border-gray-800 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/listings')} className="mr-4 text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Add New House</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 w-full px-0 md:px-8">
        <div className="w-full max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:[&>div]:min-w-[320px] py-8">
            {/* Left Column - House Details */}
            <div className="space-y-6 bg-oxford-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-medium border-b border-gray-800 pb-2 text-white">House Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" required value={formData.type} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off">
                  <option value="">Select Type</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="single">Single Room</option>
                  <option value="1br">1 Bedroom</option>
                  <option value="2br">2 Bedroom</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent (KES)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off">
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input type="number" name="rating" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Safety Rating</label>
                <input type="number" name="safetyRating" min="0" max="5" step="0.1" value={formData.safetyRating} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
            </div>
            {/* Middle Column - Location & Essentials */}
            <div className="space-y-6 bg-oxford-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-medium border-b border-gray-800 pb-2 text-white">Location</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Estate</label>
                <input type="text" name="location.estate" required value={formData.location.estate} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input type="text" name="location.address" value={formData.location.address} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
              </div>
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input type="number" name="location.coordinates.lat" value={formData.location.coordinates.lat} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input type="number" name="location.coordinates.lng" value={formData.location.coordinates.lng} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                  </div>
                  <button type="button" onClick={autofillLocation} className="h-10 px-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-xs whitespace-nowrap">Use My Location</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Walking (min)</label>
                  <input type="number" name="location.distanceFromUniversity.walking" value={formData.location.distanceFromUniversity.walking} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Boda (min)</label>
                  <input type="number" name="location.distanceFromUniversity.boda" value={formData.location.distanceFromUniversity.boda} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Matatu (min)</label>
                  <input type="number" name="location.distanceFromUniversity.matatu" value={formData.location.distanceFromUniversity.matatu} onChange={handleChange} className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nearby Essentials</label>
                {formData.location.nearbyEssentials.map((item: NearbyEssential, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" name={`nearby.${idx}.type`} placeholder="Type (shop, market, hospital)" value={item.type} onChange={handleChange} className="w-1/4 bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                    <input type="text" name={`nearby.${idx}.name`} placeholder="Name" value={item.name} onChange={handleChange} className="w-1/2 bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                    <input type="number" name={`nearby.${idx}.distance`} placeholder="Distance (m)" value={item.distance} onChange={handleChange} className="w-1/4 bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm p-3 autofill:bg-oxford-900" autoComplete="off" />
                    <button type="button" onClick={() => removeNearby(idx)} className="text-red-400 hover:text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addNearby} className="text-blue-400 hover:text-blue-600 text-sm mt-1">+ Add Nearby</button>
              </div>
            </div>
            {/* Right Column - Images, Amenities, Landlord */}
            <div className="space-y-6 bg-oxford-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-medium border-b border-gray-800 pb-2 text-white">Images & Amenities</h2>
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-lg bg-oxford-950 border border-gray-800 flex items-center justify-center overflow-hidden mb-2">
                  {imagePreviews.length > 0 ? (
                    <img src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={30} className="text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white text-sm py-1 px-3 rounded-md transition duration-200">
                  Upload Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreviews.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviews.slice(1).map((src: string, idx: number) => (
                      <img key={idx} src={src} alt="Preview" className="w-16 h-16 object-cover rounded border border-gray-800" />
                    ))}
                  </div>
                )}
                {formData.images.length > 5 && <div className="text-red-400 text-xs mt-1">Maximum 5 images allowed.</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amenities</label>
                {formData.amenities.map((item: Amenity, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select
                      name={`amenity.${idx}.name`}
                      value={item.name}
                      onChange={handleChange}
                      className="w-1/2 bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm p-3"
                    >
                      <option value="">Select Amenity</option>
                      {amenityOptions.map(opt => (
                        <option key={opt.name} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                    <div className="w-1/4 text-xs text-gray-400 flex items-center">
                      {item.icon && <span className="inline-block mr-1">{item.icon}</span>}
                    </div>
                    <label className="flex items-center text-xs">
                      <input type="checkbox" name={`amenity.${idx}.available`} checked={item.available} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 border-gray-800 rounded" />
                      <span className="ml-1">Available</span>
                    </label>
                    <button type="button" onClick={() => removeAmenity(idx)} className="text-red-400 hover:text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addAmenity} className="text-blue-400 hover:text-blue-600 text-sm mt-1">+ Add Amenity</button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Landlord</label>
                <select
                  name="landlordId"
                  required
                  value={formData.landlordId}
                  onChange={handleChange}
                  className="block w-full bg-oxford-900 border border-gray-800 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm transition-all sm:text-sm p-3"
                  disabled={loadingLandlords}
                >
                  <option value="">{loadingLandlords ? 'Loading landlords...' : 'Select Landlord'}</option>
                  {landlordOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {landlordError && <div className="text-red-400 text-xs mt-1">{landlordError}</div>}
              </div>
            </div>
          </div>
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800 w-full px-8">
          <button type="button" onClick={() => navigate('/listings')} className="px-4 py-2 bg-oxford-950 border border-gray-800 text-gray-300 rounded-md hover:bg-oxford-800 hover:text-white">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add House'}
          </button>
          {submitError && <div className="text-red-400 text-xs mt-2">{submitError}</div>}
        </div>
      </form>
    </div>
  );
};

export default AddHouse;
