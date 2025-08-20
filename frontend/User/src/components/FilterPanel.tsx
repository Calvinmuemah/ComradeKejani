import React, { useState } from 'react';
import { House } from '../types';
import { HouseCard } from './HouseCard';
import { Button } from './ui/Button';

interface FilterPanelProps {
  houses: House[];
  onSelectHouse: (house: House) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ houses, onSelectHouse, onClose }) => {
  // Get unique locations and price ranges
  // Get unique locations and house types from data
  const allLocations = Array.from(new Set(houses.map(h => h.location.estate))).filter(Boolean).sort();
  const allTypes = Array.from(new Set(houses.map(h => h.type))).filter(Boolean).sort();
  // Price steps (1000-20000)
  const priceSteps = Array.from({length: 20}, (_, i) => 1000 * (i + 1)).filter(p => p <= 20000);
  const [filters, setFilters] = useState({
    price: '',
    location: '',
    type: '',
  });
  const [filteredHouses, setFilteredHouses] = useState<House[] | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    let result = houses;
    if (filters.location) {
      result = result.filter(h => h.location.estate === filters.location);
    }
    if (filters.price) {
      result = result.filter(h => h.price === Number(filters.price));
    }
    if (filters.type) {
      result = result.filter(h => h.type === filters.type);
    }
    setFilteredHouses(result);
  };

  return (
    <div
      className="mx-auto mt-8 w-full max-w-2xl px-6 py-6 rounded-2xl border border-primary/20 shadow-2xl animate-slideDown bg-background dark:bg-background/90 backdrop-blur-md"
      style={{
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25)',
      }}
    >
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        <div className="flex-1 animate-fadeIn">
          <label className="block text-sm font-medium mb-1 text-white">Price</label>
          <select
            name="price"
            value={filters.price}
            onChange={handleChange}
            className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary animate-glow text-white"
            style={{ boxShadow: '0 0 8px 1px #6366f1', background: 'rgba(40,40,60,0.85)' }}
          >
            <option value="">Any</option>
            {priceSteps.map(price => (
              <option key={price} value={price}>{`KSh ${price.toLocaleString()}`}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 animate-fadeIn">
          <label className="block text-sm font-medium mb-1 text-white">Location</label>
          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary animate-glow text-white"
            style={{ boxShadow: '0 0 8px 1px #6366f1', background: 'rgba(40,40,60,0.85)' }}
          >
            <option value="">Any</option>
            {allLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 animate-fadeIn">
          <label className="block text-sm font-medium mb-1 text-white">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="modern-dropdown w-full rounded-lg border border-primary bg-background/80 py-2 px-3 text-sm shadow focus:ring-2 focus:ring-primary focus:border-primary animate-glow text-white"
            style={{ boxShadow: '0 0 8px 1px #6366f1', background: 'rgba(40,40,60,0.85)' }}
          >
            <option value="">Any</option>
            {allTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <Button onClick={handleApply} className="h-10 px-8 animate-glow">Apply Filter</Button>
      </div>
      {filteredHouses && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {filteredHouses.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No houses found.</div>
          ) : (
            filteredHouses.map(house => (
              <HouseCard key={house.id} house={house} onClick={() => onSelectHouse(house)} />
            ))
          )}
        </div>
      )}
      <style>{`
        .animate-slideDown {
          animation: slideDown 0.35s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideDown {
          0% { transform: translateY(-32px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-glow {
          box-shadow: 0 0 8px 1px #6366f1, 0 0 0 2px #818cf8;
          transition: box-shadow 0.3s;
        }
        .modern-dropdown {
          transition: border 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .modern-dropdown:focus {
          border-color: #6366f1;
          background: rgba(60,60,90,0.95);
          box-shadow: 0 0 16px 2px #6366f1, 0 0 0 2px #818cf8;
        }
      `}</style>
    </div>
  );
};

export default FilterPanel;
