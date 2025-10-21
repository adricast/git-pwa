// src/entities/idb/rootIDB.ts

// src/entities/idb/rootIDB.ts
import type { AuthDB } from "./authIDB";
import type { TokenDB } from "./tokenIDB";
import type { CatalogsDB } from "./catalogsIDB";

export interface dipasopwa extends AuthDB, TokenDB, CatalogsDB {}
