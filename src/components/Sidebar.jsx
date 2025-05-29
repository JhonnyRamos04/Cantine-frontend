import { useState } from "react"
import { LogOut, Package, Wrench, Truck, ChefHat } from "lucide-react"

export const Sidebar = ({ activeCategory, setActiveCategory, user, onLogout }) => {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Menú diferente según el rol del usuario
    const getMenuItems = () => {
        const baseItems = [{ id: "perfil", label: "Perfil", icon: <ChefHat size={16} /> }]

        if (user?.role === "admin") {
            return [
                ...baseItems,
                { id: "productos", label: "Productos", icon: <Package size={16} /> },
                { id: "materiales", label: "Materiales", icon: <Wrench size={16} /> },
                { id: "provedores", label: "Proveedores", icon: <Truck size={16} /> },
                { id: "platos", label: "Platos", icon: <ChefHat size={16} /> },
                { id: "ventas", label: "Ventas", icon: <Package size={16} /> },
            ]
        } else {
            // Para clientes, solo mostrar perfil y tal vez un menú limitado
            return [
                ...baseItems,
                { id: "productos", label: "Ver Productos", icon: <Package size={16} /> },
                { id: "platos", label: "Órdenes", icon: <ChefHat size={16} /> },
            ]
        }
    }

    const menuItems = getMenuItems()

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className={`flex items-center gap-2 ${collapsed ? "md:hidden" : ""}`}>
                        <ChefHat className="text-green-600" size={24} />
                        <h1 className="text-2xl font-bold text-green-600">Cantine</h1>
                    </div>
                    <button className="hidden md:block p-1 rounded-md hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-0.5 h-3 bg-gray-600"></div>
                                <div className="w-3 h-0.5 bg-gray-600 absolute"></div>
                            </div>
                        ) : (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-3 h-0.5 bg-gray-600"></div>
                            </div>
                        )}
                    </button>
                </div>

                {/* User info */}
                <div className={`p-4 border-b bg-gray-50 ${collapsed ? "md:hidden" : ""}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {user?.role === "admin" ? "Administrador" : "Cliente"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu items */}
                <nav className="p-2 flex-1">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id} className="cursor-pointer">
                                <button
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md text-left font-semibold text-gray-800
                    ${activeCategory === item.id ? "bg-green-50 text-green-600" : "hover:scale-105 hover:bg-green-50"}
                    transition-all
                  `}
                                    onClick={() => {
                                        setActiveCategory(item.id)
                                        if (window.innerWidth < 768) setMobileOpen(false)
                                    }}
                                >
                                    <div className="size-8 p-1 rounded-full bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout button */}
                <div className="p-4 border-t">
                    <button
                        onClick={onLogout}
                        className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-left font-semibold text-red-600 hover:bg-red-50 transition-all
              ${collapsed ? "md:justify-center" : ""}
            `}
                    >
                        <div className="size-8 p-1 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                            <LogOut size={16} />
                        </div>
                        <span className={collapsed ? "md:hidden" : ""}>Cerrar Sesión</span>
                    </button>
                </div>

                {/* Footer */}
                <div className={`p-4 text-sm text-gray-500 border-t ${collapsed ? "md:hidden" : ""}`}>
                    <p>Cantine v1.0</p>
                </div>
            </aside>
        </>
    )
}
