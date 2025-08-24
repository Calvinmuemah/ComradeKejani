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
import { 
  PriceTrend, 
  EstateInsightResponse, 
  PopularEstatesResponseData, 
  PriceTrendsResponseData,
  PriceTrendInsightResponse,
  HouseType
} from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from 'recharts';

export const InsightsPage: React.FC = () => {
  const { houses, loading, fetchHouses } = useStore();
  const { theme } = useTheme();
  
  // Make sure we have houses data
  useEffect(() => {
    if (houses.length === 0 && !loading) {
      fetchHouses();
    }
  }, [houses.length, loading, fetchHouses]);

  // Colors for bar chart
  const COLORS = ['#3b82f6', '#4f46e5', '#6366f1', '#8b5cf6', '#a855f7'];
  
  // State for API data
  const [priceTrends, setPriceTrends] = useState<(PriceTrend & { month?: string })[]>([]);
  const [popularEstates, setPopularEstates] = useState<{ name: string; averageRent: number; popularity: number; views?: number; houseTypes?: string[] }[]>([]);
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
        // Log the fetching process
        console.log('Fetching insights data from API...');
        
        const [trendsResponse, estatesResponse] = await Promise.all([
          apiService.getPriceTrends() as Promise<PriceTrendsResponseData>,
          apiService.getPopularEstates() as Promise<PopularEstatesResponseData>
        ]);
        
        console.log('Price trends response:', trendsResponse);
        console.log('Popular estates response:', estatesResponse);
        
        // Process trends data to match our component's expected format
        if (trendsResponse && trendsResponse.priceTrends && trendsResponse.priceTrends.length > 0) {
          const formattedTrends = trendsResponse.priceTrends.map((trend: PriceTrendInsightResponse) => ({
            estate: 'All Estates', // Since the API returns aggregate data
            houseType: 'All Types' as unknown as HouseType, // Cast to HouseType
            averagePrice: trend.averagePrice,
            trend: 'stable' as const, // Default to stable since we don't have trend direction
            percentageChange: 0, // Default value since we don't have percentage change
            month: trend.month,
            period: 'Monthly' // Add required field for PriceTrend type
          }));
          
          // Sort by month for the chart (oldest to newest)
          formattedTrends.sort((a, b) => {
            if (!a.month || !b.month) return 0;
            // Compare as dates for correct chronological order
            return new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime();
          });
          
          console.log('Formatted price trends:', formattedTrends);
          setPriceTrends(formattedTrends);
        } else {
          // Generate mock data for testing if API returns empty results
          const mockTrends = [
            { month: '2025-03', averagePrice: 23500, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'stable' as const, percentageChange: 0, period: 'Monthly' },
            { month: '2025-04', averagePrice: 24000, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'up' as const, percentageChange: 2.1, period: 'Monthly' },
            { month: '2025-05', averagePrice: 24200, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'up' as const, percentageChange: 0.8, period: 'Monthly' },
            { month: '2025-06', averagePrice: 24100, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'down' as const, percentageChange: -0.4, period: 'Monthly' },
            { month: '2025-07', averagePrice: 24300, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'up' as const, percentageChange: 0.8, period: 'Monthly' },
            { month: '2025-08', averagePrice: 24525, estate: 'All Estates', houseType: 'All Types' as unknown as HouseType, trend: 'up' as const, percentageChange: 0.9, period: 'Monthly' },
          ];
          console.log('Using mock price trends data');
          setPriceTrends(mockTrends);
        }
        
        // Process estates data to include popularity percentage
        if (estatesResponse && estatesResponse.popularEstates && estatesResponse.popularEstates.length > 0) {
          const processedEstates = estatesResponse.popularEstates.map((estate: EstateInsightResponse) => ({
            name: estate.estate,
            averageRent: 0, // We don't have this in the API response
            popularity: Math.min(100, Math.max(60, estate.views)), // Convert views to popularity percentage
            views: estate.views,
            houseTypes: estate.houseTypes
          }));
          
          // Sort by views in descending order
          processedEstates.sort((a, b) => (b.views || 0) - (a.views || 0));
          
          console.log('Processed popular estates:', processedEstates);
          setPopularEstates(processedEstates);
        } else {
          // Generate mock data for testing if API returns empty results
          const mockEstates = [
            { name: 'Amalemba', views: 37, popularity: 100, houseTypes: ['bedsitter'], averageRent: 7000 },
            { name: 'Lurambi', views: 28, popularity: 92, houseTypes: ['bedsitter', 'single'], averageRent: 8500 },
            { name: 'Shirere', views: 25, popularity: 85, houseTypes: ['single'], averageRent: 7800 },
            { name: 'Kakamega CBD', views: 18, popularity: 78, houseTypes: ['bedsitter'], averageRent: 10500 },
            { name: 'Milimani', views: 12, popularity: 70, houseTypes: ['single'], averageRent: 12000 }
          ];
          console.log('Using mock popular estates data');
          setPopularEstates(mockEstates);
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

  // Calculate key statistics from houses data using useMemo to recalculate when houses change
  const { totalHouses, availableHouses, averagePrice, averageRating, priceChangeData } = React.useMemo(() => {
    // If houses are empty, return zeros to avoid calculations on empty array
    if (houses.length === 0) {
      return { 
        totalHouses: 0, 
        availableHouses: 0, 
        averagePrice: 0,
        averageRating: 0,
        priceChangeData: { percentage: 0, direction: 'up' as const } 
      };
    }
    
    const totalHouses = houses.length;
    const availableHouses = houses.filter(h => h.status === 'vacant').length;
    const averagePrice = Math.round(houses.reduce((acc, h) => acc + (h.price || 0), 0) / (houses.length || 1));
    const averageRating = Math.round((houses.reduce((acc, h) => acc + (h.rating || 0), 0) / (houses.length || 1)) * 10) / 10;
    
    // In a real scenario, this would compare current month's average to previous month
    // For now, we'll use a placeholder value
    const priceChangeData = {
      percentage: 2.3,
      direction: 'up' as const
    };
    
    return { totalHouses, availableHouses, averagePrice, averageRating, priceChangeData };
  }, [houses]);

  // Get active students count
  const [activeStudents, setActiveStudents] = useState(0);
  
  useEffect(() => {
    const fetchActiveStudents = async () => {
      try {
        const count = await apiService.getTotalActiveStudents();
        setActiveStudents(count); // Use the actual data from the API
      } catch (error) {
        console.error('Error fetching active students count:', error);
        // Use a more reasonable fallback based on the number of houses
        setActiveStudents(houses.length * 5); // Estimate ~5 students interested per house
      }
    };
    
    fetchActiveStudents();
  }, [houses.length]); // Add houses.length as a dependency

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
  <div className="w-full px-4 md:px-8 py-8">
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
  <div className="w-full px-4 md:px-8 py-8">
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
                  <p className={`text-xs ${priceChangeData.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChangeData.direction === 'up' ? '↑' : '↓'} {priceChangeData.percentage}% from last month
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
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{activeStudents.toLocaleString()}</p>
                  <p className="text-xs text-purple-500">Student Views</p>
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
                  Price Trends Over Time
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
              <p className="text-sm text-muted-foreground">
                Average rent prices in KSh over {selectedTimeframe === '1M' ? 'the last month' : 
                                               selectedTimeframe === '3M' ? 'the last 3 months' : 
                                               selectedTimeframe === '6M' ? 'the last 6 months' : 'the last year'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Price Trend Chart */}
                <div className="transform transition-all duration-500 hover:scale-[1.01]">
                  <div className="h-64 mt-2 mb-4 sm:h-80 md:h-96 transform transition-all duration-500 hover:scale-[1.01]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceTrends}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      key={`price-chart-${theme}`} // Force re-render when theme changes
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => {
                          // Format month from YYYY-MM to MMM
                          return new Date(value + '-01').toLocaleString('default', { month: 'short' });
                        }}
                        stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${value.toLocaleString()}`}
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                      />
                      <Tooltip 
                        formatter={(value) => [`KSh ${(value as number).toLocaleString()}`, 'Average Price']}
                        labelFormatter={(value) => {
                          return new Date(value + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
                        }}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                          borderRadius: '0.375rem',
                          boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{
                          color: theme === 'dark' ? '#94a3b8' : '#64748b'
                        }}
                        labelStyle={{
                          color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                          fontWeight: 'bold'
                        }}
                        cursor={{ stroke: theme === 'dark' ? '#475569' : '#cbd5e1', strokeWidth: 1 }}
                      />
                      <Legend 
                        formatter={(value) => (
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            {value}
                          </span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="averagePrice"
                        name="Average Price"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ 
                          r: 4, 
                          fill: '#3b82f6', 
                          stroke: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          strokeWidth: 2
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: '#60a5fa', 
                          stroke: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          strokeWidth: 2
                          // boxShadow removed as it's not a valid property
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Closing outer transform wrapper */}
                </div>
                
                {/* Price Trend List */}
                {priceTrends.length > 0 ? (
                  priceTrends.map((trend) => (
                    <div key={trend.month || `${trend.estate}-${trend.houseType}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <h4 className="font-semibold">
                        {trend.month ? `${new Date(trend.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` : `${trend.estate} - ${trend.houseType}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        KSh {trend.averagePrice.toLocaleString()}
                      </p>
                      {trend.trend && (
                        <span className={`font-medium ${
                          trend.trend === 'up' ? 'text-green-500' : 
                          trend.trend === 'down' ? 'text-red-500' : 
                          'text-blue-500'
                        }`}>
                          {trend.trend === 'up' ? '↑' : (trend.trend === 'down' ? '↓' : '→')} 
                          {Math.abs(trend.percentageChange)}%
                        </span>
                      )}
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
              <p className="text-sm text-muted-foreground">
                Most viewed estates and their popularity among students
              </p>
            </CardHeader>
            <CardContent>
              {popularEstates.length > 0 && (
                <div className="text-center mb-2">
                  <p className="text-sm font-medium">
                    <span className="text-primary">{popularEstates[0]?.name}</span> is the most popular estate with{" "}
                    <span className="text-primary">{popularEstates[0]?.views} views</span>
                  </p>
                </div>
              )}
              
              {/* Popular Zones Chart */}
              <div className="h-64 mt-2 mb-6 sm:h-80 md:h-96 transform transition-all duration-500 hover:scale-[1.01]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularEstates}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    key={`estate-chart-${theme}`} // Force re-render when theme changes
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                      type="number" 
                      domain={[0, 'dataMax + 5']}
                      stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80}
                      stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'views') return [`${value} views`, 'Total Views'];
                        return [`${value}%`, 'Popularity'];
                      }}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        borderRadius: '0.375rem',
                        boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{
                        color: theme === 'dark' ? '#94a3b8' : '#64748b'
                      }}
                      labelStyle={{
                        color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                        fontWeight: 'bold'
                      }}
                      cursor={{ fill: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.7)' }}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {value}
                        </span>
                      )}
                    />
                    <Bar 
                      dataKey="views" 
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]}
                      name="Total Views"
                      className="transition-all duration-300 hover:opacity-90 hover:filter hover:brightness-110"
                    >
                      {popularEstates.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="views" position="insideRight" fill="#ffffff" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Popular Zones List */}
              <div className="space-y-4">
                {popularEstates.length > 0 ? (
                  popularEstates.map((zone, index) => (
                    <div key={zone.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{zone.name}</h4>
                          {zone.houseTypes && zone.houseTypes.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {zone.houseTypes.join(', ')}
                            </p>
                          )}
                          {zone.averageRent > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Avg. KSh {zone.averageRent.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${zone.popularity}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {zone.views !== undefined ? `${zone.views} views` : `${zone.popularity}% popular`}
                        </p>
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