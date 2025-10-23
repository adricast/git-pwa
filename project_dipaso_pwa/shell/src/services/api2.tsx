import axios from "axios";
import { API_BASE_URL_DEV } from "../configurations/routes/apiRoutes";

export const api = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    "Content-Type": "application/json",
  },
});


