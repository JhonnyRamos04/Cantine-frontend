import { useState, useEffect, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function Toast({ id, type = "info", title, message, duration = 5000, onClose }) {
    const [isVisible, setIsVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)

    const handleClose = useCallback(() => {
        setIsExiting(true)
        setTimeout(() => {
            setIsVisible(false)
            onClose?.(id)
        }, 300)
    }, [id, onClose])

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [duration, handleClose])

    if (!isVisible) return null

    const getToastStyles = () => {
        const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform"
        const exitStyles = isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"

        switch (type) {
            case "success":
                return `${baseStyles} ${exitStyles} bg-green-50 border-green-200 text-green-800`
            case "error":
                return `${baseStyles} ${exitStyles} bg-red-50 border-red-200 text-red-800`
            case "warning":
                return `${baseStyles} ${exitStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
            case "info":
            default:
                return `${baseStyles} ${exitStyles} bg-blue-50 border-blue-200 text-blue-800`
        }
    }

    const getIcon = () => {
        const iconProps = { size: 20, className: "flex-shrink-0 mt-0.5" }

        switch (type) {
            case "success":
                return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-600`} />
            case "error":
                return <AlertCircle {...iconProps} className={`${iconProps.className} text-red-600`} />
            case "warning":
                return <AlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-600`} />
            case "info":
            default:
                return <Info {...iconProps} className={`${iconProps.className} text-blue-600`} />
        }
    }

    return (
        <div className={getToastStyles()}>
            {getIcon()}
            <div className="flex-1 min-w-0">
                {title && <div className="font-medium text-sm mb-1">{title}</div>}
                {message && <div className="text-sm opacity-90">{message}</div>}
            </div>
            <button onClick={handleClose} className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors">
                <X size={16} />
            </button>
        </div>
    )
}
