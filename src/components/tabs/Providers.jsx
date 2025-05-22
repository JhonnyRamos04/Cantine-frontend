import { useEffect, useState } from "react"
import { ItemList } from "../ItemList"
import { Category } from "../Category"
import { ItemFormModal } from "../ItemFormModal"
import {
    getProviders,
    deleteProvider,
    createProvider,
    updateProvider,
    getProviderById
} from "../../utils/db"

export const Providers = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Función para cargar proveedores que podemos llamar cuando necesitemos actualizar
    const loadProviders = async () => {
        try {
            setLoading(true)
            const providersData = await getProviders()
            console.log("Proveedores cargados:", providersData)
            setItems(providersData)
        } catch (error) {
            console.error("Error cargando proveedores:", error)
            setError("Error al cargar los proveedores. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    // Cargar proveedores al montar el componente
    useEffect(() => {
        loadProviders()
    }, [])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [modalMode, setModalMode] = useState("add") // "add" o "edit"

    const handleDelete = async (id) => {
        try {
            // Mostrar confirmación antes de eliminar
            if (!confirm("¿Está seguro de que desea eliminar este proveedor?")) {
                return
            }

            setLoading(true)
            console.log("Eliminando proveedor con ID:", id)
            const result = await deleteProvider(id)

            if (result && result.message) {
                // Recargar proveedores para reflejar los cambios
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

    const handleEdit = async (id) => {
        try {
            // Buscar el proveedor en la lista actual
            const itemToEdit = items.find(item => item.provider_id === id)

            if (itemToEdit) {
                console.log("Proveedor encontrado para editar:", itemToEdit)

                // Intentar obtener datos más detallados del proveedor si es necesario
                try {
                    const providerDetails = await getProviderById(id)
                    if (providerDetails) {
                        console.log("Detalles del proveedor obtenidos:", providerDetails)
                        // Usar los datos más actualizados
                        setCurrentItem(providerDetails)
                    } else {
                        // Si no se pueden obtener detalles, usar los datos de la lista
                        setCurrentItem(itemToEdit)
                    }
                } catch (detailError) {
                    console.error("Error obteniendo detalles del proveedor:", detailError)
                    // Si hay un error, usar los datos de la lista
                    setCurrentItem(itemToEdit)
                }

                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Proveedor no encontrado con ID:", id)
                alert(`Proveedor con ID ${id} no encontrado`)
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
                // Crear un nuevo proveedor
                const providerData = {
                    name: formData.name || "",
                    direction: formData.direction || "",
                    phone: formData.phone || ""
                }

                console.log("Creando proveedor con datos:", providerData)
                result = await createProvider(providerData)

                if (result && result.provider) {
                    console.log("Proveedor creado con éxito:", result)
                    // Recargar proveedores para reflejar los cambios
                    await loadProviders()
                    alert("Proveedor creado con éxito")
                } else {
                    throw new Error("No se pudo crear el proveedor")
                }
            } else if (mode === "edit" && currentItem) {
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

                console.log("Actualizando proveedor con ID:", currentItem.provider_id)
                console.log("Datos de actualización:", providerData)

                // Verificar que tenemos datos para actualizar
                if (Object.keys(providerData).length === 0) {
                    throw new Error("No hay datos para actualizar")
                }

                // Realizar la actualización
                result = await updateProvider(currentItem.provider_id, providerData)

                if (result) {
                    console.log("Proveedor actualizado con éxito:", result)
                    // Recargar proveedores para reflejar los cambios
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

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">Proveedores</h3>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Lista de Proveedores</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={loadProviders}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center"
                            disabled={loading}
                        >
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            className="w-10 h-10 bg-green-500 cursor-pointer hover:scale-105 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
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
                        <p className="mt-2 text-gray-500">Cargando proveedores...</p>
                    </div>
                ) : (
                    <ItemList
                        items={items}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        itemType='proveedores'
                    />
                )}
            </div>

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={currentItem}
                mode={modalMode}
                itemType="proveedores"
            />
        </div>
    )
}