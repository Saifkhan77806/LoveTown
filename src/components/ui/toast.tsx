"use client";

import React, { useEffect } from "react";

import { motion } from "framer-motion";
import { Check, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { fetchMatchedUserasync } from "../../slice/matchedSlice";
import { useUser } from "@clerk/clerk-react";

export type ToastType = "success" | "error" | "info" | "warning" | "default";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends Toast {
  onClose: () => void;
}

export function Toast({
  id,
  message,
  type,
  duration = 4000,
  action,
  onClose,
}: ToastProps) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <Check className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    default: null,
  };

  const colors: Record<ToastType, string> = {
    success:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    warning:
      "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    default:
      "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
  };

  const textColors: Record<ToastType, string> = {
    success: "text-green-700 dark:text-green-300",
    error: "text-red-700 dark:text-red-300",
    info: "text-blue-700 dark:text-blue-300",
    warning: "text-amber-700 dark:text-amber-300",
    default: "text-neutral-700 dark:text-neutral-300",
  };

  const iconColors: Record<ToastType, string> = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-amber-600 dark:text-amber-400",
    default: "text-neutral-600 dark:text-neutral-400",
  };

  const { user } = useUser();
  const email = user?.emailAddresses[0].emailAddress;
  const dispatch = useAppDispatch();
  const { matchedUser } = useAppSelector((state) => state.matched);

  // Auto close timer
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  useEffect(() => {
    if (!matchedUser && email) {
      dispatch(fetchMatchedUserasync(email));
    }
  }, [email, matchedUser]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 min-w-xs w-full py-3 shadow-lg backdrop-blur-sm",
        colors[type]
      )}
    >
      {icons[type] && (
        <div className={cn("flex-shrink-0", iconColors[type])}>
          {icons[type]}
        </div>
      )}

      <div className="size-10 rounded-full overflow-hidden">
        <img src={matchedUser?.photos} className="size-full" alt="" />
      </div>

      <div className="flex-1">
        <p className={cn("text-sm font-medium", textColors[type])}>{message}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "text-sm font-medium underline hover:opacity-75 transition-opacity flex-shrink-0",
            textColors[type]
          )}
        >
          {action.label}
        </button>
      )}

      <button
        onClick={onClose}
        className={cn(
          "flex-shrink-0 p-1 hover:opacity-75 transition-opacity",
          textColors[type]
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
