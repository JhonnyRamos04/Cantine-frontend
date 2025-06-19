import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getCategories } from "../utils/categories.js"
import { getStatuses } from "../utils/status.js"
import {
    createProvider,
    updateProvider,
    getProviders,
} from "../utils/providers.js"

import {
    createMaterial,
    updateMaterial,
    createMaterialDetail,
    updateMaterialDetail, // Importar la función para actualizar detalles de material
    getMaterialDetailById
} from "../utils/materials.js"

import {
    createProduct,
    updateProduct,
    createProductDetail,
    updateProductDetail,
    getProductDetailById
} from "../utils/products.js"

export function ItemFormModal({ isOpen, onClose, onSave, item, mode, itemType }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category_id: "",
        price: "",
        quantity: "",
        direction: "",
        phone: "",
        type_id: "",
        status_id: "",
        provided_id: "", // Asegurarse de que este campo exista
    })

    const [categories, setCategories] = useState([])
    const [statuses, setStatuses] = useState([])
    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingProviders, setLoadingProviders] = useState(false)

    // Cargar proveedores al abrir el modal
    useEffect(() => {
        const loadProviders = async () => {
            if (isOpen && (itemType === "productos" || itemType === "materiales")) {
                setLoadingProviders(true)
                try {
                    const providersData = await getProviders()
                    console.log("Proveedores cargados:", providersData)
                    setProviders(providersData || [])
                } catch (error) {
                    console.error("Error cargando proveedores:", error)
                    toast.error("Error al cargar proveedores.", { position: "top-right" })
                } finally {
                    setLoadingProviders(false)
                }
            }
        }

        loadProviders()
    }, [isOpen, itemType])

    // Cargar categorías y estados al abrir el modal
    useEffect(() => {
        const loadData = async () => {
            if (isOpen) {
                setLoading(true)
                try {
                    // Cargar categorías para productos y platos
                    if (itemType === "productos" || itemType === "platos") {
                        const categoriesData = await getCategories()
                        setCategories(categoriesData || [])
                    }

                    // Cargar estados para platos
                    if (itemType === "platos") {
                        const statusesData = await getStatuses()
                        setStatuses(statusesData || [])
                    }
                } catch (error) {
                    console.error("Error cargando datos:", error)
                    toast.error("Error al cargar datos adicionales.", { position: "top-right" })
                } finally {
                    setLoading(false)
                }
            }
        }

        loadData()
    }, [isOpen, itemType])

    // Resetear el formulario y cargar datos del item para edición
    useEffect(() => {
        const initializeFormData = async () => {
            if (isOpen && mode === "edit" && item) {
                console.log("Editando item:", item)

                let detailData = {}
                if (itemType === "productos" && item.products_details_id) {
                    // Si es un producto, intentar obtener sus detalles
                    const productDetail = await getProductDetailById(item.products_details_id)
                    if (productDetail) {
                        detailData = {
                            description: productDetail.description || "",
                            quantity: productDetail.quantity || "",
                            price: productDetail.price || "",
                            provided_id: productDetail.provided_id || productDetail.provider?.provider_id || "",
                        }
                    }
                } else if (itemType === "materiales" && item.materials_details_id) {
                    // Si es un material, intentar obtener sus detalles
                    const materialDetail = await getMaterialDetailById(item.materials_details_id)
                    if (materialDetail) {
                        detailData = {
                            description: materialDetail.description || "",
                            quantity: materialDetail.quantity || "",
                            price: materialDetail.price || "",
                            provided_id: materialDetail.provided_id || materialDetail.provider?.provider_id || "",
                        }
                    }
                }

                switch (itemType) {
                    case "productos": {
                        setFormData({
                            name: item.name || "",
                            category_id: item.category_id || "",
                            ...detailData, // Incluir los detalles del producto
                        })
                        console.log("Proveedor seleccionado:", detailData.provided_id)
                        break
                    }
                    case "materiales": {
                        setFormData({
                            name: item.name || "",
                            type_id: item.type_id || "",
                            ...detailData, // Incluir los detalles del material
                        })
                        console.log("Proveedor seleccionado:", detailData.provided_id)
                        break
                    }
                    case "proveedores": {
                        setFormData({
                            name: item.name || "",
                            direction: item.direction || "",
                            phone: item.phone || "",
                        })
                        break
                    }
                    default: {
                        setFormData({
                            name: item.name || "",
                        })
                    }
                }
            } else if (isOpen && mode === "add") {
                // Resetear formulario para añadir nuevo elemento
                setFormData({
                    name: "",
                    description: "",
                    category_id: "",
                    price: "",
                    quantity: "",
                    direction: "",
                    phone: "",
                    type_id: "",
                    status_id: "",
                    provided_id: "",
                })
            }
        }
        initializeFormData()
    }, [isOpen, item, mode, itemType])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result

            // Crear o actualizar según el tipo de elemento y modo
            if (mode === "add") {
                switch (itemType) {
                    case "productos": {
                        // Primero crear el detalle del producto
                        const productDetailData = {
                            description: formData.description,
                            quantity: Number.parseInt(formData.quantity) || 0,
                            price: Number.parseFloat(formData.price) || 0,
                            provided_id: formData.provided_id,
                        }

                        const productDetailResult = await createProductDetail(productDetailData)

                        if (productDetailResult && productDetailResult.product_detail) {
                            // Luego crear el producto con el ID del detalle
                            const productData = {
                                name: formData.name,
                                category_id: formData.category_id,
                                products_details_id: productDetailResult.product_detail.products_details_id,
                            }

                            result = await createProduct(productData)
                        } else {
                            throw new Error("No se pudo crear el detalle del producto.")
                        }
                        break
                    }
                    case "materiales": {
                        // Primero crear el detalle del material
                        const materialDetailData = {
                            description: formData.description,
                            quantity: Number.parseInt(formData.quantity) || 0,
                            price: Number.parseFloat(formData.price) || 0,
                            provided_id: formData.provided_id,
                        }

                        const materialDetailResult = await createMaterialDetail(materialDetailData)

                        if (materialDetailResult && materialDetailResult.material_detail) {
                            // Luego crear el material con el ID del detalle
                            const materialData = {
                                name: formData.name,
                                type_id: Number.parseInt(formData.type_id) || 1,
                                materials_details_id: materialDetailResult.material_detail.materials_details_id,
                            }

                            result = await createMaterial(materialData)
                        } else {
                            throw new Error("No se pudo crear el detalle del material.")
                        }
                        break
                    }
                    case "proveedores": {
                        const providerData = {
                            name: formData.name,
                            direction: formData.direction,
                            phone: formData.phone,
                        }

                        result = await createProvider(providerData)
                        break
                    }
                    default:
                        throw new Error("Tipo de item no reconocido para añadir.")
                }
            } else if (mode === "edit") {
                switch (itemType) {
                    case "productos": {
                        // Actualizar el producto
                        const productData = {
                            name: formData.name,
                            category_id: formData.category_id,
                        }

                        // Si hay un detalle de producto, actualizarlo también
                        if (item.products_details_id) { // Usar products_details_id del item original
                            const productDetailData = {
                                description: formData.description,
                                quantity: Number.parseInt(formData.quantity) || 0,
                                price: Number.parseFloat(formData.price) || 0,
                                provided_id: formData.provided_id,
                            }
                            await updateProductDetail(item.products_details_id, productDetailData)
                        }

                        result = await updateProduct(item.products_id, productData)
                        break
                    }
                    case "materiales": {
                        // Actualizar el material
                        const materialData = {
                            name: formData.name,
                            type_id: Number.parseInt(formData.type_id) || 1,
                        }

                        // Si hay un detalle de material, actualizarlo también
                        if (item.materials_details_id) { // Usar materials_details_id del item original
                            const materialDetailData = {
                                description: formData.description,
                                quantity: Number.parseInt(formData.quantity) || 0,
                                price: Number.parseFloat(formData.price) || 0,
                                provided_id: formData.provided_id,
                            }
                            await updateMaterialDetail(item.materials_details_id, materialDetailData)
                        }

                        result = await updateMaterial(item.materials_id, materialData)
                        break
                    }
                    case "proveedores": {
                        const providerData = {
                            name: formData.name,
                            direction: formData.direction,
                            phone: formData.phone,
                        }

                        result = await updateProvider(item.provider_id, providerData)
                        break
                    }
                    default:
                        throw new Error("Tipo de item no reconocido para editar.")
                }
            }

            // Notificar al componente padre sobre el guardado exitoso
            onSave(result, mode)
            onClose()

            // Seguridad adicional para evitar XSS
            const safeItemTypeName = getItemTypeName()

            toast.success(`${mode === "add" ? "Añadido" : "Editado"} ${safeItemTypeName} exitosamente`, {
                position: "top-right",
            })
        } catch (error) {
            console.error("Error al guardar:", error)
            toast.error(`Error al guardar el ${getItemTypeName()}: ${error.message}`, {
                position: "top-right",
            })
        } finally {
            setLoading(false)
        }
    }

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null

    // Determinar qué campos mostrar según el tipo de item
    const renderFields = () => {
        switch (itemType) {
            case "productos":
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map((category) => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full p-2 pl-6 border rounded-md"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proveedor {loadingProviders && "(Cargando...)"}
                            </label>
                            <select
                                name="provided_id"
                                value={formData.provided_id}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                disabled={loadingProviders}
                            >
                                <option value="">Seleccionar...</option>
                                {providers.map((provider) => (
                                    <option key={provider.provider_id} value={provider.provider_id}>
                                        {provider.name}
                                    </option>
                                ))}
                            </select>
                            {providers.length === 0 && !loadingProviders && (
                                <p className="text-sm text-red-500 mt-1">
                                    No hay proveedores disponibles. Por favor, añada proveedores primero.
                                </p>
                            )}
                        </div>
                    </>
                )
            case "materiales":
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                name="type_id"
                                value={formData.type_id}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="1">Materia Prima</option>
                                <option value="2">Herramienta</option>
                                <option value="3">Empaque</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por unidad</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full p-2 pl-6 border rounded-md"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proveedor {loadingProviders && "(Cargando...)"}
                            </label>
                            <select
                                name="provided_id"
                                value={formData.provided_id}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                disabled={loadingProviders}
                            >
                                <option value="">Seleccionar...</option>
                                {providers.map((provider) => (
                                    <option key={provider.provider_id} value={provider.provider_id}>
                                        {provider.name}
                                    </option>
                                ))}
                            </select>
                            {providers.length === 0 && !loadingProviders && (
                                <p className="text-sm text-red-500 mt-1">
                                    No hay proveedores disponibles. Por favor, añada proveedores primero.
                                </p>
                            )}
                        </div>
                    </>
                )
            case "proveedores":
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                name="direction"
                                value={formData.direction}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </>
                )
            default:
                return (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>
                )
        }
    }

    // Corregir el nombre del tipo de elemento para mostrar en el título
    const getItemTypeName = () => {
        switch (itemType) {
            case "productos":
                return "producto"
            case "materiales":
                return "material"
            case "proveedores":
                return "proveedor"
            default:
                return itemType
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-medium">
                        {mode === "add" ? `Agregar ${getItemTypeName()}` : `Editar ${getItemTypeName()}`}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    {renderFields()}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : mode === "add" ? "Agregar" : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    )
}