import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useFetcher, useLocation, useNavigate } from "react-router";
import {
  Compass,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Upload,
  Users,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import type { ProspectSearchResult, Workspace, WorkspaceTodoSummary } from "~/lib/outreach.server";

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
  todoSummaries,
  onNavigate,
}: {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  todoSummaries: WorkspaceTodoSummary[];
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchFetcher = useFetcher<{ ok: boolean; prospects: ProspectSearchResult[] }>();
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const highlightedIndexRef = useRef(0);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();
  const basePath = `/${activeWorkspace.slug}`;
  const todoSummaryBySlug = new Map(todoSummaries.map((summary) => [summary.workspace_slug, summary]));
  const trimmedQuery = query.trim();
  const results = searchFetcher.data?.prospects ?? [];
  const showSearchResults = trimmedQuery.length >= 2;
  const emptySearch = showSearchResults && searchFetcher.state === "idle" && results.length === 0;
  const loadingSearch = showSearchResults && searchFetcher.state !== "idle";

  const activeResultId = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[1] === "prospects" ? Number(parts[2] || "") : null;
  }, [location.pathname]);

  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    const timeout = window.setTimeout(() => {
      searchFetcher.load(`/api/prospect-search?q=${encodeURIComponent(trimmedQuery)}`);
    }, 150);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery]);

  useEffect(() => {
    const next = 0;
    highlightedIndexRef.current = next;
    setHighlightedIndex(next);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!showSearchResults) return;
    function handlePointer(event: MouseEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [showSearchResults]);

  function moveHighlight(delta: number) {
    if (results.length === 0) return;
    const next = (highlightedIndexRef.current + delta + results.length) % results.length;
    highlightedIndexRef.current = next;
    setHighlightedIndex(next);
  }

  function openProspect(prospect: ProspectSearchResult) {
    setQuery("");
    highlightedIndexRef.current = 0;
    setHighlightedIndex(0);
    navigate(`/${prospect.workspace_slug}/prospects/${prospect.id}`);
    onNavigate?.();
  }

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
      <div ref={searchContainerRef} className="relative px-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/45" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                return;
              }
              if (!showSearchResults || results.length === 0) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveHighlight(1);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                moveHighlight(-1);
              } else if (event.key === "Enter") {
                event.preventDefault();
                openProspect(results[highlightedIndexRef.current] ?? results[0]);
              }
            }}
            placeholder="Find a prospect..."
            aria-label="Find a prospect across all workspaces"
            aria-expanded={showSearchResults}
            aria-controls="sidebar-prospect-search-results"
            className="h-9 border-sidebar-border bg-background pl-9 text-sm"
          />
        </div>
        {showSearchResults ? (
          <div
            id="sidebar-prospect-search-results"
            className="absolute left-2 right-2 top-full z-50 mt-2 overflow-hidden rounded-md border border-sidebar-border bg-popover text-popover-foreground shadow-md"
          >
            <div className="max-h-80 overflow-y-auto p-1">
              {results.map((prospect, index) => {
                const isActiveResult = prospect.id === activeResultId && prospect.workspace_slug === activeWorkspace.slug;
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={`${prospect.workspace_slug}-${prospect.id}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => openProspect(prospect)}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                      isHighlighted
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : isActiveResult
                          ? "bg-sidebar-accent/70 text-sidebar-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{prospect.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {prospect.position || "No title"} · {labelForStatus(prospect.status)}
                      </div>
                    </div>
                    <Badge variant={workspaceBadgeVariant(prospect.workspace_slug, activeWorkspace.slug)} className="shrink-0 rounded-full text-[10px] uppercase tracking-wide">
                      {prospect.workspace_name}
                    </Badge>
                  </button>
                );
              })}
              {emptySearch ? (
                <div className="px-2.5 py-2 text-xs text-muted-foreground">No prospect found.</div>
              ) : null}
              <div className="flex items-center justify-between border-t px-2.5 py-2 text-[10px] text-muted-foreground">
                <span>{loadingSearch ? "Searching..." : "Across all workspaces"}</span>
                <span>↑ ↓ move · Enter open · Esc close</span>
              </div>
            </div>
          </div>
        ) : null}
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
        <div className="mt-2 grid gap-1">
          {workspaces.map((workspace) => {
            const summary = todoSummaryBySlug.get(workspace.slug);
            const todoCount = summary?.todo_count ?? 0;
            const overdueCount = summary?.overdue_count ?? 0;
            const isActive = workspace.slug === activeWorkspace.slug;
            return (
              <button
                key={workspace.slug}
                type="button"
                onClick={() => {
                  navigate(`/${workspace.slug}#todos`);
                  onNavigate?.();
                }}
                className={cn(
                  "flex h-8 items-center justify-between gap-2 rounded-md px-2 text-left text-xs transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <span className="truncate">{workspace.name}</span>
                <span
                  title={overdueCount > 0 ? `${overdueCount} overdue` : `${todoCount} todo`}
                  className={cn(
                    "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                    overdueCount > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : todoCount > 0
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {todoCount}
                </span>
              </button>
            );
          })}
        </div>
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

function labelForStatus(status: string) {
  if (status === "connection_sent") return "Pending";
  if (status === "accepted") return "Accepted";
  if (status === "report_sent") return "Report sent";
  if (status === "conversation_active") return "Talking";
  if (status === "reply_sent") return "Reply sent";
  if (status === "followup_sent") return "Follow-up sent";
  if (status === "saved_for_later") return "Saved";
  if (status === "archived_declined") return "Archived";
  if (status === "archived") return "Archived";
  if (status === "skipped") return "Skipped";
  return "Todo";
}

function workspaceBadgeVariant(workspaceSlug: string, activeWorkspaceSlug: string) {
  if (workspaceSlug === activeWorkspaceSlug) return "info";
  if (workspaceSlug === "narralens") return "secondary";
  if (workspaceSlug === "tempolis") return "outline";
  return "muted";
}

export function AppShell({
  children,
  workspaces,
  activeWorkspace,
  todoSummaries,
}: {
  children: ReactNode;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  todoSummaries: WorkspaceTodoSummary[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent workspaces={workspaces} activeWorkspace={activeWorkspace} todoSummaries={todoSummaries} />
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
                todoSummaries={todoSummaries}
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
