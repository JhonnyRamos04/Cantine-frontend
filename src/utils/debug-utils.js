// Utilidades de depuración para ayudar a diagnosticar problemas con los platos y órdenes

// Función para registrar el estado de un plato antes y después de actualizarlo
export async function logDishUpdate(dish, updatedData, result) {
  console.group("=== ACTUALIZACIÓN DE PLATO ===")
  console.log("ID del plato:", dish.dishes_id || dish.id)
  console.log("Nombre del plato:", dish.name)
  console.log("Estado anterior:", dish.status_id || "null")
  console.log("Datos enviados para actualización:", updatedData)
  console.log("Resultado de la actualización:", result)
  console.groupEnd()

  return result
}

// Función para verificar si un plato tiene todos los campos necesarios
export function validateDishData(dishData) {
  const requiredFields = ["name", "status_id"]
  const missingFields = requiredFields.filter((field) => !dishData[field])

  if (missingFields.length > 0) {
    console.warn(`Advertencia: Faltan campos requeridos en los datos del plato: ${missingFields.join(", ")}`)
    return false
  }

  return true
}

// Función para mostrar el estado actual de los platos
export async function debugDishes(dishes) {
  console.group("=== ESTADO ACTUAL DE PLATOS ===")
  console.log("Total de platos:", dishes.length)

  const byStatus = {}
  dishes.forEach((dish) => {
    const statusKey = dish.status_id || "null"
    if (!byStatus[statusKey]) byStatus[statusKey] = []
    byStatus[statusKey].push(dish)
  })

  console.log("Platos por estado:")
  Object.entries(byStatus).forEach(([status, dishes]) => {
    console.log(`- Estado ${status}: ${dishes.length} platos`)
    dishes.forEach((dish) => {
      console.log(`  * ${dish.name} (ID: ${dish.dishes_id || dish.id})`)
    })
  })

  console.groupEnd()
}
