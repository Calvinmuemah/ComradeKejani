import React, { useState } from 'react';
import { House } from '../types';
import { Modal } from './ui/Modal';
import { HouseCard } from './HouseCard';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
  onSelectHouse: (house: House) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, houses, onSelectHouse }) => {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
  });
  const [filteredHouses, setFilteredHouses] = useState<House[]>(houses);

  React.useEffect(() => {
    let result = houses;
    if (filters.location) {
      result = result.filter(h => h.location.estate.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.minPrice) {
      result = result.filter(h => h.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(h => h.price <= Number(filters.maxPrice));
    }
  // No bedrooms filter, as House does not have a bedrooms property
    setFilteredHouses(result);
  }, [filters, houses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-2xl font-bold mb-2">Filter Houses</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleChange}
            className="input input-bordered"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleChange}
            className="input input-bordered"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHouses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No houses found.</div>
          ) : (
            filteredHouses.map(house => (
              <HouseCard key={house.id} house={house} onClick={() => onSelectHouse(house)} />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
