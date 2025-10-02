// src/components/dashboard/DashboardLayout.tsx (VERSIÓN DEFINITIVA Y SIN SCREEN CONTAINER)

import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate, Outlet, useLocation } from "react-router-dom"; 
import {
    FaBars, FaAngleLeft, FaAngleRight, FaHome,
    FaFileInvoiceDollar, FaCashRegister,
    FaBoxOpen, FaClipboardCheck, FaChartLine,
    FaCog, FaBell
} from "react-icons/fa";
import { authService } from "../../services/authServices";
import type { Auth } from "../../models/api/authModel"; 
import Nav, { type NavItem } from "./navbarLayout";
import "./../styles/dashboardLayout.scss";

// 🟢 CONTEXTOS GLOBALES (Shell)
import { MasterPasswordProvider } from "./../../components/masterpassword/masterpasswordprovider"; 
import MasterPasswordLayout from "./../../components/layouts/masterpasswordLayout"; // Layout del modal
import { useMasterPassword } from "./../../components/masterpassword/usemasterpasswordcontext"; // Hook para usarlo

// Notificaciones (Contexto y Dropdown)
import NotificationDropdown from "./../layouts/notificationdrowdownLayout";
import { NotificationProvider } from "./../notifications/notificationprovider";
import { useNotification } from "./../notifications/notificationhooks"; 
import { hostWS } from "./../../ws/hostSocket"; 
import { v4 as uuidv4 } from 'uuid'; 

// 🎯 Breadcrumbs
import Breadcrumbs from './../layouts/breadcrumbsLayout'; 
import { type BreadcrumbItem } from './../breadcrumb/interface';

// ❌ Eliminadas importaciones de ScreenContainer

const branches = [
    { id: "03", name: "Mall del Sur" },
    { id: "04", name: "San Marino" },
    { id: "05", "name": "Recreo" },
];

const defaultMenuItems: NavItem[] = [
    { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
    { label: "Facturación", path: "/dashboard/billing", icon: <FaFileInvoiceDollar /> },
    { label: "Caja", path: "/dashboard/cashregister", icon: <FaCashRegister /> },
    { label: "Inventario", path: "/dashboard/inventary", icon: <FaBoxOpen /> },
    { label: "Auditoría", path: "/dashboard/audit", icon: <FaClipboardCheck /> },
    { label: "Reportes", path: "/dashboard/report", icon: <FaChartLine /> },
    { label: "Administración", path: "/dashboard/admin", icon: <FaCog /> },
];

interface DashboardLayoutProps {
    menuItems?: NavItem[];
}

// 🔑 1. WRAPPER: Proveedores que deben ser globales para toda la Shell
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ menuItems }) => {
    return (
        <MasterPasswordProvider>
            <NotificationProvider>
                <DashboardContent menuItems={menuItems} />
            </NotificationProvider>
        </MasterPasswordProvider>
    );
};

