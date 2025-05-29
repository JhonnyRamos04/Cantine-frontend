
import { useState } from "react"
import { Clock, CheckCircle, Package, AlertCircle } from "lucide-react"

export function Dishes({ user }) {
    const [orders, setOrders] = useState([
        { id: 1, name: "Hamburguesa Clásica", status: "pendiente", time: "10:30", customer: "Mesa 5", priority: "normal" },
        { id: 2, name: "Pizza Margherita", status: "preparando", time: "10:25", customer: "Mesa 2", priority: "alta" },
        { id: 3, name: "Ensalada César", status: "preparando", time: "10:28", customer: "Mesa 8", priority: "normal" },
        { id: 4, name: "Pasta Carbonara", status: "listo", time: "10:15", customer: "Mesa 1", priority: "normal" },
        { id: 5, name: "Tacos de Pollo", status: "pendiente", time: "10:32", customer: "Mesa 3", priority: "baja" },
    ])

    const updateStatus = (id, newStatus) => {
        setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
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
            default:
                return status
        }
    }

    const statuses = ["pendiente", "preparando", "listo"]

    return (
        <div className="space-y-6">
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

            {/* Tablero de órdenes */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">
                    {user?.role === "admin" ? "Gestión de Platos - Órdenes en Preparación" : "Mis Órdenes"}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {statuses.map((status) => (
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
                                            <p>Cliente: {order.customer}</p>
                                            <p>
                                                Prioridad: <span className="capitalize">{order.priority}</span>
                                            </p>
                                        </div>

                                        {user?.role === "admin" && <div className="flex justify-end">{getStatusActions(order)}</div>}
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
                                        <span className="text-sm text-gray-500">- {order.customer}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{order.time}</span>
                                </div>
                            ))}

                        {orders.filter((order) => order.status === "entregado").length === 0 && (
                            <p className="text-center py-4 text-gray-500">No hay órdenes entregadas hoy</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
