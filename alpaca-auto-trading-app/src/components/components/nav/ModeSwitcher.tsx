"use client";
import { usePathname, useRouter } from "next/navigation";
import { currentMode } from "./route-helpers";

export default function ModeSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const mode = currentMode(pathname) ?? "paper";

  function switchTo(target: "paper" | "live") {
    if (mode === target) return;
    // swap the segment only, keep the rest of the path
    const rest = pathname.replace(/^\/(paper|live)/, "");
    router.push(`/${target}${rest}`);
  }

  return (
    <div className="inline-flex rounded-xl bg-white/10 p-1">
      {(["paper", "live"] as const).map(m => (
        <button
          key={m}
          onClick={() => switchTo(m)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/60
            ${m === mode ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"}`}
          aria-pressed={m === mode}
        >
          {m.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
