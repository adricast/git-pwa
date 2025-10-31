import axios from "axios";
import { API_BASE_URL_DEV } from "../../configurations/routes/apiroutes";
import { decryptAndVerifyResponse } from "../../hooks/encrypter/useMac";

export const api = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para descifrar respuestas automáticamente
api.interceptors.response.use(
  (response) => {
    // Si la respuesta tiene estructura cifrada {payload, signature}, descifrarla
    if (response.data && typeof response.data === 'object' && 'payload' in response.data && 'signature' in response.data) {
      try {
        console.log('🔐 Datos cifrados recibidos del backend');
        const decryptedData = decryptAndVerifyResponse(response.data);
        console.log('✅ Datos descifrados correctamente:', decryptedData);
        response.data = decryptedData;
      } catch (error) {
        console.error('❌ Error al descifrar respuesta:', error);
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
