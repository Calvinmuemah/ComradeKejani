import { Dropdown } from '../ui/Dropdown';
// import { useStore } from '../../store/useStore';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Heart, Menu, Search, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
// import FilterPanel from '../FilterPanel';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { houses, searchFilters, setSearchFilters, searchHouses } = useStore();
  // Dropdown state
  const [selectedPrice, setSelectedPrice] = useState<[number, number]>(searchFilters.priceRange);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(searchFilters.estate);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(searchFilters.houseTypes);

  // Get unique locations and types from houses
  const allLocations = Array.from(new Set(houses.map(h => h.location.estate))).sort();
  const allTypes = Array.from(new Set(houses.map(h => h.type))).sort();

  // Price options (ranges)
  const priceOptions = [
    [1000, 5000],
    [5001, 10000],
    [10001, 15000],
    [15001, 20000],
    [20001, 50000],
  ];
  const priceLabels = priceOptions.map(([min, max]) => `KSh ${min.toLocaleString()} - ${max.toLocaleString()}`);

  // Handle filter changes
  const handleApplyFilters = () => {
    setSearchFilters({
      priceRange: selectedPrice,
      estate: selectedLocations,
  houseTypes: selectedTypes as any, // HouseType[]
    });
    searchHouses();
    setShowFilterModal(false);
  };
  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  // For viewing house details from filter panel (optional, can be extended)
  const location = useLocation();
  const { unreadCount, toggleSidebar, compareList } = useStore();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
  <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 mr-4">
              <img
                src="/ComradeKejani.png"
                alt="Comrade Kejani Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="hidden md:block font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Comrade Kejani
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Houses
              </Link>
              <Link
                to="/map"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/map')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Map View
              </Link>
              <Link
                to="/insights"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/insights')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Insights
              </Link>
              <Link
                to="/community"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/community')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Community
              </Link>
              <Link
                to="/safety"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/safety')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                Safety
              </Link>
              {/* Compare tab, only show if compareList has items */}
              {compareList && compareList.length > 0 && (
                <Link
                  to="/compare"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 animate-fadeIn ${
                    isActive('/compare')
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-primary bg-gradient-to-r from-blue-100 to-purple-100 border border-primary/10 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  Compare ({compareList.length})
                </Link>
              )}
            </nav>
          </div>

          {/* Search Bar & Filter Button */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search houses, estates, or features..."
                className="w-full rounded-lg bg-background border border-input pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Link
                to="/filter"
                className="flex items-center gap-1 px-3 py-2 ml-2 rounded-lg border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="hidden md:inline text-xs font-semibold">Filters</span>
              </Link>
            </div>
          </div>
  {/* Filter Panel removed: now handled by FilterPage route */}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/favorites">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </Button>
            </Link>




            {/* Theme Toggle Button */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};