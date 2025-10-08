// 📁 src/services/peopleService.ts (VERSIÓN FINAL Y CORREGIDA)

import { api } from "./../services/api"; 
import { v4 as uuidv4 } from "uuid"; 
import CryptoJS from "crypto-js"; 
import { peopleRouteApi } from "../configurations/apiroutes";

// ----------------------------------------------------------------------
// 🚨 TIPOS/MODELO
// ----------------------------------------------------------------------

/** * Interfaz Persona (Person) - Basada en la tabla iam_people (usando camelCase) */
export interface Person {
    personId: string;
    givenName: string;
    surName: string;
    dateOfBirth?: string; 
    phoneNumber?: string; 
    genderId?: string;
    isCustomer: boolean;
    isSupplier: boolean;
    isEmployee: boolean;
    isActive: boolean;
    integrationCode?: string;
    createdAt: string;
    updatedAt: string;
    createdByUserId?: string;
    updatedByUserId?: string;
}

// ----------------------------------------------------------------------
// 🚨 CONFIGURACIÓN BASE
// ----------------------------------------------------------------------

const HMAC_KEY = import.meta.env.VITE_SECRET_KEY; 
const AES_KEY_STRING = import.meta.env.VITE_FERNET_KEY ; 
const AES_KEY_WORD_ARRAY = CryptoJS.enc.Base64.parse(AES_KEY_STRING); 

// ----------------------------------------------------------------------
// 🔑 UTILIDADES DE SEGURIDAD Y MAPEADOR (Aquí deben estar las funciones)
// ----------------------------------------------------------------------

interface EncryptedResponse {
    payload: string;
    signature: string;
}

/** 🔑 Lógica para Descifrar y Verificar la respuesta (DECRYPT + HMAC Verification) */
const decryptAndVerifyResponse = (data: EncryptedResponse): any => {
    // 1. Verifica HMAC
    const hash = CryptoJS.HmacSHA256(data.payload, HMAC_KEY).toString(CryptoJS.enc.Base64);
    
    if (hash !== data.signature) {
        throw new Error("HMAC inválido: datos corruptos o manipulados");
    }

    // 2. Descifra payload (IV + Ciphertext)
    const fullWordArray = CryptoJS.enc.Base64.parse(data.payload); 
    const IV_SIZE = 16;
    
    const iv = CryptoJS.lib.WordArray.create(
        fullWordArray.words.slice(0, IV_SIZE / 4), 
        IV_SIZE 
    ); 
    
    const ciphertext = CryptoJS.lib.WordArray.create(
        fullWordArray.words.slice(IV_SIZE / 4), 
        fullWordArray.sigBytes - IV_SIZE 
    ); 

    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any, 
        AES_KEY_WORD_ARRAY, 
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    // 3. Convertir a UTF-8 y parsear JSON
    try {
        const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
            throw new Error("Fallo en el descifrado: clave o padding incorrecto.");
        }
        return JSON.parse(decrypted);
    } catch (e) {
        throw new Error("Falla de Descifrado: Verifique la clave AES y el padding (CBC/Pkcs7).");
    }
};

