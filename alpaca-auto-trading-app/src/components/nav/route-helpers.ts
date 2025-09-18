"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { AppMode } from "./nav.config";

export function isModePath(pathname: string): pathname is string {
  return pathname.startsWith("/paper") || pathname.startsWith("/live");
}

export function currentMode(pathname: string): AppMode | null {
  if (pathname.startsWith("/paper")) return "paper";
  if (pathname.startsWith("/live")) return "live";
  return null;
}

export function withMode(mode: AppMode, subpath: string) {
  // ensures leading slash
  const s = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/${mode}${s}`;
}

export function usePreservedQueryLink() {
  const sp = useSearchParams();
  return (href: string) => {
    const qs = sp.toString();
    return qs ? `${href}?${qs}` : href;
  };
}

export function activeMatch(current: string, href: string) {
  // highlight parent routes too (/portfolio matches /portfolio/xyz)
  if (href === "/") return current === href;
  return current === href || current.startsWith(href + "/");
}

export function useModeLink() {
  const pathname = usePathname();
  const mode = currentMode(pathname) ?? "paper";
  const keepQs = usePreservedQueryLink();
  return (subpath: string) => keepQs(withMode(mode, subpath));
}
