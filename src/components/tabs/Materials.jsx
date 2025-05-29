"use client"

import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import {
    getMaterials,
    deleteMaterial,
    createMaterial,
    updateMaterial,
    createMaterialDetail,
    updateMaterialDetail,
    getMaterialDetailById,
} from "../../utils/db"

export function Materials() {
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)

    useEffect(() => {
        loadMaterials()
    }, [])

    const loadMaterials = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getMaterials()
            console.log("Materiales cargados:", data)
            setMaterials(data || [])
        } catch (error) {
            console.error("Error cargando materiales:", error)
            setError("Error al cargar los materiales. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (materialId) => {
        try {
            const material = materials.find((m) => m.materials_id === materialId)
            if (material) {
                console.log("Editando material:", material)

                // Si necesitamos obtener más detalles del material
                if (material.materials_details_id) {
                    try {
                        const detailData = await getMaterialDetailById(material.materials_details_id)
                        if (detailData) {
                            // Combinar los datos del material con sus detalles
                            material.detail = detailData
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del material:", detailError)
                    }
                }

                setEditingItem(material)
                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Material no encontrado con ID:", materialId)
                alert(`Material con ID ${materialId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            alert(`Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDelete = async (materialId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este material?")) {
            try {
                setLoading(true)
                console.log("Eliminando material con ID:", materialId)
                const result = await deleteMaterial(materialId)

                if (result && result.message) {
                    await loadMaterials()
                    alert("Material eliminado con éxito")
                } else {
                    throw new Error("No se pudo eliminar el material")
                }
            } catch (error) {
                console.error("Error eliminando material:", error)
                alert(`Error al eliminar el material: ${error.message}`)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSave = async (formData, mode) => {
        try {
            setLoading(true)
            let result

            if (mode === "add") {
                // Primero crear el detalle del material
                const materialDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                console.log("Creando detalle de material:", materialDetailData)
                const detailResult = await createMaterialDetail(materialDetailData)

                if (detailResult && detailResult.material_detail) {
                    // Luego crear el material con el ID del detalle
                    const materialData = {
                        name: formData.name,
                        type_id: Number.parseInt(formData.type_id) || 1,
                        materials_details_id: detailResult.material_detail.materials_details_id,
                    }

                    console.log("Creando material:", materialData)
                    result = await createMaterial(materialData)

                    if (result && result.material) {
                        await loadMaterials()
                        alert("Material creado con éxito")
                    } else {
                        throw new Error("No se pudo crear el material")
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del material")
                }
            } else if (mode === "edit" && editingItem) {
                // Actualizar el material - solo enviamos los campos que el backend espera
                const materialData = {
                    name: formData.name,
                }

                // Solo incluir type_id si existe
                if (formData.type_id) {
                    materialData.type_id = Number.parseInt(formData.type_id) || 1
                }

                console.log("Actualizando material:", materialData)
                console.log("ID del material:", editingItem.materials_id)

                // Actualizar el material
                result = await updateMaterial(editingItem.materials_id, materialData)

                // Si hay un detalle de material, actualizarlo también
                if (editingItem.materials_details_id) {
                    // Solo incluir los campos que el backend espera
                    const materialDetailData = {}

                    if (formData.description !== undefined) {
                        materialDetailData.description = formData.description
                    }

                    if (formData.quantity !== undefined) {
                        materialDetailData.quantity = Number.parseInt(formData.quantity) || 0
                    }

                    if (formData.price !== undefined) {
                        materialDetailData.price = Number.parseFloat(formData.price) || 0
                    }

                    if (formData.provided_id) {
                        materialDetailData.provided_id = formData.provided_id
                    }

                    console.log("Actualizando detalle de material:", materialDetailData)
                    console.log("ID del detalle:", editingItem.materials_details_id)

                    try {
                        const detailResult = await updateMaterialDetail(editingItem.materials_details_id, materialDetailData)

                        console.log("Resultado de actualización de detalle:", detailResult)
                    } catch (detailError) {
                        console.error("Error actualizando detalle del material:", detailError)
                        alert(`Error al actualizar el detalle del material: ${detailError.message}`)
                        // Continuar a pesar del error en el detalle
                    }
                }

                await loadMaterials()
                alert("Material actualizado con éxito")
            }
        } catch (error) {
            console.error("Error guardando material:", error)
            alert(`Error al guardar el material: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    const filteredMaterials = materials.filter((material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar materiales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadMaterials}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Actualizar
                    </button>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <Plus size={20} />
                        Agregar Material
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiales</h3>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando materiales...</p>
                    </div>
                ) : (
                    <ItemList items={filteredMaterials} onEdit={handleEdit} onDelete={handleDelete} itemType="materiales" />
                )}
            </div>

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={editingItem}
                mode={modalMode}
                itemType="materiales"
            />
        </div>
    )
}
