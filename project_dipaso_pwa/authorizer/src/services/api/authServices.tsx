import { api } from "./api";
import { authRouteApi } from "../../configurations/routes/apiRoutes"; // authRouteApi.login es "/auth/token"
import { authSensor } from "../../hooks/sensors/authSensor";
import { AuthRepository } from "../../db/authRepository";
import { syncUserToken } from "../../workers/syncAuthWorker"; 

import type { Auth } from "../../models/api/authModel";
import type { Token } from "../../models/api/tokenModel";
import {} from "../../configurations/routes/appRoutes"; // Importación de rutas de aplicación

const authRepo = new AuthRepository();

// Claves de almacenamiento local para IndexedDB
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Función auxiliar para calcular la marca de tiempo de expiración (en milisegundos)
function calculateExpiration(expiresInSeconds: number): number {
    return Date.now() + expiresInSeconds * 1000;
}

// ----------------------------------------------------
// 1. INTERFAZ para tipar explícitamente el authService
// ----------------------------------------------------
interface IAuthService {
    login: (username: string, password: string) => Promise<
        | { success: true; user: Auth; message?: undefined }
        | { success: false; message: string; user?: undefined }
    >;
    logout: () => Promise<void>;
    getAuthenticatedUser: () => Promise<Auth | null>;
}


// ----------------------------------------------------
// IMPLEMENTACIÓN del Servicio de Autenticación
// ----------------------------------------------------

/**
 * Función de inicialización: Verifica el token guardado localmente al cargar la app.
 */
export async function initAuthService() {
    // 1. Intentar obtener el ACCESS_TOKEN
    const accessToken = await authRepo.getToken(ACCESS_TOKEN_KEY);

    if (!accessToken) {
        console.log("⚠️ No hay Access Token guardado.");
        authSensor.failure(new Error("No hay token"));
        return;
    }

    // 2. Revisar expiración del ACCESS_TOKEN
    if (Date.now() > accessToken.expiresAt) {
        console.log("⚠️ Access Token expirado. Se intentará la renovación...");
        authSensor.failure(new Error("Token expirado"));
        
        // 💡 NOTA: syncUserToken() es el encargado de la lógica de renovación.
        // Si falla, el sensor registrará el error.
        await syncUserToken(); 
        return;
    }

    // Si el token es válido localmente, se considera autenticado
    console.log("✅ Access Token válido, sesión activa offline.");
    
    // Buscar la entidad Auth asociada (necesario para authSensor.itemSynced)
    const user = await authService.getAuthenticatedUser();
    if (user) {
        authSensor.itemSynced(user);
    } else {
        // Si el token existe pero no el usuario Auth (inconsistencia), forzar logout para limpieza
        await authRepo.deleteToken(ACCESS_TOKEN_KEY);
        await authRepo.deleteToken(REFRESH_TOKEN_KEY);
        authSensor.failure(new Error("Token existe pero no usuario Auth"));
        return;
    }

    // Intentar sincronizar (renovar token) si hay conexión y el token está cerca de expirar.
    if (navigator.onLine && (accessToken.expiresAt - Date.now() < (5 * 60 * 1000))) { // Si expira en menos de 5 min
        await syncUserToken();
    }
}

export const authService: IAuthService = {
    
    login: async (username: string, password: string) => {
        try {
            // Tipo de respuesta de la API de tokens
            const response = await api.post<{
                access_token: string;
                refresh_token: string;
                token_type: string;
                expires_in: number;
            }>(
                authRouteApi.login,
                { 
                    // 🔑 Payload de Autenticación
                    grant_type: "password",
                    username,
                    password 
                }
            );

            const { access_token, refresh_token, expires_in } = response.data;
            
            if (!access_token || !refresh_token) {
                throw new Error("Respuesta de token incompleta");
            }
            
            // ⚠️ TEMPORAL: Asumimos aut_id = 1. Debe venir de la decodificación del JWT o endpoint /me.
            const aut_id = 1; 

            // 1. Guardar ACCESS_TOKEN
            const accessTokenEntity: Token = {
                id: ACCESS_TOKEN_KEY, // PK para IndexedDB
                key: ACCESS_TOKEN_KEY, // Distinción interna (keyPath)
                aut_id: aut_id,
                token: access_token,
                expiresAt: calculateExpiration(expires_in),
                syncStatus: "synced",
            };
            await authRepo.saveToken(accessTokenEntity);

            // 2. Guardar REFRESH_TOKEN (Se usa una expiración más larga, ej: 30 días)
            const refreshTokenEntity: Token = {
                id: REFRESH_TOKEN_KEY,
                key: REFRESH_TOKEN_KEY,
                aut_id: aut_id,
                token: refresh_token,
                // Expira_in * 30 días (asumiendo que el RT dura 30 veces más que el AT)
                expiresAt: calculateExpiration(expires_in * 30), 
                syncStatus: "synced",
            };
            await authRepo.saveToken(refreshTokenEntity);
            
            // 3. Crear/Guardar la Entidad Auth (Usuario de Sesión)
            const user: Auth = { aut_id, username, syncStatus: "synced" }; 
            await authRepo.saveAuth(user);

            authSensor.itemSynced(user);
            return { success: true, user };

        } catch (error) {
            console.error("❌ Login fallido:", error);
            authSensor.itemFailed({} as Auth, error);
            return { success: false, message: "Credenciales inválidas o error de red" };
        }
    },

    // -----------------------
    // LOGOUT
    // -----------------------
    logout: async () => {
        try {
            // 1. Limpieza de tokens locales
            await authRepo.deleteToken(ACCESS_TOKEN_KEY);
            await authRepo.deleteToken(REFRESH_TOKEN_KEY);
            
            // 2. Intentar eliminar la entidad Auth (asume que el aut_id es 1 o lo busca antes)
            // Ya que solo guardamos 1 usuario a la vez, se asume que el ID de la sesión activa es 1.
            await authRepo.deleteAuth(1); 
            
            authSensor.emit("itemDeleted", 0); 
        } catch (error) {
            authSensor.failure(error);
        }
    },


    // -----------------------
    // GET AUTHENTICATED USER
    // -----------------------
    getAuthenticatedUser: async () => {
        try {
            // Asume que solo hay un usuario Auth activo a la vez
            const users = await authRepo.getAllAuths(); 
            if (users.length > 0) {
                return users[0] as Auth; 
            }
            return null;
        } catch (error) {
            console.error("❌ Error al obtener usuario autenticado:", error);
            return null;
        }
    },
};