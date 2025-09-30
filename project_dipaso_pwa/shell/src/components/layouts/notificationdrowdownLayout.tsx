import React, { useState, useEffect } from "react";
import { useNotification } from "./../notifications/usenotification";
import "./../styles/notificationdrowdownLayout.scss"; // 👈 Importar SCSS

interface NotificationDropdownProps {
  pageSize?: number;
  label?: string;
  icon?: React.ReactNode;
}

// Función para formatear el mensaje de la notificación
const formatNotification = (n: any) => {
  switch (n.type) {
    case "GROUP_CREATED":
      // Revisar si group_name está en payload directo o dentro de otro objeto
      return `Se creó el grupo: ${n.payload?.group_name ?? n.payload?.payload?.group_name ?? "desconocido"}`;
    case "USER_REGISTERED":
      return `Nuevo usuario registrado: ${n.payload?.username ?? "desconocido"}`;
    case "ORDER_COMPLETED":
      return `Orden completada: ${n.payload?.order_id ?? "desconocido"}`;
    default:
      return `Notificación: ${n.type}`;
  }
};


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ pageSize = 5, icon  }) => {
  const { notifications, markAsRead } = useNotification();
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);

  const toggleDropdown = () => setVisible(prev => !prev);

  useEffect(() => {
    if (visible) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length) markAsRead(unreadIds);
    }
  }, [visible, notifications, markAsRead]);

  const paginated = notifications.slice(0, pageSize * page);
  const hasMore = notifications.length > paginated.length;

  return (
    <div className="notification-dropdown">
      <button className="notification-btn" onClick={toggleDropdown}>
        {icon} {/* Aquí solo se ve el icono */}
        {notifications.some(n => !n.read) && (
          <span className="badge">{notifications.filter(n => !n.read).length}</span>
        )}
      </button>

      {visible && (
        <div className="dropdown-menu">
          {paginated.length === 0 && <div className="no-notifications">No hay notificaciones</div>}

          {paginated.map(n => (
            <div key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`}>
              <strong>{n.type}</strong>
             {/* <div>{n.payload?.msg || JSON.stringify(n.payload)}</div>*/ }
             <div>{formatNotification(n)}</div>

              {n.timestamp && <small className="timestamp">{n.timestamp}</small>}
            </div>
          ))}

          {hasMore && (
            <button className="load-more-btn" onClick={() => setPage(prev => prev + 1)}>
              Cargar más
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
