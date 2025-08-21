import React, { useState } from 'react';
import { 
  Layout, 
  Edit, 
  Eye, 
  Save, 
  RotateCcw, 
  Image, 
  Type, 
  Link, 
  Star,
  TrendingUp,
  Shield,
  Building,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

// Mock homepage configuration
const mockHomepageConfig = {
  id: '1',
  hero: {
    headline: 'Find Your Perfect Student Home Near MMUST',
    subtext: 'Discover verified, affordable housing options within walking distance of campus. Safe, clean, and student-friendly accommodations.',
    ctaText: 'Browse Houses',
    ctaUrl: '/listings',
    backgroundImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    backgroundVideo: null
  },
  featuredBlocks: [
    {
      id: '1',
      title: 'Verified Houses',
      type: 'verified_houses',
      items: [
        { id: '1', title: '2BR Apartment - Amalemba', price: 8000, verified: true },
        { id: '2', title: 'Single Room - Kefinco', price: 3500, verified: true },
        { id: '3', title: 'Bedsitter - Lurambi', price: 5000, verified: true }
      ],
      order: 1,
      visible: true
    },
    {
      id: '2',
      title: 'Trending Zones',
      type: 'trending_zones',
      items: [
        { id: '1', name: 'Amalemba', searches: 2456, change: '+15%' },
        { id: '2', name: 'Kefinco', searches: 1876, change: '+8%' },
        { id: '3', name: 'Shirugu', searches: 1234, change: '+12%' }
      ],
      order: 2,
      visible: true
    },
    {
      id: '3',
      title: 'New This Week',
      type: 'new_listings',
      items: [
        { id: '1', title: 'Modern 1BR with Parking', price: 6500, zone: 'Shirugu' },
        { id: '2', title: 'Furnished Bedsitter', price: 4800, zone: 'Friends' }
      ],
      order: 3,
      visible: true
    },
    {
      id: '4',
      title: 'Safety Updates',
      type: 'safety_banners',
      items: [
        { id: '1', title: 'Security Alert: Lurambi Area', severity: 'warning', active: true }
      ],
      order: 4,
      visible: true
    }
  ],
  quickFilters: [
    { id: '1', label: 'Under KES 5,000', query: { maxPrice: 5000 }, order: 1, visible: true },
    { id: '2', label: 'Near Campus', query: { maxDistance: 1 }, order: 2, visible: true },
    { id: '3', label: 'Verified Only', query: { verified: true }, order: 3, visible: true },
    { id: '4', label: 'Hostels', query: { type: 'hostel' }, order: 4, visible: true }
  ],
  mapSnapshot: {
    centerLat: -0.3556,
    centerLng: 34.7833,
    zoom: 14,
    pinStrategy: 'verified_only'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  isActive: true
};

const HomepagePage: React.FC = () => {
  const [config, setConfig] = useState(mockHomepageConfig);
  const [activeTab, setActiveTab] = useState<'hero' | 'blocks' | 'filters' | 'map'>('hero');
  const [showPreview, setShowPreview] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'verified_houses':
        return <Shield className="h-4 w-4" />;
      case 'trending_zones':
        return <TrendingUp className="h-4 w-4" />;
      case 'new_listings':
        return <Building className="h-4 w-4" />;
      case 'safety_banners':
        return <Shield className="h-4 w-4" />;
      default:
        return <Layout className="h-4 w-4" />;
    }
  };

  const getBlockTypeBadge = (type: string) => {
    const labels = {
      'verified_houses': 'Verified Houses',
      'trending_zones': 'Trending Zones',
      'new_listings': 'New Listings',
      'safety_banners': 'Safety Banners'
    };
    return <Badge variant="outline">{labels[type as keyof typeof labels] || type}</Badge>;
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...config.featuredBlocks];
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    blocks[index].order = index + 1;
    blocks[newIndex].order = newIndex + 1;

    setConfig({ ...config, featuredBlocks: blocks });
  };

  const toggleBlockVisibility = (blockId: string) => {
    const blocks = config.featuredBlocks.map(block =>
      block.id === blockId ? { ...block, visible: !block.visible } : block
    );
    setConfig({ ...config, featuredBlocks: blocks });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Homepage Management</h1>
          <p className="text-gray-400">Configure the student-facing homepage content and layout</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-medium text-white">
                  Homepage Status: {config.isActive ? 'Live' : 'Draft'}
                </p>
                <p className="text-sm text-gray-400">
                  Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'hero', label: 'Hero Section', icon: Image },
            { id: 'blocks', label: 'Featured Blocks', icon: Layout },
            { id: 'filters', label: 'Quick Filters', icon: Star },
            { id: 'map', label: 'Map Settings', icon: Layout }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'hero' && (
        <Card>
          <CardHeader>
            <CardTitle>Hero Section Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Main Headline
              </label>
              <Input
                value={config.hero.headline}
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, headline: e.target.value }
                })}
                placeholder="Enter main headline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtext
              </label>
              <textarea
                className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                rows={3}
                value={config.hero.subtext}
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, subtext: e.target.value }
                })}
                placeholder="Enter supporting text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Call-to-Action Text
                </label>
                <Input
                  value={config.hero.ctaText}
                  onChange={(e) => setConfig({
                    ...config,
                    hero: { ...config.hero, ctaText: e.target.value }
                  })}
                  placeholder="e.g., Browse Houses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CTA Link URL
                </label>
                <Input
                  value={config.hero.ctaUrl}
                  onChange={(e) => setConfig({
                    ...config,
                    hero: { ...config.hero, ctaUrl: e.target.value }
                  })}
                  placeholder="e.g., /listings"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Image URL
              </label>
              <Input
                value={config.hero.backgroundImage || ''}
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, backgroundImage: e.target.value }
                })}
                placeholder="Enter image URL"
              />
            </div>

            {config.hero.backgroundImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Preview:</p>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={config.hero.backgroundImage}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'blocks' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Featured Content Blocks</CardTitle>
              <Button onClick={() => setShowBlockModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.featuredBlocks
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <div key={block.id} className="border rounded-lg p-4 border-[hsl(220,10%,20%)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getBlockIcon(block.type)}
                          <h3 className="font-medium text-white">{block.title}</h3>
                        </div>
                        {getBlockTypeBadge(block.type)}
                        {!block.visible && <Badge variant="secondary">Hidden</Badge>}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === config.featuredBlocks.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBlockVisibility(block.id)}
                        >
                          <Eye className={`h-4 w-4 ${block.visible ? 'text-green-500' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBlock(block);
                            setShowBlockModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-400">
                      <p>Order: {block.order} | Items: {block.items.length} | Status: {block.visible ? 'Visible' : 'Hidden'}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'filters' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Filter Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {config.quickFilters
                .sort((a, b) => a.order - b.order)
                .map((filter, index) => (
                  <div key={filter.id} className="border rounded-lg p-4 border-[hsl(220,10%,20%)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-medium text-white">{filter.label}</h3>
                        {!filter.visible && <Badge variant="secondary">Hidden</Badge>}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const filters = [...config.quickFilters];
                            if (index > 0) {
                              [filters[index], filters[index - 1]] = [filters[index - 1], filters[index]];
                              filters[index].order = index + 1;
                              filters[index - 1].order = index;
                              setConfig({ ...config, quickFilters: filters });
                            }
                          }}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const filters = [...config.quickFilters];
                            if (index < filters.length - 1) {
                              [filters[index], filters[index + 1]] = [filters[index + 1], filters[index]];
                              filters[index].order = index + 1;
                              filters[index + 1].order = index + 2;
                              setConfig({ ...config, quickFilters: filters });
                            }
                          }}
                          disabled={index === config.quickFilters.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const filters = config.quickFilters.map(f =>
                              f.id === filter.id ? { ...f, visible: !f.visible } : f
                            );
                            setConfig({ ...config, quickFilters: filters });
                          }}
                        >
                          <Eye className={`h-4 w-4 ${filter.visible ? 'text-green-500' : 'text-gray-400'}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-400">
                      <p>Query: {JSON.stringify(filter.query)} | Order: {filter.order}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Map Snapshot Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Center Latitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={config.mapSnapshot.centerLat}
                  onChange={(e) => setConfig({
                    ...config,
                    mapSnapshot: { ...config.mapSnapshot, centerLat: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Center Longitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={config.mapSnapshot.centerLng}
                  onChange={(e) => setConfig({
                    ...config,
                    mapSnapshot: { ...config.mapSnapshot, centerLng: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zoom Level
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={config.mapSnapshot.zoom}
                  onChange={(e) => setConfig({
                    ...config,
                    mapSnapshot: { ...config.mapSnapshot, zoom: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pin Display Strategy
              </label>
              <select
                value={config.mapSnapshot.pinStrategy}
                onChange={(e) => setConfig({
                  ...config,
                  mapSnapshot: { ...config.mapSnapshot, pinStrategy: e.target.value }
                })}
                className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
              >
                <option value="all">Show All Listings</option>
                <option value="verified_only">Verified Only</option>
                <option value="featured">Featured Listings</option>
                <option value="recent">Recent Listings</option>
              </select>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-md">
              <p className="text-sm text-gray-300">
                <strong>Current Settings:</strong><br />
                Center: {config.mapSnapshot.centerLat}, {config.mapSnapshot.centerLng}<br />
                Zoom: {config.mapSnapshot.zoom}x<br />
                Strategy: {config.mapSnapshot.pinStrategy}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setEditingBlock(null);
        }}
        title={editingBlock ? 'Edit Block' : 'Add New Block'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Block Title
              </label>
              <Input placeholder="e.g., Featured Houses" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Block Type
              </label>
              <select className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                <option value="verified_houses">Verified Houses</option>
                <option value="trending_zones">Trending Zones</option>
                <option value="new_listings">New Listings</option>
                <option value="safety_banners">Safety Banners</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-300">Visible on homepage</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => {
              setShowBlockModal(false);
              setEditingBlock(null);
            }}>
              Cancel
            </Button>
            <Button>
              {editingBlock ? 'Update Block' : 'Add Block'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Homepage Preview"
        size="xl"
      >
        <div className="space-y-6">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <p>Homepage preview would be rendered here</p>
                <p className="text-sm">Shows how the page will look to students</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <p><strong>Hero:</strong> {config.hero.headline}</p>
            <p><strong>Visible Blocks:</strong> {config.featuredBlocks.filter(b => b.visible).length}</p>
            <p><strong>Quick Filters:</strong> {config.quickFilters.filter(f => f.visible).length}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomepagePage;