import React, { useEffect, useState } from 'react';
import { MapPin, Filter, List, X, Navigation as NavigationIcon, Car, Bus, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { House } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/useTheme';

// Center coordinates for MMUST Library
const MMUST_LIBRARY = {
  lat: 0.290482,
  lng: 34.7640097,
  name: "MMUST Main Library"
};

// CSS for map animations
const mapAnimations = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .pin-pulse {
    animation: pulse 1.5s infinite;
  }

  .pin-bounce {
    animation: bounce 1s ease infinite;
  }
`;

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { houses, loading, fetchHouses, favorites, addToFavorites, removeFromFavorites } = useStore();
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [showRouteToSelected, setShowRouteToSelected] = useState(false);
  const [transportMode, setTransportMode] = useState<'walking' | 'driving' | 'transit'>('walking');
  const [animatingPin, setAnimatingPin] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
    
    // Add map animations CSS to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = mapAnimations;
    document.head.appendChild(styleElement);
    
    // Clean up style element on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [fetchHouses]);

  const isFavorite = (id: string) => favorites && favorites.some(h => h.id === id);

  // Calculate position for map pins based on their coordinates
  const getHousePinStyle = (house: House) => {
    if (!house.location || !house.location.coordinates) {
      return { display: 'none' }; // Hide if no coordinates
    }
    
    // These calculations position the pins based on their distance from the map center
    // This is a simplified calculation that works with the iframe overlay approach
    const latDiff = (house.location.coordinates.lat - MMUST_LIBRARY.lat) * 500;
    const lngDiff = (house.location.coordinates.lng - MMUST_LIBRARY.lng) * 500;
    
    // Calculate percentage position on the map (center is 50%,50%)
    const left = 50 + lngDiff;
    const top = 50 - latDiff;
    
    // Ensure the pins are within the visible area (5% to 95% of container)
    const clampedLeft = Math.min(Math.max(left, 5), 95);
    const clampedTop = Math.min(Math.max(top, 5), 95);
    
    return {
      left: `${clampedLeft}%`,
      top: `${clampedTop}%`
    };
  };

  // Function to view a selected house on the map
  const viewHouseOnMap = (houseId: string) => {
    const house = houses.find(h => h.id === houseId);
    if (house && house.location && house.location.coordinates) {
      // First set the animating pin for a nice effect
      setAnimatingPin(houseId);
      
      // After a small delay, select the house and show route
      setTimeout(() => {
        setSelectedHouse(houseId);
        setShowRouteToSelected(true);
        setAnimatingPin(null);
      }, 300);
    }
  };

  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <MapPin className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-blue-100' : 'text-gray-800'}`}>Loading map and properties...</p>
          <p className="text-sm text-muted-foreground">Gathering the best student housing around MMUST</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
  <div className="w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-gray-900'}`}>
            Interactive Map View
          </h1>
          <p className={`${theme === 'dark' ? 'text-blue-200' : 'text-gray-600'}`}>
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
                {/* Real Google Maps implementation */}
        <div className={`relative h-full rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-muted' : 'bg-gray-100'}`}>
                  {/* Google Maps iframe */}
                  <iframe
                    title="Properties Map"
                    className="w-full h-full border-0"
                    src={`https://www.google.com/maps/embed/v1/${selectedHouse && showRouteToSelected ? 'directions' : 'place'}?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8${
                      selectedHouse && showRouteToSelected 
                      ? `&origin=0.290482,34.7640097&destination=${
                          houses.find(h => h.id === selectedHouse)?.location?.coordinates
                          ? `${houses.find(h => h.id === selectedHouse)?.location?.coordinates.lat},${houses.find(h => h.id === selectedHouse)?.location?.coordinates.lng}`
                          : `${houses.find(h => h.id === selectedHouse)?.location?.estate || 'MMUST+Kakamega'}`
                        }&mode=${transportMode}&avoid=highways&units=metric` 
                      : `&q=MMUST+Library+Kisumu+Kakamega+Road&center=0.290482,34.7640097`
                    }&zoom=${selectedHouse ? '16' : '15'}`}
                    onLoad={() => {}}
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    loading="lazy"
                    style={{filter: 'grayscale(0%) contrast(1.2)'}}
                  />
                  
                  {/* Map Pin Overlays */}
                  <div className="absolute inset-0 pointer-events-none">
                    {houses.filter(house => house.location && house.location.coordinates).map((house) => (
                      <div
                        key={house.id}
                        className={`absolute w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center pointer-events-auto
                        ${selectedHouse === house.id ? 'ring-4 ring-primary/50 scale-125 z-20 pin-pulse' : ''}
                        ${animatingPin === house.id ? 'scale-150 z-30 ring-2 ring-primary pin-bounce' : ''}
                        ${!selectedHouse && !animatingPin ? 'hover:scale-110 hover:z-10' : 'hover:scale-105'}
                        `}
                        style={getHousePinStyle(house)}
                        onClick={() => viewHouseOnMap(house.id)}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {Math.floor(house.price / 1000)}k
                          </span>
                          {selectedHouse === house.id && (
                            <span className={`absolute -bottom-5 whitespace-nowrap text-white text-[10px] px-1 rounded ${theme === 'dark' ? 'bg-black/70' : 'bg-gray-900/70'}`}>
                              {house.location.distanceFromUniversity.walking}min walk
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map Controls */}
          <div className="absolute bottom-4 right-4 space-y-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
            className={`w-8 h-8 p-0 rounded-full shadow-lg ${theme === 'dark' ? 'bg-white hover:bg-gray-100' : 'bg-white hover:bg-gray-200'}`}
                      onClick={() => {
                        setSelectedHouse(null);
                        setShowRouteToSelected(false);
                      }}
                      title="Return to MMUST Library"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                    </Button>
                    {selectedHouse && (
                      <>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className={`w-8 h-8 p-0 rounded-full shadow-lg ${theme === 'dark' ? 'bg-white hover:bg-gray-100' : 'bg-white hover:bg-gray-200'}`}
                          onClick={() => setSelectedHouse(null)}
                          title="Deselect house"
                        >
                          <X className="h-4 w-4 text-primary" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={showRouteToSelected ? "default" : "secondary"} 
                          className={`w-8 h-8 p-0 rounded-full shadow-lg ${showRouteToSelected ? 'bg-primary hover:bg-primary/90' : theme === 'dark' ? 'bg-white hover:bg-gray-100' : 'bg-white hover:bg-gray-200'}`}
                          onClick={() => setShowRouteToSelected(!showRouteToSelected)}
                          title={showRouteToSelected ? "Hide route" : "Show route from MMUST Library"}
                        >
                          <NavigationIcon className={`h-4 w-4 ${showRouteToSelected ? 'text-white' : 'text-primary'}`} />
                        </Button>
                        
                        {/* Transport mode buttons - only show if route is visible */}
                        {showRouteToSelected && (
                          <div className={`mt-1 flex flex-col gap-1 p-1 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-white/80' : 'bg-white/90'}`}>
                                                          <Button
                              size="sm"
                              variant={transportMode === 'walking' ? "default" : "secondary"}
                              className={`w-8 h-8 p-0 rounded-full ${transportMode === 'walking' ? 'bg-primary hover:bg-primary/90' : ''}`}
                              onClick={() => setTransportMode('walking')}
                              title="Walking directions"
                            >
                              <User className={`h-4 w-4 ${transportMode === 'walking' ? 'text-white' : 'text-primary'}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant={transportMode === 'driving' ? "default" : "secondary"}
                              className={`w-8 h-8 p-0 rounded-full ${transportMode === 'driving' ? 'bg-primary hover:bg-primary/90' : ''}`}
                              onClick={() => setTransportMode('driving')}
                              title="Driving directions"
                            >
                              <Car className={`h-4 w-4 ${transportMode === 'driving' ? 'text-white' : 'text-primary'}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant={transportMode === 'transit' ? "default" : "secondary"}
                              className={`w-8 h-8 p-0 rounded-full ${transportMode === 'transit' ? 'bg-primary hover:bg-primary/90' : ''}`}
                              onClick={() => setTransportMode('transit')}
                              title="Public transit directions"
                            >
                              <Bus className={`h-4 w-4 ${transportMode === 'transit' ? 'text-white' : 'text-primary'}`} />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
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
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate(`/houses/${house.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Button 
                          variant={showRouteToSelected ? "default" : "outline"}
                          className={`w-full flex items-center justify-center gap-2 ${showRouteToSelected ? 'bg-primary hover:bg-primary/90' : theme === 'dark' ? 'text-primary border-primary/50 hover:bg-primary/5' : 'text-primary border-primary/50 hover:bg-primary/10'}`}
                          onClick={() => setShowRouteToSelected(!showRouteToSelected)}
                        >
                          <NavigationIcon className={`w-4 h-4 ${showRouteToSelected ? 'text-white' : 'text-primary'}`} />
                          {showRouteToSelected ? (
                            <span className="font-medium">Hide Route</span>
                          ) : (
                            <span className="font-medium">Show Route from MMUST</span>
                          )}
                        </Button>
                        {showRouteToSelected && (
                          <div className="mt-2 space-y-1">
                            <div className={`flex items-center justify-between text-xs p-2 rounded ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1 text-primary" />
                                <span className="text-primary font-medium">Walking</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${transportMode === 'walking' ? 'bg-primary/20 border-primary text-primary' : ''}`}>
                                {house.location?.distanceFromUniversity?.walking || '--'} min
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10" 
                                onClick={() => setTransportMode('walking')}
                              >
                                Select
                              </Button>
                            </div>
                            
                            <div className={`flex items-center justify-between text-xs p-2 rounded ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
                              <div className="flex items-center">
                                <Car className="h-3 w-3 mr-1 text-primary" />
                                <span className="text-primary font-medium">Driving</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${transportMode === 'driving' ? 'bg-primary/20 border-primary text-primary' : ''}`}>
                                {Math.max(1, Math.floor(house.location?.distanceFromUniversity?.walking / 4))} min
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10" 
                                onClick={() => setTransportMode('driving')}
                              >
                                Select
                              </Button>
                            </div>
                            
                            <div className={`flex items-center justify-between text-xs p-2 rounded ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'}`}>
                              <div className="flex items-center">
                                <Bus className="h-3 w-3 mr-1 text-primary" />
                                <span className="text-primary font-medium">Transit</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${transportMode === 'transit' ? 'bg-primary/20 border-primary text-primary' : ''}`}>
                                {house.location?.distanceFromUniversity?.matatu || '--'} min
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10" 
                                onClick={() => setTransportMode('transit')}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        )}
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