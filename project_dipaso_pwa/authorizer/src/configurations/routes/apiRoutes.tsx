export const API_BASE_URL_DEV = "http://127.0.0.1:5000/api";
export const API_BASE_URL_BUILD = "https://az3c9e55ka.execute-api.us-east-1.amazonaws.com/dev";

export const authRouteApi = {
  // 🔑 CAMBIO: La ruta de login se cambia a 'token' para reflejar el endpoint de la imagen
  login: "/auth/token/",
 
  // me: "/auth/me", // (Se puede mantener si tienes un endpoint para obtener info del usuario)
  logout: "/auth/logout/", 
};