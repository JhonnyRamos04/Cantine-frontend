import { Profile } from "./tabs/Profile"
import { Product } from "./tabs/Product"
import { Materials } from "./tabs/Materials"
import { Providers } from "./tabs/Providers"
import { Dishes } from "./tabs/Dishes"
import { Sales } from "./tabs/Sales"

export function DashboardContent({ activeCategory, user }) {
    return (
        <div className="p-6">
            {/* Header con información del usuario */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {activeCategory === "perfil" && "Mi Perfil"}
                    {activeCategory === "productos" &&
                        (user?.role === "admin" ? "Gestión de Productos" : "Nuestros Deliciosos Platos")}
                    {activeCategory === "materiales" && "Gestión de Materiales"}
                    {activeCategory === "provedores" && "Gestión de Proveedores"}
                    {activeCategory === "platos" && (user?.role === "admin" ? "Gestión de Platos" : "Mis Órdenes")}
                    {activeCategory === "ventas" && "Reporte de Ventas"}
                </h1>
                <p className="text-gray-600">
                    Bienvenido, {user?.name} ({user?.role === "admin" ? "Administrador" : "Cliente"})
                </p>
            </div>

            {/* Contenido según la categoría activa */}
            {activeCategory === "perfil" && <Profile user={user} />}
            {activeCategory === "productos" && <Product user={user} />}
            {activeCategory === "materiales" && user?.role === "admin" && <Materials />}
            {activeCategory === "provedores" && user?.role === "admin" && <Providers />}
            {activeCategory === "platos" && <Dishes user={user} />}
            {activeCategory === "ventas" && user?.role === "admin" && <Sales />}

            {/* Mensaje para clientes que intentan acceder a secciones de admin */}
            {(activeCategory === "materiales" || activeCategory === "provedores" || activeCategory === "ventas") &&
                user?.role === "client" && (
                    <div className="text-center py-12">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">Acceso Restringido</h3>
                            <p className="text-yellow-700">Esta sección está disponible solo para administradores.</p>
                        </div>
                    </div>
                )}
        </div>
    )
}
