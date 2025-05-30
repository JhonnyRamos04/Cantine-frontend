import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import { getProviders, deleteProvider, createProvider, updateProvider, getProviderById } from "../../utils/db"
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

            // Verificar si es un error de conexión
            if (data && data.isConnectionError) {
                setIsOffline(true)
                setProviders([])
                console.log("Sin conexión a la base de datos")
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los proveedores")
                setProviders([])
            } else {
                console.log("Proveedores cargados:", data)
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
            // Buscar el proveedor en la lista actual
            const itemToEdit = providers.find((item) => item.provider_id === providerId)

            if (itemToEdit) {
                console.log("Proveedor encontrado para editar:", itemToEdit)

                // Intentar obtener datos más detallados del proveedor si es necesario
                try {
                    const providerDetails = await getProviderById(providerId)
                    if (providerDetails && !providerDetails.isConnectionError) {
                        console.log("Detalles del proveedor obtenidos:", providerDetails)
                        // Usar los datos más actualizados
                        setEditingItem(providerDetails)
                    } else {
                        // Si no se pueden obtener detalles, usar los datos de la lista
                        setEditingItem(itemToEdit)
                    }
                } catch (detailError) {
                    console.error("Error obteniendo detalles del proveedor:", detailError)
                    // Si hay un error, usar los datos de la lista
                    setEditingItem(itemToEdit)
                }

                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Proveedor no encontrado con ID:", providerId)
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
            console.log("Eliminando proveedor con ID:", deleteConfirm.providerId)
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
                // Crear un nuevo proveedor
                const providerData = {
                    name: formData.name || "",
                    direction: formData.direction || "",
                    phone: formData.phone || "",
                }

                console.log("Creando proveedor con datos:", providerData)
                const result = await createProvider(providerData)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede crear el proveedor sin conexión al servidor")
                } else if (result && result.success) {
                    console.log("Proveedor creado con éxito:", result)
                    await loadProviders()
                    showSuccess("Éxito", "Proveedor creado correctamente")
                } else {
                    throw new Error("No se pudo crear el proveedor")
                }
            } else if (mode === "edit" && editingItem) {
                // Actualizar un proveedor existente
                // Solo incluir los campos que el backend espera y que tienen valores
                const providerData = {}

                // Solo agregar propiedades si tienen valores
                if (formData.name !== undefined && formData.name !== null) {
                    providerData.name = formData.name
                }

                if (formData.direction !== undefined) {
                    providerData.direction = formData.direction || ""
                }

                if (formData.phone !== undefined) {
                    providerData.phone = formData.phone || ""
                }

                console.log("Actualizando proveedor con ID:", editingItem.provider_id)
                console.log("Datos de actualización:", providerData)

                // Verificar que tenemos datos para actualizar
                if (Object.keys(providerData).length === 0) {
                    throw new Error("No hay datos para actualizar")
                }

                // Realizar la actualización
                const result = await updateProvider(editingItem.provider_id, providerData)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede actualizar el proveedor sin conexión al servidor")
                } else if (result) {
                    console.log("Proveedor actualizado con éxito:", result)
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

    const filteredProviders = providers.filter((provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Si está offline, mostrar placeholder
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

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar proveedores..."
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
                        Agregar Proveedor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proveedores</h3>

                {error && !isOffline && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">{isOffline ? "Intentando conectar..." : "Cargando proveedores..."}</p>
                    </div>
                ) : (
                    <ItemList
                        items={filteredProviders}
                        onEdit={!isOffline ? handleEdit : undefined}
                        onDelete={!isOffline ? handleDeleteClick : undefined}
                        itemType="proveedores"
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
