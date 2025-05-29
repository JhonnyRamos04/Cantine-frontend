import { useState } from "react"
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from "lucide-react"

export function Sales() {
    const [period, setPeriod] = useState("hoy")

    // Datos de ejemplo para las ventas
    const salesData = {
        hoy: [
            { id: 1, product: "Hamburguesa Clásica", quantity: 15, price: 5.0, total: 75.0 },
            { id: 2, product: "Pizza Margherita", quantity: 8, price: 15.0, total: 120.0 },
            { id: 3, product: "Refresco", quantity: 25, price: 2.0, total: 50.0 },
            { id: 4, product: "Ensalada César", quantity: 12, price: 8.0, total: 96.0 },
            { id: 5, product: "Pasta Carbonara", quantity: 6, price: 12.0, total: 72.0 },
        ],
        semana: [
            { id: 1, product: "Hamburguesa Clásica", quantity: 87, price: 5.0, total: 435.0 },
            { id: 2, product: "Pizza Margherita", quantity: 42, price: 15.0, total: 630.0 },
            { id: 3, product: "Refresco", quantity: 156, price: 2.0, total: 312.0 },
            { id: 4, product: "Ensalada César", quantity: 68, price: 8.0, total: 544.0 },
            { id: 5, product: "Pasta Carbonara", quantity: 35, price: 12.0, total: 420.0 },
        ],
        mes: [
            { id: 1, product: "Hamburguesa Clásica", quantity: 320, price: 5.0, total: 1600.0 },
            { id: 2, product: "Pizza Margherita", quantity: 180, price: 15.0, total: 2700.0 },
            { id: 3, product: "Refresco", quantity: 540, price: 2.0, total: 1080.0 },
            { id: 4, product: "Ensalada César", quantity: 245, price: 8.0, total: 1960.0 },
            { id: 5, product: "Pasta Carbonara", quantity: 125, price: 12.0, total: 1500.0 },
        ],
    }

    const currentData = salesData[period]
    const totalSales = currentData.reduce((sum, item) => sum + item.total, 0)
    const totalQuantity = currentData.reduce((sum, item) => sum + item.quantity, 0)
    const averageTicket = totalSales / currentData.length

    const getPeriodLabel = () => {
        switch (period) {
            case "hoy":
                return "Hoy"
            case "semana":
                return "Esta Semana"
            case "mes":
                return "Este Mes"
            default:
                return "Hoy"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros de período */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reporte de Ventas</h2>
                        <p className="text-gray-600">Análisis de ventas - {getPeriodLabel()}</p>
                    </div>
                    <div className="flex space-x-2">
                        {["hoy", "semana", "mes"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === p ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {p === "hoy" ? "Hoy" : p === "semana" ? "Semana" : "Mes"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Ventas</p>
                            <p className="text-3xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
                            <p className="text-sm text-green-500 mt-1">↗ +12.5% vs anterior</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Productos Vendidos</p>
                            <p className="text-3xl font-bold text-blue-600">{totalQuantity}</p>
                            <p className="text-sm text-blue-500 mt-1">↗ +8.3% vs anterior</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Ticket Promedio</p>
                            <p className="text-3xl font-bold text-purple-600">${averageTicket.toFixed(2)}</p>
                            <p className="text-sm text-purple-500 mt-1">↗ +5.2% vs anterior</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Productos Únicos</p>
                            <p className="text-3xl font-bold text-orange-600">{currentData.length}</p>
                            <p className="text-sm text-orange-500 mt-1">= Sin cambios</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <BarChart3 className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla detallada de ventas */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Detalle de Ventas por Producto</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio Unit.
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cantidad
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    % del Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentData.map((item, index) => {
                                const percentage = (item.total / totalSales) * 100
                                return (
                                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">{item.product.charAt(0)}</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.product}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                            ${item.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${item.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {percentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">-</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    {totalQuantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    ${totalSales.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Productos - {getPeriodLabel()}</h3>
                <div className="space-y-4">
                    {currentData
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 3)
                        .map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                                            }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.product}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} unidades vendidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">${item.total.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{((item.total / totalSales) * 100).toFixed(1)}% del total</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
