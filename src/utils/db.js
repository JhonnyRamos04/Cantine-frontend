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

        return response
    } catch (error) {
        // Manejar diferentes tipos de errores
        if (error.name === "AbortError") {
            throw new Error("Timeout: El servidor no responde")
        }
        throw error
    }
}

// ==================== PRODUCTOS ====================

// Obtener todos los productos
export async function getProducts() {
    try {
        const res = await makeRequest("http://localhost:5000/products/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProducts")
    }
}

// Obtener un producto por ID
export async function getProductById(productId) {
    try {
        const res = await makeRequest(`http://localhost:5000/products/${productId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProductById")
    }
}

// Crear un nuevo producto
export async function createProduct(productData) {
    try {
        const res = await makeRequest("http://localhost:5000/products/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        })

        // Verificar si la respuesta es exitosa (status 200-299)
        if (res && res.ok) {
            try {
                const data = await res.json()
                console.log("Producto creado exitosamente:", data)
                return { success: true, product: data }
            } catch (jsonError) {
                console.log("Producto creado pero no se pudo parsear la respuesta JSON")
                return { success: true, message: "Producto creado exitosamente" }
            }
        } else {
            // Si no es exitoso, intentar obtener el mensaje de error
            let errorMessage = "Error al crear el producto"
            try {
                if (res) {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorMessage
                }
            } catch (e) {
                errorMessage = `Error ${res?.status || "Sin respuesta"}: ${res?.statusText || "Sin conexión"}`
            }
            throw new Error(errorMessage)
        }
    } catch (error) {
        return handleConnectionError(error, "createProduct")
    }
}

// Actualizar un producto existente
export async function updateProduct(productId, productData) {
    try {
        const res = await makeRequest(`http://localhost:5000/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "updateProduct")
    }
}

// Eliminar un producto
export async function deleteProduct(productId) {
    try {
        const res = await makeRequest(`http://localhost:5000/products/${productId}`, {
            method: "DELETE",
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "deleteProduct")
    }
}

// Obtener productos por categoría
export async function getProductsByCategory(categoryId) {
    try {
        const res = await makeRequest(`http://localhost:5000/products/category/${categoryId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProductsByCategory")
    }
}

// ==================== DETALLES DE PRODUCTOS ====================

// Obtener todos los detalles de productos
export async function getProductDetails() {
    try {
        const res = await makeRequest("http://localhost:5000/product-details/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProductDetails")
    }
}

// Obtener un detalle de producto por ID
export async function getProductDetailById(detailId) {
    try {
        const res = await makeRequest(`http://localhost:5000/product-details/${detailId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProductDetailById")
    }
}

// Crear un nuevo detalle de producto
export async function createProductDetail(detailData) {
    try {
        const res = await makeRequest("http://localhost:5000/product-details/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })

        // Verificar si la respuesta es exitosa (status 200-299)
        if (res && res.ok) {
            try {
                const data = await res.json()
                console.log("Detalle de producto creado exitosamente:", data)
                return { success: true, product_detail: data }
            } catch (jsonError) {
                console.log("Detalle creado pero no se pudo parsear la respuesta JSON")
                return { success: true, message: "Detalle de producto creado exitosamente" }
            }
        } else {
            let errorMessage = "Error al crear el detalle de producto"
            try {
                if (res) {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorMessage
                }
            } catch (e) {
                errorMessage = `Error ${res?.status || "Sin respuesta"}: ${res?.statusText || "Sin conexión"}`
            }
            throw new Error(errorMessage)
        }
    } catch (error) {
        return handleConnectionError(error, "createProductDetail")
    }
}

// Actualizar un detalle de producto existente
export async function updateProductDetail(detailId, detailData) {
    try {
        const res = await makeRequest(`http://localhost:5000/product-details/${detailId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "updateProductDetail")
    }
}

// Eliminar un detalle de producto
export async function deleteProductDetail(detailId) {
    try {
        const res = await makeRequest(`http://localhost:5000/product-details/${detailId}`, {
            method: "DELETE",
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "deleteProductDetail")
    }
}

// ==================== MATERIALES ====================

// Obtener todos los materiales
export async function getMaterials() {
    try {
        const res = await makeRequest("http://localhost:5000/materials/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getMaterials")
    }
}

// Obtener un material por ID
export async function getMaterialById(materialId) {
    try {
        const res = await makeRequest(`http://localhost:5000/materials/${materialId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getMaterialById")
    }
}

// Crear un nuevo material
export async function createMaterial(materialData) {
    try {
        const res = await makeRequest("http://localhost:5000/materials/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(materialData),
        })

        // Verificar si la respuesta es exitosa (status 200-299)
        if (res && res.ok) {
            try {
                const data = await res.json()
                console.log("Material creado exitosamente:", data)
                return { success: true, material: data }
            } catch (jsonError) {
                console.log("Material creado pero no se pudo parsear la respuesta JSON")
                return { success: true, message: "Material creado exitosamente" }
            }
        } else {
            let errorMessage = "Error al crear el material"
            try {
                if (res) {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorMessage
                }
            } catch (e) {
                errorMessage = `Error ${res?.status || "Sin respuesta"}: ${res?.statusText || "Sin conexión"}`
            }
            throw new Error(errorMessage)
        }
    } catch (error) {
        return handleConnectionError(error, "createMaterial")
    }
}

// Actualizar un material existente
export async function updateMaterial(materialId, materialData) {
    try {
        const res = await makeRequest(`http://localhost:5000/materials/${materialId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(materialData),
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "updateMaterial")
    }
}

// Eliminar un material
export async function deleteMaterial(materialId) {
    try {
        const res = await makeRequest(`http://localhost:5000/materials/${materialId}`, {
            method: "DELETE",
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "deleteMaterial")
    }
}

// Obtener materiales por tipo
export async function getMaterialsByType(typeId) {
    try {
        const res = await makeRequest(`http://localhost:5000/materials/type/${typeId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getMaterialsByType")
    }
}

// ==================== DETALLES DE MATERIALES ====================

// Obtener todos los detalles de materiales
export async function getMaterialDetails() {
    try {
        const res = await makeRequest("http://localhost:5000/material-details/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getMaterialDetails")
    }
}

// Obtener un detalle de material por ID
export async function getMaterialDetailById(detailId) {
    try {
        const res = await makeRequest(`http://localhost:5000/material-details/${detailId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getMaterialDetailById")
    }
}

// Crear un nuevo detalle de material
export async function createMaterialDetail(detailData) {
    try {
        const res = await makeRequest("http://localhost:5000/material-details/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })

        // Verificar si la respuesta es exitosa (status 200-299)
        if (res && res.ok) {
            try {
                const data = await res.json()
                console.log("Detalle de material creado exitosamente:", data)
                return { success: true, material_detail: data }
            } catch (jsonError) {
                console.log("Detalle creado pero no se pudo parsear la respuesta JSON")
                return { success: true, message: "Detalle de material creado exitosamente" }
            }
        } else {
            let errorMessage = "Error al crear el detalle de material"
            try {
                if (res) {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorMessage
                }
            } catch (e) {
                errorMessage = `Error ${res?.status || "Sin respuesta"}: ${res?.statusText || "Sin conexión"}`
            }
            throw new Error(errorMessage)
        }
    } catch (error) {
        return handleConnectionError(error, "createMaterialDetail")
    }
}

// Actualizar un detalle de material existente
export async function updateMaterialDetail(detailId, detailData) {
    try {
        const res = await makeRequest(`http://localhost:5000/material-details/${detailId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detailData),
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "updateMaterialDetail")
    }
}

// Eliminar un detalle de material
export async function deleteMaterialDetail(detailId) {
    try {
        const res = await makeRequest(`http://localhost:5000/material-details/${detailId}`, {
            method: "DELETE",
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "deleteMaterialDetail")
    }
}

// ==================== PROVEEDORES ====================

// Obtener todos los proveedores
export async function getProviders() {
    try {
        const res = await makeRequest("http://localhost:5000/providers/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProviders")
    }
}

// Obtener un proveedor por ID
export async function getProviderById(providerId) {
    try {
        const res = await makeRequest(`http://localhost:5000/providers/${providerId}`)

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getProviderById")
    }
}

// Crear un nuevo proveedor - CORREGIDO
export async function createProvider(providerData) {
    try {
        console.log("Enviando datos del proveedor:", providerData)

        const res = await makeRequest("http://localhost:5000/providers/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(providerData),
        })

        console.log("Respuesta del servidor:", res?.status, res?.statusText)

        // Verificar si la respuesta es exitosa (status 200-299)
        if (res && res.ok) {
            try {
                const data = await res.json()
                console.log("Proveedor creado exitosamente:", data)
                return { success: true, provider: data }
            } catch (jsonError) {
                console.log("Proveedor creado pero no se pudo parsear la respuesta JSON")
                return { success: true, message: "Proveedor creado exitosamente" }
            }
        } else {
            let errorMessage = "Error al crear el proveedor"
            try {
                if (res) {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorMessage
                }
            } catch (e) {
                errorMessage = `Error ${res?.status || "Sin respuesta"}: ${res?.statusText || "Sin conexión"}`
            }
            throw new Error(errorMessage)
        }
    } catch (error) {
        return handleConnectionError(error, "createProvider")
    }
}

// Actualizar un proveedor existente
export async function updateProvider(providerId, providerData) {
    try {
        const res = await makeRequest(`http://localhost:5000/providers/${providerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(providerData),
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "updateProvider")
    }
}

// Eliminar un proveedor
export async function deleteProvider(providerId) {
    try {
        const res = await makeRequest(`http://localhost:5000/providers/${providerId}`, {
            method: "DELETE",
        })

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "deleteProvider")
    }
}

// ==================== PLATOS (DISHES) ====================

// Obtener todos los platos
export async function getDishes() {
    try {
        const res = await fetch('http://localhost:5000/dishes/')
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición de los platos')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return []
    }
}

// Obtener un plato por ID
export async function getDishById(dishId) {
    try {
        const res = await fetch(`http://localhost:5000/dishes/${dishId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición del plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Crear un nuevo plato
export async function createDish(dishData) {
    try {
        const res = await fetch('http://localhost:5000/dishes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishData)
        })
        if (res.status >= 200 && res.status < 300) {
            try {
                // Intentar parsear la respuesta como JSON
                const data = await res.json()
                return data
            } catch (jsonError) {
                console.log("Advertencia: No se pudo parsear la respuesta como JSON, pero la operación parece exitosa")
                // Devolver un objeto genérico de éxito si no podemos parsear la respuesta
                return { success: true, message: "Operación completada" }
            }
        }

        // Si llegamos aquí, hubo un error en la respuesta
        let errorMessage = "Ocurrió algo al crear el producto"
        try {
            // Intentar obtener el mensaje de error del servidor
            const errorData = await res.json()
            errorMessage = errorData.message || errorMessage
        } catch (e) {
            // Si no podemos parsear la respuesta, usar el mensaje genérico
            console.log(e)
        }

        throw new Error(errorMessage)
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        // Verificar si el error es de tipo Bad Request pero podría ser exitoso
        if (error.message.includes("Bad Request") || error.message.includes("400")) {
            console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
            // Devolver un objeto que indique que podría haber sido exitoso
            return { possiblySuccessful: true, message: "La operación podría haber sido exitosa a pesar del error" }
        }
        return null
    }
}

// Actualizar un plato existente
export async function updateDish(dishId, dishData) {
    try {
        const res = await fetch(`http://localhost:5000/dishes/${dishId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishData)
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al actualizar el plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Eliminar un plato
export async function deleteDish(dishId) {
    try {
        const res = await fetch(`http://localhost:5000/dishes/${dishId}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al eliminar el plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Obtener platos por categoría
export async function getDishesByCategory(categoryId) {
    try {
        const res = await fetch(`http://localhost:5000/dishes/category/${categoryId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición de los platos por categoría')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return []
    }
}

// Obtener platos por estado
export async function getDishesByStatus(statusId) {
    try {
        const res = await fetch(`http://localhost:5000/dishes/status/${statusId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición de los platos por estado')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return []
    }
}

// ==================== DETALLES DE PLATOS ====================

// Obtener todos los detalles de platos
export async function getDishDetails() {
    try {
        const res = await fetch('http://localhost:5000/dish-details/')
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición de los detalles de platos')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return []
    }
}

// Obtener un detalle de plato por ID
export async function getDishDetailById(detailId) {
    try {
        const res = await fetch(`http://localhost:5000/dish-details/${detailId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición del detalle de plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Crear un nuevo detalle de plato
export async function createDishDetail(detailData) {
    try {
        const res = await fetch('http://localhost:5000/dish-details/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailData)
        })
        if (res.status >= 200 && res.status < 300) {
            try {
                // Intentar parsear la respuesta como JSON
                const data = await res.json()
                return data
            } catch (jsonError) {
                console.log("Advertencia: No se pudo parsear la respuesta como JSON, pero la operación parece exitosa")
                // Devolver un objeto genérico de éxito si no podemos parsear la respuesta
                return { success: true, message: "Operación completada" }
            }
        }

        // Si llegamos aquí, hubo un error en la respuesta
        let errorMessage = "Ocurrió algo al crear el producto"
        try {
            // Intentar obtener el mensaje de error del servidor
            const errorData = await res.json()
            errorMessage = errorData.message || errorMessage
        } catch (e) {
            // Si no podemos parsear la respuesta, usar el mensaje genérico
            console.log(e)
        }

        throw new Error(errorMessage)
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        // Verificar si el error es de tipo Bad Request pero podría ser exitoso
        if (error.message.includes("Bad Request") || error.message.includes("400")) {
            console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
            // Devolver un objeto que indique que podría haber sido exitoso
            return { possiblySuccessful: true, message: "La operación podría haber sido exitosa a pesar del error" }
        }
        return null
    }
}

// Actualizar un detalle de plato existente
export async function updateDishDetail(detailId, detailData) {
    try {
        const res = await fetch(`http://localhost:5000/dish-details/${detailId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailData)
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al actualizar el detalle de plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Eliminar un detalle de plato
export async function deleteDishDetail(detailId) {
    try {
        const res = await fetch(`http://localhost:5000/dish-details/${detailId}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al eliminar el detalle de plato')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// ==================== CATEGORÍAS ====================

// Obtener todas las categorías
export async function getCategories() {
    try {
        const res = await makeRequest("http://localhost:5000/categories/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getCategories")
    }
}

// Obtener una categoría por ID
export async function getCategoryById(categoryId) {
    try {
        const res = await fetch(`http://localhost:5000/categories/${categoryId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición de la categoría')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Crear una nueva categoría
export async function createCategory(categoryData) {
    try {
        const res = await fetch('http://localhost:5000/categories/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        })
        if (res.status >= 200 && res.status < 300) {
            try {
                // Intentar parsear la respuesta como JSON
                const data = await res.json()
                return data
            } catch (jsonError) {
                console.log("Advertencia: No se pudo parsear la respuesta como JSON, pero la operación parece exitosa")
                // Devolver un objeto genérico de éxito si no podemos parsear la respuesta
                return { success: true, message: "Operación completada" }
            }
        }

        // Si llegamos aquí, hubo un error en la respuesta
        let errorMessage = "Ocurrió algo al crear el producto"
        try {
            // Intentar obtener el mensaje de error del servidor
            const errorData = await res.json()
            errorMessage = errorData.message || errorMessage
        } catch (e) {
            console.log(e)
        }

        throw new Error(errorMessage)
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        // Verificar si el error es de tipo Bad Request pero podría ser exitoso
        if (error.message.includes("Bad Request") || error.message.includes("400")) {
            console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
            // Devolver un objeto que indique que podría haber sido exitoso
            return { possiblySuccessful: true, message: "La operación podría haber sido exitosa a pesar del error" }
        }
        return null
    }
}

// Actualizar una categoría existente
export async function updateCategory(categoryId, categoryData) {
    try {
        const res = await fetch(`http://localhost:5000/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al actualizar la categoría')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Eliminar una categoría
export async function deleteCategory(categoryId) {
    try {
        const res = await fetch(`http://localhost:5000/categories/${categoryId}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al eliminar la categoría')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// ==================== ESTADOS ====================

// Obtener todos los estados
export async function getStatuses() {
    try {
        const res = await makeRequest("http://localhost:5000/status/")

        if (!res || !res.ok) {
            throw new Error(`Error HTTP: ${res?.status || "Sin respuesta"} - ${res?.statusText || "Sin conexión"}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        return handleConnectionError(error, "getStatuses")
    }
}


// Obtener un estado por ID
export async function getStatusById(statusId) {
    try {
        const res = await fetch(`http://localhost:5000/status/${statusId}`)
        if (!res.ok) {
            throw new Error('Ocurrió algo con la petición del estado')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Crear un nuevo estado
export async function createStatus(statusData) {
    try {
        const res = await fetch('http://localhost:5000/status/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statusData)
        })
        if (res.status >= 200 && res.status < 300) {
            try {
                // Intentar parsear la respuesta como JSON
                const data = await res.json()
                return data
            } catch (jsonError) {
                console.log("Advertencia: No se pudo parsear la respuesta como JSON, pero la operación parece exitosa")
                // Devolver un objeto genérico de éxito si no podemos parsear la respuesta
                return { success: true, message: "Operación completada" }
            }
        }

        // Si llegamos aquí, hubo un error en la respuesta
        let errorMessage = "Ocurrió algo al crear el producto"
        try {
            // Intentar obtener el mensaje de error del servidor
            const errorData = await res.json()
            errorMessage = errorData.message || errorMessage
        } catch (e) {
            console.log(e)
            // Si no podemos parsear la respuesta, usar el mensaje genérico
        }

        throw new Error(errorMessage)
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        // Verificar si el error es de tipo Bad Request pero podría ser exitoso
        if (error.message.includes("Bad Request") || error.message.includes("400")) {
            console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
            // Devolver un objeto que indique que podría haber sido exitoso
            return { possiblySuccessful: true, message: "La operación podría haber sido exitosa a pesar del error" }
        }
        return null
    }
}

// Actualizar un estado existente
export async function updateStatus(statusId, statusData) {
    try {
        const res = await fetch(`http://localhost:5000/status/${statusId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statusData)
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al actualizar el estado')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}

// Eliminar un estado
export async function deleteStatus(statusId) {
    try {
        const res = await fetch(`http://localhost:5000/status/${statusId}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            throw new Error('Ocurrió algo al eliminar el estado')
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.log("Ocurrió algo: ", error)
        return null
    }
}