import type { AuthMethodModel } from "../api/authmethodModel";
import type { PersonModel } from "../api/personModel";
import type { UserModel } from "../api/userModel";

export type UserCreationPayload = Omit<UserModel, "userId" | "isLocked" | "groups" | "branchs" | "authMethods" | "userPolicies" | "people"> & {
    // Campos necesarios para crear o actualizar la relación de persona. 
    // Usamos Partial<PersonModel> ya que los detalles de la persona son anidados y opcionales.
    people?: Partial<PersonModel>; 

    // Requerimos métodos de autenticación al crear
    authMethods: AuthMethodModel[]; 

    // Grupos/Branchs pueden ser requeridos por ID al crear
    groupIds?: string[]; 
    branchIds?: string[];
};

// Payload para Actualizar un Usuario (todo es opcional)
export type UserUpdatePayload = Partial<UserCreationPayload>;