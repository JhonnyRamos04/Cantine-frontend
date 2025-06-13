import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import {
    getProducts,
    deleteProduct,
    createProduct,
    createProductDetail,
    getProductDetailById,
    getCategories,
    updateProduct,
    updateProductDetail,
} from "../../utils/db"
import { useToast } from "../ui/toast-container"
import { ConfirmationDialog } from "../ui/ConfirmationDialog"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"

// Componente Product para la gestión de productos (solo admin)
export function Product({ user }) {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null })
    const [isOffline, setIsOffline] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)

    const { showSuccess, showError, showWarning } = useToast()

    // Cargar productos y categorías al montar el componente
    useEffect(() => {
        loadProducts()
        loadCategories()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        try {
            const data = await getProducts()

            if (data && data.isConnectionError) {
                setIsOffline(true)
                setProducts([])
                console.log("Sin conexión a la base de datos")
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los productos")
                setProducts([])
            } else {
                console.log("Productos cargados:", data)
                setProducts(Array.isArray(data) ? data : [])
                setIsOffline(false)
            }
        } catch (error) {
            console.error("Error cargando productos:", error)
            setError("Error inesperado al cargar los productos")
            setIsOffline(true)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const loadCategories = async () => {
        try {
            const data = await getCategories()
            if (data && !data.isConnectionError) {
                setCategories(Array.isArray(data) ? data : [])
            } else {
                setCategories([])
            }
        } catch (error) {
            console.error("Error cargando categorías:", error)
            setCategories([])
        }
    }

    const handleRetry = async () => {
        setIsRetrying(true)
        await loadProducts()
        await loadCategories()
        setTimeout(() => setIsRetrying(false), 1000)
    }

    const handleAdd = () => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden agregar elementos sin conexión al servidor")
            return
        }
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (itemId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden editar elementos sin conexión al servidor")
            return
        }

        try {
            const product = products.find((p) => p.products_id === itemId)
            if (product) {
                console.log("Editando producto:", product)

                if (product.products_details_id) {
                    try {
                        const detailData = await getProductDetailById(product.products_details_id)
                        if (detailData && !detailData.isConnectionError) {
                            // Combina los datos del producto con sus detalles
                            setEditingItem({ ...product, product_detail: detailData, isProduct: true })
                        } else {
                            setEditingItem({ ...product, isProduct: true }) // Si no se pueden obtener detalles, usa el producto original
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del producto:", detailError)
                        setEditingItem({ ...product, isProduct: true }) // En caso de error, usa el producto original
                    }
                } else {
                    setEditingItem({ ...product, isProduct: true }) // Si no hay products_details_id, usa el producto original
                }
            } else {
                console.error("Producto no encontrado con ID:", itemId)
                showError("Error", `Producto con ID ${itemId} no encontrado`)
                return
            }

            setModalMode("edit")
            setIsModalOpen(true)
        } catch (error) {
            console.error("Error preparando edición:", error)
            showError("Error", `Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDeleteClick = (itemId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden eliminar elementos sin conexión al servidor")
            return
        }

        if (user?.role !== "admin") {
            showWarning("Acceso denegado", "No tienes permisos para eliminar elementos")
            return
        }

        setDeleteConfirm({ isOpen: true, productId: itemId })
    }

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)

            if (deleteConfirm.productId) {
                console.log("Eliminando producto con ID:", deleteConfirm.productId)
                const result = await deleteProduct(deleteConfirm.productId)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede eliminar el producto sin conexión al servidor")
                } else if (result && result.message) {
                    await loadProducts()
                    showSuccess("Éxito", "Producto eliminado correctamente")
                } else {
                    throw new Error("No se pudo eliminar el producto")
                }
            }
        } catch (error) {
            console.error("Error eliminando elemento:", error)
            showError("Error", `Error al eliminar: ${error.message}`)
        } finally {
            setLoading(false)
            setDeleteConfirm({ isOpen: false, productId: null })
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
                // Lógica para crear un nuevo producto
                const productDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                console.log("Creando detalle de producto con datos:", productDetailData)
                const detailResult = await createProductDetail(productDetailData)

                if (detailResult && detailResult.success) {
                    console.log("Respuesta de createProductDetail:", detailResult.product_detail)
                    let products_details_id = null

                    if (detailResult.product_detail) {
                        products_details_id = detailResult.product_detail.products_details_id || detailResult.product_detail.id
                    }

                    if (products_details_id) {
                        const productData = {
                            name: formData.name,
                            category_id: formData.category_id || null,
                            products_details_id: products_details_id,
                        }

                        console.log("Creando producto con datos:", productData)
                        result = await createProduct(productData)

                        if (result && result.isConnectionError) {
                            showError("Sin conexión", "No se puede crear el producto sin conexión al servidor")
                        } else if (result && result.success) {
                            await loadProducts()
                            showSuccess("Éxito", "Producto creado correctamente")
                        } else {
                            throw new Error("No se pudo crear el producto")
                        }
                    } else {
                        throw new Error(
                            "No se pudo obtener el ID del detalle del producto. Respuesta del detalle: " +
                            JSON.stringify(detailResult.product_detail),
                        )
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del producto")
                }
            } else if (mode === "edit" && editingItem) {
                // Lógica de actualización para productos
                const productData = {
                    name: formData.name,
                    category_id: formData.category_id || null,
                }

                // Si hay un detalle de producto asociado, actualizarlo también
                if (editingItem.products_details_id) {
                    const productDetailData = {
                        description: formData.description || "",
                        quantity: Number.parseInt(formData.quantity) || 0,
                        price: Number.parseFloat(formData.price) || 0,
                        provided_id: formData.provided_id || null,
                    }
                    console.log(
                        "Actualizando detalle de producto con ID:",
                        editingItem.products_details_id,
                        "y datos:",
                        productDetailData,
                    )
                    await updateProductDetail(editingItem.products_details_id, productDetailData)
                }

                console.log("Actualizando producto con ID:", editingItem.products_id, "y datos:", productData)
                result = await updateProduct(editingItem.products_id, productData)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede actualizar el producto sin conexión al servidor")
                } else if (result) {
                    await loadProducts()
                    showSuccess("Éxito", "Producto actualizado correctamente")
                } else {
                    throw new Error("No se pudo actualizar el producto")
                }
            }
        } catch (error) {
            console.error("Error guardando:", error)
            showError("Error", `Error al guardar: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    // Filtrar productos según el término de búsqueda
    const filteredItems = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Si está offline, mostrar placeholder
    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title="Productos no disponibles"
                    message="No se puede conectar con el servidor. Verifica tu conexión e intenta nuevamente."
                    onRetry={handleRetry}
                    isRetrying={isRetrying}
                />
            </div>
        )
    }

    // Vista para administradores
    return (
        <div className="space-y-6">
            <ConnectionStatus onRetry={handleRetry} />

            {/* Header con búsqueda y botón agregar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
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
                        Agregar Producto
                    </button>
                </div>
            </div>

            {/* Lista de productos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>

                {error && !isOffline && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando productos...</p>
                    </div>
                ) : (
                    <ItemList items={filteredItems} onEdit={handleEdit} onDelete={handleDeleteClick} itemType="productos" />
                )}
            </div>

            {/* Modal para agregar/editar */}
            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={editingItem}
                mode={modalMode}
                itemType="productos"
            />

            {/* Diálogo de confirmación para eliminar */}
            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Producto"
                message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    )
}