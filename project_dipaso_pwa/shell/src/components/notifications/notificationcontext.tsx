// src/context/notificationcontext.ts
import { createContext } from "react";
import type { Notification } from "./interface";

export interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (ids: string[]) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);
