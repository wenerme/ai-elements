"use client"

import * as React from "react"
import { Toast as ToastPrimitives } from "@repo/shadcn-ui/lib/base-ui"

import type {
  ToastActionElement,
  ToastProps,
} from "@repo/shadcn-ui/components/ui/toast"

const toastManager = ToastPrimitives.createToastManager()

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id">

function toToastOptions({
  action,
  description,
  onOpenChange,
  title,
  variant,
  ...props
}: Toast & { id?: string }) {
  return {
    ...props,
    data: {
      action,
      variant,
    },
    description,
    onClose: () => onOpenChange?.(false),
    title,
    type: variant ?? "default",
  }
}

function toast({ ...props }: Toast) {
  const id = toastManager.add(toToastOptions(props))

  const update = (nextProps: Toast) =>
    toastManager.update(id, toToastOptions(nextProps))
  const dismiss = () => toastManager.close(id)

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const manager = ToastPrimitives.useToastManager()
  const toasts = manager.toasts.map((toastObject) => ({
    ...toastObject,
    action: toastObject.data?.action,
    id: toastObject.id,
    variant: toastObject.data?.variant,
  })) as ToasterToast[]

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => toastManager.close(toastId),
  }
}

export { useToast, toast, toastManager }
