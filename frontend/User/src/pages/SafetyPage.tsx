import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, MapPin, Phone, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useTheme } from '../contexts/useTheme';
import { Notification } from '../types';
export const SafetyPage = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const { houses } = useStore();
  const { theme } = useTheme();
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportData, setReportData] = useState({ description: '', type: 'Safety' });
  const [reportPosting, setReportPosting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://comradekejani-k015.onrender.com/api/v1/notifications/getAll');
        if (response.ok) {
          const data = await response.json();
          // Transform data to ensure it matches the Notification type
          const formattedNotifications = data.map((item: {
            _id?: string;
            id?: string;
            title: string;
            message: string;
            type?: string;
            createdAt: string;
            read?: boolean;
            houseId?: string;
          }) => ({
            ...item,
            id: item.id || item._id, // Ensure id is available
            type: item.type || 'other',
            read: item.read || false
          }));
          setNotifications(formattedNotifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);
  // No real safety alerts endpoint yet, so skip rendering dummySafetyAlerts
  // For area safety ratings, use houses to infer estates
  const estateCounts: Record<string, number> = {};
  houses.forEach(house => {
    estateCounts[house.location.estate] = (estateCounts[house.location.estate] || 0) + 1;
  });
  return (
  <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'} px-4 md:px-8 py-8`}>
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
              <div className={`text-center p-4 rounded-lg border border-primary/30 ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
                <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Police</h4>
                <p className="text-lg font-mono">999 / 112</p>
              </div>
              <div className={`text-center p-4 rounded-lg border border-primary/30 ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Campus Security</h4>
                <p className="text-lg font-mono">+254 700 123 456</p>
              </div>
              <div className={`text-center p-4 rounded-lg border border-primary/30 ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'}`}>
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
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="py-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div>
                    {/* Group notifications by type */}
                    {(() => {
                      // Group by type
                      const notificationsByType: Record<string, typeof notifications> = {};
                      notifications.forEach(notification => {
                        const type = notification.type || 'other';
                        if (!notificationsByType[type]) {
                          notificationsByType[type] = [];
                        }
                        notificationsByType[type].push(notification);
                      });

                      // Display groups
                      return Object.entries(notificationsByType).map(([type, typeNotifications]) => (
                        <div key={type} className="mb-6">
                          <h3 className="text-sm font-semibold uppercase text-primary mb-3">
                            {type.replace(/-/g, ' ')}
                          </h3>
                          
                          {/* Vertical timeline */}
                          <div className="relative ml-3">
                            {/* Vertical line */}
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/30" />
                            
                            <div className="flex flex-col gap-4">
                              {typeNotifications.map((notification, index) => (
                                <div key={notification._id || notification.id} className="relative pl-8 animate-fadeIn">
                                  {/* Node - centered on the vertical line */}
                                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-background z-10">
                                    {index + 1}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">{notification.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No notifications at this time.</p>
                )}
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
                  Available Estates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(estateCounts).map((estateName) => (
                  <div 
                    key={estateName} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedArea === estateName ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedArea(selectedArea === estateName ? null : estateName)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-foreground">{estateName}</h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          {estateCounts[estateName]} properties available
                        </div>
                      </div>
                      <Badge variant="outline">
                        View
                      </Badge>
                    </div>
                    {selectedArea === estateName && (
                      <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                        <p>Located in {estateName} area with {estateCounts[estateName]} available properties.</p>
                      </div>
                    )}
                  </div>
                ))}
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
                <Button className="w-full" onClick={() => setShowReportPopup(true)}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      {/* Report an Issue Popup */}
      {showReportPopup && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'dark' ? 'bg-black/60' : 'bg-black/30'}`}>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setReportPosting(true);
              try {
                const payload = { description: reportData.description, type: reportData.type };
                console.log('Submitting report issue:', payload);
                const response = await fetch('https://comradekejani-k015.onrender.com/api/v1/reports/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                
                if (response.ok) {
                  setShowReportPopup(false);
                  setReportData({ description: '', type: 'Safety' });
                  alert('Report submitted successfully!');
                } else {
                  throw new Error('Failed to submit report');
                }
              } catch (error) {
                console.error('Error submitting report:', error);
                alert('Failed to submit report. Please try again.');
              } finally {
                setReportPosting(false);
              }
            }}
            className={`w-full max-w-md mx-auto space-y-6 ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'} p-6 rounded-lg shadow animate-fadeIn border border-primary/30`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Report an Issue</h2>
              <button 
                type="button" 
                onClick={() => setShowReportPopup(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type of Issue</label>
              <select
                className={`w-full rounded-md border border-input ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'} px-3 py-2 text-sm`}
                value={reportData.type}
                onChange={e => setReportData(d => ({ ...d, type: e.target.value }))}
                required
                disabled={reportPosting}
              >
                <option value="Safety">Safety</option>
                <option value="Complaint">Complaint</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className={`w-full rounded-md border border-input ${theme === 'dark' ? 'bg-oxford-900' : 'bg-white'} px-3 py-2 text-sm min-h-[120px]`}
                value={reportData.description}
                onChange={e => setReportData(d => ({ ...d, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                required
                disabled={reportPosting}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={reportPosting}>
                {reportPosting ? 'Sending...' : 'Send Report'}
              </Button>
              <Button type="button" className="flex-1" variant="ghost" onClick={() => setShowReportPopup(false)} disabled={reportPosting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
