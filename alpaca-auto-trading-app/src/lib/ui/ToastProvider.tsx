"use client";
import { Toaster, toast } from "sonner";
import { ErrorCatalog, type ErrorCode } from "@/lib/errors/error-catalog";

export function notifySuccess(msg: string) {
  toast.success(msg);
}
export function notifyInfo(msg: string) {
  toast(msg);
}
export function notifyError(code: ErrorCode, detail?: string) {
  const meta = ErrorCatalog[code];
  toast.error(meta?.title ?? "Erreur", {
    description: detail ?? meta?.hint,
  });
}

export default function ToastProvider() {
  return <Toaster richColors position="top-right" closeButton />;
}
