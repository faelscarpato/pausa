
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"

import {
  useToast as useToastInternal,
} from "@/components/ui/toast"

export type ToasterToast = Toast & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export const useToast = useToastInternal

export function toast(props: ToastProps) {
  const { toast } = useToastInternal()
  return toast(props)
}
