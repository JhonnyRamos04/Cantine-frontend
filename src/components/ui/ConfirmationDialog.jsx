import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar acción",
    message = "¿Estás seguro de que quieres continuar?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "warning", // warning, danger, info
}) {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error("Error en confirmación:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getTypeStyles = () => {
        switch (type) {
            case "danger":
                return {
                    icon: "text-red-600",
                    button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                }
            case "info":
                return {
                    icon: "text-blue-600",
                    button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                }
            case "warning":
            default:
                return {
                    icon: "text-yellow-600",
                    button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-start p-6">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                    <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${styles.button}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
