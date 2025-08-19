"use client"
import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from "sonner"
import { toast as sonnerToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast grid w-full grid-cols-[auto_1fr] items-start gap-x-4 rounded-lg border bg-background p-4 text-foreground shadow-lg [&_:is([data-buttons],[data-action])]:col-start-2 [&_:is([data-buttons],[data-action])]:mt-2 [&_:is([data-buttons],[data-action])]:flex [&_:is([data-buttons],[data-action])]:gap-2",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground",
          cancelButton:
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground",
          closeButton:
            "absolute right-2 top-2 rounded-full p-1.5 text-foreground/50 opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
          loader:
            "h-5 w-5 animate-spin rounded-full border-4 border-muted border-t-primary",
          success:
            "!border-green-500 !bg-green-50 !text-green-600 [&[data-theme=dark]]:!border-green-800 [&[data-theme=dark]]:!bg-green-950 [&[data-theme=dark]]:!text-green-400 [&_.text-muted-foreground]:!text-green-700 [&[data-theme=dark]_.text-muted-foreground]:!text-green-300",
          info: "!border-blue-500 !bg-blue-50 !text-blue-600 [&[data-theme=dark]]:!border-blue-800 [&[data-theme=dark]]:!bg-blue-950 [&[data-theme=dark]]:!text-blue-400 [&_.text-muted-foreground]:!text-blue-700 [&[data-theme=dark]_.text-muted-foreground]:!text-blue-300",
          warning:
            "!border-yellow-500 !bg-yellow-50 !text-yellow-600 [&[data-theme=dark]]:!border-yellow-800 [&[data-theme=dark]]:!bg-yellow-950 [&[data-theme=dark]]:!text-yellow-400 [&_.text-muted-foreground]:!text-yellow-700 [&[data-theme=dark]_.text-muted-foreground]:!text-yellow-300",
          error:
            "!border-red-500 !bg-red-50 !text-red-600 [&[data-theme=dark]]:!border-red-800 [&[data-theme=dark]]:!bg-red-950 [&[data-theme=dark]]:!text-red-400 [&_.text-muted-foreground]:!text-red-700 [&[data-theme=dark]_.text-muted-foreground]:!text-red-300",
          icon: "h-5 w-5 shrink-0",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

// Direct toast function for use outside React components
export const toast = {
  success: (title: string, options?: { description?: string }) => {
    return sonnerToast.success(title, {
      description: options?.description,
      ...defaultToastOptions,
      position: defaultToastOptions.position as "bottom-right",
    })
  },
  error: (title: string, options?: { description?: string }) => {
    return sonnerToast.error(title, {
      description: options?.description,
      ...defaultToastOptions,
      position: defaultToastOptions.position as "bottom-right",
    })
  },
  info: (title: string, options?: { description?: string }) => {
    return sonnerToast.info(title, {
      description: options?.description,
      ...defaultToastOptions,
      position: defaultToastOptions.position as "bottom-right",
    })
  },
  dismiss: sonnerToast.dismiss
}

const defaultToastOptions = {
  duration: 5000,
  position: "bottom-right",
}

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "info" | "warning"
}

export function useToast() {
  const toast = ({ title, description, variant = "default", ...props }: ToastProps) => {
    const toastOptions = {
      description,
      ...defaultToastOptions,
      position: defaultToastOptions.position as "bottom-right",
      ...props,
    }

    switch (variant) {
      case "destructive":
        return sonnerToast.error(title || "", toastOptions)
      case "success":
        return sonnerToast.success(title || "", toastOptions)
      case "info":
        return sonnerToast.info(title || "", toastOptions)
      case "warning":
        return sonnerToast.warning(title || "", toastOptions)
      default:
        return sonnerToast(title || "", toastOptions)
    }
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "destructive" }),
    success: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "success" }),
    info: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "info" }),
    warning: (props: Omit<ToastProps, "variant">) =>
      toast({ ...props, variant: "warning" }),
  }
}