// Simple toast hook implementation
import { useState, useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Toast) => {
    console.log("Toast:", toast);
    // In production, integrate with a proper toast library like sonner or react-hot-toast
    alert(`${toast.title}\n${toast.description || ""}`);
  }, []);

  return { toast, toasts };
}

