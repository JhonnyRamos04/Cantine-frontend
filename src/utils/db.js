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
function handleConnectionError(error, operation) {
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
async function makeRequest(url, options = {}) {
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

// ==================== PRODUCTOS ====================

// Obtener todos los productos
export async function getProducts() {
    try {
        const data = await makeRequest("http://localhost:5000/products/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProducts");
    } catch (error) {
        return handleConnectionError(error, "getProducts")
    }
}

// Obtener un producto por ID
export async function getProductById(productId) {
    try {
        const data = await makeRequest(`http://localhost:5000/products/${productId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProductById");
    } catch (error) {
        return handleConnectionError(error, "getProductById")
    }
}

// Crear un nuevo producto
export async function createProduct(productData) {
    try {
        const result = await makeRequest("http://localhost:5000/products/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (result.success) {
            console.log("Producto creado exitosamente:", result.data);
            return { success: true, product: result.data };
        } else if (result.isHttpError && result.status === 400) {
            // Si el backend devuelve 400, pero el cuerpo de la respuesta indica éxito
            // y contiene el objeto del producto, lo consideramos un éxito.
            if (result.data && result.data.product) {
                console.log("Producto creado exitosamente (a pesar del 400 BAD REQUEST):", result.data.product);
                return { success: true, product: result.data.product };
            } else {
                // Si es 400 pero no hay datos de producto, es un error real
                throw new Error(result.message);
            }
        } else {
            // Otros tipos de errores (conexión, otros errores HTTP)
            throw new Error(result.message || "Error al crear el producto");
        }
    } catch (error) {
        return handleConnectionError(error, "createProduct")
    }
}

// Actualizar un producto existente
export async function updateProduct(productId, productData) {
    try {
        const data = await makeRequest(`http://localhost:5000/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateProduct");
    } catch (error) {
        return handleConnectionError(error, "updateProduct")
    }
}

// Eliminar un producto
export async function deleteProduct(productId) {
    try {
        const data = await makeRequest(`http://localhost:5000/products/${productId}`, {
            method: "DELETE",
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteProduct");
    } catch (error) {
        return handleConnectionError(error, "deleteProduct")
    }
}

// Obtener productos por categoría
export async function getProductsByCategory(categoryId) {
    try {
        const data = await makeRequest(`http://localhost:5000/products/category/${categoryId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProductsByCategory");
    } catch (error) {
        return handleConnectionError(error, "getProductsByCategory")
    }
}

// ==================== DETALLES DE PRODUCTOS ====================

// Obtener todos los detalles de productos
export async function getProductDetails() {
    try {
        const data = await makeRequest("http://localhost:5000/product-details/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProductDetails");
    } catch (error) {
        return handleConnectionError(error, "getProductDetails")
    }
}

// Obtener un detalle de producto por ID
export async function getProductDetailById(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/product-details/${detailId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getProductDetailById");
    } catch (error) {
        return handleConnectionError(error, "getProductDetailById")
    }
}

// Crear un nuevo detalle de producto
export async function createProductDetail(detailData) {
    try {
        const result = await makeRequest("http://localhost:5000/product-details/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        });

        if (result.success) {
            console.log("Detalle de producto creado exitosamente:", result.data.product_detail);
            return { success: true, product_detail: result.data.product_detail };
        } else if (result.isHttpError && result.status === 400) {
            // Si el backend devuelve 400, pero el cuerpo de la respuesta indica éxito
            // y contiene el objeto del detalle de producto, lo consideramos un éxito.
            if (result.data && result.data.product_detail) {
                console.log("Detalle de producto creado exitosamente (a pesar del 400 BAD REQUEST):", result.data.product_detail);
                return { success: true, product_detail: result.data.product_detail };
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error(result.message || "Error al crear detalle de producto");
        }
    } catch (error) {
        return handleConnectionError(error, "createProductDetail")
    }
}

// Actualizar un detalle de producto existente
export async function updateProductDetail(detailId, detailData) {
    try {
        const data = await makeRequest(`http://localhost:5000/product-details/${detailId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateProductDetail");
    } catch (error) {
        return handleConnectionError(error, "updateProductDetail")
    }
}

// Eliminar un detalle de producto
export async function deleteProductDetail(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/product-details/${detailId}`, {
            method: "DELETE",
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteProductDetail");
    } catch (error) {
        return handleConnectionError(error, "deleteProductDetail")
    }
}

// ==================== MATERIALES ====================

// Obtener todos los materiales
export async function getMaterials() {
    try {
        const data = await makeRequest("http://localhost:5000/materials/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getMaterials");
    } catch (error) {
        return handleConnectionError(error, "getMaterials")
    }
}

// Obtener un material por ID
export async function getMaterialById(materialId) {
    try {
        const data = await makeRequest(`http://localhost:5000/materials/${materialId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getMaterialById");
    } catch (error) {
        return handleConnectionError(error, "getMaterialById")
    }
}

// Crear un nuevo material
export async function createMaterial(materialData) {
    try {
        const result = await makeRequest("http://localhost:5000/materials/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(materialData),
        })
        if (result.success) {
            console.log("Material creado exitosamente:", result.data)
            return { success: true, material: result.data }
        } else if (result.isHttpError && result.status === 400) {
            if (result.data && result.data.material) {
                console.log("Material creado exitosamente (a pesar del 400 BAD REQUEST):", result.data.material);
                return { success: true, material: result.data.material };
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error(result.message || "Error al crear el material");
        }
    } catch (error) {
        return handleConnectionError(error, "createMaterial")
    }
}

// Actualizar un material existente
export async function updateMaterial(materialId, materialData) {
    try {
        const data = await makeRequest(`http://localhost:5000/materials/${materialId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(materialData),
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateMaterial");
    } catch (error) {
        return handleConnectionError(error, "updateMaterial")
    }
}

// Eliminar un material
export async function deleteMaterial(materialId) {
    try {
        const data = await makeRequest(`http://localhost:5000/materials/${materialId}`, {
            method: "DELETE",
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteMaterial");
    } catch (error) {
        return handleConnectionError(error, "deleteMaterial")
    }
}

// Obtener materiales por tipo
export async function getMaterialsByType(typeId) {
    try {
        const data = await makeRequest(`http://localhost:5000/materials/type/${typeId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getMaterialsByType");
    } catch (error) {
        return handleConnectionError(error, "getMaterialsByType")
    }
}

// ==================== DETALLES DE MATERIALES ====================

// Obtener todos los detalles de materiales
export async function getMaterialDetails() {
    try {
        const data = await makeRequest("http://localhost:5000/material-details/")
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getMaterialDetails");
    } catch (error) {
        return handleConnectionError(error, "getMaterialDetails")
    }
}

// Obtener un detalle de material por ID
export async function getMaterialDetailById(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/material-details/${detailId}`)
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getMaterialDetailById");
    } catch (error) {
        return handleConnectionError(error, "getMaterialDetailById")
    }
}

// Crear un nuevo detalle de material
export async function createMaterialDetail(detailData) {
    try {
        const result = await makeRequest("http://localhost:5000/material-details/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        });
        if (result.success) {
            console.log("Detalle de material creado exitosamente:", result.data.material_detail)
            return { success: true, material_detail: result.data.material_detail }
        } else if (result.isHttpError && result.status === 400) {
            if (result.data && result.data.material_detail) {
                console.log("Detalle de material creado exitosamente (a pesar del 400 BAD REQUEST):", result.data.material_detail);
                return { success: true, material_detail: result.data.material_detail };
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error(result.message || "Error al crear detalle de material");
        }
    } catch (error) {
        return handleConnectionError(error, "createMaterialDetail")
    }
}

// Actualizar un detalle de material existente
export async function updateMaterialDetail(detailId, detailData) {
    try {
        const data = await makeRequest(`http://localhost:5000/material-details/${detailId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateMaterialDetail");
    } catch (error) {
        return handleConnectionError(error, "updateMaterialDetail")
    }
}

// Eliminar un detalle de material
export async function deleteMaterialDetail(detailId) {
    try {
        const data = await makeRequest(`http://localhost:5000/material-details/${detailId}`, {
            method: "DELETE",
        })
        return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteMaterialDetail");
    } catch (error) {
        return handleConnectionError(error, "deleteMaterialDetail")
    }
}

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