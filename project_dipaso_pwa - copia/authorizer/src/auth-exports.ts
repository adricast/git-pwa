import { authService, initAuthService } from './services/api/authServices';
import { authSensor } from './hooks/sensors/authSensor'; 

// Re-exportamos el sensor y la función de inicialización directamente
// Esto solo funcionará si initAuthService fue exportada en el archivo de origen.
export { authSensor, initAuthService };

// CORRECCIÓN CLAVE: Extraemos las propiedades del objeto authService y las exportamos como funciones individuales.
// Esto resuelve el error de TypeScript al usar métodos del servicio directamente.
export const login = authService.login;
export const logout = authService.logout;
export const getAuthenticatedUser = authService.getAuthenticatedUser;

// (Opcional) Re-exportar el objeto authService completo por si otros módulos lo necesitan
export { authService };