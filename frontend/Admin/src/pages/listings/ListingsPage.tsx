import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Listing, Permission, Review, ListingStatus } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building, Plus, Search, Filter, Info, Edit, Trash2, MapPin, Phone, Clock, Download, Shield as ShieldIcon, Sparkles, ArrowUp, ArrowDown, Ban, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/useAuth';
import { formatCurrency, formatDate } from '../../lib/utils';
import { API_ENDPOINTS, apiFetch, updateHouse, fetchHouseViewsCount, fetchLandlordViewsCount } from '../../lib/api';
import StarRating from '../../components/ui/StarRating';
import './listings-glow.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { buildDailySeries, buildHourlySeries24h } from '../../lib/series';

const ListingsPage: React.FC = () => {
	const navigate = useNavigate();
	const { hasPermission } = useAuth();
	const location = useLocation();

	// Handle state from AddHousePage
	useEffect(() => {
		if (location.state?.refreshNeeded) {
			// Refresh data when coming back from AddHousePage
			refreshData();
			
			// Clear state
			navigate('/listings', { replace: true });
		}
	}, [location.state, navigate]);

	// State
	const [listings, setListings] = useState<Listing[]>([]);
	const [metrics, setMetrics] = useState<Record<string, { views: number; landlordViews: number }>>({});
	const [loading, setLoading] = useState(true);
	const [localLoading, setLocalLoading] = useState(false); // For background operations
	const [searchTerm, setSearchTerm] = useState('');
	// Status filtering removed – all listings treated as published
	const [reviews, setReviews] = useState<Review[]>([]);
	const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Listing | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState<{ title: string; price: string; type: string; status: string; landlordId: string; images: File[]; replaceImages: boolean }>({ title: '', price: '', type: '', status: '', landlordId: '', images: [], replaceImages: false });
	const [landlordOptions, setLandlordOptions] = useState<Array<{ id: string; name: string }>>([]);
	const [loadingLandlords, setLoadingLandlords] = useState(false);
	const [landlordError, setLandlordError] = useState<string | null>(null);
	const [updating, setUpdating] = useState(false);
	const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [syncing, setSyncing] = useState(false);
	const [notices, setNotices] = useState<{ id: string; msg: string }[]>([]);
	// autoSync & manual sync controls removed per request; polling always on
	const autoSync = true;
	const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set()); // highlight IDs retained
	const [sort, setSort] = useState<{ key: 'price' | 'updatedAt' | 'views'; dir: 'asc' | 'desc' } | null>(null);
	const [chartRange, setChartRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
	const [history, setHistory] = useState<Array<{ ts:number; listingId:string; views:number; landlordViews:number; reviews:number; dViews:number; dReviews:number }>>([]);
	const [showListings, setShowListings] = useState(true);
	const [showReviews, setShowReviews] = useState(true);
	const [showViews, setShowViews] = useState(true);
	const [showMarkers, setShowMarkers] = useState(true);
	const [showSpikes, setShowSpikes] = useState(true);
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [exportColumns, setExportColumns] = useState<string[]>([]); // empty means all
	const soundEnabled = false; // sound notifications disabled per UI simplification
	const previousSafetyRef = useRef<Map<string, number>>(new Map());
	const audioRef = useRef<HTMLAudioElement | null>(null);
	if (!audioRef.current) {
		// Simple beep (440Hz 150ms) base64 wav
		audioRef.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAAA');
	}

	// Fetch listings
		useEffect(() => {
			let cancelled = false;
			const initialLoad = async () => {
				setLoading(true);
				try {
					const res = await apiFetch(API_ENDPOINTS.housesGetAll, { auth: true });
					if (!res.ok) throw new Error('Failed to fetch');
					const data = await res.json();
					if (!cancelled) setListings(Array.isArray(data) ? data : []);
				} catch {
					if (!cancelled) setListings([]);
				} finally {
					if (!cancelled) setLoading(false);
				}
			};
			initialLoad();

			// polling every 3s
			const poll = async () => {
				if (!autoSync || syncing) return; // prevent overlap or paused
				setSyncing(true);
				try {
					const res = await apiFetch(API_ENDPOINTS.housesGetAll, { auth: true });
					if (!res.ok) throw new Error('poll failed');
					const data = await res.json();
					if (!Array.isArray(data)) return;
					// Compare
					setListings(prev => {
						const prevIds = new Set(prev.map(l => (l._id || l.id) as string));
						const newItems = data.filter((d: Listing) => !prevIds.has((d._id || d.id) as string));
						const changed = newItems.length > 0 || data.length !== prev.length;
						// Update existing ordering: keep previous order, append new at end (as requested)
						if (!changed) return prev; // no change => no re-render / metrics re-fetch
						if (newItems.length) {
							const id = Date.now().toString();
							setNotices(n => [...n, { id, msg: newItems.length === 1 ? '1 new listing added' : `${newItems.length} new listings added` }]);
							setHighlightIds(h => {
								const next = new Set(h);
								newItems.forEach(it => next.add((it._id || it.id) as string));
								setTimeout(() => setHighlightIds(curr => {
									const copy = new Set(curr);
									newItems.forEach(it => copy.delete((it._id || it.id) as string));
									return copy;
								}), 4000);
								if (soundEnabled) audioRef.current?.play().catch(()=>{});
								newItems.forEach(it => previousSafetyRef.current.set((it._id || it.id) as string, (it as Listing).safetyRating ?? 0));
								return next;
							});
						}
						// Build map for quick updated fields merge
						const incomingMap = new Map<string, Listing>();
						data.forEach((d: Listing) => incomingMap.set((d._id || d.id) as string, d));
						const mergedExisting = prev.map(p => incomingMap.get((p._id || p.id) as string) || p);
						// append new (those not in prev)
						const incomingIds = new Set(prev.map(p => (p._id || p.id) as string));
						const append = data.filter((d: Listing) => !incomingIds.has((d._id || d.id) as string));
						// track safety trend for existing ones
						append.forEach(it => previousSafetyRef.current.set((it._id || it.id) as string, (it as Listing).safetyRating ?? 0));
						return [...mergedExisting, ...append];
					});
				} catch {/* ignore */} finally {
					if (!cancelled) setSyncing(false);
				}
			};
			const intervalId = setInterval(poll, 3000);
			return () => { cancelled = true; clearInterval(intervalId); };
		}, [syncing, autoSync, soundEnabled]);

	// Fetch metrics (also build history for hourly deltas)
	useEffect(() => {
		if (!listings.length) return;
		let cancelled = false;
		(async () => {
			const entries = await Promise.all(listings.map(async l => {
				const id = String((l._id || l.id) ?? '');
				if (!id) return ['', { views: 0, landlordViews: 0 }] as const;
				try {
					// attempt to derive landlord id from multiple possible shapes
					const landlordId = (() => {
						const ll: unknown = (l as unknown as { landlord?: unknown }).landlord;
						if (ll && typeof ll === 'object') {
							const obj = ll as { _id?: string; id?: string };
							return obj._id || obj.id;
						}
						if (typeof ll === 'string') return ll;
						return (l as unknown as { landlordId?: string }).landlordId;
					})();
					const [views, landlordViews] = await Promise.all([
						fetchHouseViewsCount(id),
						landlordId ? fetchLandlordViewsCount(landlordId) : Promise.resolve(0)
					]);
					return [id, { views, landlordViews }] as const;
				} catch {
					return [id, { views: 0, landlordViews: 0 }] as const;
				}
			}));
			if (!cancelled) {
				const obj = Object.fromEntries(entries.filter(e => e[0]));
				setMetrics(obj);
				const now = Date.now();
				setHistory(prev => {
					const latest: Record<string,{ views:number; reviews:number }> = {};
					for (let i=prev.length-1;i>=0;i--) { const h=prev[i]; if (!(h.listingId in latest)) latest[h.listingId] = { views:h.views, reviews:h.reviews }; }
					const additions: typeof prev = [];
					listings.forEach(l => {
						const id = String(l._id || l.id); if (!id) return;
						const views = obj[id]?.views ?? 0;
						const reviewsCount = reviews.filter(r => r.listingId === id).length;
						const prior = latest[id];
						const dViews = prior ? Math.max(0, views - prior.views) : 0;
						const dReviews = prior ? Math.max(0, reviewsCount - prior.reviews) : 0;
						if (dViews>0 || dReviews>0 || !prior) additions.push({ ts: now, listingId:id, views, landlordViews: obj[id]?.landlordViews ?? 0, reviews: reviewsCount, dViews, dReviews });
					});
					const cutoff = now - 7*24*60*60*1000;
					return [...prev.filter(h => h.ts >= cutoff), ...additions];
				});
			}
		})();
		return () => { cancelled = true; };
		}, [listings, reviews]);

	// Derived
	const filteredListings = useMemo(() => listings.filter(listing => {
		const t = searchTerm.toLowerCase();
		return (listing.title || '').toLowerCase().includes(t) || (listing.location?.estate || '').toLowerCase().includes(t) || (listing.landlord?.name || '').toLowerCase().includes(t);
	}), [listings, searchTerm]);

	const sortedListings = useMemo(() => {
		if (!sort) return filteredListings;
		const copy = [...filteredListings];
		copy.sort((a,b) => {
			const dir = sort.dir === 'asc' ? 1 : -1;
			if (sort.key === 'price') return ((a.price||0) - (b.price||0)) * dir;
			if (sort.key === 'updatedAt') return (new Date(a.updatedAt||0).getTime() - new Date(b.updatedAt||0).getTime()) * dir;
			if (sort.key === 'views') {
				const av = metrics[(a._id||a.id) as string]?.views || 0;
				const bv = metrics[(b._id||b.id) as string]?.views || 0;
				return (av - bv) * dir;
			}
			return 0;
		});
		return copy;
	}, [filteredListings, sort, metrics]);

	// Handlers
	const handleDeleteClick = (l: Listing) => { setDeleteTarget(l); setShowDeleteModal(true); };
	const handleConfirmDelete = async () => {
		if (!deleteTarget) return;
		try {
			const res = await apiFetch(API_ENDPOINTS.houseById(deleteTarget._id || deleteTarget.id), { method: 'DELETE', auth: true });
			if (!res.ok) throw new Error('failed');
			
			// Update UI by filtering out the deleted listing
			setListings(prev => prev.filter(l => (l._id || l.id) !== (deleteTarget._id || deleteTarget.id)));
			
			// Add success notification
			const id = Date.now().toString();
			setNotices(n => [...n, { id, msg: `Listing "${deleteTarget.title}" deleted successfully` }]);
			
			// Optionally refresh all data in the background
			setTimeout(refreshData, 1000);
		} catch { 
			// Add error notification
			const id = Date.now().toString();
			setNotices(n => [...n, { id, msg: `Failed to delete listing "${deleteTarget?.title}"` }]);
		}
		setShowDeleteModal(false);
		setDeleteTarget(null);
	};

	// Reusable background fetch function
	const refreshData = async () => {
		setLocalLoading(true);
		try {
			const res = await apiFetch(API_ENDPOINTS.housesGetAll, { auth: true });
			if (!res.ok) throw new Error('Failed to fetch');
			const data = await res.json();
			setListings(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error('Error in background refresh:', err);
			// Silent fail - don't show error to user for background refreshes
		} finally {
			setLocalLoading(false);
		}
	};

	// manualSync removed

		// auto-dismiss notices
		useEffect(() => {
			if (!notices.length) return;
			const timers = notices.map(n => setTimeout(() => {
				setNotices(curr => curr.filter(c => c.id !== n.id));
			}, 5000));
			return () => { timers.forEach(t => clearTimeout(t)); };
		}, [notices]);

	const handleEditClick = (l: Listing) => {
		setEditTarget(l);
		// derive landlord id from nested object or field
		let lid = '';
		const rawLandlord: unknown = (l as unknown as { landlord?: unknown }).landlord;
		if (typeof rawLandlord === 'string') lid = rawLandlord;
		else if (rawLandlord && typeof rawLandlord === 'object') {
			const ref = rawLandlord as { _id?: string; id?: string };
			lid = ref._id || ref.id || '';
		}
		setEditForm({ title: l.title || '', price: String(l.price || ''), type: l.type || '', status: (l.status as unknown as string) || '', landlordId: lid, images: [], replaceImages: false });
		setShowEditModal(true);
	};
	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target; setEditForm(p => ({ ...p, [name]: value }));
	};
	const handleEditImages = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : [];
		setEditForm(f => ({ ...f, images: files }));
	};
	const toggleReplaceImages = () => setEditForm(f => ({ ...f, replaceImages: !f.replaceImages }));
	const handleUpdateHouse = async () => {
		if (!editTarget) return; setUpdating(true);
		try {
			if (editForm.images.length > 0) {
				// multipart update
				const form = new FormData();
				if (editForm.title.trim()) form.append('title', editForm.title.trim());
				if (editForm.price) form.append('price', editForm.price);
				if (editForm.type) form.append('type', editForm.type);
				if (editForm.status) form.append('status', editForm.status);
				if (editForm.landlordId) form.append('landlordId', editForm.landlordId);
				form.append('replaceImages', editForm.replaceImages ? 'true' : 'false');
				editForm.images.forEach(f => form.append('images', f));
				const res = await apiFetch(API_ENDPOINTS.houseById((editTarget._id || editTarget.id) as string), { method: 'PUT', auth: true, body: form });
				if (!res.ok) throw new Error('Update failed');
			} else {
				await updateHouse((editTarget._id || editTarget.id) as string, {
					title: editForm.title.trim() || undefined,
					price: editForm.price ? Number(editForm.price) : undefined,
					type: editForm.type || undefined,
					status: editForm.status || undefined,
					landlordId: editForm.landlordId || undefined
				});
			}
			setListings(prev => prev.map(l => {
				if ((l._id || l.id) !== (editTarget._id || editTarget.id)) return l;
				// Only update if status maps to ListingStatus enum; else keep original
				const allowed: Record<string,string> = { draft:'draft', in_review:'in_review', approved:'approved', published:'published', paused:'paused', archived:'archived' };
				const nextStatus = editForm.status && allowed[editForm.status] ? allowed[editForm.status] : l.status;
				const updated: Listing = { ...l, title: editForm.title || l.title, price: editForm.price ? Number(editForm.price) : l.price, type: editForm.type || l.type, status: nextStatus as ListingStatus };
				if (editForm.landlordId) {
					const existing = (l as unknown as { landlord?: unknown }).landlord;
					interface LandlordLite { _id?: string; id?: string; name?: string; phone?: string; [k: string]: unknown }
					let newLandlord: LandlordLite = { _id: editForm.landlordId };
					if (existing && typeof existing === 'object') {
						const ex = existing as LandlordLite;
						newLandlord = { ...ex, _id: editForm.landlordId };
					}
					(updated as unknown as { landlord?: LandlordLite }).landlord = newLandlord;
				}
				return updated;
			}));
			
			// Add success notification
			const id = Date.now().toString();
			setNotices(n => [...n, { id, msg: `Listing "${editTarget.title}" updated successfully` }]);
			
			// Optionally refresh all data in the background
			setTimeout(refreshData, 1000);
			
			setShowEditModal(false); 
			setEditTarget(null);
		} catch (e) { 
			console.error(e); 
			
			// Add error notification
			const id = Date.now().toString();
			setNotices(n => [...n, { id, msg: `Failed to update listing "${editTarget?.title}"` }]);
		} finally { 
			setUpdating(false); 
		}
	};

	// Fetch landlords (lightweight) when edit modal opens
	useEffect(() => {
		if (!showEditModal) return;
		let cancelled = false;
		(async () => {
			setLoadingLandlords(true); setLandlordError(null);
			try {
				const { fetchLandlords } = await import('../../lib/api');
				const list = await fetchLandlords();
				if (!cancelled) setLandlordOptions(list.map((l: { _id?: string; id?: string; name: string }) => ({ id: l._id || l.id || '', name: l.name })));
			} catch { if (!cancelled) setLandlordError('Failed to load landlords'); }
			finally { if (!cancelled) setLoadingLandlords(false); }
		})();
		return () => { cancelled = true; };
	}, [showEditModal]);

	// Stats (simplified dashboard-style KPIs)
	const stats = useMemo(() => ({
		totalListings: listings.length,
		avgPrice: listings.length ? Math.round(listings.reduce((s,l)=> s + (l.price||0),0)/listings.length) : 0,
		avgSafety: listings.length ? (listings.reduce((s,l)=> s + (l.safetyRating||0),0)/listings.length).toFixed(1) : '0.0',
		avgRating: listings.length ? (listings.reduce((s,l)=> s + (l.rating||l.avgRating||0),0)/listings.length).toFixed(1) : '0.0'
	}), [listings]);

	// Build per-house review growth (top 5 by total reviews)
	const reviewGrowthData = useMemo((): Array<Record<string, number | string>> => {
		if (!reviews.length || !listings.length) return [];
		// group reviews by listingId
		const groups: Record<string, Review[]> = {};
		reviews.forEach(r => { if (!r.listingId) return; (groups[r.listingId] ||= []).push(r); });
		const listingMap = new Map<string,string>();
		listings.forEach(l => { const id = (l._id || l.id) as string; listingMap.set(id, l.title || 'Untitled'); });
		// sort groups and pick top 5
		const topIds = Object.keys(groups).sort((a,b)=> groups[b].length - groups[a].length).slice(0,5);
		// collect all dates
		const dateSet = new Set<string>();
		topIds.forEach(id => groups[id].forEach(r => { dateSet.add(new Date(r.createdAt).toISOString().slice(0,10)); }));
		const dates = Array.from(dateSet).sort();
		// cumulative counts
		const cum: Record<string, number> = {};
		return dates.map(d => {
			const row: Record<string, number | string> = { date: d };
			topIds.forEach(id => {
				const daily = groups[id].filter(r => new Date(r.createdAt).toISOString().slice(0,10) === d).length;
				cum[id] = (cum[id] || 0) + daily;
				const full = listingMap.get(id) || id;
				const truncated = full.length > 18 ? full.slice(0,18) + '…' : full;
				const key = `${truncated} (${id.slice(-4)})`;
				row[key] = cum[id];
			});
			return row;
		});
	}, [reviews, listings]);

	// Fetch recent reviews
	// Fetch all reviews (for time-series line integration)
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await apiFetch(API_ENDPOINTS.reviews, { auth: true });
				if (!res.ok) return;
				const data = await res.json();
				if (!cancelled && Array.isArray(data)) setReviews(data);
			} catch {/* ignore */}
		})();
		return () => { cancelled = true; };
	}, []);

	// Time-series assembly via shared utilities
	const timeSeriesData = useMemo(() => {
		if (chartRange === '24h') return buildHourlySeries24h(listings, reviews, history);
		const daily = buildDailySeries(listings, reviews, history);
		if (chartRange === 'all') return daily;
		const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - (chartRange === '7d' ? 6 : 29));
		return daily.filter(p => new Date(p.date) >= cutoff);
	}, [chartRange, listings, reviews, history]);

	// Determine spike thresholds for viewsDelta (simple 90th percentile of non-zero deltas)

	// Custom dots (only show where daily/hourly value > 0)
	// Dot strategy: we supply a small circle component only when markers enabled; otherwise fall back to false
	// Using simple dot config objects (built-in) instead of custom components to avoid extra typing complexity

	// Flatten nested listing object (shallow) for CSV
	const flatten = (obj: unknown, prefix = '', out: Record<string,string|number> = {}) => {
		if (obj == null) return out;
		if (typeof obj === 'object' && !Array.isArray(obj)) {
			for (const k of Object.keys(obj as Record<string, unknown>)) {
				const v = (obj as Record<string, unknown>)[k];
				const key = prefix ? `${prefix}${k}` : k;
				if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length < 15) {
					flatten(v, key + '.', out);
				} else {
					out[key] = typeof v === 'object' ? JSON.stringify(v) : (typeof v === 'number' ? v : String(v ?? ''));
				}
			}
		} else {
			out[prefix.replace(/\.$/,'')] = typeof obj === 'number' ? obj : String(obj ?? '');
		}
		return out;
	};

	const exportCsv = () => {
		const dataSet = sortedListings.length ? sortedListings : listings;
		if (!dataSet.length) return;
		const rows = dataSet.map(l => flatten(l));
		const headerSet = new Set<string>();
		rows.forEach(r => Object.keys(r).forEach(k => headerSet.add(k)));
		const headers = Array.from(headerSet);
		const usableHeaders = exportColumns.length ? headers.filter(h => exportColumns.includes(h)) : headers;
		const esc = (v: unknown) => {
			if (v == null) return '';
			const s = String(v);
			return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
		};
		const csv = [usableHeaders.join(','), ...rows.map(r => usableHeaders.map(h => esc((r as Record<string, unknown>)[h])).join(','))].join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `listings_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
		document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
	};

	const exportJson = () => {
		const dataSet = sortedListings.length ? sortedListings : listings;
		const blob = new Blob([JSON.stringify(dataSet, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `listings_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
		document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
	};

	const toggleSort = (key: 'price'|'updatedAt'|'views') => {
		setSort(prev => {
			if (!prev || prev.key !== key) return { key, dir:'asc' };
			if (prev.dir==='asc') return { key, dir:'desc' };
			return null; // third click clears
		});
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-blue-900/40 via-oxford-900 to-oxford-900/80 border border-blue-800/40 rounded-2xl p-6 shadow-inner shadow-black/40">
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-sky-200 to-cyan-200 flex items-center gap-2">Listings <Sparkles className="h-5 w-5 text-blue-300" /></h1>
					<p className="text-sm text-blue-100/70">Monitor, optimize and evolve your housing inventory.</p>
				</div>
				<div className="flex flex-wrap gap-3 items-center">
					{hasPermission(Permission.BULK_EXPORT_LISTINGS) && (
						<Button onClick={() => setExportModalOpen(true)} className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow">
							<Download className="h-4 w-4" />
							<span>Export</span>
						</Button>
					)}
					{hasPermission(Permission.CREATE_LISTING) && (
						<Button onClick={() => navigate('/listings/add')} className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-white border border-blue-400/40 shadow">
							<Plus className="h-4 w-4" />
							<span>Add Listing</span>
						</Button>
					)}
				</div>
			</div>

			{/* Dashboard KPIs */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{[
					{ label: 'Listings', value: stats.totalListings, icon: <Building className="h-6 w-6" />, color:'from-blue-500/20 to-blue-500/5', border:'border-blue-600/40' },
					{ label: 'Avg Price', value: stats.avgPrice ? `KES ${stats.avgPrice.toLocaleString()}` : 'KES 0', icon: <Clock className="h-6 w-6" />, color:'from-emerald-500/20 to-emerald-500/5', border:'border-emerald-600/40' },
					{ label: 'Avg Rating', value: stats.avgRating, icon: <StarRating value={Number(stats.avgRating)} /> , color:'from-amber-500/20 to-amber-500/5', border:'border-amber-600/40' },
					{ label: 'Avg Safety', value: stats.avgSafety, icon: <ShieldIcon className="h-6 w-6" /> , color:'from-indigo-500/20 to-indigo-500/5', border:'border-indigo-600/40' }
				].map(card => (
					<Card key={card.label} className={`relative overflow-hidden bg-oxford-900/70 border ${card.border} hover:border-white/20 transition`}> 
						<div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition`} />
						<CardContent className="p-5 relative z-10 flex items-center gap-4">
							<div className="text-gray-300">{card.icon}</div>
							<div>
								<p className="text-xs uppercase tracking-wide text-gray-400">{card.label}</p>
								<p className="text-lg font-semibold text-white">{card.value}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Reviews panel removed */}

			{/* Background loading indicator */}
			{localLoading && !loading && (
				<div className="fixed top-4 right-4 bg-blue-600/80 text-white py-1 px-3 rounded-full text-xs font-medium animate-pulse flex items-center">
					<RefreshCw className="h-3 w-3 mr-1 animate-spin" />
					Updating...
				</div>
			)}

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

			{/* Filters (status removed) */}
			<Card className="bg-oxford-900/70 border border-gray-800 backdrop-blur-sm">
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
						<div className="flex gap-2 items-center">
							{/* status filter removed */}
							<Button variant="outline" size="sm" className="bg-oxford-900 border border-gray-800 text-gray-300 hover:bg-oxford-800 hover:text-white" style={{ backgroundColor: 'transparent' }}>
								<Filter className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card className="bg-oxford-900/70 border border-gray-800">
				<CardHeader>
								<CardTitle className="flex items-center gap-2">All Listings <span className="text-xs text-gray-500">({sortedListings.length})</span></CardTitle>
					<CardDescription className="text-blue-100/60">Manage property listings and their status</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-800/70 text-[11px] uppercase tracking-wide text-gray-400">
									<th className="text-left py-2 px-4 font-medium"><button onClick={() => toggleSort('price')} className="flex items-center gap-1 hover:text-white">Property {sort?.key==='price' && (sort.dir==='asc'? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</button></th>
									<th className="text-left py-2 px-4 font-medium">Ratings</th>
									<th className="text-left py-2 px-4 font-medium">Landlord</th>
									<th className="text-left py-2 px-4 font-medium"><button onClick={() => toggleSort('views')} className="flex items-center gap-1 hover:text-white">Performance {sort?.key==='views' && (sort.dir==='asc'? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</button></th>
									<th className="text-left py-2 px-4 font-medium"><button onClick={() => toggleSort('updatedAt')} className="flex items-center gap-1 hover:text-white">Updated {sort?.key==='updatedAt' && (sort.dir==='asc'? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</button></th>
									<th className="text-left py-2 px-4 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									Array.from({ length: 6 }).map((_, i) => (
										<tr key={i} className="border-b border-gray-800/60 animate-pulse">
											<td className="py-4 px-4" colSpan={7}>
												<div className="h-4 w-1/3 bg-gray-700/40 rounded mb-2" />
												<div className="h-3 w-1/2 bg-gray-800/50 rounded" />
											</td>
										</tr>
									))
								) : sortedListings.length === 0 ? (
									<tr>
										<td colSpan={7} className="py-10 text-center text-gray-400 text-sm">No listings match your filters.</td>
									</tr>
								) : (
									sortedListings.map(listing => (
										<tr key={listing._id || listing.id} className={`group border-b border-gray-800/60 hover:bg-oxford-800/40 transition ${highlightIds.has((listing._id||listing.id) as string) ? 'bg-emerald-800/30 animate-pulse' : ''}` }>
											{/* Property */}
											<td className="py-3 px-4">
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
											{/* Ratings */}
											<td className="py-3 px-4">
												<div className="flex flex-col gap-1">
													<StarRating value={listing.rating ?? listing.avgRating ?? 0} />
													<div className="flex items-center gap-2 text-[10px] text-gray-500">
														<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600/15 border border-blue-500/30 text-blue-300">
															<ShieldIcon className="h-3 w-3" /> {typeof listing.safetyRating === 'number' ? listing.safetyRating.toFixed(1) : '0.0'}
														</span>
													</div>
												</div>
											</td>
											{/* Landlord */}
											<td className="py-3 px-4">
												<p className="font-medium text-white">{listing.landlord?.name || '-'}</p>
												<div className="flex items-center text-sm text-gray-400">
													<Phone className="h-3 w-3 mr-1" />
													{listing.landlord?.phone || '-'}
												</div>
											</td>
											{/* Performance */}
											<td className="py-3 px-4">
												<div className="text-sm">
													<div className="flex items-center text-gray-400">
														<Info className="h-3 w-3 mr-1" />
														<span>{metrics[(listing._id || listing.id) as string]?.views ?? 0} views</span>
													</div>
													<div className="flex items-center text-gray-400">
														<Phone className="h-3 w-3 mr-1" />
														<span>{metrics[(listing._id || listing.id) as string]?.landlordViews ?? 0} landlord views</span>
													</div>
												</div>
											</td>
											{/* Updated */}
											<td className="py-3 px-4">
												<p className="text-sm text-gray-400">{formatDate(listing.updatedAt)}</p>
											</td>
											{/* Actions */}
											<td className="py-3 px-4">
												<div className="flex items-center space-x-2">
													<Button variant="ghost" size="sm" onClick={() => { setSelectedListing(listing); setShowDetailsModal(true); }} className="hover:bg-blue-700/20">
														<Info className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleEditClick(listing)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="sm" onClick={() => handleDeleteClick(listing)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Delete Modal */}
			<Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Listing" tone="danger" className="border border-gray-800 max-w-lg w-full">
				<div className="space-y-6">
					<div className="relative pl-5" data-section="delete">
						<div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
						<div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-rose-600 to-red-600 border border-rose-400/30 shadow-[0_0_0_2px_rgba(225,29,72,0.35)]" />
						
						<div className="pl-2">
							<p className="text-gray-300 mb-2">Are you sure you want to delete <span className="font-semibold text-white">{deleteTarget?.title}</span>?</p>
							<div className="bg-rose-950/20 text-rose-200 p-4 rounded-md border border-rose-900/50 text-sm">
								<p className="flex items-center gap-2"><Ban size={16} /> This action cannot be undone.</p>
								<p className="mt-1 text-xs text-rose-300/70">All related data for this listing will be permanently removed.</p>
							</div>
						</div>
					</div>
					
					<div className="flex justify-end gap-3 pt-2">
						<Button 
							onClick={() => setShowDeleteModal(false)} 
							variant="secondary"
							className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							className="bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-md shadow-rose-600/20"
							onClick={handleConfirmDelete}
						>
							Delete Listing
						</Button>
					</div>
				</div>
			</Modal>

			{/* Details Modal */}
			<Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Listing Details" className="border border-gray-800 max-w-6xl w-full">
				{selectedListing && (
					<div className="space-y-12 pr-1">
						{/* Section: Overview */}
						<section className="relative pl-5" data-view-section="overview">
							<div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
							<div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
							<header className="mb-6">
								<h3 className="text-lg font-semibold flex items-center gap-2">Overview <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Property Details</span></h3>
								<p className="text-xs text-gray-400">Essential information about this property.</p>
							</header>
							
							<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-5 mb-5">
								<h3 className="text-lg font-semibold text-white tracking-tight">{selectedListing.title}</h3>
								<p className="text-gray-400 text-sm mt-1">{selectedListing.location?.estate || '-'} • {selectedListing.type || '-'} • Updated {formatDate(selectedListing.updatedAt)}</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
									<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Monthly Rent</p>
									<p className="text-white font-semibold">{formatCurrency(selectedListing.price || 0, 'KES')}</p>
								</div>
								<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
									<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Safety Rating</p>
									<p className="text-white font-semibold">{(selectedListing.safetyRating ?? 0).toFixed(1)}</p>
								</div>
							</div>
						</section>

						{/* Section: Landlord */}
						<section className="relative pl-5" data-view-section="landlord">
							<div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
							<div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
							<header className="mb-6">
								<h3 className="text-lg font-semibold flex items-center gap-2">Landlord <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Contact Information</span></h3>
								<p className="text-xs text-gray-400">Contact details and information about property owner.</p>
							</header>
							
							<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
								<p className="text-white font-medium">{selectedListing.landlord?.name || '-'}</p>
								<p className="text-gray-400 text-sm">{selectedListing.landlord?.phone || '-'}</p>
							</div>
						</section>

						{/* Section: Analytics */}
						<section className="relative pl-5 pb-4" data-view-section="analytics">
							<div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
							<div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]" />
							<header className="mb-6">
								<h3 className="text-lg font-semibold flex items-center gap-2">Analytics <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Performance Data</span></h3>
								<p className="text-xs text-gray-400">Viewing and interaction statistics for this property.</p>
							</header>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
									<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Views</p>
									<p className="text-white font-semibold">{metrics[(selectedListing._id || selectedListing.id) as string]?.views ?? 0}</p>
								</div>
								<div className="bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
									<p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Contact Clicks</p>
									<p className="text-white font-semibold">{metrics[(selectedListing._id || selectedListing.id) as string]?.landlordViews ?? 0}</p>
								</div>
							</div>
							
							<div className="mt-8 flex flex-wrap gap-3 justify-end">
								<Button onClick={() => setShowDetailsModal(false)} className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60">Close</Button>
								<Button onClick={() => { setShowDetailsModal(false); handleEditClick(selectedListing); }} className="bg-blue-600 hover:bg-blue-500 text-white">Edit Listing</Button>
							</div>
						</section>
					</div>
				)}
			</Modal>

			{/* Edit Modal */}
			<Modal isOpen={showEditModal} onClose={() => { if (!updating) { setShowEditModal(false); setEditTarget(null); } }} title={updating ? 'Updating Listing…' : 'Edit Listing'} tone="info" className="border border-gray-800 max-w-6xl w-full">
                {editTarget && (
                    <div className="space-y-12 pr-1">{/* removed max-h & overflow to eliminate scrollbar */}
                        {/* Section: Basics */}
                        <section className="relative pl-5" data-edit-section="basics">
                            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
                            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
                            <header className="mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">Basics <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
                                <p className="text-xs text-gray-400">Update core attributes. Leave a field blank to keep existing value.</p>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <Input name="title" value={editForm.title} onChange={handleEditChange} className="bg-oxford-900 border-gray-800" placeholder={editTarget.title || 'Title'} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Price (KES)</label>
                                    <Input name="price" type="number" value={editForm.price} onChange={handleEditChange} className="bg-oxford-900 border-gray-800" placeholder={String(editTarget.price || '')} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">(leave unchanged)</option>
                                        <option value="vacant">Vacant</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="paused">Paused</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">House Type</label>
                                    <select name="type" value={editForm.type} onChange={handleEditChange} className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">(leave unchanged)</option>
                                        <option value="bedsitter">Bedsitter</option>
                                        <option value="single">Single</option>
                                        <option value="1br">1 Bedroom</option>
                                        <option value="2br">2 Bedroom</option>
                                        <option value="3br">3 Bedroom</option>
                                        <option value="hostel">Hostel</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="mansion">Mansion</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section: Media */}
                        <section className="relative pl-5" data-edit-section="media">
                            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
                            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 border border-fuchsia-400/30 shadow-[0_0_0_2px_rgba(192,38,211,0.35)]" />
                            <header className="mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">Media <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
                                <p className="text-xs text-gray-400">Select new images to append or replace existing ones.</p>
                            </header>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Images (optional)</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="w-36 h-36 rounded-xl bg-gradient-to-br from-oxford-900 to-oxford-950 border border-gray-800 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                                            {editForm.images.length > 0 ? (
                                                <img src={URL.createObjectURL(editForm.images[0])} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] text-gray-500">No Selection</span>
                                            )}
                                        </div>
                                        <label className="cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-medium py-2 px-4 rounded-md transition duration-200 shadow relative overflow-hidden">
                                            <span className="relative z-10">Choose Images</span>
                                            <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleEditImages} />
                                        </label>
                                        {editForm.images.length > 1 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {editForm.images.slice(1).map((file, idx) => (
                                                    <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="w-12 h-12 object-cover rounded border border-gray-800" />
                                                ))}
                                            </div>
                                        )}
                                        {editForm.images.length > 0 && (
                                            <p className="mt-2 text-[10px] text-gray-500">{editForm.images.length} selected {editForm.replaceImages ? '(will replace existing)' : '(will append)'}</p>
                                        )}
                                        <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                                            <input type="checkbox" checked={editForm.replaceImages} onChange={toggleReplaceImages} className="rounded border-gray-700 bg-oxford-900" /> Replace existing images
                                        </label>
                                    </div>
                                    <div className="flex-1 text-xs text-gray-400 space-y-2">
                                        <p className="text-gray-300 font-medium">Guidelines</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Up to 5 images recommended</li>
                                            <li>Use Replace to discard current images</li>
                                            <li>Otherwise new images append</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Landlord & Save */}
                        <section className="relative pl-5 pb-4" data-edit-section="landlord">
                            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
                            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" />
                            <header className="mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">Landlord & Save <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
                                <p className="text-xs text-gray-400">Change the landlord reference or finish updating.</p>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-1">
                                    <label className="block text-sm text-gray-400 mb-1">Landlord</label>
                                    <select name="landlordId" value={editForm.landlordId} onChange={handleEditChange} className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">(leave unchanged)</option>
                                        {loadingLandlords && <option value="" disabled>Loading...</option>}
                                        {!loadingLandlords && landlordOptions.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    {landlordError && <p className="text-[10px] text-red-400 mt-1">{landlordError}</p>}
                                </div>
                                <div className="text-xs text-gray-400 md:col-span-1 bg-oxford-900/40 border border-gray-800 rounded-lg p-4">
                                    <p className="text-gray-300 font-medium mb-2">Quick Tips</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Blank fields are ignored</li>
                                        <li>Status & type only changed if selected</li>
                                        <li>Landlord left blank keeps existing</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3 justify-end">
                                <Button disabled={updating} onClick={() => { setShowEditModal(false); setEditTarget(null); }} className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60">Cancel</Button>
                                <Button disabled={updating} onClick={handleUpdateHouse} className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">{updating ? 'Updating…' : 'Update Listing'}</Button>
                            </div>
                        </section>
                    </div>
                )}
            </Modal>
		{/* Toast notifications */}
		{notices.length > 0 && (
			<div className="fixed top-4 right-4 z-50 space-y-2">
				{notices.map(n => (
					<div key={n.id} className="px-4 py-2 rounded-md bg-oxford-800/90 border border-blue-600/40 shadow-lg text-sm text-blue-100 flex items-center gap-2 backdrop-blur">
						<Sparkles className="h-4 w-4 text-blue-300" />
						<span>{n.msg}</span>
						<button onClick={() => setNotices(curr => curr.filter(c => c.id !== n.id))} className="ml-2 text-gray-400 hover:text-white text-xs">×</button>
					</div>
				))}
			</div>
		)}
	{/* Time Series & Trend */}
	<Card className="bg-oxford-900/70 border border-gray-800">
		<CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div>
				<CardTitle className="text-sm font-semibold text-gray-200">Listings Over Time</CardTitle>
				<CardDescription className="text-blue-100/60">Daily additions & cumulative trend (Listings vs Reviews)</CardDescription>
			</div>
			<div className="flex items-center gap-2 flex-wrap">
				{(['24h','7d','30d','all'] as const).map(r => (
					<button key={r} onClick={() => setChartRange(r)} className={`px-2 py-1 rounded text-xs border ${chartRange===r ? 'border-blue-500 text-blue-300 bg-blue-600/10' : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}>{r}</button>
				))}
				<span className="ml-2 flex items-center gap-4 text-[11px] text-gray-400">
					<label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showListings} onChange={e=>setShowListings(e.target.checked)} className="accent-blue-500" /> Listings</label>
					<label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showReviews} onChange={e=>setShowReviews(e.target.checked)} className="accent-amber-500" /> Reviews</label>
					<label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showViews} onChange={e=>setShowViews(e.target.checked)} className="accent-emerald-500" /> Views</label>
					<label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showMarkers} onChange={e=>setShowMarkers(e.target.checked)} className="accent-fuchsia-500" /> Markers</label>
					<label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showSpikes} onChange={e=>setShowSpikes(e.target.checked)} className="accent-red-500" /> Spikes</label>
				</span>
			</div>
		</CardHeader>
		<CardContent className="h-72">
			{timeSeriesData.length === 0 ? (
				<div className="h-full flex items-center justify-center text-gray-500 text-sm">No data yet</div>
			) : (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={timeSeriesData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
						<XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
						<YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
						<Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', fontSize: '12px' }} labelStyle={{ color: '#e5e7eb' }} />
						<Legend wrapperStyle={{ fontSize: '11px' }} />
						{showListings && <Line type="monotone" dataKey="listingDaily" stroke="#3b82f6" strokeWidth={2} dot={showMarkers} activeDot={showMarkers ? { r:5 } : undefined} name={chartRange==='24h' ? 'Listings / Hour' : 'Listings Daily'} />}
						{showReviews && <Line type="monotone" dataKey="reviewDaily" stroke="#f59e0b" strokeWidth={2} dot={showMarkers} activeDot={showMarkers ? { r:5 } : undefined} name={chartRange==='24h' ? 'Reviews / Hour' : 'Reviews Daily'} />}
						{showListings && <Line type="monotone" dataKey="listingCumulative" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Listings Cumulative" />}
						{showReviews && <Line type="monotone" dataKey="reviewCumulative" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Reviews Cumulative" />}
						{showViews && <Line type="monotone" dataKey="viewsDelta" stroke="#14b8a6" strokeWidth={2} dot={showMarkers} activeDot={showMarkers ? { r:5 } : undefined} name={chartRange==='24h' ? 'Views Delta / Hour' : 'Views Delta Daily'} />}
						{showViews && <Line type="monotone" dataKey="viewsCumulative" stroke="#0d9488" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Views Cumulative" />}
						{/* Spike lines temporarily removed pending stricter typing resolution */}
					</LineChart>
				</ResponsiveContainer>
			)}
		</CardContent>
	</Card>

	{/* Per-House Review Growth (Top 5) */}
	{reviewGrowthData.length > 0 && (
		<Card className="bg-oxford-900/70 border border-gray-800">
			<CardHeader>
				<CardTitle className="text-sm font-semibold text-gray-200">Review Growth (Top Houses)</CardTitle>
				<CardDescription className="text-blue-100/60">Cumulative reviews per top 5 houses</CardDescription>
			</CardHeader>
			<CardContent className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={reviewGrowthData} margin={{ top:8,right:16,left:0,bottom:4 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
						<XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
						<YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
						<Tooltip contentStyle={{ background:'#111827', border:'1px solid #1f2937', fontSize:'12px' }} labelStyle={{ color:'#e5e7eb' }} />
						<Legend wrapperStyle={{ fontSize:'11px' }} />
						{Object.keys(reviewGrowthData[0]).filter(k => k !== 'date').map((k,i) => (
							<Line key={k} type="monotone" dataKey={k} strokeWidth={2} dot={false} stroke={['#3b82f6','#f59e0b','#10b981','#6366f1','#ef4444'][i % 5]} />
						))}
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)}

	{/* Export Modal */}
	<Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} title="Export Listings">
		<div className="space-y-4">
			<p className="text-sm text-gray-300">Choose format and optionally select columns. Leave columns empty to export all.</p>
			<div className="flex flex-wrap gap-2 max-h-40 overflow-auto p-2 border border-gray-700 rounded bg-oxford-900/50">
				{Array.from(new Set(listings.flatMap(l => Object.keys(flatten(l))))).sort().map(col => (
					<button key={col} onClick={() => setExportColumns(c => c.includes(col) ? c.filter(x => x!==col) : [...c, col])} className={`text-[10px] px-2 py-1 rounded border ${exportColumns.includes(col) ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'border-gray-700 text-gray-400 hover:text-white'}`}>{col}</button>
				))}
			</div>
			<div className="flex justify-end gap-3 pt-2">
				<Button variant="outline" onClick={() => { setExportColumns([]); setExportModalOpen(false); }}>Cancel</Button>
				<Button onClick={() => { exportCsv(); setExportModalOpen(false); }}>CSV</Button>
				<Button onClick={() => { exportJson(); setExportModalOpen(false); }} className="bg-emerald-600 hover:bg-emerald-500">JSON</Button>
			</div>
		</div>
	</Modal>

	</div>
	);
};

export default ListingsPage;