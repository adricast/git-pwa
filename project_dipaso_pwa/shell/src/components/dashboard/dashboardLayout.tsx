// -------------------------------------------------------------------------
// 🚨 ÚNICO CAMBIO REQUERIDO: Importación del tipo Auth
// -------------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate, Outlet, useLocation } from "react-router-dom"; 
import {
    FaBars, FaAngleLeft, FaAngleRight, FaHome,
    FaFileInvoiceDollar, FaCashRegister,
    FaBoxOpen, FaClipboardCheck, 
    FaCog, FaBell,FaUsers
} from "react-icons/fa";

// 🚨 CAMBIO CLAVE: Importamos las funciones (logout, getAuthenticatedUser) Y el TIPO (Auth) 
// usando la sintaxis `type` desde el módulo federado Authorizer.
import { logout, getAuthenticatedUser, type Auth } from "authorizer/authExports"; // ✅ CORREGIDO
// ❌ Se ELIMINA la línea de abajo, que usaba el modelo local:
// import type { Auth } from "../../models/api/authModel"; 

import Nav, { type NavItem } from "./navbar2Layout";
import "./../styles/dashboardnav2Layout.sass";

// ... (El resto de las importaciones se mantiene igual)
import { MasterPasswordProvider } from "./../../components/masterpassword/masterpasswordprovider"; 
import MasterPasswordLayout from "./../../components/layouts/masterpasswordLayout"; 
import { useMasterPassword } from "./../../components/masterpassword/usemasterpasswordcontext"; 
import NotificationDropdown from "./../layouts/notificationdrowdownLayout";
import { NotificationProvider } from "./../notifications/notificationprovider";
import { useNotification } from "./../notifications/notificationhooks"; 
import { hostWS } from "./../../ws/hostSocket"; 
import { v4 as uuidv4 } from 'uuid'; 
import Breadcrumbs from './../layouts/breadcrumbsLayout'; 
import { type BreadcrumbItem } from './../breadcrumb/interface';
import { onNetworkChange, networkState } from './../../hooks/sensors/networkSensor'; 

// ... (El resto del código es funcional y se mantiene)
const branches = [
    { id: "03", name: "Mall del Sur", code: "03" }, 
    { id: "04", name: "San Marino", code: "04" }, 
    { id: "05", name: "Recreo", code: "05" }, 
];

const defaultMenuItems: NavItem[] = [
    { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
    { label: "Facturación", path: "/dashboard/billing", icon: <FaFileInvoiceDollar /> },
    { label: "Caja", path: "/dashboard/cash", icon: <FaCashRegister /> },
    { label: "Inventario", path: "/dashboard/inventory", icon: <FaBoxOpen /> },
    { label: "Auditoría", path: "/dashboard/audit", icon: <FaClipboardCheck /> },
    { label: "Clientes", path: "/dashboard/client", icon: <FaUsers/> },
    { label: "Administración", path: "/dashboard/admin", icon: <FaCog /> },
];

interface DashboardLayoutProps {
    menuItems?: NavItem[];
}

export interface DashboardContext {
    user: Auth | null; 
    userName: string;
    selectedBranch: string;
    branches: { id: string; name: string }[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ menuItems }) => {
    return (
        <MasterPasswordProvider>
            <NotificationProvider>
                <DashboardContent menuItems={menuItems} />
            </NotificationProvider>
        </MasterPasswordProvider>
    );
};

interface ConnectionIndicatorProps {
    isConnected: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ isConnected }) => {
    const color = isConnected ? '#059669' : '#dc3545';
    const titleText = isConnected ? 'Conectado' : 'Desconectado';

    return (
        <div 
            className="connection-indicator-led"
            title={titleText} 
            style={{
                '--indicator-color': color,
                position: 'absolute',
                bottom: '0px', 
                right: '0px', 
            } as React.CSSProperties} 
        >
        </div>
    );
};


