import React, { createContext, useContext, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AlertSystem } from '@/lib/neuromorphic/alert-system';
import { NotificationService } from '@/lib/notifications/notification-service';

interface NotificationContextType {
  notificationService: NotificationService | null;
  alertSystem: AlertSystem | null;
}

const NotificationContext = createContext<NotificationContextType>({
  notificationService: null,
  alertSystem: null,
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
  alertSystem: AlertSystem;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children,
  alertSystem 
}) => {
  const [notificationService, setNotificationService] = useState<NotificationService | null>(null);

  useEffect(() => {
    // Initialize notification service
    const service = NotificationService.getInstance(alertSystem);
    setNotificationService(service);

    return () => {
      // Cleanup
      service.destroy();
    };
  }, [alertSystem]);

  const contextValue = {
    notificationService,
    alertSystem
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {/* Sonner Toaster for notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { 
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)'
          },
          className: 'shadow-lg',
        }} 
        closeButton
        richColors
      />
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
