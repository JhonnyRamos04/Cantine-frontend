"use client"

import { useState, useEffect } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import { getProducts, deleteProduct, createProduct, createProductDetail, getProductDetailById } from "../../utils/db"

export function Product({ user }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [modalMode, setModalMode] = useState("add")
    const [error, setError] = useState(null)

    // Cargar productos al montar el componente
    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getProducts()
            console.log("Productos cargados:", data)
            setProducts(data || [])
        } catch (error) {
            console.error("Error cargando productos:", error)
            setError("Error al cargar los productos. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingItem(null)
        setModalMode("add")
        setIsModalOpen(true)
    }

    const handleEdit = async (productId) => {
        try {
            const product = products.find((p) => p.products_id === productId)
            if (product) {
                console.log("Editando producto:", product)

                // Si necesitamos obtener más detalles del producto
                if (product.products_details_id) {
                    try {
                        const detailData = await getProductDetailById(product.products_details_id)
                        if (detailData) {
                            // Combinar los datos del producto con sus detalles
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
                alert(`Producto con ID ${productId} no encontrado`)
            }
        } catch (error) {
            console.error("Error preparando edición:", error)
            alert(`Error al preparar la edición: ${error.message}`)
        }
    }

    const handleDelete = async (productId) => {
        if (user?.role !== "admin") {
            alert("No tienes permisos para eliminar productos")
            return
        }

        if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            try {
                setLoading(true)
                console.log("Eliminando producto con ID:", productId)
                const result = await deleteProduct(productId)

                if (result && result.message) {
                    await loadProducts() // Recargar la lista
                    alert("Producto eliminado con éxito")
                } else {
                    throw new Error("No se pudo eliminar el producto")
                }
            } catch (error) {
                console.error("Error eliminando producto:", error)
                alert(`Error al eliminar el producto: ${error.message}`)
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
                // Primero crear el detalle del producto
                const productDetailData = {
                    description: formData.description || "",
                    quantity: Number.parseInt(formData.quantity) || 0,
                    price: Number.parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null,
                }

                console.log("Creando detalle de producto:", productDetailData)
                const detailResult = await createProductDetail(productDetailData)

                // Verificar si la operación fue exitosa o posiblemente exitosa
                if (detailResult && (detailResult.product_detail || detailResult.possiblySuccessful)) {
                    // Extraer el ID del detalle si está disponible
                    const detailId = detailResult.product_detail ? detailResult.product_detail.products_details_id : null

                    // Si no tenemos el ID pero la operación podría haber sido exitosa,
                    // intentar obtener el detalle más reciente
                    const products_details_id = detailId

                    if (!products_details_id && detailResult.possiblySuccessful) {
                        console.log("No se pudo obtener el ID del detalle, pero la operación podría haber sido exitosa")
                        alert("El producto podría haberse creado correctamente. Vamos a recargar la lista para verificar.")
                        await loadProducts()
                        setIsModalOpen(false)
                        setLoading(false)
                        return
                    }

                    if (products_details_id) {
                        // Luego crear el producto con el ID del detalle
                        const productData = {
                            name: formData.name,
                            category_id: formData.category_id || null,
                            products_details_id: products_details_id,
                        }

                        console.log("Creando producto:", productData)
                        result = await createProduct(productData)

                        // Verificar si la operación fue exitosa o posiblemente exitosa
                        if (result && (result.product || result.possiblySuccessful)) {
                            await loadProducts()
                            alert("Producto creado con éxito")
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
                // Código de edición (implementar según necesidades)
                console.log("Editando producto:", editingItem)
                // Aquí implementarías la lógica de edición
            }
        } catch (error) {
            console.error("Error guardando producto:", error)

            // Verificar si a pesar del error, la operación podría haber sido exitosa
            if (error.message.includes("Bad Request") || error.message.includes("400")) {
                console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
                alert(
                    "Se recibió un error, pero el producto podría haberse guardado correctamente. Vamos a recargar la lista para verificar.",
                )
                await loadProducts()
            } else {
                alert(`Error al guardar el producto: ${error.message}`)
            }
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    // Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="space-y-6">
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
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadProducts}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Actualizar
                    </button>

                    {user?.role === "admin" && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <Plus size={20} />
                            Agregar Producto
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de productos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {user?.role === "admin" ? "Productos" : "Productos Disponibles"}
                </h3>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="ml-3 text-gray-500">Cargando productos...</p>
                    </div>
                ) : (
                    <ItemList
                        items={filteredProducts}
                        onEdit={user?.role === "admin" ? handleEdit : undefined}
                        onDelete={user?.role === "admin" ? handleDelete : undefined}
                        itemType="productos"
                    />
                )}
            </div>

            {/* Modal para agregar/editar */}
            {user?.role === "admin" && (
                <ItemFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    item={editingItem}
                    mode={modalMode}
                    itemType="productos"
                />
            )}
        </div>
    )
}
