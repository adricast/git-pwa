// src/components/notifications/interface.ts

export interface Notification {
  id: string;
  type: string;
  payload: any;
  read?: boolean;
  timestamp?: string;
}
