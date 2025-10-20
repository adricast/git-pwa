// src/hooks/useEncryptedApi.ts

import { useState } from "react";
import CryptoJS from "crypto-js";

// 🔑 CLAVE DE FIRMA (SECRET_KEY de Python - para HMAC)
const HMAC_KEY = import.meta.env.VITE_SECRET_KEY || "MiClaveSecreta"; 

// 🔑 CLAVE AES (FERNET_KEY de Python - Usada para el cifrado/descifrado)
const AES_KEY_STRING = import.meta.env.VITE_FERNET_KEY || "ClaveDe32BytesAES"; 
// CryptoJS necesita la clave como WordArray para descifrar
const AES_KEY_WORD_ARRAY = CryptoJS.enc.Utf8.parse(AES_KEY_STRING);

interface EncryptedResponse {
    payload: string;
    signature: string;
}

/** 🎯 Lógica para Descifrar y Verificar la respuesta (DECRYPT + HMAC Verification) */
export const decryptAndVerifyResponse = (data: EncryptedResponse): any => {
    // 1. Verifica HMAC usando la HMAC_KEY
    const hash = CryptoJS.HmacSHA256(data.payload, HMAC_KEY).toString(CryptoJS.enc.Base64);

    if (hash !== data.signature) {
        throw new Error("HMAC inválido: datos corruptos o manipulados");
    }

    // --- 2. Descifrado (AES-256-CBC con IV prefijado) ---
    // Decodificar la cadena Base64 que contiene [IV + Texto Cifrado]
    const encryptedWordArray = CryptoJS.enc.Base64.parse(data.payload);
    
    // **Ajuste de robustez CRÍTICO:**
    // El IV son los primeros 16 bytes (4 palabras).
    // Usamos el constructor de WordArray.create(words, sigBytes).

    // IV (16 bytes = 4 words)
    // El método .create() necesita los words y la longitud en bytes.
    const iv = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(0, 4), 
        16 // 🚨 16 bytes es la longitud exacta del IV
    );
    
    // El texto cifrado es el resto (words a partir del índice 4)
    // Su longitud es el total de bytes menos los 16 del IV.
    const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(4),
        encryptedWordArray.sigBytes - 16 // 🚨 Longitud del ciphertext
    );

    // Descifrar, usando la clave AES (FERNET_KEY) y el IV extraído
    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any, // Texto cifrado como objeto CipherParams
        AES_KEY_WORD_ARRAY,  // Clave AES de 32 bytes
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7 // Coincide con el padding de Python
        }
    );

    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        // Esto ocurriría si la clave AES es incorrecta o hay un error de padding/IV.
        throw new Error("Fallo en el descifrado: la clave AES es incorrecta o los datos cifrados son ilegibles.");
    }
    
    return JSON.parse(decrypted);
};


export function useEncryptedApi() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 🌐 Fetch cifrado (La lógica de descifrado está ahora en decryptAndVerifyResponse)
    const fetchEncrypted = async <T = any>(url: string, options: RequestInit = {}): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url, options);
            
            // 🚨 Manejo de errores HTTP: Si el backend devuelve un 4xx/5xx antes de cifrar,
            // el body puede no tener la estructura EncryptedResponse.
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
                throw new Error(`Fallo en la API (${res.status}): ${errorData.error || 'Respuesta no válida'}`);
            }

            // Asumiendo que la respuesta exitosa (200) SIEMPRE está cifrada
            const data: EncryptedResponse = await res.json();
            
            // Llama a la función de utilidad corregida
            const decryptedData = decryptAndVerifyResponse(data); 
            
            setLoading(false);
            return decryptedData;
        } catch (err: any) {
            setError(err.message || "Error desconocido");
            setLoading(false);
            return null;
        }
    };

    return { fetchEncrypted, loading, error, decryptAndVerifyResponse };
}