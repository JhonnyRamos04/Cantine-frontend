// Este es un EJEMPLO de cómo podrías tener tu AuthForms.jsx
// Ajusta según la estructura real de tu componente.



import React, { useState } from 'react';
import { Lock, Mail, UserPlus, Leaf, ChefHat, Apple, ArrowRight, ArrowLeft, User } from "lucide-react";
import { register, login } from '../utils/auth'; // Asegúrate de que la ruta sea correcta
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID


export default function AuthForms({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Estados del formulario de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Estados del formulario de registro
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    // Eliminado: confirmPassword
    roles_id: `${CLIENT_ID}` // ¡IMPORTANTE! Asegúrate de que este ID de rol exista en tu base de datos
  });

  const toggleForm = () => {
    setIsAnimating(true);
    setError("");
    // Resetea los formularios al cambiar
    setLoginData({ email: "", password: "" });
    setRegisterData({
      name: "",
      email: "",
      password: "",
      // Eliminado: confirmPassword
      roles_id: `${CLIENT_ID}` // Resetear también roles_id
    });
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  // Manejador para el formulario de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error("Por favor completa todos los campos");
      }

      // Llama a la función de login de la API
      const result = await login({
        email: loginData.email,
        password: loginData.password,
      });

      console.log(result)
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para el formulario de Registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Se actualiza la validación para que no incluya confirmPassword
      if (!registerData.name || !registerData.email || !registerData.password) {
        throw new Error("Por favor completa los campos de nombre, email y contraseña.");
      }
      // Se elimina la validación de coincidencia de contraseñas ya que confirmPassword se quitó
      // if (registerData.password !== registerData.confirmPassword) {
      //     throw new Error("Las contraseñas no coinciden");
      // }
      if (registerData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      // Log de los datos que se van a enviar
      console.log("Datos de registro a enviar:", registerData);

      // Llama a la función de registro de la API, incluyendo roles_id
      // Convertir roles_id a formato UUID
      const userData = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        roles_id: registerData.roles_id // Ya es string UUID
      };

      const result = await register(userData);

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        // Mostrar error específico del backend
        setError(result.error || result.message || "Error al registrarse");
      }
    } catch (err) {
      console.error("Error en handleRegister:", err);
      // Asegurarse de que el error.message del backend se muestre
      setError(err.message || 'Error de conexión o inesperado durante el registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { id, value } = e.target;
    setLoginData((prev) => ({ ...prev, [id]: value }));
  }

  const handleRegisterChange = (e) => {
    const { id, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [id]: value }));
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
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
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {isLogin ? (
            // LOGIN FORM
            <div className="animate-in slide-in-from-left-5 duration-500">
              <div className="space-y-3 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Lock size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
                <span className="text-green-100 flex justify-center items-center gap-1">Cantine<ChefHat /></span>
              </div>

              <form onSubmit={handleLogin} className="space-y-6 p-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-green-700">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 group-focus-within:text-green-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu email"
                      value={loginData.email}
                      onChange={handleLoginChange}
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
                      onChange={handleLoginChange}
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
              </form>
            </div>
          ) : (
            // REGISTER FORM
            <div className="animate-in slide-in-from-right-5 duration-500">
              <div className="space-y-3 text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-white/20 rounded-full">
                    <UserPlus size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                <span className="text-green-100 flex justify-center items-center gap-1">Cantine<ChefHat /></span>
              </div>
              <form onSubmit={handleRegister} className="space-y-5 p-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-emerald-700">
                    Nombre Completo
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="name"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      value={registerData.name}
                      onChange={handleRegisterChange}
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
                      onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-emerald-700">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors"
                      size={18}
                    />
                    <input
                      id="password"
                      type="password"
                      placeholder="Crea una contraseña"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 hover:border-emerald-300 bg-white"
                      disabled={loading}
                    />
                  </div>
                </div>
                {/* Campo Confirmar Contraseña ELIMINADO */}
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
                    ¿Ya tienes cuenta? Inicia sesión
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
