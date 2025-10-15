// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OptionCard from "./../../components/layout/optioncardLayout";
// ✅ ACTUALIZADO: Importamos los íconos específicos de Auditoría/Caja
import { 
 FaBook,             // Bitácora (Registro)
 FaBalanceScale      // Arqueo de Caja (Balance/Conteo)
} from "react-icons/fa"; 

// 🟢 AÑADIDA: Importación del ScreenContainerProvider
import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; // Asegúrate de ajustar esta ruta

// Importamos los estilos SCSS
import "./adminPage.sass";
import ScreenContainerLayout from "../../components/layout/screencontainerLayout";

const AdminPage: React.FC = () => {
 const location = useLocation();
 const currentPath = location.pathname.toLowerCase();

 // ✅ RUTA: Verificamos si estamos en la ruta base de AUDITORÍA
 const isBaseRoute = 
 currentPath === "/" || 
 currentPath === "/dashboard/audit" ||
 currentPath === "/dashboard/audit/";

 // Mostramos el menú si estamos en la ruta base
 const showMenu = isBaseRoute; 
 const cardSize = 150;

 return (
 <ScreenContainerProvider>
 <div className="page-container">

 {showMenu && (
 <div className="menu-grid">
 <Link to="logbook"> {/* Ruta asumida para Bitácora */}
 <OptionCard
 // ✅ ACTUALIZADO: Bitácora
 label="Bitácora" 
 icon={<FaBook size={30} />}
 color="#3c3c3c"
 size={cardSize}
 textColor="#ffffff"
 iconColor="#ffffff"
 />
 </Link>
 <Link to="cashcount"> {/* Ruta asumida para Arqueo de Caja */}
 <OptionCard
// ✅ ACTUALIZADO: Arqueo de Caja
 label="Arqueo de Caja"
 icon={<FaBalanceScale size={30} />}
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