import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useTheme } from '../contexts/useTheme';
import { apiService } from '../services/api';
import { useSilentData } from '../hooks/useSilentData';
import { PriceTrend } from '../types';

export const InsightsPage: React.FC = () => {
  const { houses, loading } = useStore();
  const { theme } = useTheme();

  // State for API data
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [popularEstates, setPopularEstates] = useState<{ name: string; averageRent: number; popularity: number }[]>([]);
  interface RecommendationReview { id?: string; rating?: number; comment?: string; createdAt?: Date }
  interface RecommendationHouse { id: string; title: string; price: number; location: { estate: string; address?: string }; images: string[]; reviews?: RecommendationReview[] }
  interface RecommendationItem { houseId: string; aiRecommendation?: string; recommended: boolean; house?: RecommendationHouse }
  const { data: recData } = useSilentData<RecommendationItem[]>({
    cacheKey: 'ck_ai_recs',
    fetcher: async () => {
      const reviewsData = await apiService.getTopReviews();
      interface RawRec { houseId: string; aiRecommendation?: string; house?: { id?: string; _id?: string; title?: string; price: number; location?: { estate?: string; address?: string }; images?: string[]; reviews?: RecommendationReview[] }; reviews?: RecommendationReview[] }
      const seen = new Set<string>();
      return (reviewsData as RawRec[])
        .filter(r => r?.house?.title)
        .filter(r => { if (seen.has(r.houseId)) return false; seen.add(r.houseId); return true; })
        .map(r => ({
          houseId: r.houseId,
          aiRecommendation: r.aiRecommendation,
          recommended: true,
          house: r.house ? {
            id: r.house.id || r.house._id || r.houseId,
            title: r.house.title || '',
            price: r.house.price,
            location: { estate: r.house.location?.estate || '', address: r.house.location?.address },
            images: r.house.images || [],
            reviews: r.house.reviews || r.reviews || []
          } : undefined
        }));
    },
    parse: raw => Array.isArray(raw) ? raw as RecommendationItem[] : null,
    compare: (a, b) => JSON.stringify(a.map(x => x.houseId)) === JSON.stringify(b.map(x => x.houseId))
  });
  const recommendations = recData || [];
  const [selectedHouse, setSelectedHouse] = useState<RecommendationHouse | null>(null);
  const [addingFavorite, setAddingFavorite] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  // Removed explicit loading state (silent background fetch)

  // Fetch price trends and popular estates data
  useEffect(() => {
  const fetchInsightsData = async () => {
      try {
        const [trendsData, estatesData] = await Promise.all([
          apiService.getPriceTrends(),
          apiService.getPopularEstates()
        ]);
        
        setPriceTrends(trendsData);
        
        // Process estates data to include popularity percentage
        if (estatesData && estatesData.length > 0) {
          const processedEstates = estatesData.map((estate, index) => ({
            ...estate,
            popularity: Math.min(100, 60 + index * 10) // This will be replaced with real data when available
          }));
          setPopularEstates(processedEstates);
        }
        
      } catch (error) {
        console.error('Error fetching insights data:', error);
        calculatePopularEstatesFromHouses();
      }
    };

    fetchInsightsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate stats from available houses if API fails
  const calculatePopularEstatesFromHouses = () => {
    // Group houses by estate
    const estateGroups = houses.reduce((acc, house) => {
      const estate = house.location.estate;
      if (!acc[estate]) {
        acc[estate] = [];
      }
      acc[estate].push(house);
      return acc;
    }, {} as Record<string, typeof houses>);

    // Calculate average rent and count for each estate
    const estatesData = Object.entries(estateGroups).map(([name, houses]) => {
      const totalRent = houses.reduce((sum, house) => sum + house.price, 0);
      const averageRent = Math.round(totalRent / houses.length);
      const houseCount = houses.length;
      
      return {
        name,
        averageRent,
        houses: houseCount
      };
    });

    // Sort by house count (popularity)
    const sortedEstates = estatesData.sort((a, b) => b.houses - a.houses);
    
    // Take top 5 and add popularity percentage
    const topEstates = sortedEstates.slice(0, 5).map((estate, index) => ({
      name: estate.name,
      averageRent: estate.averageRent,
      popularity: Math.min(100, 60 + index * 10) // 60%, 70%, 80%, 90%, 100%
    }));

    setPopularEstates(topEstates);
  };

  // Calculate key statistics from houses data
  const totalHouses = houses.length;
  const availableHouses = houses.filter(h => h.status === 'vacant').length;
  const averagePrice = Math.round(houses.reduce((acc, h) => acc + (h.price || 0), 0) / (houses.length || 1));
  const averageRating = Math.round((houses.reduce((acc, h) => acc + (h.rating || 0), 0) / (houses.length || 1)) * 10) / 10;
  
  // Calculate monthly price change (based on the most recent houses)
  const calculatePriceChange = () => {
    // In a real scenario, this would compare current month's average to previous month
    // For now, we'll use a placeholder value
    return {
      percentage: 2.3,
      direction: 'up' as const
    };
  };

  const priceChange = calculatePriceChange();

  // Calculate active students (in real system, this would come from users database)
  const activeStudents = 2341; // Placeholder until real data is available

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 w-2/3 bg-muted rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
          </div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border p-6">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded-lg animate-pulse" />
                    <div className="h-6 w-24 bg-muted rounded-lg animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded-lg animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Content sections skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border">
                <div className="p-6 border-b">
                  <div className="h-6 w-1/3 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Housing Market Insights
          </h1>
          <p className="text-muted-foreground">
            Data-driven insights to help you make informed housing decisions
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rent</p>
                  <p className="text-2xl font-bold text-foreground">KSh {averagePrice.toLocaleString()}</p>
                  <p className={`text-xs ${priceChange.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange.direction === 'up' ? '↑' : '↓'} {priceChange.percentage}% from last month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Houses</p>
                  <p className="text-2xl font-bold text-foreground">{availableHouses}</p>
                  <p className="text-xs text-blue-500">out of {totalHouses} total</p>
                </div>
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-foreground">{activeStudents.toLocaleString()}</p>
                  <p className="text-xs text-purple-500">Looking for housing</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageRating}/5</p>
                  <p className="text-xs text-green-500">Campus area average</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price Trends */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Trends
                </CardTitle>
                <div className="flex gap-2">
                  {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeframe === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceTrends.length > 0 ? (
                  priceTrends.map((trend) => (
                    <div key={`${trend.estate}-${trend.houseType}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{trend.estate} - {trend.houseType}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {trend.averagePrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          trend.trend === 'up' ? 'text-green-500' : 
                          trend.trend === 'down' ? 'text-red-500' : 
                          'text-blue-500'
                        }`}>
                          {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'} 
                          {Math.abs(trend.percentageChange)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No price trend data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Popular Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularEstates.length > 0 ? (
                  popularEstates.map((zone, index) => (
                    <div key={zone.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{zone.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Avg. KSh {zone.averageRent.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${zone.popularity}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{zone.popularity}% popular</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No popular zones data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Best Time to Search */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Best Time to Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500 mb-2">January - February</div>
                  <h4 className="font-semibold text-foreground mb-1">Best Deals</h4>
                  <p className="text-sm text-muted-foreground">
                    Lowest prices as students travel home for holidays
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 mb-2">August - September</div>
                  <h4 className="font-semibold text-foreground mb-1">High Demand</h4>
                  <p className="text-sm text-muted-foreground">
                    New semester starts, limited availability
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500 mb-2">March - April</div>
                  <h4 className="font-semibold text-foreground mb-1">Moderate Prices</h4>
                  <p className="text-sm text-muted-foreground">
                    Good balance of availability and pricing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Community AI Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Community AI Recommendations for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="relative ml-4">
                  {/* vertical line */}
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/20" />
                  <div className="flex flex-col gap-6">
                    {recommendations.map((rec, index) => (
                      <div key={rec.houseId} className="relative pl-10 group">
                        {/* node */}
                        <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-500 text-[10px] font-bold text-background flex items-center justify-center ring-4 ring-background dark:ring-oxford-900 shadow">
                          {index + 1}
                        </div>
                        {/* card bubble */}
                        <div className="rounded-lg border bg-transparent dark:bg-transparent p-4 transition-shadow group-hover:shadow-md">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-base leading-snug pr-2 line-clamp-1">{rec.house?.title}</h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-white">AI</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{rec.house?.location?.estate}</span>
                            <span className="mx-1 text-muted-foreground/40">•</span>
                            <span className="font-medium text-primary">KSh {rec.house?.price?.toLocaleString()}</span>
                          </div>
                          {rec.aiRecommendation && (
                            <div className="relative mb-3">
                              <div className="pl-3 border-l-2 border-primary/40 relative">
                                <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary/70 ring-2 ring-background dark:ring-oxford-800" />
                                <p className="text-xs italic text-muted-foreground leading-relaxed mt-0.5">{rec.aiRecommendation}</p>
                              </div>
                            </div>
                          )}
                          {rec.house?.images && rec.house.images.length > 0 && (
                            <img src={rec.house.images[0]} alt={rec.house.title} className="mb-3 w-full h-36 object-cover rounded" />
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => rec.house && setSelectedHouse(rec.house)}>Details</Button>
                            <Button size="sm" onClick={async () => { if (!rec.house) return; try { setAddingFavorite(true); await apiService.addToFavorites(rec.house.id); } finally { setAddingFavorite(false);} }} disabled={addingFavorite}>{addingFavorite ? 'Saving...' : 'Save'}</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No AI recommendations yet.</p>
              )}
              {selectedHouse && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className={`max-w-lg w-full rounded-lg p-6 shadow-lg ${theme === 'dark' ? 'bg-oxford-800' : 'bg-white'}`}>
                    <h3 className="text-xl font-bold mb-2">{selectedHouse.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{selectedHouse.location?.estate}</p>
                    <p className="font-semibold text-primary mb-4">KSh {selectedHouse.price?.toLocaleString()}</p>
                    {selectedHouse.images && selectedHouse.images.length > 0 && (
                      <img src={selectedHouse.images[0]} alt={selectedHouse.title} className="w-full h-48 object-cover rounded mb-4" />
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setSelectedHouse(null)}>Close</Button>
                      <Button onClick={async () => { try { setAddingFavorite(true); await apiService.addToFavorites(selectedHouse.id); setSelectedHouse(null);} finally { setAddingFavorite(false);} }}>Save</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};