// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// ✅ CORREGIDO: Importamos los íconos específicos de GESTIÓN DE CLIENTES
import { 
    FaUserPlus,     // Crear Cliente
    FaChartLine     // Perfil Cliente / Análisis/Historial
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.sass";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
 const location = useLocation();
 const currentPath = location.pathname.toLowerCase();

 // ✅ CORREGIDO: Verificamos si estamos en la ruta base de CLIENTES
 const isBaseRoute = 
 currentPath === "/" || 
 currentPath === "/dashboard/client" ||
 currentPath === "/dashboard/client/";

// Mostramos el menú si estamos en la ruta base
const showMenu = isBaseRoute; 
const cardSize = 150;

return (
<ScreenContainerProvider>
<div className="page-container">

{showMenu && (
<div className="menu-grid">
{/* ✅ ACTUALIZADO: CREAR CLIENTE */}
<Link to="createclient">
<OptionCard
label="Crear Cliente" 
icon={<FaUserPlus size={30} />} 
color="#3c3c3c"
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>
{/* ✅ ACTUALIZADO: PERFIL CLIENTE con FaChartLine */}
<Link to="clientprofile">
<OptionCard
label="Perfil Cliente"
icon={<FaChartLine size={30} />}
color="#5d3596"
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>
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