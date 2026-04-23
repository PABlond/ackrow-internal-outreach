import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, useRouteError, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useLoaderData, Link as Link$1, Form, redirect, useActionData, useSearchParams, data } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useContext, createContext, forwardRef, createElement, useState, useEffect } from "react";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const LucideContext = createContext({});
const useLucideContext = () => useContext(LucideContext);
const Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode$n = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
];
const Archive = createLucideIcon("archive", __iconNode$n);
const __iconNode$m = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$m);
const __iconNode$l = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", key: "7n84p3" }]
];
const AtSign = createLucideIcon("at-sign", __iconNode$l);
const __iconNode$k = [
  ["path", { d: "M12 18V5", key: "adv99a" }],
  ["path", { d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", key: "1e3is1" }],
  ["path", { d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5", key: "1gqd8o" }],
  ["path", { d: "M17.997 5.125a4 4 0 0 1 2.526 5.77", key: "iwvgf7" }],
  ["path", { d: "M18 18a4 4 0 0 0 2-7.464", key: "efp6ie" }],
  ["path", { d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517", key: "1gq6am" }],
  ["path", { d: "M6 18a4 4 0 0 1-2-7.464", key: "k1g0md" }],
  ["path", { d: "M6.003 5.125a4 4 0 0 0-2.526 5.77", key: "q97ue3" }]
];
const Brain = createLucideIcon("brain", __iconNode$k);
const __iconNode$j = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }]
];
const CalendarCheck = createLucideIcon("calendar-check", __iconNode$j);
const __iconNode$i = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$i);
const __iconNode$h = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$h);
const __iconNode$g = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ]
];
const Clipboard = createLucideIcon("clipboard", __iconNode$g);
const __iconNode$f = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$f);
const __iconNode$e = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$e);
const __iconNode$d = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$d);
const __iconNode$c = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode$c);
const __iconNode$b = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ],
  ["path", { d: "m10 8-3 3 3 3", key: "fp6dz7" }],
  ["path", { d: "M17 14v-1a2 2 0 0 0-2-2H7", key: "1tkjnz" }]
];
const MessageSquareReply = createLucideIcon("message-square-reply", __iconNode$b);
const __iconNode$a = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
const Moon = createLucideIcon("moon", __iconNode$a);
const __iconNode$9 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$9);
const __iconNode$8 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode$6);
const __iconNode$5 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$5);
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const stored = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: toggleTheme,
      className: "fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-900 shadow-sm hover:border-teal-700",
      "aria-label": theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      title: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      children: [
        theme === "dark" ? /* @__PURE__ */ jsx(Sun, { size: 17 }) : /* @__PURE__ */ jsx(Moon, { size: 17 }),
        theme === "dark" ? "Light" : "Dark"
      ]
    }
  );
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(ThemeToggle, {}), children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : "Unexpected error";
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-6 py-12 text-stone-950",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-2xl rounded-lg border border-stone-300 bg-white p-6",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold uppercase text-teal-700",
        children: "Outreach app"
      }), /* @__PURE__ */ jsx("h1", {
        className: "mt-2 text-3xl font-semibold",
        children: status
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-3 text-stone-600",
        children: message
      })]
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const appDir$1 = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(appDir$1, "..", "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");
let database;
let databaseReady;
async function findProspectByProfileUrl(profileUrl) {
  const row = await one("SELECT id FROM prospects WHERE profile_url = ?", [normalizeLinkedInUrl$1(profileUrl)]);
  return row?.id || null;
}
async function setProspectOutreachPreference(id, mode) {
  const today = todayIso();
  await run("UPDATE prospects SET outreach_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [mode, id]);
  await addEvent(id, mode === "no_note" ? "no_note_mode_selected" : "with_note_mode_selected", `Extension selected ${mode === "no_note" ? "no-note" : "with-note"} outreach mode.`, today);
}
async function getExtensionDashboard() {
  const pendingCheckDelayHours = 4;
  const pendingConnections = await all(`
    SELECT id, name, position, profile_url, outreach_mode, connection_sent_date, pending_checked_at, connection_last_state
    FROM prospects
    WHERE status = 'connection_sent'
      AND (
        pending_checked_at IS NULL
        OR pending_checked_at <= datetime('now', ?)
      )
    ORDER BY
      CASE WHEN pending_checked_at IS NULL THEN 0 ELSE 1 END,
      pending_checked_at,
      COALESCE(connection_sent_date, '9999-12-31'),
      name
  `, [`-${pendingCheckDelayHours} hours`]);
  return {
    today: todayIso(),
    pendingCheckDelayHours,
    pendingConnections
  };
}
async function syncProspectConnectionState(id, state) {
  const today = todayIso();
  const prospect = await one("SELECT id, name, status FROM prospects WHERE id = ?", [id]);
  if (!prospect) {
    throw new Error("Unknown prospect");
  }
  if (state === "pending") {
    await run("UPDATE prospects SET pending_checked_at = CURRENT_TIMESTAMP, connection_last_state = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    return;
  }
  if (state === "accepted") {
    await run("UPDATE prospects SET status = 'accepted', accepted_date = ?, connection_last_state = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
    await completeOpenTask(id, "watch_acceptance");
    await createOpenTask(id, "send_report", `Send first message to ${prospect.name}`, today);
    await addEvent(id, "accepted", "LinkedIn connection accepted. Synced from extension.", today);
    return;
  }
  await run("UPDATE prospects SET status = 'archived_declined', connection_last_state = 'declined', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
  await completeAllOpenTasks(id);
  await addEvent(id, "archived_declined", "Connection no longer pending on LinkedIn. Synced from extension.", today);
}
async function getProspectDetail(id) {
  const prospect = await one(`
    SELECT
      p.*,
      b.topic AS brief_topic,
      b.preparation_notes,
      b.shared_url,
      cm.content AS connection_message,
      rm.content AS report_message,
      nrm.content AS no_note_report_message,
      fm.content AS followup_message,
      tdm.content AS twitter_dm_message,
      tfm.content AS twitter_followup_message,
      fm.due_date AS followup_due_date
    FROM prospects p
    LEFT JOIN briefs b ON b.prospect_id = p.id
    LEFT JOIN messages cm ON cm.prospect_id = p.id AND cm.type = 'connection'
    LEFT JOIN messages rm ON rm.prospect_id = p.id AND rm.type = 'report'
    LEFT JOIN messages nrm ON nrm.prospect_id = p.id AND nrm.type = 'report_no_note'
    LEFT JOIN messages fm ON fm.prospect_id = p.id AND fm.type = 'followup'
    LEFT JOIN messages tdm ON tdm.prospect_id = p.id AND tdm.type = 'twitter_dm'
    LEFT JOIN messages tfm ON tfm.prospect_id = p.id AND tfm.type = 'twitter_followup'
    WHERE p.id = ?
  `, [id]);
  if (!prospect) return null;
  const tasks = await all(`
    SELECT t.*, p.name, p.profile_url, p.source_channel, p.twitter_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    WHERE t.prospect_id = ?
    ORDER BY
      CASE t.status WHEN 'open' THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `, [id]);
  const events = await all(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    WHERE e.prospect_id = ?
    ORDER BY e.happened_at DESC, e.id DESC
  `, [id]);
  const replies = await all(`
    SELECT *
    FROM replies
    WHERE prospect_id = ?
    ORDER BY created_at DESC, id DESC
  `, [id]);
  return { prospect: withDerivedMessages(prospect), tasks, events, replies, today: todayIso() };
}
async function getDashboard() {
  const today = todayIso();
  const prospectRows = await all(`
    SELECT
      p.*,
      b.topic AS brief_topic,
      b.preparation_notes,
      b.shared_url,
      cm.content AS connection_message,
      rm.content AS report_message,
      nrm.content AS no_note_report_message,
      fm.content AS followup_message,
      tdm.content AS twitter_dm_message,
      tfm.content AS twitter_followup_message,
      fm.due_date AS followup_due_date
    FROM prospects p
    LEFT JOIN briefs b ON b.prospect_id = p.id
    LEFT JOIN messages cm ON cm.prospect_id = p.id AND cm.type = 'connection'
    LEFT JOIN messages rm ON rm.prospect_id = p.id AND rm.type = 'report'
    LEFT JOIN messages nrm ON nrm.prospect_id = p.id AND nrm.type = 'report_no_note'
    LEFT JOIN messages fm ON fm.prospect_id = p.id AND fm.type = 'followup'
    LEFT JOIN messages tdm ON tdm.prospect_id = p.id AND tdm.type = 'twitter_dm'
    LEFT JOIN messages tfm ON tfm.prospect_id = p.id AND tfm.type = 'twitter_followup'
    ORDER BY
      CASE p.status
        WHEN 'accepted' THEN 1
        WHEN 'twitter_contacted' THEN 2
        WHEN 'connection_sent' THEN 2
        WHEN 'to_contact' THEN 3
        WHEN 'report_sent' THEN 4
        WHEN 'conversation_active' THEN 4
        WHEN 'reply_sent' THEN 4
        WHEN 'followup_due' THEN 5
        WHEN 'archived' THEN 8
        WHEN 'saved_for_later' THEN 6
        WHEN 'skipped' THEN 7
        ELSE 8
      END,
      p.wave,
      p.name
  `);
  const prospects = prospectRows.map(withDerivedMessages);
  const tasks = await all(`
    SELECT t.*, p.name, p.profile_url, p.source_channel, p.twitter_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    ORDER BY
      CASE WHEN t.due_date IS NOT NULL AND t.due_date < ? THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `, [today]);
  const events = await all(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    ORDER BY e.happened_at DESC, e.id DESC
    LIMIT 100
  `);
  const stats = await getDashboardStats(today);
  return {
    today,
    prospects,
    tasks,
    events,
    stats,
    sections: {
      toConnect: tasks.filter((item) => item.status === "open" && item.type === "send_connection"),
      twitterToContact: tasks.filter((item) => item.status === "open" && item.type === "send_twitter_dm"),
      acceptedReport: prospects.filter((item) => item.status === "accepted" && !item.report_sent_date),
      missingBriefUrls: prospects.filter(
        (item) => ["connection_sent", "accepted"].includes(item.status) && Boolean(item.brief_topic) && !item.shared_url
      ),
      followupsDue: tasks.filter(
        (item) => item.status === "open" && ["send_followup", "send_twitter_followup"].includes(item.type) && item.due_date && item.due_date <= today
      ),
      followupsScheduled: tasks.filter(
        (item) => item.status === "open" && ["send_followup", "send_twitter_followup"].includes(item.type) && item.due_date && item.due_date > today
      ),
      conversationsActive: prospects.filter((item) => item.status === "conversation_active"),
      pendingConnections: prospects.filter((item) => item.status === "connection_sent"),
      doneToday: events.filter((item) => String(item.happened_at).slice(0, 10) === today)
    }
  };
}
async function getDashboardStats(today) {
  const days = Array.from({ length: 7 }, (_, index) => addDaysIso(today, index - 6));
  const firstDay = days[0];
  const sentEventTypes = [
    "report_sent",
    "followup_sent",
    "reply_sent",
    "twitter_dm_sent",
    "twitter_followup_sent"
  ];
  const sentRows = await all(`
    SELECT date(happened_at) AS date, COUNT(*) AS count
    FROM events
    WHERE type IN (${sentEventTypes.map(() => "?").join(", ")})
      AND date(happened_at) >= ?
      AND date(happened_at) <= ?
    GROUP BY date(happened_at)
  `, [...sentEventTypes, firstDay, today]);
  const createdBefore = await one(`
    SELECT COUNT(*) AS count
    FROM prospects
    WHERE date(created_at) < ?
  `, [firstDay]);
  const createdRows = await all(`
    SELECT date(created_at) AS date, COUNT(*) AS count
    FROM prospects
    WHERE date(created_at) >= ?
      AND date(created_at) <= ?
    GROUP BY date(created_at)
  `, [firstDay, today]);
  const sentByDay = new Map(sentRows.map((row) => [row.date, Number(row.count)]));
  const createdByDay = new Map(createdRows.map((row) => [row.date, Number(row.count)]));
  let cumulativeProspects = Number(createdBefore?.count || 0);
  return {
    messagesSent7d: days.map((date) => ({
      date,
      label: shortDayLabel(date),
      value: sentByDay.get(date) || 0
    })),
    prospects7d: days.map((date) => {
      cumulativeProspects += createdByDay.get(date) || 0;
      return {
        date,
        label: shortDayLabel(date),
        value: cumulativeProspects
      };
    })
  };
}
async function runProspectAction(formData) {
  const id = Number(formData.get("prospectId"));
  const intent = String(formData.get("intent") || "");
  const prospect = await one("SELECT * FROM prospects WHERE id = ?", [id]);
  if (!id || !prospect) {
    throw new Error("Unknown prospect");
  }
  const today = todayIso();
  if (intent === "generateNoNoteMode" || intent === "regenerateSaferCopy") {
    const rewrite = await generateNoNoteRewrite(id);
    try {
      await run("UPDATE prospects SET outreach_mode = 'no_note', connection_note_sent = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await upsertGeneratedMessage(id, "report_no_note", rewrite.noNoteReportMessage, null);
      await upsertGeneratedMessage(id, "followup", rewrite.followupMessage, null);
      await addEvent(
        id,
        intent === "regenerateSaferCopy" ? "safer_copy_regenerated" : "no_note_mode_generated",
        intent === "regenerateSaferCopy" ? "Safer no-note copy regenerated with activity-signal guardrails." : "No-note outreach mode generated with AI.",
        today
      );
    } catch (error) {
      throw error;
    }
    return;
  }
  try {
    if (intent === "deleteProspect") {
      await completeAllOpenTasks(id);
      await run("DELETE FROM prospects WHERE id = ?", [id]);
    } else if (intent === "addProspectReply") {
      const inboundContent = String(formData.get("inboundContent") || "").trim();
      const suggestedResponse = String(formData.get("suggestedResponse") || "").trim() || replyFallback(prospect.name, inboundContent);
      if (!inboundContent) throw new Error("Reply content is required");
      await run("INSERT INTO replies (prospect_id, inbound_content, suggested_response) VALUES (?, ?, ?)", [id, inboundContent, suggestedResponse]);
      await run("UPDATE prospects SET status = 'conversation_active', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeOpenTask(id, "send_followup");
      await addEvent(id, "reply_received", "Prospect replied. Follow-up task closed.", today);
    } else if (intent === "updateReplyResponse") {
      const replyId = Number(formData.get("replyId"));
      const suggestedResponse = String(formData.get("suggestedResponse") || "").trim();
      if (!replyId) throw new Error("Reply id is required");
      if (!suggestedResponse) throw new Error("Suggested response is required");
      await run("UPDATE replies SET suggested_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND prospect_id = ?", [suggestedResponse, replyId, id]);
      await addEvent(id, "reply_response_updated", "Suggested response edited.", today);
    } else if (intent === "markReplySent") {
      const replyId = Number(formData.get("replyId"));
      if (!replyId) throw new Error("Reply id is required");
      await run("UPDATE replies SET sent_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND prospect_id = ?", [today, replyId, id]);
      await completeOpenTask(id, "send_followup");
      await run("UPDATE prospects SET status = 'reply_sent', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await addEvent(id, "reply_sent", "Reply sent to prospect.", today);
    } else if (intent === "archiveProspect") {
      await run("UPDATE prospects SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeAllOpenTasks(id);
      await addEvent(id, "archived", "Prospect manually archived.", today);
    } else if (intent === "reopenConversation") {
      await run("UPDATE prospects SET status = 'conversation_active', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await addEvent(id, "conversation_reopened", "Conversation reopened.", today);
    } else if (intent === "updateMessage") {
      const type = String(formData.get("messageType") || "").trim();
      const content = String(formData.get("messageContent") || "").trim();
      if (!["connection", "report", "report_no_note", "followup", "twitter_dm", "twitter_followup"].includes(type)) throw new Error("Unknown message type");
      if (!content) throw new Error("Message content is required");
      await upsertGeneratedMessage(id, type, content, type === "followup" ? null : null);
      await addEvent(id, "message_updated", `${type} message edited.`, today);
    } else if (intent === "markTwitterDmSent") {
      const followupDate = addDaysIso(today, 2);
      await run("UPDATE prospects SET status = 'twitter_contacted', twitter_contacted_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
      await run("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'twitter_dm'", [today, id]);
      await run("UPDATE messages SET due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'twitter_followup'", [followupDate, id]);
      await completeOpenTask(id, "send_twitter_dm");
      await createOpenTask(id, "send_twitter_followup", `Follow up on X with ${prospect.name}`, followupDate);
      await addEvent(id, "twitter_dm_sent", `Twitter/X DM sent. Follow-up due on ${followupDate}.`, today);
    } else if (intent === "markTwitterFollowupSent") {
      await run("UPDATE prospects SET status = 'followup_sent', twitter_followup_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
      await run("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'twitter_followup'", [today, id]);
      await completeOpenTask(id, "send_twitter_followup");
      await addEvent(id, "twitter_followup_sent", "Twitter/X follow-up sent.", today);
    } else if (intent === "markAccepted") {
      await run("UPDATE prospects SET status = 'accepted', accepted_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
      await completeOpenTask(id, "watch_acceptance");
      await createOpenTask(id, "send_report", `Send first message to ${prospect.name}`, today);
      await addEvent(id, "accepted", "LinkedIn connection accepted.", today);
    } else if (intent === "archiveDeclined") {
      await run("UPDATE prospects SET status = 'archived_declined', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeAllOpenTasks(id);
      await addEvent(id, "archived_declined", "Connection request declined or ignored. Archived to avoid recontacting.", today);
    } else if (intent === "markConnectionSent" || intent === "markConnectionSentWithNote") {
      await run(`
        UPDATE prospects
        SET status = 'connection_sent',
            outreach_mode = 'with_note',
            connection_note_sent = 1,
            connection_sent_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [today, id]);
      await run("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'connection'", [today, id]);
      await completeOpenTask(id, "send_connection");
      await createOpenTask(id, "watch_acceptance", `Watch LinkedIn acceptance for ${prospect.name}`, null);
      await addEvent(id, "connection_sent", "Connection request sent with custom note.", today);
    } else if (intent === "markConnectionSentWithoutNote") {
      await run(`
        UPDATE prospects
        SET status = 'connection_sent',
            outreach_mode = 'no_note',
            connection_note_sent = 0,
            connection_sent_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [today, id]);
      await completeOpenTask(id, "send_connection");
      await createOpenTask(id, "watch_acceptance", `Watch LinkedIn acceptance for ${prospect.name}`, null);
      await addEvent(id, "connection_sent_without_note", "Connection request sent without custom note. First outreach message waits for acceptance.", today);
    } else if (intent === "addBriefUrl") {
      const sharedUrl = String(formData.get("sharedUrl") || "").trim();
      if (!sharedUrl) throw new Error("Brief URL is required");
      await run("UPDATE briefs SET shared_url = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ?", [sharedUrl, id]);
      await addEvent(id, "brief_url_added", `Brief URL added: ${sharedUrl}`, today);
    } else if (intent === "updateBriefStrategy") {
      const topic = trimWords(String(formData.get("briefTopic") || ""), 3);
      const preparationNotes = String(formData.get("briefPreparation") || "").trim();
      if (!topic) throw new Error("Brief topic is required");
      await run(`
        INSERT INTO briefs (prospect_id, topic, preparation_notes)
        VALUES (?, ?, ?)
        ON CONFLICT(prospect_id) DO UPDATE SET
          topic = excluded.topic,
          preparation_notes = excluded.preparation_notes,
          updated_at = CURRENT_TIMESTAMP
      `, [id, topic, preparationNotes]);
      await upsertGeneratedMessage(id, "report_no_note", noNoteReportFallback(prospect.name, topic, prospect.position, prospect.about, prospect.recommended_template), null);
      await addEvent(id, "brief_strategy_updated", `Brief topic updated to ${topic}.`, today);
    } else if (intent === "updateProspectNotes") {
      const notes = String(formData.get("notes") || "").trim();
      await run("UPDATE prospects SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [notes, id]);
      await addEvent(id, "notes_updated", notes ? "Internal note updated." : "Internal note cleared.", today);
    } else if (intent === "markReportSent") {
      const followupDate = addDaysIso(today, 2);
      await run("UPDATE prospects SET status = 'report_sent', report_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
      await run("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'report'", [today, id]);
      await run("UPDATE messages SET due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'followup'", [followupDate, id]);
      await completeOpenTask(id, "send_report");
      await createOpenTask(id, "send_followup", `Follow up with ${prospect.name}`, followupDate);
      await addEvent(id, "report_sent", `Report sent. Follow-up due on ${followupDate}.`, today);
    } else if (intent === "markFollowupSent") {
      await run("UPDATE prospects SET status = 'followup_sent', followup_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [today, id]);
      await run("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'followup'", [today, id]);
      await completeOpenTask(id, "send_followup");
      await addEvent(id, "followup_sent", "Follow-up sent.", today);
    } else if (intent === "skip") {
      await run("UPDATE prospects SET status = 'skipped', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeAllOpenTasks(id);
      await addEvent(id, "skipped", "Prospect skipped.", today);
    } else if (intent === "saveForLater") {
      await run("UPDATE prospects SET status = 'saved_for_later', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeAllOpenTasks(id);
      await addEvent(id, "saved_for_later", "Prospect saved for a later wave.", today);
    } else if (intent === "switchToWithNoteMode") {
      await run("UPDATE prospects SET outreach_mode = 'with_note', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await addEvent(id, "with_note_mode_selected", "With-note outreach mode selected.", today);
    } else {
      throw new Error(`Unknown action ${intent}`);
    }
  } catch (error) {
    throw error;
  }
}
function replyFallback(name, inboundContent) {
  const first = firstName(name);
  const lower = inboundContent.toLowerCase();
  if (/\b(thanks|thank you|interesting|useful|helpful)\b/.test(lower)) {
    return `Thanks ${first}, really appreciate you taking a look.

If useful, I can keep refining this around the kinds of narrative signals that matter most for your work.`;
  }
  if (/\b(not relevant|not useful|unclear|don't|do not)\b/.test(lower)) {
    return `Thanks ${first}, that's helpful to know.

Was the issue the topic choice, the format, or the type of signal surfaced? That would help me calibrate the next version.`;
  }
  return `Thanks ${first}, really appreciate the reply.

What would make this more useful for the kind of policy or communications work you do?`;
}
async function importAnalyzedProspects(items) {
  const today = todayIso();
  try {
    for (const raw of items) {
      const item = normalizeAnalyzedProspect(raw);
      if (!item.name || !item.profileUrl) continue;
      const status = statusForImportedProspect(item);
      const sourceChannel = item.sourceChannel === "twitter" ? "twitter" : "linkedin";
      const twitterUrl = sourceChannel === "twitter" ? normalizeTwitterUrl$1(item.twitterUrl || item.profileUrl) : null;
      const twitterHandle = sourceChannel === "twitter" ? normalizeTwitterHandle$1(item.twitterHandle || item.profileUrl) : null;
      await run(`
        INSERT INTO prospects (
          name, position, profile_url, source_channel, twitter_handle, twitter_url, about, priority_tag, wave, contact_now,
          rationale, recommended_template, notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(profile_url) DO UPDATE SET
          name = excluded.name,
          position = excluded.position,
          source_channel = excluded.source_channel,
          twitter_handle = excluded.twitter_handle,
          twitter_url = excluded.twitter_url,
          about = excluded.about,
          priority_tag = excluded.priority_tag,
          wave = excluded.wave,
          contact_now = excluded.contact_now,
          rationale = excluded.rationale,
          recommended_template = excluded.recommended_template,
          notes = excluded.notes,
          status = CASE
            WHEN prospects.status IN ('connection_sent', 'accepted', 'report_sent', 'followup_sent', 'conversation_active', 'reply_sent', 'archived') THEN prospects.status
            ELSE excluded.status
          END,
          updated_at = CURRENT_TIMESTAMP
      `, [
        item.name,
        item.position,
        item.profileUrl,
        sourceChannel,
        twitterHandle,
        twitterUrl,
        item.about,
        item.priorityTag,
        item.wave,
        item.contactNow ? 1 : 0,
        item.rationale,
        item.recommendedTemplate,
        "",
        status
      ]);
      const prospect = await one("SELECT id, status FROM prospects WHERE profile_url = ?", [item.profileUrl]);
      if (!prospect) continue;
      if (item.briefTopic) {
        await run(`
          INSERT INTO briefs (prospect_id, topic, preparation_notes)
          VALUES (?, ?, ?)
          ON CONFLICT(prospect_id) DO UPDATE SET
            topic = excluded.topic,
            preparation_notes = excluded.preparation_notes,
            updated_at = CURRENT_TIMESTAMP
        `, [prospect.id, item.briefTopic, item.briefPreparation]);
      }
      if (item.connectionMessage) {
        await upsertGeneratedMessage(prospect.id, "connection", item.connectionMessage, null);
      }
      if (item.reportMessage) {
        await upsertGeneratedMessage(prospect.id, "report", item.reportMessage, null);
      }
      if (item.noNoteReportMessage) {
        await upsertGeneratedMessage(prospect.id, "report_no_note", item.noNoteReportMessage, null);
      }
      if (item.followupMessage) {
        await upsertGeneratedMessage(prospect.id, "followup", item.followupMessage, null);
      }
      if (item.twitterDmMessage) {
        await upsertGeneratedMessage(prospect.id, "twitter_dm", item.twitterDmMessage, null);
      }
      if (item.twitterFollowupMessage) {
        await upsertGeneratedMessage(prospect.id, "twitter_followup", item.twitterFollowupMessage, null);
      }
      if (item.contactNow && status === "to_contact") {
        if (sourceChannel === "twitter") {
          await createOpenTask(prospect.id, "send_twitter_dm", `Send Twitter/X DM to ${item.name}`, today);
        } else {
          await createOpenTask(prospect.id, "send_connection", `Send connection request to ${item.name}`, today);
        }
      }
      await addEvent(prospect.id, "batch_imported", `Analyzed from ${sourceChannel} as ${item.priorityTag}${item.wave ? ` wave ${item.wave}` : ""}.`, today);
    }
  } catch (error) {
    throw error;
  }
}
function normalizeLinkedInUrl$1(value) {
  return value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
}
function normalizeTwitterUrl$1(value) {
  const trimmed = value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
  const handle = normalizeTwitterHandle$1(trimmed);
  if (handle) return `https://x.com/${handle}`;
  return trimmed;
}
function normalizeTwitterHandle$1(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const raw = match?.[1] || trimmed.replace(/^@/, "");
  return raw && !/^https?:\/\//i.test(raw) ? raw.replace(/[^a-zA-Z0-9_]/g, "") : "";
}
async function getDb() {
  if (!database) {
    loadLocalEnv$1();
    fs.mkdirSync(dataDir, { recursive: true });
    const url = process.env.DATABASE_URL || `file:${dbPath}`;
    database = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN
    });
    databaseReady = applyMigrations(database);
  }
  await databaseReady;
  return database;
}
async function applyMigrations(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const appliedRows = await db.execute("SELECT version FROM schema_migrations");
  const applied = new Set(appliedRows.rows.map((row) => row.version));
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await db.executeMultiple(sql);
    await db.execute({ sql: "INSERT INTO schema_migrations (version) VALUES (?)", args: [file] });
  }
}
async function createOpenTask(prospectId, type, title, dueDate) {
  const existing = await one("SELECT id FROM tasks WHERE prospect_id = ? AND type = ? AND status = 'open'", [prospectId, type]);
  if (!existing) {
    await run("INSERT INTO tasks (prospect_id, type, title, due_date) VALUES (?, ?, ?, ?)", [prospectId, type, title, dueDate]);
  }
}
async function completeOpenTask(prospectId, type) {
  await run(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND type = ? AND status = 'open'
  `, [todayIso(), prospectId, type]);
}
async function completeAllOpenTasks(prospectId) {
  await run(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND status = 'open'
  `, [todayIso(), prospectId]);
}
async function upsertGeneratedMessage(prospectId, type, content, dueDate) {
  await run(`
    INSERT INTO messages (prospect_id, type, content, due_date, sent_date)
    VALUES (?, ?, ?, ?, NULL)
    ON CONFLICT(prospect_id, type) DO UPDATE SET
      content = excluded.content,
      due_date = excluded.due_date,
      updated_at = CURRENT_TIMESTAMP
  `, [prospectId, type, content, dueDate]);
}
async function addEvent(prospectId, type, note, happenedAt) {
  await run("INSERT INTO events (prospect_id, type, note, happened_at) VALUES (?, ?, ?, ?)", [prospectId, type, note, happenedAt]);
}
async function one(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0];
}
async function all(sql, args = []) {
  const db = await getDb();
  const result = await db.execute({ sql, args });
  return result.rows;
}
async function run(sql, args = []) {
  const db = await getDb();
  await db.execute({ sql, args });
}
function todayIso() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(/* @__PURE__ */ new Date());
}
function addDaysIso(dateIso, days) {
  const date = /* @__PURE__ */ new Date(`${dateIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function shortDayLabel(dateIso) {
  return dateIso.slice(5).replace("-", "/");
}
function withDerivedMessages(prospect) {
  const noNoteFallback = noNoteReportFallback(
    prospect.name,
    prospect.brief_topic,
    prospect.position,
    prospect.about,
    prospect.recommended_template
  );
  return {
    ...prospect,
    source_channel: prospect.source_channel || "linkedin",
    outreach_mode: prospect.outreach_mode || "with_note",
    connection_note_sent: prospect.connection_note_sent || 0,
    post_acceptance_message: prospect.outreach_mode === "no_note" ? prospect.no_note_report_message ? sanitizeNoNoteMessage(prospect.no_note_report_message, noNoteFallback) : rewriteReportForNoNote(prospect.report_message, prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template) : prospect.report_message
  };
}
function rewriteReportForNoNote(content, name, topic, position, about, template) {
  const fallback = noNoteReportFallback(name, topic, position, about, template);
  if (!content) return fallback;
  const rewritten = content.replace(/As promised,\s*the brief on/i, "Thanks for connecting. I prepared a brief on").replace(/As promised,\s*the brief/i, "Thanks for connecting. I prepared a brief").replace(/The brief I mentioned,\s*on/i, "Thanks for connecting. I prepared a brief on").replace(/The brief I promised,\s*on/i, "Thanks for connecting. I prepared a brief on").replace(/As promised,\s*/i, "").replace(/The brief I mentioned,\s*/i, "I prepared a brief ").replace(/The brief I mentioned/i, "I prepared a brief").replace(/The brief I promised,\s*/i, "I prepared a brief ").replace(/The brief I promised/i, "I prepared a brief").replace(/Le brief promis\s*/i, "J'ai préparé un brief ").replace(/Comme promis,\s*/i, "");
  return rewritten === content ? fallback : rewritten;
}
function noNoteReportFallback(name, topic, position, about, template) {
  const firstName2 = name.split(/\s+/)[0] || name;
  const briefTopic = topic || "your policy area";
  const context = prospectContext$1(position, about, template);
  return `Hi ${firstName2},

Thanks for connecting. I'm building Tempolis, a tool for public affairs narrative briefs, and I prepared a short brief on ${briefTopic} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`;
}
function prospectContext$1(position, about, template) {
  const text = `${position || ""} ${about || ""} ${template || ""}`.toLowerCase();
  if (/\b(ai|artificial intelligence|digital|tech|technology|platform|data|privacy|gdpr)\b/.test(text)) return "tech policy and regulation";
  if (/\b(energy|climate|sustainability|power|grid)\b/.test(text)) return "energy and policy strategy";
  if (/\b(health|pharma|medical|biotech)\b/.test(text)) return "health policy and public affairs";
  if (/\b(finance|bank|fintech|payments|competition)\b/.test(text)) return "regulated markets and public affairs";
  if (/\b(communications|comms|media|narrative|reputation)\b/.test(text)) return "strategic communications";
  if (/\b(government affairs|public affairs|policy|regulatory|eu affairs|brussels)\b/.test(text)) return "public affairs and policy";
  return "policy and public affairs";
}
async function generateNoNoteRewrite(prospectId) {
  loadLocalEnv$1();
  const detail = await getProspectDetail(prospectId);
  if (!detail) throw new Error("Prospect not found");
  const { prospect } = detail;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to .env or your shell env.");
  }
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = buildNoNoteRewritePrompt(prospect);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Tempolis Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a strict JSON-producing public affairs outreach copywriter. Return only valid JSON. Never include markdown."
        },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detailText.slice(0, 600)}`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");
  return normalizeNoNoteRewrite(parseJson$1(content), prospect);
}
function buildNoNoteRewritePrompt(prospect) {
  const outreach = readDoc("outreach.md");
  const brand = readDoc("brand.md");
  return `
Rewrite this Tempolis LinkedIn outreach sequence for NO-CUSTOM-NOTE mode.

CONTEXT
LinkedIn custom note quota is exhausted. The connection request will be sent without any note. The first actual outreach message is sent only after the person accepts the request.

TASK
- Keep the strategy soft: no product pitch, no demo request, no call request.
- Write in English.
- Adapt the first post-acceptance message so it does not rely on a previous promise.
- The first message must naturally acknowledge the new connection and introduce the brief.
- Make the first message feel written for this exact person, not a reusable template.
- Use the prospect's role, organization context, about section, rationale, recommendedTemplate and briefTopic to choose one concrete angle.
- Treat activity evidence carefully: reposts, likes, comments, and visible activity prove interest only, not professional ownership.
- Do not say "your work on [topic]" unless role/about/experience explicitly says the prospect works on that topic.
- If the topic comes from a repost or recent activity, say "your recent interest in [topic]", "a topic you recently shared", or "given the policy issues visible in your activity".
- In the message, distinguish professional role fit from activity signal. Never turn a repost into "your professional domain".
- Mention the builder context lightly: the sender is building Tempolis / testing a small public affairs brief format. Do not make this a product pitch.
- Explain why this brief is relevant to their world in one specific phrase.
- Ask for feedback on the angle, signal quality, or format. Do not ask for "thoughts" generically.
- It must include [shared link] on its own line.
- It must be 5 lines max.
- It must not say "as promised", "the brief I mentioned", "as I mentioned", or imply that a note was sent.
- Avoid generic filler: "key topics", "professionals like yourself", "might be of interest", "any initial thoughts", "greatly appreciated".
- Rewrite the follow-up for 2 days later. It should still be gentle and should not refer to a promised brief.

OUTPUT JSON SHAPE
{
  "noNoteReportMessage": string,
  "followupMessage": string
}

PROSPECT
${JSON.stringify({
    name: prospect.name,
    position: prospect.position,
    about: prospect.about,
    profileUrl: prospect.profile_url,
    priorityTag: prospect.priority_tag,
    wave: prospect.wave,
    rationale: prospect.rationale,
    recommendedTemplate: prospect.recommended_template,
    briefTopic: prospect.brief_topic,
    briefPreparation: prospect.preparation_notes,
    sharedUrl: prospect.shared_url || "[shared link]"
  }, null, 2)}

CURRENT COPY GENERATED FOR WITH-NOTE MODE
${JSON.stringify({
    connectionNote: prospect.connection_message,
    afterAcceptanceWithNote: prospect.report_message,
    existingNoNoteMessage: prospect.no_note_report_message,
    followup: prospect.followup_message
  }, null, 2)}

PLAYBOOK
${outreach.slice(0, 18e3)}

BRAND
${brand.slice(0, 12e3)}
`;
}
function normalizeNoNoteRewrite(value, prospect) {
  const input = value;
  const fallbackReport = noNoteReportFallback(prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template);
  const fallbackFollowup = `Hi ${firstName(prospect.name)}, following up in case the brief slipped through. No worries if this isn't the right timing.`;
  return {
    noNoteReportMessage: sanitizeNoNoteMessage(String(input.noNoteReportMessage || ""), fallbackReport),
    followupMessage: sanitizeNoNoteMessage(String(input.followupMessage || ""), fallbackFollowup)
  };
}
function sanitizeNoNoteMessage(value, fallback) {
  const cleanValue = value.trim();
  if (!cleanValue) return fallback;
  if (/\b(as promised|brief i mentioned|brief i promised|as i mentioned|comme promis|brief promis)\b/i.test(cleanValue)) {
    return fallback;
  }
  if (/\b(key topics|professionals like yourself|might be of interest|any initial thoughts|greatly appreciated)\b/i.test(cleanValue)) {
    return fallback;
  }
  return cleanValue;
}
function firstName(name) {
  return name.split(/\s+/)[0] || name;
}
function parseJson$1(content) {
  const trimmed = content.trim();
  const json = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim() : trimmed;
  return JSON.parse(json);
}
function loadLocalEnv$1() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== void 0) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
function readDoc(fileName) {
  const docsDir2 = path.resolve(rootDir, "..", "tempolis", "front", "docs");
  return fs.readFileSync(path.join(docsDir2, fileName), "utf8");
}
function statusForImportedProspect(item) {
  if (item.priorityTag === "SKIP") return "skipped";
  if (item.priorityTag === "SAVE") return "saved_for_later";
  return "to_contact";
}
function normalizeAnalyzedProspect(item) {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(item.priorityTag) ? item.priorityTag : "SKIP";
  const topic = trimWords(String(item.briefTopic || ""), 3);
  const name = String(item.name || "").trim();
  const reportMessage = String(item.reportMessage || "").trim();
  const noNoteFallback = rewriteReportForNoNote(reportMessage, name, topic, item.position, item.about, item.recommendedTemplate);
  const sourceChannel = item.sourceChannel === "twitter" ? "twitter" : "linkedin";
  const profileUrl = sourceChannel === "twitter" ? normalizeTwitterUrl$1(item.profileUrl || item.twitterUrl || "") : String(item.profileUrl || "").trim();
  return {
    name,
    position: String(item.position || "").trim(),
    profileUrl,
    about: String(item.about || "").trim(),
    priorityTag: tag,
    wave: item.wave ? Number(item.wave) : null,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: String(item.rationale || "").trim(),
    briefTopic: topic,
    briefPreparation: String(item.briefPreparation || "").trim(),
    recommendedTemplate: String(item.recommendedTemplate || "").trim(),
    connectionMessage: String(item.connectionMessage || "").trim().slice(0, 300),
    reportMessage,
    noNoteReportMessage: sanitizeNoNoteMessage(String(item.noNoteReportMessage || ""), noNoteFallback),
    followupMessage: String(item.followupMessage || "").trim(),
    sourceChannel,
    twitterHandle: sourceChannel === "twitter" ? normalizeTwitterHandle$1(item.twitterHandle || profileUrl) : "",
    twitterUrl: sourceChannel === "twitter" ? normalizeTwitterUrl$1(item.twitterUrl || profileUrl) : "",
    twitterDmMessage: String(item.twitterDmMessage || "").trim(),
    twitterFollowupMessage: String(item.twitterFollowupMessage || "").trim()
  };
}
function trimWords(value, max) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, max).join(" ");
}
const meta$5 = () => [{
  title: "Tempolis Outreach"
}, {
  name: "description",
  content: "Internal Tempolis outreach tracker."
}];
async function loader$3() {
  return await getDashboard();
}
async function action$5({
  request
}) {
  const formData = await request.formData();
  await runProspectAction(formData);
  return redirect("/");
}
const home = UNSAFE_withComponentProps(function Home() {
  const data2 = useLoaderData();
  const activeProspects = data2.prospects.filter((prospect) => !["saved_for_later", "skipped", "archived_declined", "archived"].includes(prospect.status));
  const todoItems = buildTodoItems(data2);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-bold uppercase tracking-wide text-teal-700",
            children: "Internal CRM"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-4xl font-semibold tracking-normal",
            children: "Tempolis Outreach"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-2xl text-stone-600",
            children: "Daily command center for LinkedIn requests, accepted connections, shared briefs, and follow-ups."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-3 sm:flex-row sm:items-center",
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/search",
            className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700",
            children: [/* @__PURE__ */ jsx(Search, {
              size: 18
            }), "Search CRM"]
          }), /* @__PURE__ */ jsxs(Link$1, {
            to: "/discover",
            className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700",
            children: [/* @__PURE__ */ jsx(UserPlus, {
              size: 18
            }), "Discover"]
          }), /* @__PURE__ */ jsxs(Link$1, {
            to: "/twitter",
            className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700",
            children: [/* @__PURE__ */ jsx(AtSign, {
              size: 18
            }), "Twitter/X"]
          }), /* @__PURE__ */ jsxs(Link$1, {
            to: "/batch",
            className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800",
            children: [/* @__PURE__ */ jsx(Plus, {
              size: 18
            }), "New batch"]
          }), /* @__PURE__ */ jsxs("div", {
            className: "rounded-lg border border-stone-300 bg-white px-4 py-3",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-xs font-semibold uppercase text-stone-500",
              children: "Today"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-lg font-semibold",
              children: data2.today
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        children: [/* @__PURE__ */ jsx(Metric$2, {
          label: "Prospects",
          value: data2.prospects.length
        }), /* @__PURE__ */ jsx(Metric$2, {
          label: "Pending connections",
          value: data2.sections.pendingConnections.length
        }), /* @__PURE__ */ jsx(Metric$2, {
          label: "Reports to send",
          value: data2.sections.acceptedReport.length
        }), /* @__PURE__ */ jsx(Metric$2, {
          label: "Active conversations",
          value: data2.sections.conversationsActive.length
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "mt-6 grid gap-4 lg:grid-cols-2",
        children: [/* @__PURE__ */ jsx(StatsCard, {
          title: "Messages sent",
          detail: "Last 7 days, across LinkedIn and Twitter/X.",
          points: data2.stats.messagesSent7d
        }), /* @__PURE__ */ jsx(StatsCard, {
          title: "Prospect base",
          detail: "Total prospects in CRM over the last 7 days.",
          points: data2.stats.prospects7d
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-8",
          children: [/* @__PURE__ */ jsxs("section", {
            children: [/* @__PURE__ */ jsx(SectionTitle$1, {
              title: "Todo",
              detail: "Highest-priority actions across the pipeline."
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-3 grid gap-3",
              children: todoItems.length ? todoItems.map((item) => /* @__PURE__ */ jsx(TodoItemRow, {
                item
              }, item.key)) : /* @__PURE__ */ jsx(EmptyState$1, {})
            })]
          }), /* @__PURE__ */ jsxs("section", {
            children: [/* @__PURE__ */ jsx(SectionTitle$1, {
              title: "Today",
              detail: "What needs attention first."
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-3 grid gap-3",
              children: [/* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "connect-today",
                title: "Connect today",
                items: data2.sections.toConnect,
                children: (task) => {
                  const prospect = data2.prospects.find((item) => item.id === task.prospect_id);
                  return prospect ? /* @__PURE__ */ jsx(DashboardTaskLink, {
                    prospect,
                    detail: "Send LinkedIn request with note, or without note if capped"
                  }) : null;
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "twitter-dms",
                title: "Twitter/X DMs today",
                items: data2.sections.twitterToContact,
                children: (task) => {
                  const prospect = data2.prospects.find((item) => item.id === task.prospect_id);
                  return prospect ? /* @__PURE__ */ jsx(DashboardTaskLink, {
                    prospect,
                    detail: "Send Twitter/X first touch manually"
                  }) : null;
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "accepted-report",
                title: "Accepted, report to send",
                items: data2.sections.acceptedReport,
                children: (prospect) => /* @__PURE__ */ jsx(DashboardTaskLink, {
                  prospect,
                  detail: "Connection accepted, report to send"
                })
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "brief-urls-missing",
                title: "Brief URLs missing",
                items: data2.sections.missingBriefUrls,
                children: (prospect) => /* @__PURE__ */ jsx(DashboardTaskLink, {
                  prospect,
                  detail: `Prepare brief URL for ${prospect.brief_topic || "brief"}`
                })
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "followups-due",
                title: "Follow-ups due",
                items: data2.sections.followupsDue,
                children: (task) => {
                  const prospect = data2.prospects.find((item) => item.id === task.prospect_id);
                  return prospect ? /* @__PURE__ */ jsx(DashboardTaskLink, {
                    prospect,
                    detail: `Follow-up due ${task.due_date || ""}`
                  }) : null;
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "followups-scheduled",
                title: "Follow-ups scheduled",
                items: data2.sections.followupsScheduled,
                children: (task) => {
                  const prospect = data2.prospects.find((item) => item.id === task.prospect_id);
                  return prospect ? /* @__PURE__ */ jsx(DashboardTaskLink, {
                    prospect,
                    detail: `Follow-up scheduled ${task.due_date || ""}`
                  }) : null;
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "active-conversations",
                title: "Active conversations",
                items: data2.sections.conversationsActive,
                children: (prospect) => /* @__PURE__ */ jsx(DashboardTaskLink, {
                  prospect,
                  detail: "Prospect replied, conversation in progress"
                })
              }), /* @__PURE__ */ jsx(TodayPanel, {
                storageKey: "pending-connections",
                title: "Pending connections",
                items: data2.sections.pendingConnections,
                children: (prospect) => /* @__PURE__ */ jsx(DashboardTaskLink, {
                  prospect,
                  detail: `${outreachModeLabel$1(prospect)} · sent ${prospect.connection_sent_date || "today"} · watch acceptance`
                })
              })]
            })]
          }), /* @__PURE__ */ jsxs(PersistentDetails, {
            storageKey: "prospects-in-progress",
            defaultOpen: activeProspects.length > 0,
            children: [/* @__PURE__ */ jsxs("summary", {
              className: "flex cursor-pointer list-none items-end justify-between gap-3",
              children: [/* @__PURE__ */ jsx(SectionTitle$1, {
                title: "Prospects in progress",
                detail: `${activeProspects.length} profiles in the working set.`
              }), /* @__PURE__ */ jsx(Badge$3, {
                tone: activeProspects.length ? "blue" : "green",
                children: activeProspects.length
              })]
            }), /* @__PURE__ */ jsx(ProspectsTable, {
              prospects: activeProspects
            })]
          })]
        }), /* @__PURE__ */ jsxs("aside", {
          className: "h-fit rounded-lg border border-stone-300 bg-white p-5 lg:sticky lg:top-6",
          children: [/* @__PURE__ */ jsx(SectionTitle$1, {
            title: "Timeline",
            detail: "Latest events."
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-4 space-y-4",
            children: data2.events.length === 0 ? /* @__PURE__ */ jsx(EmptyState$1, {}) : data2.events.map((event) => /* @__PURE__ */ jsxs("div", {
              className: "border-l-2 border-teal-700 pl-3",
              children: [/* @__PURE__ */ jsx("p", {
                className: "font-medium",
                children: event.name || "System"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-stone-600",
                children: event.type
              }), /* @__PURE__ */ jsxs("p", {
                className: "mt-1 text-xs text-stone-500",
                children: [event.happened_at, " · ", event.note]
              })]
            }, event.id))
          })]
        })]
      })]
    })
  });
});
function DashboardTaskLink({
  prospect,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 hover:border-teal-700 md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(Link$1, {
      to: `/prospects/${prospect.id}`,
      className: "block",
      children: /* @__PURE__ */ jsx(TaskIntro, {
        icon: /* @__PURE__ */ jsx(Clock, {
          size: 18
        }),
        title: prospect.name,
        detail
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-wrap items-center gap-2",
      children: [/* @__PURE__ */ jsx(Badge$3, {
        children: prospect.priority_tag
      }), /* @__PURE__ */ jsx(Badge$3, {
        tone: prospect.outreach_mode === "no_note" ? "blue" : "green",
        children: outreachModeLabel$1(prospect)
      }), /* @__PURE__ */ jsx(Badge$3, {
        tone: "blue",
        children: prospect.status
      }), /* @__PURE__ */ jsx("a", {
        href: prospect.twitter_url || prospect.profile_url,
        target: "_blank",
        rel: "noreferrer",
        "aria-label": `Open ${prospect.name} profile`,
        title: prospect.source_channel === "twitter" ? "Open X profile" : "Open LinkedIn profile",
        className: "inline-flex size-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 hover:border-teal-700 hover:text-teal-800",
        children: /* @__PURE__ */ jsx(ExternalLink, {
          size: 14
        })
      })]
    })]
  });
}
function buildTodoItems(data2) {
  const prospectsById = new Map(data2.prospects.map((prospect) => [prospect.id, prospect]));
  const watchAcceptanceTasksByProspectId = new Map(data2.tasks.filter((task) => task.status === "open" && task.type === "watch_acceptance" && task.prospect_id).map((task) => [task.prospect_id, task]));
  const todos = [];
  for (const prospect of data2.sections.acceptedReport) {
    todos.push({
      key: `accepted-report-${prospect.id}`,
      priority: 10,
      title: `Send first message to ${prospect.name}`,
      detail: `${prospect.brief_topic || "No brief topic"} · connection accepted`,
      kind: "message",
      prospect
    });
  }
  for (const task of data2.sections.followupsDue) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : void 0;
    todos.push({
      key: `followup-${task.id}`,
      priority: task.due_date && task.due_date < data2.today ? 20 : 25,
      title: `Send follow-up to ${task.name || prospect?.name || "prospect"}`,
      detail: task.due_date && task.due_date < data2.today ? `Overdue since ${task.due_date}` : `Due ${task.due_date || "today"}`,
      kind: "followup",
      prospect,
      task
    });
  }
  for (const task of data2.sections.toConnect) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : void 0;
    if (!prospect) continue;
    todos.push({
      key: `connect-${task.id}`,
      priority: 30,
      title: `Send connection request to ${prospect.name}`,
      detail: `${outreachModeLabel$1(prospect)} · ${prospect.brief_topic || "no brief topic"}`,
      kind: "connection",
      prospect,
      task
    });
  }
  for (const task of data2.sections.twitterToContact) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : void 0;
    if (!prospect) continue;
    todos.push({
      key: `twitter-${task.id}`,
      priority: 30,
      title: `Send Twitter/X DM to ${prospect.name}`,
      detail: `${prospect.brief_topic || "no brief topic"} · manual first touch`,
      kind: "twitter",
      prospect,
      task
    });
  }
  for (const prospect of data2.sections.missingBriefUrls.filter((item) => item.status !== "connection_sent")) {
    todos.push({
      key: `brief-url-${prospect.id}`,
      priority: 40,
      title: `Add brief URL for ${prospect.name}`,
      detail: `Prepare ${prospect.brief_topic || "brief"} before first message`,
      kind: "brief",
      prospect
    });
  }
  for (const prospect of data2.sections.pendingConnections) {
    const watchTask = watchAcceptanceTasksByProspectId.get(prospect.id);
    const pendingAge = pendingTodoAgeMs(prospect, watchTask);
    if (pendingAge !== null && pendingAge < 4 * 60 * 60 * 1e3) continue;
    todos.push({
      key: `pending-check-${prospect.id}`,
      priority: prospect.pending_checked_at ? 60 : 50,
      title: `Check pending connection for ${prospect.name}`,
      detail: prospect.pending_checked_at ? `Last checked ${formatRelativeAge(prospect.pending_checked_at)}` : `Never checked · sent ${prospect.connection_sent_date || "unknown date"}`,
      kind: "pending",
      prospect
    });
  }
  return todos.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
}
function TodoItemRow({
  item
}) {
  const icon = item.kind === "message" ? /* @__PURE__ */ jsx(Send, {
    size: 18
  }) : item.kind === "followup" ? /* @__PURE__ */ jsx(CalendarCheck, {
    size: 18
  }) : item.kind === "connection" ? /* @__PURE__ */ jsx(UserPlus, {
    size: 18
  }) : item.kind === "twitter" ? /* @__PURE__ */ jsx(AtSign, {
    size: 18
  }) : item.kind === "brief" ? /* @__PURE__ */ jsx(Link, {
    size: 18
  }) : /* @__PURE__ */ jsx(Clock, {
    size: 18
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-3 rounded-lg border border-stone-300 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(Link$1, {
      to: item.prospect ? `/prospects/${item.prospect.id}` : "/",
      className: "block",
      children: /* @__PURE__ */ jsx(TaskIntro, {
        icon,
        title: item.title,
        detail: item.detail
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-wrap gap-2",
      children: [item.prospect ? /* @__PURE__ */ jsx(ProfileButton, {
        prospect: item.prospect
      }) : null, item.kind === "message" && item.prospect?.post_acceptance_message ? /* @__PURE__ */ jsx(CopyButton$1, {
        label: "Copy message",
        value: item.prospect.post_acceptance_message
      }) : null, item.kind === "message" && item.prospect ? /* @__PURE__ */ jsx(ActionButton$1, {
        intent: "markReportSent",
        prospectId: item.prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      }) : null, item.kind === "followup" && item.prospect ? /* @__PURE__ */ jsx(CopyButton$1, {
        label: "Copy follow-up",
        value: followupCopy(item.prospect, item.task)
      }) : null, item.kind === "followup" && item.task?.prospect_id ? /* @__PURE__ */ jsx(ActionButton$1, {
        intent: item.task.type === "send_twitter_followup" ? "markTwitterFollowupSent" : "markFollowupSent",
        prospectId: item.task.prospect_id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      }) : null, item.kind === "connection" && item.prospect?.connection_message ? /* @__PURE__ */ jsx(CopyButton$1, {
        label: "Copy note",
        value: item.prospect.connection_message
      }) : null, item.kind === "connection" && item.prospect ? /* @__PURE__ */ jsx(ActionButton$1, {
        intent: "markConnectionSentWithNote",
        prospectId: item.prospect.id,
        label: "Sent with note",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        primary: true
      }) : null, item.kind === "connection" && item.prospect ? /* @__PURE__ */ jsx(ActionButton$1, {
        intent: "markConnectionSentWithoutNote",
        prospectId: item.prospect.id,
        label: "Sent without note",
        icon: /* @__PURE__ */ jsx(UserCheck, {
          size: 16
        })
      }) : null, item.kind === "twitter" && item.prospect?.twitter_dm_message ? /* @__PURE__ */ jsx(CopyButton$1, {
        label: "Copy DM",
        value: item.prospect.twitter_dm_message
      }) : null, item.kind === "twitter" && item.prospect ? /* @__PURE__ */ jsx(ActionButton$1, {
        intent: "markTwitterDmSent",
        prospectId: item.prospect.id,
        label: "Mark DM sent",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        primary: true
      }) : null, item.kind === "pending" && item.prospect ? /* @__PURE__ */ jsx(ActionLink$1, {
        href: item.prospect.profile_url,
        label: "Check",
        icon: /* @__PURE__ */ jsx(ExternalLink, {
          size: 16
        })
      }) : null, item.kind === "brief" && item.prospect ? /* @__PURE__ */ jsxs(Link$1, {
        to: `/prospects/${item.prospect.id}`,
        className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700",
        children: [/* @__PURE__ */ jsx(Link, {
          size: 16
        }), "Add URL"]
      }) : null]
    })]
  });
}
function ProfileButton({
  prospect
}) {
  if (prospect.source_channel === "twitter") {
    return /* @__PURE__ */ jsx("a", {
      href: prospect.twitter_url || prospect.profile_url,
      target: "_blank",
      rel: "noreferrer",
      "aria-label": `Open ${prospect.name} on X`,
      title: "Open X profile",
      className: "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-stone-900 bg-stone-900 px-3 text-sm font-black text-white hover:bg-stone-700",
      children: "X"
    });
  }
  return /* @__PURE__ */ jsx("a", {
    href: prospect.profile_url,
    target: "_blank",
    rel: "noreferrer",
    "aria-label": `Open ${prospect.name} on LinkedIn`,
    title: "Open LinkedIn profile",
    className: "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-[#0a66c2] bg-[#0a66c2] px-3 text-sm font-black text-white hover:bg-[#004182]",
    children: "in"
  });
}
function ActionLink$1({
  href,
  label,
  icon
}) {
  return /* @__PURE__ */ jsxs("a", {
    href,
    target: "_blank",
    rel: "noreferrer",
    className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700",
    children: [icon, label]
  });
}
function followupCopy(prospect, task) {
  return task?.type === "send_twitter_followup" ? prospect.twitter_followup_message || prospect.followup_message || "" : prospect.followup_message || "";
}
function pendingTodoAgeMs(prospect, watchTask) {
  if (prospect.pending_checked_at) return dateAgeMs(prospect.pending_checked_at);
  if (watchTask?.created_at) return dateAgeMs(watchTask.created_at);
  if (prospect.connection_sent_date && prospect.connection_sent_date < todayIsoClient()) return 4 * 60 * 60 * 1e3;
  if (prospect.connection_sent_date) return 0;
  return null;
}
function dateAgeMs(value) {
  if (!value) return null;
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) return null;
  return Date.now() - timestamp;
}
function formatRelativeAge(value) {
  const ageMs = dateAgeMs(value);
  if (ageMs === null) return value;
  const minutes = Math.max(0, Math.round(ageMs / 6e4));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
function todayIsoClient() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date());
}
function ProspectsTable({
  prospects
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "mt-3 overflow-x-auto rounded-lg border border-stone-300 bg-white",
    children: /* @__PURE__ */ jsxs("table", {
      className: "min-w-[900px] w-full border-collapse text-sm",
      children: [/* @__PURE__ */ jsx("thead", {
        className: "bg-stone-50 text-left text-xs font-bold uppercase text-stone-500",
        children: /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("th", {
            className: "border-b border-stone-300 px-4 py-3",
            children: "Prospect"
          }), /* @__PURE__ */ jsx("th", {
            className: "border-b border-stone-300 px-4 py-3",
            children: "Status"
          }), /* @__PURE__ */ jsx("th", {
            className: "border-b border-stone-300 px-4 py-3",
            children: "Wave"
          }), /* @__PURE__ */ jsx("th", {
            className: "border-b border-stone-300 px-4 py-3",
            children: "Brief"
          }), /* @__PURE__ */ jsx("th", {
            className: "border-b border-stone-300 px-4 py-3",
            children: "Next"
          })]
        })
      }), /* @__PURE__ */ jsx("tbody", {
        children: prospects.map((prospect) => /* @__PURE__ */ jsxs("tr", {
          className: "hover:bg-stone-50",
          children: [/* @__PURE__ */ jsxs("td", {
            className: "border-b border-stone-200 px-4 py-3",
            children: [/* @__PURE__ */ jsx(Link$1, {
              to: `/prospects/${prospect.id}`,
              className: "font-semibold text-stone-950 hover:text-teal-800",
              children: prospect.name
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-1 max-w-xl truncate text-stone-600",
              children: prospect.position
            })]
          }), /* @__PURE__ */ jsx("td", {
            className: "border-b border-stone-200 px-4 py-3",
            children: /* @__PURE__ */ jsx(Badge$3, {
              tone: "blue",
              children: prospect.status
            })
          }), /* @__PURE__ */ jsx("td", {
            className: "border-b border-stone-200 px-4 py-3",
            children: prospect.wave || "-"
          }), /* @__PURE__ */ jsx("td", {
            className: "border-b border-stone-200 px-4 py-3",
            children: prospect.brief_topic || "-"
          }), /* @__PURE__ */ jsx("td", {
            className: "border-b border-stone-200 px-4 py-3 text-stone-600",
            children: nextActionLabel(prospect)
          })]
        }, prospect.id))
      })]
    })
  });
}
function nextActionLabel(prospect) {
  if (prospect.status === "to_contact" && prospect.source_channel === "twitter") return "Send Twitter/X DM";
  if (prospect.status === "to_contact" && prospect.contact_now) return "Send request with note or without note";
  if (prospect.status === "twitter_contacted") return "Wait for Twitter/X follow-up";
  if (prospect.status === "connection_sent") return `${outreachModeLabel$1(prospect)} · watch acceptance`;
  if (prospect.status === "accepted") return "Send first message";
  if (prospect.status === "report_sent") return "Wait for follow-up";
  if (prospect.status === "conversation_active") return "Conversation in progress";
  if (prospect.status === "reply_sent") return "Response sent";
  if (prospect.status === "followup_due") return "Send follow-up";
  if (prospect.status === "archived_declined" || prospect.status === "archived") return "Archived";
  return "Review";
}
function Metric$2({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-300 bg-white p-5",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm text-stone-600",
      children: label
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-3xl font-semibold",
      children: value
    })]
  });
}
function StatsCard({
  title,
  detail,
  points
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const latest = points.at(-1)?.value || 0;
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-300 bg-white p-5",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-lg font-semibold",
          children: title
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-stone-600",
          children: detail
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "text-left sm:text-right",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-2xl font-semibold",
          children: latest
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs font-medium uppercase text-stone-500",
          children: title === "Messages sent" ? `${total} total` : "today"
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-5 grid h-40 grid-cols-7 items-end gap-2 border-b border-stone-300 pb-2",
      children: points.map((point) => /* @__PURE__ */ jsxs("div", {
        className: "flex h-full flex-col justify-end gap-2",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex min-h-6 items-center justify-center text-xs font-semibold text-stone-600",
          children: point.value
        }), /* @__PURE__ */ jsx("div", {
          className: "min-h-2 rounded-t-md bg-teal-700",
          style: {
            height: point.value === 0 ? "0px" : `${Math.max(8, Math.round(point.value / max * 104))}px`
          },
          title: `${point.date}: ${point.value}`
        })]
      }, point.date))
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-2 grid grid-cols-7 gap-2 text-center text-xs text-stone-500",
      children: points.map((point) => /* @__PURE__ */ jsx("span", {
        children: point.label
      }, point.date))
    })]
  });
}
function SectionTitle$1({
  title,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
    children: [/* @__PURE__ */ jsx("h2", {
      className: "text-xl font-semibold",
      children: title
    }), /* @__PURE__ */ jsx("p", {
      className: "text-sm text-stone-600",
      children: detail
    })]
  });
}
function TodayPanel({
  storageKey,
  title,
  items,
  children
}) {
  const defaultOpen = items.length > 0;
  return /* @__PURE__ */ jsxs(PersistentDetails, {
    storageKey: `today-${storageKey}`,
    defaultOpen,
    className: "rounded-lg border border-stone-300 bg-white p-4",
    children: [/* @__PURE__ */ jsxs("summary", {
      className: "flex cursor-pointer list-none items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold",
        children: title
      }), /* @__PURE__ */ jsx(Badge$3, {
        tone: items.length ? "blue" : "green",
        children: items.length
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-3 grid gap-2",
      children: items.length ? items.map((item, index) => /* @__PURE__ */ jsx("div", {
        children: children(item)
      }, index)) : /* @__PURE__ */ jsx(EmptyState$1, {})
    })]
  });
}
function PersistentDetails({
  storageKey,
  defaultOpen,
  className,
  children
}) {
  const key = `outreach.dashboard.details.${storageKey}`;
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved === "open") setOpen(true);
    if (saved === "closed") setOpen(false);
  }, [key]);
  return /* @__PURE__ */ jsx("details", {
    className,
    open,
    onToggle: (event) => {
      const next = event.currentTarget.open;
      setOpen(next);
      window.localStorage.setItem(key, next ? "open" : "closed");
    },
    children
  });
}
function TaskIntro({
  icon,
  title,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "flex gap-3",
    children: [/* @__PURE__ */ jsx("div", {
      className: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-800",
      children: icon
    }), /* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("p", {
        className: "font-medium",
        children: title
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-stone-600",
        children: detail
      })]
    })]
  });
}
function Badge$3({
  children,
  tone = "green"
}) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return /* @__PURE__ */ jsx("span", {
    className: `inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`,
    children
  });
}
function outreachModeLabel$1(prospect) {
  if (prospect.source_channel === "twitter") return "Twitter/X";
  if (prospect.status === "to_contact") return "note optional";
  return prospect.outreach_mode === "no_note" ? "no note" : "with note";
}
function ActionButton$1({
  intent,
  prospectId,
  label,
  icon,
  primary = false,
  danger = false
}) {
  const className = primary ? "border-teal-700 bg-teal-700 text-white hover:bg-teal-800" : danger ? "border-stone-300 bg-white text-red-700 hover:border-red-300" : "border-stone-300 bg-white text-stone-800 hover:border-teal-700";
  return /* @__PURE__ */ jsxs(FormShell, {
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "intent",
      value: intent
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "prospectId",
      value: prospectId
    }), /* @__PURE__ */ jsxs("button", {
      className: `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${className}`,
      children: [icon, label]
    })]
  });
}
function CopyButton$1({
  label,
  value,
  compact = false
}) {
  return /* @__PURE__ */ jsxs("button", {
    type: "button",
    className: `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700 ${compact ? "min-h-8 px-2" : ""}`,
    onClick: () => navigator.clipboard.writeText(value),
    children: [/* @__PURE__ */ jsx(Clipboard, {
      size: 16
    }), label]
  });
}
function FormShell({
  children,
  className
}) {
  return /* @__PURE__ */ jsx(Form, {
    method: "post",
    className,
    children
  });
}
function EmptyState$1() {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500",
    children: "Nothing here."
  });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: home,
  loader: loader$3,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "..", "..", "..");
