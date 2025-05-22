import { DeleteIcon } from "./icons/DeleteIcon"
import { EditIcon } from "./icons/EditIcon"

export const ItemList = ({ items, onEdit, onDelete, itemType }) => {

    const renderItemDetails = (item) => {
        switch (itemType) {
            case "productos":
                return (
                    <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Precio:</span>
                            <span>${item.product_detail?.price?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Stock:</span>
                            <span>{item.product_detail?.quantity || "0"} unidades</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Proveedor:</span>
                            <span>{item.product_detail?.provider?.name || "No especificado"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Categoría:</span>
                            <span>{item.category?.name || "No especificada"}</span>
                        </div>
                    </div>
                )
            case "materiales":
                return (
                    <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Tipo:</span>
                            <span>{item.type_name || "No especificado"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">ID Material:</span>
                            <span>{item.materials_id || "No especificado"}</span>
                        </div>
                    </div>
                )
            case "proveedores":
                return (
                    <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Dirección:</span>
                            <span>{item.direction || "No especificada"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Teléfono:</span>
                            <span>{item.phone || "No especificado"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Productos:</span>
                            <span>{item.product_details_count || "0"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Materiales:</span>
                            <span>{item.material_details_count || "0"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Valor total:</span>
                            <span>${item.total_value?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    const getItemId = (item) => {
        switch (itemType) {
            case "productos":
                return item.products_id
            case "materiales":
                return item.materials_id
            case "proveedores":
                return item.provider_id
            default:
                return item.id
        }
    }

    const getItemName = (item) => {
        return item.name
    }

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const itemId = getItemId(item);
                return (
                    <div key={itemId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">{getItemName(item)}</span>
                            {renderItemDetails(item)}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    console.log("Editando item con ID:", itemId);
                                    onEdit(itemId);
                                }}
                                className="size-10 p-2 hover:scale-105 cursor-pointer bg-blue-500 text-white rounded-full flex items-center justify-center"
                            >
                                <EditIcon />
                            </button>
                            <button
                                onClick={() => {
                                    console.log("Eliminando item con ID:", itemId);
                                    onDelete(itemId);
                                }}
                                className="size-10 p-2 hover:scale-105 cursor-pointer bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>
                );
            })}

            {items.length === 0 && <div className="text-center py-8 text-gray-500">No hay elementos para mostrar</div>}
        </div>
    )
}