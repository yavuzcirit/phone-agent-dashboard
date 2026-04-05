"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, LayoutDashboard, Moon, Phone, Sun, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard },
  { href: "/console",        label: "Call Console",  icon: Phone },
  { href: "/knowledge-base", label: "Knowledge Base",icon: BookOpen },
  { href: "/analytics",      label: "Analytics",     icon: BarChart3 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { mode, toggleMode } = useTheme();
  const isLight = mode === "light";

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-700/60 bg-slate-900">
      {/* ── Header ── */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-700/60 px-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0 leading-none">
          <p className="text-sm font-bold text-slate-100">CallBank</p>
          <p className="text-[11px] text-slate-500">Voice AI Suite</p>
        </div>

        {/* ── Pill toggle: Sun ○ Moon ── */}
        <button
          type="button"
          onClick={toggleMode}
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          className={cn(
            "relative flex h-7 w-[3.25rem] shrink-0 items-center rounded-full p-0.5",
            "transition-colors duration-300 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-1",
            "focus-visible:ring-offset-slate-900",
            isLight
              ? "bg-amber-100 border border-amber-300"
              : "bg-slate-700 border border-slate-600"
          )}
        >
          {/* Icons row */}
          <Sun
            className={cn(
              "absolute left-1.5 h-3.5 w-3.5 transition-all duration-300",
              isLight ? "text-amber-500 opacity-100" : "text-slate-500 opacity-50"
            )}
          />
          <Moon
            className={cn(
              "absolute right-1.5 h-3.5 w-3.5 transition-all duration-300",
              isLight ? "text-slate-400 opacity-50" : "text-slate-300 opacity-100"
            )}
          />
          {/* Sliding knob */}
          <span
            className={cn(
              "relative z-10 h-5 w-5 rounded-full shadow-md transition-all duration-300",
              isLight
                ? "translate-x-0 bg-amber-400"
                : "translate-x-[1.625rem] bg-slate-200"
            )}
          />
        </button>
      </div>

      {/* ── Nav ── */}
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
