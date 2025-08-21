import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Building, 
  AlertTriangle,
  TrendingUp,
  Users,
  Eye,
  Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// Mock zones data
const mockZones = [
  {
    id: '1',
    name: 'Amalemba',
    aliases: ['Amalemba Estate', 'Amalemba Center'],
    securityScore: 4,
    bounds: null,
    landmarks: ['MMUST Gate B', 'Amalemba Shopping Center', 'Amalemba Primary School'],
    notes: 'Popular area among students due to proximity to main gate',
    totalListings: 45,
    activeListings: 42,
    avgPrice: 6500,
    searchVolume: 2456,
    contactClicks: 234,
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '2',
    name: 'Kefinco',
    aliases: ['Kefinco Estate', 'Kefinco Area'],
    securityScore: 3,
    bounds: null,
    landmarks: ['Kefinco Shopping Center', 'Kefinco Primary School', 'Water Point'],
    notes: 'Affordable housing options with good transport links',
    totalListings: 32,
    activeListings: 28,
    avgPrice: 4200,
    searchVolume: 1876,
    contactClicks: 187,
    createdAt: '2023-07-20T09:15:00Z',
    updatedAt: '2024-01-14T11:45:00Z'
  },
  {
    id: '3',
    name: 'Lurambi',
    aliases: ['Lurambi Estate', 'Lurambi Center'],
    securityScore: 2,
    bounds: null,
    landmarks: ['Lurambi Market', 'Matatu Stage', 'Police Post'],
    notes: 'Mixed area with varying security levels - requires careful screening',
    totalListings: 28,
    activeListings: 24,
    avgPrice: 3800,
    searchVolume: 1654,
    contactClicks: 145,
    createdAt: '2023-08-10T16:30:00Z',
    updatedAt: '2024-01-13T09:20:00Z'
  },
  {
    id: '4',
    name: 'Shirugu',
    aliases: ['Shirugu Estate'],
    securityScore: 4,
    bounds: null,
    landmarks: ['Shirugu Shopping Center', 'Health Center', 'Primary School'],
    notes: 'Quiet residential area with good security',
    totalListings: 18,
    activeListings: 16,
    avgPrice: 5800,
    searchVolume: 1234,
    contactClicks: 123,
    createdAt: '2023-09-05T12:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z'
  },
  {
    id: '5',
    name: 'Friends',
    aliases: ['Friends Estate', 'Friends Area'],
    securityScore: 3,
    bounds: null,
    landmarks: ['Friends Market', 'Community Center'],
    notes: 'Emerging area with growing student population',
    totalListings: 15,
    activeListings: 13,
    avgPrice: 4500,
    searchVolume: 987,
    contactClicks: 89,
    createdAt: '2023-10-12T14:45:00Z',
    updatedAt: '2024-01-11T10:15:00Z'
  }
];

const ZonesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewZoneModal, setShowNewZoneModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);

  const getSecurityBadge = (score: number) => {
    if (score >= 4) return <Badge variant="success">High Security</Badge>;
    if (score >= 3) return <Badge variant="warning">Medium Security</Badge>;
    return <Badge variant="destructive">Low Security</Badge>;
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

  const filteredZones = mockZones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         zone.landmarks.some(landmark => landmark.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Zone Management</h1>
          <p className="text-gray-400">Manage geographical zones and their security ratings</p>
        </div>
        <Button onClick={() => setShowNewZoneModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Zone
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Zones</p>
                <p className="text-2xl font-bold text-white">{mockZones.length}</p>
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
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Listings</p>
                <p className="text-2xl font-bold text-white">
                  {mockZones.reduce((acc, z) => acc + z.totalListings, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Security Score</p>
                <p className="text-2xl font-bold text-white">
                  {(mockZones.reduce((acc, z) => acc + z.securityScore, 0) / mockZones.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Zone Directory</CardTitle>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search zones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredZones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                      {getSecurityBadge(zone.securityScore)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">Security Rating</p>
                        {getSecurityStars(zone.securityScore)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Listings</p>
                        <p className="font-medium text-white">{zone.activeListings} / {zone.totalListings}</p>
                        <p className="text-xs text-gray-400">Active / Total</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Price</p>
                        <p className="font-medium text-white">KES {zone.avgPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Search Volume</p>
                        <p className="font-medium text-white">{zone.searchVolume.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{zone.contactClicks} contacts</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Aliases</p>
                      <div className="flex flex-wrap gap-2">
                        {zone.aliases.map((alias, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {alias}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Key Landmarks</p>
                      <div className="flex flex-wrap gap-2">
                        {zone.landmarks.slice(0, 3).map((landmark, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {landmark}
                          </Badge>
                        ))}
                        {zone.landmarks.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{zone.landmarks.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {zone.notes && (
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-md">
                        <p className="text-sm text-gray-300">{zone.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowZoneModal(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Map className="h-4 w-4" />
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

      {/* New Zone Modal */}
      <Modal
        isOpen={showNewZoneModal}
        onClose={() => setShowNewZoneModal(false)}
        title="Add New Zone"
        size="xl"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Create a new geographical zone for better organization of listings and security management.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zone Name
              </label>
              <Input placeholder="e.g., Amalemba" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Security Score (1-5)
              </label>
              <select className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                <option value="1">1 - Very Low Security</option>
                <option value="2">2 - Low Security</option>
                <option value="3">3 - Medium Security</option>
                <option value="4">4 - High Security</option>
                <option value="5">5 - Very High Security</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aliases (comma separated)
            </label>
            <Input placeholder="e.g., Amalemba Estate, Amalemba Center" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Landmarks (comma separated)
            </label>
            <Input placeholder="e.g., MMUST Gate B, Shopping Center, Primary School" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              rows={3}
              placeholder="Additional information about this zone..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowNewZoneModal(false)}>
              Cancel
            </Button>
            <Button>
              Create Zone
            </Button>
          </div>
        </div>
      </Modal>

      {/* Zone Detail Modal */}
      <Modal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        title={selectedZone?.name || 'Zone Details'}
        size="xl"
      >
        {selectedZone && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Zone Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security Score:</span>
                    <div className="flex items-center">
                      {getSecurityStars(selectedZone.securityScore)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Listings:</span>
                    <span className="text-white">{selectedZone.totalListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Listings:</span>
                    <span className="text-white">{selectedZone.activeListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Price:</span>
                    <span className="text-white">KES {selectedZone.avgPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Search Volume:</span>
                    <span className="text-white">{selectedZone.searchVolume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contact Clicks:</span>
                    <span className="text-white">{selectedZone.contactClicks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversion Rate:</span>
                    <span className="text-white">{((selectedZone.contactClicks / selectedZone.searchVolume) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Aliases</h3>
              <div className="flex flex-wrap gap-2">
                {selectedZone.aliases.map((alias: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {alias}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Key Landmarks</h3>
              <div className="flex flex-wrap gap-2">
                {selectedZone.landmarks.map((landmark: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {landmark}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedZone.notes && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                <p className="text-gray-300">{selectedZone.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Zone
              </Button>
              <Button variant="outline">
                <Map className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ZonesPage;