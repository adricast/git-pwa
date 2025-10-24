// /models/api/IEmployee.ts

export interface IEmployee {
  employee_id: string;
  employee_code: string;
  person_id: string;
  is_active: boolean;
  employee_status: string; // Asumiendo que "A" es un string
  created_by_user_id: string;
}