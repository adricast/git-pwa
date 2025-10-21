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
        //"Access-Control-Allow-Origin": "http://localhost:3000/",
    },
});
