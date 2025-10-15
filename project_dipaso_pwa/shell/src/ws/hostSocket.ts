// src/services/HostWS.ts
type Callback = (data: any) => void;

class HostWS {
  private ws: WebSocket | null = null;
  private listeners: Callback[] = [];
  private url: string | null = null; // Guardar URL para reconexión

  connect(url: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return; // ya conectado
    this.url = url;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => console.log("✅ Conectado al servidor WS");

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.listeners.forEach(cb => cb(message));
      } catch (err) {
        console.error("Error parseando mensaje WS:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("❌ WS desconectado, intentando reconectar...");
      if (this.url) {
        // setTimeout(() => this.connect(this.url!), 3000); // reconexión automática
      }
    };
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // 🔑 subscribe ahora devuelve una función para remover el listener
  subscribe(callback: Callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // 🔑 Método para cerrar la conexión manualmente
  close() {
    if (this.ws) {
      this.ws.onclose = null; // evitar reconexión
      this.ws.close();
      this.ws = null;
      console.log("🛑 WS cerrado manualmente");
    }
  }
}

export const hostWS = new HostWS();
