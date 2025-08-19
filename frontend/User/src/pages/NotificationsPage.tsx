import React, { useEffect } from 'react';
import { Bell, Check, Trash2, Home, TrendingDown, Shield, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';

const notificationIcons = {
  'new-listing': Home,
  'price-drop': TrendingDown,
  'vacancy-alert': Home,
  'safety-alert': Shield,
  'recommendation': Lightbulb,
};

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, markNotificationRead } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(unreadNotifications.map(n => markNotificationRead(n.id)));
  };

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type as keyof typeof notificationIcons] || Bell;
    return Icon;
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'new-listing':
        return 'success';
      case 'price-drop':
        return 'warning';
      case 'safety-alert':
        return 'destructive';
      case 'recommendation':
        return 'verified';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">
              We'll notify you about new houses, price changes, and safety updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                  onClick={() => !notification.read && markNotificationRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getNotificationVariant(notification.type) as any}>
                              {notification.type.replace('-', ' ')}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {notification.createdAt.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            {notification.houseId && (
                              <Button variant="ghost" size="sm">
                                View House
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};