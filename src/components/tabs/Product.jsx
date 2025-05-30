import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw, ShoppingCart, Star, Grid, List } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import {
    getProducts,
    deleteProduct,
    createProduct,
    createProductDetail,
    getProductDetailById,
    getCategories,
} from "../../utils/db"
import { useToast } from "../ui/toast-container"
import { ConfirmationDialog } from "../ui/ConfirmationDialog"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"

// Componente para la vista de ecommerce (clientes)
function EcommerceView({ products, categories, loading, isOffline, onAddToCart }) {
    const [viewMode, setViewMode] = useState("grid") // grid o list
    const [selectedCategory, setSelectedCategory] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("name") // name, price, rating

    // Asegurar que categories sea siempre un array
    const safeCategories = Array.isArray(categories) ? categories : []
    const safeProducts = Array.isArray(products) ? products : []

    // Filtrar productos
    const filteredProducts = safeProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !selectedCategory || product.category_id === Number.parseInt(selectedCategory)
        return matchesSearch && matchesCategory
    })

    // Ordenar productos
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price":
                return (a.product_detail?.price || 0) - (b.product_detail?.price || 0)
            case "rating":
                return (b.rating || 0) - (a.rating || 0)
            default:
                return a.name.localeCompare(b.name)
        }
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="ml-3 text-gray-500">Cargando platos...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filtros y controles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Búsqueda */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar platos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            disabled={isOffline}
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Filtro por categoría */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isOffline}
                        >
                            <option value="">Todas las categorías</option>
                            {safeCategories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Ordenar por */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isOffline}
                        >
                            <option value="name">Ordenar por nombre</option>
                            <option value="price">Ordenar por precio</option>
                            <option value="rating">Ordenar por valoración</option>
                        </select>

                        {/* Vista */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 ${viewMode === "grid" ? "bg-green-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 ${viewMode === "list" ? "bg-green-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Productos */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedProducts.map((product) => (
                        <ProductCard key={product.products_id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedProducts.map((product) => (
                        <ProductListItem key={product.products_id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            )}

            {sortedProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <ShoppingCart size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron platos</h3>
                    <p className="text-gray-500">
                        {isOffline ? "Sin conexión al servidor" : "Intenta ajustar los filtros de búsqueda"}
                    </p>
                </div>
            )}
        </div>
    )
}

// Componente para card de producto (vista grid)
function ProductCard({ product, onAddToCart }) {
    const price = product.product_detail?.price || 0
    const stock = product.product_detail?.quantity || 0
    const rating = product.rating || 4.2 // Rating simulado
    const isAvailable = stock > 0

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen del producto */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                <img
                    src={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium">Agotado</span>
                    </div>
                )}
                {isAvailable && stock <= 5 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ¡Últimas unidades!
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm text-gray-600">{rating}</span>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.product_detail?.description ||
                        "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."}
                </p>

                <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">${price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{isAvailable ? `${stock} disponibles` : "Sin stock"}</div>
                </div>

                <button
                    onClick={() => onAddToCart(product)}
                    disabled={!isAvailable}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isAvailable ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isAvailable ? (
                        <>
                            <ShoppingCart size={16} className="inline mr-2" />
                            Agregar al carrito
                        </>
                    ) : (
                        "No disponible"
                    )}
                </button>
            </div>
        </div>
    )
}

