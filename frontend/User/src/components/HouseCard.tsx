import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Shield, Wifi, Droplets, Zap, Car, Home as HomeIcon, Shirt } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { House } from '../types';
import { useStore } from '../store/useStore';

interface HouseCardProps {
  house: House;
  showCompareButton?: boolean;
  onClick?: () => void;
}

const amenityIcons = {
  wifi: Wifi,
  water: Droplets,
  electricity: Zap,
  parking: Car,
  furnished: HomeIcon,
  security: Shield,
  laundry: Shirt,
};

export const HouseCard: React.FC<HouseCardProps> = ({ house, showCompareButton = true, onClick }) => {
  const { favorites, addToFavorites, removeFromFavorites, addToCompare, compareList } = useStore();
  const isFavorited = favorites.some(fav => fav.id === house.id);
  const isInCompare = compareList.some(h => h.id === house.id);
  const canAddToCompare = compareList.length < 3;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorited) {
      removeFromFavorites(house.id);
    } else {
      addToFavorites(house);
    }
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCompare(house);
  };

  const getAmenityIcon = (iconName: string) => {
    const Icon = amenityIcons[iconName as keyof typeof amenityIcons] || Shield;
    return Icon;
  };


  // Image carousel state
  const [currentImage, setCurrentImage] = useState(0);
  const images = house.images || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 max-w-sm w-full mx-auto card-glow" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="relative">
        <Link to={`/house/${house.id}`} tabIndex={-1}>
          <img
            src={images[currentImage] || ''}
            alt={house.title || 'House'}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Carousel Arrows */}
        {hasMultipleImages && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black shadow border border-green-500"
              style={{ pointerEvents: 'auto' }}
              onClick={handlePrevImage}
              tabIndex={-1}
              aria-label="Previous image"
            >
              <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black shadow border border-green-500"
              style={{ pointerEvents: 'auto' }}
              onClick={handleNextImage}
              tabIndex={-1}
              aria-label="Next image"
            >
              <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
            {/* Image indicator dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 w-2 rounded-full ${idx === currentImage ? 'bg-primary' : 'bg-gray-300'} transition-colors`}
                />
              ))}
            </div>
          </>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white ${
            isFavorited ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={handleFavoriteToggle}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={house.status === 'vacant' ? 'success' : 'secondary'}>
            {house.status === 'vacant' ? 'Available' : 'Occupied'}
          </Badge>
        </div>

        {/* Verification Badges */}
        {house.verification?.verified && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="verified">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {house.title || 'Untitled'}
            </h3>
            <div className="text-right">
              <p className="font-bold text-xl text-primary">
                KSh {typeof house.price === 'number' && !isNaN(house.price) ? house.price.toLocaleString() : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{house.location?.estate || 'Unknown'}</span>
            <span className="text-xs">
              {house.location?.distanceFromUniversity?.walking ?? '?'}min walk
            </span>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {typeof house.rating === 'number' && !isNaN(house.rating) ? house.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({house.reviewCount || house.reviews?.length || 0} {(house.reviewCount || house.reviews?.length || 0) !== 1 ? 'reviews' : 'review'})
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <Shield className="h-4 w-4" />
              <span className="text-sm">{typeof house.safetyRating === 'number' && !isNaN(house.safetyRating) ? house.safetyRating : '0'}/5</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 flex-wrap">
            {house.amenities?.filter(a => a.available).slice(0, 4).map((amenity) => {
              const Icon = getAmenityIcon(amenity.icon);
              return (
                <div key={amenity.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  <span>{amenity.name}</span>
                </div>
              );
            })}
            {house.amenities?.filter(a => a.available).length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{house.amenities.filter(a => a.available).length - 4} more
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {showCompareButton && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleAddToCompare}
                disabled={isInCompare || !canAddToCompare}
              >
                {isInCompare ? 'In Compare' : 'Compare'}
              </Button>
              <Link to={`/house/${house.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};