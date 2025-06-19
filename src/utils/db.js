// ==================== CONFIGURACIÓN Y UTILIDADES ====================

// Estado de conexión global
const connectionStatus = {
    isConnected: true,
    lastError: null,
    retryCount: 0,
}

// Función para verificar el estado de la conexión
export function getConnectionStatus() {
    return connectionStatus
}

// Función helper para manejar errores de conexión
export function handleConnectionError(error, operation) {
    console.error(`Error en ${operation}:`, error)

    // Detectar errores de conexión
    if (
        error.name === "TypeError" ||
        error.message.includes("fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_CONNECTION_REFUSED") ||
        error.code === "ECONNREFUSED"
    ) {
        connectionStatus.isConnected = false
        connectionStatus.lastError = "No se puede conectar con el servidor"
    } else {
        connectionStatus.lastError = error.message
    }

    connectionStatus.retryCount++

    // Retornar un objeto de error consistente
    return {
        success: false,
        error: connectionStatus.lastError,
        isConnectionError: !connectionStatus.isConnected,
        retryCount: connectionStatus.retryCount,
    }
}

// Función helper para realizar peticiones con manejo de errores
export async function makeRequest(url, options = {}) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Si llegamos aquí, la conexión funciona
        if (connectionStatus.isConnected === false) {
            connectionStatus.isConnected = true
            connectionStatus.lastError = null
            connectionStatus.retryCount = 0
        }

        let data = null;
        try {
            // Siempre intentar parsear la respuesta como JSON, incluso si no es response.ok
            data = await response.json();
        } catch (jsonError) {
            // Si la respuesta no tiene JSON pero fue exitosa (ej. 204 No Content), devolver un objeto de éxito
            if (response.status === 204 || response.headers.get("content-length") === "0") {
                return { success: true, message: "Operación completada exitosamente sin contenido de respuesta.", httpStatus: response.status };
            }
            // Si no es 204 y no hay JSON, es un error de parseo o respuesta inesperada
            return { success: false, isHttpError: true, status: response.status, message: "No se pudo parsear la respuesta JSON del servidor." };
        }

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 400, 500), pero se pudo parsear JSON
            // Devolvemos un objeto de error estructurado con los datos del servidor
            return {
                success: false,
                isHttpError: true,
                status: response.status,
                statusText: response.statusText,
                data: data, // Los datos JSON parseados de la respuesta de error
                message: data?.message || `Error HTTP: ${response.status} - ${response.statusText}`
            };
        }

        // Si la respuesta es OK y se pudo parsear JSON
        return { success: true, data: data, httpStatus: response.status };

    } catch (error) {
        // Capturar errores de red (ej. Failed to fetch, AbortError)
        if (error.name === "AbortError") {
            return { success: false, isConnectionError: true, error: "Timeout: El servidor no responde" };
        }
        // Error de red general
        return { success: false, isConnectionError: true, error: error.message || "Error de red desconocido" };
    }
}


