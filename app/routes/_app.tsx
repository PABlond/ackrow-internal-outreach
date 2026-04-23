import { Outlet } from "react-router";

import { AppShell } from "~/components/layout/app-sidebar";
import { Toaster } from "~/components/ui/sonner";

export default function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <Toaster richColors closeButton position="bottom-right" />
    </AppShell>
  );
}
