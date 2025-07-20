"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"
import { toast as sonnerToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: {
          background:'#fff'
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

const defaultToastOptions = {
  duration: 5000,
  position: "bottom-right",
  background: 'red',
}

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant = "default", ...props }: ToastProps) => {
    const toastFn = variant === "destructive" ? sonnerToast.error : sonnerToast

    return toastFn(title || "", {
      description,
      ...defaultToastOptions,
      position: defaultToastOptions.position as "bottom-right",
      ...props,
    })
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "destructive" }),
    success: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "default" }),
  }
}