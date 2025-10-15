import type { Group } from "./../models/api/groupModel";
import { api } from "./../services/api";
import { groupRouteApi } from "../configurations/apiroutes";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js"; 

// 🔑 CLAVES DE ENTORNO
// ----------------------------------------------------------------------

const HMAC_KEY = import.meta.env.VITE_SECRET_KEY; 
const AES_KEY_STRING = import.meta.env.VITE_FERNET_KEY ; 
const AES_KEY_WORD_ARRAY = CryptoJS.enc.Base64.parse(AES_KEY_STRING); // ✅ CORREGIDO!



// ----------------------------------------------------------------------

interface EncryptedResponse {
  payload: string;
  signature: string;
}

/** 🔑 Lógica para Descifrar y Verificar la respuesta (DECRYPT + HMAC Verification) */

const decryptAndVerifyResponse = (data: EncryptedResponse): any => {
    // 1. Verifica HMAC
    const hash = CryptoJS.HmacSHA256(data.payload, HMAC_KEY).toString(CryptoJS.enc.Base64);
    
    // eslint-disable-next-line no-debugger
    debugger;
    if (hash !== data.signature) {
        throw new Error("HMAC inválido: datos corruptos o manipulados");
    }

    // 2. Descifra payload (IV + Ciphertext)
    const fullWordArray = CryptoJS.enc.Base64.parse(data.payload); 
    const IV_SIZE = 16;
    
    // IV (16 bytes)
    const iv = CryptoJS.lib.WordArray.create(
        fullWordArray.words.slice(0, IV_SIZE / 4), 
        IV_SIZE 
    ); 
    
    // Ciphertext (Resto de bytes)
    const ciphertext = CryptoJS.lib.WordArray.create(
        fullWordArray.words.slice(IV_SIZE / 4), 
        fullWordArray.sigBytes - IV_SIZE 
    ); 

    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any, 
        AES_KEY_WORD_ARRAY, 
        {
            iv: iv,
            mode: CryptoJS.mode.CBC, // Modo de cifrado
            padding: CryptoJS.pad.Pkcs7 // Padding estándar de Python/AES
        }
    );

    // 3. Convertir a UTF-8 y parsear JSON
    try {
        const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
            throw new Error("Fallo en el descifrado: clave o padding incorrecto.");
        }
        
        return JSON.parse(decrypted);
    } catch (e) {
        // El error Malformed UTF-8 data se captura aquí
        throw new Error("Falla de Descifrado: Verifique la clave AES y el padding (CBC/Pkcs7).");
    }
};

/** Mapea los datos del backend a la interfaz Group */
function mapGroupFromApi(apiGroup: any): Group {
    // ... (Esta función se mantiene igual)
    return {
        groupId: apiGroup.user_group_id, 
        groupName: apiGroup.group_name,
        description: apiGroup.description ?? "",
        users: apiGroup.users ?? [], 
        lastModifiedAt: apiGroup.updated_at ?? new Date().toISOString(),
        isActive: apiGroup.is_active,
    };
}



// ----------------------------------------------------------------
// Funciones de Acceso a Datos (CON CORRECCIÓN DE TIPO DE RESPUESTA)
// ----------------------------------------------------------------

/** 🔑 Obtiene todos los grupos que están activos (is_active: true) (CIFRADO/HMAC). */

export async function getActiveGroups(): Promise<Group[]> {
  try {
    console.log("DEBUG 0: Iniciando getActiveGroups...");
    const response = await api.get<EncryptedResponse>(`${groupRouteApi.group}active`);
    
    // 🚨 LOG CRUCIAL: Muestra la data cruda recibida de la API
    console.log("DEBUG 0.5: Respuesta cruda de la API (response.data):", response.data); 

    const decryptedData = decryptAndVerifyResponse(response.data); 
    
    console.log("DEBUG 7: Data descifrada final (Array/Object):", decryptedData);

    if (!Array.isArray(decryptedData)) {
        throw new Error("Respuesta descifrada no es un array de grupos activos.");
    }

    return decryptedData.map(mapGroupFromApi);
  } catch (error: any) {
    console.error("Error al obtener grupos activos (cifrado):", error);
    throw error;
  }
}


/** 🔑 Obtiene todos los grupos que están inactivos (is_active: false) (CIFRADO/HMAC). */
export async function getInactiveGroups(): Promise<Group[]> {
  try {
    // 🚨 CORRECCIÓN: Se espera un ÚNICO EncryptedResponse
    const response = await api.get<EncryptedResponse>(`${groupRouteApi.group}inactive`);
    
    const decryptedData = decryptAndVerifyResponse(response.data);
    
    // Validar que el contenido descifrado es un array
    if (!Array.isArray(decryptedData)) {
        throw new Error("Respuesta descifrada no es un array de grupos inactivos.");
    }

    return decryptedData.map(mapGroupFromApi);
  } catch (error: any) {
    console.error("Error al obtener grupos inactivos:", error);
    throw error;
  }
}

/** 🔑 Crea un nuevo grupo (CIFRADO/HMAC) */
export async function createGroup(groupData: Omit<Group, "groupId">): Promise<Group> {
    try {
        const transactionId = uuidv4();
        const response = await api.post<EncryptedResponse>(
            groupRouteApi.group, 
            { group_name: groupData.groupName, description: groupData.description },
            { headers: { "Transaction-Id": transactionId } 
          
            } 
            
        );
        console.log(groupData.groupName +' '+ groupData.description);
        const decryptedData = decryptAndVerifyResponse(response.data);
        return mapGroupFromApi(decryptedData);
    } catch (error: any) {
        console.error("Error al crear el grupo:", error);
        throw error;
    }
}

