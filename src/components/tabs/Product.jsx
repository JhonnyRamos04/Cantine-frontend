import { useEffect, useState } from "react"
import { Category } from "../Category"
import { ItemList } from "../ItemList"
import { ItemFormModal } from "../ItemFormModal"
import {
    getProducts,
    deleteProduct,
    createProduct,
    //updateProduct,
    createProductDetail,
    //updateProductDetail,
    getProductDetailById
} from "../../utils/db"

export const Product = () => {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Función para cargar productos que podemos llamar cuando necesitemos actualizar
    const loadProducts = async () => {
        try {
            setLoading(true)
            const productsData = await getProducts()
            console.log("Productos cargados:", productsData)
            setItems(productsData)
        } catch (error) {
            console.error("Error cargando productos:", error)
            setError("Error al cargar los productos. Por favor, intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    // Cargar productos al montar el componente
    useEffect(() => {
        loadProducts()
    }, [])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [modalMode, setModalMode] = useState("add") // "add" o "edit"

    const handleDelete = async (id) => {
        try {
            // Mostrar confirmación antes de eliminar
            if (!confirm("¿Está seguro de que desea eliminar este producto?")) {
                return
            }

            setLoading(true)
            console.log("Eliminando producto con ID:", id)
            const result = await deleteProduct(id)

            if (result && result.message) {
                // Recargar productos para reflejar los cambios
                await loadProducts()
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

    const handleEdit = async (id) => {
        try {
            const itemToEdit = items.find(item => item.products_id === id)
            if (itemToEdit) {
                console.log("Editando producto:", itemToEdit)

                // Si necesitamos obtener más detalles del producto
                if (itemToEdit.products_details_id) {
                    try {
                        const detailData = await getProductDetailById(itemToEdit.products_details_id)
                        if (detailData) {
                            // Combinar los datos del producto con sus detalles
                            itemToEdit.detail = detailData
                        }
                    } catch (detailError) {
                        console.error("Error obteniendo detalles del producto:", detailError)
                    }
                }

                setCurrentItem(itemToEdit)
                setModalMode("edit")
                setIsModalOpen(true)
            } else {
                console.error("Producto no encontrado con ID:", id)
                alert(`Producto con ID ${id} no encontrado`)
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
                // Primero crear el detalle del producto
                const productDetailData = {
                    description: formData.description || "",
                    quantity: parseInt(formData.quantity) || 0,
                    price: parseFloat(formData.price) || 0,
                    provided_id: formData.provided_id || null
                }

                console.log("Creando detalle de producto:", productDetailData)
                const detailResult = await createProductDetail(productDetailData)

                // Verificar si la operación fue exitosa o posiblemente exitosa
                if (detailResult && (detailResult.product_detail || detailResult.possiblySuccessful)) {
                    // Extraer el ID del detalle si está disponible
                    const detailId = detailResult.product_detail ?
                        detailResult.product_detail.products_details_id :
                        null

                    // Si no tenemos el ID pero la operación podría haber sido exitosa,
                    // intentar obtener el detalle más reciente
                    let products_details_id = detailId

                    if (!products_details_id && detailResult.possiblySuccessful) {
                        // Aquí podrías implementar una lógica para obtener el detalle más reciente
                        // Por ahora, mostraremos un mensaje y recargaremos
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
                            products_details_id: products_details_id
                        }

                        console.log("Creando producto:", productData)
                        result = await createProduct(productData)

                        // Verificar si la operación fue exitosa o posiblemente exitosa
                        if (result && (result.product || result.possiblySuccessful)) {
                            // Recargar productos para reflejar los cambios
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
            } else if (mode === "edit" && currentItem) {
                // Código de edición (sin cambios)
                // ...
            }
        } catch (error) {
            console.error("Error guardando producto:", error)

            // Verificar si a pesar del error, la operación podría haber sido exitosa
            if (error.message.includes("Bad Request") || error.message.includes("400")) {
                console.log("Advertencia: Se recibió Bad Request, pero la operación podría haber sido exitosa")
                alert("Se recibió un error, pero el producto podría haberse guardado correctamente. Vamos a recargar la lista para verificar.")
                await loadProducts()
            } else {
                alert(`Error al guardar el producto: ${error.message}`)
            }
        } finally {
            setLoading(false)
            setIsModalOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Productos</h2>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Lista de Productos</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={loadProducts}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center"
                            disabled={loading}
                        >
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            className="w-10 h-10 bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-105 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
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
                        <p className="mt-2 text-gray-500">Cargando productos...</p>
                    </div>
                ) : (
                    <ItemList
                        items={items}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        itemType='productos'
                    />
                )}
            </div>

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                item={currentItem}
                mode={modalMode}
                itemType="productos"
            />
        </div>
    )
}