import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from "react-router";

import { ThemeToggle } from "./components/theme-toggle";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeToggle />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Unexpected error";

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-12 text-stone-950">
      <div className="mx-auto max-w-2xl rounded-lg border border-stone-300 bg-white p-6">
        <p className="text-sm font-semibold uppercase text-teal-700">Outreach app</p>
        <h1 className="mt-2 text-3xl font-semibold">{status}</h1>
        <p className="mt-3 text-stone-600">{message}</p>
      </div>
    </main>
  );
}
