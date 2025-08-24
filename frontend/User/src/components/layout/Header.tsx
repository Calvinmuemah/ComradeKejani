import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Heart, Menu, Search, Sun, Moon, SlidersHorizontal, Loader2, MapPin, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/useTheme';
import { AnimatedBorderTab } from '../ui/AnimatedBorderTab';

export const Header: React.FC = () => {
  const { unreadCount, toggleSidebar, compareList, toggleDarkMode, searchQuery, setSearchQuery, searchHouses, searchResults, loading, houses } = useStore();
  
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync global query when we accept result
  useEffect(() => { setLocalQuery(searchQuery); }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!localQuery.trim()) { setSearchQuery(''); return; }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setSearchQuery(localQuery.trim());
      await searchHouses();
      setOpen(true);
    }, 400);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  const handleSelectHouse = (id: string) => {
    setOpen(false);
    navigate(`/house/${id}`);
  };

  const filteredLocal = !localQuery ? [] : searchResults.length > 0 ? searchResults : houses.filter(h => h.title.toLowerCase().includes(localQuery.toLowerCase())).slice(0,8);

  // Function to handle theme toggle that syncs both theme providers
  const handleThemeToggle = () => {
    toggleTheme(); // Update ThemeContext
    toggleDarkMode(); // Update useStore
  };

  // Inject glow animation keyframes once
  useEffect(() => {
    const styleId = 'header-action-glow';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `@keyframes headerGlowPulse {0% {box-shadow:0 0 0 0 rgba(59,130,246,0.45);} 55% {box-shadow:0 0 0 10px rgba(59,130,246,0);} 100% {box-shadow:0 0 0 0 rgba(59,130,246,0);} }`;
      document.head.appendChild(style);
    }
  }, []);

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
              {/* Using AnimatedBorderTab for "Houses" tab */}
              <AnimatedBorderTab isSelected={isActive('/')} className="text-sm font-medium transition-all duration-200">
                <Link to="/" className="flex items-center space-x-2">Houses</Link>
              </AnimatedBorderTab>
              
              {/* Using AnimatedBorderTab for "Map View" tab */}
              <AnimatedBorderTab isSelected={isActive('/map')} className="text-sm font-medium transition-all duration-200">
                <Link to="/map" className="flex items-center space-x-2">Map View</Link>
              </AnimatedBorderTab>
              
              {/* Using AnimatedBorderTab for "Insights" tab */}
              <AnimatedBorderTab isSelected={isActive('/insights')} className="text-sm font-medium transition-all duration-200">
                <Link to="/insights" className="flex items-center space-x-2">Insights</Link>
              </AnimatedBorderTab>
              
              {/* Using AnimatedBorderTab for "Community" tab */}
              <AnimatedBorderTab isSelected={isActive('/community')} className="text-sm font-medium transition-all duration-200">
                <Link to="/community" className="flex items-center space-x-2">Community</Link>
              </AnimatedBorderTab>
              
              {/* Using AnimatedBorderTab for "Safety" tab */}
              <AnimatedBorderTab isSelected={isActive('/safety')} className="text-sm font-medium transition-all duration-200">
                <Link to="/safety" className="flex items-center space-x-2">Safety</Link>
              </AnimatedBorderTab>

              {/* Using AnimatedBorderTab for "About" tab */}
              <AnimatedBorderTab isSelected={isActive('/about')} className="text-sm font-medium transition-all duration-200">
                <Link to="/about" className="flex items-center space-x-2">About</Link>
              </AnimatedBorderTab>
              
              {/* Compare tab, only show if compareList has items */}
              {compareList && compareList.length > 0 && (
                <AnimatedBorderTab isSelected={isActive('/compare')} className="text-sm font-medium transition-all duration-200">
                  <Link to="/compare" className="flex items-center space-x-2">
                    Compare ({compareList.length})
                  </Link>
                </AnimatedBorderTab>
              )}
            </nav>
          </div>

          {/* Search Bar & Filter Button */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8" ref={containerRef}>
            <div className="relative w-full flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={localQuery}
                onChange={e => { setLocalQuery(e.target.value); if (!open) setOpen(true); }}
                onFocus={() => { if (localQuery.trim()) setOpen(true); }}
                placeholder="Search houses, estates, features..."
                className="w-full rounded-lg bg-background border border-input pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => { setLocalQuery(''); setOpen(false); }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/filter"
                className="flex items-center gap-1 px-3 py-2 ml-2 rounded-lg border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="hidden md:inline text-xs font-semibold">Filters</span>
              </Link>
              {/* Results dropdown */}
              {open && (
                <div className={`absolute left-0 top-11 w-full rounded-lg border bg-background shadow-lg z-50 overflow-hidden ${theme==='dark'?'border-primary/20':'border-border'}`}>
                  <div className="max-h-96 overflow-y-auto divide-y">
                    {loading && <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Searching...</div>}
                    {!loading && filteredLocal.length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">No results</div>
                    )}
                    {!loading && filteredLocal.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleSelectHouse(h.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 focus:bg-muted/60 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm line-clamp-1">{h.title || 'Untitled House'}</span>
                          <span className="text-xs font-semibold text-primary">KSh {h.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{h.location?.estate}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/30 text-[10px] text-muted-foreground">
                    <span>{filteredLocal.length} result{filteredLocal.length!==1?'s':''}</span>
                    {searchQuery && <span>Query: {searchQuery}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
  {/* Filter Panel removed: now handled by FilterPage route */}

          {/* Action Buttons with animated glow wrapper */}
          <div className="relative flex items-center">
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-transparent to-transparent backdrop-blur-sm animate-[headerGlowPulse_3.5s_ease-in-out_infinite] before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_60%)] after:absolute after:-inset-px after:rounded-xl after:pointer-events-none after:bg-[conic-gradient(from_0deg,rgba(59,130,246,0.4),transparent_25%,transparent_75%,rgba(59,130,246,0.4))] after:opacity-0 group-hover:after:opacity-40 after:transition-opacity after:duration-700 overflow-hidden">
            <Button variant="ghost" size="icon" className="md:hidden relative z-10" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="relative z-10">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative z-10">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </Button>
            </Link>

            {/* Theme Toggle Button */}
            <Button variant="ghost" size="icon" onClick={handleThemeToggle} aria-label="Toggle theme" className="relative z-10">
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};