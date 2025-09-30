// src/context/NotificationProvider.tsx
import React, { useState, type ReactNode } from "react";
import { NotificationContext, type NotificationContextProps } from "./notificationcontext";
import type { Notification } from "./interface";

interface Props {
  children: ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (ids: string[]) => {
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  const value: NotificationContextProps = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
