import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileInput,
  TrendingUp,
  Lightbulb,
  FileText,
  Users,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Data Input", path: "/data-input", icon: FileInput },
  { title: "Comparison", path: "/comparison", icon: TrendingUp },
  { title: "Recommendations", path: "/recommendations", icon: Lightbulb },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Users", path: "/users", icon: Users },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function AppSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 sidebar-glow border-r border-sidebar-border",
        // Desktop widths
        collapsed ? "md:w-16" : "md:w-64",
        // Mobile behavior: fixed width, transform based on state
        "w-64 md:translate-x-0 transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Leaf className="h-5 w-5 text-sidebar-primary" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              Arctic<span className="text-sidebar-primary">Zero</span>
            </span>
          )}
        </NavLink>
        <div className="flex items-center gap-1">
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden h-8 w-8 text-sidebar-foreground/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary-foreground")} />
              {(!collapsed || mobileOpen) && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      {(!collapsed || mobileOpen) && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-4">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
              <Leaf className="h-4 w-4 text-sidebar-primary" />
              <span>Reducing emissions</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
