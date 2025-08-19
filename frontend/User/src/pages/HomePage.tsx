import React, { useEffect, useState } from 'react';
import { TrendingUp, MapPin, Shield, Star } from 'lucide-react';
import { HouseCard } from '../components/HouseCard';
import { SearchFilters } from '../components/SearchFilters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export const HomePage: React.FC = () => {
  const { houses, loading, error, fetchHouses, searchResults, searchQuery } = useStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const displayHouses = searchQuery ? searchResults : houses;
  const featuredHouses = houses.filter(house => house.verification.verified).slice(0, 6);
  const trendingEstates = ['Amalemba', 'Kefinco', 'Maraba'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchHouses()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="py-8 px-4 md:px-8 space-y-8 animate-fadeIn">
      {/* Hero Section */}
  <div className="text-center space-y-4 py-12 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl animate-fadeIn delay-100">
  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent transition-all duration-500 hover:scale-105">
          Find Your Perfect Student Home
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover verified, affordable housing near Masinde Muliro University with smart recommendations powered by AI.
        </p>
      </div>

      {/* Search Section */}
      <SearchFilters
        showAdvanced={showAdvancedFilters}
        onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Quick Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn delay-200">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{houses.length}</div>
            <div className="text-sm text-muted-foreground">Available Houses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {houses.filter(h => h.verification.verified).length}
            </div>
            <div className="text-sm text-muted-foreground">Verified Properties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {Math.round(houses.reduce((acc, h) => acc + h.rating, 0) / houses.length * 10) / 10}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              KSh {Math.round(houses.reduce((acc, h) => acc + h.price, 0) / houses.length).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Average Rent</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Houses */}
      {!searchQuery && featuredHouses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-fadeIn delay-300">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Badge variant="verified">Verified</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 animate-fadeIn delay-400">
            {featuredHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Estates */}
      {!searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-fadeIn delay-300">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Estates</h2>
          </div>
          <div className="flex gap-2 flex-wrap animate-fadeIn delay-400">
            {trendingEstates.map((estate) => (
              <Badge key={estate} variant="outline" className="text-base py-2 px-4">
                <MapPin className="h-4 w-4 mr-2" />
                {estate}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Main Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search Results (${displayHouses.length})` : 'All Houses'}
          </h2>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {displayHouses.filter(h => h.verification.verified).length} verified
            </span>
          </div>
        </div>

        {displayHouses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No houses found matching your search.' : 'No houses available.'}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="mt-4"
            >
              Adjust Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 animate-fadeIn delay-500">
            {displayHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
            {/* Demo: Add more placeholder cards for visual density */}
            {[...Array(4)].map((_, i) => (
              <HouseCard key={`placeholder-${i}`} house={{
                id: `placeholder-${i}`,
                title: `Demo House ${i+1}`,
                price: 10000 + i * 1000,
                type: 'single',
                rating: 4.2,
                reviews: [],
                verification: {
                  verified: i % 2 === 0,
                  badges: [],
                },
                status: 'vacant',
                images: [
                  // Use real house images for demo cards
                  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
                  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
                  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
                  'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=800',
                ].slice(i, i+1),
                location: {
                  estate: 'Demo Estate',
                  address: 'Demo Address',
                  coordinates: { lat: 0, lng: 0 },
                  distanceFromUniversity: { walking: 10, boda: 5, matatu: 3 },
                  nearbyEssentials: []
                },
                amenities: [],
                landlord: {
                  name: 'Demo Landlord',
                  phone: '0700000000',
                  verified: true,
                  rating: 4.5
                },
                safetyRating: 4.5,
                createdAt: new Date(),
                updatedAt: new Date()
              }} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};