const docsDir = path.join(repoRoot, "tempolis", "front", "docs");
async function analyzeProspectTable(tableText) {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No prospects found. Paste a table with Name, Position, Profile URL and About columns.");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const outreach = fs.readFileSync(path.join(docsDir, "outreach.md"), "utf8");
  const brand = fs.readFileSync(path.join(docsDir, "brand.md"), "utf8");
  const prompt = buildPrompt({ prospects, outreach, brand });
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Tempolis Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a strict JSON-producing public affairs outreach analyst. Return only valid JSON. Never include markdown."
        },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 600)}`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return normalizeAnalysis(parseJson(content), prospects.length);
}
async function analyzeTwitterProspectTable(tableText) {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No Twitter/X prospects found. Add at least a name and profile URL or handle.");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const outreach = fs.readFileSync(path.join(docsDir, "outreach.md"), "utf8");
  const brand = fs.readFileSync(path.join(docsDir, "brand.md"), "utf8");
  const prompt = buildTwitterPrompt({ prospects, outreach, brand });
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Tempolis Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a strict JSON-producing public affairs outreach analyst. Return only valid JSON. Never include markdown."
        },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 600)}`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return normalizeTwitterAnalysis(parseJson(content), prospects.length);
}
function prospectEvidenceToTable(profile) {
  const evidence = [
    profile.signals,
    profile.activity ? `Activity: ${profile.activity}` : "",
    profile.experience ? `Experience: ${profile.experience}` : "",
    profile.education ? `Education: ${profile.education}` : "",
    profile.rawText ? `Visible page text: ${profile.rawText}` : ""
  ].filter(Boolean).join("\n\n");
  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const row = [
    profile.name || "",
    profile.position || "",
    profile.profileUrl || "",
    profile.about || "",
    evidence,
    profile.briefDirection || ""
  ].map(cleanCell$2).join("	");
  return [header.join("	"), row].join("\n");
}
function cleanCell$2(value) {
  return String(value || "").replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}
