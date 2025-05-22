import { useState } from "react"


export const Sales = () => {
    const [period, setPeriod] = useState("hoy")

    // Datos de ejemplo para las ventas
    const salesData = {
        hoy: [
            { id: 1, product: "Hamburguesa", quantity: 15, total: 75.0 },
            { id: 2, product: "Pizza", quantity: 8, total: 120.0 },
            { id: 3, product: "Refresco", quantity: 25, total: 50.0 },
        ],
        semana: [
            { id: 1, product: "Hamburguesa", quantity: 87, total: 435.0 },
            { id: 2, product: "Pizza", quantity: 42, total: 630.0 },
            { id: 3, product: "Refresco", quantity: 156, total: 312.0 },
        ],
        mes: [
            { id: 1, product: "Hamburguesa", quantity: 320, total: 1600.0 },
            { id: 2, product: "Pizza", quantity: 180, total: 2700.0 },
            { id: 3, product: "Refresco", quantity: 540, total: 1080.0 },
        ],
    }

    const totalSales = salesData[period].reduce((sum, item) => sum + item.total, 0)

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Reporte de Ventas</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPeriod("hoy")}
                            className={`px-3 py-1 rounded ${period === "hoy" ? "bg-green-500 text-white" : "bg-gray-100"}`}
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => setPeriod("semana")}
                            className={`px-3 py-1 rounded ${period === "semana" ? "bg-green-500 text-white" : "bg-gray-100"}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setPeriod("mes")}
                            className={`px-3 py-1 rounded ${period === "mes" ? "bg-green-500 text-white" : "bg-gray-100"}`}
                        >
                            Mes
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-gray-500">Total Ventas</p>
                        <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-500">Productos Vendidos</p>
                        <p className="text-2xl font-bold">{salesData[period].reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-sm text-gray-500">Ticket Promedio</p>
                        <p className="text-2xl font-bold">${(totalSales / salesData[period].length).toFixed(2)}</p>
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-2 text-left border-b">Producto</th>
                            <th className="p-2 text-right border-b">Cantidad</th>
                            <th className="p-2 text-right border-b">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData[period].map((item) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{item.product}</td>
                                <td className="p-2 text-right">{item.quantity}</td>
                                <td className="p-2 text-right">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-medium">
                            <td className="p-2">Total</td>
                            <td className="p-2 text-right">{salesData[period].reduce((sum, item) => sum + item.quantity, 0)}</td>
                            <td className="p-2 text-right">${totalSales.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
