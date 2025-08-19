import React, { useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { HouseCard } from '../components/HouseCard';
import { useStore } from '../store/useStore';

export const FavoritesPage: React.FC = () => {
  const { favorites, loading, removeFromFavorites } = useStore();

  const handleRemoveAll = () => {
    favorites.forEach(house => removeFromFavorites(house.id));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground">
                {favorites.length} house{favorites.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={handleRemoveAll}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start browsing houses and click the heart icon to save properties you're interested in.
            </p>
            <Button onClick={() => window.history.back()}>
              Browse Houses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};