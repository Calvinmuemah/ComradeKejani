import { useState } from 'react';
import { Shield, AlertTriangle, Info, MapPin, Phone, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
// Alert and AlertDescription are not in your UI, so we will use Card for alerts

import { useStore } from '../store/useStore';
export const SafetyPage = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const { houses } = useStore();
  // You may want to fetch safety alerts from backend in future
  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'destructive';
    if (severity >= 2) return 'default';
    return 'secondary';
  };
  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      default: return Info;
    }
  };
  // No real safety alerts endpoint yet, so skip rendering dummySafetyAlerts
  // For area safety ratings, use houses to infer estates
  const estateCounts: Record<string, number> = {};
  houses.forEach(house => {
    estateCounts[house.location.estate] = (estateCounts[house.location.estate] || 0) + 1;
  });
  const popularEstates = Object.entries(estateCounts).map(([name, houses]) => ({ name, houses }));
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Safety & Security
          </h1>
          <p className="text-muted-foreground">
            Stay informed about campus area safety and security updates
          </p>
        </div>

        {/* Emergency Contacts */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Phone className="w-5 h-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg bg-background">
                <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Police</h4>
                <p className="text-lg font-mono">999 / 112</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-background">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Campus Security</h4>
                <p className="text-lg font-mono">+254 700 123 456</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-background">
                <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Emergency</h4>
                <p className="text-lg font-mono">+254 700 654 321</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Safety Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Safety Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* No real safety alerts yet. Integrate when backend is ready. */}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Tips for Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Walking at Night",
                      tip: "Use well-lit routes and walk in groups. Avoid isolated areas after 8 PM."
                    },
                    {
                      title: "House Viewing",
                      tip: "Always inform someone of your location when viewing houses alone."
                    },
                    {
                      title: "Money Handling",
                      tip: "Use mobile money for rent payments. Avoid carrying large amounts of cash."
                    },
                    {
                      title: "Landlord Verification",
                      tip: "Verify landlord identity and check for fake listings before making payments."
                    },
                    {
                      title: "Emergency Preparedness",
                      tip: "Keep emergency contacts saved and share your location with trusted friends."
                    },
                    {
                      title: "Personal Belongings",
                      tip: "Secure valuable items and avoid displaying expensive electronics publicly."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Area Safety Ratings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Area Safety Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularEstates.map((zone) => {
                  // Mock safety ratings based on zone data
                  const safetyRating = Math.min(5, Math.max(2, Math.floor(zone.houses / 40) + 2));
                  return (
                    <div 
                      key={zone.name} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedArea === zone.name ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedArea(selectedArea === zone.name ? null : zone.name)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-foreground">{zone.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Shield 
                                key={i} 
                                className={`w-3 h-3 ${
                                  i < safetyRating ? 'text-green-500 fill-green-500' : 'text-muted-foreground'
                                }`} 
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {safetyRating}/5
                            </span>
                          </div>
                        </div>
                        <Badge variant={safetyRating >= 4 ? 'default' : safetyRating >= 3 ? 'secondary' : 'destructive'}>
                          {safetyRating >= 4 ? 'Safe' : safetyRating >= 3 ? 'Caution' : 'High Risk'}
                        </Badge>
                      </div>
                      {selectedArea === zone.name && (
                        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                          <p>Well-lit streets, regular security patrols, good community watch programs.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Report Safety Issue */}
            <Card>
              <CardHeader>
                <CardTitle>Report Safety Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Help keep the community safe by reporting safety concerns.
                </p>
                <Button className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
