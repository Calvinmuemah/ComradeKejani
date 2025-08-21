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
  Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/utils';
import { API_ENDPOINTS } from '../../lib/api';

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
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLandlordId, setDeleteLandlordId] = useState<string | null>(null);

  const handleOpenDelete = (landlord: Landlord) => {
    setDeleteLandlordId(landlord._id);
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
    setEditLandlordId(landlord._id);
    setForm({
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
    });
    setFormError(null);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditLandlordId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
  const res = await fetch(API_ENDPOINTS.addLandlord, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phonePrimary,
          email: form.email,
          verified: form.verified,
          rating: form.rating
        })
      });
      if (!res.ok) throw new Error('Failed to add landlord');
      setShowAddModal(false);
      setForm(initialForm);
      // Refetch landlords
      setLoading(true);
      setTimeout(() => window.location.reload(), 500); // quick reload for now
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error creating landlord');
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


  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // Removed duplicate declaration of intervalId
    let isUnmounted = false;

    const fetchLandlords = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.landlords);
        if (!res.ok) throw new Error('Failed to fetch landlords');
        const data = await res.json();
        if (!isUnmounted) setLandlords(data);
      } catch (err: unknown) {
        if (!isUnmounted) setError(err instanceof Error ? err.message : 'Error fetching landlords');
      }
      if (showLoading && !isUnmounted) setLoading(false);
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
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading landlords...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">{error}</div>
            ) : filteredLandlords.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No landlords found.</div>
            ) : (
              filteredLandlords.map((landlord) => (
                <div key={landlord._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-gray-800 bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{landlord.name}</h3>
                        {getVerificationBadge(landlord.verified)}
                        {/* No isActive/isBlacklisted in backend, so skip status badge */}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-400">Contact</p>
                          <div className="space-y-1">
                            <p className="font-medium text-white flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {landlord.phone || landlord.phonePrimary}
                            </p>
                            {landlord.email && (
                              <p className="text-sm text-gray-400 flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {landlord.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Rating</p>
                          {getRatingStars(landlord.rating || 0)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Joined</p>
                          <p className="font-medium text-white">{formatDate(landlord.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Last Updated</p>
                          <p className="font-medium text-white">{formatDate(landlord.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700 border border-gray-800" onClick={() => handleOpenDelete(landlord)}>
                        <Trash className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 hover:bg-gray-700 border border-gray-800"
                        onClick={() => handleOpenEdit(landlord)}
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {/* Add Landlord Modal */}
      <Modal isOpen={showAddModal} onClose={handleCloseAdd} title="Add New Landlord" size="md">
        <form onSubmit={handleCreateLandlord} className="space-y-4">
          {/* ...existing code for add landlord form... */}
          <div className="p-8 rounded-2xl shadow-2xl border-2 bg-gradient-to-br from-[#181c2f] via-[#23263a] to-[#181c2f] border-blue-500/40 relative overflow-hidden" style={{ boxShadow: '0 0 24px 4px #3b82f6, 0 0 80px 8px #a78bfa44' }}>
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-blue-500/60 animate-pulse" style={{boxShadow:'0 0 32px 8px #6366f1, 0 0 80px 8px #a78bfa55'}}></div>
            <div className="relative z-10">
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Name</label>
                <Input name="name" value={form.name} onChange={handleFormChange} required placeholder="Full Name" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Email</label>
                <Input name="email" value={form.email} onChange={handleFormChange} type="email" required placeholder="Email Address" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Phone</label>
                <Input name="phonePrimary" value={form.phonePrimary} onChange={handleFormChange} required placeholder="Phone Number" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6 flex items-center space-x-4">
                <label className="text-lg text-blue-200 font-bold">Verified</label>
                <input type="checkbox" name="verified" checked={form.verified} onChange={handleFormChange} className="accent-blue-500 w-5 h-5" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Rating</label>
                <Input name="rating" value={form.rating} onChange={handleFormChange} type="number" min={1} max={5} step={0.1} required className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              {formError && <div className="text-red-400 text-sm mb-2">{formError}</div>}
              <div className="flex justify-end space-x-2 mt-8">
                <Button type="button" variant="secondary" onClick={handleCloseAdd} className="bg-[#23263a] border-blue-500/30 text-blue-200 hover:bg-[#181c2f]">Cancel</Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-purple-700 border-0 px-6 py-2 rounded-xl font-semibold ring-2 ring-blue-400/40 focus:ring-4 focus:ring-purple-400/60 focus:outline-none transition-all duration-200"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Landlord'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Landlord Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEdit} title="Edit Landlord" size="md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editLandlordId) return;
            setFormLoading(true);
            setFormError(null);
            try {
              const payload: any = {
                name: form.name,
                email: form.email,
                phone: form.phonePrimary,
                verified: form.verified,
                rating: form.rating
              };
              const res = await fetch(`${API_ENDPOINTS.landlords}/Landlord/${editLandlordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (!res.ok) throw new Error('Failed to update landlord');
              // Update landlord in UI
              setLandlords((prev) => prev.map(l => l._id === editLandlordId ? { ...l, ...payload } : l));
              setShowEditModal(false);
              setEditLandlordId(null);
            } catch (err: any) {
              setFormError(err?.message || 'Error updating landlord');
            }
            setFormLoading(false);
          }}
          className="space-y-4"
        >
          <div className="p-8 rounded-2xl shadow-2xl border-2 bg-gradient-to-br from-[#181c2f] via-[#23263a] to-[#181c2f] border-blue-500/40 relative overflow-hidden" style={{ boxShadow: '0 0 24px 4px #3b82f6, 0 0 80px 8px #a78bfa44' }}>
            <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-blue-500/60 animate-pulse" style={{boxShadow:'0 0 32px 8px #6366f1, 0 0 80px 8px #a78bfa55'}}></div>
            <div className="relative z-10">
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Name</label>
                <Input name="name" value={form.name} onChange={handleFormChange} required placeholder="Full Name" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Email</label>
                <Input name="email" value={form.email} onChange={handleFormChange} type="email" required placeholder="Email Address" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Phone</label>
                <Input name="phonePrimary" value={form.phonePrimary} onChange={handleFormChange} required placeholder="Phone Number" className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              <div className="mb-6 flex items-center space-x-4">
                <label className="text-lg text-blue-200 font-bold">Verified</label>
                <input type="checkbox" name="verified" checked={form.verified} onChange={handleFormChange} className="accent-blue-500 w-5 h-5" />
              </div>
              <div className="mb-6">
                <label className="block text-lg text-blue-200 font-bold mb-1 tracking-wide">Rating</label>
                <Input name="rating" value={form.rating} onChange={handleFormChange} type="number" min={1} max={5} step={0.1} required className="bg-[#23263a] border-blue-500/30 text-white placeholder:text-blue-300" />
              </div>
              {formError && <div className="text-red-400 text-sm mb-2">{formError}</div>}
              <div className="flex justify-end space-x-2 mt-8">
                <Button type="button" variant="secondary" onClick={handleCloseEdit} className="bg-[#23263a] border-blue-500/30 text-blue-200 hover:bg-[#181c2f]">Cancel</Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-purple-700 border-0 px-6 py-2 rounded-xl font-semibold ring-2 ring-blue-400/40 focus:ring-4 focus:ring-purple-400/60 focus:outline-none transition-all duration-200"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : 'Save Details'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
      {/* Delete Landlord Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseDelete} title="Delete Landlord" size="sm">
        <div className="p-6">
          <p className="text-lg text-white mb-4">Are you sure you want to delete this landlord? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={handleCloseDelete} className="bg-[#23263a] border-blue-500/30 text-blue-200 hover:bg-[#181c2f]">Cancel</Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/40 hover:from-red-600 hover:to-pink-700 border-0 px-6 py-2 rounded-xl font-semibold ring-2 ring-red-400/40 focus:ring-4 focus:ring-pink-400/60 focus:outline-none transition-all duration-200"
              onClick={async () => {
                if (!deleteLandlordId) return;
                try {
                  const res = await fetch(`${API_ENDPOINTS.landlords}/Landlords/${deleteLandlordId}`, {
                    method: 'DELETE',
                  });
                  if (!res.ok) throw new Error('Failed to delete landlord');
                  setLandlords((prev) => prev.filter(l => l._id !== deleteLandlordId));
                  setShowDeleteModal(false);
                  setDeleteLandlordId(null);
                } catch (err) {
                  alert('Error deleting landlord');
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandlordsPage;