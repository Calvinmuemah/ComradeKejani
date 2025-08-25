import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Shield,
  MapPin,
  XCircle,
  Calendar,
  Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AlertSeverity, AlertStatus } from '../../types';
import { 
  fetchNotifications, 
  createNotification, 
  deleteNotification as apiDeleteNotification,
  fetchReportIssues,
  updateNotification as apiUpdateNotification,
  NotificationItem,
  CreateNotificationPayload,
  SafetyIssueItem
} from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

// We map backend notifications (type, title, message, createdAt) into UI safety alerts model attributes.
// Additional UI-only fields (severity, zones, etc.) are not present in backend; we'll infer minimal mapping.

interface UISafetyAlert {
  id: string;
  title: string;
  content: string;
  severity: AlertSeverity; // map notification.type 'safety-alert' -> danger/info default
  zones: string[]; // not in backend -> empty array for now
  startAt: string; // use createdAt
  endAt?: string;
  pinned: boolean; // UI flag (not persisted yet)
  visibleOnHomepage: boolean; // UI flag (not persisted)
  createdBy: string; // unknown backend (no admin field) -> 'System'
  createdAt: string;
  status: AlertStatus; // derive ACTIVE always for now
  backend: NotificationItem; // original ref
}

// Mock zones data
const mockZones = [
  { id: '1', name: 'Amalemba', securityScore: 4, totalListings: 45, activeAlerts: 0 },
  { id: '2', name: 'Kefinco', securityScore: 3, totalListings: 32, activeAlerts: 1 },
  { id: '3', name: 'Lurambi', securityScore: 2, totalListings: 28, activeAlerts: 1 },
  { id: '4', name: 'Shirugu', securityScore: 4, totalListings: 18, activeAlerts: 0 },
  { id: '5', name: 'Friends', securityScore: 3, totalListings: 15, activeAlerts: 0 }
];

