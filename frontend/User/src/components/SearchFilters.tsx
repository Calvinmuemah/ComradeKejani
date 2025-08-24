import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useStore } from '../store/useStore';
import { HouseType } from '../types';

interface SearchFiltersProps {
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const houseTypes: { value: HouseType; label: string }[] = [
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'single', label: 'Single Room' },
  { value: '1BR', label: '1 Bedroom' },
  { value: '2BR', label: '2 Bedroom' },
  { value: '3BR', label: '3 Bedroom' },
  { value: 'hostel', label: 'Hostel' },
];

const amenitiesList = ['WiFi', 'Water', 'Electricity', 'Furnished', 'Parking', 'Security', 'Laundry'];

const estatesList = ['Amalemba', 'Kefinco', 'Maraba', 'University Area', 'Town Center'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  showAdvanced = false,
  onToggleAdvanced,
}) => {
  const {
    searchQuery,
    searchFilters,
    setSearchQuery,
    setSearchFilters,
    searchHouses,
  } = useStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchHouses();
  };

  type SearchFiltersValue =
    | number
    | boolean
    | string[]
    | number[]
    | HouseType[]
    | string;

  const handleFilterChange = (key: keyof typeof searchFilters, value: SearchFiltersValue) => {
    setSearchFilters({ [key]: value });
    // Auto-apply search on filter change
    setTimeout(() => {
      searchHouses();
    }, 0);
  };

  const toggleHouseType = (type: HouseType) => {
    const current = searchFilters.houseTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleFilterChange('houseTypes', updated);
  };

  const toggleAmenity = (amenity: string) => {
    const current = searchFilters.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    handleFilterChange('amenities', updated);
  };

  const toggleEstate = (estate: string) => {
    const current = searchFilters.estate;
    const updated = current.includes(estate)
      ? current.filter(e => e !== estate)
      : [...current, estate];
    handleFilterChange('estate', updated);
  };

  const clearAllFilters = () => {
    setSearchFilters({
      priceRange: [0, 50000],
      houseTypes: [],
      maxDistance: 30,
      amenities: [],
      minRating: 0,
      safetyRating: 0,
      verified: false,
      estate: [],
    });
    setTimeout(() => {
      searchHouses();
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
  <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search houses, estates, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onToggleAdvanced}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </form>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Quick Filters:</span>
        {houseTypes.slice(0, 4).map((type) => (
          <Badge
            key={type.value}
            variant={searchFilters.houseTypes.includes(type.value) ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => toggleHouseType(type.value)}
          >
            {type.label}
          </Badge>
        ))}
        <Badge
          variant={searchFilters.verified ? 'verified' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleFilterChange('verified', !searchFilters.verified)}
        >
          Verified Only
        </Badge>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleAdvanced}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range (KSh)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={searchFilters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseInt(e.target.value) || 0,
                      searchFilters.priceRange[1],
                    ])
                  }
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={searchFilters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      searchFilters.priceRange[0],
                      parseInt(e.target.value) || 50000,
                    ])
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* House Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">House Types</label>
              <div className="flex flex-wrap gap-2">
                {houseTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={searchFilters.houseTypes.includes(type.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleHouseType(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Estates */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estates</label>
              <div className="flex flex-wrap gap-2">
                {estatesList.map((estate) => (
                  <Badge
                    key={estate}
                    variant={searchFilters.estate.includes(estate) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEstate(estate)}
                  >
                    {estate}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={searchFilters.amenities.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Max Distance from University: {searchFilters.maxDistance} minutes walk
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={searchFilters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Rating: {searchFilters.minRating}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={searchFilters.minRating}
                onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Safety Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Safety Rating: {searchFilters.safetyRating}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={searchFilters.safetyRating}
                onChange={(e) => handleFilterChange('safetyRating', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};