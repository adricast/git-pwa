// 📁 userPayloads.tsx o userModel.tsx

import type { PersonModel } from "./../../models/api/personModel";
import type {  AuthMethodModel} from "./../../models/api/authmethodModel";


/**
 * Define la estructura del payload para actualizar un usuario existente (PUT /user/{id}).
 * Todos los campos son opcionales (Partial) para permitir actualizaciones parciales.
 */
export interface UserUpdatePayload {
    // --- Campos de Usuario de Nivel Superior ---
    userName?: string;
    email?: string;
    isActive?: boolean;
    integrationCode?: string;

    // --- Detalles de la Persona (Actualización anidada) ---
    // Incluye solo los campos de Persona que quieres modificar
    people?: Partial<PersonModel>; 

    // --- Listas de Relaciones (Suelen reemplazar la lista completa o definir adiciones) ---
    // Los arrays pueden ser utilizados para añadir nuevos o modificar existentes (depende de la API).
    authMethods?: AuthMethodModel[];
    groupIds?: string[]; // IDs de grupos a asociar/reemplazar
    branchIds?: string[]; // IDs de sucursales a asociar/reemplazar

    // --- Campos de Auditoría (Críticos para el service) ---
    // Estos campos no se almacenan en la entidad, pero son pasados al service.
    updatedByUserId: string; 
}