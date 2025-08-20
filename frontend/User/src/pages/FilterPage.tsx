import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { HouseCard } from '../components/HouseCard';
import { Button } from '../components/ui/Button';

const FilterPage: React.FC = () => {
  const { houses, fetchHouses } = useStore();
  useEffect(() => {
    if (!houses || houses.length === 0) {
      if (fetchHouses) fetchHouses();
    }
  }, [houses, fetchHouses]);

  const allLocations = Array.from(new Set(houses.map(h => h.location.estate))).filter(Boolean).sort();
  const allTypes = Array.from(new Set(houses.map(h => h.type))).filter(Boolean).sort();
  const priceSteps = Array.from({length: 20}, (_, i) => 1000 * (i + 1)).filter(p => p <= 20000);
  const [filters, setFilters] = useState({ price: '', location: '', type: '' });
  const [filteredHouses, setFilteredHouses] = useState(null as typeof houses | null);
  // No activeTab needed; all dropdowns always visible

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    let result = houses;
    if (filters.location) result = result.filter(h => h.location.estate === filters.location);
    if (filters.price) result = result.filter(h => h.price === Number(filters.price));
    if (filters.type) result = result.filter(h => h.type === filters.type);
    setFilteredHouses(result);
  };

  // Clear all filters
  const handleClear = () => {
    setFilters({ price: '', location: '', type: '' });
    setFilteredHouses(houses);
  };

  // Close button: go back in history
  const handleClose = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full bg-background dark:bg-background/90 px-0 py-8 flex flex-col items-center">
  <div className="w-full max-w-full bg-background/80 dark:bg-background/90 rounded-2xl shadow-2xl border border-primary/20 px-0 py-6 mt-4 mx-auto relative flex flex-col items-center" style={{marginLeft: '4vw', marginRight: '4vw', minHeight: 'unset'}}>
        {/* Close Button */}
        <button onClick={handleClose} aria-label="Close filter" className="absolute top-4 right-6 text-xl text-muted-foreground hover:text-primary transition-colors z-10 bg-transparent border-none">
          &times;
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center w-full">Filter Houses</h1>
  <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 mb-4 px-4">
          {/* Price Column */}
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-full max-w-[420px] mx-2 px-4 py-2 rounded-lg font-semibold text-base mb-2 text-center filter-tab
                ${filters.price ? 'filter-tab-hasselection' : 'filter-tab-selected'}`}
              style={{ minWidth: 280 }}
            >
              Price
            </div>
            <div className="w-full max-w-[420px] bg-background/90 dark:bg-background/80 rounded-xl shadow-lg border border-primary/20 p-6 dropdown-anim" style={{ minWidth: 280 }}>
              <label className="block text-sm font-medium mb-1">Select Price</label>
              <select name="price" value={filters.price} onChange={handleChange} className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary text-white">
                <option value="">Any</option>
                {priceSteps.map(price => (
                  <option key={price} value={price}>{`KSh ${price.toLocaleString()}`}</option>
                ))}
              </select>
            </div>
            {filters.price && (
              <div className="mt-3 flex justify-center">
                <div className="selected-value-box animate-fadeIn selected-value-anim" style={{ width: '100%', maxWidth: 420, minWidth: 280 }}>
                  <span className="font-semibold">Selected:</span> KSh {Number(filters.price).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          {/* Location Column */}
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-full max-w-[420px] mx-2 px-4 py-2 rounded-lg font-semibold text-base mb-2 text-center filter-tab
                ${filters.location ? 'filter-tab-hasselection' : 'filter-tab-selected'}`}
              style={{ minWidth: 280 }}
            >
              Location
            </div>
            <div className="w-full max-w-[420px] bg-background/90 dark:bg-background/80 rounded-xl shadow-lg border border-primary/20 p-6 dropdown-anim" style={{ minWidth: 280 }}>
              <label className="block text-sm font-medium mb-1">Select Location</label>
              <select name="location" value={filters.location} onChange={handleChange} className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary text-white">
                <option value="">Any</option>
                {allLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {filters.location && (
              <div className="mt-3 flex justify-center">
                <div className="selected-value-box animate-fadeIn selected-value-anim" style={{ width: '100%', maxWidth: 420, minWidth: 280 }}>
                  <span className="font-semibold">Selected:</span> {filters.location}
                </div>
              </div>
            )}
          </div>
          {/* Type Column */}
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-full max-w-[420px] mx-2 px-4 py-2 rounded-lg font-semibold text-base mb-2 text-center filter-tab
                ${filters.type ? 'filter-tab-hasselection' : 'filter-tab-selected'}`}
              style={{ minWidth: 280 }}
            >
              Type
            </div>
            <div className="w-full max-w-[420px] bg-background/90 dark:bg-background/80 rounded-xl shadow-lg border border-primary/20 p-6 dropdown-anim" style={{ minWidth: 280 }}>
              <label className="block text-sm font-medium mb-1">Select Type</label>
              <select name="type" value={filters.type} onChange={handleChange} className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary text-white">
                <option value="">Any</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {filters.type && (
              <div className="mt-3 flex justify-center">
                <div className="selected-value-box animate-fadeIn selected-value-anim" style={{ width: '100%', maxWidth: 420, minWidth: 280 }}>
                  <span className="font-semibold">Selected:</span> {filters.type}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end items-center gap-4 mt-2 w-full px-4">
          <Button onClick={handleClear} variant="outline" className="h-10 px-6">Clear</Button>
          <Button onClick={handleApply} className="h-10 px-8">Apply Filter</Button>
        </div>
      </div>
      {filteredHouses && (
        <div className="w-full mt-10 px-2 md:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHouses.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No houses found.</div>
          ) : (
            filteredHouses.map(house => (
              <HouseCard key={house.id} house={house} />
            ))
          )}
        </div>
      )}
      <style>{`
        /* Hide vertical scrollbar for this page */
        body, .min-h-screen {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        body::-webkit-scrollbar, .min-h-screen::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .tab-minw {
          min-width: 120px;
          max-width: 180px;
          width: 100%;
        }
        .filter-panel {
          width: 100vw;
          max-width: 100vw;
          border-radius: 1.25rem;
          margin-left: 0;
          margin-right: 0;
          min-height: unset;
        }
        .modern-dropdown {
          transition: border 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .modern-dropdown:focus {
          border-color: #6366f1;
          background: rgba(60,60,90,0.95);
          box-shadow: 0 0 16px 2px #6366f1, 0 0 0 2px #818cf8;
        }
        .filter-tab {
          background: transparent;
          color: #444;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          transition: background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s, transform 0.18s cubic-bezier(.22,1,.36,1);
          cursor: pointer;
        }
        .dark .filter-tab {
          color: var(--tw-text-muted-foreground);
        }
        .filter-tab:hover {
          background: transparent;
          color: #6366f1;
          transform: scale(1.04);
          box-shadow: 0 0 0 2px #818cf8, 0 0 8px 2px #6366f1;
        }
        .filter-tab-selected {
          background: rgba(99,102,241,0.08); /* lighter for white theme */
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.18);
        }
        .dark .filter-tab-selected {
          background: rgba(99,102,241,0.1);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .filter-tab-hasselection {
          background: transparent;
          color: #6366f1;
          border: 1.5px solid #6366f1;
          box-shadow: 0 0 0 3px #818cf8, 0 0 16px 2px #6366f1;
          transform: scale(1.06);
          animation: tabSelectedGlow 0.25s cubic-bezier(.22,1,.36,1);
        }
        @keyframes tabSelectedGlow {
          0% { box-shadow: 0 0 0 0 #818cf8, 0 0 0 0 #6366f1; transform: scale(1); }
          100% { box-shadow: 0 0 0 3px #818cf8, 0 0 16px 2px #6366f1; transform: scale(1.06); }
        }
        .selected-value-box {
          background: rgba(129,140,248,0.10);
          border: 1.5px solid #6366f1;
          border-radius: 1rem;
          color: #222;
          padding: 0.5rem 1.25rem;
          font-size: 1rem;
          box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
          display: inline-block;
          min-width: 120px;
          text-align: center;
        }
        .dark .selected-value-box {
          background: rgba(129,140,248,0.12);
          color: #6366f1;
          box-shadow: 0 2px 12px 0 rgba(99,102,241,0.10);
        }
        .modern-dropdown {
          color: #222;
          background: #fff;
        }
        .dark .modern-dropdown {
          color: #fff;
          background: rgba(30,30,40,0.95);
        }
        .dropdown-anim {
          animation: dropdownAnim 0.3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes dropdownAnim {
          0% { opacity: 0; transform: translateY(-16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .selected-value-anim {
          animation: selectedValueAnim 0.3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes selectedValueAnim {
          0% { opacity: 0; transform: translateY(-8px) scale(0.98); filter: blur(2px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </div>
  );
};

export default FilterPage;