// Componente para item de producto (vista lista)
function ProductListItem({ product, onAddToCart }) {
    const price = product.product_detail?.price || 0
    const stock = product.product_detail?.quantity || 0
    const rating = product.rating || 4.2
    const isAvailable = stock > 0

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                {/* Imagen */}
                <div className="flex-shrink-0">
                    <img
                        src={`/placeholder.svg?height=120&width=120&text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm text-gray-600">{rating}</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{isAvailable ? `${stock} disponibles` : "Sin stock"}</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                {product.product_detail?.description ||
                                    "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-3 ml-4">
                            <div className="text-2xl font-bold text-green-600">${price.toFixed(2)}</div>
                            <button
                                onClick={() => onAddToCart(product)}
                                disabled={!isAvailable}
                                className={`py-2 px-4 rounded-lg font-medium transition-colors ${isAvailable
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isAvailable ? (
                                    <>
                                        <ShoppingCart size={16} className="inline mr-2" />
                                        Agregar
                                    </>
                                ) : (
                                    "No disponible"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

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
    const [cart, setCart] = useState([])

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

    const handleAddToCart = (product) => {
        const existingItem = cart.find((item) => item.products_id === product.products_id)

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.products_id === product.products_id ? { ...item, quantity: item.quantity + 1 } : item,
                ),
            )
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }

        showSuccess("¡Agregado!", `${product.name} se agregó al carrito`)
    }

    const handleAdd = () => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden agregar productos sin conexión al servidor")
            return
        }
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (productId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden editar productos sin conexión al servidor")
            return
        }

        try {
            const product = products.find((p) => p.products_id === productId)
            if (product) {
                console.log("Editando producto:", product)

                if (product.products_details_id) {
                    try {
                        const detailData = await getProductDetailById(product.products_details_id)
                        if (detailData && !detailData.isConnectionError) {
                            product.detail = detailData
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del producto:", detailError)
                    }
                }

                setEditingItem(product)
                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Producto no encontrado con ID:", productId)
                showError("Error", `Producto con ID ${productId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            showError("Error", `Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDeleteClick = (productId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden eliminar productos sin conexión al servidor")
            return
        }

        if (user?.role !== "admin") {
            showWarning("Acceso denegado", "No tienes permisos para eliminar productos")
            return
        }

        setDeleteConfirm({ isOpen: true, productId })
    }

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
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
        } catch (error) {
            console.error("Error eliminando producto:", error)
            showError("Error", `Error al eliminar el producto: ${error.message}`)
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

            if (mode === "add") {
                const productDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                console.log("Creando detalle de producto:", productDetailData)
                const detailResult = await createProductDetail(productDetailData)

                if (detailResult && detailResult.isConnectionError) {
                    showError("Sin conexión", "No se puede crear el producto sin conexión al servidor")
                    return
                }

                if (detailResult && detailResult.success) {
                    let products_details_id = null

                    if (detailResult.product_detail && detailResult.product_detail.products_details_id) {
                        products_details_id = detailResult.product_detail.products_details_id
                    } else if (detailResult.product_detail && detailResult.product_detail.id) {
                        products_details_id = detailResult.product_detail.id
                    }

                    if (products_details_id) {
                        const productData = {
                            name: formData.name,
                            category_id: formData.category_id || null,
                            products_details_id: products_details_id,
                        }

                        console.log("Creando producto:", productData)
                        const result = await createProduct(productData)

                        if (result && result.isConnectionError) {
                            showError("Sin conexión", "No se puede crear el producto sin conexión al servidor")
                        } else if (result && result.success) {
                            await loadProducts()
                            showSuccess("Éxito", "Producto creado correctamente")
                        } else {
                            throw new Error("No se pudo crear el producto")
                        }
                    } else {
                        throw new Error("No se pudo obtener el ID del detalle del producto")
                    }
                } else {
                    throw new Error("No se pudo crear el detalle del producto")
                }
            } else if (mode === "edit" && editingItem) {
                console.log("Editando producto:", editingItem)
                showSuccess("Éxito", "Producto actualizado correctamente")
            }
        } catch (error) {
            console.error("Error guardando producto:", error)
            showError("Error", `Error al guardar el producto: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    // Filtrar productos según el término de búsqueda (solo para vista admin)
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Si está offline, mostrar placeholder
    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title={user?.role === "admin" ? "Productos no disponibles" : "Platos no disponibles"}
                    message="No se puede conectar con el servidor. Verifica tu conexión e intenta nuevamente."
                    onRetry={handleRetry}
                    isRetrying={isRetrying}
                />
            </div>
        )
    }

    // Vista para clientes (ecommerce)
    if (user?.role === "client") {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />

                {/* Header para clientes */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Nuestros Deliciosos Platos</h2>
                            <p className="text-green-100">Descubre nuestra variedad de platos preparados con amor</p>
                        </div>
                        {cart.length > 0 && (
                            <div className="bg-white/20 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="text-white" size={20} />
                                    <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <EcommerceView
                    products={products}
                    categories={categories}
                    loading={loading}
                    isOffline={isOffline}
                    onAddToCart={handleAddToCart}
                />
            </div>
        )
    }

    // Vista para administradores (original)
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
                    <ItemList items={filteredProducts} onEdit={handleEdit} onDelete={handleDeleteClick} itemType="productos" />
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
