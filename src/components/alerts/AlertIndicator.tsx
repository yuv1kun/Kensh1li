import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/neuromorphic/alert-system';
import { useNotifications } from './NotificationProvider';

/**
 * Floating indicator that shows when there are active alerts
 */
const AlertIndicator: React.FC = () => {
  const { alertSystem } = useNotifications();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!alertSystem) return;
    
    // Initial state
    const alerts = alertSystem.getActiveAlerts();
    setActiveAlerts(alerts);
    setIsVisible(alerts.length > 0);
    
    // Subscribe to active alerts updates
    const subscription = alertSystem.subscribeToActiveAlerts((alerts) => {
      setActiveAlerts(alerts);
      setIsVisible(alerts.length > 0);
      
      // Auto-expand when new alert arrives
      if (alerts.length > 0) {
        setIsExpanded(true);
        
        // Auto-collapse after 5 seconds
        setTimeout(() => {
          setIsExpanded(false);
        }, 5000);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [alertSystem]);
  
  // Don't render if no active alerts
  if (!isVisible) return null;
  
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const errorCount = activeAlerts.filter(a => a.severity === 'error').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.severity === 'info').length;
  
  const latestAlert = activeAlerts[0];
  
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
      isExpanded ? "w-80" : "w-auto"
    )}>
      <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
        {isExpanded ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center font-medium">
                <Bell className="h-4 w-4 mr-2" /> 
                Active Alerts ({activeAlerts.length})
              </div>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2 mb-3">
              {criticalCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600 font-medium">Critical</span>
                  <Badge variant="destructive">{criticalCount}</Badge>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">Error</span>
                  <Badge variant="destructive">{errorCount}</Badge>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-500">Warning</span>
                  <Badge className="bg-yellow-500">{warningCount}</Badge>
                </div>
              )}
              {infoCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-blue-500">Info</span>
                  <Badge variant="secondary">{infoCount}</Badge>
                </div>
              )}
            </div>
            
            {latestAlert && (
              <div className="border-t pt-2 mt-2">
                <div className="text-sm font-medium">{latestAlert.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {latestAlert.message}
                </div>
              </div>
            )}
            
            <Link 
              to="/alerts" 
              className="block text-center text-sm mt-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded"
            >
              View All Alerts
            </Link>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 p-2 hover:bg-muted/50"
          >
            <Badge variant={criticalCount > 0 ? "destructive" : "default"} className="rounded-full h-6 w-6 flex items-center justify-center p-0">
              <Bell className="h-3 w-3" />
            </Badge>
            <span className="font-medium">{activeAlerts.length} Alert{activeAlerts.length !== 1 ? 's' : ''}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertIndicator;
