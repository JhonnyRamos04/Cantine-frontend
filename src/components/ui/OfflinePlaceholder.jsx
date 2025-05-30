import { WifiOff, RefreshCw, Database } from "lucide-react"

export function OfflinePlaceholder({
    title = "Sin conexión",
    message = "No se puede conectar con el servidor",
    onRetry,
    showRetryButton = true,
    isRetrying = false,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <WifiOff className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="space-y-3">
                    {showRetryButton && onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                            {isRetrying ? "Reintentando..." : "Reintentar conexión"}
                        </button>
                    )}

                    <div className="text-sm text-gray-500">
                        <Database className="w-4 h-4 inline mr-1" />
                        Verifica que el servidor esté ejecutándose
                    </div>
                </div>
            </div>
        </div>
    )
}
