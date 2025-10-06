// src/components/CardContainer/CardContextDef.ts (CORREGIDO)

import { createContext } from 'react'; // 💡 Solo importamos lo necesario
import { type CardContextType } from './interface'; // (Ajusta la ruta si 'interfaz' está en otro lado)

/**
 * 🎯 SOLUCIÓN: Definición de la constante de Contexto.
 * Se exporta sola para evitar la advertencia de Fast Refresh.
 */
export const CardContext = createContext<CardContextType | undefined>(undefined);