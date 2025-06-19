import { makeRequest, handleConnectionError } from './db.js'

// ==================== ESTADOS ====================

// Obtener todos los estados
export async function getStatuses() {
    try {
        const data = await makeRequest("http://localhost:5000/status/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getStatuses");
    } catch (error) {
        return handleConnectionError(error, "getStatuses")
    }
}

// Obtener un estado por ID
export async function getStatusById(statusId) {
    try {
        const data = await makeRequest(`http://localhost:5000/status/${statusId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getStatusById");
    } catch (error) {
        return handleConnectionError(error, "getStatusById")
    }
}

// Crear un nuevo estado
export async function createStatus(statusData) {
    try {
        const data = await makeRequest('http://localhost:5000/status/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statusData)
        })
        if (data.success) {
            return { success: true, status: data.data }
        } else if (data.isHttpError && data.status === 400) {
            if (data.data && data.data.status) {
                console.log("Estado creado exitosamente (a pesar del 400 BAD REQUEST):", data.data.status);
                return { success: true, status: data.data.status };
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(data.message || "Error al crear el estado");
        }
    } catch (error) {
        return handleConnectionError(error, "createStatus")
    }
}

// Actualizar un estado existente
export async function updateStatus(statusId, statusData) {
    try {
        const data = await makeRequest(`http://localhost:5000/status/${statusId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statusData)
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateStatus");
    } catch (error) {
        return handleConnectionError(error, "updateStatus")
    }
}

// Eliminar un estado
export async function deleteStatus(statusId) {
    try {
        const data = await makeRequest(`http://localhost:5000/status/${statusId}`, {
            method: 'DELETE'
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteStatus");
    } catch (error) {
        return handleConnectionError(error, "deleteStatus")
    }
}