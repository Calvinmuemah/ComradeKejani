import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  MessageSquare,
  MapPin,
  Image,
  UserCheck,
} from 'lucide-react';
import './sidebar-styles.css';

// Utility function for conditional class names
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

interface NavigationItem {
  name: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  permission: string | null;
}

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
    const renderNavLink = (item: NavigationItem) => {
    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ml-8",
            isActive
              ? "bg-gradient-to-r from-blue-600/10 to-blue-500/20 text-blue-500 dark:from-blue-900/70 dark:to-blue-800/50 dark:text-blue-300"
              : "text-gray-500 hover:bg-blue-500/10 dark:text-gray-400 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-300"
          )
        }
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`flex flex-col h-[calc(100vh-4rem)] z-30 bg-oxford-950/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out
                  ${isOpen ? 'left-0 w-56 border-r border-gray-800/50' : '-left-full w-0'}
                  ${!isMobile && 'md:left-0 md:w-56'}`}
        style={{ 
          position: 'fixed',
          top: '4rem', /* 16px = 4rem (height of header) */
          paddingTop: '0',
          bottom: 0,
          left: isMobile ? (isOpen ? '0' : '-100%') : '0', // Always visible on desktop
          overflowY: 'hidden'
        }}
      >
        {/* Only mobile toggle button - no duplicate logo needed since it's in the header */}
        <div className="flex-shrink-0 flex items-center justify-end px-4 h-12">
          {isMobile && isOpen && (
            <button 
              className="p-1.5 rounded-lg bg-oxford-800 hover:bg-oxford-700 text-gray-400 hover:text-white transition-colors"
              onClick={toggleSidebar}
            >
              <div className="h-5 w-5 flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-0.5 bg-current transform rotate-45 translate-y-0.5"></div>
                <div className="w-4 h-0.5 bg-current transform -rotate-45 -translate-y-0.5"></div>
              </div>
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-col flex-1 overflow-y-auto touch-pan-y hide-scrollbar" style={{ 
          maxHeight: 'calc(100vh - 8rem)', /* Reduced to make room for profile card */
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '100px' /* Added more space for profile card and copyright */
        }}>
          <nav className="px-2 space-y-4 relative scroll-smooth hide-scrollbar" aria-label="Sidebar">
              {/* Vertical timeline line */}
            <div className="absolute left-3 top-0 bottom-8 w-px bg-gradient-to-b from-blue-700/70 via-blue-700/30 to-transparent pointer-events-none"></div>            {/* Main */}
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_0_2px_rgba(37,99,235,0.25)]">
                <Home className="h-3 w-3 text-white" />
              </div>
              {/* Connecting line from section title to nav items */}
              <div className="absolute left-3 top-16 bottom-0 w-px bg-blue-700/20"></div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 pl-10 pt-5">MAIN</div>
              <div className="relative">
                {navigation.filter(item => ["Dashboard"].includes(item.name)).map((item) => (
                  <div key={item.name} className="relative">
                    {/* Horizontal connecting line */}
                    <div className="absolute left-3 top-3 w-5 h-px bg-blue-700/20"></div>
                    {renderNavLink(item)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Management */}
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]">
                <Building className="h-3 w-3 text-white" />
              </div>
              {/* Connecting line from section title to nav items */}
              <div className="absolute left-3 top-16 bottom-0 w-px bg-emerald-700/20"></div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 pl-10 pt-5">MANAGEMENT</div>
              <div className="relative">
                {navigation.filter(item => ["Listings", "Landlords", "Users", "Reviews", "Media Library", "Zones", "Safety & Alerts", "Analytics"].includes(item.name)).map((item) => (
                  <div key={item.name} className="relative">
                    {/* Horizontal connecting line */}
                    <div className="absolute left-3 top-3 w-5 h-px bg-emerald-700/20"></div>
                    {renderNavLink(item)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Settings */}
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-600 border border-amber-400/30 shadow-[0_0_0_2px_rgba(245,158,11,0.25)]">
                <Settings className="h-3 w-3 text-white" />
              </div>
              {/* Connecting line from section title to nav items */}
              <div className="absolute left-3 top-16 bottom-0 w-px bg-amber-700/20"></div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 pl-10 pt-5">SETTINGS</div>
              <div className="relative">
                {navigation.filter(item => ["Settings"].includes(item.name)).map((item) => (
                  <div key={item.name} className="relative">
                    {/* Horizontal connecting line */}
                    <div className="absolute left-3 top-3 w-5 h-px bg-amber-700/20"></div>
                    {renderNavLink(item)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Copyright Section */}
            <div className="space-y-2 relative mt-8 mb-12">
              <div className="absolute left-3 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 border border-purple-400/30 shadow-[0_0_0_2px_rgba(147,51,234,0.25)]">
                <div className="text-white text-xs font-bold">©</div>
              </div>
              {/* Connecting line from section title to names */}
              <div className="absolute left-3 top-16 bottom-0 w-px bg-purple-700/20"></div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 pl-10 pt-5">COPYRIGHT</div>

              <div className="relative">
                {/* Developers with connecting line */}
                <div className="relative mb-1">
                  <div className="absolute left-3 top-3 w-5 h-px bg-purple-700/20"></div>
                  <div className="flex flex-col gap-1 rounded-md px-3 py-2 text-xs ml-8 text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-medium">Developed by:</span>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span>Nyamweya John</span>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <span>Kelvin Muemah</span>
                    </div>
                  </div>
                </div>
                
                {/* Year */}
                <div className="text-xs text-gray-500 pl-10 mt-1">
                  © {new Date().getFullYear()} All Rights Reserved.
                </div>
              </div>
            </div>
          </nav>
          
          {/* User profile at the bottom - fixed position */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 bg-gradient-to-t from-oxford-950 to-transparent">
            <div className="border border-blue-900/20 bg-oxford-950/90 rounded-lg shadow-inner flex items-center p-3 gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold">
                C
              </div>
              <div className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-sm font-medium text-white truncate">Admin</div>
                <div className="text-xs text-blue-300/80 mt-0.5 capitalize">super admin</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Bottom padding for mobile scrolling safety */}
      {isOpen && isMobile && <div className="h-16 invisible" />}
    </>
  );
};

export default Sidebar;