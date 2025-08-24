import React, { useState } from 'react';
import { Listing } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
	Building,
	Plus,
	Search,
	Filter,
	Eye,
	Edit,
	Trash2,
	MapPin,
	Phone,
	CheckCircle,
	Clock,
	Upload,
	Download,
	MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/useAuth';
import { Permission } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

import { useEffect } from 'react';
import { API_ENDPOINTS } from '../../lib/api';
import './listings-glow.css';

const ListingsPage: React.FC = () => {
	const [listings, setListings] = useState<Listing[]>([]);
	const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
       // Fetch listings from backend
       useEffect(() => {
	       const fetchListings = async () => {
		       try {
			       const res = await fetch(API_ENDPOINTS.housesGetAll || 'https://comradekejani-k015.onrender.com/api/v1/houses/getAll');
			       if (!res.ok) throw new Error('Failed to fetch listings');
			       const data = await res.json();
			       setListings(data);
		       } catch {
			       setListings([]);
			       // Optionally handle error (e.g., show toast)
		       }
	       };
	       fetchListings();
       }, []);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const { hasPermission } = useAuth();
	const navigate = useNavigate();

       const filteredListings = listings.filter(listing => {
	       const matchesSearch = (listing.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
		       (listing.location?.estate?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
		       (listing.landlord?.name?.toLowerCase() || '');
	       const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
	       return matchesSearch && matchesStatus;
       });

       // Show delete confirmation modal
       const handleDeleteClick = (listing: Listing) => {
	       setDeleteTarget(listing);
	       setShowDeleteModal(true);
       };

       // Confirm delete and call backend
       const handleConfirmDelete = async () => {
	       if (!deleteTarget) return;
	       try {
		       const res = await fetch(API_ENDPOINTS.houseById(deleteTarget._id || deleteTarget.id), {
			       method: 'DELETE',
		       });
		       if (!res.ok) throw new Error('Failed to delete house');
		       setListings(prev => prev.filter(listing => (listing._id || listing.id) !== (deleteTarget._id || deleteTarget.id)));
		       setShowDeleteModal(false);
		       setDeleteTarget(null);
	       } catch {
		       // Optionally show error toast
		       setShowDeleteModal(false);
		       setDeleteTarget(null);
	       }
       };

       const stats = {
	       total: listings.length,
	       published: listings.filter(l => l.status === 'published').length,
	       pending: listings.filter(l => l.status === 'in_review').length,
	       draft: listings.filter(l => l.status === 'draft').length
       };

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-white">Listings Management</h1>
					<p className="text-gray-400">Manage all property listings and their lifecycle</p>
				</div>
				<div className="flex space-x-3">
					{hasPermission(Permission.BULK_IMPORT_LISTINGS) && (
						<Button variant="outline" className="flex items-center space-x-2">
							<Upload className="h-4 w-4" />
							<span>Import CSV</span>
						</Button>
					)}
					{hasPermission(Permission.BULK_EXPORT_LISTINGS) && (
						<Button variant="outline" className="flex items-center space-x-2">
							<Download className="h-4 w-4" />
							<span>Export</span>
						</Button>
					)}
													{hasPermission(Permission.CREATE_LISTING) && (
														<Button onClick={() => navigate('/listings/add')} className="flex items-center space-x-2">
															<Plus className="h-4 w-4" />
															<span>Add Listing</span>
														</Button>
													)}
				</div>
			</div>

					{/* Stats Overview */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<Card className="bg-oxford-900 border border-gray-800">
							<CardContent className="p-6">
								<div className="flex items-center">
									<Building className="h-8 w-8 text-blue-600" />
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-400">Total Listings</p>
										<p className="text-2xl font-bold text-white">{stats.total}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-oxford-900 border border-gray-800">
							<CardContent className="p-6">
								<div className="flex items-center">
									<CheckCircle className="h-8 w-8 text-green-600" />
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-400">Published</p>
										<p className="text-2xl font-bold text-white">{stats.published}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-oxford-900 border border-gray-800">
							<CardContent className="p-6">
								<div className="flex items-center">
									<Clock className="h-8 w-8 text-yellow-600" />
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-400">Pending Review</p>
										<p className="text-2xl font-bold text-white">{stats.pending}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-oxford-900 border border-gray-800">
							<CardContent className="p-6">
								<div className="flex items-center">
									<Edit className="h-8 w-8 text-gray-600" />
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-400">Drafts</p>
										<p className="text-2xl font-bold text-white">{stats.draft}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

			{/* Filters and Search */}
					<Card className="bg-oxford-900 border border-gray-800">
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search listings, zones, or landlords..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 bg-oxford-900 border-gray-800"
										/>
									</div>
								</div>
								<div className="flex gap-2">
																	<select
																		value={statusFilter}
																		onChange={(e) => setStatusFilter(e.target.value)}
																		className="px-3 py-2 bg-oxford-900 border border-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
																		style={{ backgroundImage: 'none' }}
																	>
																		<option value="all">All Status</option>
																		<option value="draft">Draft</option>
																		<option value="in_review">In Review</option>
																		<option value="published">Published</option>
																		<option value="paused">Paused</option>
																		<option value="archived">Archived</option>
																	</select>
																	<Button 
																		variant="outline" 
																		size="sm" 
																		className="bg-oxford-900 border border-gray-800 text-gray-300 hover:bg-oxford-800 hover:text-white"
																		style={{ backgroundColor: 'transparent' }}
																	>
																		<Filter className="h-4 w-4" />
																	</Button>
								</div>
							</div>
						</CardContent>
					</Card>

			{/* Listings Table */}
					<Card className="bg-oxford-900 border border-gray-800">
						<CardHeader>
							<CardTitle>All Listings ({filteredListings.length})</CardTitle>
							<CardDescription>Manage property listings and their status</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-800">
											<th className="text-left py-3 px-4 font-medium text-gray-400">Property</th>
											<th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
											<th className="text-left py-3 px-4 font-medium text-gray-400">Landlord</th>
											<th className="text-left py-3 px-4 font-medium text-gray-400">Performance</th>
											<th className="text-left py-3 px-4 font-medium text-gray-400">Updated</th>
											<th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredListings.map((listing) => (
											<tr key={listing.id} className="property-row border-b border-gray-800">
												<td className="py-4 px-4">
													<div className="flex items-center space-x-3">
														<div className="flex-shrink-0">
															<div className="w-12 h-12 bg-oxford-800 rounded-lg flex items-center justify-center">
																<Building className="h-6 w-6 text-gray-400" />
															</div>
														</div>
														<div>
															<p className="font-medium text-white">{listing.title}</p>
															<div className="flex items-center space-x-2 text-sm text-gray-400">
																<MapPin className="h-3 w-3" />
																   <span>{listing.location?.estate || '-'}</span>
																   <span>•</span>
																   <span>{listing.type || '-'}</span>
																   <span>•</span>
																   <span>{formatCurrency(listing.price || 0, 'KES')}</span>
															</div>
														</div>
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="flex items-center space-x-2">
								       <Badge variant={listing.status === 'published' ? 'success' : listing.status === 'in_review' ? 'warning' : 'secondary'}>
									       {listing.status?.replace('_', ' ') || 'vacant'}
								       </Badge>
													</div>
												</td>
												<td className="py-4 px-4">
													<div>
								       <p className="font-medium text-white">{listing.landlord?.name || '-'}</p>
								       <div className="flex items-center text-sm text-gray-400">
									       <Phone className="h-3 w-3 mr-1" />
									       {listing.landlord?.phone || '-'}
								       </div>
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm">
														<div className="flex items-center text-gray-400">
															<Eye className="h-3 w-3 mr-1" />
															   <span>{listing.views || 0} views</span>
														</div>
														<div className="flex items-center text-gray-400">
															<Phone className="h-3 w-3 mr-1" />
															   <span>{listing.contactClicks || 0} contacts</span>
														</div>
													</div>
												</td>
												<td className="py-4 px-4">
							       <p className="text-sm text-gray-400">
								       {formatDate(listing.updatedAt)}
							       </p>
												</td>
												<td className="py-4 px-4">
													<div className="flex items-center space-x-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedListing(listing);
																setShowDetailsModal(true);
															}}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button variant="ghost" size="sm">
															<Edit className="h-4 w-4" />
														</Button>
														   <Button
															   variant="ghost"
															   size="sm"
															   onClick={() => handleDeleteClick(listing)}
														   >
															   <Trash2 className="h-4 w-4" />
														   </Button>
		   {/* Delete Confirmation Modal */}
		   <Modal
			   isOpen={showDeleteModal}
			   onClose={() => setShowDeleteModal(false)}
			   title="Delete Listing"
		   >
			   <div className="space-y-4">
				   <p className="text-white">Are you sure you want to delete <span className="font-bold">{deleteTarget?.title}</span>? This action cannot be undone.</p>
				   <div className="flex justify-end space-x-3 pt-4">
					   <Button variant="dark" onClick={() => setShowDeleteModal(false)}>
						   Cancel
					   </Button>
					   <Button variant="destructive" onClick={handleConfirmDelete}>
						   Delete
					   </Button>
				   </div>
			   </div>
		   </Modal>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

			{/* Listing Details Modal */}
			<Modal
				isOpen={showDetailsModal}
				onClose={() => setShowDetailsModal(false)}
				title="Listing Details"
			>
		       {selectedListing && (
			       <div className="space-y-4">
				       <div>
					       <h3 className="text-lg font-semibold text-white">{selectedListing.title}</h3>
					       <p className="text-gray-400">{selectedListing.location?.estate || '-'} • {selectedListing.type || '-'}</p>
				       </div>
				       <div className="grid grid-cols-2 gap-4">
					       <div>
						       <p className="text-sm text-gray-400">Monthly Rent</p>
						       <p className="text-white font-medium">{formatCurrency(selectedListing.price || 0, 'KES')}</p>
					       </div>
					       <div>
						       <p className="text-sm text-gray-400">Status</p>
						       <Badge variant={selectedListing.status === 'published' ? 'success' : 'warning'}>
							       {selectedListing.status?.replace('_', ' ') || 'vacant'}
						       </Badge>
					       </div>
				       </div>
				       <div>
					       <p className="text-sm text-gray-400">Landlord</p>
					       <p className="text-white">{selectedListing.landlord?.name || '-'}</p>
					       <p className="text-gray-400">{selectedListing.landlord?.phone || '-'}</p>
				       </div>
				       <div className="grid grid-cols-2 gap-4">
					       <div>
						       <p className="text-sm text-gray-400">Views</p>
						       <p className="text-white font-medium">{selectedListing.views || 0}</p>
					       </div>
					       <div>
						       <p className="text-sm text-gray-400">Contact Clicks</p>
						       <p className="text-white font-medium">{selectedListing.contactClicks || 0}</p>
					       </div>
				       </div>
				       <div className="flex justify-end space-x-3 pt-4">
					       <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
						       Close
					       </Button>
					       <Button>
						       Edit Listing
					       </Button>
				       </div>
			       </div>
		       )}
			</Modal>
		</div>
	);
};

export default ListingsPage;