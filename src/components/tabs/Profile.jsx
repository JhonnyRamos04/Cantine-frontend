import { useState } from "react"
import { Mail, Shield, Calendar, User, Edit3, Save, X } from "lucide-react"

export function Profile({ user }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "client",
    })

    if (!user) return null

    const handleEdit = () => {
        setIsEditing(true)
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        })
    }

    const handleSave = () => {
        // Aquí podrías hacer la llamada a la API para actualizar el perfil
        console.log("Guardando cambios:", formData)
        // Simular guardado exitoso
        setIsEditing(false)
        // En una implementación real, actualizarías el estado del usuario
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header del perfil */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-green-100">{user.email}</p>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-white/20 text-white"
                                        }`}
                                >
                                    {user.role === "admin" ? "Administrador" : "Cliente"}
                                </span>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Edit3 size={16} />
                                Editar Perfil
                            </button>
                        )}
                    </div>
                </div>

                {/* Información del perfil */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Información del Perfil</h3>

                        {isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <X size={16} />
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre Completo */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900">{user.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Correo Electrónico */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900">{user.email}</span>
                                </div>
                            )}
                        </div>

                        {/* Rol */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Rol del Usuario</label>
                            {isEditing && user.role === "admin" ? (
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="client">Cliente</option>
                                </select>
                            ) : (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900">
                                        {user.role === "admin" ? "Administrador del Sistema" : "Cliente"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ID de Usuario */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-900 font-mono">{user.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permisos y Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Permisos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Permisos del Sistema</h4>
                    <div className="space-y-3">
                        {user.role === "admin" ? (
                            <>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Gestionar productos</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Gestionar materiales</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Gestionar proveedores</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Ver reportes de ventas</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-800">Acceso completo al sistema</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-800">Ver productos disponibles</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-800">Realizar pedidos</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-800">Gestionar perfil personal</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Último acceso</span>
                            <span className="text-sm font-medium text-gray-900">Hoy, 14:30</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Sesiones activas</span>
                            <span className="text-sm font-medium text-gray-900">1</span>
                        </div>
                        {user.role === "admin" && (
                            <>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Productos gestionados</span>
                                    <span className="text-sm font-medium text-gray-900">24</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Ventas del día</span>
                                    <span className="text-sm font-medium text-green-600">$1,245.00</span>
                                </div>
                            </>
                        )}
                        {user.role === "client" && (
                            <>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Pedidos realizados</span>
                                    <span className="text-sm font-medium text-gray-900">8</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total gastado</span>
                                    <span className="text-sm font-medium text-green-600">$156.50</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
