import type { ReactNode } from "react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Compass,
  LayoutDashboard,
  Menu,
  Settings,
  Upload,
  Users,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import type { Workspace } from "~/lib/outreach.server";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const items: NavItem[] = [
  { to: "", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavLinkItem({ item, basePath, onNavigate }: { item: NavItem; basePath: string; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={`${basePath}${item.to}`}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({
  workspaces,
  activeWorkspace,
  onNavigate,
}: {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();
  const basePath = `/${activeWorkspace.slug}`;
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex h-10 items-center gap-2 px-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold">
          {activeInitial}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{activeWorkspace.product_name} Outreach</div>
          <p className="truncate text-[11px] text-sidebar-foreground/55">Internal CRM</p>
        </div>
      </div>
      <div className="px-2 py-2">
        <label htmlFor="workspace-switcher" className="sr-only">
          Workspace
        </label>
        <select
          id="workspace-switcher"
          name="slug"
          defaultValue={activeWorkspace.slug}
          onChange={(event) => {
            navigate(workspaceSwitchPath(event.currentTarget.value, location.pathname, location.search, workspaces));
          }}
          className="h-9 w-full rounded-md border border-sidebar-border bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.slug} value={workspace.slug}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-0.5">
        {items.map((item) => (
          <NavLinkItem key={item.to || "dashboard"} item={item} basePath={basePath} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto border-t pt-2">
        <ThemeToggle />
      </div>
    </div>
  );
}

function workspaceSwitchPath(slug: string, pathname: string, search: string, workspaces: Workspace[]) {
  const parts = pathname.split("/").filter(Boolean);
  const workspaceSlugs = new Set(workspaces.map((workspace) => workspace.slug));
  const rest = parts.length > 0 && workspaceSlugs.has(parts[0]) ? parts.slice(1) : parts;
  const safeRest = rest[0] === "prospects" && rest.length > 1 ? ["prospects"] : rest;
  return `/${[slug, ...safeRest].join("/")}${search}`;
}

export function AppShell({
  children,
  workspaces,
  activeWorkspace,
}: {
  children: ReactNode;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent workspaces={workspaces} activeWorkspace={activeWorkspace} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarContent
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
              {activeInitial}
            </div>
            <span className="text-sm font-semibold">{activeWorkspace.product_name} Outreach</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
