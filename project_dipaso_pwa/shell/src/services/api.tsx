// 📁 src/services/api/api.ts (EJEMPLO CORREGIDO)

import axios from "axios";
// Importamos ambas URLs desde el archivo de configuración
import { 
    API_BASE_URL_DEV, 
    API_BASE_URL_BUILD 
} from "../configurations/routes/apiRoutes"; // Asumo que la ruta es correcta
const API_KEY = import.meta.env.VITE_APIKEY;
// ----------------------------------------------------------------------
// 1. DETERMINACIÓN DEL ENTORNO
// ----------------------------------------------------------------------

// Verifica si el entorno de Node/Vite está establecido como 'production'.
// Esto será 'true' solo al ejecutar 'npm run build'.
const isProduction = process.env.NODE_ENV === 'production'; 

// 2. SELECCIÓN DINÁMICA DE LA URL BASE
const BASE_URL = isProduction 
    ? API_BASE_URL_BUILD // ⬅️ Producción (AWS API Gateway)
    : API_BASE_URL_DEV;   // ⬅️ Desarrollo (Localhost)


// ----------------------------------------------------------------------
// 3. CREACIÓN DE LA INSTANCIA DE AXIOS
// ----------------------------------------------------------------------

export const api = axios.create({
    baseURL: BASE_URL, // 🎯 ¡Ahora es dinámico!
    headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MTQ5YWE0Yi0yYjAyLTQ0MmEtOWZhMy0yNTI5NmIxMDlhZGUiLCJ1c2VybmFtZSI6InVzZXJnZW4xIiwiZW1haWwiOiJyb25hbGQ2OEBleGFtcGxlLm5ldCIsImV4cCI6MTc2MTE2NTAyNywiaWF0IjoxNzYxMTYxNDI3LCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaXNzIjoiY29tLmRpcGFzby5pYW0uZGV2IiwiYXVkIjoiY29tLmRpcGFzby5wb3MuZGV2In0.IKhVTTR-fEMzcXgWeV064lRrdQoulpRmPRTqM0rp9Ck",
    },
});
