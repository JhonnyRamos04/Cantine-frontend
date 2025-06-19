import { makeRequest, handleConnectionError } from './db.js'

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