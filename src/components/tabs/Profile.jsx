export const Profile = () => {
    return (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Perfil</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input type="text" className="w-full p-2 border rounded-md" placeholder="Nombre del usuario" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                        <input type="email" className="w-full p-2 border rounded-md" placeholder="correo@ejemplo.com" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select className="w-full p-2 border rounded-md">
                        <option>Administrador</option>
                        <option>Cocinero</option>
                        <option>Cajero</option>
                    </select>
                </div>
                <div className="pt-4">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Guardar Cambios</button>
                </div>
            </div>
        </div>
    )
}
