// Importamos los elementos del origen: el sensor (directo) y la función/objeto de servicios
import { authService, initAuthService } from './services/authServices';
import { authSensor } from './hooks/sensors/authSensor'; 

// Re-exportamos el sensor y la función de inicialización directamente
export { authSensor, initAuthService };

// 🚨 CORRECCIÓN CLAVE: Extraemos las propiedades del objeto authService y las exportamos como funciones individuales.
// Esto resuelve el error de TypeScript y de ejecución en el Shell.
export const login = authService.login;
export const logout = authService.logout;
export const getAuthenticatedUser = authService.getAuthenticatedUser;

// (Opcional) Re-exportar el objeto authService completo por si otros módulos del Authorizer lo necesitan
export { authService };

