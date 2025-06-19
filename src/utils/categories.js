import { makeRequest, handleConnectionError } from './db.js'
// ==================== CATEGORÍAS ====================

// Obtener todas las categorías
export async function getCategories() {
    try {
        const data = await makeRequest("http://localhost:5000/categories/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getCategories");
    } catch (error) {
        return handleConnectionError(error, "getCategories")
    }
}

// Obtener una categoría por ID
export async function getCategoryById(categoryId) {
    try {
        const data = await makeRequest(`http://localhost:5000/categories/${categoryId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getCategoryById");
    } catch (error) {
        return handleConnectionError(error, "getCategoryById")
    }
}

// Crear una nueva categoría
export async function createCategory(categoryData) {
    try {
        const data = await makeRequest('http://localhost:5000/categories/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        })
        if (data.success) {
            return { success: true, category: data.data }
        } else if (data.isHttpError && data.status === 400) {
            if (data.data && data.data.category) {
                console.log("Categoría creada exitosamente (a pesar del 400 BAD REQUEST):", data.data.category);
                return { success: true, category: data.data.category };
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(data.message || "Error al crear la categoría");
        }
    } catch (error) {
        return handleConnectionError(error, "createCategory")
    }
}

// Actualizar una categoría existente
export async function updateCategory(categoryId, categoryData) {
    try {
        const data = await makeRequest(`http://localhost:5000/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateCategory");
    } catch (error) {
        return handleConnectionError(error, "updateCategory")
    }
}

// Eliminar una categoría
export async function deleteCategory(categoryId) {
    try {
        const data = await makeRequest(`http://localhost:5000/categories/${categoryId}`, {
            method: 'DELETE'
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteCategory");
    } catch (error) {
        return handleConnectionError(error, "deleteCategory")
    }
}