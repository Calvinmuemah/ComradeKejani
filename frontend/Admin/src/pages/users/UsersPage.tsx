import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  Clock, 
  CheckCircle,
  XCircle,
  Key,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { UserRole, Permission } from '../../types';
import { formatDate } from '../../lib/utils';

// Mock admin users data (in a real system, there would be multiple admins)
const mockAdminUsers = [
  {
    id: '1',
    email: 'admin@kejani.com',
    name: 'Comrade Kejani Admin',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: Object.values(Permission),
    loginAttempts: 0,
    twoFactorEnabled: true,
    lastPasswordChange: '2024-01-01T00:00:00Z'
  }
];

// Mock system logs for admin activities
const mockSystemLogs = [
  {
    id: '1',
    userId: '1',
    userName: 'Comrade Kejani Admin',
    action: 'LOGIN',
    resource: 'System',
    details: 'Successful login from IP 192.168.1.100',
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    userId: '1',
    userName: 'Comrade Kejani Admin',
    action: 'CREATE',
    resource: 'Listing',
    details: 'Created new listing: 2 Bedroom Apartment near MMUST Gate B',
    timestamp: '2024-01-15T09:15:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Comrade Kejani Admin',
    action: 'UPDATE',
    resource: 'Safety Alert',
    details: 'Updated security alert for Lurambi zone',
    timestamp: '2024-01-15T08:45:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '4',
    userId: '1',
    userName: 'Comrade Kejani Admin',
    action: 'DELETE',
    resource: 'Landlord',
    details: 'Removed fraudulent landlord account',
    timestamp: '2024-01-14T16:22:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];

const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admins' | 'logs' | 'security'>('admins');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    return (
      <Badge variant="default">
        <Shield className="h-3 w-3 mr-1" />
        SUPER ADMIN
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const variants = {
      'LOGIN': 'success',
      'LOGOUT': 'secondary',
      'CREATE': 'default',
      'UPDATE': 'warning',
      'DELETE': 'destructive'
    } as const;
    return <Badge variant={variants[action as keyof typeof variants] || 'secondary'}>{action}</Badge>;
  };

  const filteredLogs = mockSystemLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage admin accounts and system security</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowSecurityModal(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
          <Button onClick={() => setShowUserModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-white">{mockAdminUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">
                  {mockAdminUsers.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">2FA Enabled</p>
                <p className="text-2xl font-bold text-white">
                  {mockAdminUsers.filter(u => u.twoFactorEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-oxford-900 border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Recent Logins</p>
                <p className="text-2xl font-bold text-white">
                  {mockSystemLogs.filter(l => l.action === 'LOGIN').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(220,10%,20%)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'admins', label: 'Admin Users', icon: UserCheck },
            { id: 'logs', label: 'Activity Logs', icon: Clock },
            { id: 'security', label: 'Security', icon: Shield }
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
      {activeTab === 'admins' && (
        <Card>
          <CardHeader>
            <CardTitle>Administrator Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAdminUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.isActive)}
                        {user.twoFactorEnabled && <Badge variant="outline">2FA</Badge>}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="font-medium text-white flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Last Login</p>
                          <p className="font-medium text-white">{formatDate(user.lastLogin!)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Created</p>
                          <p className="font-medium text-white">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Permissions</p>
                          <p className="font-medium text-white">All ({user.permissions.length})</p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-md">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-blue-400 mr-2" />
                          <p className="text-sm text-blue-400">
                            <strong>Super Admin:</strong> This user has complete access to all system functions and data.
                          </p>
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
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle>System Activity Logs</CardTitle>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-[hsl(220,10%,20%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getActionBadge(log.action)}
                        <span className="text-sm text-gray-400">{formatDate(log.timestamp)}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">User</p>
                          <p className="font-medium text-white">{log.userName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Resource</p>
                          <p className="font-medium text-white">{log.resource}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">IP Address</p>
                          <p className="font-medium text-white">{log.ipAddress}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-400">Details</p>
                        <p className="text-white">{log.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Require 2FA for all admin accounts</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-green-400">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Session Timeout</h4>
                  <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">IP Whitelisting</h4>
                  <p className="text-sm text-gray-400">Restrict access to specific IPs</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-400">Disabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Login Attempt Limit</h4>
                  <p className="text-sm text-gray-400">Max failed attempts before lockout</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Minimum Length</h4>
                  <p className="text-sm text-gray-400">Required password length</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="8">8 characters</option>
                  <option value="12">12 characters</option>
                  <option value="16">16 characters</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Require Special Characters</h4>
                  <p className="text-sm text-gray-400">Include symbols and numbers</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-green-400">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Password Expiry</h4>
                  <p className="text-sm text-gray-400">Force password changes</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="never">Never</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Password History</h4>
                  <p className="text-sm text-gray-400">Prevent password reuse</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="0">No restriction</option>
                  <option value="5">Last 5 passwords</option>
                  <option value="10">Last 10 passwords</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Add New Admin User"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-md">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-400">
                <strong>Note:</strong> This system uses a single Super Admin model. All admin users will have full system access.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <Input placeholder="e.g., John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input type="email" placeholder="john@kejani.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input type="password" placeholder="Enter secure password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <Input type="password" placeholder="Confirm password" />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-300">Require password change on first login</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-300">Enable two-factor authentication</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Cancel
            </Button>
            <Button>
              Create Admin User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Security Settings Modal */}
      <Modal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        title="Advanced Security Settings"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">API Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Rate Limiting</h4>
                  <p className="text-sm text-gray-400">Limit API requests per minute</p>
                </div>
                <Input className="w-24" type="number" defaultValue="100" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">API Key Rotation</h4>
                  <p className="text-sm text-gray-400">Automatically rotate API keys</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="never">Never</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Audit Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Log Retention</h4>
                  <p className="text-sm text-gray-400">How long to keep audit logs</p>
                </div>
                <select className="rounded-md text-sm text-white bg-[hsl(220,10%,7%)] border-[hsl(220,10%,20%)]">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Detailed Logging</h4>
                  <p className="text-sm text-gray-400">Log all user actions and data changes</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-green-400">Enabled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowSecurityModal(false)}>
              Cancel
            </Button>
            <Button>
              Save Security Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;