/** 🔑 Actualiza un grupo (CIFRADO/HMAC) */
export async function updateGroup(group: Group): Promise<Group> {
    try {
        const response = await api.put<EncryptedResponse>(`${groupRouteApi.group}${group.groupId}`, {
            group_name: group.groupName,
            description: group.description,
        });
        const decryptedData = decryptAndVerifyResponse(response.data);
        return mapGroupFromApi(decryptedData);
    } catch (error: any) {
        console.error("Error al actualizar el grupo:", error);
        throw error;
    }
}

/** 🔑 Realiza la eliminación lógica masiva de grupos (CIFRADO/HMAC) */
export async function softDeleteGroupsMassive(groupIds: (string | number)[]): Promise<{ message: string, count: number }> {
 try {
    const dataToSend = {
      user_group_ids: groupIds,
    };
    
 const response = await api.patch<EncryptedResponse>(
      `${groupRouteApi.group}massive-soft`, 
      dataToSend, // El cuerpo de la petición
      { 
        // 🎯 Solución: Forzar el Content-Type para peticiones PATCH/DELETE con cuerpo
        headers: {
          'Content-Type': 'application/json' 
        }
      }
    );
    
 const decryptedData = decryptAndVerifyResponse(response.data);
    
    // Asumiendo que el backend devuelve { "message": "...", "count": N }
 return decryptedData; 
 } catch (error: any) {
 console.error("Error en la eliminación lógica masiva de grupos:", error);
 throw error;
 }
}

// -----------------------------------------------------------
// Otros métodos
// -----------------------------------------------------------

/** 🔑 Obtiene todos los grupos (Ruta /) (CIFRADO/HMAC) */
export async function getGroups(): Promise<Group[]> {
  try {
    // 🚨 CORRECCIÓN: Se espera un ÚNICO EncryptedResponse
    const response = await api.get<EncryptedResponse>(groupRouteApi.group);
    
    const decryptedData = decryptAndVerifyResponse(response.data);
    
    // Validar que el contenido descifrado es un array
    if (!Array.isArray(decryptedData)) {
        throw new Error("Respuesta descifrada no es un array de todos los grupos.");
    }

    return decryptedData.map(mapGroupFromApi);
  } catch (error: any) {
    console.error("Error al obtener grupos (cifrado):", error);
    throw error;
  }
}

/** 🔑 Obtiene un grupo por ID (CIFRADO/HMAC) */
export async function getGroupById(groupId: string): Promise<Group | null> {
  try {
    const response = await api.get<EncryptedResponse>(`${groupRouteApi.group}${groupId}`);
    const decryptedData = decryptAndVerifyResponse(response.data); 
    return mapGroupFromApi(decryptedData);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error obteniendo grupo (cifrado):", error);
    throw error;
  }
}

/** 🔑 Elimina un grupo de forma FÍSICA (PERMANENTE). (CIFRADO/HMAC) */
export async function deleteGroup(groupId: string | number): Promise<{ message: string }> {
  try {
    const response = await api.delete<EncryptedResponse>(`${groupRouteApi.group}${groupId}`);
    const decryptedData = decryptAndVerifyResponse(response.data);
    return decryptedData;
  } catch (error: any) {
    console.error("Error eliminando grupo físicamente:", error);
    throw error;
  }
}

/** 🔑 Elimina un grupo de forma LÓGICA (Soft Delete). (CIFRADO/HMAC) */
export async function softDeleteGroup(groupId: string | number): Promise<Group> {
  try {
    const response = await api.delete<EncryptedResponse>(`${groupRouteApi.group}${groupId}/soft-delete`);
    const decryptedData = decryptAndVerifyResponse(response.data);
    return mapGroupFromApi(decryptedData); 
  } catch (error: any) {
    console.error("Error eliminando grupo lógicamente:", error);
    throw error;
  }
}

/** 🔑 Cambia el estado activo/inactivo de un grupo (CIFRADO/HMAC) */
export async function changeGroupStatus(groupId: string|number, isActive: boolean): Promise<Group> {
  try {
    const response = await api.patch<EncryptedResponse>(`${groupRouteApi.group}${groupId}/status`, {
      is_active: isActive,
    });
    const decryptedData = decryptAndVerifyResponse(response.data);
    return mapGroupFromApi(decryptedData);
  } catch (error: any) {
    console.error("Error cambiando estado del grupo:", error);
    throw error;
  }
}

/** 🔑 Reactiva un grupo (Cambiando is_active a true). (CIFRADO/HMAC) */
export async function reactivateGroup(groupId: string | number): Promise<Group> {
  return changeGroupStatus(groupId, true); 
}

/** 🔑 Elimina grupos de forma FÍSICA y masiva (Hard Delete). (CIFRADO/HMAC) */
export async function deleteGroupsPhysicallyMassive(groupIds: (string | number)[]): Promise<{ message: string }> {
  try {
    const response = await api.delete<EncryptedResponse>(`${groupRouteApi.group}massive-physical`, {
      data: { user_group_ids: groupIds },
      headers: { "Content-Type": "application/json" }
    });
    const decryptedData = decryptAndVerifyResponse(response.data);
    return decryptedData;
  } catch (error: any) {
    console.error("Error en la eliminación física masiva de grupos:", error);
    throw error;
  }
}