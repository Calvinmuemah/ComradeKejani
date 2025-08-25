import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash, 
  Edit, 
  Phone,
  Mail,
  CheckCircle,
  Star,
  Clock,
  Ban,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/utils';
import { API_ENDPOINTS } from '../../lib/api';
import ToastContainer from '../../components/ui/ToastContainer';
import useToast from '../../components/ui/useToast';

import type { Landlord, LandlordFormData } from '../../types';

const initialForm: LandlordFormData = {
  name: '',
  phonePrimary: '',
  email: '',
  verified: false,
  responseRate: 0,
  avgResponseTime: 0,
  complaintCount: 0,
  rating: 3,
  isActive: true,
  isBlacklisted: false,
};


const LandlordsPage: React.FC = () => {
  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLandlordId, setDeleteLandlordId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenDelete = (landlord: Landlord) => {
    // Use _id if available, otherwise fallback to id
    const landlordId = landlord._id || landlord.id;
    // Type assertion to satisfy TypeScript
    setDeleteLandlordId(landlordId as string);
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setDeleteLandlordId(null);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');



  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<LandlordFormData>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLandlordId, setEditLandlordId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setForm(initialForm);
    setFormError(null);
    setShowAddModal(true);
  };
  const handleCloseAdd = () => setShowAddModal(false);

  const handleOpenEdit = (landlord: Landlord) => {
    console.log('Opening edit modal for landlord:', landlord);
    // Use _id if available, otherwise fallback to id
    const landlordId = landlord._id || landlord.id;
    // Type assertion to satisfy TypeScript
    setEditLandlordId(landlordId as string);
    const formData = {
      name: landlord.name || '',
      phonePrimary: landlord.phonePrimary || landlord.phone || '',
      email: landlord.email || '',
      verified: landlord.verified || false,
      rating: landlord.rating || 3,
      responseRate: landlord.responseRate || 0,
      avgResponseTime: landlord.avgResponseTime || 0,
      complaintCount: landlord.complaintCount || 0,
      isActive: landlord.isActive !== undefined ? landlord.isActive : true,
      isBlacklisted: landlord.isBlacklisted !== undefined ? landlord.isBlacklisted : false,
    };
    console.log('Setting initial form data:', formData);
    setForm(formData);
    setFormError(null);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditLandlordId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    console.log('Form field changed:', { name, value, type, checked });
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      console.log('Updated form state:', newForm);
      return newForm;
    });
  };

  const handleCreateLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    // Show pending toast
    const toastId = addToast('Creating landlord...', 'info');
    
    try {
      const payload = {
        name: form.name,
        phone: form.phonePrimary,
        email: form.email,
        verified: form.verified,
        rating: form.rating
      };
      console.log('Creating landlord with payload:', payload);
      console.log('POST request to:', API_ENDPOINTS.addLandlord);
      
      // Get the authentication token
      const authToken = sessionStorage.getItem('authToken');
      if (!authToken) {
        console.error('No authentication token found!');
        removeToast(toastId);
        addToast('Authentication error: Please log in again', 'error');
        throw new Error('You must be logged in to add landlords');
      }
      
      const res = await fetch(API_ENDPOINTS.addLandlord, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error('Error response:', errorData);
        removeToast(toastId);
        addToast(`Failed to add landlord: ${errorData?.error || 'Unknown error'}`, 'error');
        throw new Error('Failed to add landlord');
      }
      
      const responseData = await res.json();
      console.log('Landlord created successfully:', responseData);
      
      // Success toast
      removeToast(toastId);
      addToast(`Landlord ${form.name} created successfully!`, 'success');
      
      setShowAddModal(false);
      setForm(initialForm);
      
      // Update UI by adding the new landlord to the state directly
      setLandlords(prevLandlords => [responseData, ...prevLandlords]);
      
      // Optionally refresh all data in the background
      setTimeout(refreshData, 1000);
    } catch (err: unknown) {
      console.error('Error in handleCreateLandlord:', err);
      removeToast(toastId);
      if (err instanceof Error) {
        setFormError(err.message);
        addToast(err.message, 'error');
      } else {
        setFormError('Error creating landlord');
        addToast('Error creating landlord', 'error');
      }
    }
    setFormLoading(false);
  };
  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="warning">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };


  const getRatingStars = (rating: number | string | null | undefined) => {
    // Ensure rating is a number with fallback to 0 for null/undefined
    const numericRating = rating != null 
      ? (typeof rating === 'string' ? parseFloat(rating) || 0 : rating) 
      : 0;
    
    // Handle NaN case
    const safeRating = isNaN(numericRating) ? 0 : numericRating;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(safeRating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [localLoading, setLocalLoading] = useState(false); // For background operations
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // Removed duplicate declaration of intervalId
    let isUnmounted = false;

    const fetchLandlords = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      else setLocalLoading(true);
      
      setError(null);
      try {
        console.log('Fetching landlords from:', API_ENDPOINTS.landlords);
        const res = await fetch(API_ENDPOINTS.landlords);
        if (!res.ok) throw new Error('Failed to fetch landlords');
        const data = await res.json();
        console.log('Landlords data received:', data);
        if (!isUnmounted) setLandlords(data);
      } catch (err: unknown) {
        console.error('Error fetching landlords:', err);
        if (!isUnmounted) setError(err instanceof Error ? err.message : 'Error fetching landlords');
      }
      if (showLoading && !isUnmounted) setLoading(false);
      else if (!isUnmounted) setLocalLoading(false);
    };

    fetchLandlords(true);

    // Refetch every 10 minutes
    const intervalId = setInterval(() => {
      fetchLandlords(false);
    }, 10 * 60 * 1000);

    // Refetch when page/tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLandlords(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isUnmounted = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Reusable background fetch function
  const refreshData = async () => {
    setLocalLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.landlords);
      if (!res.ok) throw new Error('Failed to fetch landlords');
      const data = await res.json();
      setLandlords(data);
    } catch (err) {
      console.error('Error in background refresh:', err);
      // Silent fail - don't show error to user for background refreshes
    } finally {
      setLocalLoading(false);
    }
  };
  
  const filteredLandlords = landlords.filter(landlord => {
    const matchesSearch = landlord.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      landlord.phonePrimary?.includes(searchTerm) ||
      (landlord.email && landlord.email.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'verified') matchesStatus = landlord.verified;
    // Backend does not provide isBlacklisted/isActive, so treat all as active and not blacklisted for now
    else if (statusFilter === 'pending') matchesStatus = !landlord.verified;
    else if (statusFilter === 'blacklisted') matchesStatus = landlord.isBlacklisted;
    else if (statusFilter === 'active') matchesStatus = true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 bg-oxford-900 min-h-screen p-4">


      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Landlord Management</h1>
          <p className="text-gray-400">Manage property owners and their verification status</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-purple-700 border-0 px-6 py-2 rounded-xl font-semibold backdrop-blur-md backdrop-saturate-150"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Landlord
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Verified Landlords</p>
                <p className="text-2xl font-bold text-white">
                  {landlords.filter(l => l.verified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pending Verification</p>
                <p className="text-2xl font-bold text-white">
                  {landlords.filter(l => !l.verified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center rounded-full mr-2">{landlords.length}</Badge>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Landlords</p>
                <p className="text-2xl font-bold text-white">
                  {landlords.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">
                  {landlords.length > 0 ? (landlords.reduce((acc, l) => acc + (l.rating || 0), 0) / landlords.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refreshData()}
          disabled={localLoading}
          className="bg-gray-800 hover:bg-blue-900/40 border border-gray-800 hover:border-blue-700/50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 text-white ${localLoading ? 'animate-spin' : ''}`} />
          {localLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-oxford-900 border border-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="text-gray-400">Landlord Directory</CardTitle>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search landlords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700 border border-gray-800">
                <Filter className="h-4 w-4 mr-2 text-white" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Background loading indicator */}
          {localLoading && !loading && (
            <div className="fixed top-4 right-4 bg-blue-600/80 text-white py-1 px-3 rounded-full text-xs font-medium animate-pulse flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </div>
          )}
          <div className="space-y-8 relative">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading landlords...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">{error}</div>
            ) : filteredLandlords.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No landlords found.</div>
            ) : (
              <>
                {/* Vertical timeline line */}
                <div className="absolute left-3 top-1 bottom-8 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none"></div>
                
                {/* Loop through landlords */}
                {filteredLandlords.map(landlord => (
                  <div key={landlord._id || landlord.id} className="relative pl-10 group">
                    {/* Node */}
                    <div className={`absolute left-0 top-6 w-6 h-6 rounded-full flex items-center justify-center 
                      ${landlord.verified 
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]' 
                        : 'bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]'}`}>
                      {landlord.verified ? <CheckCircle className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
                    </div>
                    
                    {/* Content */}
                    <div className="border rounded-lg p-6 hover:shadow-xl transition-all duration-300 border-gray-800 bg-gray-900/80 hover:bg-gray-900 group-hover:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{landlord.name}</h3>
                            {getVerificationBadge(landlord.verified)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-4">
                            <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Contact</p>
                              <div className="space-y-2">
                                <p className="font-medium text-white flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-blue-400" />
                                  {landlord.phone || landlord.phonePrimary}
                                </p>
                                {landlord.email && (
                                  <p className="text-sm text-gray-300 flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                                    {landlord.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Rating</p>
                              {getRatingStars(landlord.rating || 0)}
                            </div>
                            
                            <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Joined</p>
                              <p className="font-medium text-white">{formatDate(landlord.createdAt)}</p>
                            </div>
                            
                            <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Last Updated</p>
                              <p className="font-medium text-white">{formatDate(landlord.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:self-start">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gray-800 hover:bg-red-900/40 border border-gray-800 hover:border-red-700/50 transition-colors"
                            onClick={() => handleOpenDelete(landlord)}
                          >
                            <Trash className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800 hover:bg-blue-900/40 border border-gray-800 hover:border-blue-700/50 transition-colors"
                            onClick={() => handleOpenEdit(landlord)}
                          >
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Add Landlord Modal */}
      <Modal isOpen={showAddModal} onClose={handleCloseAdd} title="Add New Landlord" className="border border-gray-800 max-w-6xl w-full">
        <form onSubmit={handleCreateLandlord} className="space-y-12">
          {/* Section 1: Personal Information */}
          <section className="relative pl-5" data-section="personal">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Personal Information <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
              <p className="text-xs text-gray-400">Provide the landlord's basic information.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="name" 
                  value={form.name} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Full Name" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rating</label>
                <Input 
                  name="rating" 
                  type="number" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={form.rating} 
                  onChange={handleFormChange} 
                  className="bg-oxford-900 border-gray-800" 
                />
                <div className="mt-1">
                  {getRatingStars(form.rating)}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Contact Information */}
          <section className="relative pl-5" data-section="contact">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Contact Information <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
              <p className="text-xs text-gray-400">How to reach the landlord.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="phonePrimary" 
                  value={form.phonePrimary} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Phone Number" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Email Address" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
            </div>
          </section>

          {/* Section 3: Status & Verification */}
          <section className="relative pl-5 pb-4" data-section="status">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Status & Verification <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
              <p className="text-xs text-gray-400">Verification status and account settings.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input 
                    type="checkbox" 
                    id="verified" 
                    name="verified" 
                    checked={form.verified} 
                    onChange={handleFormChange} 
                    className="w-4 h-4 rounded border-gray-700 bg-oxford-900 accent-emerald-500" 
                  />
                  <label htmlFor="verified" className="text-sm font-medium text-gray-300">Mark as Verified</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    name="isActive" 
                    checked={form.isActive} 
                    onChange={handleFormChange} 
                    className="w-4 h-4 rounded border-gray-700 bg-oxford-900 accent-blue-500" 
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Account</label>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Response Statistics</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Response Rate (%)</label>
                    <Input 
                      name="responseRate" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={form.responseRate} 
                      onChange={handleFormChange} 
                      className="bg-oxford-900 border-gray-800 h-8 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Avg Response Time (hours)</label>
                    <Input 
                      name="avgResponseTime" 
                      type="number" 
                      min="0" 
                      value={form.avgResponseTime} 
                      onChange={handleFormChange} 
                      className="bg-oxford-900 border-gray-800 h-8 text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && <div className="text-red-400 text-sm mt-4">{formError}</div>}
            
            <div className="mt-8 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCloseAdd} 
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading} 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-md shadow-emerald-600/20"
              >
                {formLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spinner" />
                    Creating...
                  </span>
                ) : 'Create Landlord'}
              </Button>
            </div>
          </section>
        </form>
      </Modal>

      {/* Edit Landlord Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEdit} title="Edit Landlord" className="border border-gray-800 max-w-6xl w-full">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            console.log('Edit form submitted');
            
            if (!editLandlordId) {
              console.error('No landlord ID set for edit', { editLandlordId });
              addToast('Error: No landlord ID found', 'error');
              setFormError('Error: No landlord ID found. Please try again.');
              return;
            }
            
            console.log('Edit landlord ID is set:', editLandlordId);
            setFormLoading(true);
            setFormError(null);
            
            // Show pending toast
            const toastId = addToast('Updating landlord...', 'info');
            
            try {
              // Ensure proper type conversion, especially for rating
              const payload = {
                name: form.name,
                email: form.email,
                phone: form.phonePrimary,
                verified: Boolean(form.verified),
                rating: Number(form.rating)
              };
              
              console.log('Updating landlord with ID:', editLandlordId);
              console.log('Update payload:', payload);
              console.log('PUT request to:', API_ENDPOINTS.landlordById(editLandlordId));
              
              // Get the authentication token
              const authToken = sessionStorage.getItem('authToken');
              if (!authToken) {
                console.error('No authentication token found!');
                removeToast(toastId);
                addToast('Authentication error: Please log in again', 'error');
                throw new Error('You must be logged in to update landlords');
              }
              
              const res = await fetch(API_ENDPOINTS.landlordById(editLandlordId), {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
              });
              
              if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error('Error response:', errorData);
                removeToast(toastId);
                addToast(`Failed to update landlord: ${errorData?.error || 'Unknown error'}`, 'error');
                throw new Error('Failed to update landlord');
              }
              
              const responseData = await res.json();
              console.log('Landlord updated successfully:', responseData);
              
              // Success toast
              removeToast(toastId);
              addToast(`Landlord ${payload.name} updated successfully!`, 'success');
              
              // Update landlord in UI - check both id and _id
              setLandlords((prev) => prev.map(l => {
                const landlordId = l._id || l.id;
                const editId = editLandlordId;
                return landlordId === editId ? { ...l, ...payload } : l;
              }));
              
              // Optionally refresh all data in the background
              setTimeout(refreshData, 1000);
              
              setShowEditModal(false);
              setEditLandlordId(null);
            } catch (err: unknown) {
              console.error('Error in update landlord:', err);
              removeToast(toastId);
              setFormError(err instanceof Error ? err.message : 'Error updating landlord');
            }
            setFormLoading(false);
          }}
          className="space-y-12"
        >
          {/* Section 1: Personal Information */}
          <section className="relative pl-5" data-section="personal">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Personal Information <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
              <p className="text-xs text-gray-400">Update the landlord's basic information.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="name" 
                  value={form.name} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Full Name" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rating</label>
                <Input 
                  name="rating" 
                  type="number" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={form.rating} 
                  onChange={handleFormChange} 
                  className="bg-oxford-900 border-gray-800" 
                />
                <div className="mt-1">
                  {getRatingStars(form.rating)}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Contact Information */}
          <section className="relative pl-5" data-section="contact">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Contact Information <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
              <p className="text-xs text-gray-400">Update contact details.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="phonePrimary" 
                  value={form.phonePrimary} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Phone Number" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address <span className="text-red-400 ml-0.5">*</span></label>
                <Input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Email Address" 
                  className="bg-oxford-900 border-gray-800" 
                />
              </div>
            </div>
          </section>

          {/* Section 3: Status & Verification */}
          <section className="relative pl-5 pb-4" data-section="status">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]" />
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Status & Verification <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
              <p className="text-xs text-gray-400">Update verification status and account settings.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input 
                    type="checkbox" 
                    id="edit-verified" 
                    name="verified" 
                    checked={form.verified} 
                    onChange={handleFormChange} 
                    className="w-4 h-4 rounded border-gray-700 bg-oxford-900 accent-emerald-500" 
                  />
                  <label htmlFor="edit-verified" className="text-sm font-medium text-gray-300">Mark as Verified</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-isActive" 
                    name="isActive" 
                    checked={form.isActive} 
                    onChange={handleFormChange} 
                    className="w-4 h-4 rounded border-gray-700 bg-oxford-900 accent-blue-500" 
                  />
                  <label htmlFor="edit-isActive" className="text-sm font-medium text-gray-300">Active Account</label>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Response Statistics</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Response Rate (%)</label>
                    <Input 
                      name="responseRate" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={form.responseRate} 
                      onChange={handleFormChange} 
                      className="bg-oxford-900 border-gray-800 h-8 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Avg Response Time (hours)</label>
                    <Input 
                      name="avgResponseTime" 
                      type="number" 
                      min="0" 
                      value={form.avgResponseTime} 
                      onChange={handleFormChange} 
                      className="bg-oxford-900 border-gray-800 h-8 text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && <div className="text-red-400 text-sm mt-4">{formError}</div>}
            
            <div className="mt-8 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCloseEdit} 
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading} 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-md shadow-emerald-600/20"
              >
                {formLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spinner" />
                    Updating...
                  </span>
                ) : 'Update Landlord'}
              </Button>
            </div>
          </section>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseDelete} title="Delete Landlord" tone="danger" className="border border-gray-800 max-w-lg w-full">
        <div className="space-y-6">
          <div className="relative pl-5" data-section="delete">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-rose-600 to-red-600 border border-rose-400/30 shadow-[0_0_0_2px_rgba(225,29,72,0.35)]" />
            
            <div className="pl-2">
              <p className="text-gray-300 mb-2">Are you sure you want to delete this landlord?</p>
              <div className="bg-rose-950/20 text-rose-200 p-4 rounded-md border border-rose-900/50 text-sm">
                <p className="flex items-center gap-2"><Ban size={16} /> This action cannot be undone.</p>
                <p className="mt-1 text-xs text-rose-300/70">All associated listings will remain but will no longer be connected to this landlord.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              onClick={handleCloseDelete} 
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-md shadow-rose-600/20"
              onClick={async () => {
                if (!deleteLandlordId) {
                  addToast('Error: No landlord ID found', 'error');
                  return;
                }
                
                setDeleteLoading(true);
                
                // Show pending toast
                const toastId = addToast('Deleting landlord...', 'info');
                
                try {
                  console.log('Deleting landlord with ID:', deleteLandlordId);
                  console.log('DELETE request to:', API_ENDPOINTS.deleteLandlordById(deleteLandlordId));
                  
                  // Get the authentication token
                  const authToken = sessionStorage.getItem('authToken');
                  if (!authToken) {
                    console.error('No authentication token found!');
                    removeToast(toastId);
                    addToast('Authentication error: Please log in again', 'error');
                    throw new Error('You must be logged in to delete landlords');
                  }
                  
                  const res = await fetch(API_ENDPOINTS.deleteLandlordById(deleteLandlordId), {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${authToken}`
                    }
                  });
                  
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => null);
                    console.error('Error response:', errorData);
                    removeToast(toastId);
                    addToast(`Failed to delete landlord: ${errorData?.error || 'Unknown error'}`, 'error');
                    throw new Error('Failed to delete landlord');
                  }
                  
                  const responseData = await res.json().catch(() => ({ message: 'Landlord deleted successfully' }));
                  console.log('Delete response:', responseData);
                  
                  // Success toast
                  removeToast(toastId);
                  addToast('Landlord deleted successfully!', 'success');
                  
                  // Update UI by filtering out the deleted landlord - check both id and _id
                  setLandlords((prev) => prev.filter(l => {
                    const landlordId = l._id || l.id;
                    const deleteId = deleteLandlordId;
                    return landlordId !== deleteId;
                  }));
                  
                  // Optionally refresh all data in the background
                  setTimeout(refreshData, 1000);
                  
                  setShowDeleteModal(false);
                  setDeleteLandlordId(null);
                } catch (error) {
                  console.error('Error in delete landlord:', error);
                  removeToast(toastId);
                  addToast('Error deleting landlord', 'error');
                } finally {
                  setDeleteLoading(false);
                }
              }}
            >
              {deleteLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spinner" />
                  Deleting...
                </span>
              ) : 'Delete Landlord'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default LandlordsPage;