const SafetyPage: React.FC = () => {
  const { notify } = useToast();
  const [activeTab, setActiveTab] = useState<'alerts' | 'zones' | 'issues'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [showEditAlertModal, setShowEditAlertModal] = useState(false);
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [alerts, setAlerts] = useState<UISafetyAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<UISafetyAlert | null>(null);
  const [editAlertForm, setEditAlertForm] = useState({ title: '', message: '', severity: 'danger' });
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [showZoneMapModal, setShowZoneMapModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<typeof mockZones[0] | null>(null);
  // Report Issues
  const [issues, setIssues] = useState<SafetyIssueItem[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);

  // New alert form state
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    message: '',
    severity: 'info',
    zones: '',
    pinned: false,
    visibleOnHomepage: false,
    startAt: '',
    endAt: ''
  });
  const [durationPreset, setDurationPreset] = useState<'none' | '1d' | '3d' | '7d' | '30d' | 'custom'>('none');
  // Local derived pieces for calendar inputs
  const parseDateTimeParts = (isoLocal: string) => {
    if(!isoLocal) return { date: '', time: '' };
    const [d,t] = isoLocal.split('T');
    return { date: d, time: t || '' };
  };
  const startParts = parseDateTimeParts(newAlertForm.startAt);
  const endParts = parseDateTimeParts(newAlertForm.endAt);

  // Set default start date/time when opening create modal
  useEffect(()=>{
    if(!showNewAlertModal) return;
    setNewAlertForm(f=>{
      if(f.startAt) return f; // already set
      const now = new Date();
      const pad = (n:number)=> String(n).padStart(2,'0');
      const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      return { ...f, startAt: local };
    });
  },[showNewAlertModal]);

  function applyDurationPreset(preset: typeof durationPreset, startISO: string) {
    if (!startISO) return { end: '' };
    if (preset === 'none') return { end: '' };
    const startDate = new Date(startISO);
    const addDays = (d:number)=> { const dt = new Date(startDate); dt.setDate(dt.getDate()+d); return dt; };
    let end: Date | null = null;
    switch(preset){
      case '1d': end = addDays(1); break;
      case '3d': end = addDays(3); break;
      case '7d': end = addDays(7); break;
      case '30d': end = addDays(30); break;
      default: end = null; break;
    }
    return { end: end ? end.toISOString().slice(0,16) : '' };
  }

  // Helper to transform notification -> UI alert
  function mapNotification(n: NotificationItem): UISafetyAlert {
    let severity: AlertSeverity = AlertSeverity.INFO;
    if (n.type === 'safety-alert') severity = AlertSeverity.DANGER; // treat safety-alert as high severity
    return {
      id: n._id,
      title: n.title,
      content: n.message,
      severity,
      zones: [],
      startAt: n.createdAt,
      createdAt: n.createdAt,
      pinned: false,
      visibleOnHomepage: false,
      createdBy: 'System',
      status: AlertStatus.ACTIVE,
      backend: n,
    };
  }

  async function loadAlerts() {
    setLoadingAlerts(true); setAlertsError(null);
    try {
      const data = await fetchNotifications();
      setAlerts(data.map(mapNotification));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setAlertsError(msg || 'Failed to load alerts');
    } finally { setLoadingAlerts(false); }
  }

  async function loadIssues() {
    setLoadingIssues(true); setIssuesError(null);
    try {
      const data = await fetchReportIssues();
      setIssues(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIssuesError(msg || 'Failed to load issues');
    } finally { setLoadingIssues(false); }
  }

  useEffect(() => { loadAlerts(); loadIssues(); /* intentionally run once */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeverityBadge = (severity: AlertSeverity) => {
    const variants = {
      [AlertSeverity.INFO]: 'default',
      [AlertSeverity.WARNING]: 'warning',
      [AlertSeverity.DANGER]: 'destructive'
    } as const;

    const icons = {
      [AlertSeverity.INFO]: <Shield className="h-3 w-3 mr-1" />,
      [AlertSeverity.WARNING]: <AlertTriangle className="h-3 w-3 mr-1" />,
      [AlertSeverity.DANGER]: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[severity]}>
        {icons[severity]}
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: AlertStatus) => {
    const variants = {
      [AlertStatus.DRAFT]: 'secondary',
      [AlertStatus.ACTIVE]: 'success',
      [AlertStatus.EXPIRED]: 'secondary',
      [AlertStatus.ARCHIVED]: 'secondary'
    } as const;

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getSecurityStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Shield
            key={i}
            className={`h-4 w-4 ${
              i < score ? 'text-green-500 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">{score}/5</span>
      </div>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.zones.some(zone => zone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Safety & Security Management</h1>
          <p className="text-gray-400">Manage safety alerts and zone security ratings</p>
        </div>
        <Button onClick={() => setShowNewAlertModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Safety Alert
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.status === AlertStatus.ACTIVE).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">High Security Zones</p>
                <p className="text-2xl font-bold text-white">
                  {mockZones.filter(z => z.securityScore >= 4).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Critical Alerts</p>
                <p className="text-2xl font-bold text-white">
                  {alerts.filter(a => a.severity === AlertSeverity.DANGER && a.status === AlertStatus.ACTIVE).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Monitored Zones</p>
                <p className="text-2xl font-bold text-white">{mockZones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Safety Alerts
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'zones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Zone Security
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Reported Issues
          </button>
        </nav>
      </div>

      {activeTab === 'alerts' && (
        <Card className="bg-oxford-900 border border-gray-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle>Safety Alerts</CardTitle>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Vertical timeline with connected alerts */}
            <div className="relative">
              {/* Vertical timeline line - centered with correct positioning */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-600/70 via-indigo-600/40 to-indigo-600/10"></div>
              
              {loadingAlerts && (
                <div className="pl-16 py-6 text-gray-400">Loading alerts...</div>
              )}
              {alertsError && (
                <div className="pl-16 py-6 text-rose-400">{alertsError}</div>
              )}
              {!loadingAlerts && !alertsError && filteredAlerts.map((alert) => (
                <div key={alert.id} className="relative mb-8 last:mb-0 pl-16">
                  {/* Timeline node - matching Reviews page style */}
                  <div className={`absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-lg ${
                    alert.severity === AlertSeverity.DANGER 
                      ? "bg-gradient-to-br from-rose-500/20 to-rose-600/30 border border-rose-500/30"
                      : alert.severity === AlertSeverity.WARNING
                        ? "bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30"
                        : "bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/30"
                  }`}>
                    {alert.severity === AlertSeverity.DANGER ? (
                      <XCircle className="h-6 w-6 text-rose-400" />
                    ) : alert.severity === AlertSeverity.WARNING ? (
                      <AlertTriangle className="h-6 w-6 text-amber-400" />
                    ) : (
                      <Shield className="h-6 w-6 text-blue-400" />
                    )}
                  </div>
                  
                  {/* Alert content card with sharp corners */}
                  <div className="relative bg-oxford-900 bg-opacity-50 p-5 border border-gray-800">
                    {/* Sharp corner borders - top left */}
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - top right */}
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom left */}
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom right */}
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    {/* Sharp corner borders - top left */}
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - top right */}
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom left */}
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom right */}
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                          {alert.pinned && <Badge variant="secondary">Pinned</Badge>}
                          {alert.visibleOnHomepage && <Badge variant="default">Homepage</Badge>}
                        </div>
                        
                        <p className="text-gray-300 mb-4">{alert.content}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-blue-400">Affected Zones</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {alert.zones.map((zone, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs ${zone === 'All Zones' ? 'bg-indigo-900/40 text-indigo-200 border-indigo-700' : 'bg-blue-900/40 text-blue-200 border-blue-700'}`}
                                >
                                  {zone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Start Date</p>
                            <p className="font-medium text-white flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(alert.startAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">End Date</p>
                            <p className="font-medium text-white">
                              {alert.endAt ? formatDate(alert.endAt) : 'No expiry'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Created By</p>
                            <p className="font-medium text-white">{alert.createdBy}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-oxford-800 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-900/30 hover:text-indigo-300"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setEditAlertForm({ title: alert.title, message: alert.content, severity: alert.severity });
                            setShowEditAlertModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-oxford-800 text-rose-400 border border-rose-600/30 hover:bg-rose-900/30 hover:text-rose-300"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowDeleteAlertModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!loadingAlerts && !alertsError && filteredAlerts.length === 0 && (
                <div className="relative pl-16 py-10">
                  {/* Empty state node */}
                  <div className="absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center bg-oxford-800 border border-gray-700">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  {/* Empty state card with sharp corners */}
                  <div className="relative bg-oxford-900/50 p-6 text-center">
                    {/* Sharp corner borders - top left */}
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Sharp corner borders - top right */}
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Sharp corner borders - bottom left */}
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    {/* Sharp corner borders - bottom right */}
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    
                    <p className="text-gray-400">No alerts found matching your filters</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

  {activeTab === 'zones' && (
        <Card className="bg-oxford-900 border border-gray-800">
          <CardHeader>
            <CardTitle>Zone Security Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Vertical timeline with connected zones */}
            <div className="relative">
              {/* Vertical timeline line - with proper positioning */}
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-600/70 via-green-600/40 to-green-600/10"></div>
              
              {mockZones.map((zone) => (
                <div key={zone.id} className="relative mb-8 last:mb-0 pl-16">
                  {/* Timeline node - with proper sizing */}
                  <div className={`absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-lg ${
                    zone.securityScore >= 4
                      ? "bg-gradient-to-br from-green-500/20 to-green-600/30 border border-green-500/30"
                      : zone.securityScore === 3
                        ? "bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/30"
                        : "bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30"
                  }`}>
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  
                  {/* Zone content card with sharp corners */}
                  <div className="relative bg-oxford-900/50 p-5 border border-gray-800">
                    {/* Sharp corner borders - top left */}
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - top right */}
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom left */}
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    {/* Sharp corner borders - bottom right */}
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-indigo-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-indigo-500/40"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                          {getSecurityStars(zone.securityScore)}
                          {zone.activeAlerts > 0 && (
                            <Badge variant="warning">
                              {zone.activeAlerts} Active Alert{zone.activeAlerts > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Security Score</p>
                            <p className="font-medium text-white">{zone.securityScore}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Total Listings</p>
                            <p className="font-medium text-white">{zone.totalListings}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Active Alerts</p>
                            <p className="font-medium text-white">{zone.activeAlerts}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-oxford-800 text-indigo-400 border border-indigo-600/30 hover:bg-indigo-900/30 hover:text-indigo-300"
                          onClick={() => {
                            setSelectedZone(zone);
                            setShowEditZoneModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-oxford-800 text-blue-400 border border-blue-600/30 hover:bg-blue-900/30 hover:text-blue-300"
                          onClick={() => {
                            setSelectedZone(zone);
                            setShowZoneMapModal(true);
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'issues' && (
        <Card className="bg-oxford-900 border border-gray-800">
          <CardHeader>
            <CardTitle>Reported Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-600/70 via-amber-600/40 to-amber-600/10"></div>
              {loadingIssues && <div className="pl-16 py-6 text-gray-400">Loading issues...</div>}
              {issuesError && <div className="pl-16 py-6 text-rose-400">{issuesError}</div>}
              {!loadingIssues && !issuesError && issues.map(issue => (
                <div key={issue._id} className="relative mb-8 last:mb-0 pl-16">
                  <div className="absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30">
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="relative bg-oxford-900/50 p-5 border border-gray-800">
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-amber-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-amber-500/40"></div>
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-amber-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-amber-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-amber-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-amber-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-amber-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-amber-500/40"></div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{issue.type || 'Issue'}</h3>
                          {issue.verified && <Badge variant="success">Verified</Badge>}
                        </div>
                        <p className="text-gray-300 mb-2 whitespace-pre-wrap">{issue.description}</p>
                        <p className="text-xs text-gray-500">Reported {formatDate(issue.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!loadingIssues && !issuesError && issues.length === 0 && (
                <div className="relative pl-16 py-10">
                  <div className="absolute left-0 top-0 w-[55px] h-[55px] rounded-full flex items-center justify-center bg-oxford-800 border border-gray-700">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="relative bg-oxford-900/50 p-6 text-center">
                    <div className="absolute top-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    <div className="absolute top-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute top-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-gray-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-gray-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-gray-500/40"></div>
                    <p className="text-gray-400">No reported issues.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Alert Modal */}
      <Modal
        isOpen={showNewAlertModal}
        onClose={() => setShowNewAlertModal(false)}
        title="Create Safety Alert"
        tone="info"
        className="border border-gray-800 max-w-5xl w-full"
      >
  <div className="space-y-12 pr-1">
          {/* Section: Basic Details */}
          <section className="relative pl-5" data-section="basic-details">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-700 via-indigo-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 border border-indigo-400/30 shadow-[0_0_0_2px_rgba(79,70,229,0.35)]" />
            
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Basic Details <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
              <p className="text-xs text-gray-400">Enter the alert title and basic information</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">
                  Alert Title
                </label>
                <Input 
                  value={newAlertForm.title}
                  onChange={e=>setNewAlertForm(f=>({...f,title:e.target.value}))}
                  placeholder="e.g., Security Alert: Increased Theft Reports" 
                  className="bg-oxford-900 border-gray-800 focus:border-indigo-600/50 focus:ring-indigo-600/20"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Severity Level
                </label>
                <select value={newAlertForm.severity} onChange={e=>setNewAlertForm(f=>({...f,severity:e.target.value}))} className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Affected Zones
                </label>
                <Input 
                  value={newAlertForm.zones}
                  onChange={e=>setNewAlertForm(f=>({...f,zones:e.target.value}))}
                  placeholder="e.g., Lurambi, Kefinco (comma separated)" 
                  className="bg-oxford-900 border-gray-800 border-blue-700/40 focus:border-blue-600/70 focus:ring-blue-600/30"
                />
              </div>
            </div>
          </section>
          
          {/* Section: Timeline */}
          <section className="relative pl-5" data-section="timeline">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-700 via-blue-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
            
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Timeline <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
              <p className="text-xs text-gray-400">Set when this alert should be active</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startParts.date}
                    onChange={e=>{
                      const date = e.target.value;
                      const time = startParts.time || '00:00';
                      const combined = date ? `${date}T${time}` : '';
                      setNewAlertForm(f=>{ const updated = { ...f, startAt: combined };
                        if(durationPreset !== 'custom') { const { end } = applyDurationPreset(durationPreset, combined); updated.endAt = end; }
                        return updated;});
                    }}
                    className="w-1/2 bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="time"
                    value={startParts.time}
                    onChange={e=>{
                      const time = e.target.value;
                      const date = startParts.date || new Date().toISOString().slice(0,10);
                      const combined = `${date}T${time}`;
                      setNewAlertForm(f=>{ const updated = { ...f, startAt: combined };
                        if(durationPreset !== 'custom') { const { end } = applyDurationPreset(durationPreset, combined); updated.endAt = end; }
                        return updated;});
                    }}
                    className="w-1/2 bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endParts.date}
                    onChange={e=>{
                      const date = e.target.value;
                      const time = endParts.time || '00:00';
                      const combined = date ? `${date}T${time}` : '';
                      setNewAlertForm(f=>({ ...f, endAt: combined }));
                    }}
                    disabled={durationPreset !== 'custom'}
                    className={`w-1/2 bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 ${durationPreset !== 'custom' ? 'opacity-60 cursor-not-allowed':''}`}
                  />
                  <input
                    type="time"
                    value={endParts.time}
                    onChange={e=>{
                      const time = e.target.value;
                      const date = endParts.date || startParts.date || new Date().toISOString().slice(0,10);
                      const combined = `${date}T${time}`;
                      setNewAlertForm(f=>({ ...f, endAt: combined }));
                    }}
                    disabled={durationPreset !== 'custom'}
                    className={`w-1/2 bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 ${durationPreset !== 'custom' ? 'opacity-60 cursor-not-allowed':''}`}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Duration Preset</label>
              <select
                value={durationPreset}
                onChange={e=>{
                  const preset = e.target.value as typeof durationPreset;
                  setDurationPreset(preset);
                  if(preset !== 'custom') {
                    setNewAlertForm(f=>{ const { end } = applyDurationPreset(preset, f.startAt); return { ...f, endAt: end }; });
                  }
                }}
                className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="none">No expiry (open-ended)</option>
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="custom">Custom End Date</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose how long the alert stays active. Select Custom to manually set an end date.</p>
            </div>
          </section>
          
          {/* Section: Content */}
          <section className="relative pl-5" data-section="content">
            <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-purple-700 via-purple-700/40 to-transparent pointer-events-none" />
            <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 border border-purple-400/30 shadow-[0_0_0_2px_rgba(147,51,234,0.35)]" />
            
            <header className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">Content <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
              <p className="text-xs text-gray-400">Provide detailed alert information</p>
            </header>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Alert Content
              </label>
              <textarea
                value={newAlertForm.message}
                onChange={e=>setNewAlertForm(f=>({...f,message:e.target.value}))}
                className="w-full rounded-md text-white bg-oxford-900 border-gray-800 focus:border-purple-600/50 focus:ring-purple-600/20"
                rows={4}
                placeholder="Provide detailed information about the safety concern or notice..."
              />
            </div>
            
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="pin-alert" checked={newAlertForm.pinned} onChange={e=>setNewAlertForm(f=>({...f,pinned:e.target.checked}))} />
                <label htmlFor="pin-alert" className="text-sm text-gray-300 cursor-pointer">Pin to top of alerts</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="show-homepage" checked={newAlertForm.visibleOnHomepage} onChange={e=>setNewAlertForm(f=>({...f,visibleOnHomepage:e.target.checked}))} />
                <label htmlFor="show-homepage" className="text-sm text-gray-300 cursor-pointer">Show on homepage</label>
              </div>
            </div>
          </section>
          
          <div className="mt-8 flex flex-wrap gap-3 justify-end border-t border-gray-800/50 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowNewAlertModal(false)} 
              className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60"
            >
              Cancel
            </Button>
            <Button disabled={creating} onClick={async ()=>{
              try {
                setCreating(true);
                const payload: CreateNotificationPayload = {
                  title: newAlertForm.title,
                  message: newAlertForm.message,
                  type: 'safety-alert',
                  startAt: newAlertForm.startAt ? new Date(newAlertForm.startAt).toISOString() : undefined,
                  endAt: newAlertForm.endAt ? new Date(newAlertForm.endAt).toISOString() : undefined,
                };
                const created = await createNotification(payload);
                setAlerts(a => [mapNotification(created), ...a]); // optimistic
                setShowNewAlertModal(false);
                setNewAlertForm({ title:'', message:'', severity:'info', zones:'', pinned:false, visibleOnHomepage:false, startAt:'', endAt:'' });
                setDurationPreset('none');
                notify('Notification created','success');
              } catch(e){ console.error(e); notify('Create failed','error'); }
              finally { setCreating(false); }
            }} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white shadow">
              {creating ? 'Publishing...' : 'Publish Alert'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Alert Modal */}
      <Modal
        isOpen={showEditAlertModal}
        onClose={() => setShowEditAlertModal(false)}
        title="Edit Safety Alert"
        tone="info"
        className="border border-gray-800 max-w-5xl w-full"
      >
  {selectedAlert && (
          <div className="space-y-12 pr-1">
            {/* Section: Basic Details */}
            <section className="relative pl-5" data-section="basic-details">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-700 via-indigo-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 border border-indigo-400/30 shadow-[0_0_0_2px_rgba(79,70,229,0.35)]" />
              
              <header className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">Basic Details <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
                <p className="text-xs text-gray-400">Update the alert title and basic information</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">
                    Alert Title
                  </label>
                  <Input 
                    value={editAlertForm.title}
                    onChange={e=>setEditAlertForm(f=>({...f,title:e.target.value}))}
                    placeholder="e.g., Security Alert: Increased Theft Reports" 
                    className="bg-oxford-900 border-gray-800 focus:border-indigo-600/50 focus:ring-indigo-600/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Severity Level
                  </label>
                  <select 
                    value={editAlertForm.severity}
                    onChange={e=>setEditAlertForm(f=>({...f,severity:e.target.value}))}
                    className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Affected Zones
                  </label>
                  <Input 
                    value={selectedAlert.zones.join(', ')}
                    disabled
                    placeholder="Zones (not editable)" 
                    className="bg-oxford-900 border-gray-800 border-blue-700/40 focus:border-blue-600/70 focus:ring-blue-600/30 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </section>
            
            {/* Section: Timeline */}
            <section className="relative pl-5" data-section="timeline">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-700 via-blue-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
              
              <header className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">Timeline <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
                <p className="text-xs text-gray-400">Update when this alert should be active</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Start Date
                  </label>
                  <Input 
                    type="datetime-local" 
                    defaultValue={selectedAlert.startAt ? new Date(selectedAlert.startAt).toISOString().slice(0, 16) : ''}
                    className="bg-oxford-900 border-gray-800 focus:border-blue-600/50 focus:ring-blue-600/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    End Date (Optional)
                  </label>
                  <Input 
                    type="datetime-local" 
                    defaultValue={selectedAlert.endAt ? new Date(selectedAlert.endAt).toISOString().slice(0, 16) : ''}
                    className="bg-oxford-900 border-gray-800 focus:border-blue-600/50 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            </section>
            
            {/* Section: Content */}
            <section className="relative pl-5" data-section="content">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-purple-700 via-purple-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 border border-purple-400/30 shadow-[0_0_0_2px_rgba(147,51,234,0.35)]" />
              
              <header className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">Content <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 3</span></h3>
                <p className="text-xs text-gray-400">Update detailed alert information</p>
              </header>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Alert Content
                </label>
                <textarea
                  value={editAlertForm.message}
                  onChange={e=>setEditAlertForm(f=>({...f,message:e.target.value}))}
                  className="w-full rounded-md text-white bg-oxford-900 border-gray-800 focus:border-purple-600/50 focus:ring-purple-600/20"
                  rows={4}
                  placeholder="Provide detailed information about the safety concern or notice..."
                />
              </div>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-700 bg-oxford-900" 
                    id="edit-pin-alert" 
                    defaultChecked={selectedAlert.pinned}
                  />
                  <label htmlFor="edit-pin-alert" className="text-sm text-gray-300 cursor-pointer">Pin to top of alerts</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-700 bg-oxford-900" 
                    id="edit-show-homepage" 
                    defaultChecked={selectedAlert.visibleOnHomepage}
                  />
                  <label htmlFor="edit-show-homepage" className="text-sm text-gray-300 cursor-pointer">Show on homepage</label>
                </div>
              </div>
            </section>
            
            <div className="mt-8 flex flex-wrap gap-3 justify-end border-t border-gray-800/50 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowEditAlertModal(false)} 
                className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60"
              >
                Cancel
              </Button>
              <Button disabled={updating} onClick={async ()=>{
                if(!selectedAlert) return;
                try {
                  setUpdating(true);
                  let type: 'new-listing' | 'price-drop' | 'safety-alert';
                  if (editAlertForm.severity === 'info') type = 'new-listing';
                  else if (editAlertForm.severity === 'warning') type = 'price-drop';
                  else type = 'safety-alert';
                  const updated = await apiUpdateNotification(selectedAlert.id, { title: editAlertForm.title, message: editAlertForm.message, type });
                  setAlerts(a=> a.map(al => al.id === selectedAlert.id ? mapNotification(updated) : al));
                  setShowEditAlertModal(false);
                  setSelectedAlert(null);
                  notify('Notification updated','success');
                } catch(e){ console.error(e); notify('Update failed','error'); }
                finally { setUpdating(false); }
              }} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white shadow">
                {updating ? 'Updating...' : 'Update Alert'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteAlertModal}
        onClose={() => setShowDeleteAlertModal(false)}
        title="Delete Safety Alert"
        tone="danger"
        className="border border-gray-800 max-w-lg w-full"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="relative pl-5" data-section="delete">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-gray-700 via-gray-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-rose-600 to-red-600 border border-rose-400/30 shadow-[0_0_0_2px_rgba(225,29,72,0.35)]" />
              
              <div className="pl-2">
                <p className="text-gray-300 mb-2">Are you sure you want to delete this safety alert?</p>
                <div className="bg-rose-950/20 text-rose-200 p-4 rounded-md border border-rose-900/50 text-sm">
                  <p className="flex items-center gap-2"><Ban size={16} /> This action cannot be undone.</p>
                  <p className="mt-1 text-xs text-rose-300/70">Once deleted, this alert will no longer be visible to users.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                onClick={() => setShowDeleteAlertModal(false)} 
                variant="secondary"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={async ()=>{
                  if(!selectedAlert) return; 
                  try { 
                    setDeleting(true); 
                    await apiDeleteNotification(selectedAlert.id); 
                    setAlerts(a=>a.filter(x=>x.id!==selectedAlert.id));
                    setShowDeleteAlertModal(false);
                    notify('Notification deleted','success');
                  } catch{ notify('Delete failed','error'); }
                  finally { setDeleting(false);} }
                }
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-md shadow-rose-600/20"
              >
                {deleting ? 'Deleting...' : 'Delete Alert'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Zone Modal */}
      <Modal
        isOpen={showEditZoneModal}
        onClose={() => setShowEditZoneModal(false)}
        title="Edit Zone Security"
        tone="info"
        className="border border-gray-800 max-w-3xl w-full"
      >
        {selectedZone && (
          <div className="space-y-12 pr-1">
            {/* Section: Zone Details */}
            <section className="relative pl-5" data-section="basic-details">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-700 via-emerald-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(52,211,153,0.35)]" />
              
              <header className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">Zone Details <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 1</span></h3>
                <p className="text-xs text-gray-400">Update the zone information and security status</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Zone Name
                  </label>
                  <Input 
                    defaultValue={selectedZone.name}
                    className="bg-oxford-900 border-gray-800 focus:border-emerald-600/50 focus:ring-emerald-600/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Security Score (1-5)
                  </label>
                  <select 
                    defaultValue={selectedZone.securityScore}
                    className="w-full bg-oxford-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={1}>1 - Very Poor</option>
                    <option value={2}>2 - Poor</option>
                    <option value={3}>3 - Average</option>
                    <option value={4}>4 - Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
              </div>
            </section>
            
            {/* Section: Security Information */}
            <section className="relative pl-5" data-section="security">
              <div className="absolute left-0.5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-700 via-blue-700/40 to-transparent pointer-events-none" />
              <div className="absolute left-[-6px] top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.35)]" />
              
              <header className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">Security Information <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">Step 2</span></h3>
                <p className="text-xs text-gray-400">Add security details for this zone</p>
              </header>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Security Notes
                  </label>
                  <textarea
                    defaultValue="This zone has a good security rating with regular security patrols and street lighting. Some minor theft incidents have been reported in the past 6 months."
                    className="w-full rounded-md text-white bg-oxford-900 border-gray-800 focus:border-blue-600/50 focus:ring-blue-600/20"
                    rows={3}
                    placeholder="Add security details about this zone..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Security Features
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="security-patrols" defaultChecked />
                        <label htmlFor="security-patrols" className="text-sm text-gray-300 cursor-pointer">Security patrols</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="street-lighting" defaultChecked />
                        <label htmlFor="street-lighting" className="text-sm text-gray-300 cursor-pointer">Street lighting</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="cctv" />
                        <label htmlFor="cctv" className="text-sm text-gray-300 cursor-pointer">CCTV coverage</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Security Concerns
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="theft" defaultChecked />
                        <label htmlFor="theft" className="text-sm text-gray-300 cursor-pointer">Minor theft reports</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="harassment" />
                        <label htmlFor="harassment" className="text-sm text-gray-300 cursor-pointer">Harassment incidents</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-700 bg-oxford-900" id="poor-lighting" />
                        <label htmlFor="poor-lighting" className="text-sm text-gray-300 cursor-pointer">Poor lighting in certain areas</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="mt-8 flex flex-wrap gap-3 justify-end border-t border-gray-800/50 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowEditZoneModal(false)} 
                className="bg-gray-700/40 hover:bg-gray-600/60 text-gray-200 border border-gray-600/60"
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow">
                Update Zone
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Zone Map Modal */}
      <Modal
        isOpen={showZoneMapModal}
        onClose={() => setShowZoneMapModal(false)}
        title={selectedZone ? `${selectedZone.name} Zone Map` : "Zone Map"}
        tone="info"
        className="border border-gray-800 max-w-[80vw] w-full bg-oxford-950"
      >
        {selectedZone && (
          <div className="space-y-6">
            <div className="rounded-md overflow-hidden relative bg-oxford-950 border border-gray-800 h-[60vh]">
              {/* Sharp corner borders - top left */}
              <div className="absolute top-0 left-0 w-5 h-[2px] bg-blue-500/60 z-10"></div>
              <div className="absolute top-0 left-0 w-[2px] h-5 bg-blue-500/60 z-10"></div>
              
              {/* Sharp corner borders - top right */}
              <div className="absolute top-0 right-0 w-5 h-[2px] bg-blue-500/60 z-10"></div>
              <div className="absolute top-0 right-0 w-[2px] h-5 bg-blue-500/60 z-10"></div>
              
              {/* Sharp corner borders - bottom left */}
              <div className="absolute bottom-0 left-0 w-5 h-[2px] bg-blue-500/60 z-10"></div>
              <div className="absolute bottom-0 left-0 w-[2px] h-5 bg-blue-500/60 z-10"></div>
              
              {/* Sharp corner borders - bottom right */}
              <div className="absolute bottom-0 right-0 w-5 h-[2px] bg-blue-500/60 z-10"></div>
              <div className="absolute bottom-0 right-0 w-[2px] h-5 bg-blue-500/60 z-10"></div>
              
              {/* Map Container */}
              <div className="w-full h-full bg-oxford-950 flex items-center justify-center">
                {/* Actual map view - showing a real satellite view of Kakamega area */}
                <div className="absolute inset-0">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15960.271957561385!2d34.75362245!3d0.28387105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1692974421154!5m2!1sen!2ske" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                </div>
                
                {/* Semi-transparent overlay to darken the map slightly and match app theme */}
                <div className="absolute inset-0 bg-oxford-950/30 pointer-events-none"></div>
                
                {/* Zone boundary overlay - would use real coordinates in production */}
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <path 
                      d="M200,150 L300,100 L400,150 L450,250 L400,350 L300,400 L200,350 L150,250 Z" 
                      fill="rgba(59, 130, 246, 0.15)" 
                      stroke="rgba(59, 130, 246, 0.7)" 
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
                
                {/* Zone marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-600/80 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce-slow">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Safety score indicator */}
                <div className="absolute top-4 right-4 bg-oxford-900/90 rounded-md p-3 border border-gray-800 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Safety Score</p>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Shield
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedZone.securityScore ? 'text-green-500 fill-current' : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Safety score indicator */}
                <div className="absolute top-4 right-4 bg-oxford-900/90 rounded-md p-3 border border-gray-800 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Safety Score</p>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Shield
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedZone.securityScore ? 'text-green-500 fill-current' : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-oxford-900/50 p-4 rounded-md border border-gray-800">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Zone Information</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-medium">{selectedZone.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Total Listings:</span>
                    <span className="text-white font-medium">{selectedZone.totalListings}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Active Alerts:</span>
                    <span className="text-white font-medium">{selectedZone.activeAlerts}</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-oxford-900/50 p-4 rounded-md border border-gray-800">
                <h3 className="text-sm font-medium text-green-400 mb-2">Safety Rating</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Overall Rating:</span>
                    <span className="text-white font-medium">{selectedZone.securityScore}/5</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Night Safety:</span>
                    <span className="text-white font-medium">Good</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Theft Risk:</span>
                    <span className="text-white font-medium">Low</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-oxford-900/50 p-4 rounded-md border border-gray-800">
                <h3 className="text-sm font-medium text-amber-400 mb-2">Proximity</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Police Station:</span>
                    <span className="text-white font-medium">1.2 km</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">University:</span>
                    <span className="text-white font-medium">0.8 km</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Hospital:</span>
                    <span className="text-white font-medium">2.5 km</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Custom animation for the bouncing marker */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes bounce-slow {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 3s infinite;
              }
            `}} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SafetyPage;