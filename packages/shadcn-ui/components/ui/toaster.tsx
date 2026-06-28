"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@repo/shadcn-ui/components/ui/toast"
import { useToast, toastManager } from "@repo/shadcn-ui/hooks/use-toast"

function ToastList() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ action, description, id, title, variant, ...toast }) => (
        <Toast key={id} toast={toast} variant={variant}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </>
  )
}

export function Toaster() {
  return (
    <ToastProvider toastManager={toastManager}>
      <ToastList />
    </ToastProvider>
  )
}
