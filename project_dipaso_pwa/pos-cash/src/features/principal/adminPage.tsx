// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// Importamos los íconos específicos de Gestión de Clientes
import { 
  
    FaLockOpen,     // Apertura de Caja
    FaLock,         // Cierre de Caja
    FaFileInvoiceDollar,   // Perfil Cliente / Información
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.sass";
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

{/* 🟢 NUEVA OPCIÓN 1: Apertura de Caja */}
<Link to="opencash">
<OptionCard
label="Apertura de Caja" // Etiqueta para la Apertura
icon={<FaLockOpen size={30} />} // Icono de Candado Abierto
color="#28a745" // Color verde para una acción de inicio
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>

{/* 🟢 NUEVA OPCIÓN 2: Cierre de Caja */}
<Link to="closecash">
<OptionCard
label="Cierre de Caja" // Etiqueta para el Cierre
icon={<FaLock size={30} />} // Icono de Candado Cerrado
color="#dc3545" // Color rojo para una acción de finalización
size={cardSize}
textColor="#ffffff"
iconColor="#ffffff"
/>
</Link>

{/* 🟢 NUEVA OPCIÓN 3: Cuentas por Cobrar */}
<Link to="accountsreceivable">
<OptionCard
label="Cuentas por Cobrar" // Etiqueta para Cuentas por Cobrar
icon={<FaFileInvoiceDollar size={30} />} // Icono de Factura con Dólar
color="#5d3596" // Color distintivo para finanzas
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