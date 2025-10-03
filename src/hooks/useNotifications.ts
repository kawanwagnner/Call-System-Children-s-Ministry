import { useState, useCallback } from 'react';
import { NotificationItem } from '../components/NotificationContainer';
import { NotificationType } from '../components/Notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: NotificationItem = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Funções de conveniência
  const showSuccess = useCallback((title: string, message?: string) => {
    return addNotification('success', title, message);
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string) => {
    return addNotification('error', title, message, 7000); // Erros ficam mais tempo
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    return addNotification('warning', title, message);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    return addNotification('info', title, message);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}