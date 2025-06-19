import { makeRequest, handleConnectionError } from './db.js'

// ==================== PROVEEDORES ====================

// Obtener todos los proveedores
export async function getProviders() {
    try {
        const data = await makeRequest("http://localhost:5000/providers/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProviders");
    } catch (error) {
        return handleConnectionError(error, "getProviders")
    }
}

// Obtener un proveedor por ID
export async function getProviderById(providerId) {
    try {
        const data = await makeRequest(`http://localhost:5000/providers/${providerId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProviderById");
    } catch (error) {
        return handleConnectionError(error, "getProviderById")
    }
}

// Crear un nuevo proveedor
export async function createProvider(providerData) {
    try {
        console.log("Enviando datos del proveedor:", providerData)
        const data = await makeRequest("http://localhost:5000/providers/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(providerData),
        })
        if (data.success) {
            console.log("Proveedor creado exitosamente:", data.data)
            return { success: true, provider: data.data }
        } else if (data.isHttpError && data.status === 400) {
            if (data.data && data.data.provider) {
                console.log("Proveedor creado exitosamente (a pesar del 400 BAD REQUEST):", data.data.provider);
                return { success: true, provider: data.data.provider };
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(data.message || "Error al crear el proveedor");
        }
    } catch (error) {
        return handleConnectionError(error, "createProvider")
    }
}

// Actualizar un proveedor existente
export async function updateProvider(providerId, providerData) {
    try {
        const data = await makeRequest(`http://localhost:5000/providers/${providerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(providerData),
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateProvider");
    } catch (error) {
        return handleConnectionError(error, "updateProvider")
    }
}

// Eliminar un proveedor
export async function deleteProvider(providerId) {
    try {
        const data = await makeRequest(`http://localhost:5000/providers/${providerId}`, {
            method: "DELETE",
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteProvider");
    } catch (error) {
        return handleConnectionError(error, "deleteProvider")
    }
}