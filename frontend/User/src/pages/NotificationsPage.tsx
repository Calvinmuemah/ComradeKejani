import React, { useEffect } from 'react';
import { Bell, Home, TrendingDown, Shield, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
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

  // Inject keyframes for glow animation once
  useEffect(() => {
    const styleId = 'notif-glow-anim';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `@keyframes glowSweep {0% {box-shadow:0 0 0 0 rgba(59,130,246,0.45);} 50% {box-shadow:0 0 0 10px rgba(59,130,246,0);} 100% {box-shadow:0 0 0 0 rgba(59,130,246,0);} }`;
      document.head.appendChild(style);
    }
  }, []);

  // Removed bulk mark-all action per new design.

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type as keyof typeof notificationIcons] || Bell;
    return Icon;
  };

  type BadgeVariant = 'success' | 'warning' | 'destructive' | 'verified' | 'outline';
  
  const getNotificationVariant = (type: string): BadgeVariant => {
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
    <div className="w-full px-4 md:px-8 py-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="relative flex items-center justify-center p-3 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-transparent to-transparent backdrop-blur-sm animate-[glowSweep_3.2s_ease-in-out_infinite]">
                <Bell className="h-7 w-7 text-primary drop-shadow-sm" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[10px] leading-none text-white font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}
                {/* Animated subtle rotating light sweep */}
                <div className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute -inset-1 bg-[conic-gradient(from_0deg,rgba(59,130,246,0.25),transparent_55%,rgba(59,130,246,0.25))] animate-spin-slow opacity-40" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-xl">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">
              We'll notify you about new houses, price changes, and safety updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className={`group relative overflow-hidden cursor-pointer border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fadeIn ${
                    !notification.read ? 'border-primary/30 bg-primary/5' : 'bg-background'
                  }`}
                  onClick={() => !notification.read && markNotificationRead(notification.id)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                  <CardContent className="p-5 relative z-10 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ring-4 ring-background dark:ring-oxford-900 shadow ${!notification.read ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} transition-all`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold leading-snug flex items-center gap-2">
                            {notification.title}
                            {!notification.read && <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant={getNotificationVariant(notification.type)} className="capitalize tracking-wide">
                            {notification.type.replace('-', ' ')}
                          </Badge>
                          <span className="text-muted-foreground/70">•</span>
                          <span className="text-muted-foreground">
                            {notification.createdAt.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {notification.houseId && (
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" className="transition-all hover:shadow-sm">View House</Button>
                      </div>
                    )}
                  </CardContent>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500" />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};