function loadLocalEnv() {
  const envPath = path.join(repoRoot, "outreach-app", ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== void 0) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
function buildPrompt({ prospects, outreach, brand }) {
  return `
Analyze this new Tempolis LinkedIn outreach batch.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the outreach playbook.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Generate exact LinkedIn connection messages for contactToday=true profiles.
- Write all outreach messages in English by default: connectionMessage, reportMessage, noNoteReportMessage, and followupMessage.
- Do not use French greetings or French message templates unless the input explicitly requests French. For now, assume English.
- Use brief topics of 1 to 3 words only.
- A brief topic is not the prospect's broad profession. It must be a concrete Tempolis brief subject: a figure, movement, issue, policy, controversy, narrative risk, or public debate.
- Never use vague discipline labels as briefTopic: "public policy", "policy", "communications", "public affairs", "EU affairs", "regulation", "strategy".
- If the user provides briefDirection, treat it as the strongest hint. If they provide signals/recent posts, use them to choose the topic.
- Treat activity evidence carefully:
  - A repost, like, comment, or visible activity is evidence of recent interest only, not proof that the prospect works on that topic.
  - Do not write "your work on [topic]" unless the role/about/experience explicitly says they work on that topic.
  - For repost-derived topics, use wording like "your recent interest in [topic]", "a topic you recently shared", or "given the policy issues visible in your activity".
  - In briefPreparation, distinguish "profile evidence" from "activity signal"; do not claim a subject is in their professional domain based only on a repost.
- Good briefTopic examples: "AI Act", "Energy security", "Tech backlash", "EU competitiveness", "Strategic autonomy", "Narrative risk", "Trade tensions".
- Respect the outreach rule: no product pitch, no demo/call request, short connection note under 300 characters.
- Generate two post-acceptance variants:
  - reportMessage assumes a custom connection note was sent and may refer to the promised brief.
  - noNoteReportMessage assumes no custom connection note was sent; it must open naturally with "Thanks for connecting" or equivalent and must not say "as promised" or "the brief I mentioned".
- Make noNoteReportMessage genuinely adapted to the prospect:
  - Use their role, company context, about field, signals, briefDirection, rationale, recommendedTemplate and briefTopic to pick one concrete angle.
  - Mention the builder context lightly: the sender is building Tempolis / testing a small public affairs brief format.
  - Explain why the brief may be relevant in one specific phrase, but do not overclaim the prospect's work from reposts or activity.
  - Ask for feedback on angle, signal quality, or format, not generic "thoughts".
  - Avoid filler phrases: "key topics", "professionals like yourself", "might be of interest", "any initial thoughts", "greatly appreciated".
- Generate the J+2 follow-up.
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": {
    "total": number,
    "contactToday": number,
    "wave2": number,
    "saved": number,
    "skipped": number
  },
  "prospects": [
    {
      "name": string,
      "position": string,
      "profileUrl": string,
      "about": string,
      "priorityTag": "LEARN" | "WARM" | "SAVE" | "SKIP",
      "wave": 1 | 2 | 3 | null,
      "contactNow": boolean,
      "rationale": string,
      "briefTopic": string,
      "briefPreparation": string,
      "recommendedTemplate": string,
      "connectionMessage": string,
      "reportMessage": string,
      "noNoteReportMessage": string,
      "followupMessage": string
    }
  ]
}

TEMPLATES AND RULES
${outreach}

BRAND GUARDRAILS
${brand.slice(0, 16e3)}

PROSPECTS
${JSON.stringify(prospects, null, 2)}
`;
}
function buildTwitterPrompt({ prospects, outreach, brand }) {
  return `
Analyze this new Tempolis Twitter/X outreach batch.

CONTEXT
This is not LinkedIn. We are testing Twitter/X as a manual acquisition channel. The app will help copy messages and track follow-ups, but it will not automate X.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the outreach playbook.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Write all outreach messages in English by default.
- Use brief topics of 1 to 3 words only.
- A brief topic must be concrete: a figure, movement, issue, policy, controversy, narrative risk, public debate, or public discourse signal.
- Never use vague discipline labels as briefTopic: "public policy", "policy", "communications", "public affairs", "EU affairs", "regulation", "strategy".
- Treat Twitter activity carefully: posts, reposts, likes, follows and bio claims are signals of interest, not proof of professional ownership unless explicitly stated.
- Do not say "your work on [topic]" unless the bio/about/role explicitly says they work on that topic.
- For post-derived topics, use wording like "your recent posts on [topic]", "a topic you recently shared", or "given the policy issues visible in your feed".
- Keep Twitter/X copy lighter and more direct than LinkedIn:
  - twitterDmMessage: 4 lines max, no pitch, no demo/call ask, includes [shared link] on its own line if a brief is being sent.
  - twitterDmMessage must explicitly connect the brief to one concrete source signal from the profile/feed.
  - Preferred structure: "I prepared a short brief on [briefTopic], based on [specific signal from your bio/posts/feed]."
  - The source signal should be specific but cautious: "your recent posts on...", "a topic you shared", "the policy signals in your feed", "your bio focus on...".
  - Do not write vague copy like "I saw your recent interest in [topic]" unless the exact source signal is unclear.
  - twitterFollowupMessage: one gentle follow-up at J+2 max.
- If DMs may be closed, still generate a DM-style message that can be adapted as a reply after interaction.
- Mention the builder context lightly: the sender is building Tempolis / testing a small public affairs brief format.
- Ask for feedback on the angle, signal quality, or format. Do not ask for generic "thoughts".
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": {
    "total": number,
    "contactToday": number,
    "wave2": number,
    "saved": number,
    "skipped": number
  },
  "prospects": [
    {
      "name": string,
      "position": string,
      "profileUrl": string,
      "twitterHandle": string,
      "about": string,
      "priorityTag": "LEARN" | "WARM" | "SAVE" | "SKIP",
      "wave": 1 | 2 | 3 | null,
      "contactNow": boolean,
      "rationale": string,
      "briefTopic": string,
      "briefPreparation": string,
      "recommendedTemplate": string,
      "twitterDmMessage": string,
      "twitterFollowupMessage": string
    }
  ]
}

LINKEDIN PLAYBOOK TO ADAPT, NOT COPY LITERALLY
${outreach}

BRAND GUARDRAILS
${brand.slice(0, 16e3)}

TWITTER/X PROSPECTS
${JSON.stringify(prospects, null, 2)}
`;
}
function parseProspectTable(input) {
  const text = input.trim();
  if (!text) return [];
  const rows = text.includes("	") ? parseDelimited(text, "	") : parseCsv(text);
  const [header = [], ...body] = rows;
  const columns = header.map((item) => normalizeHeader(item));
  return body.map((cells) => {
    const row = Object.fromEntries(columns.map((key, index) => [key, cells[index] || ""]));
    return {
      name: clean(row.name),
      position: clean(row.position),
      profileUrl: clean(row.profileurl || row.profile || row.linkedin || row.url),
      about: clean(row.about),
      signals: clean(row.signals || row.recentposts || row.posts || row.activity || row.evidence),
      briefDirection: clean(row.briefdirection || row.briefseed || row.topicseed || row.suggestedtopic || row.preferredtopic)
    };
  }).filter((row) => row.name && row.profileUrl);
}
function parseDelimited(input, delimiter) {
  return input.split(/\r?\n/).map((line) => line.split(delimiter));
}
function parseCsv(input) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}
function parseJson(content) {
  const trimmed = content.trim();
  const json = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim() : trimmed;
  return JSON.parse(json);
}
function normalizeAnalysis(value, total) {
  const input = value;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map(normalizeProspect).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length
  };
  return { summary, prospects };
}
function normalizeTwitterAnalysis(value, total) {
  const input = value;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map(normalizeTwitterProspect).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length
  };
  return { summary, prospects };
}
function normalizeProspect(item) {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(String(item.priorityTag)) ? item.priorityTag : "SKIP";
  const wave = typeof item.wave === "number" ? item.wave : null;
  const rawBriefTopic = clean(item.briefTopic).split(/\s+/).slice(0, 3).join(" ");
  const briefTopic = isGenericBriefTopic(rawBriefTopic) ? fallbackBriefTopic(item) : rawBriefTopic;
  const firstName2 = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const connectionMessage = enforceEnglish(
    clean(item.connectionMessage),
    `Hi ${firstName2}, I'm building a tool aimed at EU public affairs professionals. I prepared a brief on ${briefTopic || "your policy area"} that might resonate. Would value your view.`
  );
  const reportMessage = enforceEnglish(
    clean(item.reportMessage),
    `Hi ${firstName2},

As promised, the brief on ${briefTopic || "your policy area"}: what public discourse is saying over the last 24 hours, outside media coverage.

[shared link]

I'm testing it with public affairs profiles before a proper launch. If the angle resonates, or if something feels off in the brief, your feedback would mean a lot.`
  );
  const noNoteFallback = noNoteFallbackCopy(firstName2, briefTopic, item.position, item.about, item.recommendedTemplate);
  const noNoteReportMessage = noPriorNoteCopy(enforceEnglish(clean(item.noNoteReportMessage), noNoteFallback), noNoteFallback);
  const followupMessage = enforceEnglish(
    clean(item.followupMessage),
    `Hi ${firstName2}, following up in case the brief slipped through. No worries if this isn't the right timing.`
  );
  return {
    name: clean(item.name),
    position: clean(item.position),
    profileUrl: clean(item.profileUrl),
    about: clean(item.about),
    priorityTag: tag,
    wave,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: clean(item.rationale),
    briefTopic,
    briefPreparation: clean(item.briefPreparation),
    recommendedTemplate: clean(item.recommendedTemplate),
    connectionMessage: connectionMessage.slice(0, 300),
    reportMessage,
    noNoteReportMessage,
    followupMessage
  };
}
function normalizeTwitterProspect(item) {
  const base = normalizeProspect({
    ...item,
    connectionMessage: "",
    reportMessage: "",
    noNoteReportMessage: "",
    followupMessage: item.twitterFollowupMessage || item.followupMessage || ""
  });
  const profileUrl = normalizeTwitterProfileUrl(item.profileUrl || item.twitterUrl || item.twitterHandle || "");
  const first = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const topic = base.briefTopic || "Narrative risk";
  return {
    ...base,
    profileUrl,
    sourceChannel: "twitter",
    twitterUrl: profileUrl,
    twitterHandle: normalizeTwitterHandle(item.twitterHandle || profileUrl),
    twitterDmMessage: sanitizeTwitterDm(
      enforceEnglish(clean(item.twitterDmMessage), twitterDmFallback(first, topic, item)),
      twitterDmFallback(first, topic, item)
    ),
    twitterFollowupMessage: enforceEnglish(
      clean(item.twitterFollowupMessage || item.followupMessage),
      `Hi ${first}, quick follow-up in case the brief slipped through. Even a short read on whether the angle is useful would help.`
    )
  };
}
function normalizeTwitterProfileUrl(value) {
  const handle = normalizeTwitterHandle(value);
  return handle ? `https://x.com/${handle}` : clean(value);
}
function twitterDmFallback(firstName2, topic, item) {
  const signal = twitterSourceSignal(item);
  return `Hi ${firstName2}, I'm building Tempolis and testing a short public affairs brief format.

I prepared one on ${topic}, based on ${signal}.

[shared link]

Would your read be that the angle and signal are useful, or off?`;
}
function twitterSourceSignal(item) {
  const evidence = clean([item.briefPreparation, item.rationale, item.about, item.recommendedTemplate].filter(Boolean).join(" "));
  if (/\bbio\b/i.test(evidence)) return "the policy focus in your bio";
  if (/\b(post|tweet|thread)\b/i.test(evidence)) return "the policy signals in your recent posts";
  if (/\b(repost|shared|activity|feed)\b/i.test(evidence)) return "a topic visible in your recent activity";
  if (/\b(journalist|reporter|editor|coverage)\b/i.test(evidence)) return "the themes visible in your coverage";
  if (/\b(policy|public affairs|regulation|eu|brussels)\b/i.test(evidence)) return "the policy themes visible on your profile";
  return "the public signals visible on your profile";
}
function sanitizeTwitterDm(value, fallback) {
  const cleanValue = value.trim();
  if (!cleanValue) return fallback;
  if (/\brecent interest in\b/i.test(cleanValue) && !/\bbased on\b/i.test(cleanValue)) return fallback;
  if (!/\[shared link\]/i.test(cleanValue)) return fallback;
  if (/\byour work on\b/i.test(cleanValue) && /\b(repost|shared|activity|feed)\b/i.test(cleanValue)) return fallback;
  return cleanValue;
}
function normalizeTwitterHandle(value) {
  const trimmed = clean(value);
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const raw = match?.[1] || trimmed.replace(/^@/, "");
  return raw && !/^https?:\/\//i.test(raw) ? raw.replace(/[^a-zA-Z0-9_]/g, "") : "";
}
function enforceEnglish(value, fallback) {
  if (!value) return fallback;
  const frenchMarkers = [
    "bonjour",
    "votre regard",
    "j'ai préparé",
    "je construis",
    "le brief promis",
    "lien partagé",
    "je teste",
    "avez-vous eu",
    "votre retour"
  ];
  const lower = value.toLowerCase();
  return frenchMarkers.some((marker) => lower.includes(marker)) ? fallback : value;
}
function noPriorNoteCopy(value, fallback) {
  if (!/\b(as promised|brief i mentioned|brief i promised|comme promis|brief promis|key topics|professionals like yourself|might be of interest|any initial thoughts|greatly appreciated)\b/i.test(value)) return value;
  return fallback;
}
function isGenericBriefTopic(value) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  return [
    "policy",
    "public policy",
    "communications",
    "public affairs",
    "eu affairs",
    "regulation",
    "strategy",
    "stakeholder management"
  ].includes(normalized);
}
function fallbackBriefTopic(item) {
  const text = `${clean(item.position)} ${clean(item.about)} ${clean(item.rationale)} ${clean(item.recommendedTemplate)}`.toLowerCase();
  if (/\b(ai|artificial intelligence|ai act)\b/.test(text)) return "AI Act";
  if (/\b(energy|climate|grid|power)\b/.test(text)) return "Energy security";
  if (/\b(competitiveness|industry|industrial)\b/.test(text)) return "EU competitiveness";
  if (/\b(trade|tariff|canada|market access)\b/.test(text)) return "Trade tensions";
  if (/\b(privacy|gdpr|data)\b/.test(text)) return "Data privacy";
  if (/\b(digital|tech|platform)\b/.test(text)) return "Tech regulation";
  if (/\b(communications|comms|reputation|narrative|editorial)\b/.test(text)) return "Narrative risk";
  return "Policy backlash";
}
function noNoteFallbackCopy(firstName2, briefTopic, position, about, template) {
  const topic = briefTopic || "your policy area";
  const context = prospectContext(position, about, template);
  return `Hi ${firstName2},

Thanks for connecting. I'm building Tempolis, a tool for public affairs narrative briefs, and I prepared a short brief on ${topic} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`;
}
function prospectContext(position, about, template) {
  const text = `${clean(position)} ${clean(about)} ${clean(template)}`.toLowerCase();
  if (/\b(ai|artificial intelligence|digital|tech|technology|platform|data|privacy|gdpr)\b/.test(text)) return "tech policy and regulation";
  if (/\b(energy|climate|sustainability|power|grid)\b/.test(text)) return "energy and policy strategy";
  if (/\b(health|pharma|medical|biotech)\b/.test(text)) return "health policy and public affairs";
  if (/\b(finance|bank|fintech|payments|competition)\b/.test(text)) return "regulated markets and public affairs";
  if (/\b(communications|comms|media|narrative|reputation)\b/.test(text)) return "strategic communications";
  if (/\b(government affairs|public affairs|policy|regulatory|eu affairs|brussels)\b/.test(text)) return "public affairs and policy";
  return "policy and public affairs";
}
function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function clean(value) {
  return String(value || "").trim();
}
const meta$4 = () => [{
  title: "New batch · Tempolis Outreach"
}, {
  name: "description",
  content: "Analyze a pasted LinkedIn outreach batch with OpenRouter."
}];
async function action$4({
  request
}) {
  const formData = await request.formData();
  const table = String(formData.get("table") || "");
  try {
    const analysis = await analyzeProspectTable(table);
    await importAnalyzedProspects(analysis.prospects);
    return {
      ok: true,
      analysis
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
const batch = UNSAFE_withComponentProps(function Batch() {
  const actionData = useActionData();
  const [rows, setRows] = useState([{
    name: "",
    position: "",
    profileUrl: "",
    about: "",
    signals: "",
    briefDirection: ""
  }, {
    name: "",
    position: "",
    profileUrl: "",
    about: "",
    signals: "",
    briefDirection: ""
  }, {
    name: "",
    position: "",
    profileUrl: "",
    about: "",
    signals: "",
    briefDirection: ""
  }]);
  const tablePayload = toTsv$1(rows);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/",
            className: "inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              size: 16
            }), "Dashboard"]
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-4xl font-semibold tracking-normal",
            children: "New outreach batch"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-2xl text-stone-600",
            children: "Paste a Google Sheets-style table, submit, and the app will classify prospects, generate brief topics, and save the plan to SQLite."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-600",
          children: ["Model: ", /* @__PURE__ */ jsx("span", {
            className: "font-semibold text-stone-900",
            children: "google/gemini-2.5-flash-lite"
          })]
        })]
      }), /* @__PURE__ */ jsx("section", {
        className: "mt-6 rounded-lg border border-stone-300 bg-white p-5",
        children: /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "grid gap-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "table",
            value: tablePayload
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("h2", {
                  className: "font-semibold",
                  children: "Prospects"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-stone-600",
                  children: "Add one row per LinkedIn profile. Empty rows are ignored."
                })]
              }), /* @__PURE__ */ jsxs("button", {
                type: "button",
                onClick: () => setRows((current) => [...current, {
                  name: "",
                  position: "",
                  profileUrl: "",
                  about: "",
                  signals: "",
                  briefDirection: ""
                }]),
                className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
                children: [/* @__PURE__ */ jsx(Plus, {
                  size: 16
                }), "Add row"]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-4 overflow-x-auto rounded-lg border border-stone-300",
              children: /* @__PURE__ */ jsxs("table", {
                className: "min-w-[1480px] w-full border-collapse bg-white text-sm",
                children: [/* @__PURE__ */ jsx("thead", {
                  className: "bg-stone-50 text-left text-xs font-bold uppercase text-stone-500",
                  children: /* @__PURE__ */ jsxs("tr", {
                    children: [/* @__PURE__ */ jsx("th", {
                      className: "w-[170px] border-b border-stone-300 px-3 py-2",
                      children: "Name"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[260px] border-b border-stone-300 px-3 py-2",
                      children: "Position"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[260px] border-b border-stone-300 px-3 py-2",
                      children: "Profile URL"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[300px] border-b border-stone-300 px-3 py-2",
                      children: "About"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[300px] border-b border-stone-300 px-3 py-2",
                      children: "Signals / posts"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[190px] border-b border-stone-300 px-3 py-2",
                      children: "Brief direction"
                    }), /* @__PURE__ */ jsx("th", {
                      className: "w-[56px] border-b border-stone-300 px-3 py-2"
                    })]
                  })
                }), /* @__PURE__ */ jsx("tbody", {
                  children: rows.map((row, index) => /* @__PURE__ */ jsxs("tr", {
                    className: "align-top",
                    children: [/* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx(CellInput, {
                        value: row.name,
                        placeholder: "Jane Doe",
                        onChange: (value) => updateRow(index, "name", value)
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx(CellInput, {
                        value: row.position,
                        placeholder: "EU Public Affairs Manager",
                        onChange: (value) => updateRow(index, "position", value)
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx(CellInput, {
                        value: row.profileUrl,
                        placeholder: "https://www.linkedin.com/in/...",
                        onChange: (value) => updateRow(index, "profileUrl", value)
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx("textarea", {
                        value: row.about,
                        onChange: (event) => updateRow(index, "about", event.target.value),
                        rows: 2,
                        placeholder: "Short profile summary, LinkedIn about, sector, topics...",
                        className: "min-h-20 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx("textarea", {
                        value: row.signals,
                        onChange: (event) => updateRow(index, "signals", event.target.value),
                        rows: 2,
                        placeholder: "Recent posts, experience details, client context, recurring topics...",
                        className: "min-h-20 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx(CellInput, {
                        value: row.briefDirection,
                        placeholder: "AI Act, EU competitiveness...",
                        onChange: (value) => updateRow(index, "briefDirection", value)
                      })
                    }), /* @__PURE__ */ jsx("td", {
                      className: "border-b border-stone-200 p-2",
                      children: /* @__PURE__ */ jsx("button", {
                        type: "button",
                        onClick: () => removeRow(index),
                        disabled: rows.length === 1,
                        "aria-label": "Remove row",
                        className: "inline-flex size-10 items-center justify-center rounded-md border border-stone-300 bg-white text-red-700 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40",
                        children: /* @__PURE__ */ jsx(Trash2, {
                          size: 16
                        })
                      })
                    })]
                  }, index))
                })]
              })
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [/* @__PURE__ */ jsxs("button", {
              disabled: rows.filter(isFilledRow$1).length === 0,
              className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300",
              children: [/* @__PURE__ */ jsx(Brain, {
                size: 18
              }), "Analyze ", rows.filter(isFilledRow$1).length || "", " and import"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-sm text-stone-600",
              children: "Requires `OPENROUTER_API_KEY` in the shell running the app."
            })]
          })]
        })
      }), actionData?.ok === false ? /* @__PURE__ */ jsxs("section", {
        className: "mt-6 rounded-lg border border-red-300 bg-white p-5 text-red-800",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-lg font-semibold",
          children: "Analysis failed"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm",
          children: actionData.error
        })]
      }) : null, actionData?.ok ? /* @__PURE__ */ jsx(Results$1, {
        analysis: actionData.analysis
      }) : null]
    })
  });
  function updateRow(index, field, value) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? {
      ...row,
      [field]: value
    } : row));
  }
  function removeRow(index) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }
});
function CellInput({
  value,
  placeholder,
  onChange
}) {
  return /* @__PURE__ */ jsx("input", {
    value,
    onChange: (event) => onChange(event.target.value),
    placeholder,
    className: "min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
  });
}
function toTsv$1(rows) {
  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const body = rows.filter(isFilledRow$1).map((row) => [row.name, row.position, row.profileUrl, row.about, row.signals, row.briefDirection].map(cleanCell$1).join("	"));
  return [header.join("	"), ...body].join("\n");
}
function cleanCell$1(value) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}
function isFilledRow$1(row) {
  return Boolean(row.name.trim() || row.position.trim() || row.profileUrl.trim() || row.about.trim() || row.signals.trim() || row.briefDirection.trim());
}
function Results$1({
  analysis
}) {
  const toContact = analysis.prospects.filter((item) => item.contactNow);
  const wave2 = analysis.prospects.filter((item) => item.wave === 2);
  return /* @__PURE__ */ jsxs("section", {
    className: "mt-6 grid gap-6",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
      children: [/* @__PURE__ */ jsx(Metric$1, {
        label: "Total",
        value: analysis.summary.total
      }), /* @__PURE__ */ jsx(Metric$1, {
        label: "Connect today",
        value: analysis.summary.contactToday
      }), /* @__PURE__ */ jsx(Metric$1, {
        label: "Wave 2",
        value: analysis.summary.wave2
      }), /* @__PURE__ */ jsx(Metric$1, {
        label: "Saved",
        value: analysis.summary.saved
      }), /* @__PURE__ */ jsx(Metric$1, {
        label: "Skipped",
        value: analysis.summary.skipped
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-lg border border-stone-300 bg-white p-5",
      children: [/* @__PURE__ */ jsxs("h2", {
        className: "flex items-center gap-2 text-xl font-semibold",
        children: [/* @__PURE__ */ jsx(Send, {
          size: 20
        }), "Actions for today"]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 grid gap-3",
        children: toContact.length ? toContact.map((prospect) => /* @__PURE__ */ jsx(ActionCard$1, {
          prospect
        }, prospect.profileUrl)) : /* @__PURE__ */ jsx(Empty$1, {
          text: "No first-wave contact recommended in this batch."
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-lg border border-stone-300 bg-white p-5",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-xl font-semibold",
        children: "Wave 2 calibration"
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 grid gap-3",
        children: wave2.length ? wave2.map((prospect) => /* @__PURE__ */ jsx(MiniCard, {
          prospect
        }, prospect.profileUrl)) : /* @__PURE__ */ jsx(Empty$1, {
          text: "No wave 2 profiles."
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-lg border border-stone-300 bg-white p-5",
      children: [/* @__PURE__ */ jsxs("h2", {
        className: "flex items-center gap-2 text-xl font-semibold",
        children: [/* @__PURE__ */ jsx(CircleCheck, {
          size: 20
        }), "Full classification"]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 grid gap-3",
        children: analysis.prospects.map((prospect) => /* @__PURE__ */ jsx(MiniCard, {
          prospect
        }, prospect.profileUrl))
      })]
    })]
  });
}
function ActionCard$1({
  prospect
}) {
  return /* @__PURE__ */ jsxs("article", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-stone-600",
          children: prospect.position
        }), /* @__PURE__ */ jsxs("p", {
          className: "mt-2 text-sm",
          children: ["Brief: ", /* @__PURE__ */ jsx("span", {
            className: "font-semibold",
            children: prospect.briefTopic
          })]
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-stone-600",
          children: prospect.rationale
        })]
      }), /* @__PURE__ */ jsx("a", {
        className: "text-sm font-medium text-teal-700 hover:text-teal-900",
        href: prospect.profileUrl,
        target: "_blank",
        rel: "noreferrer",
        children: "LinkedIn"
      })]
    }), /* @__PURE__ */ jsx(Message$1, {
      title: "Connection note",
      value: prospect.connectionMessage
    }), /* @__PURE__ */ jsx(Message$1, {
      title: "After acceptance, with note",
      value: prospect.reportMessage
    }), /* @__PURE__ */ jsx(Message$1, {
      title: "After acceptance, without note",
      value: prospect.noNoteReportMessage
    }), /* @__PURE__ */ jsx(Message$1, {
      title: "Follow-up J+2",
      value: prospect.followupMessage
    })]
  });
}
function MiniCard({
  prospect
}) {
  return /* @__PURE__ */ jsx("article", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-stone-600",
          children: prospect.position
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm text-stone-700",
          children: prospect.rationale
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-wrap gap-2",
        children: [/* @__PURE__ */ jsx(Badge$2, {
          children: prospect.priorityTag
        }), /* @__PURE__ */ jsxs(Badge$2, {
          children: ["Wave ", prospect.wave || "-"]
        }), prospect.briefTopic ? /* @__PURE__ */ jsx(Badge$2, {
          children: prospect.briefTopic
        }) : null]
      })]
    })
  });
}
function Message$1({
  title,
  value
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "mt-3 border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold",
        children: title
      }), /* @__PURE__ */ jsxs("button", {
        type: "button",
        onClick: () => navigator.clipboard.writeText(value),
        className: "inline-flex min-h-8 items-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium hover:border-teal-700",
        children: [/* @__PURE__ */ jsx(Clipboard, {
          size: 14
        }), "Copy"]
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700",
      children: value
    })]
  });
}
function Metric$1({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-300 bg-white p-4",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm text-stone-600",
      children: label
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-3xl font-semibold",
      children: value
    })]
  });
}
function Badge$2({
  children
}) {
  return /* @__PURE__ */ jsx("span", {
    className: "inline-flex min-h-6 items-center rounded-full bg-teal-50 px-2.5 text-xs font-semibold text-teal-800",
    children
  });
}
function Empty$1({
  text
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500",
    children: text
  });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: batch,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
