// /models/api/IPerson.ts

import type { IEmployee } from "./employeesModel";
import type { IPersonAddress } from "./peopleaddress";
import type { IPersonDocument } from "./peopledocumentsModel";

export interface IPerson {
  person_id: string;
  given_name: string;
  sur_name: string;
  date_of_birth: string; // Se recomienda usar 'string' para fechas ISO 8601
  phone_number: string;
  gender_id: string;
  created_by_user_id: string;
  is_customer: boolean;
  is_supplier: boolean;
  is_employee: boolean;
  is_active: boolean;
  integration_code: string;
  
  // Relaciones anidadas (Arrays y Objeto único)
  addresses: IPersonAddress[];
  documents: IPersonDocument[];
  employee?: IEmployee; // Opcional, ya que solo existe si is_employee es true
}