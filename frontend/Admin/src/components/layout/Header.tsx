import React from 'react';
import { Bell, Search, ChevronDown, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="shadow-sm bg-oxford-900 w-full animate-fade-in z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-oxford-800 focus:outline-none"
            onClick={toggleSidebar}
          >
            <span className="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
            {isSidebarOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Logo and name */}
          <div className="flex items-center gap-3">
            <img
              src="/johnny.png"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-xl border-2 border-blue-900 shadow"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">Comrade Kejani</h1>
              <p className="text-xs text-blue-200 hidden sm:block">Admin System</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 items-center justify-center mx-4">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full rounded-md py-2 pl-10 pr-3 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-oxford-900 border-oxford-800"
                  placeholder="Search listings, landlords, zones..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center md:ml-6 space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Profile dropdown */}
            <div className="relative">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                  {user?.name.charAt(0)}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{user?.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400 hidden sm:block" />
              </div>
            </div>

            {/* Quick actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;