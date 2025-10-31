// src/components/AdminPage.tsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
// Importamos FaUserEdit o FaUserCircle para Personas
import { FaUsers, FaUserFriends, FaUserPlus, FaBell, FaTags, FaUserCircle } from "react-icons/fa"; 
//import { ScreenContainerProvider } from "./../../components/screencontainer/screencontainerprovider"; 
import "./adminPage.sass";
//import ScreenContainerLayout from "../../components/layout/screencontainerLayout";
import { ScreenContainerProvider } from '@dipaso/design-system'; 
import { ScreenContainerLayout } from '@dipaso/design-system';
import '@dipaso/design-system/dist/styles/index.css'; // O .sass, dependiendo de cómo compile Vite
import OptionCard from "@dipaso/design-system/dist/components/layout/optioncardLayout";

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
        <ScreenContainerProvider>
            <div className="page-container">
                
                {showMenu && (
                    <div className="menu-grid">
                        
                       
                        <Link to="employ"> 
                            <OptionCard
                                label="Gestión de Empleados"
                                icon={<FaUserCircle size={30} />} // Usamos FaUserCircle o FaUserPlus
                                color="#28a745" // Verde para destacar
                                size={cardSize}
                                textColor="#ffffff"
                                iconColor="#ffffff"
                            />
                        </Link>
                       
                        
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