import React, { useEffect, useState } from 'react';
import { MapPin, Filter, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';

export const MapPage: React.FC = () => {
  const { houses, loading, fetchHouses, favorites, addToFavorites, removeFromFavorites } = useStore();
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const isFavorite = (id: string) => favorites && favorites.some(h => h.id === id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Interactive Map View
          </h1>
          <p className="text-muted-foreground">
            Explore student houses around Masinde Muliro University
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Campus Area Map
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                {/* Map Placeholder - In real implementation, use Google Maps or Mapbox */}
                <div className="relative h-full bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Interactive Map
                      </h3>
                      <p className="text-muted-foreground">
                        {houses.length} houses available
                      </p>
                    </div>
                  </div>
                  {/* Mock Map Pins */}
                  {houses.slice(0, 6).map((house, index) => (
                    <div
                      key={house.id}
                      className="absolute w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                      style={{
                        left: `${20 + index * 12}%`,
                        top: `${30 + (index % 3) * 20}%`
                      }}
                      onClick={() => setSelectedHouse(house.id)}
                    >
                      <span className="text-xs font-bold text-white">
                        {Math.floor(house.price / 1000)}k
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* House Details Sidebar */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  House Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedHouse ? (() => {
                  const house = houses.find(h => h.id === selectedHouse);
                  if (!house) return null;
                  return (
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        {house.images && house.images.length > 0 ? (
                          <img 
                            src={house.images[0]} 
                            alt={house.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {house.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {house.location?.estate} • {house.location?.distanceFromUniversity?.walking}min walk
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          KES {house.price?.toLocaleString()}
                        </span>
                        <Badge variant={house.status === 'vacant' ? 'default' : 'secondary'}>
                          {house.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {house.amenities && house.amenities.length > 0 ? (
                          house.amenities.slice(0, 4).map(amenity => (
                            <Badge
                              key={
                                typeof amenity === 'object' && amenity !== null && 'name' in amenity
                                  ? String((amenity as { name: string }).name)
                                  : String(amenity)
                              }
                              variant="outline"
                              className="text-xs"
                            >
                              {typeof amenity === 'object' && amenity !== null && 'name' in amenity
                                ? (amenity as { name: string }).name
                                : String(amenity)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No amenities listed</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            if (isFavorite(house.id)) {
                              removeFromFavorites(house.id);
                            } else {
                              addToFavorites(house);
                            }
                          }}
                          variant={isFavorite(house.id) ? "default" : "outline"}
                          className="flex-1"
                        >
                          {isFavorite(house.id) ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Contact
                        </Button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Click on a map pin to view house details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Area Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Price</span>
                  <span className="font-semibold">
                    KES {Math.round(houses.reduce((sum, h) => sum + (h.price || 0), 0) / (houses.length || 1)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Houses</span>
                  <span className="font-semibold">{houses.filter(h => h.status === 'vacant').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Safety Rating</span>
                  <span className="font-semibold">
                    {(
                      houses.reduce((sum, h) => sum + (h.safetyRating || 0), 0) /
                      (houses.length || 1)
                    ).toFixed(1)}/5
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};