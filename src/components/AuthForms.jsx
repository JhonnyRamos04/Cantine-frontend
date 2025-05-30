import { useState } from "react"
import { Lock, Mail, UserPlus, Leaf, ChefHat, Apple, ArrowRight, ArrowLeft } from "lucide-react"

export default function AuthForms({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados del formulario
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const toggleForm = () => {
    setIsAnimating(true)
    setError("")
    setTimeout(() => {
      setIsLogin(!isLogin)
      setIsAnimating(false)
    }, 300)
  }

  // Simulación de autenticación (reemplazar con tu API real)
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simulación de delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validación básica
      if (!loginData.username || !loginData.password) {
        throw new Error("Por favor completa todos los campos")
      }

      // Simulación de usuarios (reemplazar con tu lógica de autenticación real)
      let user
      if (loginData.username === "admin" && loginData.password === "admin") {
        user = {
          id: "1",
          name: "Administrador",
          email: "admin@cantine.com",
          role: "admin",
        }
      } else if (loginData.username === "cliente" && loginData.password === "cliente") {
        user = {
          id: "2",
          name: "Cliente",
          email: "cliente@cantine.com",
          role: "client",
        }
      } else {
        throw new Error("Credenciales incorrectas")
      }

      onLoginSuccess(user)
    } catch (error) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simulación de delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validaciones
      if (!registerData.fullname || !registerData.email || !registerData.password || !registerData.confirmPassword) {
        throw new Error("Por favor completa todos los campos")
      }

      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      if (registerData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      // Simulación de registro exitoso
      const newUser = {
        id: Date.now().toString(),
        name: registerData.fullname,
        email: registerData.email,
        role: "client", // Por defecto los nuevos usuarios son clientes
      }

      onLoginSuccess(newUser)
    } catch (error) {
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-green-200 opacity-20">
          <Apple size={120} />
        </div>
        <div className="absolute bottom-20 right-20 text-emerald-200 opacity-20">
          <ChefHat size={100} />
        </div>
        <div className="absolute top-1/2 left-10 text-teal-200 opacity-15">
          <Leaf size={80} />
        </div>
      </div>

      <div className="relative">
        <div
          className={`w-full max-w-md transition-all duration-500 transform ${isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
            } shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden`}
        >
          {/* Mostrar errores */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLogin ? (
            // LOGIN FORM
            <div className="animate-in slide-in-from-left-5 duration-500">
              {/* Header */}
              <div className="space-y-3 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Lock size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
                <span className="text-green-100 flex justify-center items-center gap-1">Cantine<ChefHat /></span>
              </div>

              {/* Content */}
              <form onSubmit={handleLogin} className="space-y-6 p-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-green-700">
                    Usuario
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 group-focus-within:text-green-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      value={loginData.username}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-green-700">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 group-focus-within:text-green-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ArrowRight className="mr-2" size={18} />
                      Iniciar Sesión
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleForm}
                    disabled={loading}
                    className="text-sm text-green-600 hover:text-green-800 underline transition-colors duration-300 flex items-center justify-center mx-auto group disabled:opacity-50"
                  >
                    ¿No tienes cuenta? Regístrate aquí
                    <UserPlus className="ml-1 group-hover:translate-x-1 transition-transform" size={16} />
                  </button>
                </div>

                {/* Demo credentials */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Credenciales de prueba:</p>
                  <p>Admin: usuario "admin", contraseña "admin"</p>
                  <p>Cliente: usuario "cliente", contraseña "cliente"</p>
                </div>
              </form>
            </div>
          ) : (
            // REGISTER FORM
            <div className="animate-in slide-in-from-right-5 duration-500">
              {/* Header */}
              <div className="space-y-3 text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-white/20 rounded-full">
                    <UserPlus size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                <span className="text-green-100 flex justify-center items-center gap-1">Cantine<ChefHat /></span>
              </div>

              {/* Content */}
              <form onSubmit={handleRegister} className="space-y-5 p-6">
                <div className="space-y-2">
                  <label htmlFor="fullname" className="block text-sm font-medium text-emerald-700">
                    Nombre Completo
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="fullname"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      value={registerData.fullname}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, fullname: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-emerald-700">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="block text-sm font-medium text-emerald-700">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="reg-password"
                      type="password"
                      placeholder="Crea una contraseña"
                      value={registerData.password}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-emerald-700">
                    Confirmar Contraseña
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirma tu contraseña"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserPlus className="mr-2" size={18} />
                      Crear Cuenta
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleForm}
                    disabled={loading}
                    className="text-sm text-emerald-600 hover:text-emerald-800 underline transition-colors duration-300 flex items-center justify-center mx-auto group disabled:opacity-50"
                  >
                    <ArrowLeft className="mr-1 group-hover:-translate-x-1 transition-transform" size={16} />
                    ¿Ya tienes cuenta? Inicia sesión aquí
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
