import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Map, BarChart3, Users, Heart, Bell, Settings, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useStore();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Houses', path: '/' },
    { icon: Map, label: 'Map View', path: '/map' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 ">
            <Link to="/" className="flex items-center gap-2" onClick={toggleSidebar}>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">CK</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Comrade Kejani
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-primary nav-active'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t p-4">
            <div className="space-y-2">
              {bottomItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-primary nav-active'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};