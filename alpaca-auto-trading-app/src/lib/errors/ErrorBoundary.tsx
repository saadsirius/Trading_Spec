"use client";
import React from "react";
import { notifyError } from "@/lib/ui/ToastProvider";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: any) {
    console.error("[UI ERROR]", error);
    notifyError("API.BAD_REQUEST", error?.message ?? "Erreur UI");
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? <div>Une erreur est survenue.</div>;
    return this.props.children;
  }
}
