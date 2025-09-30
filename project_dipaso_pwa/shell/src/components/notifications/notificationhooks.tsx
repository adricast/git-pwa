// src/components/notifications/notificationHooks.ts
import { useContext } from "react";
import { NotificationContext } from "./notificationcontext";

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification debe usarse dentro de NotificationProvider");
  return context;
};
