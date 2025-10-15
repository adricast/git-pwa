// src/components/CardContainer/CardContextDef.ts (CORREGIDO)

import { createContext } from 'react'; // 💡 Solo importamos lo necesario
import { type CardContextType } from './interface'; // (Ajusta la ruta si 'interfaz' está en otro lado)


export const CardContext = createContext<CardContextType | undefined>(undefined);