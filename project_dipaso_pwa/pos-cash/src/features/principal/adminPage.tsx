// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// Importamos los íconos específicos de Gestión de Clientes
import { 
    FaUserPlus,     // Crear Cliente
    FaIdCard        // Perfil Cliente / Información
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.scss";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
const location = useLocation();
const currentPath = location.pathname.toLowerCase();

// Verificamos si estamos en la ruta base de CAJA
const isBaseRoute = 
currentPath === "/" || 
currentPath === "/dashboard/cash" ||
currentPath === "/dashboard/cash/";

// Mostramos el menú si estamos en la ruta base
const showMenu = isBaseRoute; 
const cardSize = 150;

return (
<ScreenContainerProvider>
<div className="page-container">

{showMenu && (
<div className="menu-grid">
<Link to="createclient">
<OptionCard
// ✅ CORREGIDO: Crear Cliente
label="Crear Cliente" 
icon={<FaUserPlus size={30} />} // Icono para añadir usuario
color="#3c3c3c"
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>
<Link to="clientprofile">
<OptionCard
// ✅ CORREGIDO: Perfil Cliente
label="Perfil Cliente"
icon={<FaIdCard size={30} />} // Icono para identificación o perfil
color="#5d3596"
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>
 {/* Solo se muestran las 2 tarjetas de clientes */}
</div>
)}

{/* El componente de ruta anidada se renderizará en el Outlet */}
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