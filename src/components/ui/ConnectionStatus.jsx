import { useState, useEffect } from "react"
import { WifiOff, RefreshCw } from "lucide-react"
import { getConnectionStatus } from "../../utils/db"

export function ConnectionStatus({ onRetry }) {
    const [status, setStatus] = useState(getConnectionStatus())
    const [isRetrying, setIsRetrying] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(getConnectionStatus())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleRetry = async () => {
        setIsRetrying(true)
        try {
            await onRetry?.()
        } finally {
            setTimeout(() => setIsRetrying(false), 1000)
        }
    }

    if (status.isConnected) {
        return null // No mostrar nada si está conectado
    }

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <WifiOff className="w-5 h-5 text-red-600" />
                    <div>
                        <h4 className="text-sm font-medium text-red-800">Sin conexión al servidor</h4>
                        <p className="text-sm text-red-600">{status.lastError}</p>
                    </div>
                </div>

                {onRetry && (
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                        {isRetrying ? "Reintentando..." : "Reintentar"}
                    </button>
                )}
            </div>

            {status.retryCount > 0 && <p className="text-xs text-red-500 mt-2">Intentos fallidos: {status.retryCount}</p>}
        </div>
    )
}
