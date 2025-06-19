import { makeRequest, handleConnectionError } from './db.js'
// ==================== PLATOS (DISHES) ====================

// Obtener todos los platos
export async function getDishes() {
    try {
        const data = await makeRequest('http://localhost:5000/dishes/')
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishes");
    } catch (error) {
        return handleConnectionError(error, "getDishes")
    }
}

// Obtener un plato por ID
export async function getDishById(dishId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dishes/${dishId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishById");
    } catch (error) {
        return handleConnectionError(error, "getDishById")
    }
}

// Crear un nuevo plato
export async function createDish(dishData) {
    try {
        const data = await makeRequest('http://localhost:5000/dishes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishData)
        })
        if (data.success) {
            return { success: true, dish: data.data }
        } else if (data.isHttpError && data.status === 400) {
            if (data.data && data.data.dish) {
                console.log("Plato creado exitosamente (a pesar del 400 BAD REQUEST):", data.data.dish);
                return { success: true, dish: data.data.dish };
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(data.message || "Error al crear el plato");
        }
    } catch (error) {
        return handleConnectionError(error, "createDish")
    }
}

// Actualizar un plato existente
export async function updateDish(dishId, dishData) {
    try {
        const data = await makeRequest(`http://localhost:5000/dishes/${dishId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishData)
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateDish");
    } catch (error) {
        return handleConnectionError(error, "updateDish")
    }
}

// Eliminar un plato
export async function deleteDish(dishId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dishes/${dishId}`, {
            method: 'DELETE'
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteDish");
    } catch (error) {
        return handleConnectionError(error, "deleteDish")
    }
}

// Obtener platos por categoría
export async function getDishesByCategory(categoryId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dishes/category/${categoryId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishesByCategory");
    } catch (error) {
        return handleConnectionError(error, "getDishesByCategory")
    }
}

// Obtener platos por estado
export async function getDishesByStatus(statusId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dishes/status/${statusId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishesByStatus");
    } catch (error) {
        return handleConnectionError(error, "getDishesByStatus")
    }
}

// ==================== DETALLES DE PLATOS ====================

// Obtener todos los detalles de platos
export async function getDishDetails() {
    try {
        const data = await makeRequest('http://localhost:5000/dish-details/')
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishDetails");
    } catch (error) {
        return handleConnectionError(error, "getDishDetails")
    }
}

// Obtener un detalle de plato por ID
export async function getDishDetailById(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dish-details/${detailId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishDetailById");
    } catch (error) {
        return handleConnectionError(error, "getDishDetailById")
    }
}

// Crear un nuevo detalle de plato
export async function createDishDetail(detailData) {
    try {
        const data = await makeRequest('http://localhost:5000/dish-details/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailData)
        })
        if (data.success) {
            return { success: true, dish_detail: data.data }
        } else if (data.isHttpError && data.status === 400) {
            if (data.data && data.data.dish_detail) {
                console.log("Detalle de plato creado exitosamente (a pesar del 400 BAD REQUEST):", data.data.dish_detail);
                return { success: true, dish_detail: data.data.dish_detail };
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(data.message || "Error al crear detalle de plato");
        }
    } catch (error) {
        return handleConnectionError(error, "createDishDetail")
    }
}

// Actualizar un detalle de plato existente
export async function updateDishDetail(detailId, detailData) {
    try {
        const data = await makeRequest(`http://localhost:5000/dish-details/${detailId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailData)
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateDishDetail");
    } catch (error) {
        return handleConnectionError(error, "updateDishDetail")
    }
}

// Eliminar un detalle de plato
export async function deleteDishDetail(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/dish-details/${detailId}`, {
            method: 'DELETE'
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteDishDetail");
    } catch (error) {
        return handleConnectionError(error, "deleteDishDetail")
    }
}