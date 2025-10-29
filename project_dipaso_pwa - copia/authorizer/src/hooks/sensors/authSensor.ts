// src/sensors/authSensor.ts
import { SyncSensor } from "./syncSensor";
import type { Auth } from "./../../models/api/authModel";
import { syncUserToken } from "../../workers/syncAuthWorker";
import { registerSyncTrigger } from "./syncOrchestrator"; // ⬅️ Importamos el orquestador

export const authSensor: SyncSensor<Auth> = new SyncSensor<Auth>();

// -----------------------------
// Auto-sync cuando el backend esté disponible
// -----------------------------
registerSyncTrigger(syncUserToken, "🔄 Server online, activando sincronización de token...");