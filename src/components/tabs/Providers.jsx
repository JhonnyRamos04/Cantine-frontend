import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    RefreshCw,
    Grid,
    List,
    Filter,
    Users,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Phone,
    MapPin,
} from "lucide-react"
import { ItemFormModal } from "../ItemFormModal"
import { getProviders, deleteProvider, createProvider, updateProvider, getProviderById } from "../../utils/providers"
import { useToast } from "../ui/toast-container"
import { ConfirmationDialog } from "../ui/ConfirmationDialog"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"

export function Providers() {
    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, providerId: null })
    const [isOffline, setIsOffline] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)

    // Estados para la nueva interfaz
    const [viewMode, setViewMode] = useState("grid")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")
    const [showFilters, setShowFilters] = useState(false)

    const { showSuccess, showError, showWarning } = useToast()

    useEffect(() => {
        loadProviders()
    }, [])

    const loadProviders = async () => {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        try {
            const data = await getProviders()

            if (data && data.isConnectionError) {
                setIsOffline(true)
                setProviders([])
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los proveedores")
                setProviders([])
            } else {
                setProviders(data || [])
                setIsOffline(false)
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error)
            setError("Error inesperado al cargar los proveedores")
            setIsOffline(true)
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = async () => {
        setIsRetrying(true)
        await loadProviders()
        setTimeout(() => setIsRetrying(false), 1000)
    }

    const handleAdd = () => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden agregar proveedores sin conexión al servidor")
            return
        }
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (providerId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden editar proveedores sin conexión al servidor")
            return
        }

        try {
            const itemToEdit = providers.find((item) => item.provider_id === providerId)

            if (itemToEdit) {
                try {
                    const providerDetails = await getProviderById(providerId)
                    if (providerDetails && !providerDetails.isConnectionError) {
                        setEditingItem(providerDetails)
                    } else {
                        setEditingItem(itemToEdit)
                    }
                } catch (detailError) {
                    console.error("Error obteniendo detalles del proveedor:", detailError)
                    setEditingItem(itemToEdit)
                }

                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                showError("Error", `Proveedor con ID ${providerId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            showError("Error", `Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDeleteClick = (providerId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden eliminar proveedores sin conexión al servidor")
            return
        }
        setDeleteConfirm({ isOpen: true, providerId })
    }

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            const result = await deleteProvider(deleteConfirm.providerId)

            if (result && result.isConnectionError) {
                showError("Sin conexión", "No se puede eliminar el proveedor sin conexión al servidor")
            } else if (result && result.message) {
                await loadProviders()
                showSuccess("Éxito", "Proveedor eliminado correctamente")
            } else {
                throw new Error("No se pudo eliminar el proveedor")
            }
        } catch (error) {
            console.error("Error eliminando proveedor:", error)
            showError("Error", `Error al eliminar el proveedor: ${error.message}`)
        } finally {
            setLoading(false)
            setDeleteConfirm({ isOpen: false, providerId: null })
        }
    }

    const handleSave = async (formData, mode) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden guardar cambios sin conexión al servidor")
            return
        }

        try {
            setLoading(true)

            if (mode === "add") {
                const providerData = {
                    name: formData.name || "",
                    direction: formData.direction || "",
                    phone: formData.phone || "",
                }

                const result = await createProvider(providerData)

                if (result && result.success) {
                    await loadProviders()
                    showSuccess("Éxito", "Proveedor creado correctamente")
                } else {
                    throw new Error("No se pudo crear el proveedor")
                }
            } else if (mode === "edit" && editingItem) {
                const providerData = {}

                if (formData.name !== undefined && formData.name !== null) {
                    providerData.name = formData.name
                }
                if (formData.direction !== undefined) {
                    providerData.direction = formData.direction || ""
                }
                if (formData.phone !== undefined) {
                    providerData.phone = formData.phone || ""
                }

                if (Object.keys(providerData).length === 0) {
                    throw new Error("No hay datos para actualizar")
                }

                const result = await updateProvider(editingItem.provider_id, providerData)

                if (result) {
                    await loadProviders()
                    showSuccess("Éxito", "Proveedor actualizado correctamente")
                } else {
                    throw new Error("No se pudo actualizar el proveedor")
                }
            }
        } catch (error) {
            console.error("Error guardando proveedor:", error)
            showError("Error", `Error al guardar el proveedor: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    // Filtrar y ordenar proveedores
    const filteredProviders = providers
        .filter((provider) => {
            const matchesSearch =
                provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (provider.direction && provider.direction.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (provider.phone && provider.phone.includes(searchTerm))
            return matchesSearch
        })
        .sort((a, b) => {
            let aValue, bValue
            switch (sortBy) {
                case "name":
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case "direction":
                    aValue = (a.direction || "").toLowerCase()
                    bValue = (b.direction || "").toLowerCase()
                    break
                case "phone":
                    aValue = a.phone || ""
                    bValue = b.phone || ""
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
    const totalPages = Math.ceil(filteredProviders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedProviders = filteredProviders.slice(startIndex, startIndex + itemsPerPage)

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, sortBy, sortOrder])

    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title="Proveedores no disponibles"
                    message="No se puede conectar con el servidor para cargar los proveedores. Verifica tu conexión e intenta nuevamente."
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
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Gestión de Proveedores</h2>
                        <p className="text-purple-100">Administra tu red de proveedores</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">{providers.length}</div>
                            <div className="text-sm text-purple-100">Total</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">
                                {providers.filter((p) => p.phone && p.phone.trim() !== "").length}
                            </div>
                            <div className="text-sm text-purple-100">Con Teléfono</div>
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
                            placeholder="Buscar proveedores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={isOffline}
                        />
                    </div>

                    {/* Controles */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showFilters ? "bg-purple-50 border-purple-200 text-purple-700" : "border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <Filter size={16} />
                            Filtros
                        </button>

                        {/* Vista */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 ${viewMode === "grid" ? "bg-purple-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 ${viewMode === "list" ? "bg-purple-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
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
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading || isOffline}
                        >
                            <Plus size={20} />
                            Agregar Proveedor
                        </button>
                    </div>
                </div>

                {/* Panel de filtros expandible */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="name">Nombre</option>
                                    <option value="direction">Dirección</option>
                                    <option value="phone">Teléfono</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <p className="ml-3 text-gray-500">Cargando proveedores...</p>
                    </div>
                ) : (
                    <>
                        {/* Vista de cuadrícula */}
                        {viewMode === "grid" && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedProviders.map((provider) => (
                                        <ProviderCard
                                            key={provider.provider_id}
                                            provider={provider}
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
                                    {paginatedProviders.map((provider) => (
                                        <ProviderListItem
                                            key={provider.provider_id}
                                            provider={provider}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            isOffline={isOffline}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado vacío */}
                        {filteredProviders.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? "No se encontraron proveedores" : "No hay proveedores"}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm ? "Intenta ajustar los filtros de búsqueda" : "Comienza agregando tu primer proveedor"}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={handleAdd}
                                        className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        disabled={isOffline}
                                    >
                                        <Plus size={20} />
                                        Agregar Proveedor
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
                                            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProviders.length)} de{" "}
                                            {filteredProviders.length} proveedores
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
                                                                ? "bg-purple-500 text-white"
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
                    itemType="proveedores"
                />
            )}

            {/* Diálogo de confirmación para eliminar */}
            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, providerId: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Proveedor"
                message="¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    )
}

// Componente para tarjeta de proveedor
function ProviderCard({ provider, onEdit, onDelete, isOffline }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg truncate">{provider.name}</h3>
                <div className="flex items-center gap-1">
                    <Users size={16} className="text-purple-500" />
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {provider.direction && (
                    <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-2">{provider.direction}</span>
                    </div>
                )}
                {provider.phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{provider.phone}</span>
                    </div>
                )}
                {!provider.direction && !provider.phone && (
                    <p className="text-sm text-gray-500 italic">Sin información de contacto</p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(provider.provider_id)}
                    disabled={isOffline}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Edit size={16} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(provider.provider_id)}
                    disabled={isOffline}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}

// Componente para elemento de lista de proveedor
function ProviderListItem({ provider, onEdit, onDelete, isOffline }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-purple-500" />
                        <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
                    </div>
                    <div className="space-y-1">
                        {provider.direction && (
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{provider.direction}</span>
                            </div>
                        )}
                        {provider.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{provider.phone}</span>
                            </div>
                        )}
                        {!provider.direction && !provider.phone && (
                            <p className="text-sm text-gray-500 italic">Sin información de contacto</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={() => onEdit(provider.provider_id)}
                        disabled={isOffline}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Edit size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(provider.provider_id)}
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
