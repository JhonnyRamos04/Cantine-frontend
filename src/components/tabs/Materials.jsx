import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    RefreshCw,
    Grid,
    List,
    Filter,
    Package,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { ItemFormModal } from "../ItemFormModal"
import {
    getMaterials,
    deleteMaterial,
    createMaterial,
    updateMaterial,
    createMaterialDetail,
    updateMaterialDetail,
    getMaterialDetailById,
} from "../../utils/materials.js"
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

    // Estados para la nueva interfaz
    const [viewMode, setViewMode] = useState("grid") // grid, list, table
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")
    const [filterType, setFilterType] = useState("all")
    const [showFilters, setShowFilters] = useState(false)

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

            if (data && data.isConnectionError) {
                setIsOffline(true)
                setMaterials([])
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los materiales")
                setMaterials([])
            } else {
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
                if (material.materials_details_id) {
                    try {
                        const detailData = await getMaterialDetailById(material.materials_details_id)
                        if (detailData && !detailData.isConnectionError) {
                            setEditingItem({ ...material, material_detail: detailData })
                        } else {
                            setEditingItem(material)
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del material:", detailError)
                        setEditingItem(material)
                    }
                } else {
                    setEditingItem(material)
                }

                setModalMode("edit")
                setIsModalOpen(true)
            } else {
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
            let result

            if (mode === "add") {
                const materialDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                const detailResult = await createMaterialDetail(materialDetailData)

                if (detailResult && detailResult.success) {
                    let materials_details_id = null

                    if (detailResult.material_detail) {
                        materials_details_id = detailResult.material_detail.materials_details_id || detailResult.material_detail.id
                    }

                    if (materials_details_id) {
                        const materialData = {
                            name: formData.name,
                            type_id: Number.parseInt(formData.type_id) || 1,
                            materials_details_id: materials_details_id,
                        }

                        result = await createMaterial(materialData)

                        if (result && result.success) {
                            await loadMaterials()
                            showSuccess("Éxito", "Material creado correctamente")
                        } else {
                            throw new Error("No se pudo crear el material")
                        }
                    } else {
                        throw new Error("No se pudo obtener el ID del detalle del material")
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del material")
                }
            } else if (mode === "edit" && editingItem) {
                const materialData = {
                    name: formData.name,
                }

                if (formData.type_id) {
                    materialData.type_id = Number.parseInt(formData.type_id) || 1
                }

                result = await updateMaterial(editingItem.materials_id, materialData)

                if (editingItem.materials_details_id) {
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

                    try {
                        await updateMaterialDetail(editingItem.materials_details_id, materialDetailData)
                    } catch (detailError) {
                        console.error("Error actualizando detalle del material:", detailError)
                        showWarning("Advertencia", `Error al actualizar el detalle del material: ${detailError.message}`)
                    }
                }

                await loadMaterials()
                showSuccess("Éxito", "Material actualizado correctamente")
            }
        } catch (error) {
            console.error("Error guardando material:", error)
            showError("Error", `Error al guardar el material: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    // Filtrar y ordenar materiales
    const filteredMaterials = materials
        .filter((material) => {
            const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesFilter =
                filterType === "all" ||
                (filterType === "low-stock" && (material.material_detail?.quantity || 0) < 10) ||
                (filterType === "out-of-stock" && (material.material_detail?.quantity || 0) === 0)
            return matchesSearch && matchesFilter
        })
        .sort((a, b) => {
            let aValue, bValue
            switch (sortBy) {
                case "name":
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case "quantity":
                    aValue = a.material_detail?.quantity || 0
                    bValue = b.material_detail?.quantity || 0
                    break
                case "price":
                    aValue = a.material_detail?.price || 0
                    bValue = b.material_detail?.price || 0
                    break
                default:
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    // Paginación
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage)

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterType, sortBy, sortOrder])

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

            {/* Header con estadísticas */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Gestión de Materiales</h2>
                        <p className="text-blue-100">Administra tu inventario de materiales</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">{materials.length}</div>
                            <div className="text-sm text-blue-100">Total</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">
                                {materials.filter((m) => (m.material_detail?.quantity || 0) < 10).length}
                            </div>
                            <div className="text-sm text-blue-100">Stock Bajo</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Búsqueda */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar materiales..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isOffline}
                        />
                    </div>

                    {/* Controles */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <Filter size={16} />
                            Filtros
                        </button>

                        {/* Vista */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Botones de acción */}
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading || isRetrying}
                        >
                            <RefreshCw size={16} className={loading || isRetrying ? "animate-spin" : ""} />
                            Actualizar
                        </button>

                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading || isOffline}
                        >
                            <Plus size={20} />
                            Agregar Material
                        </button>
                    </div>
                </div>

                {/* Panel de filtros expandible */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por stock</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todos</option>
                                    <option value="low-stock">Stock bajo (&lt; 10)</option>
                                    <option value="out-of-stock">Sin stock</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Nombre</option>
                                    <option value="quantity">Cantidad</option>
                                    <option value="price">Precio</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="asc">Ascendente</option>
                                    <option value="desc">Descendente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {error && !isOffline && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-t-lg">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="ml-3 text-gray-500">Cargando materiales...</p>
                    </div>
                ) : (
                    <>
                        {/* Vista de cuadrícula */}
                        {viewMode === "grid" && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedMaterials.map((material) => (
                                        <MaterialCard
                                            key={material.materials_id}
                                            material={material}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            isOffline={isOffline}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vista de lista */}
                        {viewMode === "list" && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {paginatedMaterials.map((material) => (
                                        <MaterialListItem
                                            key={material.materials_id}
                                            material={material}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            isOffline={isOffline}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado vacío */}
                        {filteredMaterials.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm || filterType !== "all" ? "No se encontraron materiales" : "No hay materiales"}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm || filterType !== "all"
                                        ? "Intenta ajustar los filtros de búsqueda"
                                        : "Comienza agregando tu primer material"}
                                </p>
                                {!searchTerm && filterType === "all" && (
                                    <button
                                        onClick={handleAdd}
                                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        disabled={isOffline}
                                    >
                                        <Plus size={20} />
                                        Agregar Material
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">
                                            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredMaterials.length)} de{" "}
                                            {filteredMaterials.length} materiales
                                        </span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value))
                                                setCurrentPage(1)
                                            }}
                                            className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            <option value={12}>12 por página</option>
                                            <option value={24}>24 por página</option>
                                            <option value={48}>48 por página</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i
                                                } else {
                                                    pageNum = currentPage - 2 + i
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 rounded-lg ${currentPage === pageNum
                                                            ? "bg-blue-500 text-white"
                                                            : "border border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal para agregar/editar */}
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

// Componente para tarjeta de material
function MaterialCard({ material, onEdit, onDelete, isOffline }) {
    const quantity = material.material_detail?.quantity || 0
    const price = material.material_detail?.price || 0
    const description = material.material_detail?.description || "Sin descripción"

    const getStockStatus = () => {
        if (quantity === 0) return { color: "text-red-600 bg-red-50", text: "Sin stock" }
        if (quantity < 10) return { color: "text-yellow-600 bg-yellow-50", text: "Stock bajo" }
        return { color: "text-green-600 bg-green-50", text: "En stock" }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg truncate">{material.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Cantidad:</span>
                    <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Precio:</span>
                    <span className="font-medium text-green-600">${price.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(material.materials_id)}
                    disabled={isOffline}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Edit size={16} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(material.materials_id)}
                    disabled={isOffline}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}

// Componente para elemento de lista de material
function MaterialListItem({ material, onEdit, onDelete, isOffline }) {
    const quantity = material.material_detail?.quantity || 0
    const price = material.material_detail?.price || 0
    const description = material.material_detail?.description || "Sin descripción"

    const getStockStatus = () => {
        if (quantity === 0) return { color: "text-red-600 bg-red-50", text: "Sin stock" }
        if (quantity < 10) return { color: "text-yellow-600 bg-yellow-50", text: "Stock bajo" }
        return { color: "text-green-600 bg-green-50", text: "En stock" }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{material.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{description}</p>
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-500">
                            Cantidad: <span className="font-medium text-gray-900">{quantity}</span>
                        </span>
                        <span className="text-gray-500">
                            Precio: <span className="font-medium text-green-600">${price.toFixed(2)}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={() => onEdit(material.materials_id)}
                        disabled={isOffline}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Edit size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(material.materials_id)}
                        disabled={isOffline}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
