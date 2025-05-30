"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { Toast } from "./toast"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random()
        const newToast = { id, ...toast }

        setToasts((prev) => [...prev, newToast])

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showSuccess = useCallback(
        (title, message) => {
            return addToast({ type: "success", title, message })
        },
        [addToast],
    )

    const showError = useCallback(
        (title, message) => {
            return addToast({ type: "error", title, message })
        },
        [addToast],
    )

    const showWarning = useCallback(
        (title, message) => {
            return addToast({ type: "warning", title, message })
        },
        [addToast],
    )

    const showInfo = useCallback(
        (title, message) => {
            return addToast({ type: "info", title, message })
        },
        [addToast],
    )

    const value = {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={onRemove}
                />
            ))}
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        console.warn("useToast must be used within a ToastProvider")
        // Retornar funciones vacías como fallback
        return {
            toasts: [],
            addToast: () => { },
            removeToast: () => { },
            showSuccess: () => { },
            showError: () => { },
            showWarning: () => { },
            showInfo: () => { },
        }
    }
    return context
}