/** 🔑 Lógica para Cifrar y Firmar la petición (ENCRYPT + HMAC Generation) */
const encryptAndSignRequest = (data: Record<string, any>): EncryptedResponse => {
    // 1. Serializar el objeto de datos a JSON string
    const jsonString = JSON.stringify(data);

    // 2. Generar un IV (Vector de Inicialización) aleatorio de 16 bytes
    const iv = CryptoJS.lib.WordArray.random(16);

    // 3. Cifrar la cadena JSON usando AES-CBC
    const encrypted = CryptoJS.AES.encrypt(
        jsonString, 
        AES_KEY_WORD_ARRAY, 
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    // 4. Concatenar IV + Ciphertext (en Base64) para formar el payload
    const fullPayloadWordArray = iv.clone();
    fullPayloadWordArray.words.push(...encrypted.ciphertext.words);
    fullPayloadWordArray.sigBytes += encrypted.ciphertext.sigBytes;

    const payloadBase64 = fullPayloadWordArray.toString(CryptoJS.enc.Base64);

    // 5. Generar HMAC (Firma) del payload Base64
    const signature = CryptoJS.HmacSHA256(payloadBase64, HMAC_KEY).toString(CryptoJS.enc.Base64);

    // 6. Devolver el objeto que el backend espera
    return {
        payload: payloadBase64,
        signature: signature,
    };
};

/** Mapea los datos del backend (snake_case) a la interfaz Person (camelCase) */
function mapPersonFromApi(apiPerson: any): Person {
    return {
        personId: apiPerson.personId,
        givenName: apiPerson.givenName,
        surName: apiPerson.surName,
        dateOfBirth: apiPerson.dateOfBirth ?? undefined,
        phoneNumber: apiPerson.phoneNumber ?? undefined,
        genderId: apiPerson.genderId ?? undefined,
        isCustomer: apiPerson.isCustomer,
        isSupplier: apiPerson.isSupplier,
        isEmployee: apiPerson.isEmployee,
        isActive: apiPerson.isActive,
        integrationCode: apiPerson.integrationCode ?? undefined,
        createdAt: apiPerson.createdAt,
        updatedAt: apiPerson.updatedAt,
        createdByUserId: apiPerson.createdByUserId ?? undefined,
        updatedByUserId: apiPerson.updatedByUserId ?? undefined,
    };
}

// ----------------------------------------------------------------
// FUNCIONES DE ACCESO A DATOS (CRUD de Personas)
// ----------------------------------------------------------------

// --- LECTURA (GET) ---

/** 🔑 Obtiene la lista completa de personas (GET /iam/people/). */
export async function getAllPeople(): Promise<Person[]> {
    try {
        const response = await api.get<EncryptedResponse>(peopleRouteApi.person);
        const decryptedData = decryptAndVerifyResponse(response.data); 
        
        if (!Array.isArray(decryptedData)) {
            throw new Error("Respuesta descifrada no es un array de personas.");
        }

        return decryptedData.map(mapPersonFromApi);
    } catch (error: any) {
        console.error("Error al obtener todas las personas:", error);
        throw error;
    }
}

/** 🔑 Obtiene una persona por ID (GET /iam/people/{id}). */
export async function getPersonById(personId: string): Promise<Person | null> {
    try {
        const response = await api.get<EncryptedResponse>(`${peopleRouteApi.person}${personId}`);
        const decryptedData = decryptAndVerifyResponse(response.data); 
        
        if (decryptedData && decryptedData.error) {
            return null; // Maneja el 404 cifrado que devuelve el controlador.
        }

        return mapPersonFromApi(decryptedData);
    } catch (error: any) {
        if (error.response?.status === 404) return null;
        console.error("Error obteniendo persona por ID:", error);
        throw error;
    }
}

// --- CREACIÓN (POST) ---

/** * 🔑 Crea una nueva persona (POST /iam/people/). */
export async function createPerson(personData: Omit<Person, "personId" | "createdAt" | "updatedAt" | "createdByUserId" | "updatedByUserId">, createdByUserId: string): Promise<Person> {
    try {
        const transactionId = uuidv4(); 

        // 1. Mapeo y Cifrado de la data
       const dataToSend = {
            // Campos Obligatorios
            given_name: personData.givenName,
            sur_name: personData.surName,

            // Campos Opcionales (Mapeados y enviados incluso si son null/vacío)
            date_of_birth: personData.dateOfBirth, 
            phone_number: personData.phoneNumber, 
            gender_id: personData.genderId,       
            integration_code: personData.integrationCode,

            // Campos Booleanos (Mapeados)
            is_customer: personData.isCustomer,   
            is_supplier: personData.isSupplier,   
            is_employee: personData.isEmployee,   
            is_active: personData.isActive,
        };


        const encryptedRequest = encryptAndSignRequest(dataToSend);

        // 2. Envío de la petición
       const response = await api.post<EncryptedResponse>(
        peopleRouteApi.person, 
        encryptedRequest, 
        { 
            headers: { 
            "X-Creator-User-Id": createdByUserId,
            "Transaction-Id": transactionId,   // 🔑 CAMBIADO A "Transaction-Id"
            "Content-Type": "application/json",
            }
        }
        );

        // 3. Descifrado de la respuesta
        const decryptedData = decryptAndVerifyResponse(response.data);
        return mapPersonFromApi(decryptedData);
    } catch (error: any) {
        console.error("Error al crear la persona:", error);
        throw error;
    }
}

// --- ACTUALIZACIÓN (PATCH) ---

/** * 🔑 Actualiza campos específicos de una persona (PATCH /iam/people/{id}). */
export async function updatePerson(personId: string, updatedByUserId: string, personPatch: Partial<Omit<Person, "personId" | "createdAt" | "updatedAt" | "createdByUserId" | "updatedByUserId">>): Promise<Person> {
    try {
        // Mapeo selectivo de camelCase a snake_case
        const dataToSend: Record<string, any> = {};
        if (personPatch.givenName !== undefined) dataToSend.given_name = personPatch.givenName;
        if (personPatch.surName !== undefined) dataToSend.sur_name = personPatch.surName;
        if (personPatch.dateOfBirth !== undefined) dataToSend.date_of_birth = personPatch.dateOfBirth;
        if (personPatch.phoneNumber !== undefined) dataToSend.phone_number = personPatch.phoneNumber;
        if (personPatch.genderId !== undefined) dataToSend.gender_id = personPatch.genderId;
        if (personPatch.isCustomer !== undefined) dataToSend.is_customer = personPatch.isCustomer;
        if (personPatch.isSupplier !== undefined) dataToSend.is_supplier = personPatch.isSupplier;
        if (personPatch.isEmployee !== undefined) dataToSend.is_employee = personPatch.isEmployee;
        if (personPatch.isActive !== undefined) dataToSend.is_active = personPatch.isActive;
        if (personPatch.integrationCode !== undefined) dataToSend.integration_code = personPatch.integrationCode;

        // ⭐ CORRECCIÓN CLAVE: Cifrar y Firmar el objeto de la petición
        const encryptedRequest = encryptAndSignRequest(dataToSend);

        const response = await api.patch<EncryptedResponse>(`${peopleRouteApi.person}${personId}`, 
            encryptedRequest, // ⬅️ Enviamos el objeto cifrado/firmado
            { headers: { "X-Updater-User-Id": updatedByUserId } }
        );

        const decryptedData = decryptAndVerifyResponse(response.data);
        return mapPersonFromApi(decryptedData);
    } catch (error: any) {
        console.error(`Error al actualizar la persona ${personId}:`, error);
        throw error;
    }
}

// --- ELIMINACIÓN (SOFT & HARD) ---

/** * 🔑 Eliminación física masiva (DELETE /iam/people/massive-physical). (CORREGIDO CON CIFRADO)
 * Envía los IDs en el cuerpo de la petición DELETE.
 */
export async function deletePeoplePhysicallyMassive(personIds: string[]): Promise<{ message: string, count: number }> {
    try {
        const dataToSend = { person_ids: personIds };
        
        // ⭐ CORRECCIÓN CLAVE: Cifrar la petición
        const encryptedRequest = encryptAndSignRequest(dataToSend);

        const response = await api.delete<EncryptedResponse>(`${peopleRouteApi.person}massive-physical`, {
            // Axios usa la propiedad 'data' para enviar el cuerpo en DELETE
            data: encryptedRequest, // ⬅️ Enviamos el objeto cifrado/firmado
            headers: { "Content-Type": "application/json" }
        });
        
        const decryptedData = decryptAndVerifyResponse(response.data);
        return decryptedData;
    } catch (error: any) {
        console.error("Error en la eliminación física masiva de personas:", error);
        throw error;
    }
}

/** * 🔑 Eliminación lógica masiva (PATCH /iam/people/massive-soft). (CORREGIDO CON CIFRADO)
 */
export async function softDeletePeopleMassive(personIds: string[], updatedByUserId: string): Promise<{ message: string, count: number }> {
    try {
        const dataToSend = {
            person_ids: personIds, 
        };
        
        // ⭐ CORRECCIÓN CLAVE: Cifrar la petición
        const encryptedRequest = encryptAndSignRequest(dataToSend);
        
        const response = await api.patch<EncryptedResponse>(
            `${peopleRouteApi.person}massive-soft`, 
            encryptedRequest, // ⬅️ Enviamos el objeto cifrado/firmado
            { 
                headers: { 
                    "X-Updater-User-Id": updatedByUserId,
                    'Content-Type': 'application/json' 
                }
            }
        );
        
        const decryptedData = decryptAndVerifyResponse(response.data);
        return decryptedData; 
    } catch (error: any) {
        console.error("Error en la eliminación lógica masiva de personas:", error);
        throw error;
    }
}

/** * 🔑 Eliminación lógica individual (DELETE /iam/people/{id}/soft-delete). */
export async function softDeletePerson(personId: string, updatedByUserId: string): Promise<Person> {
    try {
        // Esta petición DELETE no lleva cuerpo, por lo que no necesita cifrar el cuerpo, 
        // solo el header de auditoría.
        const response = await api.delete<EncryptedResponse>(
            `${peopleRouteApi.person}${personId}/soft-delete`, 
            { headers: { "X-Updater-User-Id": updatedByUserId } }
        );
        const decryptedData = decryptAndVerifyResponse(response.data);
        return mapPersonFromApi(decryptedData); 
    } catch (error: any) {
        console.error(`Error eliminando persona ${personId} lógicamente:`, error);
        throw error;
    }
}

/** 🔑 Obtiene la lista de personas activas (GET /iam/people/active/). */
export async function getActivePeople(): Promise<Person[]> {
    try {
        // Llama al nuevo endpoint que filtra por is_active=True
        const response = await api.get<EncryptedResponse>(`${peopleRouteApi.person}active/`);
        const decryptedData = decryptAndVerifyResponse(response.data); 
        
        if (!Array.isArray(decryptedData)) {
            throw new Error("Respuesta descifrada no es un array de personas.");
        }

        return decryptedData.map(mapPersonFromApi);
    } catch (error: any) {
        console.error("Error al obtener personas activas:", error);
        throw error;
    }
}
