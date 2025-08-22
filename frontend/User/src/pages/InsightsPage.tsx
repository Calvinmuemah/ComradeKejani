import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
// ...existing code...
import { useStore } from '../store/useStore';

export const InsightsPage: React.FC = () => {
  const { houses, loading } = useStore();

  // Sample data for popularEstates (replace with real data as needed)
  const popularEstates = [
    { name: 'Westlands', averageRent: 25000 },
    { name: 'Kilimani', averageRent: 30000 },
    { name: 'Rongai', averageRent: 15000 },
    { name: 'Kasarani', averageRent: 18000 },
    { name: 'Ngong Road', averageRent: 22000 },
  ];
  // Removed unused selectedEstate state
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  const totalHouses = houses.length;
  const availableHouses = houses.filter(h => h.status === 'vacant').length;
  const averagePrice = Math.round(houses.reduce((acc, h) => acc + h.price, 0) / (houses.length || 1));
  const averageRating = Math.round((houses.reduce((acc, h) => acc + h.rating, 0) / (houses.length || 1)) * 10) / 10;

  // Removed unused priceRanges
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                  <p className="text-xs text-green-500">↑ 2.3% from last month</p>
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
                  <p className="text-xs text-blue-500">{totalHouses - availableHouses} new this week</p>
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
                  <p className="text-2xl font-bold text-foreground">2,341</p>
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
                {/* No real price trends endpoint yet. Integrate when backend is ready. */}
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
                {popularEstates.map((zone, index) => (
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
                          style={{ width: `${Math.min(100, 40 + index * 15)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{60 + index * 10}% popular</p>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  );
};