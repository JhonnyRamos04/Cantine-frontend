import { makeRequest, handleConnectionError } from './db.js'

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