const emptyRow = {
  name: "",
  position: "",
  profileUrl: "",
  about: "",
  signals: "",
  briefDirection: ""
};
const meta$3 = () => [{
  title: "Twitter/X batch · Tempolis Outreach"
}, {
  name: "description",
  content: "Analyze Twitter/X prospects with OpenRouter."
}];
async function action$3({
  request
}) {
  const formData = await request.formData();
  const table = String(formData.get("table") || "");
  try {
    const analysis = await analyzeTwitterProspectTable(table);
    await importAnalyzedProspects(analysis.prospects);
    return {
      ok: true,
      analysis
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
const twitter = UNSAFE_withComponentProps(function TwitterBatch() {
  const actionData = useActionData();
  const [rows, setRows] = useState([{
    ...emptyRow
  }, {
    ...emptyRow
  }, {
    ...emptyRow
  }]);
  const tablePayload = toTsv(rows);
  const filledRows = rows.filter(isFilledRow);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/",
            className: "inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              size: 16
            }), "Dashboard"]
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-4xl font-semibold tracking-normal",
            children: "Twitter/X prospects"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-2xl text-stone-600",
            children: "Add public X profiles, visible posts and signals. The app classifies them, generates a DM-style first touch, and saves the process to the CRM."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-600",
          children: ["Channel: ", /* @__PURE__ */ jsx("span", {
            className: "font-semibold text-stone-900",
            children: "Twitter/X"
          })]
        })]
      }), /* @__PURE__ */ jsx("section", {
        className: "mt-6 rounded-lg border border-stone-300 bg-white p-5",
        children: /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "grid gap-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "table",
            value: tablePayload
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "font-semibold",
                children: "Profiles"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-stone-600",
                children: "One row per X profile. Use posts/signals to help the model pick a sharper brief topic."
              })]
            }), /* @__PURE__ */ jsxs("button", {
              type: "button",
              onClick: () => setRows((current) => [...current, {
                ...emptyRow
              }]),
              className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
              children: [/* @__PURE__ */ jsx(Plus, {
                size: 16
              }), "Add row"]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "overflow-x-auto rounded-lg border border-stone-300",
            children: /* @__PURE__ */ jsxs("table", {
              className: "min-w-[1480px] w-full border-collapse bg-white text-sm",
              children: [/* @__PURE__ */ jsx("thead", {
                className: "bg-stone-50 text-left text-xs font-bold uppercase text-stone-500",
                children: /* @__PURE__ */ jsxs("tr", {
                  children: [/* @__PURE__ */ jsx("th", {
                    className: "w-[170px] border-b border-stone-300 px-3 py-2",
                    children: "Name"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[250px] border-b border-stone-300 px-3 py-2",
                    children: "Role / context"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[250px] border-b border-stone-300 px-3 py-2",
                    children: "X URL or handle"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[300px] border-b border-stone-300 px-3 py-2",
                    children: "Bio / about"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[340px] border-b border-stone-300 px-3 py-2",
                    children: "Posts / signals"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[190px] border-b border-stone-300 px-3 py-2",
                    children: "Brief direction"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[56px] border-b border-stone-300 px-3 py-2"
                  })]
                })
              }), /* @__PURE__ */ jsx("tbody", {
                children: rows.map((row, index) => /* @__PURE__ */ jsxs("tr", {
                  className: "align-top",
                  children: [/* @__PURE__ */ jsx(Cell, {
                    row,
                    index,
                    field: "name",
                    placeholder: "Jane Doe",
                    update: updateRow
                  }), /* @__PURE__ */ jsx(Cell, {
                    row,
                    index,
                    field: "position",
                    placeholder: "EU policy analyst, journalist...",
                    update: updateRow
                  }), /* @__PURE__ */ jsx(Cell, {
                    row,
                    index,
                    field: "profileUrl",
                    placeholder: "@handle or https://x.com/handle",
                    update: updateRow
                  }), /* @__PURE__ */ jsx(TextCell, {
                    row,
                    index,
                    field: "about",
                    placeholder: "Bio, public role, org, topics...",
                    update: updateRow
                  }), /* @__PURE__ */ jsx(TextCell, {
                    row,
                    index,
                    field: "signals",
                    placeholder: "Recent posts, reposts, recurring themes, public threads...",
                    update: updateRow
                  }), /* @__PURE__ */ jsx(Cell, {
                    row,
                    index,
                    field: "briefDirection",
                    placeholder: "AI Act, migration...",
                    update: updateRow
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b border-stone-200 p-2",
                    children: /* @__PURE__ */ jsx("button", {
                      type: "button",
                      onClick: () => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index)),
                      disabled: rows.length === 1,
                      "aria-label": "Remove row",
                      className: "inline-flex size-10 items-center justify-center rounded-md border border-stone-300 bg-white text-red-700 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40",
                      children: /* @__PURE__ */ jsx(Trash2, {
                        size: 16
                      })
                    })
                  })]
                }, index))
              })]
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [/* @__PURE__ */ jsxs("button", {
              disabled: filledRows.length === 0,
              className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300",
              children: [/* @__PURE__ */ jsx(Brain, {
                size: 18
              }), "Analyze ", filledRows.length || "", " and import"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-sm text-stone-600",
              children: "Manual X workflow: the app prepares copy and tracking, you send."
            })]
          })]
        })
      }), actionData?.ok === false ? /* @__PURE__ */ jsxs("section", {
        className: "mt-6 rounded-lg border border-red-300 bg-white p-5 text-red-800",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-lg font-semibold",
          children: "Analysis failed"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm",
          children: actionData.error
        })]
      }) : null, actionData?.ok ? /* @__PURE__ */ jsx(Results, {
        analysis: actionData.analysis
      }) : null]
    })
  });
  function updateRow(index, field, value) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? {
      ...row,
      [field]: value
    } : row));
  }
});
function Cell({
  row,
  index,
  field,
  placeholder,
  update
}) {
  return /* @__PURE__ */ jsx("td", {
    className: "border-b border-stone-200 p-2",
    children: /* @__PURE__ */ jsx("input", {
      value: row[field],
      onChange: (event) => update(index, field, event.target.value),
      placeholder,
      className: "min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
    })
  });
}
function TextCell({
  row,
  index,
  field,
  placeholder,
  update
}) {
  return /* @__PURE__ */ jsx("td", {
    className: "border-b border-stone-200 p-2",
    children: /* @__PURE__ */ jsx("textarea", {
      value: row[field],
      onChange: (event) => update(index, field, event.target.value),
      rows: 2,
      placeholder,
      className: "min-h-20 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
    })
  });
}
function Results({
  analysis
}) {
  const toContact = analysis.prospects.filter((item) => item.contactNow);
  return /* @__PURE__ */ jsxs("section", {
    className: "mt-6 grid gap-6",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
      children: [/* @__PURE__ */ jsx(Metric, {
        label: "Total",
        value: analysis.summary.total
      }), /* @__PURE__ */ jsx(Metric, {
        label: "DM today",
        value: analysis.summary.contactToday
      }), /* @__PURE__ */ jsx(Metric, {
        label: "Wave 2",
        value: analysis.summary.wave2
      }), /* @__PURE__ */ jsx(Metric, {
        label: "Saved",
        value: analysis.summary.saved
      }), /* @__PURE__ */ jsx(Metric, {
        label: "Skipped",
        value: analysis.summary.skipped
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-lg border border-stone-300 bg-white p-5",
      children: [/* @__PURE__ */ jsxs("h2", {
        className: "flex items-center gap-2 text-xl font-semibold",
        children: [/* @__PURE__ */ jsx(Send, {
          size: 20
        }), "Twitter/X actions"]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 grid gap-3",
        children: toContact.length ? toContact.map((prospect) => /* @__PURE__ */ jsx(ActionCard, {
          prospect
        }, prospect.profileUrl)) : /* @__PURE__ */ jsx(Empty, {
          text: "No Twitter/X contact recommended in this batch."
        })
      })]
    })]
  });
}
function ActionCard({
  prospect
}) {
  return /* @__PURE__ */ jsxs("article", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-stone-600",
          children: prospect.position
        }), /* @__PURE__ */ jsxs("p", {
          className: "mt-2 text-sm",
          children: ["Brief: ", /* @__PURE__ */ jsx("span", {
            className: "font-semibold",
            children: prospect.briefTopic
          })]
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-stone-600",
          children: prospect.rationale
        })]
      }), /* @__PURE__ */ jsx("a", {
        className: "text-sm font-medium text-teal-700 hover:text-teal-900",
        href: prospect.profileUrl,
        target: "_blank",
        rel: "noreferrer",
        children: "X profile"
      })]
    }), /* @__PURE__ */ jsx(Message, {
      title: "DM / first touch",
      value: prospect.twitterDmMessage || ""
    }), /* @__PURE__ */ jsx(Message, {
      title: "Follow-up J+2",
      value: prospect.twitterFollowupMessage || prospect.followupMessage
    })]
  });
}
function Message({
  title,
  value
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "mt-3 border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold",
        children: title
      }), /* @__PURE__ */ jsxs("button", {
        type: "button",
        onClick: () => navigator.clipboard.writeText(value),
        className: "inline-flex min-h-8 items-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium hover:border-teal-700",
        children: [/* @__PURE__ */ jsx(Clipboard, {
          size: 14
        }), "Copy"]
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700",
      children: value
    })]
  });
}
function Metric({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-300 bg-white p-4",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm text-stone-600",
      children: label
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-3xl font-semibold",
      children: value
    })]
  });
}
function Empty({
  text
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500",
    children: text
  });
}
function toTsv(rows) {
  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const body = rows.filter(isFilledRow).map((row) => [row.name, row.position, row.profileUrl, row.about, row.signals, row.briefDirection].map(cleanCell).join("	"));
  return [header.join("	"), ...body].join("\n");
}
function cleanCell(value) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}
function isFilledRow(row) {
  return Boolean(row.name.trim() || row.position.trim() || row.profileUrl.trim() || row.about.trim() || row.signals.trim() || row.briefDirection.trim());
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: twitter,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const groups = [{
  title: "EU public affairs",
  description: "Good first-wave LEARN profiles: consultants, advisors, managers around EU affairs and Brussels.",
  queries: [{
    label: "EU public affairs Brussels",
    intent: "Broad public affairs profiles around Brussels.",
    query: 'site:linkedin.com/in ("public affairs" OR "EU affairs" OR "government relations") ("Brussels" OR "EU" OR "European Union")'
  }, {
    label: "Consultants and advisors",
    intent: "Consultants likely to produce notes, briefs, monitoring and client updates.",
    query: 'site:linkedin.com/in ("EU affairs consultant" OR "public affairs consultant" OR "policy advisor") ("Brussels" OR "EU")'
  }, {
    label: "Policy communications",
    intent: "Comms profiles close to policy rooms and narrative work.",
    query: 'site:linkedin.com/in ("policy communications" OR "political communications" OR "strategic communications") ("Brussels" OR "EU")'
  }, {
    label: "Stakeholder and advocacy",
    intent: "Operational profiles useful for early outreach learning.",
    query: 'site:linkedin.com/in ("stakeholder engagement" OR advocacy OR "institutional relations") ("EU" OR Brussels)'
  }]
}, {
  title: "Corporate public affairs",
  description: "Company-side policy roles in regulated sectors. Mix with WARM/SAVE judgment before contacting.",
  queries: [{
    label: "Tech policy",
    intent: "Digital, AI, platform and data policy profiles.",
    query: 'site:linkedin.com/in ("digital policy" OR "tech policy" OR "AI policy" OR "platform regulation") ("Brussels" OR "EU" OR Europe)'
  }, {
    label: "Big tech public policy",
    intent: "Premium profiles; usually SAVE if very senior.",
    query: 'site:linkedin.com/in ("public policy" OR "government affairs") ("Google" OR Meta OR Microsoft OR Amazon OR Apple) ("EU" OR Europe OR Brussels)'
  }, {
    label: "Energy public affairs",
    intent: "Energy security, nuclear, renewables, climate policy.",
    query: 'site:linkedin.com/in ("public affairs" OR "government affairs" OR "regulatory affairs") (energy OR renewables OR nuclear) ("EU" OR Brussels)'
  }, {
    label: "Pharma and health",
    intent: "Health policy and regulatory affairs prospects.",
    query: 'site:linkedin.com/in ("public affairs" OR "regulatory affairs" OR "government affairs") (pharma OR health OR medicines) ("EU" OR Europe OR Brussels)'
  }, {
    label: "Finance regulation",
    intent: "Financial regulation, sustainable finance and competition profiles.",
    query: 'site:linkedin.com/in ("public affairs" OR "regulatory affairs") ("financial regulation" OR "sustainable finance" OR "competition policy") ("EU" OR Europe)'
  }]
}, {
  title: "Think tanks and research",
  description: "Analysts and fellows who can give high-quality feedback on signal value and brief structure.",
  queries: [{
    label: "EU policy analysts",
    intent: "General EU policy analysts and researchers.",
    query: 'site:linkedin.com/in ("EU policy analyst" OR "European policy researcher" OR "research fellow") ("Europe" OR Brussels)'
  }, {
    label: "Political risk",
    intent: "Analysts likely to understand narrative monitoring.",
    query: 'site:linkedin.com/in ("political risk analyst" OR "foresight analyst" OR "geopolitics analyst") Europe'
  }, {
    label: "Migration and enlargement",
    intent: "Good issue-led searches for analyst profiles.",
    query: 'site:linkedin.com/in ("migration policy analyst" OR "EU enlargement analyst" OR "foreign policy analyst") Europe'
  }, {
    label: "Climate and energy analysts",
    intent: "Policy researchers around climate and energy.",
    query: 'site:linkedin.com/in ("climate policy analyst" OR "energy policy analyst") ("EU" OR Europe)'
  }]
}, {
  title: "Journalists and media",
  description: "Useful for feedback on pre-publication signal and narrative framing.",
  queries: [{
    label: "Brussels correspondents",
    intent: "EU politics and Brussels reporters.",
    query: 'site:linkedin.com/in ("Brussels correspondent" OR "EU affairs reporter" OR "political correspondent")'
  }, {
    label: "Policy reporters",
    intent: "Sector reporters around EU policy.",
    query: 'site:linkedin.com/in ("EU policy reporter" OR "technology policy reporter" OR "energy reporter") Europe'
  }, {
    label: "Political newsletters",
    intent: "Writers/editors close to political risk and public discourse.",
    query: 'site:linkedin.com/in ("political risk newsletter" OR "Europe editor" OR "foreign affairs reporter") Europe'
  }]
}, {
  title: "Issue-led searches",
  description: "Composable searches from the playbook: métier + sujet + EU/Brussels signal.",
  queries: [{
    label: "AI Act",
    intent: "Good for digital policy and tech regulation prospects.",
    query: 'site:linkedin.com/in ("public affairs" OR "public policy" OR "policy advisor") ("AI Act" OR "artificial intelligence policy") ("EU" OR Brussels OR Europe)'
  }, {
    label: "DSA / DMA",
    intent: "Platform regulation and competition policy.",
    query: 'site:linkedin.com/in ("Digital Services Act" OR "Digital Markets Act" OR "platform regulation") ("public policy" OR "government affairs" OR "public affairs")'
  }, {
    label: "Cybersecurity",
    intent: "Cyber, cloud and data policy profiles.",
    query: 'site:linkedin.com/in ("cybersecurity policy" OR "cloud policy" OR "data protection") ("EU" OR Brussels OR Europe)'
  }, {
    label: "Ukraine / defence",
    intent: "International affairs and defence policy analysts.",
    query: 'site:linkedin.com/in ("defence policy" OR "European defence" OR Ukraine) ("policy analyst" OR "policy advisor" OR "public affairs") Europe'
  }, {
    label: "Climate policy",
    intent: "Climate, CBAM, Fit for 55 and energy-transition policy.",
    query: 'site:linkedin.com/in ("climate policy" OR CBAM OR "Fit for 55") ("public affairs" OR "policy analyst" OR "regulatory affairs") ("EU" OR Brussels)'
  }]
}, {
  title: "Post and need signals",
  description: "Google versions of the playbook's post searches. These often reveal active profiles and recent angles.",
  queries: [{
    label: "Public affairs briefs",
    intent: "People talking about briefs, clients and policy updates.",
    query: 'site:linkedin.com/posts ("EU public affairs" OR "public affairs") ("brief" OR "client briefing" OR "policy update")'
  }, {
    label: "Regulatory updates",
    intent: "Active people publishing regulatory analysis.",
    query: 'site:linkedin.com/posts ("regulatory update" OR "policy update") ("EU" OR Brussels)'
  }, {
    label: "Narrative / reputation",
    intent: "People talking about public opinion, reputation risk and narrative shifts.",
    query: 'site:linkedin.com/posts ("public opinion" OR "media narrative" OR "reputation risk" OR "online discourse") ("EU" OR Europe)'
  }]
}];
const meta$2 = () => [{
  title: "Discover prospects · Tempolis Outreach"
}, {
  name: "description",
  content: "Google search launcher for Tempolis outreach prospecting."
}];
const discover = UNSAFE_withComponentProps(function SearchPage() {
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/",
            className: "inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              size: 16
            }), "Dashboard"]
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-4xl font-semibold tracking-normal",
            children: "Discover prospects"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-stone-600",
            children: "Google-powered LinkedIn prospecting queries based on the Tempolis outreach playbook. Open a search, shortlist profiles, then add them through New batch."
          })]
        }), /* @__PURE__ */ jsx(Link$1, {
          to: "/batch",
          className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800",
          children: "Add shortlisted prospects"
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "mt-6 rounded-lg border border-stone-300 bg-white p-5",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-xl font-semibold",
          children: "How to use"
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-3 grid gap-3 text-sm text-stone-600 md:grid-cols-3",
          children: [/* @__PURE__ */ jsx("p", {
            children: "1. Start with first-wave searches in EU public affairs or issue-led categories."
          }), /* @__PURE__ */ jsx("p", {
            children: "2. Open several Google tabs, shortlist public LinkedIn profiles, and avoid premium targets too early."
          }), /* @__PURE__ */ jsx("p", {
            children: "3. Add promising profiles in New batch so the app classifies and writes outreach copy."
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-6 grid gap-6",
        children: groups.map((group) => /* @__PURE__ */ jsxs("section", {
          className: "rounded-lg border border-stone-300 bg-white p-5",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-xl font-semibold",
                children: group.title
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-sm text-stone-600",
                children: group.description
              })]
            }), /* @__PURE__ */ jsxs("span", {
              className: "text-sm font-medium text-stone-500",
              children: [group.queries.length, " searches"]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-4 grid gap-3 lg:grid-cols-2",
            children: group.queries.map((item) => /* @__PURE__ */ jsx(SearchCard, {
              item
            }, item.label))
          })]
        }, group.title))
      })]
    })
  });
});
function SearchCard({
  item
}) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(item.query)}`;
  return /* @__PURE__ */ jsxs("article", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: item.label
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-stone-600",
          children: item.intent
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex gap-2",
        children: [/* @__PURE__ */ jsxs("button", {
          type: "button",
          onClick: () => navigator.clipboard.writeText(item.query),
          className: "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium hover:border-teal-700",
          children: [/* @__PURE__ */ jsx(Copy, {
            size: 15
          }), "Copy"]
        }), /* @__PURE__ */ jsxs("a", {
          href: url,
          target: "_blank",
          rel: "noreferrer",
          className: "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-3 text-sm font-medium text-white hover:bg-teal-800",
          children: [/* @__PURE__ */ jsx(Search, {
            size: 15
          }), "Open", /* @__PURE__ */ jsx(ExternalLink, {
            size: 13
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("code", {
      className: "mt-3 block whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-xs leading-5 text-stone-700",
      children: item.query
    })]
  });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: discover,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const statuses = ["all", "to_contact", "connection_sent", "twitter_contacted", "accepted", "report_sent", "followup_sent", "saved_for_later", "skipped", "archived_declined"];
const meta$1 = () => [{
  title: "Search CRM · Tempolis Outreach"
}, {
  name: "description",
  content: "Search prospects already stored in the outreach CRM."
}];
async function loader$2() {
  return await getDashboard();
}
const search = UNSAFE_withComponentProps(function SearchCrmPage() {
  const data2 = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const status = params.get("status") || "all";
  const results = filterProspects(data2.prospects, query, status);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/",
            className: "inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              size: 16
            }), "Dashboard"]
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-4xl font-semibold tracking-normal",
            children: "Search CRM"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-stone-600",
            children: "Search prospects already stored in SQLite, including archived and skipped profiles, to avoid duplicates."
          })]
        }), /* @__PURE__ */ jsx(Link$1, {
          to: "/discover",
          className: "inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700",
          children: "Discover new prospects"
        })]
      }), /* @__PURE__ */ jsx("section", {
        className: "mt-6 rounded-lg border border-stone-300 bg-white p-5",
        children: /* @__PURE__ */ jsxs("div", {
          className: "grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]",
          children: [/* @__PURE__ */ jsxs("label", {
            className: "grid gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm font-semibold",
              children: "Search"
            }), /* @__PURE__ */ jsxs("div", {
              className: "relative",
              children: [/* @__PURE__ */ jsx(Search, {
                className: "absolute left-3 top-1/2 -translate-y-1/2 text-stone-500",
                size: 18
              }), /* @__PURE__ */ jsx("input", {
                value: query,
                onChange: (event) => updateParams(setParams, event.target.value, status),
                placeholder: "Name, company, profile URL, topic, status...",
                className: "min-h-11 w-full rounded-md border border-stone-300 bg-stone-50 pl-10 pr-3 outline-none focus:border-teal-700"
              })]
            })]
          }), /* @__PURE__ */ jsxs("label", {
            className: "grid gap-2",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm font-semibold",
              children: "Status"
            }), /* @__PURE__ */ jsx("select", {
              value: status,
              onChange: (event) => updateParams(setParams, query, event.target.value),
              className: "min-h-11 rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700",
              children: statuses.map((item) => /* @__PURE__ */ jsx("option", {
                value: item,
                children: item
              }, item))
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("section", {
        className: "mt-6 rounded-lg border border-stone-300 bg-white",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-1 border-b border-stone-300 p-5 sm:flex-row sm:items-end sm:justify-between",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-semibold",
            children: "Results"
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-stone-600",
            children: [results.length, " of ", data2.prospects.length, " prospects"]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "overflow-x-auto",
          children: [/* @__PURE__ */ jsxs("table", {
            className: "min-w-[1000px] w-full border-collapse text-sm",
            children: [/* @__PURE__ */ jsx("thead", {
              className: "bg-stone-50 text-left text-xs font-bold uppercase text-stone-500",
              children: /* @__PURE__ */ jsxs("tr", {
                children: [/* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Prospect"
                }), /* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Status"
                }), /* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Tag"
                }), /* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Wave"
                }), /* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Brief"
                }), /* @__PURE__ */ jsx("th", {
                  className: "border-b border-stone-300 px-4 py-3",
                  children: "Links"
                })]
              })
            }), /* @__PURE__ */ jsx("tbody", {
              children: results.map((prospect) => /* @__PURE__ */ jsxs("tr", {
                className: "hover:bg-stone-50",
                children: [/* @__PURE__ */ jsxs("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: [/* @__PURE__ */ jsx(Link$1, {
                    to: `/prospects/${prospect.id}`,
                    className: "font-semibold text-stone-950 hover:text-teal-800",
                    children: prospect.name
                  }), /* @__PURE__ */ jsx("p", {
                    className: "mt-1 max-w-xl truncate text-stone-600",
                    children: prospect.position
                  })]
                }), /* @__PURE__ */ jsx("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: /* @__PURE__ */ jsx(Badge$1, {
                    tone: "blue",
                    children: prospect.status
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: /* @__PURE__ */ jsx(Badge$1, {
                    children: prospect.priority_tag
                  })
                }), /* @__PURE__ */ jsx("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: prospect.wave || "-"
                }), /* @__PURE__ */ jsx("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: prospect.brief_topic || "-"
                }), /* @__PURE__ */ jsx("td", {
                  className: "border-b border-stone-200 px-4 py-3",
                  children: /* @__PURE__ */ jsxs("a", {
                    className: "inline-flex items-center gap-1 text-teal-700 hover:text-teal-900",
                    href: prospect.twitter_url || prospect.profile_url,
                    target: "_blank",
                    rel: "noreferrer",
                    children: [prospect.source_channel === "twitter" ? "X" : "LinkedIn", /* @__PURE__ */ jsx(ExternalLink, {
                      size: 14
                    })]
                  })
                })]
              }, prospect.id))
            })]
          }), results.length === 0 ? /* @__PURE__ */ jsx("div", {
            className: "p-5 text-sm text-stone-500",
            children: "No prospects found."
          }) : null]
        })]
      })]
    })
  });
});
function filterProspects(prospects, query, status) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return prospects.filter((prospect) => {
    if (status !== "all" && prospect.status !== status) return false;
    if (terms.length === 0) return true;
    const haystack = [prospect.name, prospect.position, prospect.profile_url, prospect.twitter_url, prospect.twitter_handle, prospect.source_channel, prospect.about, prospect.priority_tag, prospect.status, prospect.brief_topic, prospect.rationale, prospect.notes].filter(Boolean).join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
function updateParams(setParams, query, status) {
  const next = new URLSearchParams();
  if (query.trim()) next.set("q", query);
  if (status !== "all") next.set("status", status);
  setParams(next);
}
function Badge$1({
  children,
  tone = "green"
}) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return /* @__PURE__ */ jsx("span", {
    className: `inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`,
    children
  });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: search,
  loader: loader$2,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader$1({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders$2()
    });
  }
  const dashboard = await getExtensionDashboard();
  return data({
    ok: true,
    ...dashboard
  }, {
    headers: corsHeaders$2()
  });
}
function corsHeaders$2() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function action$2({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders$1()
    });
  }
  if (request.method !== "POST") {
    return data({
      ok: false,
      error: "Method not allowed"
    }, {
      status: 405,
      headers: corsHeaders$1()
    });
  }
  const payload = await readPayload$1(request);
  const id = Number(payload.id);
  if (!id) {
    return data({
      ok: false,
      error: "Missing prospect id"
    }, {
      status: 400,
      headers: corsHeaders$1()
    });
  }
  if (payload.state === "unknown") {
    return data({
      ok: true,
      synced: false
    }, {
      headers: corsHeaders$1()
    });
  }
  if (!["accepted", "declined", "pending"].includes(String(payload.state))) {
    return data({
      ok: false,
      error: "Unknown connection state"
    }, {
      status: 400,
      headers: corsHeaders$1()
    });
  }
  await syncProspectConnectionState(id, payload.state);
  return data({
    ok: true,
    synced: true,
    state: payload.state
  }, {
    headers: corsHeaders$1()
  });
}
function corsHeaders$1() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
async function readPayload$1(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  const text = await request.text();
  return JSON.parse(text);
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }
  if (request.method !== "POST") {
    return data({
      ok: false,
      error: "Method not allowed"
    }, {
      status: 405,
      headers: corsHeaders()
    });
  }
  const payload = await readPayload(request);
  if (payload.sourceChannel === "twitter") {
    return handleTwitterPayload(payload);
  }
  const profileUrl = normalizeLinkedInUrl(String(payload.profileUrl || ""));
  if (!profileUrl.includes("linkedin.com/in/")) {
    return data({
      ok: false,
      error: "Open a LinkedIn profile page first."
    }, {
      status: 400,
      headers: corsHeaders()
    });
  }
  const existingId = await findProspectByProfileUrl(profileUrl);
  if (existingId) {
    await setProspectOutreachPreference(existingId, normalizeOutreachMode(payload.outreachMode));
    return respond(payload, existingId, true);
  }
  const table = prospectEvidenceToTable({
    ...payload,
    profileUrl
  });
  const analysis = await analyzeProspectTable(table);
  await importAnalyzedProspects(analysis.prospects);
  const id = await findProspectByProfileUrl(profileUrl);
  if (!id) {
    return data({
      ok: false,
      error: "Profile analyzed but not found after import."
    }, {
      status: 500,
      headers: corsHeaders()
    });
  }
  await setProspectOutreachPreference(id, normalizeOutreachMode(payload.outreachMode));
  return respond(payload, id, false);
}
async function handleTwitterPayload(payload) {
  const profileUrl = normalizeTwitterUrl(String(payload.profileUrl || payload.twitterUrl || payload.twitterHandle || ""));
  if (!profileUrl.includes("x.com/") && !profileUrl.includes("twitter.com/")) {
    return data({
      ok: false,
      error: "Open a Twitter/X profile page first."
    }, {
      status: 400,
      headers: corsHeaders()
    });
  }
  const existingId = await findProspectByProfileUrl(profileUrl);
  if (existingId) {
    return respond(payload, existingId, true);
  }
  const table = prospectEvidenceToTable({
    ...payload,
    profileUrl,
    signals: [payload.signals, payload.activity ? `Visible posts: ${payload.activity}` : "", payload.rawText ? `Visible page text: ${payload.rawText}` : ""].filter(Boolean).join("\n\n")
  });
  const analysis = await analyzeTwitterProspectTable(table);
  await importAnalyzedProspects(analysis.prospects);
  const id = await findProspectByProfileUrl(profileUrl);
  if (!id) {
    return data({
      ok: false,
      error: "Twitter/X profile analyzed but not found after import."
    }, {
      status: 500,
      headers: corsHeaders()
    });
  }
  return respond(payload, id, false);
}
function respond(payload, id, existing) {
  if (payload.open) return redirect(`/prospects/${id}`);
  return data({
    ok: true,
    id,
    existing,
    url: `http://localhost:4377/prospects/${id}`
  }, {
    headers: corsHeaders()
  });
}
function normalizeLinkedInUrl(value) {
  return value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
}
function normalizeTwitterUrl(value) {
  const trimmed = value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const rawHandle = match?.[1] || trimmed.replace(/^@/, "");
  const handle = rawHandle && !/^https?:\/\//i.test(rawHandle) ? rawHandle.replace(/[^a-zA-Z0-9_]/g, "") : "";
  if (handle) return `https://x.com/${handle}`;
  return trimmed;
}
function normalizeOutreachMode(value) {
  return value === "with_note" ? "with_note" : "no_note";
}
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  const text = await request.text();
  return JSON.parse(text);
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = ({
  data: data2
}) => {
  const name = data2?.detail?.prospect?.name || "Prospect";
  return [{
    title: `${name} · Tempolis Outreach`
  }];
};
async function loader({
  params
}) {
  const id = Number(params.id);
  const detail = await getProspectDetail(id);
  if (!detail) {
    throw new Response("Prospect not found", {
      status: 404
    });
  }
  return {
    detail
  };
}
async function action({
  request,
  params
}) {
  const formData = await request.formData();
  await runProspectAction(formData);
  if (String(formData.get("intent") || "") === "deleteProspect") {
    return redirect("/");
  }
  return redirect(`/prospects/${params.id}`);
}
const prospect_$id = UNSAFE_withComponentProps(function ProspectDetail() {
  const {
    detail
  } = useLoaderData();
  const {
    prospect,
    tasks,
    events,
    replies,
    today
  } = detail;
  const openTasks = tasks.filter((task) => task.status === "open");
  const doneTasks = tasks.filter((task) => task.status !== "open");
  const showConnectionNote = prospect.outreach_mode !== "no_note" || prospect.connection_note_sent === 1;
  const connectionLocked = Boolean(prospect.connection_sent_date);
  const reportLocked = Boolean(prospect.report_sent_date);
  const archiveMode = Boolean(prospect.report_sent_date) || ["reply_sent", "followup_sent"].includes(prospect.status);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-start md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link$1, {
            to: "/",
            className: "inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900",
            children: [/* @__PURE__ */ jsx(ArrowLeft, {
              size: 16
            }), "Dashboard"]
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-4xl font-semibold tracking-normal",
            children: prospect.name
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-stone-600",
            children: prospect.position
          }), /* @__PURE__ */ jsxs("a", {
            className: "mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900",
            href: prospect.twitter_url || prospect.profile_url,
            target: "_blank",
            rel: "noreferrer",
            children: [prospect.source_channel === "twitter" ? "X profile" : "LinkedIn profile", /* @__PURE__ */ jsx(ExternalLink, {
              size: 14
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap gap-2",
          children: [/* @__PURE__ */ jsx(Badge, {
            children: prospect.priority_tag
          }), /* @__PURE__ */ jsxs(Badge, {
            children: ["Wave ", prospect.wave || "-"]
          }), /* @__PURE__ */ jsx(Badge, {
            tone: "blue",
            children: prospect.source_channel === "twitter" ? "Twitter/X" : "LinkedIn"
          }), /* @__PURE__ */ jsx(Badge, {
            tone: prospect.outreach_mode === "no_note" ? "blue" : "green",
            children: outreachModeLabel(prospect)
          }), /* @__PURE__ */ jsx(Badge, {
            tone: "blue",
            children: prospect.status
          }), /* @__PURE__ */ jsx(ArchiveControls, {
            prospect
          }), /* @__PURE__ */ jsx(DeleteProspectButton, {
            prospect
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-6",
          children: [/* @__PURE__ */ jsxs("section", {
            className: "rounded-lg border border-stone-300 bg-white p-5",
            children: [/* @__PURE__ */ jsx(SectionTitle, {
              title: "Actions in progress",
              detail: "Do these from top to bottom."
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-4 grid gap-3",
              children: openTasks.length ? openTasks.map((task) => /* @__PURE__ */ jsx(OpenTask, {
                task,
                prospect,
                today
              }, task.id)) : /* @__PURE__ */ jsx(EmptyState, {})
            })]
          }), prospect.source_channel === "linkedin" ? /* @__PURE__ */ jsx(CollapsibleSection, {
            title: "Outreach mode",
            detail: "Switch the copy strategy before sending.",
            defaultOpen: !archiveMode,
            children: /* @__PURE__ */ jsxs("div", {
              className: "mt-4 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-semibold",
                  children: outreachModeLabel(prospect)
                }), /* @__PURE__ */ jsx("p", {
                  className: "mt-1 text-sm text-stone-600",
                  children: prospect.outreach_mode === "no_note" ? "The request goes out without a custom note. The first real message is generated for after acceptance." : "The current sequence assumes a custom connection note that tees up the brief."
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-wrap gap-2",
                children: [/* @__PURE__ */ jsx(ActionButton, {
                  intent: "generateNoNoteMode",
                  prospectId: prospect.id,
                  label: "Generate no-note mode",
                  icon: /* @__PURE__ */ jsx(RefreshCw, {
                    size: 16
                  }),
                  primary: prospect.outreach_mode !== "no_note"
                }), /* @__PURE__ */ jsx(ActionButton, {
                  intent: "switchToWithNoteMode",
                  prospectId: prospect.id,
                  label: "Use with-note mode",
                  icon: /* @__PURE__ */ jsx(Send, {
                    size: 16
                  }),
                  primary: prospect.outreach_mode === "no_note"
                })]
              })]
            })
          }) : null, /* @__PURE__ */ jsx(CollapsibleSection, {
            title: "Brief",
            detail: "Topic, preparation notes and shared URL.",
            defaultOpen: !archiveMode,
            children: /* @__PURE__ */ jsxs("div", {
              className: "mt-4 grid gap-4 md:grid-cols-2",
              children: [/* @__PURE__ */ jsxs(Form, {
                method: "post",
                className: "border-t border-stone-200 pt-3",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "hidden",
                  name: "intent",
                  value: "updateBriefStrategy"
                }), /* @__PURE__ */ jsx("input", {
                  type: "hidden",
                  name: "prospectId",
                  value: prospect.id
                }), /* @__PURE__ */ jsx("label", {
                  className: "text-sm font-semibold",
                  htmlFor: "briefTopic",
                  children: "Topic"
                }), /* @__PURE__ */ jsx("input", {
                  id: "briefTopic",
                  name: "briefTopic",
                  defaultValue: prospect.brief_topic || "",
                  required: true,
                  maxLength: 80,
                  placeholder: "Narrative risk",
                  className: "mt-2 min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
                }), /* @__PURE__ */ jsx("label", {
                  className: "mt-3 block text-sm font-semibold",
                  htmlFor: "briefPreparation",
                  children: "Preparation notes"
                }), /* @__PURE__ */ jsx("textarea", {
                  id: "briefPreparation",
                  name: "briefPreparation",
                  defaultValue: prospect.preparation_notes || "",
                  rows: 4,
                  placeholder: "Why this subject fits the profile, source signal, angle to prepare...",
                  className: "mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
                }), /* @__PURE__ */ jsxs("button", {
                  className: "mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
                  children: [/* @__PURE__ */ jsx(Save, {
                    size: 16
                  }), "Save brief theme"]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "border-t border-stone-200 pt-3",
                children: [/* @__PURE__ */ jsx("p", {
                  className: "text-sm font-semibold",
                  children: "Shared URL"
                }), prospect.shared_url ? /* @__PURE__ */ jsxs("a", {
                  className: "mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700",
                  href: prospect.shared_url,
                  target: "_blank",
                  rel: "noreferrer",
                  children: [prospect.shared_url, /* @__PURE__ */ jsx(ExternalLink, {
                    size: 14
                  })]
                }) : /* @__PURE__ */ jsxs(Form, {
                  method: "post",
                  className: "mt-2 grid gap-2 sm:grid-cols-[1fr_auto]",
                  children: [/* @__PURE__ */ jsx("input", {
                    type: "hidden",
                    name: "intent",
                    value: "addBriefUrl"
                  }), /* @__PURE__ */ jsx("input", {
                    type: "hidden",
                    name: "prospectId",
                    value: prospect.id
                  }), /* @__PURE__ */ jsx("input", {
                    name: "sharedUrl",
                    type: "url",
                    required: true,
                    placeholder: "https://tempolis.com/share/...",
                    className: "min-h-10 rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
                  }), /* @__PURE__ */ jsxs("button", {
                    className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
                    children: [/* @__PURE__ */ jsx(Link, {
                      size: 16
                    }), "Add URL"]
                  })]
                })]
              })]
            })
          }), /* @__PURE__ */ jsxs(CollapsibleSection, {
            title: "Messages",
            detail: prospect.source_channel === "twitter" ? "Copy exact Twitter/X copy." : "Copy exact LinkedIn copy.",
            defaultOpen: !archiveMode,
            children: [prospect.source_channel === "linkedin" ? /* @__PURE__ */ jsx("div", {
              className: "mt-4 flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3",
              children: /* @__PURE__ */ jsx(ActionButton, {
                intent: "regenerateSaferCopy",
                prospectId: prospect.id,
                label: "Regenerate safer copy",
                icon: /* @__PURE__ */ jsx(RefreshCw, {
                  size: 16
                })
              })
            }) : null, prospect.source_channel === "twitter" ? /* @__PURE__ */ jsxs("div", {
              className: "mt-4 grid gap-3",
              children: [/* @__PURE__ */ jsx(MessageEditor, {
                prospectId: prospect.id,
                title: "Twitter/X DM",
                type: "twitter_dm",
                content: prospect.twitter_dm_message,
                locked: Boolean(prospect.twitter_contacted_date)
              }), /* @__PURE__ */ jsx(MessageEditor, {
                prospectId: prospect.id,
                title: "Twitter/X follow-up J+2",
                type: "twitter_followup",
                content: prospect.twitter_followup_message,
                locked: Boolean(prospect.twitter_followup_sent_date)
              })]
            }) : /* @__PURE__ */ jsxs("div", {
              className: "mt-4 grid gap-3",
              children: [showConnectionNote ? /* @__PURE__ */ jsx(MessageEditor, {
                prospectId: prospect.id,
                title: "Connection note",
                type: "connection",
                content: prospect.connection_message,
                locked: connectionLocked
              }) : /* @__PURE__ */ jsx(NoNoteCallout, {}), /* @__PURE__ */ jsx(MessageEditor, {
                prospectId: prospect.id,
                title: prospect.outreach_mode === "no_note" ? "First message after acceptance" : "After acceptance",
                type: prospect.outreach_mode === "no_note" ? "report_no_note" : "report",
                content: prospect.post_acceptance_message,
                locked: reportLocked
              }), /* @__PURE__ */ jsx(MessageEditor, {
                prospectId: prospect.id,
                title: "Follow-up J+2",
                type: "followup",
                content: prospect.followup_message
              })]
            })]
          }), /* @__PURE__ */ jsxs("section", {
            className: "rounded-lg border border-stone-300 bg-white p-5",
            children: [/* @__PURE__ */ jsx(SectionTitle, {
              title: "Reply handling",
              detail: "If Marc replies, paste it here and answer instead of following up."
            }), /* @__PURE__ */ jsx(ReplyPanel, {
              prospect,
              replies
            })]
          }), /* @__PURE__ */ jsx(CollapsibleSection, {
            title: "Internal note",
            detail: "Small private CRM note.",
            defaultOpen: Boolean(prospect.notes),
            children: /* @__PURE__ */ jsxs(Form, {
              method: "post",
              className: "mt-4 border-t border-stone-200 pt-3",
              children: [/* @__PURE__ */ jsx("input", {
                type: "hidden",
                name: "intent",
                value: "updateProspectNotes"
              }), /* @__PURE__ */ jsx("input", {
                type: "hidden",
                name: "prospectId",
                value: prospect.id
              }), prospect.notes ? /* @__PURE__ */ jsx("div", {
                className: "mb-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700",
                children: /* @__PURE__ */ jsx("p", {
                  className: "whitespace-pre-wrap",
                  children: prospect.notes
                })
              }) : null, /* @__PURE__ */ jsx("label", {
                className: "text-sm font-semibold",
                htmlFor: "notes",
                children: "Note"
              }), /* @__PURE__ */ jsx("textarea", {
                id: "notes",
                name: "notes",
                defaultValue: prospect.notes || "",
                rows: 3,
                placeholder: "Tiny internal note, context, next angle...",
                className: "mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-teal-700"
              }), /* @__PURE__ */ jsxs("button", {
                className: "mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium hover:border-teal-700",
                children: [/* @__PURE__ */ jsx(Save, {
                  size: 14
                }), "Save note"]
              })]
            })
          }), /* @__PURE__ */ jsxs("section", {
            className: "rounded-lg border border-stone-300 bg-white p-5",
            children: [/* @__PURE__ */ jsx(SectionTitle, {
              title: "Past and future",
              detail: "Task history for this prospect."
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-4 grid gap-3",
              children: tasks.length ? tasks.map((task) => /* @__PURE__ */ jsx(TaskRow, {
                task,
                today
              }, task.id)) : /* @__PURE__ */ jsx(EmptyState, {})
            })]
          })]
        }), /* @__PURE__ */ jsxs("aside", {
          className: "h-fit rounded-lg border border-stone-300 bg-white p-5 lg:sticky lg:top-6",
          children: [/* @__PURE__ */ jsx(SectionTitle, {
            title: "Timeline",
            detail: "Actions already logged."
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-4 space-y-4",
            children: events.length ? events.map((event) => /* @__PURE__ */ jsxs("div", {
              className: "border-l-2 border-teal-700 pl-3",
              children: [/* @__PURE__ */ jsx("p", {
                className: "font-medium",
                children: event.type
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-sm text-stone-600",
                children: event.note
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-xs text-stone-500",
                children: event.happened_at
              })]
            }, event.id)) : /* @__PURE__ */ jsx(EmptyState, {})
          }), doneTasks.length ? /* @__PURE__ */ jsxs("div", {
            className: "mt-6 border-t border-stone-200 pt-4",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "font-semibold",
              children: "Completed tasks"
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-3 grid gap-2",
              children: doneTasks.map((task) => /* @__PURE__ */ jsx(TaskRow, {
                task,
                today,
                compact: true
              }, task.id))
            })]
          }) : null]
        })]
      })]
    })
  });
});
function OpenTask({
  task,
  prospect,
  today
}) {
  const overdue = task.due_date && task.due_date < today;
  return /* @__PURE__ */ jsx("div", {
    className: `rounded-lg border bg-stone-50 p-4 ${overdue ? "border-amber-500" : "border-stone-200"}`,
    children: /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "font-semibold",
          children: task.title
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-stone-600",
          children: task.due_date ? `Due ${task.due_date}` : "No due date"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex flex-wrap gap-2",
        children: taskActions(task, prospect)
      })]
    })
  });
}
function taskActions(task, prospect) {
  if (task.type === "send_connection") {
    if (prospect.outreach_mode === "no_note") {
      return /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(ActionButton, {
          intent: "markConnectionSentWithoutNote",
          prospectId: prospect.id,
          label: "Sent without note",
          icon: /* @__PURE__ */ jsx(UserCheck, {
            size: 16
          }),
          primary: true
        }), /* @__PURE__ */ jsx(CopyButton, {
          label: "Copy note",
          value: prospect.connection_message || ""
        }), /* @__PURE__ */ jsx(ActionButton, {
          intent: "markConnectionSentWithNote",
          prospectId: prospect.id,
          label: "Sent with note",
          icon: /* @__PURE__ */ jsx(Send, {
            size: 16
          })
        })]
      });
    }
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy note",
        value: prospect.connection_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markConnectionSentWithNote",
        prospectId: prospect.id,
        label: "Sent with note",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        primary: true
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markConnectionSentWithoutNote",
        prospectId: prospect.id,
        label: "Sent without note",
        icon: /* @__PURE__ */ jsx(UserCheck, {
          size: 16
        })
      })]
    });
  }
  if (task.type === "watch_acceptance") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(ActionButton, {
        intent: "markAccepted",
        prospectId: prospect.id,
        label: "Mark accepted",
        icon: /* @__PURE__ */ jsx(UserCheck, {
          size: 16
        }),
        primary: true
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "archiveDeclined",
        prospectId: prospect.id,
        label: "Archive declined",
        icon: /* @__PURE__ */ jsx(Archive, {
          size: 16
        }),
        danger: true
      })]
    });
  }
  if (task.type === "send_report") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy message",
        value: prospect.post_acceptance_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markReportSent",
        prospectId: prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      })]
    });
  }
  if (task.type === "send_followup") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy follow-up",
        value: prospect.followup_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markFollowupSent",
        prospectId: prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(CalendarCheck, {
          size: 16
        }),
        primary: true
      })]
    });
  }
  if (task.type === "send_twitter_dm") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy DM",
        value: prospect.twitter_dm_message || ""
      }), /* @__PURE__ */ jsx(ActionLink, {
        href: prospect.twitter_url || prospect.profile_url,
        label: "Open X",
        icon: /* @__PURE__ */ jsx(AtSign, {
          size: 16
        })
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markTwitterDmSent",
        prospectId: prospect.id,
        label: "Mark DM sent",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        primary: true
      })]
    });
  }
  if (task.type === "send_twitter_followup") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy follow-up",
        value: prospect.twitter_followup_message || ""
      }), /* @__PURE__ */ jsx(ActionLink, {
        href: prospect.twitter_url || prospect.profile_url,
        label: "Open X",
        icon: /* @__PURE__ */ jsx(AtSign, {
          size: 16
        })
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markTwitterFollowupSent",
        prospectId: prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(CalendarCheck, {
          size: 16
        }),
        primary: true
      })]
    });
  }
  return null;
}
function TaskRow({
  task,
  today,
  compact = false
}) {
  const overdue = task.status === "open" && task.due_date && task.due_date < today;
  return /* @__PURE__ */ jsxs("div", {
    className: `rounded-lg border bg-stone-50 ${compact ? "p-3" : "p-4"} ${overdue ? "border-amber-500" : "border-stone-200"}`,
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
      children: [/* @__PURE__ */ jsx("p", {
        className: "font-medium",
        children: task.title
      }), /* @__PURE__ */ jsx(Badge, {
        tone: task.status === "open" ? "blue" : "green",
        children: task.status
      })]
    }), /* @__PURE__ */ jsxs("p", {
      className: "mt-1 text-sm text-stone-600",
      children: [task.type, " ", task.due_date ? `· due ${task.due_date}` : "", " ", task.completed_at ? `· completed ${task.completed_at}` : ""]
    })]
  });
}
function SectionTitle({
  title,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
    children: [/* @__PURE__ */ jsx("h2", {
      className: "text-xl font-semibold",
      children: title
    }), /* @__PURE__ */ jsx("p", {
      className: "text-sm text-stone-600",
      children: detail
    })]
  });
}
function CollapsibleSection({
  title,
  detail,
  defaultOpen,
  children
}) {
  return /* @__PURE__ */ jsxs("details", {
    className: "rounded-lg border border-stone-300 bg-white p-5",
    open: defaultOpen,
    children: [/* @__PURE__ */ jsx("summary", {
      className: "cursor-pointer list-none",
      children: /* @__PURE__ */ jsx(SectionTitle, {
        title,
        detail
      })
    }), children]
  });
}
function MessageEditor({
  prospectId,
  title,
  type,
  content,
  locked = false
}) {
  if (!content) return null;
  if (locked) return /* @__PURE__ */ jsx(ReadonlyMessage, {
    title,
    content
  });
  return /* @__PURE__ */ jsxs(Form, {
    method: "post",
    className: "border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "intent",
      value: "updateMessage"
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "prospectId",
      value: prospectId
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "messageType",
      value: type
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold",
        children: title
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex gap-2",
        children: [/* @__PURE__ */ jsx(CopyButton, {
          label: "Copy",
          value: content,
          compact: true
        }), /* @__PURE__ */ jsxs("button", {
          className: "inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium text-stone-800 hover:border-teal-700",
          children: [/* @__PURE__ */ jsx(Save, {
            size: 14
          }), "Save"]
        })]
      })]
    }), /* @__PURE__ */ jsx("textarea", {
      name: "messageContent",
      defaultValue: content,
      rows: Math.max(3, Math.min(8, content.split("\n").length + 1)),
      className: "mt-2 min-h-28 w-full resize-y rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 outline-none focus:border-teal-700"
    })]
  });
}
function ReadonlyMessage({
  title,
  content
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-semibold",
          children: title
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-xs font-medium text-stone-500",
          children: "Sent. Locked to preserve history."
        })]
      }), /* @__PURE__ */ jsx(CopyButton, {
        label: "Copy",
        value: content,
        compact: true
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700",
      children: content
    })]
  });
}
function ReplyPanel({
  prospect,
  replies
}) {
  const latest = replies[0];
  return /* @__PURE__ */ jsxs("div", {
    className: "mt-4 grid gap-4",
    children: [latest ? /* @__PURE__ */ jsx(ReplyEditor, {
      prospect,
      reply: latest
    }) : null, /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
      children: [/* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "intent",
        value: "addProspectReply"
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "prospectId",
        value: prospect.id
      }), /* @__PURE__ */ jsx("label", {
        className: "text-sm font-semibold",
        htmlFor: "inboundContent",
        children: "Prospect reply"
      }), /* @__PURE__ */ jsx("textarea", {
        id: "inboundContent",
        name: "inboundContent",
        rows: 4,
        required: true,
        placeholder: "Paste the LinkedIn reply here...",
        className: "mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
      }), /* @__PURE__ */ jsx("label", {
        className: "mt-3 block text-sm font-semibold",
        htmlFor: "suggestedResponse",
        children: "Draft response"
      }), /* @__PURE__ */ jsx("textarea", {
        id: "suggestedResponse",
        name: "suggestedResponse",
        rows: 4,
        placeholder: "Optional. Leave empty and the app will create a lightweight fallback.",
        className: "mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
      }), /* @__PURE__ */ jsxs("button", {
        className: "mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-3 font-medium text-white hover:bg-teal-800",
        children: [/* @__PURE__ */ jsx(MessageSquareReply, {
          size: 16
        }), "Save reply"]
      })]
    })]
  });
}
function ReplyEditor({
  prospect,
  reply
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-semibold",
          children: "Latest reply"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-xs text-stone-500",
          children: reply.created_at
        })]
      }), reply.sent_at ? /* @__PURE__ */ jsxs(Badge, {
        tone: "green",
        children: ["sent ", reply.sent_at]
      }) : /* @__PURE__ */ jsx(Badge, {
        tone: "blue",
        children: "response draft"
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-3 whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700",
      children: reply.inbound_content
    }), /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "mt-3",
      children: [/* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "intent",
        value: "updateReplyResponse"
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "prospectId",
        value: prospect.id
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "replyId",
        value: reply.id
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-between gap-3",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-semibold",
          children: "Response to send"
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex gap-2",
          children: [/* @__PURE__ */ jsx(CopyButton, {
            label: "Copy",
            value: reply.suggested_response || "",
            compact: true
          }), /* @__PURE__ */ jsxs("button", {
            className: "inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium text-stone-800 hover:border-teal-700",
            children: [/* @__PURE__ */ jsx(Save, {
              size: 14
            }), "Save"]
          })]
        })]
      }), /* @__PURE__ */ jsx("textarea", {
        name: "suggestedResponse",
        defaultValue: reply.suggested_response || "",
        rows: 5,
        required: true,
        disabled: Boolean(reply.sent_at),
        className: "mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 disabled:bg-stone-100 disabled:text-stone-500"
      })]
    }), !reply.sent_at ? /* @__PURE__ */ jsx(ActionButton, {
      intent: "markReplySent",
      prospectId: prospect.id,
      label: "Mark response sent",
      icon: /* @__PURE__ */ jsx(Check, {
        size: 16
      }),
      primary: true,
      extra: {
        replyId: String(reply.id)
      }
    }) : null]
  });
}
function NoNoteCallout() {
  return /* @__PURE__ */ jsxs("div", {
    className: "border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm font-semibold",
      children: "Connection note"
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600",
      children: "No custom note was sent. Use the first message after acceptance instead."
    })]
  });
}
function Badge({
  children,
  tone = "green"
}) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return /* @__PURE__ */ jsx("span", {
    className: `inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`,
    children
  });
}
function outreachModeLabel(prospect) {
  if (prospect.source_channel === "twitter") return "Twitter/X";
  if (prospect.status === "to_contact") return "note optional";
  return prospect.outreach_mode === "no_note" ? "no note" : "with note";
}
function ActionButton({
  intent,
  prospectId,
  label,
  icon,
  primary = false,
  danger = false,
  extra
}) {
  const className = primary ? "border-teal-700 bg-teal-700 text-white hover:bg-teal-800" : danger ? "border-stone-300 bg-white text-red-700 hover:border-red-300" : "border-stone-300 bg-white text-stone-800 hover:border-teal-700";
  return /* @__PURE__ */ jsxs(Form, {
    method: "post",
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "intent",
      value: intent
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "prospectId",
      value: prospectId
    }), extra ? Object.entries(extra).map(([key, value]) => /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: key,
      value
    }, key)) : null, /* @__PURE__ */ jsxs("button", {
      className: `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${className}`,
      children: [icon, label]
    })]
  });
}
function DeleteProspectButton({
  prospect
}) {
  return /* @__PURE__ */ jsxs(Form, {
    method: "post",
    onSubmit: (event) => {
      const confirmed = window.confirm(`Delete ${prospect.name} from the outreach database? This cannot be undone.`);
      if (!confirmed) event.preventDefault();
    },
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "intent",
      value: "deleteProspect"
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "prospectId",
      value: prospect.id
    }), /* @__PURE__ */ jsx("button", {
      className: "inline-flex min-h-8 items-center justify-center rounded-full bg-red-50 px-2.5 text-xs font-semibold text-red-800 hover:bg-red-100",
      children: "Delete"
    })]
  });
}
function ArchiveControls({
  prospect
}) {
  if (prospect.status === "archived") {
    return /* @__PURE__ */ jsx(ActionButton, {
      intent: "reopenConversation",
      prospectId: prospect.id,
      label: "Reopen",
      icon: /* @__PURE__ */ jsx(Undo2, {
        size: 14
      })
    });
  }
  return /* @__PURE__ */ jsx(ActionButton, {
    intent: "archiveProspect",
    prospectId: prospect.id,
    label: "Archive",
    icon: /* @__PURE__ */ jsx(Archive, {
      size: 14
    }),
    danger: true
  });
}
function CopyButton({
  label,
  value,
  compact = false
}) {
  return /* @__PURE__ */ jsxs("button", {
    type: "button",
    className: `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700 ${compact ? "min-h-8 px-2" : ""}`,
    onClick: () => navigator.clipboard.writeText(value),
    children: [/* @__PURE__ */ jsx(Clipboard, {
      size: 16
    }), label]
  });
}
function ActionLink({
  href,
  label,
  icon
}) {
  return /* @__PURE__ */ jsxs("a", {
    href,
    target: "_blank",
    rel: "noreferrer",
    className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700",
    children: [icon, label]
  });
}
function EmptyState() {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500",
    children: "Nothing here."
  });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: prospect_$id,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Mh2gPbg1.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-ChxmhaQW.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/createLucideIcon-DE2VjKt3.js"], "css": ["/assets/root-D-ZheLr8.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-Cl6tDvw9.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/search-D8C4gO1s.js", "/assets/createLucideIcon-DE2VjKt3.js", "/assets/user-check-ClwYYjaz.js", "/assets/plus-B3ZS8NII.js", "/assets/send-BWLy2b3j.js", "/assets/external-link-CoUt5864.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/batch": { "id": "routes/batch", "parentId": "root", "path": "batch", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/batch-Dsp8k5oY.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/arrow-left-etJQR8_U.js", "/assets/plus-B3ZS8NII.js", "/assets/trash-2-BA1jMblW.js", "/assets/send-BWLy2b3j.js", "/assets/createLucideIcon-DE2VjKt3.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/twitter": { "id": "routes/twitter", "parentId": "root", "path": "twitter", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/twitter-DK_ye6Ff.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/arrow-left-etJQR8_U.js", "/assets/plus-B3ZS8NII.js", "/assets/trash-2-BA1jMblW.js", "/assets/send-BWLy2b3j.js", "/assets/createLucideIcon-DE2VjKt3.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/discover": { "id": "routes/discover", "parentId": "root", "path": "discover", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/discover-zkgif3XM.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/arrow-left-etJQR8_U.js", "/assets/createLucideIcon-DE2VjKt3.js", "/assets/search-D8C4gO1s.js", "/assets/external-link-CoUt5864.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/search": { "id": "routes/search", "parentId": "root", "path": "search", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/search-DSkMWtVc.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/arrow-left-etJQR8_U.js", "/assets/search-D8C4gO1s.js", "/assets/external-link-CoUt5864.js", "/assets/createLucideIcon-DE2VjKt3.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.dashboard": { "id": "routes/api.extension.dashboard", "parentId": "root", "path": "api/extension/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.dashboard-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.connection-status": { "id": "routes/api.extension.connection-status", "parentId": "root", "path": "api/extension/connection-status", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.connection-status-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.prospect": { "id": "routes/api.extension.prospect", "parentId": "root", "path": "api/extension/prospect", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.prospect-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/prospect.$id": { "id": "routes/prospect.$id", "parentId": "root", "path": "prospects/:id", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/prospect._id-oSTi9XmJ.js", "imports": ["/assets/chunk-OE4NN4TA-DT7sb4le.js", "/assets/arrow-left-etJQR8_U.js", "/assets/external-link-CoUt5864.js", "/assets/createLucideIcon-DE2VjKt3.js", "/assets/send-BWLy2b3j.js", "/assets/user-check-ClwYYjaz.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-c8abc89b.js", "version": "c8abc89b", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": true, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/batch": {
    id: "routes/batch",
    parentId: "root",
    path: "batch",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/twitter": {
    id: "routes/twitter",
    parentId: "root",
    path: "twitter",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/discover": {
    id: "routes/discover",
    parentId: "root",
    path: "discover",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/search": {
    id: "routes/search",
    parentId: "root",
    path: "search",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.extension.dashboard": {
    id: "routes/api.extension.dashboard",
    parentId: "root",
    path: "api/extension/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.extension.connection-status": {
    id: "routes/api.extension.connection-status",
    parentId: "root",
    path: "api/extension/connection-status",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/api.extension.prospect": {
    id: "routes/api.extension.prospect",
    parentId: "root",
    path: "api/extension/prospect",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/prospect.$id": {
    id: "routes/prospect.$id",
    parentId: "root",
    path: "prospects/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
