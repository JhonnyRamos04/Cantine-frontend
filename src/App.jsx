import { useState, useEffect } from "react"
import { Sidebar } from "./components/Sidebar"
import { DashboardContent } from "./components/DashboardContent"
import AuthForms from "./components/AuthForms"
import { ToastProvider } from "./components/ui/toast-container"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [activeCategory, setActiveCategory] = useState("productos")
  const [loading, setLoading] = useState(true)

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem("cantine_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("cantine_user")
      }
    }
    setLoading(false)
  }, [])

  // Función para manejar el login exitoso
  const handleLoginSuccess = (userData) => {
    console.log(userData)
    setUser(userData)
    setIsAuthenticated(true)
    // Guardar en localStorage para persistir la sesión
    localStorage.setItem("cantine_user", JSON.stringify(userData))

    // Establecer categoría inicial según el rol
    if (userData.role.name === "admin") {
      setActiveCategory("productos")
    } else {
      setActiveCategory("perfil")
    }
  }

  // Función para manejar el logout
  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("cantine_user")
    setActiveCategory("productos")
  }

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </ToastProvider>
    )
  }

  // Si no está autenticado, mostrar formulario de auth
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <AuthForms onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
    )
  }

  // Si está autenticado, mostrar dashboard
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <Sidebar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            user={user}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto md:ml-16 lg:ml-64">
            <DashboardContent activeCategory={activeCategory} user={user} />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
