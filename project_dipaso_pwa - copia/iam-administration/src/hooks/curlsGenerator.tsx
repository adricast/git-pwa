// 📁 src/utils/curlGenerator.ts

// Define la estructura mínima de configuración de Axios que necesitamos
interface AxiosConfig {
    method?: string;
    url?: string;
    data?: any;
    headers?: Record<string, string | number | boolean>;
}

/**
 * Convierte un objeto de configuración de Axios en un comando cURL ejecutable.
 * @param config El objeto de configuración de Axios (configuración de la solicitud).
 * @returns El comando cURL como una cadena de texto.
 */
export function generateCurlCommand(config: AxiosConfig): string {
    const method = config.method ? config.method.toUpperCase() : 'GET';
    const url = config.url || '';
    let curl = `curl -X ${method} "${url}"`;

    // 1. Añadir Cabeceras
    if (config.headers) {
        for (const headerName in config.headers) {
            // Excluir cabeceras que se añaden automaticamente o no son útiles para el debug
            const lowerHeader = headerName.toLowerCase();
            if (!['content-type', 'accept', 'user-agent'].includes(lowerHeader)) {
                curl += ` -H "${headerName}: ${config.headers[headerName]}"`;
            }
        }
    }

    // 2. Añadir el Cuerpo (Body) para metodos de escritura
    if (config.data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        let data;
        
        // Si data ya es un string, lo usa; si es un objeto, lo convierte a JSON
        if (typeof config.data === 'string') {
            data = config.data;
        } else {
            // Aseguramos Content-Type para JSON si estamos enviando un objeto
            curl += ` -H "Content-Type: application/json"`;
            data = JSON.stringify(config.data);
        }

        // Escapar comillas dobles en el cuerpo de datos para la terminal
        const escapedBody = data.replace(/"/g, '\\"');
        curl += ` -d "${escapedBody}"`;
    }

    return curl;
}