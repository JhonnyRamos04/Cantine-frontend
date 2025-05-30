
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
import { useToast } from "../ui/toast-container"
import { ConfirmationDialog } from "../ui/ConfirmationDialog"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"

export function Materials() {
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, materialId: null })
    const [isOffline, setIsOffline] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)

    const { showSuccess, showError, showWarning } = useToast()

    useEffect(() => {
        loadMaterials()
    }, [])

    const loadMaterials = async () => {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        try {
            const data = await getMaterials()

            // Verificar si es un error de conexión
            if (data && data.isConnectionError) {
                setIsOffline(true)
                setMaterials([])
                console.log("Sin conexión a la base de datos")
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los materiales")
                setMaterials([])
            } else {
                console.log("Materiales cargados:", data)
                setMaterials(data || [])
                setIsOffline(false)
            }
        } catch (error) {
            console.error("Error cargando materiales:", error)
            setError("Error inesperado al cargar los materiales")
            setIsOffline(true)
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = async () => {
        setIsRetrying(true)
        await loadMaterials()
        setTimeout(() => setIsRetrying(false), 1000)
    }

    const handleAdd = () => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden agregar materiales sin conexión al servidor")
            return
        }
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (materialId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden editar materiales sin conexión al servidor")
            return
        }

        try {
            const material = materials.find((m) => m.materials_id === materialId)
            if (material) {
                console.log("Editando material:", material)

                // Si necesitamos obtener más detalles del material
                if (material.materials_details_id) {
                    try {
                        const detailData = await getMaterialDetailById(material.materials_details_id)
                        if (detailData && !detailData.isConnectionError) {
                            // Combinar los datos del material con sus detalles
                            setEditingItem({ ...material, material_detail: detailData })
                        } else {
                            setEditingItem(material); // Si no se pueden obtener detalles, usa el material original
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del material:", detailError)
                        setEditingItem(material); // En caso de error, usa el material original
                    }
                } else {
                    setEditingItem(material); // Si no hay materials_details_id, usa el material original
                }

                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Material no encontrado con ID:", materialId)
                showError("Error", `Material con ID ${materialId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            showError("Error", `Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDeleteClick = (materialId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden eliminar materiales sin conexión al servidor")
            return
        }
        setDeleteConfirm({ isOpen: true, materialId })
    }

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            console.log("Eliminando material con ID:", deleteConfirm.materialId)
            const result = await deleteMaterial(deleteConfirm.materialId)

            if (result && result.isConnectionError) {
                showError("Sin conexión", "No se puede eliminar el material sin conexión al servidor")
            } else if (result && result.message) {
                await loadMaterials()
                showSuccess("Éxito", "Material eliminado correctamente")
            } else {
                throw new Error("No se pudo eliminar el material")
            }
        } catch (error) {
            console.error("Error eliminando material:", error)
            showError("Error", `Error al eliminar el material: ${error.message}`)
        } finally {
            setLoading(false)
            setDeleteConfirm({ isOpen: false, materialId: null })
        }
    }

    const handleSave = async (formData, mode) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden guardar cambios sin conexión al servidor")
            return
        }

        try {
            setLoading(true)
            let result;

            if (mode === "add") {
                // Primero crear el detalle del material
                const materialDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                console.log("Creando detalle de material con datos:", materialDetailData);
                const detailResult = await createMaterialDetail(materialDetailData);

                if (detailResult && detailResult.isConnectionError) {
                    showError("Sin conexión", "No se puede crear el material sin conexión al servidor");
                    return;
                }

                if (detailResult && detailResult.success) {
                    console.log("Respuesta de createMaterialDetail:", detailResult.material_detail); // Log para depuración
                    let materials_details_id = null;

                    if (detailResult.material_detail) {
                        materials_details_id = detailResult.material_detail.materials_details_id || detailResult.material_detail.id;
                    }

                    if (materials_details_id) {
                        // Luego crear el material con el ID del detalle
                        const materialData = {
                            name: formData.name,
                            type_id: Number.parseInt(formData.type_id) || 1,
                            materials_details_id: materials_details_id,
                        }

                        console.log("Creando material con datos:", materialData);
                        result = await createMaterial(materialData);

                        if (result && result.isConnectionError) {
                            showError("Sin conexión", "No se puede crear el material sin conexión al servidor");
                        } else if (result && result.success) {
                            await loadMaterials();
                            showSuccess("Éxito", "Material creado correctamente");
                        } else {
                            throw new Error("No se pudo crear el material");
                        }
                    } else {
                        throw new Error("No se pudo obtener el ID del detalle del material. Respuesta del detalle: " + JSON.stringify(detailResult.material_detail));
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del material");
                }
            } else if (mode === "edit" && editingItem) {
                // Actualizar el material - solo enviamos los campos que el backend espera
                const materialData = {
                    name: formData.name,
                };

                // Solo incluir type_id si existe
                if (formData.type_id) {
                    materialData.type_id = Number.parseInt(formData.type_id) || 1;
                }

                console.log("Actualizando material con ID:", editingItem.materials_id, "y datos:", materialData);

                // Actualizar el material
                result = await updateMaterial(editingItem.materials_id, materialData);

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede actualizar el material sin conexión al servidor");
                    return;
                }

                // Si hay un detalle de material, actualizarlo también
                if (editingItem.materials_details_id) {
                    // Solo incluir los campos que el backend espera
                    const materialDetailData = {};

                    if (formData.description !== undefined) {
                        materialDetailData.description = formData.description;
                    }

                    if (formData.quantity !== undefined) {
                        materialDetailData.quantity = Number.parseInt(formData.quantity) || 0;
                    }

                    if (formData.price !== undefined) {
                        materialDetailData.price = Number.parseFloat(formData.price) || 0;
                    }

                    if (formData.provided_id) {
                        materialDetailData.provided_id = formData.provided_id;
                    }

                    console.log("Actualizando detalle de material con ID:", editingItem.materials_details_id, "y datos:", materialDetailData);

                    try {
                        const detailResult = await updateMaterialDetail(editingItem.materials_details_id, materialDetailData);
                        if (detailResult && detailResult.isConnectionError) {
                            showWarning("Sin conexión", "No se puede actualizar el detalle del material sin conexión al servidor");
                        }
                        console.log("Resultado de actualización de detalle:", detailResult);
                    } catch (detailError) {
                        console.error("Error actualizando detalle del material:", detailError);
                        showWarning("Advertencia", `Error al actualizar el detalle del material: ${detailError.message}`);
                        // Continuar a pesar del error en el detalle
                    }
                }

                await loadMaterials();
                showSuccess("Éxito", "Material actualizado correctamente");
            }
        } catch (error) {
            console.error("Error guardando material:", error);
            showError("Error", `Error al guardar el material: ${error.message}`);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    const filteredMaterials = materials.filter((material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Si está offline, mostrar placeholder
    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title="Materiales no disponibles"
                    message="No se puede conectar con el servidor para cargar los materiales. Verifica tu conexión e intenta nuevamente."
                    onRetry={handleRetry}
                    isRetrying={isRetrying}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ConnectionStatus onRetry={handleRetry} />

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar materiales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={isOffline}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading || isRetrying}
                    >
                        <RefreshCw size={16} className={loading || isRetrying ? "animate-spin" : ""} />
                        Actualizar
                    </button>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading || isOffline}
                    >
                        <Plus size={20} />
                        Agregar Material
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiales</h3>

                {error && !isOffline && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">{isOffline ? "Intentando conectar..." : "Cargando materiales..."}</p>
                    </div>
                ) : (
                    <ItemList
                        items={filteredMaterials}
                        onEdit={!isOffline ? handleEdit : undefined}
                        onDelete={!isOffline ? handleDeleteClick : undefined}
                        itemType="materiales"
                    />
                )}
            </div>

            {!isOffline && (
                <ItemFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    item={editingItem}
                    mode={modalMode}
                    itemType="materiales"
                />
            )}

            {/* Diálogo de confirmación para eliminar */}
            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, materialId: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Material"
                message="¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    )
}
