"use client";
import { NAV_SECTIONS } from "./nav.config";
import { SidebarLinks } from "./SidebarLinks";
import { useClientFlags } from "@/lib/flags";

export default function Sidebar() {
  // client component → use client flags hook
  const flags = useClientFlags();
  // filter helper
  const visible = (feature?: string) => !feature || (flags as any)[feature] === true;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="px-4 py-4 text-sm text-white/70 font-medium">
        TRADING MODE
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        {NAV_SECTIONS.map(sec => (
          <div key={sec.heading} className="mt-4">
            <div className="px-2 text-xs uppercase tracking-wide text-white/50 font-medium">
              {sec.heading}
            </div>
            <ul className="mt-2 space-y-1">
              {sec.items.filter(i => visible(i.feature)).map(item => {
                return (
                  <li key={item.key}>
                    <SidebarLinks item={item} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3 text-xs text-white/50">v1.0</div>
    </aside>
  );
}