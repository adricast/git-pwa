import axios from "axios";
import { API_BASE_URL_DEV } from "../configurations/routes/apiRoutes";
const API_KEY = import.meta.env.VITE_APIKEY;
export const api = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    //"Content-Type": "application/json",
    "X-API-KEY": API_KEY,
  },
});
