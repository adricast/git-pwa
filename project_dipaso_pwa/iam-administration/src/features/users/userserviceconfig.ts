// 📁 src/features/users/userserviceconfig.ts

// ======================================================================
// 1. IMPORTACIONES
// ======================================================================

import type { UserModel } from "../../models/api/userModel";

// Importamos todas las funciones del servicio real
import {
   getAllUsers,
   getUserByUuid,
   softDeleteUserMassive,
   createUser as createUserApi,
   updateUser as updateUserApi,
   type UserCreationPayload,
   type UserUpdatePayload,
} from "../../services/api/usersServises";


// ----------------------------------------------------------------------
// 2. TIPOS AUXILIARES: (Reexportamos los tipos importados)
// ----------------------------------------------------------------------

// Exportamos los tipos de payload importados del servicio
export type { UserCreationPayload, UserUpdatePayload };

/**
 * Interfaz que define la estructura de los servicios CRUD de Usuarios.
 */
export interface UserServiceConfig {
   /** Obtiene todos los usuarios (activos o todos). */
   getAllUsers: (activeOnly?: boolean) => Promise<UserModel[]>;

   /** Consulta los detalles de un usuario por su UUID. */
   getUserByUuid: (userId: string) => Promise<UserModel>;

   /** Realiza la eliminación lógica masiva (Soft Delete). */
   softDeleteUserMassive: (userIds: string[], updatedByUserId: string) => Promise<{ message: string; count: number; }>;

   /** Crea un nuevo usuario. */
   createUser: (userData: UserCreationPayload, createdByUserId: string) => Promise<UserModel>;

   /** Actualiza un usuario existente. */
   updateUser: (userId: string, updatedByUserId: string, userPatch: UserUpdatePayload) => Promise<UserModel>;
}

// ----------------------------------------------------------------------
// 🟢 IMPLEMENTACIÓN REAL (Delegación al servicio API)
// ----------------------------------------------------------------------

/**
 * 🟢 Objeto de Configuración de Servicios para Usuarios
 * Implementa la interfaz UserServiceConfig delegando la ejecución al servicio API.
 */
export const userServiceConfig: UserServiceConfig = {

   // Lectura
   getAllUsers: getAllUsers,
   getUserByUuid: getUserByUuid,

   // Escritura
   softDeleteUserMassive: softDeleteUserMassive,
   createUser: createUserApi,
   updateUser: updateUserApi,
};
