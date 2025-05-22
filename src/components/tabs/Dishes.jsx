import { useState } from "react"

export const Dishes = () => {
    const [orders, setOrders] = useState([
        { id: 1, name: 'hamburguesa', status: 'preparando' },
        { id: 1, name: 'hamburguesa', status: 'preparando' }
    ])

    const updateStatus = (id, status) => {
        setOrders(orders.map(order => (order.id === id ? { ...order, status } : order)))
    }
    return (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Platos - Órdenes en Preparación</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Pendientes</h3>
                    <div className="space-y-3">
                        {orders
                            .filter((o) => o.status === "pendiente")
                            .map((order) => (
                                <div key={order.id} className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{order.name}</span>
                                        <span className="text-sm text-gray-500">{order.time}</span>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => updateStatus(order.id, "en_preparacion")}
                                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                        >
                                            Iniciar
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">En Preparación</h3>
                    <div className="space-y-3">
                        {orders
                            .filter((o) => o.status === "en_preparacion")
                            .map((order) => (
                                <div key={order.id} className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{order.name}</span>
                                        <span className="text-sm text-gray-500">{order.time}</span>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => updateStatus(order.id, "listo")}
                                            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                                        >
                                            Completar
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Listos</h3>
                    <div className="space-y-3">
                        {orders
                            .filter((o) => o.status === "listo")
                            .map((order) => (
                                <div key={order.id} className="bg-green-50 p-3 rounded-md border border-green-200">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{order.name}</span>
                                        <span className="text-sm text-gray-500">{order.time}</span>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => updateStatus(order.id, "entregado")}
                                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
                                        >
                                            Entregar
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
