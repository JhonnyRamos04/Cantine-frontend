import { makeRequest, handleConnectionError } from "./db.js"

// ==================== ÓRDENES (ORDERS) ====================

// Obtener todas las órdenes
export async function getOrders() {
  try {
    const data = await makeRequest("http://localhost:5000/orders/")
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getOrders")
  } catch (error) {
    return handleConnectionError(error, "getOrders")
  }
}

// Obtener una orden por ID
export async function getOrderById(orderId) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/${orderId}`)
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getOrderById")
  } catch (error) {
    return handleConnectionError(error, "getOrderById")
  }
}

// Crear una nueva orden
export async function createOrder(orderData) {
  try {
    const data = await makeRequest("http://localhost:5000/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    if (data.success) {
      return { success: true, order: data.data }
    } else if (data.isHttpError && data.status === 400) {
      if (data.data && data.data.order) {
        console.log("Orden creada exitosamente (a pesar del 400 BAD REQUEST):", data.data.order)
        return { success: true, order: data.data.order }
      } else {
        throw new Error(data.message)
      }
    } else {
      throw new Error(data.message || "Error al crear la orden")
    }
  } catch (error) {
    return handleConnectionError(error, "createOrder")
  }
}

// Actualizar una orden existente
export async function updateOrder(orderId, orderData) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "updateOrder")
  } catch (error) {
    return handleConnectionError(error, "updateOrder")
  }
}

// Eliminar una orden
export async function deleteOrder(orderId) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/${orderId}`, {
      method: "DELETE",
    })
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "deleteOrder")
  } catch (error) {
    return handleConnectionError(error, "deleteOrder")
  }
}

// Obtener órdenes por usuario
export async function getOrdersByUser(userId) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/user/${userId}`)
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getOrdersByUser")
  } catch (error) {
    return handleConnectionError(error, "getOrdersByUser")
  }
}

// Obtener órdenes por plato
export async function getOrdersByDish(dishId) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/dish/${dishId}`)
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getOrdersByDish")
  } catch (error) {
    return handleConnectionError(error, "getOrdersByDish")
  }
}
// Obtener platos por estado
export async function getOrderByStatus(statusId) {
  try {
    const data = await makeRequest(`http://localhost:5000/orders/status/${statusId}`)
    return data.success ? data.data : handleConnectionError(data.error || new Error(data.message), "getDishesByStatus");
  } catch (error) {
    return handleConnectionError(error, "getDishesByStatus")
  }
}