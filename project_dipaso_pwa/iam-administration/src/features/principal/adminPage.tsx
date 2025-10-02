// src/components/AdminPage.tsx

// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
import { FaUsers, FaUserFriends, FaUserPlus, FaBell, FaTags, FaCog } from "react-icons/fa";

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.scss";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // Verificamos si estamos en la ruta base de administración
  const isBaseRoute = 
    currentPath === "/" || 
    currentPath === "/dashboard/admin" ||
    currentPath === "/dashboard/admin/";

  // Mostramos el menú si estamos en la ruta base
  const showMenu = isBaseRoute; 
  const cardSize = 150;

  return (
    // 🟢 CAMBIO CLAVE: Envolvemos el contenido que usa el contexto
    <ScreenContainerProvider>
      <div className="page-container">
        
        {showMenu && (
          <div className="menu-grid">
             <Link to="user">
               <OptionCard
                 label="Gestión de Usuarios"
                 icon={<FaUsers size={30} />}
                 color="#3c3c3c"
                 size={cardSize}
                 textColor="#ffffff"
                 iconColor="#ffffff"
               />
             </Link>
             <Link to="usergroup">
               <OptionCard
                 label="Gestión de Grupos"
                 icon={<FaUserFriends size={30} />}
                 color="#5d3596"
                 size={cardSize}
                 textColor="#ffffff"
                 iconColor="#ffffff"
               />
             </Link>
             <Link to="assigngroups">
               <OptionCard
                 label="Asignar Grupos de Personas"
                 icon={<FaUserPlus size={30} />}
                 color="#b03f8e"
                 size={cardSize}
                 textColor="#ffffff"
                 iconColor="#ffffff"
               />
             </Link>
             <Link to="notifications">
               <OptionCard
                 label="Reglas de Notificación"
                 icon={<FaBell size={30} />}
                 color="#1d4781"
                 size={cardSize}
                 textColor="#ffffff"
                 iconColor="#ffffff"
               />
             </Link>
             <Link to="promotions">
               <OptionCard
                 label="Gestión de Promociones"
                 icon={<FaTags size={30} />}
                 color="#1c6844"
                 size={cardSize}
                 textColor="#ffffff"
                 iconColor="#ffffff"
               />
             </Link>
             <OptionCard
               label="Gestión de Roles"
               icon={<FaCog size={30} />}
               color="#6b7280"
               size={cardSize}
               textColor="#ffffff"
               iconColor="#ffffff"
               disabled
             />
          </div>
        )}

        {/* GroupManagement se renderizará en el Outlet */}
        {!showMenu && (
          <div className="outlet-container">
            <Outlet />
          </div>
        )}
          <ScreenContainerLayout />
      </div>
    </ScreenContainerProvider>
  );
};

export default AdminPage;
