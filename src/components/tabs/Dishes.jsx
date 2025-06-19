"use client"

import { useState, useEffect } from "react"
import {
    Clock,
    Package,
    AlertCircle,
    RefreshCw,
    ShoppingCart,
    Search,
    Star,
    Grid,
    List,
    CheckCircle,
    Plus,
    Edit,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    UtensilsCrossed,
} from "lucide-react"
import { getDishes, createDish, updateDish, deleteDish } from "../../utils/dishes.js"
import { getOrders, createOrder, updateOrder } from "../../utils/orders.js"
import { getStatuses } from "../../utils/status.js"
import { getProducts, updateProductDetail } from "../../utils/products.js"
import { getCategories } from "../../utils/categories.js"
import { useToast } from "../ui/toast-container"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"

// Componente para la vista de ecommerce de platos
function EcommerceView({ dishes, categories, loading, isOffline, onAddToCart }) {
    const [viewMode, setViewMode] = useState("grid")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("name")

    const safeCategories = Array.isArray(categories) ? categories : []
    const safeDishes = Array.isArray(dishes) ? dishes : []

    // Filtrar platos disponibles (que tengan stock)
    const availableDishes = safeDishes.filter((dish) => {
        // Verificar si el plato tiene productos y si hay stock disponible
        if (dish.products && Array.isArray(dish.products)) {
            return dish.products.every((product) => {
                return product.product_detail && product.product_detail.quantity > 0
            })
        }
        return true // Si no tiene productos definidos, considerarlo disponible
    })

    // Filtrar platos
    const filteredDishes = availableDishes.filter((dish) => {
        const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !selectedCategory || dish.category_id === Number.parseInt(selectedCategory)
        return matchesSearch && matchesCategory
    })

    // Ordenar platos
    const sortedDishes = [...filteredDishes].sort((a, b) => {
        switch (sortBy) {
            case "price":
                return (a.price || 0) - (b.price || 0)
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

                    <div className="flex flex-wrap gap-3 items-center">
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

            {/* Platos */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedDishes.map((dish) => (
                        <DishCard
                            key={dish.dishes_id || dish.id}
                            dish={dish}
                            onAddToCart={onAddToCart}
                            categories={safeCategories}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDishes.map((dish) => (
                        <DishListItem
                            key={dish.dishes_id || dish.id}
                            dish={dish}
                            onAddToCart={onAddToCart}
                            categories={safeCategories}
                        />
                    ))}
                </div>
            )}

            {sortedDishes.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <ShoppingCart size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {availableDishes.length === 0 ? "No hay platos con stock disponible" : "No se encontraron platos"}
                    </h3>
                    <p className="text-gray-500">
                        {isOffline
                            ? "Sin conexión al servidor"
                            : availableDishes.length === 0
                                ? "Todos los platos están agotados"
                                : "Intenta ajustar los filtros de búsqueda"}
                    </p>
                </div>
            )}
        </div>
    )
}

// Componente para mostrar un plato en vista de cuadrícula
function DishCard({ dish, onAddToCart, categories }) {
    const price = dish.price || 0
    const description = dish.description || "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."
    const rating = dish.rating || 4.2

    const category = categories.find((c) => c.category_id === dish.category_id)

    // Verificar stock disponible
    const hasStock =
        dish.products && Array.isArray(dish.products)
            ? dish.products.every((product) => product.product_detail && product.product_detail.quantity > 0)
            : true

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                <img
                    src={`https://placehold.co/300x200/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                />
                {!hasStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold">AGOTADO</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{dish.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm text-gray-600">{rating}</span>
                    </div>
                </div>

                {category && (
                    <div className="mb-2">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {category.name}
                        </span>
                    </div>
                )}

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

                <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">${price}</div>
                    {dish.products && dish.products.length > 0 && (
                        <div className="text-xs text-gray-500">
                            Stock: {dish.products.reduce((total, product) => total + (product.product_detail?.quantity || 0), 0)}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onAddToCart(dish)}
                    disabled={!hasStock}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${hasStock ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <ShoppingCart size={16} className="inline mr-2" />
                    {hasStock ? "Ordenar" : "Sin Stock"}
                </button>
            </div>
        </div>
    )
}

// Componente para mostrar un plato en vista de lista
function DishListItem({ dish, onAddToCart, categories }) {
    const price = dish.price || 0
    const description = dish.description || "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."
    const rating = dish.rating || 4.2

    const category = categories.find((c) => c.category_id === dish.category_id)

    const hasStock =
        dish.products && Array.isArray(dish.products)
            ? dish.products.every((product) => product.product_detail && product.product_detail.quantity > 0)
            : true

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                <div className="flex-shrink-0 relative">
                    <img
                        src={`https://placehold.co/120x120/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                        alt={dish.name}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                    {!hasStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <span className="text-white text-xs font-bold">AGOTADO</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{dish.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm text-gray-600">{rating}</span>
                                </div>
                                {category && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{category.name}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">{description}</p>
                            {dish.products && dish.products.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Stock disponible:{" "}
                                    {dish.products.reduce((total, product) => total + (product.product_detail?.quantity || 0), 0)}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3 ml-4">
                            <div className="text-2xl font-bold text-green-600">${price}</div>
                            <button
                                onClick={() => onAddToCart(dish)}
                                disabled={!hasStock}
                                className={`py-2 px-4 rounded-lg font-medium transition-colors ${hasStock
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                <ShoppingCart size={16} className="inline mr-2" />
                                {hasStock ? "Ordenar" : "Sin Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Componente para tarjeta de plato en gestión
function DishManagementCard({ dish, categories, onEdit, onDelete, isOffline }) {
    const price = dish.price || 0
    const category = categories.find((c) => c.category_id === dish.category_id)

    const getStockStatus = () => {
        if (dish.products && Array.isArray(dish.products)) {
            const totalStock = dish.products.reduce((total, product) => total + (product.product_detail?.quantity || 0), 0)
            if (totalStock === 0) return { color: "text-red-600 bg-red-50", text: "Sin stock" }
            if (totalStock < 10) return { color: "text-yellow-600 bg-yellow-50", text: "Stock bajo" }
            return { color: "text-green-600 bg-green-50", text: "En stock" }
        }
        return { color: "text-gray-600 bg-gray-50", text: "Sin productos" }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-200 relative mb-4 rounded-lg overflow-hidden">
                <img
                    src={`https://placehold.co/300x200/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{dish.name}</h3>
                    {category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">{category.name}</span>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Precio:</span>
                        <span className="font-medium text-green-600">${price}</span>
                    </div>
                    {dish.products && dish.products.length > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Stock total:</span>
                            <span className="font-medium">
                                {dish.products.reduce((total, product) => total + (product.product_detail?.quantity || 0), 0)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onEdit(dish)}
                        disabled={isOffline}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Edit size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(dish.id)}
                        disabled={isOffline}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export function Dishes({ user }) {
    const [orders, setOrders] = useState([])
    const [availableDishes, setAvailableDishes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDish, setEditingDish] = useState(null)
    const [error, setError] = useState(null)
    const [isOffline, setIsOffline] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [statuses, setStatuses] = useState([])
    const [statusMap, setStatusMap] = useState({})
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [cart, setCart] = useState([])
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, dishId: null })

    // Estados para la gestión de platos
    const [dishViewMode, setDishViewMode] = useState("grid")
    const [dishSearchTerm, setDishSearchTerm] = useState("")
    const [dishCurrentPage, setDishCurrentPage] = useState(1)
    const [dishItemsPerPage, setDishItemsPerPage] = useState(12)
    const [dishSortBy, setDishSortBy] = useState("name")
    const [dishSortOrder, setDishSortOrder] = useState("asc")
    const [dishFilterCategory, setDishFilterCategory] = useState("all")
    const [showDishFilters, setShowDishFilters] = useState(false)

    const { showSuccess, showError, showWarning } = useToast()

    useEffect(() => {
        loadDishes()
        loadOrders()
        loadStatuses()
        loadProducts()
        loadCategories()
    }, [])

    const loadStatuses = async () => {
        try {
            const data = await getStatuses()
            if (data && !data.isConnectionError) {
                const statusesArray = Array.isArray(data) ? data : []
                setStatuses(statusesArray)

                const map = {}
                statusesArray.forEach((status) => {
                    map[status.status_id] = status.name.toLowerCase()
                })
                setStatusMap(map)
            }
        } catch (error) {
            console.error("Error cargando estados:", error)
        }
    }

    const loadProducts = async () => {
        try {
            const data = await getProducts()
            if (data && !data.isConnectionError) {
                setProducts(Array.isArray(data) ? data : [])
            } else {
                setProducts([])
            }
        } catch (error) {
            console.error("Error cargando productos:", error)
            setProducts([])
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

    const loadDishes = async () => {
        try {
            const data = await getDishes()
            if (data && !data.isConnectionError) {
                const formattedDishes = Array.isArray(data)
                    ? data.map((dish) => ({
                        id: dish.dishes_id,
                        dishes_id: dish.dishes_id,
                        name: dish.name,
                        price: dish.price || 0,
                        category_id: dish.category_id,
                        products_id: dish.products_id,
                        products: dish.products || [],
                        originalData: dish,
                    }))
                    : []

                setAvailableDishes(formattedDishes)
            } else {
                setAvailableDishes([])
            }
        } catch (error) {
            console.error("Error cargando platos:", error)
            setAvailableDishes([])
        }
    }

    const loadOrders = async () => {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        try {
            const data = await getOrders()

            if (data && data.isConnectionError) {
                setIsOffline(true)
                setOrders([])
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar las órdenes")
                setOrders([])
            } else {
                const formattedOrders = Array.isArray(data)
                    ? data.map((order) => {
                        // Buscar información del plato
                        const dish = availableDishes.find((d) => d.dishes_id === order.dishes_id) || {}

                        // El estado ahora viene directamente de la orden
                        const statusName = order.status || "pendiente"

                        return {
                            id: order.order_id,
                            order_id: order.order_id,
                            dishes_id: order.dishes_id,
                            user_id: order.user_id,
                            name: dish.name || "Plato desconocido",
                            status: statusName,
                            time: new Date(order.created_at || Date.now()).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            customer: `Mesa ${Math.floor(Math.random() * 10) + 1}`,
                            priority: "normal",
                            price: dish.price || 0,
                            category_id: dish.category_id,
                            originalData: order,
                            dishData: dish,
                        }
                    })
                    : []

                setOrders(formattedOrders)
                setIsOffline(false)
            }
        } catch (error) {
            console.error("Error cargando órdenes:", error)
            setError("Error inesperado al cargar las órdenes")
            setIsOffline(true)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = async () => {
        setIsRetrying(true)
        await loadDishes()
        await loadOrders()
        await loadStatuses()
        await loadProducts()
        await loadCategories()
        setTimeout(() => setIsRetrying(false), 1000)
    }

    // Función para reducir el inventario de productos
    const reduceProductInventory = async (dishProducts) => {
        try {
            for (const dishProduct of dishProducts) {
                const product = products.find((p) => p.products_id === dishProduct.products_id)
                if (product && product.product_detail) {
                    const newQuantity = (product.product_detail.quantity || 0) - (dishProduct.quantity || 1)

                    const updateResult = await updateProductDetail(product.product_detail.product_detail_id, {
                        ...product.product_detail,
                        quantity: Math.max(0, newQuantity),
                    })

                    if (updateResult && !updateResult.isConnectionError) {
                        console.log(`Inventario reducido para ${product.name}: ${newQuantity}`)
                    }
                }
            }

            await loadProducts()
            await loadDishes() // Recargar platos para actualizar disponibilidad
        } catch (error) {
            console.error("Error reduciendo inventario:", error)
        }
    }

    // Función para actualizar el estado de una orden
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setLoading(true)

            const order = orders.find((order) => order.id === orderId)
            if (!order) {
                showError("Error", "No se encontró información de la orden")
                return
            }

            // Actualizar el estado directamente en la orden
            const orderData = {
                status: newStatus,
            }

            const result = await updateOrder(order.order_id, orderData)

            if (result && !result.isConnectionError) {
                // Si el plato pasa a "preparando", reducir inventario
                if (newStatus === "preparando" && order.dishData.products && Array.isArray(order.dishData.products)) {
                    await reduceProductInventory(order.dishData.products)
                }

                showSuccess("Éxito", `Estado actualizado a: ${newStatus}`)
                await loadOrders()
            } else {
                throw new Error("No se pudo actualizar el estado de la orden")
            }
        } catch (error) {
            console.error("Error actualizando estado:", error)
            showError("Error", `Error al actualizar el estado: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Función para crear una nueva orden
    const handleAddToCart = async (dish) => {
        try {
            // Verificar disponibilidad de productos antes de crear la orden
            if (dish.products && Array.isArray(dish.products)) {
                for (const dishProduct of dish.products) {
                    const availableProduct = products.find((p) => p.products_id === dishProduct.products_id)
                    if (availableProduct && availableProduct.product_detail) {
                        const requiredQuantity = dishProduct.quantity || 1
                        const availableQuantity = availableProduct.product_detail.quantity || 0

                        if (availableQuantity < requiredQuantity) {
                            showError(
                                "Stock insuficiente",
                                `No hay suficiente ${availableProduct.name}. Disponible: ${availableQuantity}, Requerido: ${requiredQuantity}`,
                            )
                            return
                        }
                    }
                }
            }

            // Crear la orden
            const orderData = {
                dishes_id: dish.dishes_id,
                user_id: user?.user_id || "default-user-id", // Usar el ID del usuario actual
            }

            console.log("Creando orden:", orderData)

            const result = await createOrder(orderData)

            if (result && result.isConnectionError) {
                showError("Sin conexión", "No se puede crear la orden sin conexión al servidor")
            } else if (result && result.success) {
                showSuccess("¡Orden creada!", `Tu orden de ${dish.name} ha sido creada`)

                // Agregar al carrito local para mostrar feedback inmediato
                const existingItem = cart.find((cartItem) => cartItem.dishes_id === dish.dishes_id)
                if (existingItem) {
                    setCart(
                        cart.map((cartItem) =>
                            cartItem.dishes_id === dish.dishes_id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                        ),
                    )
                } else {
                    setCart([...cart, { ...dish, quantity: 1 }])
                }

                await loadOrders()
            } else {
                throw new Error("No se pudo crear la orden")
            }
        } catch (error) {
            console.error("Error al crear la orden:", error)
            showError("Error", `Error al crear la orden: ${error.message}`)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pendiente":
                return "bg-yellow-50 border-yellow-200 text-yellow-800"
            case "preparando":
                return "bg-blue-50 border-blue-200 text-blue-800"
            case "listo":
                return "bg-green-50 border-green-200 text-green-800"
            case "entregado":
                return "bg-gray-50 border-gray-200 text-gray-800"
            default:
                return "bg-gray-50 border-gray-200 text-gray-800"
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "alta":
                return <AlertCircle className="w-4 h-4 text-red-500" />
            case "normal":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "baja":
                return <Package className="w-4 h-4 text-gray-500" />
            default:
                return <Clock className="w-4 h-4 text-blue-500" />
        }
    }

    const getStatusActions = (order) => {
        switch (order.status) {
            case "pendiente":
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, "preparando")}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                    >
                        Iniciar
                    </button>
                )
            case "preparando":
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, "listo")}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                    >
                        Completar
                    </button>
                )
            case "listo":
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, "entregado")}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
                    >
                        Entregar
                    </button>
                )
            default:
                return null
        }
    }

    const getOrdersByStatus = (status) => {
        return orders.filter((order) => order.status === status)
    }

    const getStatusTitle = (status) => {
        switch (status) {
            case "pendiente":
                return "Pendientes"
            case "preparando":
                return "En Preparación"
            case "listo":
                return "Listos para Entregar"
            case "entregado":
                return "Entregados"
            default:
                return status
        }
    }

    const handleAddNewDish = () => {
        setEditingDish(null)
        setSelectedProducts([])
        setIsModalOpen(true)
    }

    const handleAddProduct = (productId) => {
        const product = products.find((p) => p.products_id === productId)
        if (!product) {
            showWarning("Error", "No se pudo encontrar el producto seleccionado")
            return
        }

        const isAlreadySelected = selectedProducts.some((p) => p.products_id === product.products_id)
        if (!isAlreadySelected) {
            setSelectedProducts([...selectedProducts, product])
        }
    }

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter((p) => p.products_id !== productId))
    }

    const handleSaveDish = async (formData) => {
        try {
            setLoading(true)

            const manualPrice = Number.parseFloat(formData.price) || 0
            const selectedProductId = selectedProducts.length > 0 ? selectedProducts[0].products_id : null

            if (editingDish) {
                const originalDish = editingDish.originalData
                if (originalDish && originalDish.dishes_id) {
                    const dishData = {
                        name: formData.name,
                        category_id: formData.category_id || null,
                        status_id: originalDish.status_id,
                        products_id: selectedProductId,
                        price: manualPrice,
                    }

                    const result = await updateDish(originalDish.dishes_id, dishData)
                    if (result && !result.isConnectionError) {
                        showSuccess("Éxito", "Plato actualizado correctamente")
                        await loadDishes()
                    } else {
                        throw new Error("No se pudo actualizar el plato")
                    }
                }
            } else {
                const dishData = {
                    name: formData.name,
                    category_id: formData.category_id || null,
                    products_id: selectedProductId,
                    price: manualPrice,
                }

                const result = await createDish(dishData)
                if (result && result.success) {
                    showSuccess("Éxito", "Plato creado correctamente")
                    await loadDishes()
                } else {
                    throw new Error("No se pudo crear el plato")
                }
            }
        } catch (error) {
            console.error("Error guardando plato:", error)
            showError("Error", `Error al guardar el plato: ${error.message}`)
        } finally {
            setLoading(false)
            setIsModalOpen(false)
            setEditingDish(null)
            setSelectedProducts([])
        }
    }

    const handleEditDish = (dish) => {
        setSelectedProducts([])
        setEditingDish(dish)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (dishId) => {
        if (isOffline) {
            showWarning("Sin conexión", "No se pueden eliminar platos sin conexión al servidor")
            return
        }

        if (user?.role !== "admin") {
            showWarning("Acceso denegado", "No tienes permisos para eliminar platos")
            return
        }

        setDeleteConfirm({ isOpen: true, dishId })
    }

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)

            if (deleteConfirm.dishId) {
                const result = await deleteDish(deleteConfirm.dishId)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede eliminar el plato sin conexión al servidor")
                } else if (result && result.success) {
                    await loadDishes()
                    showSuccess("Éxito", "Plato eliminado correctamente")
                } else {
                    throw new Error("No se pudo eliminar el plato")
                }
            }
        } catch (error) {
            console.error("Error eliminando plato:", error)
            showError("Error", `Error al eliminar el plato: ${error.message}`)
        } finally {
            setLoading(false)
            setDeleteConfirm({ isOpen: false, dishId: null })
        }
    }

    // Filtrar y ordenar platos para gestión
    const filteredDishes = availableDishes
        .filter((dish) => {
            const matchesSearch = dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase())
            const matchesCategory = dishFilterCategory === "all" || dish.category_id === dishFilterCategory
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            let aValue, bValue
            switch (dishSortBy) {
                case "name":
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case "price":
                    aValue = a.price || 0
                    bValue = b.price || 0
                    break
                case "category":
                    const aCat = categories.find((c) => c.category_id === a.category_id)?.name || ""
                    const bCat = categories.find((c) => c.category_id === b.category_id)?.name || ""
                    aValue = aCat.toLowerCase()
                    bValue = bCat.toLowerCase()
                    break
                default:
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
            }

            if (dishSortOrder === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    // Paginación para platos
    const dishTotalPages = Math.ceil(filteredDishes.length / dishItemsPerPage)
    const dishStartIndex = (dishCurrentPage - 1) * dishItemsPerPage
    const paginatedDishes = filteredDishes.slice(dishStartIndex, dishStartIndex + dishItemsPerPage)

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setDishCurrentPage(1)
    }, [dishSearchTerm, dishFilterCategory, dishSortBy, dishSortOrder])

    const statusList = ["pendiente", "preparando", "listo", "entregado"]

    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title="Órdenes no disponibles"
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

                {/* Platos disponibles para seleccionar */}
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Platos Disponibles</h2>
                    <EcommerceView
                        dishes={availableDishes}
                        categories={categories}
                        loading={loading}
                        isOffline={isOffline}
                        onAddToCart={handleAddToCart}
                    />
                </div>

                {/* Sección de órdenes del cliente */}
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Mis Órdenes</h2>
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading || isRetrying}
                        >
                            <RefreshCw size={16} className={loading || isRetrying ? "animate-spin" : ""} />
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <p className="ml-3 text-gray-500">Cargando órdenes...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {statusList.map((status) => (
                                <div key={status} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-gray-700">{getStatusTitle(status)}</h3>
                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                                            {getOrdersByStatus(status).length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {getOrdersByStatus(status).map((order) => (
                                            <div key={order.id} className={`p-4 rounded-lg border-2 ${getStatusColor(order.status)}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {getPriorityIcon(order.priority)}
                                                        <span className="font-medium">{order.name}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{order.time}</span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-3">
                                                    <p className="font-medium text-green-600 text-base mb-1">${order.price}</p>
                                                    {order.category_id && categories.length > 0 && (
                                                        <p>
                                                            Categoría:{" "}
                                                            <span className="font-medium">
                                                                {categories.find((c) => c.category_id === order.category_id)?.name || "Sin categoría"}
                                                            </span>
                                                        </p>
                                                    )}
                                                    <p className="mt-1">
                                                        Estado:{" "}
                                                        <span className="font-medium capitalize">
                                                            {status === "pendiente"
                                                                ? "En espera"
                                                                : status === "preparando"
                                                                    ? "En preparación"
                                                                    : status === "listo"
                                                                        ? "Listo para recoger"
                                                                        : "Entregado"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {getOrdersByStatus(status).length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>
                                                    No hay órdenes{" "}
                                                    {status === "pendiente"
                                                        ? "pendientes"
                                                        : status === "preparando"
                                                            ? "en preparación"
                                                            : status === "listo"
                                                                ? "listas"
                                                                : "entregadas"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {orders.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Package size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes órdenes activas</h3>
                            <p className="text-gray-500">Selecciona un plato de la sección superior para comenzar a ordenar</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Vista para administradores
    return (
        <div className="space-y-6">
            <ConnectionStatus onRetry={handleRetry} />

            {/* Header con estadísticas */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Gestión de Platos y Órdenes</h2>
                        <p className="text-orange-100">Administra tu menú y supervisa las órdenes</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">{availableDishes.length}</div>
                            <div className="text-sm text-orange-100">Platos</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">{orders.length}</div>
                            <div className="text-sm text-orange-100">Órdenes</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <div className="text-2xl font-bold">{getOrdersByStatus("pendiente").length}</div>
                            <div className="text-sm text-orange-100">Pendientes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Órdenes</p>
                            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-600">{getOrdersByStatus("pendiente").length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">En Preparación</p>
                            <p className="text-2xl font-bold text-blue-600">{getOrdersByStatus("preparando").length}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Listos</p>
                            <p className="text-2xl font-bold text-green-600">{getOrdersByStatus("listo").length}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Entregados</p>
                            <p className="text-2xl font-bold text-gray-600">{getOrdersByStatus("entregado").length}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Gestión de Platos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">Gestión de Platos</h2>
                            <p className="text-gray-600">Administra tu menú de platos</p>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Búsqueda */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar platos..."
                                    value={dishSearchTerm}
                                    onChange={(e) => setDishSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    disabled={isOffline}
                                />
                            </div>

                            {/* Filtros */}
                            <button
                                onClick={() => setShowDishFilters(!showDishFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showDishFilters
                                    ? "bg-orange-50 border-orange-200 text-orange-700"
                                    : "border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                <Filter size={16} />
                                Filtros
                            </button>

                            {/* Vista */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setDishViewMode("grid")}
                                    className={`p-2 ${dishViewMode === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setDishViewMode("list")}
                                    className={`p-2 ${dishViewMode === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
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
                                onClick={handleAddNewDish}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                disabled={loading || isOffline}
                            >
                                <Plus size={20} />
                                Nuevo Plato
                            </button>
                        </div>
                    </div>

                    {/* Panel de filtros expandible */}
                    {showDishFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={dishFilterCategory}
                                        onChange={(e) => setDishFilterCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="all">Todas las categorías</option>
                                        {categories.map((category) => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                    <select
                                        value={dishSortBy}
                                        onChange={(e) => setDishSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="name">Nombre</option>
                                        <option value="category">Categoría</option>
                                        <option value="price">Precio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                                    <select
                                        value={dishSortOrder}
                                        onChange={(e) => setDishSortOrder(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="asc">Ascendente</option>
                                        <option value="desc">Descendente</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenido de platos */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            <p className="ml-3 text-gray-500">Cargando platos...</p>
                        </div>
                    ) : (
                        <>
                            {/* Vista de cuadrícula */}
                            {dishViewMode === "grid" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedDishes.map((dish) => (
                                        <DishManagementCard
                                            key={dish.id}
                                            dish={dish}
                                            categories={categories}
                                            onEdit={handleEditDish}
                                            onDelete={handleDeleteClick}
                                            isOffline={isOffline}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Vista de lista */}
                            {dishViewMode === "list" && (
                                <div className="space-y-4">
                                    {paginatedDishes.map((dish) => (
                                        <div
                                            key={dish.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <UtensilsCrossed size={20} className="text-orange-500" />
                                                        <h3 className="font-semibold text-gray-900 text-lg">{dish.name}</h3>
                                                        {categories.find((c) => c.category_id === dish.category_id) && (
                                                            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                {categories.find((c) => c.category_id === dish.category_id)?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <span className="text-gray-500">
                                                            Precio:{" "}
                                                            <span className="font-medium text-green-600">${dish.price}</span>
                                                        </span>
                                                        {dish.products && dish.products.length > 0 && (
                                                            <span className="text-gray-500">
                                                                Stock:{" "}
                                                                <span className="font-medium text-gray-900">
                                                                    {dish.products.reduce(
                                                                        (total, product) => total + (product.product_detail?.quantity || 0),
                                                                        0,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleEditDish(dish)}
                                                        disabled={isOffline}
                                                        className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Edit size={16} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(dish.id)}
                                                        disabled={isOffline}
                                                        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 size={16} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Estado vacío */}
                            {filteredDishes.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {dishSearchTerm || dishFilterCategory !== "all" ? "No se encontraron platos" : "No hay platos"}
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {dishSearchTerm || dishFilterCategory !== "all"
                                            ? "Intenta ajustar los filtros de búsqueda"
                                            : "Comienza agregando tu primer plato"}
                                    </p>
                                    {!dishSearchTerm && dishFilterCategory === "all" && (
                                        <button
                                            onClick={handleAddNewDish}
                                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            disabled={isOffline}
                                        >
                                            <Plus size={20} />
                                            Agregar Plato
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Paginación */}
                            {dishTotalPages > 1 && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">
                                                Mostrando {dishStartIndex + 1} a{" "}
                                                {Math.min(dishStartIndex + dishItemsPerPage, filteredDishes.length)} de {filteredDishes.length}{" "}
                                                platos
                                            </span>
                                            <select
                                                value={dishItemsPerPage}
                                                onChange={(e) => {
                                                    setDishItemsPerPage(Number(e.target.value))
                                                    setDishCurrentPage(1)
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
                                                onClick={() => setDishCurrentPage(Math.max(1, dishCurrentPage - 1))}
                                                disabled={dishCurrentPage === 1}
                                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, dishTotalPages) }, (_, i) => {
                                                    let pageNum
                                                    if (dishTotalPages <= 5) {
                                                        pageNum = i + 1
                                                    } else if (dishCurrentPage <= 3) {
                                                        pageNum = i + 1
                                                    } else if (dishCurrentPage >= dishTotalPages - 2) {
                                                        pageNum = dishTotalPages - 4 + i
                                                    } else {
                                                        pageNum = dishCurrentPage - 2 + i
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setDishCurrentPage(pageNum)}
                                                            className={`px-3 py-1 rounded-lg ${dishCurrentPage === pageNum
                                                                ? "bg-orange-500 text-white"
                                                                : "border border-gray-300 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setDishCurrentPage(Math.min(dishTotalPages, dishCurrentPage + 1))}
                                                disabled={dishCurrentPage === dishTotalPages}
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
            </div>

            {/* Tablero de órdenes */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Gestión de Órdenes</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando órdenes...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {statusList.map((status) => (
                            <div key={status} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-700">{getStatusTitle(status)}</h3>
                                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                                        {getOrdersByStatus(status).length}
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {getOrdersByStatus(status).map((order) => (
                                        <div key={order.id} className={`p-4 rounded-lg border-2 ${getStatusColor(order.status)}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getPriorityIcon(order.priority)}
                                                    <span className="font-medium">{order.name}</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{order.time}</span>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-3">
                                                <p className="font-medium text-green-600 text-base mb-1">${order.price}</p>
                                                {order.category_id && categories.length > 0 && (
                                                    <p>
                                                        Categoría:{" "}
                                                        <span className="font-medium">
                                                            {categories.find((c) => c.category_id === order.category_id)?.name || "Sin categoría"}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between">{getStatusActions(order)}</div>
                                        </div>
                                    ))}

                                    {getOrdersByStatus(status).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>
                                                No hay órdenes{" "}
                                                {status === "pendiente"
                                                    ? "pendientes"
                                                    : status === "preparando"
                                                        ? "en preparación"
                                                        : status === "listo"
                                                            ? "listas"
                                                            : "entregadas"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para agregar/editar plato */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">{editingDish ? "Editar Plato" : "Nuevo Plato"}</h3>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.target)
                                handleSaveDish({
                                    name: formData.get("name"),
                                    category_id: formData.get("category_id"),
                                    price: formData.get("price"),
                                })
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={editingDish?.name || ""}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        name="category_id"
                                        defaultValue={editingDish?.category_id || ""}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map((category) => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio del Plato</label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editingDish?.price || ""}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                {/* Sección de productos simplificada */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium text-gray-700 mb-3">Productos del Plato</h4>

                                    <div className="flex gap-2 mb-4">
                                        <select
                                            id="product-selector"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="">Seleccionar producto</option>
                                            {products.map((product) => (
                                                <option key={product.products_id} value={product.products_id}>
                                                    {product.name} - ${product.product_detail?.price}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const select = document.getElementById("product-selector")
                                                if (select && select.value) {
                                                    handleAddProduct(select.value)
                                                    select.value = ""
                                                } else {
                                                    showWarning("Advertencia", "Por favor seleccione un producto")
                                                }
                                            }}
                                            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedProducts.length === 0 ? (
                                            <p className="text-center py-4 text-gray-500">No hay productos seleccionados</p>
                                        ) : (
                                            selectedProducts.map((product) => (
                                                <div
                                                    key={product.products_id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            ${product.product_detail?.price}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(product.products_id)}
                                                        className="p-1 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false)
                                            setEditingDish(null)
                                            setSelectedProducts([])
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <RefreshCw size={16} className="animate-spin mr-2" />
                                                Guardando...
                                            </span>
                                        ) : editingDish ? (
                                            "Actualizar"
                                        ) : (
                                            "Crear"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Diálogo de confirmación para eliminar */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Eliminar Plato</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que quieres eliminar este plato? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, dishId: null })}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
