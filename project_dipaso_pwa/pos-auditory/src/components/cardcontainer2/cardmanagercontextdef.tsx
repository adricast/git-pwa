// src/components/CardManager/CardManagerContextDef.ts (NUEVO ARCHIVO)

import { createContext } from 'react';
import { type CardManagerContextType } from './interface';

/** * 🎯 Aislamiento de la constante de Contexto del Gestor para Fast Refresh.
 */
export const CardManagerContext = createContext<CardManagerContextType | undefined>(undefined);