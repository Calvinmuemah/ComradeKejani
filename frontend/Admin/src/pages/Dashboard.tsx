import React from 'react';
import { 
  Building, 
  Users, 
  Shield, 
  TrendingUp, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// Mock data for demonstration
const stats = [
  {
    name: 'Total Listings',
    value: '2,547',
    change: '+12%',
    changeType: 'increase',
    icon: Building
  },
  {
    name: 'Active Landlords',
    value: '847',
    change: '+8%',
    changeType: 'increase',
    icon: Users
  },
  {
    name: 'Contact Clicks Today',
    value: '156',
    change: '+23%',
    changeType: 'increase',
    icon: Phone
  },
  {
    name: 'Safety Alerts',
    value: '3',
    change: '-2',
    changeType: 'decrease',
    icon: AlertTriangle
  }
];

const recentListings = [
  {
    id: '1',
    title: '2 Bedroom Apartment near Gate B',
    price: 8000,
    status: 'published',
    zone: 'Amalemba',
    views: 45,
    contactClicks: 12,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Single Room with WiFi',
    price: 3500,
    status: 'in_review',
    zone: 'Kefinco',
    views: 23,
    contactClicks: 5,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    title: 'Bedsitter near Bus Stage',
    price: 5000,
    status: 'published',
    zone: 'Lurambi',
    views: 67,
    contactClicks: 18,
    createdAt: '2024-01-15T08:45:00Z'
  }
];

const trendingZones = [
  { name: 'Amalemba', searches: 234, change: '+15%' },
  { name: 'Kefinco', searches: 189, change: '+8%' },
  { name: 'Lurambi', searches: 156, change: '+12%' },
  { name: 'Shirugu', searches: 134, change: '+5%' },
  { name: 'Friends', searches: 98, change: '+3%' }
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-100 text-sm sm:text-base">Overview of your platform's performance</p>
      </div>

      {/* Stats Overview - Modern Card UI */}
      {/* Quick Stats Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 w-full mb-8">
        {/* Total Verified Houses */}
  <a href="/admin/listings" className="group bg-oxford-900 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between min-h-[110px] min-w-[170px] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.7)] cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600/30 text-blue-100 shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m4-6v6m5 6H6a2 2 0 01-2-2V7a2 2 0 012-2h2m12 2v11a2 2 0 01-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-base font-semibold text-blue-100">Total Verified Houses</span>
          </div>
          <span className="text-3xl font-bold text-white mb-1">135</span>
          <span className="text-xs text-blue-200">Active Listings</span>
        </a>

        {/* Pending Approvals */}
  <a href="/admin/listings?status=pending" className="group bg-oxford-900 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between min-h-[110px] min-w-[170px] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.7)] cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600/30 text-blue-100 shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-base font-semibold text-blue-100">Pending Approvals</span>
          </div>
          <span className="text-3xl font-bold text-white mb-1">8</span>
          <span className="text-xs text-blue-200">Awaiting Review</span>
        </a>

        {/* Active Landlords */}
  <a href="/admin/landlords" className="group bg-oxford-900 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between min-h-[110px] min-w-[170px] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.7)] cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600/30 text-blue-100 shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-base font-semibold text-blue-100">Active Landlords</span>
          </div>
          <span className="text-3xl font-bold text-white mb-1">23</span>
          <span className="text-xs text-blue-200">Connected</span>
        </a>

        {/* Trending Zones */}
  <a href="/admin/zones" className="group bg-oxford-900 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between min-h-[110px] min-w-[170px] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.7)] cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600/30 text-blue-100 shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0h7m-7 0H5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-base font-semibold text-blue-100">Trending Zones</span>
          </div>
          <span className="text-lg font-bold text-white mb-1">1. Greenfield<br/>2. Riverside<br/>3. Hilltop</span>
          <span className="text-xs text-blue-200">Top 3 Estates</span>
        </a>

        {/* Safety Alerts Active */}
  <a href="/admin/safety" className="group bg-oxford-900 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between min-h-[110px] min-w-[170px] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.7)] cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600/30 text-blue-100 shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1118.364 5.636z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-base font-semibold text-blue-100">Safety Alerts Active</span>
          </div>
          <span className="text-3xl font-bold text-white mb-1">3</span>
          <span className="text-xs text-blue-200">Ongoing Alerts</span>
        </a>
      </div>

      {/* New Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Listings Statistics Card */}
        <div className="bg-oxford-900 border border-gray-800 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-white">Listings Statistics</span>
            <select className="bg-oxford-800 text-white text-sm rounded px-2 py-1 border border-gray-700">
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          {/* Simple SVG Line Chart */}
          <svg viewBox="0 0 220 80" fill="none" className="w-full h-24">
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              points="0,60 30,50 60,40 90,55 120,30 150,35 180,20 210,40"
            />
            <circle cx="120" cy="30" r="5" fill="#60a5fa" />
            <rect x="105" y="10" width="35" height="20" rx="6" fill="#1e293b" />
            <text x="122" y="25" textAnchor="middle" fill="#fff" fontSize="12">42</text>
          </svg>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </div>

        {/* Platform Summary Card */}
        <div className="bg-oxford-900 border border-gray-800 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-white">Platform Summary</span>
            <div className="flex items-center gap-2">
              <input type="date" className="bg-oxford-800 text-white text-sm rounded px-2 py-1 border border-gray-700" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Simple SVG Donut Chart */}
            <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-20 lg:h-20">
              <circle cx="40" cy="40" r="32" stroke="#334155" strokeWidth="12" fill="none" />
              <circle cx="40" cy="40" r="32" stroke="#60a5fa" strokeWidth="12" fill="none" strokeDasharray="201" strokeDashoffset="84" />
              <circle cx="40" cy="40" r="32" stroke="#f59e42" strokeWidth="12" fill="none" strokeDasharray="201" strokeDashoffset="134" />
              <circle cx="40" cy="40" r="32" stroke="#64748b" strokeWidth="12" fill="none" strokeDasharray="201" strokeDashoffset="180" />
              <text x="40" y="48" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold">88%</text>
            </svg>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">KES 1,245,000</div>
              <div className="text-xs text-gray-400">Total Revenue</div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="text-white">Revenue</span>
                  <span className="ml-auto text-gray-400">58%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-white">Expense</span>
                  <span className="ml-auto text-gray-400">24%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="text-white">Other</span>
                  <span className="ml-auto text-gray-400">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Listings */}
        <Card className="bg-oxford-900 border border-gray-800 shadow-none">
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>Latest property submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-oxford-900 rounded-lg border border-gray-800">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{listing.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.zone}
                      </span>
                      <span>KES {listing.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge 
                        variant={listing.status === 'published' ? 'success' : 'warning'}
                      >
                        {listing.status.replace('_', ' ')}
                      </Badge>
                      <span className="flex items-center text-xs text-gray-400">
                        <Eye className="h-3 w-3 mr-1" />
                        {listing.views}
                      </span>
                      <span className="flex items-center text-xs text-gray-400">
                        <Phone className="h-3 w-3 mr-1" />
                        {listing.contactClicks}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Zones */}
  <Card className="bg-oxford-900 border border-gray-800 shadow-none">
          <CardHeader>
            <CardTitle>Trending Zones</CardTitle>
            <CardDescription>Most searched areas this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingZones.map((zone, index) => (
                <div key={zone.name} className="flex items-center justify-between bg-oxford-900 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{zone.name}</p>
                      <p className="text-sm text-gray-400">{zone.searches} searches</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {zone.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
  <Card className="bg-oxford-900 border border-gray-800 shadow-none">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-oxford-900 rounded-lg border border-gray-800 cursor-pointer transition-colors">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="font-medium text-white">Add New Listing</p>
                <p className="text-sm text-gray-400">Create a new property listing</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-oxford-900 rounded-lg border border-gray-800 cursor-pointer transition-colors">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="font-medium text-white">Safety Alert</p>
                <p className="text-sm text-gray-400">Post security update</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-oxford-900 rounded-lg border border-gray-800 cursor-pointer transition-colors">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="font-medium text-white">Review Queue</p>
                <p className="text-sm text-gray-400">5 items pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;