import { Outlet, useLoaderData } from "react-router";

import { AppShell } from "~/components/layout/app-sidebar";
import { Toaster } from "~/components/ui/sonner";
import { getWorkspaceShellData } from "~/lib/outreach.server";
import type { Route } from "./+types/_app";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const workspaceSlug = url.pathname.split("/").filter(Boolean)[0];
  return await getWorkspaceShellData(workspaceSlug);
}

export default function AppLayout() {
  const shellData = useLoaderData<typeof loader>();
  return (
    <AppShell workspaces={shellData.workspaces} activeWorkspace={shellData.activeWorkspace}>
      <Outlet />
      <Toaster richColors closeButton position="bottom-right" />
    </AppShell>
  );
}
