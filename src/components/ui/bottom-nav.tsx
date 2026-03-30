"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  ClipboardPen,
  Activity,
  TrendingUp,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/plan", label: "Plan", icon: ClipboardPen },
  { href: "/activities", label: "Activites", icon: Activity },
  { href: "/stats", label: "Stats", icon: TrendingUp },
  { href: "/settings", label: "Reglages", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-surface border-t border-border flex z-50 pb-[max(8px,env(safe-area-inset-bottom))]">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] transition-colors ${
              isActive ? "text-accent" : "text-muted"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
