import { useState, useEffect } from "react"
import {
    Clock,
    CheckCircle,
    Package,
    AlertCircle,
    RefreshCw,
    Plus,
    Trash,
    ShoppingCart,
    Search,
    Star,
    Grid,
    List,
} from "lucide-react"
import { getDishes, createDish, updateDish, deleteDish, getStatuses, getProducts, getCategories } from "../../utils/db"
import { useToast } from "../ui/toast-container"
import { ConnectionStatus } from "../ui/ConnectionStatus"
import { OfflinePlaceholder } from "../ui/OfflinePlaceholder"
import { ConfirmationDialog } from "../ui/ConfirmationDialog"
import { logDishUpdate, validateDishData, debugDishes } from "../../utils/debug-utils"

// Componente para la vista de ecommerce de platos
function EcommerceView({ dishes, categories, loading, isOffline, onAddToCart }) {
    const [viewMode, setViewMode] = useState("grid") // grid o list
    const [selectedCategory, setSelectedCategory] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("name") // name, price, rating

    // Asegurar que categories sea siempre un array
    const safeCategories = Array.isArray(categories) ? categories : []
    const safeDishes = Array.isArray(dishes) ? dishes : []

    // Filtrar platos
    const filteredDishes = safeDishes.filter((dish) => {
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron platos</h3>
                    <p className="text-gray-500">
                        {isOffline ? "Sin conexión al servidor" : "Intenta ajustar los filtros de búsqueda"}
                    </p>
                </div>
            )}
        </div>
    )
}

