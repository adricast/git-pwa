/**
 * Define la estructura de una dirección asociada a una persona,
 * reflejando el objeto dentro del array 'addresses' del JSON.
 */
export interface AddressModel {
    /** Clave principal de la dirección. Corresponde a 'address_id' (UUID). */
    addressId: string;
    
    /** Corresponde a 'street'. */
    street: string;
    
    /** ID de la ciudad. Corresponde a 'city_id' (UUID). */
    cityId: string;
    
    /** ID del estado/provincia. Corresponde a 'state_id' (UUID). */
    stateId: string;
    
    /** Corresponde a 'postal_code'. */
    postalCode: string;
    
    /** ID del país. Corresponde a 'country_id' (UUID). */
    countryId: string;
    
    /** Código de integración con sistemas externos. Corresponde a 'integration_code'. */
    integrationCode?: string;
    
    /** ID del tipo de dirección. Corresponde a 'type_address_id' (UUID). */
    typeAddressId: string;
    
    /** ID de la persona a la que pertenece esta dirección. Corresponde a 'person_id' (UUID). */
    personId: string;
    
    /** Estado de actividad. Corresponde a 'is_active'. */
    isActive: boolean;
    
    /** ID del usuario que creó el registro. Corresponde a 'created_by_user_id'. */
    createdByUserId: string;
}