"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, LayoutDashboard, Phone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "./ThemeSelector";

const NAV_ITEMS = [
  { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard },
  { href: "/console",        label: "Call Console",  icon: Phone },
  { href: "/knowledge-base", label: "Knowledge Base",icon: BookOpen },
  { href: "/analytics",      label: "Analytics",     icon: BarChart3 },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-700/60 bg-slate-900">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-700/60 px-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="leading-none">
          <p className="text-sm font-bold text-slate-100">CallBank</p>
          <p className="text-[11px] text-slate-500">Voice AI Suite</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                  style={
                    active
                      ? { background: "var(--accent-subtle)", color: "var(--accent-text)" }
                      : undefined
                  }
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={active ? { color: "var(--accent)" } : undefined}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ThemeSelector />

      <div className="border-t border-slate-700/60 px-5 py-3">
        <p className="text-[11px] text-slate-600">Powered by Luron AI</p>
      </div>
    </aside>
  );
}