// 2. CONTENIDO: Componente principal que usa los contextos y renderiza el contenido
const DashboardContent: React.FC<DashboardLayoutProps> = ({ menuItems }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    // 🔑 Hooks para consumir los contextos
    const { addNotification } = useNotification(); 
    const { requestAuthorization } = useMasterPassword(); 

    const [authenticatedUser, setAuthenticatedUser] = useState<Auth | null>(null);
    const [userPhotoUrl] = useState(
        "https://www.dropbox.com/scl/fi/1sg0k9814ewulaq4xz97b/desarrollomovil2.png?raw=1"
    );
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const itemsToRender = menuItems && menuItems.length > 0 ? menuItems : defaultMenuItems;

    const toggleSidebar = () => setSidebarVisible(prev => !prev);
    const toggleCollapse = () => setIsCollapsed(prev => !prev);
    const toggleUserMenu = () => setShowUserMenu(prev => !prev);


    // 🔑 LÓGICA DE CIERRE SEGURO CON CLAVE MAESTRA
    const onLogout = useCallback(() => {
        // Define la clave maestra que debe ingresar el usuario
        const MASTER_KEY_LOGOUT = authenticatedUser?.aut_username === 'admin' ? "ADM_123" : "USER_LOGOUT"; 

        const logoutAction = async () => {
            console.log("Autorización concedida. Cerrando sesión...");
            await authService.logout();
            navigate("/login");
        };

        const failureAction = () => {
             console.log("Fallo de autenticación en el cierre de sesión.");
        };

        // Abre el modal de clave maestra
        requestAuthorization(
            "Autorización para Cierre de Sesión Maestro",
            MASTER_KEY_LOGOUT,
            logoutAction, // Acción de éxito
            failureAction // Acción de fallo
        );
    }, [requestAuthorization, navigate, authenticatedUser]);


    // Efecto para cargar el usuario (autenticación)
    useEffect(() => {
        const loadUser = async () => {
            const user = await authService.getAuthenticatedUser();
            if (user) setAuthenticatedUser(user);
            else navigate("/login");
        };
        loadUser();
    }, [navigate]);

    // 🔑 BLOQUE CLAVE: Conexión y suscripción al WebSocket
    useEffect(() => {
        try {
            hostWS.connect("ws://127.0.0.1:8001");

            const unsubscribe = hostWS.subscribe((msg: any) => {
                console.log("📩 Notificación recibida del WS:", msg);

                addNotification({
                    id: uuidv4(),
                    type: msg.type || "GENERIC",
                    payload: msg,
                    read: false,
                    timestamp: new Date().toISOString()
                });
            });

            return () => {
                unsubscribe();
                hostWS.close();
            };
        } catch (error) {
            console.error("❌ Error al conectar o suscribirse al WebSocket:", error);
        }
    }, [addNotification]);

    // 🔑 LÓGICA DINÁMICA DEL BREADCRUMB
    const routeLabels: Record<string, string> = {
        dashboard: "Inicio", billing: "Facturación", cashregister: "Caja",
        inventary: "Inventario", audit: "Auditoría", report: "Reportes",
        admin: "Administración", groups: "Grupos de Usuarios", usermanagement: "Gestión de Usuarios",
    };

    const pathParts = location.pathname.split("/").filter(Boolean);
        useEffect(() => {
        // 1. Capturar el evento de Cierre de Ventana/Pestaña (incluye Alt + F4)
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Activa el cuadro de diálogo de advertencia nativo del navegador
            event.preventDefault(); 
            event.returnValue = "¡Advertencia! Perderá la sesión activa si cierra la ventana.";
        };

        // 2. Capturar eventos de teclado para bloquear recargas y cierre de pestañas
        const disableKeyCombos = (e: KeyboardEvent) => {
            // Bloquear F5 (recargar) y Ctrl + R (recargar)
            if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
                 e.preventDefault();
                 e.stopPropagation(); // Prevenir propagación
            }
            // Bloquear Ctrl + W (cerrar pestaña en algunos navegadores)
            if (e.ctrlKey && e.key.toLowerCase() === 'w') {
                e.preventDefault();
                e.stopPropagation();
            }
            // NOTA: Alt + F4 será manejado por handleBeforeUnload a nivel de OS.
        };

        // Agregar listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', disableKeyCombos);

        // Limpieza: Remover listeners cuando el componente se desmonte
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', disableKeyCombos);
        };
    }, []); // Se ejecuta solo una vez al montar
    const breadcrumbs: BreadcrumbItem[] = pathParts.map((part, idx) => {
        const url = "/" + pathParts.slice(0, idx + 1).join("/");
        const label =
            routeLabels[part.toLowerCase()] ||
            part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        return { label, url };
    });

    if (breadcrumbs.length === 0) {
        breadcrumbs.push({ label: "Inicio", url: "/dashboard" });
    }

    return (
        <div className="dashboard-container">
            {sidebarVisible && (
                <Nav
                    items={itemsToRender}
                    branches={branches}
                    userName={authenticatedUser?.aut_username || "Usuario"}
                    userPhotoUrl={userPhotoUrl}
                    onClose={() => setSidebarVisible(false)}
                    isVisible={sidebarVisible}
                />
            )}

            <div
                className={`dashboard-content ${
                    sidebarVisible ? (isCollapsed ? "collapsed" : "expanded") : "no-sidebar"
                }`}
            >
                <header className="dashboard-header">
                    <div className="header-left">
                        <button className="header-btn" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <button className="header-btn" onClick={toggleCollapse}>
                            {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                        </button>
                    </div>
                    
                    {/* 🎯 Breadcrumbs DINÁMICOS */}
                    <div className="header-center"> 
                        <Breadcrumbs 
                            items={breadcrumbs} 
                            activeColor="#059669"
                            textColor="#2c3e50" 
                        />
                    </div>

                    <div className="header-right">
                        <div className="user-menu-wrapper" style={{ position: "relative" }}>
                            <img
                                src={userPhotoUrl}
                                alt="Avatar"
                                className="avatar"
                                onClick={toggleUserMenu}
                                style={{ cursor: "pointer" }}
                            />
                            <span
                                onClick={toggleUserMenu}
                                style={{ cursor: "pointer", marginRight: "0.5rem" }}
                            >
                                {authenticatedUser?.aut_username || "Cargando..."}
                            </span>

                            {showUserMenu && (
                                <div
                                    className="user-dropdown"
                                    style={{
                                        position: "absolute", top: "100%", right: 0,
                                        background: "#fff", color: "#000", border: "1px solid #ddd",
                                        borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                        minWidth: "150px", zIndex: 100,
                                    }}
                                >
                                    <button
                                        className="dropdown-item"
                                        style={{ width: "100%", padding: "0.5rem 1rem", textAlign: "left" }}
                                        onClick={() => alert("Ver perfil")}
                                    >
                                        Perfil
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        style={{ width: "100%", padding: "0.5rem 1rem", textAlign: "left" }}
                                        onClick={() => alert("Configuración")}
                                    >
                                        Configuración
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        style={{ width: "100%", padding: "0.5rem 1rem", textAlign: "left" }}
                                        onClick={onLogout} 
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 🎯 COMPONENTE DE NOTIFICACIONES */}
                        <NotificationDropdown icon={<FaBell />} label="Notificaciones" pageSize={5} />
                    </div>
                </header>

                <main className="dashboard-main">
                    <Outlet
                        context={{
                            userName: authenticatedUser?.aut_username || "Usuario",
                            selectedBranch: "03", 
                            branches,
                        }}
                    />
                </main>
            </div>
            
            {/* 🔑 MODAL DE CLAVE MAESTRA: Se renderiza en la capa superior del Shell */}
            <MasterPasswordLayout /> 

        </div>
    );
};

export default DashboardLayout;