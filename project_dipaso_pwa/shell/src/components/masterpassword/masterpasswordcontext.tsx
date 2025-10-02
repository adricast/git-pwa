// 📁 src/components/masterpassword/masterpasswordcontext.tsx

import { createContext } from "react";
import { type MasterPasswordContextProps } from "./interface";

// 🟢 Creamos el Contexto
export const MasterPasswordContext = createContext<MasterPasswordContextProps | undefined>(
  undefined
);