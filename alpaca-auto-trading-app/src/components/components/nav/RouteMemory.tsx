"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Writes "last_route" cookie whenever the route changes
export default function RouteMemory() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (!pathname) return;
    // session cookie; path=/ so middleware can see it
    document.cookie = `last_route=${encodeURIComponent(pathname)}; path=/; SameSite=Lax`;
  }, [pathname]);
  
  return null;
}
