//src/hooks/encrypterIdb/useMac
import CryptoJS from "crypto-js";

// 🔑 CLAVE DE FIRMA (SECRET_KEY de Python - para HMAC)
const HMAC_KEY = import.meta.env.VITE_SECRET_KEY ; 

// 🔑 CLAVE AES (FERNET_KEY de Python - Usada para el cifrado/descifrado)
const AES_KEY_STRING = import.meta.env.VITE_FERNET_KEY; 
const AES_KEY_WORD_ARRAY = CryptoJS.enc.Utf8.parse(AES_KEY_STRING);

interface EncryptedFragment {
    payload: string;
    signature: string;
}

// ----------------------------------------------------------------------
// FUNCIONES ADAPTADAS PARA IndexedDB
// ----------------------------------------------------------------------

/** * 🎯 Cifra un objeto JSON y le añade una firma HMAC (usado para IndexedDB).
 */
export const encryptAndSignData = (data: any): EncryptedFragment => {
    // 1. Serializar el objeto a JSON String
    const jsonString = JSON.stringify(data);
    
    // 2. Generar un IV aleatorio (16 bytes para AES-256)
    const iv = CryptoJS.lib.WordArray.random(16);

    // 3. Cifrar el JSON String (AES-256-CBC)
    const encrypted = CryptoJS.AES.encrypt(jsonString, AES_KEY_WORD_ARRAY, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // 4. Concatenar IV + Texto Cifrado y convertir a Base64 para el Payload
    // Nota: El IV se antepone al texto cifrado para que el descifrado sepa qué IV usar.

    const ivAndCiphertext = iv.clone().concat(encrypted.ciphertext);

    const payload = ivAndCiphertext.toString(CryptoJS.enc.Base64);
    
    // 5. Generar HMAC (signature) sobre el Payload
    const signature = CryptoJS.HmacSHA256(payload, HMAC_KEY).toString(CryptoJS.enc.Base64);

    return { payload, signature };
};


/** * 🎯 Descifra y verifica la firma HMAC de un fragmento (usado para IndexedDB).
 * Esta lógica es una versión simplificada de decryptAndVerifyResponse.
 */
export const decryptAndVerifyData = (data: EncryptedFragment): any => {
    // 1. Verifica HMAC usando la HMAC_KEY
    const hash = CryptoJS.HmacSHA256(data.payload, HMAC_KEY).toString(CryptoJS.enc.Base64);

    if (hash !== data.signature) {
        throw new Error("HMAC inválido: datos corruptos o manipulados");
    }

    // --- 2. Descifrado ---
    const encryptedWordArray = CryptoJS.enc.Base64.parse(data.payload);
    
    // Extraer IV (primeros 16 bytes)
    const iv = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(0, 4), 
        16 
    );
    
    // Extraer el texto cifrado restante
    const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(4),
        encryptedWordArray.sigBytes - 16
    );

    // Descifrar
    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any, 
        AES_KEY_WORD_ARRAY, 
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error("Fallo en el descifrado AES.");
    }
    
    // Devolver el objeto reconstruido
    return JSON.parse(decrypted);
};
