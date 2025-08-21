import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Phone, 
  Search, 
  MapPin,
  Users,
  Building,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';

// Mock analytics data
const overviewStats = [
  {
    name: 'Total Page Views',
    value: '24,567',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: Eye
  },
  {
    name: 'Contact Clicks',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: Phone
  },
  {
    name: 'Search Queries',
    value: '5,678',
    change: '+15.3%',
    changeType: 'increase' as const,
    icon: Search
  },
  {
    name: 'Unique Visitors',
    value: '3,456',
    change: '-2.1%',
    changeType: 'decrease' as const,
    icon: Users
  }
];

const topSearches = [
  { query: 'bedsitter near gate b', count: 456, change: '+23%' },
  { query: '2 bedroom amalemba', count: 342, change: '+18%' },
  { query: 'single room kefinco', count: 298, change: '+12%' },
  { query: 'hostel near mmust', count: 267, change: '+8%' },
  { query: 'furnished apartment', count: 234, change: '+15%' }
];

const zonePerformance = [
  { zone: 'Amalemba', views: 2456, contacts: 234, conversion: 9.5, trend: 'up' },
  { zone: 'Kefinco', views: 1876, contacts: 187, conversion: 10.0, trend: 'up' },
  { zone: 'Lurambi', views: 1654, contacts: 145, conversion: 8.8, trend: 'down' },
  { zone: 'Shirugu', views: 1234, contacts: 123, conversion: 10.0, trend: 'up' },
  { zone: 'Friends', views: 987, contacts: 89, conversion: 9.0, trend: 'stable' }
];

const priceAnalytics = [
  { type: 'Bedsitter', avgPrice: 4500, minPrice: 3000, maxPrice: 6000, listings: 45 },
  { type: 'Single Room', avgPrice: 3200, minPrice: 2500, maxPrice: 4500, listings: 67 },
  { type: '1 Bedroom', avgPrice: 6800, minPrice: 5000, maxPrice: 9000, listings: 34 },
  { type: '2 Bedroom', avgPrice: 9500, minPrice: 7000, maxPrice: 12000, listings: 23 },
  { type: 'Hostel', avgPrice: 2800, minPrice: 2000, maxPrice: 3500, listings: 12 }
];

const deviceBreakdown = [
  { device: 'Mobile', percentage: 78, users: 2698 },
  { device: 'Desktop', percentage: 18, users: 622 },
  { device: 'Tablet', percentage: 4, users: 138 }
];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'zones' | 'pricing' | 'devices'>('overview');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400">Track platform performance and user behavior</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.name} className="bg-oxford-900 border border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'search', label: 'Search Analytics' },
            { id: 'zones', label: 'Zone Performance' },
            { id: 'pricing', label: 'Price Analytics' },
            { id: 'devices', label: 'Device Breakdown' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Traffic chart visualization would go here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Page Views</span>
                  <span className="text-white font-semibold">24,567</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Listing Views</span>
                  <span className="text-white font-semibold">8,234</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Contact Clicks</span>
                  <span className="text-white font-semibold">1,234</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Search Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Top Search Queries</h3>
              {topSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg border-[hsl(220,10%,20%)]">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">"{search.query}"</p>
                      <p className="text-sm text-gray-400">{search.count} searches</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {search.change}
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
            <CardTitle>Zone Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[hsl(220,10%,20%)]">
                    <th className="text-left py-3 px-4 text-gray-400">Zone</th>
                    <th className="text-left py-3 px-4 text-gray-400">Views</th>
                    <th className="text-left py-3 px-4 text-gray-400">Contacts</th>
                    <th className="text-left py-3 px-4 text-gray-400">Conversion Rate</th>
                    <th className="text-left py-3 px-4 text-gray-400">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {zonePerformance.map((zone, index) => (
                    <tr key={index} className="border-b border-[hsl(220,10%,20%)]">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-white font-medium">{zone.zone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{zone.views.toLocaleString()}</td>
                      <td className="py-3 px-4 text-white">{zone.contacts}</td>
                      <td className="py-3 px-4 text-white">{zone.conversion}%</td>
                      <td className="py-3 px-4">{getTrendIcon(zone.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pricing' && (
        <Card>
          <CardHeader>
            <CardTitle>Price Analytics by House Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceAnalytics.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg border-[hsl(220,10%,20%)]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{item.type}</h4>
                      <p className="text-sm text-gray-400">{item.listings} active listings</p>
                    </div>
                    <Badge variant="outline">{formatCurrency(item.avgPrice)} avg</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Minimum</p>
                      <p className="text-white font-medium">{formatCurrency(item.minPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Average</p>
                      <p className="text-white font-medium">{formatCurrency(item.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Maximum</p>
                      <p className="text-white font-medium">{formatCurrency(item.maxPrice)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-600 mr-3"></div>
                      <span className="text-white font-medium">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{device.percentage}%</div>
                      <div className="text-sm text-gray-400">{device.users.toLocaleString()} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Usage pattern chart would go here</p>
                  <p className="text-sm">Shows hourly traffic distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;