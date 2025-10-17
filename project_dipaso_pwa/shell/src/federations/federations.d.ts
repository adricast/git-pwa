// src/federation/federation.d.ts
declare module "iamAdmin/*" {
  const content: any;
  export default content;
}

declare module "posBilling/*" {
  const content: any;
  export default content;
}
declare module "posCash/*" {
  const content: any;
  export default content;
}
declare module "posClients/*" {
  const content: any;
  export default content;
}
declare module "posInventory/*" {
  const content: any;
  export default content;
}
declare module "posAudit/*" {
  const content: any;
  export default content;
}
// -------------------------------------------------------------------------
// 2. DECLARACIONES ESPECÍFICAS PARA EL AUTHORIZER (Lógica y Componentes)
//    Esto resuelve el error Cannot find module 'authorizer/authExports'
// -------------------------------------------------------------------------

// Declaración para el componente LoginPage remoto
declare module "authorizer/LoginPage" {
    import { ComponentType } from 'react';
    const LoginPage: ComponentType<any>;
    export default LoginPage;
}

// Declaración para el módulo de lógica y funciones
declare module "authorizer/authExports" {

    /**
     * Define el tipo básico del sensor de eventos.
     */
    interface AuthSensor {
        on(event: string, listener: (...args: any[]) => void): void;
        off(event: string, listener: (...args: any[]) => void): void;
        emit(event: string, ...args: any[]): void;
    }

    // Nota: El tipo 'Auth' debe ser importable o definido en este archivo.
    // Para simplificar, asumimos que 'Auth' es el tipo que necesita.
    import type { Auth } from "../../models/api/authModel"; 

    export const authSensor: AuthSensor;
    
    // Funciones de control de sesión
    export const initAuthService: () => Promise<void>;
    export const login: (username: string, password: string) => Promise<any>;
    
    /**
     * Devuelve el objeto de usuario autenticado o null.
     */
    export const getAuthenticatedUser: () => Promise<Auth | null>;
    
    /**
     * Cierra la sesión del usuario.
     */
    export const logout: () => Promise<void>;
}