const DashboardContent: React.FC<DashboardLayoutProps> = ({ menuItems }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const { addNotification } = useNotification(); 
    const { requestAuthorization } = useMasterPassword(); 

    const [exitAuthorized, setExitAuthorized] = useState(false); 
    
    const [isNetworkOnline, setIsNetworkOnline] = useState(networkState.isOnline);
    const [isServerAvailable, setIsServerAvailable] = useState(networkState.serverOnline);
    
    const isConnected = isNetworkOnline && isServerAvailable;

    const [userPhotoUrl] = useState(
    "/assets/users/default.png" 
    );
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [authenticatedUser, setAuthenticatedUser] = useState<Auth | null>(null);
    const itemsToRender = menuItems && menuItems.length > 0 ? menuItems : defaultMenuItems;

    const toggleSidebar = () => setSidebarVisible(prev => !prev);
    const toggleCollapse = () => setIsCollapsed(prev => !prev);
    const toggleUserMenu = () => setShowUserMenu(prev => !prev);

    // Lógica de Red/Servidor
    useEffect(() => {
        const unsubscribe = onNetworkChange(
            () => setIsNetworkOnline(true),
            () => setIsNetworkOnline(false),
            () => setIsServerAvailable(true),
            () => setIsServerAvailable(false)
        );
        return () => unsubscribe();
    }, []); 

    
    // Lógica de Logout
    const onLogout = useCallback(() => {
        const MASTER_KEY_LOGOUT = authenticatedUser?.username === 'admin' ? "ADM_123" : "USER_LOGOUT"; 
        const logoutAction = async () => {
            console.log("Autorización concedida. Cerrando sesión...");
            await logout(); 
            navigate("/login");
        };
        const failureAction = () => {
            console.log("Fallo de autenticación en el cierre de sesión.");
        };
        requestAuthorization(
            "Autorización para Cierre de Sesión Maestro",
            MASTER_KEY_LOGOUT,
            logoutAction, 
            failureAction 
        );
    }, [requestAuthorization, navigate, authenticatedUser]);

    // Autorización para cerrar la aplicación
    const requestExitAuthorization = useCallback((): Promise<boolean> => { 
        const EXIT_PASSWORD = authenticatedUser?.username === 'admin' ? "ADM_EXIT_456" : "USER_EXIT_789";

        return new Promise<boolean>((resolve) => {
            const successAction = async () => { 
                console.log("Autorización concedida para cerrar aplicación");
                setExitAuthorized(true);
                resolve(true);
            };
            const failureAction = async () => { 
                console.log("Autorización denegada para cerrar aplicación");
                setExitAuthorized(false);
                resolve(false);
            };
            requestAuthorization(
                "Autorización para Cerrar Aplicación",
                EXIT_PASSWORD,
                successAction, 
                failureAction 
            );
        });
    }, [requestAuthorization, authenticatedUser]);


    // Manejo de beforeunload (Cierre de aplicación)
    useEffect(() => {
        const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
            if (exitAuthorized) {
                setExitAuthorized(false); 
                return; 
            }
            event.preventDefault();
            event.returnValue = "¿Está seguro de que desea salir? Se requiere autorización para cerrar la aplicación.";
            await requestExitAuthorization();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [exitAuthorized, requestExitAuthorization]); 

    // Manejo de atajos de teclado (Ctrl+W, F5, etc.)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
                e.preventDefault();
                e.stopPropagation();

                requestExitAuthorization().then(authorized => {
                    if (authorized) {
                        window.close();
                    }
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [requestExitAuthorization]);


    // Efecto para cargar el usuario (Autenticación)
    useEffect(() => {
        const loadUser = async () => {
            try {
                // 🚨 Usa la función federada 'getAuthenticatedUser'
                const user = await getAuthenticatedUser(); 
                console.log("🟢 Usuario cargado de authService:", user); 
                if (user) {
                    setAuthenticatedUser(user);
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error al cargar el usuario:", error);
                navigate("/login");
            } finally {
                setIsLoading(false); 
            }
        };
        loadUser();
    }, [navigate]);

    // Conexión y suscripción al WebSocket
    useEffect(() => {
        try {
            interface WebSocketMessage {
                type: string;
                payload: Record<string, unknown>;
            }

            const unsubscribe = hostWS.subscribe((msg: WebSocketMessage) => {
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

    // Lógica del Breadcrumb
    const routeLabels: Record<string, string> = {
        dashboard: "Inicio", billing: "Facturación", cashregister: "Caja",
        inventary: "Inventario", audit: "Auditoría", report: "Reportes",
        admin: "Administración", groups: "Grupos de Usuarios", usermanagement: "Gestión de Usuarios",
        client: "Clientes" 
    };

    const pathParts = location.pathname.split("/").filter(Boolean);
    
    if (isLoading) {
        return (
            <div 
                className="dashboard-loading-screen" 
                style={{ 
                    height: '100vh', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    fontSize: '1.2rem',
                    color: '#34495e'
                }}
            >
                Cargando sesión de usuario...
            </div>
        );
    }
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
                    userName={authenticatedUser?.username || "Usuario"}
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
                                
                                style={{ cursor: "pointer", width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                            <ConnectionIndicator isConnected={isConnected} />

                            <span
                                onClick={toggleUserMenu}
                                style={{ cursor: "pointer", marginRight: "0.5rem" }}
                            >
                                {authenticatedUser?.username || "Usuario"}
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
                                        onClick={() => console.log("Ver perfil")}
                                    >
                                        Perfil
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        style={{ width: "100%", padding: "0.5rem 1rem", textAlign: "left" }}
                                        onClick={() => console.log("Configuración")}
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

                        <NotificationDropdown icon={<FaBell />} label="Notificaciones" pageSize={5} />
                    </div>
                </header>

                <main className="dashboard-main">
                    <Outlet
                        context={{
                            user: authenticatedUser, 
                            userName: authenticatedUser?.username || "Usuario",
                            selectedBranch: "03", 
                            branches,
                        }as DashboardContext}
                    />
                </main>
            </div>
            
            <MasterPasswordLayout /> 

        </div>
    );
};

export default DashboardLayout;