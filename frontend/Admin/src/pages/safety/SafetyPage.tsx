import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AlertSeverity, AlertStatus } from '../../types';
import { formatDate } from '../../lib/utils';

// Mock safety alerts data
const mockAlerts = [
  {
    id: '1',
    title: 'Security Alert: Increased Theft Reports in Lurambi',
    content: 'Multiple reports of theft incidents in Lurambi estate, particularly around the evening hours. Students are advised to avoid walking alone after 8 PM and use well-lit paths.',
    severity: AlertSeverity.WARNING,
    zones: ['Lurambi', 'Lurambi Center'],
    startAt: '2024-01-15T08:00:00Z',
    endAt: '2024-01-22T23:59:59Z',
    pinned: true,
    visibleOnHomepage: true,
    createdBy: 'Super Admin',
    createdAt: '2024-01-15T08:00:00Z',
    status: AlertStatus.ACTIVE
  },
  {
    id: '2',
    title: 'Water Shortage Notice - Kefinco Estate',
    content: 'Water supply will be interrupted in Kefinco estate from January 18-20 due to maintenance work. Residents should store water in advance.',
    severity: AlertSeverity.INFO,
    zones: ['Kefinco'],
    startAt: '2024-01-18T06:00:00Z',
    endAt: '2024-01-20T18:00:00Z',
    pinned: false,
    visibleOnHomepage: true,
    createdBy: 'Super Admin',
    createdAt: '2024-01-16T14:30:00Z',
    status: AlertStatus.ACTIVE
  },
  {
    id: '3',
    title: 'URGENT: Fraudulent Landlord Alert',
    content: 'A fraudulent landlord using phone number +254700123456 has been reported for collecting deposits without providing accommodation. Do not engage with this number.',
    severity: AlertSeverity.DANGER,
    zones: ['All Zones'],
    startAt: '2024-01-14T12:00:00Z',
    pinned: true,
    visibleOnHomepage: true,
    createdBy: 'Super Admin',
    createdAt: '2024-01-14T12:00:00Z',
    status: AlertStatus.ACTIVE
  },
  {
    id: '4',
    title: 'Road Construction - Amalemba Access',
    content: 'Road construction on the main access road to Amalemba estate. Expect delays and use alternative routes.',
    severity: AlertSeverity.INFO,
    zones: ['Amalemba'],
    startAt: '2024-01-10T06:00:00Z',
    endAt: '2024-01-12T18:00:00Z',
    pinned: false,
    visibleOnHomepage: false,
    createdBy: 'Super Admin',
    createdAt: '2024-01-10T06:00:00Z',
    status: AlertStatus.EXPIRED
  }
];

// Mock zones data
const mockZones = [
  { id: '1', name: 'Amalemba', securityScore: 4, totalListings: 45, activeAlerts: 0 },
  { id: '2', name: 'Kefinco', securityScore: 3, totalListings: 32, activeAlerts: 1 },
  { id: '3', name: 'Lurambi', securityScore: 2, totalListings: 28, activeAlerts: 1 },
  { id: '4', name: 'Shirugu', securityScore: 4, totalListings: 18, activeAlerts: 0 },
  { id: '5', name: 'Friends', securityScore: 3, totalListings: 15, activeAlerts: 0 }
];

const SafetyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'zones'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);

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

  const filteredAlerts = mockAlerts.filter(alert => {
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
                  {mockAlerts.filter(a => a.status === AlertStatus.ACTIVE).length}
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
                  {mockAlerts.filter(a => a.severity === AlertSeverity.DANGER && a.status === AlertStatus.ACTIVE).length}
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
        </nav>
      </div>

      {activeTab === 'alerts' && (
        <Card>
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
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
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
                          <p className="text-sm text-gray-400">Affected Zones</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.zones.map((zone, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'zones' && (
        <Card>
          <CardHeader>
            <CardTitle>Zone Security Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockZones.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
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
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Alert Modal */}
      <Modal
        isOpen={showNewAlertModal}
        onClose={() => setShowNewAlertModal(false)}
        title="Create Safety Alert"
        size="xl"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Create a new safety alert to inform students about security concerns or important notices.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alert Title
              </label>
              <Input placeholder="e.g., Security Alert: Increased Theft Reports" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Severity Level
              </label>
              <select className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Affected Zones
              </label>
              <Input placeholder="e.g., Lurambi, Kefinco (comma separated)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <Input type="datetime-local" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <Input type="datetime-local" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Content
            </label>
            <textarea
              className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              rows={4}
              placeholder="Provide detailed information about the safety concern or notice..."
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-300">Pin to top of alerts</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-300">Show on homepage</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowNewAlertModal(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button>
              Publish Alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SafetyPage;