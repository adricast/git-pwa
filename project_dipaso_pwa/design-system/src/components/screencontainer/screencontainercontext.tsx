import { createContext } from "react";
import { type ScreenContainerContextProps } from "./interface";

// Solo creamos el contexto aquí
export const ScreenContainerContext = createContext<ScreenContainerContextProps | undefined>(
  undefined
);
