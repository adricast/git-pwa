/**
 * Define la estructura de los detalles específicos de un empleado,
 * reflejando el objeto anidado 'employee' del JSON.
 */
export interface EmployeeDetailsModel {
    /** Clave principal de los detalles del empleado. Corresponde a 'employee_id' (UUID). */
    employeeId: string;
    
    /** Código del empleado. Corresponde a 'employee_code'. */
    employeeCode: string;
    
    /** ID de la persona asociada. Corresponde a 'person_id' (UUID). */
    personId: string;
    
    /** Estado de actividad del registro de empleado. Corresponde a 'is_active'. */
    isActive: boolean;
    
    /** Estado del empleado (e.g., "A" para Activo). Corresponde a 'employee_status'. */
    employeeStatus: string;
    
    /** ID del usuario que creó el registro. Corresponde a 'created_by_user_id'. */
    createdByUserId: string;
}