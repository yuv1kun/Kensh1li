import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText,
  Menu,
  Shield,
  Bell,
  Bot,
  Zap,
  X,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useNotifications } from '../alerts/NotificationProvider';
import { Alert } from '@/lib/neuromorphic/alert-system';

/**
 * Site header with navigation and alert notifications
 */
const SiteHeader: React.FC = () => {
  const location = useLocation();
  const { alertSystem } = useNotifications();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (alertSystem) {
      // Initial fetch of active alerts
      setActiveAlerts(alertSystem.getActiveAlerts());
      
      // Subscribe to active alerts updates
      const subscription = alertSystem.subscribeToActiveAlerts((alerts) => {
        setActiveAlerts(alerts);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [alertSystem]);
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/threat-library', label: 'Threat Library', icon: <Shield className="h-5 w-5" /> },
    { href: '/neural-architecture', label: 'Neural Architecture', icon: <Brain className="h-5 w-5" /> },
    { href: '/alerts', label: 'Alerts', icon: <Bell className="h-5 w-5" /> },
    { href: '/ai-assistant', label: 'AI Assistant', icon: <Bot className="h-5 w-5" /> },
    { href: '/ai-security', label: 'AI Security', icon: <Zap className="h-5 w-5" /> },
    { href: '/documentation', label: 'Documentation', icon: <FileText className="h-5 w-5" /> },
  ];
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="KenshiBrainWatch Logo" className="h-8 w-8" />
            <span className="font-bold">KenshiBrainWatch</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.href === '/alerts' && activeAlerts.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* Mobile navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="ml-auto">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col space-y-4 mt-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center py-2 text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                  {item.href === '/alerts' && activeAlerts.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        {/* Alert indicator for desktop */}
        <div className="ml-auto hidden md:flex items-center space-x-2">
          <Link to="/alerts">
            <Button 
              variant={activeAlerts.length > 0 ? "destructive" : "ghost"} 
              size="sm"
              className="flex items-center"
            >
              <Bell className="h-4 w-4 mr-1" />
              {activeAlerts.length > 0 ? `${activeAlerts.length} Alert${activeAlerts.length !== 1 ? 's' : ''}` : 'Alerts'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
