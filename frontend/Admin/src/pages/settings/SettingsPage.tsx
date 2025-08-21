import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Globe, 
  MapPin, 
  DollarSign, 
  Shield, 
  Bell, 
  Database,
  Mail,
  Smartphone,
  Key,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

// Mock system settings
const mockSettings = {
  general: {
    siteName: 'Comrade Kejani',
    siteDescription: 'Student Housing Platform for MMUST',
    adminEmail: 'admin@kejani.com',
    timezone: 'Africa/Nairobi',
    language: 'en',
    maintenanceMode: false
  },
  campus: {
    name: 'Masinde Muliro University of Science and Technology',
    latitude: -0.3556,
    longitude: 34.7833,
    walkingSpeed: 5, // km/h
    bodaSpeed: 25, // km/h
    matatuSpeed: 40, // km/h
    maxDistance: 10 // km
  },
  pricing: {
    defaultCurrency: 'KES',
    minPrice: 1000,
    maxPrice: 50000,
    priceBands: [
      { label: 'Budget', min: 1000, max: 4000 },
      { label: 'Mid-range', min: 4001, max: 8000 },
      { label: 'Premium', min: 8001, max: 15000 },
      { label: 'Luxury', min: 15001, max: 50000 }
    ]
  },
  verification: {
    requirePhotos: true,
    minPhotos: 3,
    maxPhotos: 10,
    requireLandlordId: true,
    autoApprove: false,
    verificationExpiry: 365 // days
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    adminAlerts: true,
    systemMaintenance: true
  },
  api: {
    rateLimit: 100, // requests per minute
    enableCors: true,
    requireApiKey: true,
    logRequests: true
  }
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'campus' | 'pricing' | 'verification' | 'notifications' | 'api'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Implementation would save to backend
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400">Configure platform settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Status Card */}
      {hasChanges && (
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <p className="text-white font-medium">You have unsaved changes</p>
              </div>
              <Badge variant="warning">Pending Changes</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'campus', label: 'Campus & Location', icon: MapPin },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'verification', label: 'Verification', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'api', label: 'API & Integration', icon: Zap }
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
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <Input
                  value={settings.general.siteName}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <Input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                rows={3}
                value={settings.general.siteDescription}
                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.general.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                  className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Maintenance Mode</h4>
                <p className="text-sm text-gray-400">Temporarily disable public access</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                  className="mr-2"
                />
                <span className={`text-sm ${settings.general.maintenanceMode ? 'text-red-400' : 'text-gray-400'}`}>
                  {settings.general.maintenanceMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'campus' && (
        <Card>
          <CardHeader>
            <CardTitle>Campus & Location Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campus Name
              </label>
              <Input
                value={settings.campus.name}
                onChange={(e) => updateSetting('campus', 'name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campus Latitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.campus.latitude}
                  onChange={(e) => updateSetting('campus', 'latitude', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campus Longitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.campus.longitude}
                  onChange={(e) => updateSetting('campus', 'longitude', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Distance (km)
                </label>
                <Input
                  type="number"
                  value={settings.campus.maxDistance}
                  onChange={(e) => updateSetting('campus', 'maxDistance', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Transport Speeds (km/h)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Walking Speed
                  </label>
                  <Input
                    type="number"
                    value={settings.campus.walkingSpeed}
                    onChange={(e) => updateSetting('campus', 'walkingSpeed', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boda Speed
                  </label>
                  <Input
                    type="number"
                    value={settings.campus.bodaSpeed}
                    onChange={(e) => updateSetting('campus', 'bodaSpeed', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Matatu Speed
                  </label>
                  <Input
                    type="number"
                    value={settings.campus.matatuSpeed}
                    onChange={(e) => updateSetting('campus', 'matatuSpeed', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pricing' && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.pricing.defaultCurrency}
                  onChange={(e) => updateSetting('pricing', 'defaultCurrency', e.target.value)}
                  className="w-full rounded-md text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]"
                >
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Price
                </label>
                <Input
                  type="number"
                  value={settings.pricing.minPrice}
                  onChange={(e) => updateSetting('pricing', 'minPrice', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Price
                </label>
                <Input
                  type="number"
                  value={settings.pricing.maxPrice}
                  onChange={(e) => updateSetting('pricing', 'maxPrice', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Price Bands</h4>
              <div className="space-y-4">
                {settings.pricing.priceBands.map((band, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center">
                    <Input
                      value={band.label}
                      onChange={(e) => {
                        const newBands = [...settings.pricing.priceBands];
                        newBands[index].label = e.target.value;
                        updateSetting('pricing', 'priceBands', newBands);
                      }}
                    />
                    <Input
                      type="number"
                      value={band.min}
                      onChange={(e) => {
                        const newBands = [...settings.pricing.priceBands];
                        newBands[index].min = parseInt(e.target.value);
                        updateSetting('pricing', 'priceBands', newBands);
                      }}
                    />
                    <Input
                      type="number"
                      value={band.max}
                      onChange={(e) => {
                        const newBands = [...settings.pricing.priceBands];
                        newBands[index].max = parseInt(e.target.value);
                        updateSetting('pricing', 'priceBands', newBands);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'verification' && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Photos Required
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.verification.minPhotos}
                  onChange={(e) => updateSetting('verification', 'minPhotos', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Photos Allowed
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.verification.maxPhotos}
                  onChange={(e) => updateSetting('verification', 'maxPhotos', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Expiry (days)
              </label>
              <Input
                type="number"
                value={settings.verification.verificationExpiry}
                onChange={(e) => updateSetting('verification', 'verificationExpiry', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Require Photos</h4>
                  <p className="text-sm text-gray-400">All listings must have photos</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.verification.requirePhotos}
                    onChange={(e) => updateSetting('verification', 'requirePhotos', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.verification.requirePhotos ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.verification.requirePhotos ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Require Landlord ID</h4>
                  <p className="text-sm text-gray-400">Landlords must provide identification</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.verification.requireLandlordId}
                    onChange={(e) => updateSetting('verification', 'requireLandlordId', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.verification.requireLandlordId ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.verification.requireLandlordId ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Auto-Approve Listings</h4>
                  <p className="text-sm text-gray-400">Automatically approve new listings</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.verification.autoApprove}
                    onChange={(e) => updateSetting('verification', 'autoApprove', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.verification.autoApprove ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.verification.autoApprove ? 'Enabled' : 'Manual Review'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Send notifications via email</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailEnabled}
                    onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.notifications.emailEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.notifications.emailEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-white">SMS Notifications</h4>
                    <p className="text-sm text-gray-400">Send notifications via SMS</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsEnabled}
                    onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.notifications.smsEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.notifications.smsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushEnabled}
                    onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.notifications.pushEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.notifications.pushEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-white">Admin Alerts</h4>
                    <p className="text-sm text-gray-400">Critical system alerts for admins</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.adminAlerts}
                    onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.notifications.adminAlerts ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.notifications.adminAlerts ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle>API & Integration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate Limit (requests/minute)
                </label>
                <Input
                  type="number"
                  value={settings.api.rateLimit}
                  onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Enable CORS</h4>
                  <p className="text-sm text-gray-400">Allow cross-origin requests</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.enableCors}
                    onChange={(e) => updateSetting('api', 'enableCors', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.api.enableCors ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.api.enableCors ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Require API Key</h4>
                  <p className="text-sm text-gray-400">Require authentication for API access</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.requireApiKey}
                    onChange={(e) => updateSetting('api', 'requireApiKey', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.api.requireApiKey ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.api.requireApiKey ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Log API Requests</h4>
                  <p className="text-sm text-gray-400">Keep logs of all API requests</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.api.logRequests}
                    onChange={(e) => updateSetting('api', 'logRequests', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.api.logRequests ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.api.logRequests ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-md">
              <div className="flex items-center">
                <Key className="h-4 w-4 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-blue-400">
                    <strong>API Endpoint:</strong> https://api.kejani.com/v1
                  </p>
                  <p className="text-sm text-blue-400">
                    <strong>Documentation:</strong> https://docs.kejani.com/api
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;