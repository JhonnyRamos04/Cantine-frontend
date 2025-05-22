import { useEffect, useState } from "react"
import { Category } from "../Category"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import {
    getMaterials,
    deleteMaterial,
    createMaterial,
    updateMaterial,
    createMaterialDetail,
    updateMaterialDetail,
    getMaterialDetailById
} from "../../utils/db"

export const Materials = () => {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Función para cargar materiales que podemos llamar cuando necesitemos actualizar
    const loadMaterials = async () => {
        try {
            setLoading(true)
            const materialsData = await getMaterials()
            console.log("Materiales cargados:", materialsData)
            setItems(materialsData)
        } catch (error) {
            console.error("Error cargando materiales:", error)
            setError("Error al cargar los materiales. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    // Cargar materiales al montar el componente
    useEffect(() => {
        loadMaterials()
    }, [])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [modalMode, setModalMode] = useState("add") // "add" o "edit"

    const handleDelete = async (id) => {
        try {
            // Mostrar confirmación antes de eliminar
            if (!confirm("¿Está seguro de que desea eliminar este material?")) {
                return
            }

            setLoading(true)
            console.log("Eliminando material con ID:", id)
            const result = await deleteMaterial(id)

            if (result && result.message) {
                // Recargar materiales para reflejar los cambios (no siempre es necesario)
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

    const handleEdit = async (id) => {
        try {
            const itemToEdit = items.find(item => item.materials_id === id)
            if (itemToEdit) {
                console.log("Editando material:", itemToEdit)

                // Si necesitamos obtener más detalles del material
                if (itemToEdit.materials_details_id) {
                    try {
                        const detailData = await getMaterialDetailById(itemToEdit.materials_details_id)
                        if (detailData) {
                            // Combinar los datos del material con sus detalles
                            itemToEdit.detail = detailData
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del material:", detailError)
                    }
                }

                setCurrentItem(itemToEdit)
                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Material no encontrado con ID:", id)
                alert(`Material con ID ${id} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            alert(`Error al preparar la edición: ${error.message}`)
        }
    }

    const handleAdd = () => {
        setCurrentItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleSave = async (formData, mode) => {
        try {
            setLoading(true)
            let result

            if (mode === "add") {
                // Primero crear el detalle del material
                const materialDetailData = {
                    description: formData.description || "",
                    quantity: parseInt(formData.quantity) || 0,
                    price: parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null
                }

                console.log("Creando detalle de material:", materialDetailData)
                const detailResult = await createMaterialDetail(materialDetailData)

                if (detailResult && detailResult.material_detail) {
                    // Luego crear el material con el ID del detalle
                    const materialData = {
                        name: formData.name,
                        type_id: parseInt(formData.type_id) || 1,
                        materials_details_id: detailResult.material_detail.materials_details_id
                    }

                    console.log("Creando material:", materialData)
                    result = await createMaterial(materialData)

                    if (result && result.material) {
                        // Recargar materiales para reflejar los cambios
                        await loadMaterials()
                        alert("Material creado con éxito")
                    } else {
                        throw new Error("No se pudo crear el material")
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del material")
                }
            } else if (mode === "edit" && currentItem) {
                // Actualizar el material - solo enviamos los campos que el backend espera
                const materialData = {
                    name: formData.name
                }

                // Solo incluir type_id si existe
                if (formData.type_id) {
                    materialData.type_id = parseInt(formData.type_id) || 1
                }

                console.log("Actualizando material:", materialData)
                console.log("ID del material:", currentItem.materials_id)

                // Actualizar el material
                result = await updateMaterial(currentItem.materials_id, materialData)

                // Si hay un detalle de material, actualizarlo también
                if (currentItem.materials_details_id) {
                    // Solo incluir los campos que el backend espera
                    const materialDetailData = {}

                    if (formData.description !== undefined) {
                        materialDetailData.description = formData.description
                    }

                    if (formData.quantity !== undefined) {
                        materialDetailData.quantity = parseInt(formData.quantity) || 0
                    }

                    if (formData.price !== undefined) {
                        materialDetailData.price = parseFloat(formData.price) || 0
                    }

                    if (formData.provided_id) {
                        materialDetailData.provided_id = formData.provided_id
                    }

                    console.log("Actualizando detalle de material:", materialDetailData)
                    console.log("ID del detalle:", currentItem.materials_details_id)

                    try {
                        const detailResult = await updateMaterialDetail(
                            currentItem.materials_details_id,
                            materialDetailData
                        )

                        console.log("Resultado de actualización de detalle:", detailResult)
                    } catch (detailError) {
                        console.error("Error actualizando detalle del material:", detailError)
                        alert(`Error al actualizar el detalle del material: ${detailError.message}`)
                        // Continuar a pesar del error en el detalle
                    }
                }

                // Recargar materiales para reflejar los cambios
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

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Materiales</h2>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Lista de Materiales</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={loadMaterials}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center"
                            disabled={loading}
                        >
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            className="w-10 h-10 bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-105 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                            disabled={loading}
                        >
                            <span className="text-xl">+</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        <p className="mt-2 text-gray-500">Cargando materiales...</p>
                    </div>
                ) : (
                    <ItemList
                        items={items}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        itemType='materiales'
                    />
                )}
            </div>

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={currentItem}
                mode={modalMode}
                itemType="materiales"
            />
        </div>
    )
}