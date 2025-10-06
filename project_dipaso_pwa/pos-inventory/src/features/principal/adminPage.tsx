// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// ✅ CORREGIDO: Importamos los íconos específicos para INVENTARIO
import { 
    FaBoxes,        // Inventario/Productos
    FaExchangeAlt   // Transferencia de Mercadería
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.scss";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
 const location = useLocation();
 const currentPath = location.pathname.toLowerCase();

 // ✅ RUTA: Verificamos si estamos en la ruta base de INVENTARIO
 const isBaseRoute = 
 currentPath === "/" || 
 currentPath === "/dashboard/inventory" || // Ruta de Inventario
 currentPath === "/dashboard/inventory/";

// Mostramos el menú si estamos en la ruta base
const showMenu = isBaseRoute; 
const cardSize = 150;

return (
<ScreenContainerProvider>
<div className="page-container">

{showMenu && (
<div className="menu-grid">
{/* ✅ ACTUALIZADO: INVENTARIO */}
<Link to="products"> 
<OptionCard
label="Inventario/Productos" 
icon={<FaBoxes size={30} />} 
color="#3c3c3c"
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>
{/* ✅ ACTUALIZADO: TRANSFERENCIA DE MERCADERÍA */}
<Link to="transfer"> 
<OptionCard
label="Transferencia de Mercadería"
icon={<FaExchangeAlt size={30} />} // Ícono de intercambio o movimiento
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