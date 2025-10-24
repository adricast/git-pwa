  import type { UserModel } from "./userModel";

  export interface Group {
    /** ID oficial del servidor */
    groupId: string | number;

    /** Nombre del grupo */
    groupName: string;

    /** Descripción opcional */
    description?: string;

    /** Relación con usuarios */
    users?: UserModel[];

    /** Fecha de última modificación */
    lastModifiedAt: string;
    isActive? : boolean;
  }
