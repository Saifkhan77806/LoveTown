"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react"

type DialogVariant = "default" | "success" | "error" | "warning" | "info"

interface CustomAlertDialogProps {
  isOpen: boolean
  title: string
  description: string
  variant?: DialogVariant
  cancelText?: string
  continueText?: string
  onCancel: () => void
  onContinue: () => void
}

const variantConfig = {
  default: {
    icon: null,
    accentColor: "bg-blue-600",
    accentColorHover: "hover:bg-blue-700",
    borderColor: "border-blue-200",
    titleColor: "text-gray-900",
    backgroundColor: "bg-gray-50",
  },
  success: {
    icon: CheckCircle2,
    accentColor: "bg-green-600",
    accentColorHover: "hover:bg-green-700",
    borderColor: "border-green-200",
    titleColor: "text-green-900",
    backgroundColor: "bg-green-50",
  },
  error: {
    icon: AlertCircle,
    accentColor: "bg-red-600",
    accentColorHover: "hover:bg-red-700",
    borderColor: "border-red-200",
    titleColor: "text-red-900",
    backgroundColor: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    accentColor: "bg-yellow-600",
    accentColorHover: "hover:bg-yellow-700",
    borderColor: "border-yellow-200",
    titleColor: "text-yellow-900",
    backgroundColor: "bg-yellow-50",
  },
  info: {
    icon: Info,
    accentColor: "bg-blue-600",
    accentColorHover: "hover:bg-blue-700",
    borderColor: "border-blue-200",
    titleColor: "text-blue-900",
    backgroundColor: "bg-blue-50",
  },
}

export function AlertDailog({
  isOpen,
  title,
  description,
  variant = "default",
  cancelText = "Cancel",
  continueText = "Continue",
  onCancel,
  onContinue,
}: CustomAlertDialogProps) {
  const config = variantConfig[variant]
  const IconComponent = config.icon

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
    }

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`w-full max-w-md rounded-lg shadow-2xl border-2 overflow-hidden ${config.borderColor} bg-white`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header with variant background */}
              <div className={`${config.backgroundColor} p-6 border-b-2 ${config.borderColor}`}>
                <div className="flex items-start gap-4">
                  {IconComponent && (
                    <IconComponent
                      className={`w-6 h-6 flex-shrink-0`}
                      style={{
                        color:
                          variantConfig[variant].accentColor.replace("bg-", "").split("-")[0] === "blue"
                            ? "#2563eb"
                            : variantConfig[variant].accentColor.replace("bg-", "").split("-")[0] === "green"
                              ? "#16a34a"
                              : variantConfig[variant].accentColor.replace("bg-", "").split("-")[0] === "red"
                                ? "#dc2626"
                                : "#ca8a04",
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h2 className={`text-lg font-semibold ${config.titleColor}`}>{title}</h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">{description}</p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onContinue}
                    className={`px-4 py-2 rounded-md font-medium text-white ${config.accentColor} ${config.accentColorHover} transition-colors duration-200`}
                  >
                    {continueText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
