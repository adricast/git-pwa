// /models/api/IAddress.ts

export interface IPersonAddress {
  address_id: string;
  street: string;
  city_id: string;
  state_id: string;
  postal_code: string;
  country_id: string;
  integration_code: string;
  type_address_id: string;
  person_id: string;
  is_active: boolean;
  created_by_user_id: string;
}