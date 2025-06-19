import { makeRequest, handleConnectionError } from './db.js';

const API_URL = 'http://localhost:5000/auth';

/**
 * Guarda el token de autenticación en localStorage.
 * @param {string} token - El token JWT.
 */
function saveToken(token) {
    if (token) {
        localStorage.setItem('authToken', token);
    }
}

/**
 * Obtiene el token de autenticación de localStorage.
 * @returns {string|null} El token JWT o null si no existe.
 */
export function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Elimina el token de autenticación de localStorage.
 */
export function logout() {
    localStorage.removeItem('authToken');
    // Aquí podrías redirigir al usuario a la página de login.
    console.log("Sesión cerrada.");
}

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - Las credenciales del usuario.
 * @param {string} credentials.email - El email del usuario.
 * @param {string} credentials.password - La contraseña del usuario.
 * @returns {Promise<object>} Una promesa que resuelve con los datos del usuario si es exitoso.
 */
export async function login(credentials) {
    try {
        const response = await makeRequest(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
        // Verificar estructura de respuesta
        if (response.data.user) {
            saveToken(response.access_token);
            return { success: true, user: response.data.user };
        } else {
            // Manejar errores específicos del backend
            throw new Error(response.data.error);
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error en el inicio de sesión'
        };
    }
}

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Los datos del nuevo usuario.
 * @param {string} userData.name - El nombre completo del usuario.
 * @param {string} userData.email - El email del usuario.
 * @param {string} userData.password - La contraseña del usuario.
 * @param {string} userData.roles_id - El ID del rol del usuario.
 * @returns {Promise<object>} Una promesa que resuelve con los datos del nuevo usuario si es exitoso.
 */
export async function register(userData) {
    try {
        // Se asume que el endpoint de registro es /auth/register
        const response = await makeRequest(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        // El backend devuelve directamente los datos y tokens.
        if (response.data.user) {
            saveToken(response.data.access_token); // Guardar el token de acceso
            // No hay una propiedad 'success' directa en la respuesta del controlador Python para register.
            // Se asume éxito si 'user' y 'access_token' están presentes.
            return { success: true, user: response.data.user };
        } else {
            // Lanza un error para que sea manejado en el formulario.
            throw new Error(response.message || 'Error al registrar la cuenta.');
        }
    } catch (error) {
        return handleConnectionError(error, "register");
    }
}

/**
 * Obtiene la información del usuario actual.
 * @returns {Promise<object>} Una promesa que resuelve con los datos del usuario.
 */
export async function getCurrentUser() {
    try {
        const response = await makeRequest(`${API_URL}/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` } // Aunque el backend no lo usa, lo mantenemos por consistencia
        });

        if (response.data.user) {
            return { success: true, user: response.data.user };
        } else {
            throw new Error(response.error || 'No se pudo obtener la información del usuario.');
        }
    } catch (error) {
        return handleConnectionError(error, "getCurrentUser");
    }
}

/**
 * Cambia la contraseña de un usuario.
 * @param {string} userId - El ID del usuario.
 * @param {string} newPassword - La nueva contraseña.
 * @returns {Promise<object>} Una promesa que resuelve con un mensaje de éxito.
 */
export async function changePassword(userId, newPassword) {
    try {
        const response = await makeRequest(`${API_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }, // Aunque el backend no lo usa, lo mantenemos por consistencia
            body: JSON.stringify({ user_id: userId, new_password: newPassword })
        });

        if (response.data.message) {
            return { success: true, message: response.data.message };
        } else {
            throw new Error(response.error || 'Error al cambiar la contraseña.');
        }
    } catch (error) {
        return handleConnectionError(error, "changePassword");
    }
}

/**
 * Renueva el token de acceso.
 * @returns {Promise<object>} Una promesa que resuelve con el nuevo token de acceso.
 */
export async function refreshToken() {
    try {
        const response = await makeRequest(`${API_URL}/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` } // Aunque el backend no lo usa, lo mantenemos por consistencia
        });

        if (response.data.access_token) {
            saveToken(response.data.access_token);
            return { success: true, token: response.data.access_token };
        } else {
            throw new Error(response.error || 'Error al renovar el token.');
        }
    } catch (error) {
        return handleConnectionError(error, "refreshToken");
    }
}
