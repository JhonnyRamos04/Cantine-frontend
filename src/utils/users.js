import { makeRequest, handleConnectionError } from './db.js';

const API_URL = 'http://localhost:5000/users';

// Obtener todos los usuarios
export async function getUsers() {
    try {
        const data = await makeRequest(API_URL);
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getUsers");
    } catch (error) {
        return handleConnectionError(error, "getUsers");
    }
}

// Obtener un usuario por ID
export async function getUserById(userId) {
    try {
        const data = await makeRequest(`${API_URL}/${userId}`);
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getUserById");
    } catch (error) {
        return handleConnectionError(error, "getUserById");
    }
}

// Obtener usuarios por ID de rol
export async function getUsersByRole(roleId) {
    try {
        const data = await makeRequest(`${API_URL}/role/${roleId}`);
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getUsersByRole");
    } catch (error) {
        return handleConnectionError(error, "getUsersByRole");
    }
}

// Crear un nuevo usuario (generalmente por un admin)
// Nota: Tu backend requiere 'roles_id' para esta operación.
export async function createUser(userData) {
    try {
        const data = await makeRequest(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        // El controlador de Python devuelve un objeto con 'message' y 'user'
        if (data.success) {
            return { success: true, user: data.data.user };
        } else {
            throw new Error(data.message || "Error al crear el usuario");
        }
    } catch (error) {
        return handleConnectionError(error, "createUser");
    }
}

// Actualizar un usuario existente
export async function updateUser(userId, userData) {
    try {
        const data = await makeRequest(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateUser");
    } catch (error) {
        return handleConnectionError(error, "updateUser");
    }
}

// Eliminar un usuario
export async function deleteUser(userId) {
    try {
        const data = await makeRequest(`${API_URL}/${userId}`, {
            method: 'DELETE'
        });
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteUser");
    } catch (error) {
        return handleConnectionError(error, "deleteUser");
    }
}
