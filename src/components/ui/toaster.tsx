"use client"

import React from "react"
import { AnimatePresence } from "framer-motion"
import { Toast, type Toast as ToastType } from "./toast"

interface ToasterContextType {
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => string
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([])
  const MAX_TOASTS = 3 // limit maximum visible toasts to 3

  const addToast = React.useCallback((toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => {
      const updated = [...prev, { ...toast, id }]
      if (updated.length > MAX_TOASTS) {
        return updated.slice(-MAX_TOASTS)
      }
      return updated
    })
    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-3 p-4 max-w-sm pointer-events-none sm:max-w-md md:max-w-lg">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} onClose={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within ToasterProvider")
  }

  return {
    success: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      context.addToast({ message, type: "success", ...options }),
    error: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      context.addToast({ message, type: "error", ...options }),
    info: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      context.addToast({ message, type: "info", ...options }),
    warning: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      context.addToast({ message, type: "warning", ...options }),
    default: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
      context.addToast({ message, type: "default", ...options }),
  }
}
