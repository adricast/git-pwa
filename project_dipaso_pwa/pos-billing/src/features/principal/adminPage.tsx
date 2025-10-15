// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// Importamos los íconos específicos de POS Billing
import { 
    FaPlusCircle,      // Nueva Factura
    FaGift,            // Giftcard
    FaUndo,            // Devolución
    FaPrint,           // Reimprimir
    FaBullhorn,        // Promociones
    FaCog              // Configuración
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.sass";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
 const location = useLocation();
 const currentPath = location.pathname.toLowerCase();

 // Verificamos si estamos en la ruta base de la APLI ACIÓN (Billing/Facturación)
 const isBaseRoute = 
 currentPath === "/" || 
 currentPath === "/dashboard/billing" ||
 currentPath === "/dashboard/billing/";

 // Mostramos el menú si estamos en la ruta base
 const showMenu = isBaseRoute; 
 const cardSize = 150;

 return (
 <ScreenContainerProvider>
 <div className="page-container">

 {showMenu && (
 <div className="menu-grid">
 <Link to="newinvoice">
 <OptionCard
 // ✅ CORREGIDO: Nueva Factura
 label="Nueva Factura" 
 icon={<FaPlusCircle size={30} />}
 color="#3c3c3c"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <Link to="giftcard">
 <OptionCard
// ✅ CORREGIDO: Emisión Giftcard
 label="Emisión Giftcard"
 icon={<FaGift size={30} />}
 color="#5d3596"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <Link to="return">
 <OptionCard
 // ✅ CORREGIDO: Devolución
 label="Devolución"
 icon={<FaUndo size={30} />}
 color="#b03f8e"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <Link to="reprint">
 <OptionCard
 // ✅ CORREGIDO: Reimprimir Factura
 label="Reimprimir Factura"
 icon={<FaPrint size={30} />}
 color="#1d4781"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <Link to="promotions">
 <OptionCard
 // ✅ CORREGIDO: Promociones
 label="Promociones"
 icon={<FaBullhorn size={30} />} 
 color="#1c6844"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <OptionCard
 // ✅ CORREGIDO: Configuración (Deshabilitado)
 label="Configuración"
 icon={<FaCog size={30} />} 
 color="#6b7280"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 disabled
 />
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