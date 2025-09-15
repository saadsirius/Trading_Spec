"use client";
import Link from "next/link";
import { useSelectedLayoutSegments, usePathname } from "next/navigation";
import { currentMode } from "./route-helpers";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segs = useSelectedLayoutSegments(); // excludes the (group) segment
  const mode = currentMode(pathname) ?? "paper";

  const crumbs = segs.map((s, i) => {
    const href = `/${mode}/${segs.slice(0, i + 1).join("/")}`;
    return { label: decodeURIComponent(s), href };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-white/70">
      <ol className="flex items-center gap-2">
        <li>
          <Link 
            href={`/${mode}/overview`} 
            className="hover:underline hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 rounded px-1"
          >
            Home
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            <span className="text-white/40">/</span>
            {i === crumbs.length - 1 ? (
              <span aria-current="page" className="text-white font-medium">
                {humanize(c.label)}
              </span>
            ) : (
              <Link 
                href={c.href} 
                className="hover:underline hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60 rounded px-1"
              >
                {humanize(c.label)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function humanize(s: string) { 
  return s.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase()); 
}
