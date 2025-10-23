// 📁 src/services/api/api.ts (EJEMPLO CORREGIDO)

import axios from "axios";
// Importamos ambas URLs desde el archivo de configuración
import { 
    API_BASE_URL_DEV, 
    API_BASE_URL_BUILD_USUARIOS
} from "./../../configurations/routes/apiroutes"; // Asumo que la ruta es correcta
const API_KEY = import.meta.env.VITE_APIKEY;
// ----------------------------------------------------------------------
// 1. DETERMINACIÓN DEL ENTORNO
// ----------------------------------------------------------------------

// Verifica si el entorno de Node/Vite está establecido como 'production'.
// Esto será 'true' solo al ejecutar 'npm run build'.
const isProduction = process.env.NODE_ENV === 'production'; 

// 2. SELECCIÓN DINÁMICA DE LA URL BASE
const BASE_URL = isProduction 
    ? API_BASE_URL_BUILD_USUARIOS // ⬅️ Producción (AWS API Gateway)
    : API_BASE_URL_DEV;   // ⬅️ Desarrollo (Localhost)


// ----------------------------------------------------------------------
// 3. CREACIÓN DE LA INSTANCIA DE AXIOS
// ----------------------------------------------------------------------

export const apiEmpleados = axios.create({
    baseURL: BASE_URL, // 🎯 ¡Ahora es dinámico!
    headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MTQ5YWE0Yi0yYjAyLTQ0MmEtOWZhMy0yNTI5NmIxMDlhZGUiLCJlbWFpbCI6InJvbmFsZDY4QGV4YW1wbGUubmV0IiwiZ3JvdXBzIjpbImFkMjUyMTEzLTU4Y2MtNDViMC1hMGU2LTA1YWY3OTRhYTNlMCJdLCJleHAiOjE3NjEyMzgzMTksImlhdCI6MTc2MTIzNDcxOSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlzcyI6ImNvbS5kaXBhc28uaWFtLmRldiIsImF1ZCI6ImNvbS5kaXBhc28ucG9zLmRldiJ9.HLQmiwUnAPqSU1jCjcrulFrp1vFw2KcAiZQc8PyJS18"
       
    },
});
