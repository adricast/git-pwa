// src/components/CardManager/CardManagerContextDef.ts (NUEVO ARCHIVO)

import { createContext } from 'react';
import { type CardManagerContextType } from './interface';

export const CardManagerContext = createContext<CardManagerContextType | undefined>(undefined);