// 📁 src/models/iam/userModel.ts

import type { UserGroupModel } from "./userGroupModel"; // Asumo esta ruta
import type { BranchModel } from "./branchModel"; 
import type { AuthMethodModel } from "./authmethodModel";
import type { PolicyModel } from "./policyModel"; // Asumo esta ruta
import type { PersonModel } from "./personModel"; // Modelo Persona detallado

/**
 * Modelo completo del Usuario (IAM).
 * Refleja los campos de la cuenta y la relación con la persona asociada.
 */
export interface UserModel {
  // --- Campos de la Cuenta de Usuario ---
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  isLocked: boolean; // 🛑 isLocked es un campo de la raíz del JSON

  // --- Relación con Empleado/Persona ---
  // IMPORTANTE: User tiene employee_id que apunta a person_id en la tabla Person
  employeeId?: string; // FK a Person.personId

  // --- Relaciones Anidadas Opcionales (Arrays) ---
  groups?: UserGroupModel[];
  branchs?: BranchModel[]; // Nota: Usamos el BranchModel que ya tenías
  authMethods?: AuthMethodModel[];
  userPolicies?: PolicyModel[];

  // --- Relación de Persona (puede venir anidada o no) ---
  // 🛑 CRÍTICO: La relación 'people' puede faltar o ser null si el backend lo omite.
  people?: PersonModel;

  // --- Otros campos de la raíz
  integrationCode?: string;
  // (No incluimos 'identification' de tu interfaz inicial ya que no está en la raíz del JSON)
}