import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import { getProviders, deleteProvider, createProvider, updateProvider, getProviderById } from "../../utils/db"

export function Providers() {
    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)

    useEffect(() => {
        loadProviders()
    }, [])

    const loadProviders = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getProviders()
            console.log("Proveedores cargados:", data)
            setProviders(data || [])
        } catch (error) {
            console.error("Error cargando proveedores:", error)
            setError("Error al cargar los proveedores. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (providerId) => {
        try {
            // Buscar el proveedor en la lista actual
            const itemToEdit = providers.find((item) => item.provider_id === providerId)

            if (itemToEdit) {
                console.log("Proveedor encontrado para editar:", itemToEdit)

                // Intentar obtener datos más detallados del proveedor si es necesario
                try {
                    const providerDetails = await getProviderById(providerId)
                    if (providerDetails) {
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
                alert(`Proveedor con ID ${providerId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            alert(`Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDelete = async (providerId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
            try {
                setLoading(true)
                console.log("Eliminando proveedor con ID:", providerId)
                const result = await deleteProvider(providerId)

                if (result && result.message) {
                    await loadProviders()
                    alert("Proveedor eliminado con éxito")
                } else {
                    throw new Error("No se pudo eliminar el proveedor")
                }
            } catch (error) {
                console.error("Error eliminando proveedor:", error)
                alert(`Error al eliminar el proveedor: ${error.message}`)
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
                // Crear un nuevo proveedor
                const providerData = {
                    name: formData.name || "",
                    direction: formData.direction || "",
                    phone: formData.phone || "",
                }

                console.log("Creando proveedor con datos:", providerData)
                result = await createProvider(providerData)

                if (result && result.provider) {
                    console.log("Proveedor creado con éxito:", result)
                    await loadProviders()
                    alert("Proveedor creado con éxito")
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
                result = await updateProvider(editingItem.provider_id, providerData)

                if (result) {
                    console.log("Proveedor actualizado con éxito:", result)
                    await loadProviders()
                    alert("Proveedor actualizado con éxito")
                } else {
                    throw new Error("No se pudo actualizar el proveedor")
                }
            }
        } catch (error) {
            console.error("Error guardando proveedor:", error)
            alert(`Error al guardar el proveedor: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    const filteredProviders = providers.filter((provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar proveedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadProviders}
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
                        Agregar Proveedor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proveedores</h3>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando proveedores...</p>
                    </div>
                ) : (
                    <ItemList items={filteredProviders} onEdit={handleEdit} onDelete={handleDelete} itemType="proveedores" />
                )}
            </div>

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={editingItem}
                mode={modalMode}
                itemType="proveedores"
            />
        </div>
    )
}
