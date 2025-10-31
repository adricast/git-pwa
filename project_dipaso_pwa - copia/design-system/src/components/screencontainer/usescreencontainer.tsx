import { useContext } from "react";
import { ScreenContainerContext } from "./screencontainercontext";

export const useScreenContainer = () => {
  const context = useContext(ScreenContainerContext);
  if (!context) {
    throw new Error("useScreenContainer debe usarse dentro de ScreenContainerProvider");
  }
  return context;
};
