import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  FileText, 
  MessageSquare,
  MapPin,
  Image,
  UserCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    permission: null // Super Admin has access to everything
  },
  {
    name: 'Listings',
    href: '/listings',
    icon: Building,
    permission: null
  },
  {
    name: 'Landlords',
    href: '/landlords',
    icon: Users,
    permission: null
  },
  {
    name: 'Safety & Alerts',
    href: '/safety',
    icon: Shield,
    permission: null
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: null
  },
  {
    name: 'Reviews',
    href: '/reviews',
    icon: MessageSquare,
    permission: null
  },
  {
    name: 'Media Library',
    href: '/media',
    icon: Image,
    permission: null
  },
  {
    name: 'Zones',
    href: '/zones',
    icon: MapPin,
    permission: null
  },
  {
    name: 'User Management',
    href: '/users',
    icon: UserCheck,
    permission: null
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: null
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, isMobile = false }) => {
  // Helper function to render nav links
  const renderNavLink = (item: typeof navigation[0]) => (
    <NavLink
      key={item.name}
      to={item.href}
      onClick={() => {
        // Close sidebar on mobile when clicking a link
        if (isMobile || window.innerWidth < 768) {
          toggleSidebar();
        }
      }}
      className={({ isActive }) =>
        `group flex items-center px-2 py-2 text-sm font-medium rounded-l-2xl rounded-r-xl transition-all duration-300 relative overflow-visible ${
          isActive
            ? 'bg-oxford-900/90 text-white border-l-4 border-l-blue-400/80 ring-2 ring-blue-400/30 ring-inset shadow-[0_0_8px_2px_#60a5fa66]'
            : 'text-blue-100 hover:bg-[hsla(220,80%,20%,0.5)] hover:text-white hover:shadow-md'
        }`
      }
      style={({ isActive }) => !isActive ? { backdropFilter: 'blur(8px)' } : {}}
    >
      <span className="relative z-10 flex items-center w-full">
        <item.icon
          className="mr-3 h-5 w-5 flex-shrink-0"
          aria-hidden="true"
        />
        {item.name}
      </span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-20 bg-black/70 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed md:static flex flex-col h-screen z-30 bg-oxford-900/90 backdrop-blur-lg shadow-xl transition-all duration-300 ease-in-out rounded-r-2xl
                  ${isOpen ? 'left-0 w-64 animate-sidebar-toggle' : '-left-full md:-left-64 w-0'}`}
        style={{ boxShadow: isOpen ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none' }}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close sidebar</span>
        </button>

        <div className="mt-5 flex flex-col flex-1 overflow-y-auto">
          <nav className="px-2 space-y-8" aria-label="Sidebar">
            {/* Main */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Main</div>
              {navigation.filter(item => ["Dashboard"].includes(item.name)).map(renderNavLink)}
            </div>
            
            {/* Management */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Management</div>
              {navigation.filter(item => ["Listings", "Landlords", "Users", "Reviews", "Media Library", "Zones", "Safety & Alerts", "Analytics"].includes(item.name)).map(renderNavLink)}
            </div>
            
            {/* Settings */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Settings</div>
              {navigation.filter(item => ["Settings"].includes(item.name)).map(renderNavLink)}
            </div>
          </nav>
          
          {/* User profile at the bottom with frame card and header content */}
          <div className="flex-1" />
          <div className="px-4 pb-8">
            <div className="border border-blue-900/40 bg-oxford-900/80 rounded-2xl shadow-lg flex flex-col items-center py-5 px-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-xl font-bold mb-2">
                C
              </div>
              <div className="text-base font-semibold text-white">Comrade Kejani Admin</div>
              <div className="text-xs text-blue-200 mt-1 capitalize">super admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;