// Componente para mostrar un plato en vista de cuadrícula
function DishCard({ dish, onAddToCart, categories }) {
    // Calcular el precio como la suma de los productos relacionados
    let price = 0
    if (dish.products && Array.isArray(dish.products)) {
        price = dish.products.reduce((sum, prod) => sum + (prod.price || 0) * (prod.quantity || 1), 0)
    } else if (dish.price) {
        // Usar el precio ya calculado si existe
        price = dish.price
    }

    const description = dish.description || "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."
    const rating = dish.rating || 4.2 // Rating simulado

    // Encontrar la categoría del plato
    const category = categories.find((c) => c.category_id === dish.category_id)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen del plato */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                <img
                    src={`https://placehold.co/300x200/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                    alt={dish.name}
                    className="w-full h-48 object-cover"
                />
            </div>

            {/* Contenido */}
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
                    <div className="text-2xl font-bold text-green-600">${price.toFixed(2)}</div>
                    {dish.products && dish.products.length > 0 && (
                        <div className="text-xs text-gray-500">
                            {dish.products.length} {dish.products.length === 1 ? "producto" : "productos"}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onAddToCart(dish)}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
                >
                    <ShoppingCart size={16} className="inline mr-2" />
                    Preparar
                </button>
            </div>
        </div>
    )
}

// Componente para mostrar un plato en vista de lista
function DishListItem({ dish, onAddToCart, categories }) {
    // Calcular el precio como la suma de los productos relacionados
    let price = 0
    if (dish.products && Array.isArray(dish.products)) {
        price = dish.products.reduce((sum, prod) => sum + (prod.price || 0) * (prod.quantity || 1), 0)
    } else if (dish.price) {
        // Usar el precio ya calculado si existe
        price = dish.price
    }

    const description = dish.description || "Delicioso plato preparado con ingredientes frescos y de la mejor calidad."
    const rating = dish.rating || 4.2

    // Encontrar la categoría del plato
    const category = categories.find((c) => c.category_id === dish.category_id)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                {/* Imagen */}
                <div className="flex-shrink-0">
                    <img
                        src={`https://placehold.co/120x120/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                        alt={dish.name}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                </div>

                {/* Contenido */}
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
                                    {dish.products.length} {dish.products.length === 1 ? "producto" : "productos"}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3 ml-4">
                            <div className="text-2xl font-bold text-green-600">${price.toFixed(2)}</div>
                            <button
                                onClick={() => onAddToCart(dish)}
                                className="py-2 px-4 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
                            >
                                <ShoppingCart size={16} className="inline mr-2" />
                                Preparar
                            </button>
                        </div>
                    </div>
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
    const [totalPrice, setTotalPrice] = useState(0)
    const [cart, setCart] = useState([])
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, dishId: null })

    const { showSuccess, showError, showWarning } = useToast()

    // Cargar platos, estados, productos y categorías al montar el componente
    useEffect(() => {
        loadDishes()
        loadStatuses()
        loadProducts()
        loadCategories()
    }, [])

    // Calcular el precio total cuando cambian los productos seleccionados
    useEffect(() => {
        const total = selectedProducts.reduce((sum, product) => {
            return sum + (product.price || 0) * (product.quantity || 1)
        }, 0)
        setTotalPrice(total)
    }, [selectedProducts])

    const loadStatuses = async () => {
        try {
            const data = await getStatuses()
            if (data && !data.isConnectionError) {
                const statusesArray = Array.isArray(data) ? data : []
                setStatuses(statusesArray)

                // Crear un mapa de ID de estado a nombre de estado para facilitar la referencia
                const map = {}
                statusesArray.forEach((status) => {
                    map[status.status_id] = status.name.toLowerCase()
                })
                setStatusMap(map)
                console.log("Mapa de estados cargado:", map)
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

    // Modificar la función loadDishes para asegurar que los precios se calculen correctamente
    const loadDishes = async () => {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        try {
            const data = await getDishes()

            if (data && data.isConnectionError) {
                setIsOffline(true)
                setOrders([])
                setAvailableDishes([])
                console.log("Sin conexión a la base de datos")
            } else if (data && data.success === false) {
                setError(data.error || "Error al cargar los platos")
                setOrders([])
                setAvailableDishes([])
            } else {
                console.log("Platos cargados:", data)

                // Depurar el estado actual de los platos
                await debugDishes(data)

                // Transformar los datos de la API al formato que espera el componente
                const formattedDishes = Array.isArray(data)
                    ? data.map((dish) => {
                        // Determinar el estado basado en status_id o usar null por defecto
                        const statusName = dish.status_id ? statusMap[dish.status_id] || "pendiente" : null

                        // Calcular el precio como la suma de los productos relacionados
                        let price = 0
                        if (dish.products && Array.isArray(dish.products)) {
                            price = dish.products.reduce((sum, product) => {
                                const productPrice = product.price || 0
                                const quantity = product.quantity || 1
                                return sum + productPrice * quantity
                            }, 0)
                            console.log(`Precio calculado para plato ${dish.name}:`, price)
                        } else if (dish.price) {
                            price = dish.price
                            console.log(`Usando precio existente para plato ${dish.name}:`, price)
                        }

                        // Asegurarse de que el precio nunca sea 0 o undefined
                        if (price === 0 || price === undefined) {
                            console.warn(`Precio cero o indefinido para plato ${dish.name}, usando valor por defecto`)
                            price = dish.price || 0
                        }

                        // Enriquecer los productos con información adicional si es posible
                        let enrichedProducts = []
                        if (dish.products && Array.isArray(dish.products)) {
                            enrichedProducts = dish.products.map((prod) => {
                                // Buscar información adicional del producto en la lista de productos
                                const fullProduct = products.find((p) => p.products_id === prod.products_id)
                                return {
                                    ...prod,
                                    name: fullProduct?.name || prod.name || `Producto ${prod.products_id}`,
                                    price: prod.price || fullProduct?.price || 0,
                                }
                            })
                        }

                        return {
                            id: dish.dishes_id,
                            dishes_id: dish.dishes_id,
                            name: dish.name,
                            status: statusName,
                            status_id: dish.status_id, // Guardar el ID de estado original
                            time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
                            customer: dish.customer || `Mesa ${Math.floor(Math.random() * 10) + 1}`,
                            priority: dish.priority || "normal",
                            price: price, // Agregar el precio calculado
                            category_id: dish.category_id,
                            products: enrichedProducts.length > 0 ? enrichedProducts : dish.products || [],
                            // Guardar los datos originales para referencia
                            originalData: dish,
                        }
                    })
                    : []

                // Separar platos con estado (órdenes) y platos disponibles (sin estado)
                const ordersWithStatus = formattedDishes.filter((dish) => dish.status !== 'pendiente')
                const dishesWithoutStatus = formattedDishes.filter((dish) => dish.status === 'ninguno')

                console.log("Órdenes con estado:", ordersWithStatus)
                console.log("Platos disponibles:", dishesWithoutStatus)

                setOrders(ordersWithStatus)
                setAvailableDishes(dishesWithoutStatus)
                setIsOffline(false)
            }
        } catch (error) {
            console.error("Error cargando platos:", error)
            setError("Error inesperado al cargar los platos")
            setIsOffline(true)
            setOrders([])
            setAvailableDishes([])
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = async () => {
        setIsRetrying(true)
        await loadDishes()
        await loadStatuses()
        await loadProducts()
        await loadCategories()
        setTimeout(() => setIsRetrying(false), 1000)
    }

    // Modificar la función updateStatus para asegurar que se mantengan los productos y el precio
    const updateStatus = async (id, newStatus) => {
        try {
            setLoading(true)

            // Encontrar el plato en nuestro estado local
            const dish = [...orders, ...availableDishes].find((dish) => dish.id === id)
            if (!dish || !dish.originalData) {
                showError("Error", "No se encontró información del plato")
                return
            }

            // Encontrar el ID de estado correspondiente al nombre de estado
            const statusId = Object.keys(statusMap).find((key) => statusMap[key] === newStatus)
            if (!statusId) {
                showError("Error", `No se encontró el estado: ${newStatus}`)
                return
            }

            // Asegurarse de mantener todos los datos importantes del plato
            const dishData = {
                name: dish.name,
                status_id: statusId,
                category_id: dish.category_id || dish.originalData.category_id || null,
                products: dish.products_id || dish.originalData.products_id || [],
                price: dish.price || 0,
            }

            console.log("Actualizando estado del plato con datos:", dishData)

            // Validar los datos antes de enviarlos
            if (!validateDishData(dishData)) {
                showError("Error", "Datos del plato inválidos para actualización")
                setLoading(false)
                return
            }

            const result = await updateDish(dish.id, dishData)
            await logDishUpdate(dish, dishData, result)

            if (result && result.isConnectionError) {
                showError("Sin conexión", "No se puede actualizar el estado sin conexión al servidor")
            } else if (result) {
                showSuccess("Éxito", `Estado actualizado a: ${newStatus}`)
                await loadDishes() // Recargar platos para actualizar las listas
            } else {
                throw new Error("No se pudo actualizar el estado del plato")
            }
        } catch (error) {
            console.error("Error actualizando estado:", error)
            showError("Error", `Error al actualizar el estado: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Modificar la función handleAddToCart para asegurar que se actualice correctamente el estado
    const handleAddToCart = async (dish) => {
        try {
            // Agregar al carrito local
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

            // Cambiar el estado del plato a "pendiente" (preparar)
            console.log("Preparando plato:", dish)

            // Encontrar el ID de estado correspondiente a "pendiente"
            const pendienteStatusId = Object.keys(statusMap).find((key) => statusMap[key] === "pendiente")

            if (!pendienteStatusId) {
                throw new Error("No se encontró el estado 'pendiente'")
            }

            // Asegurarse de que los productos y el precio se mantengan
            const dishData = {
                name: dish.name,
                status_id: pendienteStatusId,
                category_id: dish.category_id || null,
                products: dish.products || [],
                price: dish.price || 0,
            }

            console.log("Actualizando plato a pendiente con datos:", dishData)

            // Validar los datos antes de enviarlos
            if (!validateDishData(dishData)) {
                showError("Error", "Datos del plato inválidos para actualización")
                return
            }

            // Actualizar el plato en la base de datos
            const result = await updateDish(dish.dishes_id, dishData)
            await logDishUpdate(dish, dishData, result)

            if (result && result.isConnectionError) {
                showError("Sin conexión", "No se puede actualizar el estado sin conexión al servidor")
            } else if (result) {
                showSuccess("¡Preparando!", `El plato ${dish.name} se está preparando`)

                // Forzar una recarga inmediata de los platos
                await loadDishes()
            } else {
                throw new Error("No se pudo actualizar el estado del plato")
            }
        } catch (error) {
            console.error("Error al preparar el plato:", error)
            showError("Error", `Error al preparar el plato: ${error.message}`)
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
                        onClick={() => updateStatus(order.id, "preparando")}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                    >
                        Iniciar
                    </button>
                )
            case "preparando":
                return (
                    <button
                        onClick={() => updateStatus(order.id, "listo")}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                    >
                        Completar
                    </button>
                )
            case "listo":
                return (
                    <button
                        onClick={() => updateStatus(order.id, "entregado")}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
                    >
                        Entregar
                    </button>
                )
            default:
                return null
        }
    }

    // Corregir la función getOrdersByStatus para asegurar que los precios se muestren correctamente
    const getOrdersByStatus = (status) => {
        return orders.filter((order) => {
            // Verificar que el estado coincida
            const matchesStatus = order.status === status

            // Si coincide, asegurémonos de que el precio esté calculado correctamente
            if (matchesStatus) {
                // Si el precio es 0 o undefined, intentar calcularlo de los productos
                if ((!order.price || order.price === 0) && order.products && Array.isArray(order.products)) {
                    order.price = order.products.reduce((sum, prod) => sum + (prod.price || 0) * (prod.quantity || 1), 0)
                    console.log(`Recalculando precio para orden ${order.name}:`, order.price)
                }
            }

            return matchesStatus
        })
    }

    const getStatusTitle = (status) => {
        switch (status) {
            case "pendiente":
                return "Pendientes"
            case "preparando":
                return "En Preparación"
            case "listo":
                return "Listos para Entregar"
            default:
                return status
        }
    }

    const handleAddNewDish = () => {
        setEditingDish(null)
        setSelectedProducts([])
        setTotalPrice(0)
        setIsModalOpen(true)
    }

    const handleAddProduct = (productId, quantity = 1) => {
        console.log("Añadiendo producto con ID:", productId)

        // Intentar encontrar el producto por ID, independientemente del formato
        const product = products.find(
            (p) =>
                p.products_id === productId ||
                p.products_id === Number(productId) ||
                String(p.products_id) === String(productId),
        )

        if (!product) {
            console.error("Producto no encontrado con ID:", productId)
            showWarning("Error", "No se pudo encontrar el producto seleccionado")
            return
        }

        console.log("Producto encontrado:", product)

        // Verificar si el producto ya está seleccionado
        const existingProductIndex = selectedProducts.findIndex(
            (p) => p.products_id === product.products_id || String(p.products_id) === String(product.products_id),
        )

        if (existingProductIndex >= 0) {
            // Actualizar la cantidad si ya existe
            const updatedProducts = [...selectedProducts]
            updatedProducts[existingProductIndex] = {
                ...updatedProducts[existingProductIndex],
                quantity: (updatedProducts[existingProductIndex].quantity || 1) + quantity,
            }
            setSelectedProducts(updatedProducts)
        } else {
            // Agregar nuevo producto con cantidad
            setSelectedProducts([...selectedProducts, { ...product, quantity }])
        }
    }

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter((p) => p.products_id !== productId))
    }

    const handleUpdateProductQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            handleRemoveProduct(productId)
            return
        }

        setSelectedProducts(selectedProducts.map((p) => (p.products_id === productId ? { ...p, quantity } : p)))
    }

    const handleSaveDish = async (formData) => {
        try {
            setLoading(true)

            if (selectedProducts.length === 0) {
                showWarning("Advertencia", "Debe seleccionar al menos un producto para el plato")
                setLoading(false)
                return
            }

            // Calcular el precio total basado en los productos seleccionados
            const calculatedPrice = selectedProducts.reduce((sum, product) => {
                // Obtener el precio del producto, ya sea de product_detail o directamente
                const productPrice = product.product_detail?.price || product.price || 0
                return sum + productPrice * (product.quantity || 1)
            }, 0)

            console.log("Precio calculado del plato:", calculatedPrice)

            // Preparar los productos para enviar al servidor
            const productsForDish = selectedProducts.map((product) => ({
                products_id: product.products_id,
                quantity: product.quantity || 1,
                price: product.product_detail?.price || product.price || 0,
            }))

            console.log("Productos para el plato:", productsForDish)

            if (editingDish) {
                // Editar plato existente
                const originalDish = editingDish.originalData

                if (originalDish && originalDish.dishes_id) {
                    // Si el plato original tenía el status "ninguno", mantenerlo.
                    // De lo contrario, mantener el status_id original del plato que se está editando.
                    const newStatusId = originalDish.status === 'ninguno' ? originalDish.status_id : editingDish.status_id;

                    // Actualizar el plato principal
                    const dishData = {
                        name: formData.name,
                        category_id: formData.category_id || null,
                        status_id: newStatusId,
                        products: productsForDish[0].products_id,
                        price: calculatedPrice, // Usar el precio calculado
                    }

                    console.log("Actualizando plato con datos:", dishData)

                    // Validar los datos antes de enviarlos
                    if (!validateDishData(dishData)) {
                        showError("Error", "Datos del plato inválidos para actualización")
                        setLoading(false)
                        return
                    }

                    const result = await updateDish(originalDish.dishes_id, dishData)
                    await logDishUpdate(editingDish, dishData, result)

                    if (result && result.isConnectionError) {
                        showError("Sin conexión", "No se puede actualizar el plato sin conexión al servidor")
                    } else if (result) {
                        showSuccess("Éxito", "Plato actualizado correctamente")
                        await loadDishes() // Recargar platos
                    } else {
                        throw new Error("No se pudo actualizar el plato")
                    }
                } else {
                    throw new Error("No se encontró información del plato original")
                }
            } else {
                // Crear nuevo plato
                const dishData = {
                    name: formData.name,
                    category_id: formData.category_id || null,
                    status_id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', // Inicialmente 'pendiente' para nuevos platos
                    products: productsForDish[0].products_id,
                    price: calculatedPrice, // Usar el precio calculado
                }

                console.log("Creando plato con datos:", dishData)
                const result = await createDish(dishData)

                if (result && result.isConnectionError) {
                    showError("Sin conexión", "No se puede crear el plato sin conexión al servidor")
                } else if (result && result.success) {
                    showSuccess("Éxito", "Plato creado correctamente")
                    await loadDishes() // Recargar platos
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
        // Preparar los productos seleccionados
        let dishProducts = []
        if (dish.originalData && dish.originalData.products && Array.isArray(dish.originalData.products)) {
            dishProducts = dish.originalData.products
                .map((p) => {
                    // Buscar el producto completo en la lista de productos
                    const fullProduct = products.find((product) => product.products_id === p.products_id)
                    if (fullProduct) {
                        return {
                            ...fullProduct,
                            quantity: p.quantity || 1,
                        }
                    }
                    return null
                })
                .filter((p) => p) // Filtrar productos no encontrados
        }

        setSelectedProducts(dishProducts)
        setEditingDish(dish)
        setIsModalOpen(true)
    }

    // Nueva función para manejar la eliminación de platos
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

    // Función para confirmar la eliminación de un plato
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)

            if (deleteConfirm.dishId) {
                console.log("Eliminando plato con ID:", deleteConfirm.dishId)
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

    // Excluir el estado "ninguno" de la lista de estados para la gestión de órdenes
    const statusList = ["pendiente", "preparando", "listo"];

    // Si está offline, mostrar placeholder
    if (isOffline && !loading) {
        return (
            <div className="space-y-6">
                <ConnectionStatus onRetry={handleRetry} />
                <OfflinePlaceholder
                    title="Platos no disponibles"
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
                                    {getStatusTitle(status) != 'ninguno' && (<>
                                    </>)}
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
                                                    <p className="font-medium text-green-600 text-base mb-1">${(order.price || 0).toFixed(2)}</p>
                                                    {order.category_id && categories.length > 0 && (
                                                        <p>
                                                            Categoría:{" "}
                                                            <span className="font-medium">
                                                                {categories.find((c) => c.category_id === order.category_id)?.name || "Sin categoría"}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {order.products && order.products.length > 0 && (
                                                        <div>
                                                            <p className="font-medium mt-1">Productos ({order.products.length}):</p>
                                                            <ul className="list-disc list-inside pl-2 text-xs">
                                                                {order.products.slice(0, 3).map((prod, idx) => (
                                                                    <li key={idx}>
                                                                        {prod.name || `Producto ${idx + 1}`} x{prod.quantity || 1}
                                                                    </li>
                                                                ))}
                                                                {order.products.length > 3 && <li>Y {order.products.length - 3} más...</li>}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <p className="mt-1">
                                                        Estado:{" "}
                                                        <span className="font-medium capitalize">
                                                            {status === "pendiente"
                                                                ? "En espera"
                                                                : status === "preparando"
                                                                    ? "En preparación"
                                                                    : "Listo para recoger"}
                                                        </span>
                                                    </p>
                                                </div>

                                                {user?.role === "admin" && (
                                                    <div className="flex justify-between">
                                                        {getStatusActions(order)}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditDish(order)}
                                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(order.id)}
                                                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
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
                                                            : "listas"}
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

                {/* Órdenes entregadas */}
                {orders.filter((order) => order.status === "entregado").length > 0 && (
                    <div className="bg-white rounded-lg border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Órdenes Entregadas Hoy</h3>
                        <div className="space-y-2">
                            {orders
                                .filter((order) => order.status === "entregado")
                                .map((order) => (
                                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="font-medium">{order.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">{order.time}</span>
                                            {/* {order.price > 0 && <span className="font-medium text-green-600">${order.price.toFixed(2)}</span>} */}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ConnectionStatus onRetry={handleRetry} />

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>

            {/* Platos Disponibles (sin estado) */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Platos Disponibles</h2>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading || isRetrying}
                        >
                            <RefreshCw size={16} className={loading || isRetrying ? "animate-spin" : ""} />
                            Actualizar
                        </button>

                        {user?.role === "admin" && (
                            <button
                                onClick={handleAddNewDish}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center gap-2"
                                disabled={loading || isOffline}
                            >
                                <Package className="w-4 h-4" />
                                Nuevo Plato
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando platos...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {availableDishes.length > 0 ? (
                            availableDishes.map((dish) => (
                                <div
                                    key={dish.id}
                                    className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Imagen del plato (placeholder) */}
                                    <div className="aspect-video bg-gray-200 relative">
                                        <img
                                            src={`https://placehold.co/300x200/cccccc/000000?text=${encodeURIComponent(dish.name)}`}
                                            alt={dish.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                                            {dish.category_id && categories.length > 0 && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {categories.find((c) => c.category_id === dish.category_id)?.name || "Sin categoría"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            {dish.products && dish.products.length > 0 && (
                                                <p className="text-sm text-gray-600">
                                                    {dish.products.length} {dish.products.length === 1 ? "producto" : "productos"}
                                                </p>
                                            )}
                                            {/* <p className="text-lg font-bold text-green-600 mt-1">${dish.price.toFixed(2)}</p> */}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            {user?.role === "admin" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditDish(dish)}
                                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(dish.id)}
                                                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleAddToCart(dish)}
                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                                            >
                                                <ShoppingCart size={16} />
                                                Preparar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No hay platos disponibles</p>
                                {user?.role === "admin" && (
                                    <button
                                        onClick={handleAddNewDish}
                                        className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors inline-flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Crear nuevo plato
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tablero de órdenes */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {user?.role === "admin" ? "Gestión de Platos - Órdenes en Preparación" : "Mis Órdenes"}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando platos...</p>
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
                                                {/* <p className="font-medium text-green-600 text-base mb-1">${(order.price || 0).toFixed(2)}</p> */}
                                                {order.category_id && categories.length > 0 && (
                                                    <p>
                                                        Categoría:{" "}
                                                        <span className="font-medium">
                                                            {categories.find((c) => c.category_id === order.category_id)?.name || "Sin categoría"}
                                                        </span>
                                                    </p>
                                                )}
                                                {order.products && order.products.length > 0 && (
                                                    <div>
                                                        <p className="font-medium mt-1">Productos ({order.products.length}):</p>
                                                        <ul className="list-disc list-inside pl-2 text-xs">
                                                            {order.products.slice(0, 3).map((prod, idx) => (
                                                                <li key={idx}>
                                                                    {prod.name || `Producto ${idx + 1}`} x{prod.quantity || 1}
                                                                </li>
                                                            ))}
                                                            {order.products.length > 3 && <li>Y {order.products.length - 3} más...</li>}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {user?.role === "admin" && (
                                                <div className="flex justify-between">
                                                    {getStatusActions(order)}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditDish(order)}
                                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(order.id)}
                                                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {getOrdersByStatus(status).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>
                                                No hay órdenes{" "}
                                                {status === "pendiente" ? "pendientes" : status === "preparando" ? "en preparación" : "listas"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Órdenes entregadas (solo para admin) */}
            {user?.role === "admin" && (
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Órdenes Entregadas Hoy</h3>
                    <div className="space-y-2">
                        {orders
                            .filter((order) => order.status === "entregado")
                            .map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="font-medium">{order.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">{order.time}</span>
                                        {/* {order.price > 0 && <span className="font-medium text-green-600">${order.price.toFixed(2)}</span>} */}
                                    </div>
                                </div>
                            ))}

                        {orders.filter((order) => order.status === "entregado").length === 0 && (
                            <p className="text-center py-4 text-gray-500">No hay órdenes entregadas hoy</p>
                        )}
                    </div>
                </div>
            )}

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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        name="category_id"
                                        defaultValue={editingDish?.category_id || ""}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map((category) => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sección de productos */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium text-gray-700 mb-3">Productos del Plato</h4>

                                    {/* Selector de productos */}
                                    <div className="flex gap-2 mb-4">
                                        <select
                                            id="product-selector"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Seleccionar producto</option>
                                            {products.map((product) => (
                                                <option key={product.products_id} value={product.products_id}>
                                                    {product.name} - ${product.product_detail?.price?.toFixed(2) || "0.00"}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const select = document.getElementById("product-selector")
                                                if (select && select.value) {
                                                    console.log("Valor seleccionado:", select.value)
                                                    handleAddProduct(select.value, 1)
                                                } else {
                                                    console.log("No se seleccionó ningún producto")
                                                    showWarning("Advertencia", "Por favor seleccione un producto")
                                                }
                                            }}
                                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    {/* Lista de productos seleccionados */}
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
                                                        {/* <p className="text-sm text-gray-600">
                                                            Precio unitario: $
                                                            {product.product_detail?.price?.toFixed(2) || product.price?.toFixed(2) || "0.00"}
                                                        </p> */}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center border rounded-md overflow-hidden">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateProductQuantity(product.products_id, (product.quantity || 1) - 1)
                                                                }
                                                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={product.quantity || 1}
                                                                onChange={(e) =>
                                                                    handleUpdateProductQuantity(product.products_id, Number(e.target.value))
                                                                }
                                                                className="w-12 text-center border-x px-1 py-1"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateProductQuantity(product.products_id, (product.quantity || 1) + 1)
                                                                }
                                                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProduct(product.products_id)}
                                                            className="p-1 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Precio total */}
                                    <div className="mt-4 text-right">
                                        {/* <p className="text-lg font-bold">
                                            Total: <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                                        </p> */}
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
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
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
            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, dishId: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Plato"
                message="¿Estás seguro de que quieres eliminar este plato? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    )
}
