import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, useRouteError, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, redirect, useLocation, useNavigate, NavLink, useLoaderData, Link as Link$1, Form, useSearchParams, useActionData, useNavigation, useParams, data } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as React from "react";
import { useContext, createContext, forwardRef, createElement, useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Toaster as Toaster$1, toast } from "sonner";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as TabsPrimitive from "@radix-ui/react-tabs";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve2, reject) => {
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
          resolve2(
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
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn("flex flex-col gap-1.5 px-6 pt-6", className),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("font-semibold leading-none", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6 pb-6", className),
      ...props
    }
  );
}
const themeScript = `(function(){try{var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;
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
          __html: themeScript
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-background text-foreground antialiased",
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
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
    className: "min-h-screen bg-background px-6 py-12",
    children: /* @__PURE__ */ jsxs(Card, {
      className: "mx-auto max-w-2xl",
      children: [/* @__PURE__ */ jsxs(CardHeader, {
        children: [/* @__PURE__ */ jsx(CardDescription, {
          className: "text-xs font-semibold uppercase tracking-wide text-primary",
          children: "Outreach app"
        }), /* @__PURE__ */ jsx(CardTitle, {
          className: "text-3xl",
          children: status
        })]
      }), /* @__PURE__ */ jsx(CardContent, {
        children: /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground",
          children: message
        })
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
function loader$e() {
  return redirect("/tempolis");
}
function action$7() {
  return redirect("/tempolis");
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$7,
  loader: loader$e
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
const __iconNode$y = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
];
const Archive = createLucideIcon("archive", __iconNode$y);
const __iconNode$x = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$x);
const __iconNode$w = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", key: "7n84p3" }]
];
const AtSign = createLucideIcon("at-sign", __iconNode$w);
const __iconNode$v = [
  ["path", { d: "M12 18V5", key: "adv99a" }],
  ["path", { d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", key: "1e3is1" }],
  ["path", { d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5", key: "1gqd8o" }],
  ["path", { d: "M17.997 5.125a4 4 0 0 1 2.526 5.77", key: "iwvgf7" }],
  ["path", { d: "M18 18a4 4 0 0 0 2-7.464", key: "efp6ie" }],
  ["path", { d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517", key: "1gq6am" }],
  ["path", { d: "M6 18a4 4 0 0 1-2-7.464", key: "k1g0md" }],
  ["path", { d: "M6.003 5.125a4 4 0 0 0-2.526 5.77", key: "q97ue3" }]
];
const Brain = createLucideIcon("brain", __iconNode$v);
const __iconNode$u = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }]
];
const CalendarCheck = createLucideIcon("calendar-check", __iconNode$u);
const __iconNode$t = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$t);
const __iconNode$s = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$s);
const __iconNode$r = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$r);
const __iconNode$q = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$q);
const __iconNode$p = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ]
];
const Clipboard = createLucideIcon("clipboard", __iconNode$p);
const __iconNode$o = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$o);
const __iconNode$n = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      key: "9ktpf1"
    }
  ]
];
const Compass = createLucideIcon("compass", __iconNode$n);
const __iconNode$m = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$m);
const __iconNode$l = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$l);
const __iconNode$k = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$k);
const __iconNode$j = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode$j);
const __iconNode$i = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$i);
const __iconNode$h = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode$h);
const __iconNode$g = [
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
const MessageSquareReply = createLucideIcon("message-square-reply", __iconNode$g);
const __iconNode$f = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$f);
const __iconNode$e = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
const Moon = createLucideIcon("moon", __iconNode$e);
const __iconNode$d = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$d);
const __iconNode$c = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$c);
const __iconNode$b = [
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
const Save = createLucideIcon("save", __iconNode$b);
const __iconNode$a = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode$a);
const __iconNode$9 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$9);
const __iconNode$8 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$8);
const __iconNode$7 = [
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
const Sun = createLucideIcon("sun", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode$1);
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        "data-slot": "button",
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
function Sheet(props) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger(props) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetPortal(props) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      SheetPrimitive.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx(X, { className: "size-4" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function DropdownMenu(props) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger(props) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Trigger, { "data-slot": "dropdown-menu-trigger", ...props });
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className
      ),
      ...props
    }
  );
}
const STORAGE_KEY = "theme";
function resolve(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
function apply(theme) {
  const resolved = resolve(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
function useTheme() {
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? "system";
    setThemeState(stored);
    apply(stored);
    if (stored === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, []);
  const setTheme = useCallback((next) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }, []);
  return { theme, setTheme };
}
const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor }
];
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Current = (options.find((o) => o.value === theme) ?? options[2]).icon;
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "w-full justify-start gap-2", children: [
      /* @__PURE__ */ jsx(Current, { className: "size-4" }),
      /* @__PURE__ */ jsx("span", { children: "Theme" })
    ] }) }),
    /* @__PURE__ */ jsx(DropdownMenuContent, { align: "start", side: "top", className: "w-40", children: options.map((option) => {
      const Icon2 = option.icon;
      return /* @__PURE__ */ jsxs(
        DropdownMenuItem,
        {
          onSelect: () => setTheme(option.value),
          className: theme === option.value ? "bg-accent" : void 0,
          children: [
            /* @__PURE__ */ jsx(Icon2, { className: "size-4" }),
            option.label
          ]
        },
        option.value
      );
    }) })
  ] });
}
const items = [
  { to: "", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings }
];
function NavLinkItem({ item, basePath, onNavigate }) {
  const Icon2 = item.icon;
  return /* @__PURE__ */ jsxs(
    NavLink,
    {
      to: `${basePath}${item.to}`,
      end: item.end,
      onClick: onNavigate,
      className: ({ isActive }) => cn(
        "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      ),
      children: [
        /* @__PURE__ */ jsx(Icon2, { className: "size-4" }),
        /* @__PURE__ */ jsx("span", { children: item.label })
      ]
    }
  );
}
function SidebarContent({
  workspaces,
  activeWorkspace,
  onNavigate
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();
  const basePath = `/${activeWorkspace.slug}`;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-2 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex h-10 items-center gap-2 px-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold", children: activeInitial }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "truncate text-sm font-semibold", children: [
          activeWorkspace.product_name,
          " Outreach"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-[11px] text-sidebar-foreground/55", children: "Internal CRM" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-2 py-2", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "workspace-switcher", className: "sr-only", children: "Workspace" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          id: "workspace-switcher",
          name: "slug",
          defaultValue: activeWorkspace.slug,
          onChange: (event) => {
            navigate(workspaceSwitchPath(event.currentTarget.value, location.pathname, location.search, workspaces));
          },
          className: "h-9 w-full rounded-md border border-sidebar-border bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40",
          children: workspaces.map((workspace) => /* @__PURE__ */ jsx("option", { value: workspace.slug, children: workspace.name }, workspace.slug))
        }
      )
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "mt-2 flex flex-1 flex-col gap-0.5", children: items.map((item) => /* @__PURE__ */ jsx(NavLinkItem, { item, basePath, onNavigate }, item.to || "dashboard")) }),
    /* @__PURE__ */ jsx("div", { className: "mt-auto border-t pt-2", children: /* @__PURE__ */ jsx(ThemeToggle, {}) })
  ] });
}
function workspaceSwitchPath(slug, pathname, search2, workspaces) {
  const parts = pathname.split("/").filter(Boolean);
  const workspaceSlugs = new Set(workspaces.map((workspace) => workspace.slug));
  const rest = parts.length > 0 && workspaceSlugs.has(parts[0]) ? parts.slice(1) : parts;
  const safeRest = rest[0] === "prospects" && rest.length > 1 ? ["prospects"] : rest;
  return `/${[slug, ...safeRest].join("/")}${search2}`;
}
function AppShell({
  children,
  workspaces,
  activeWorkspace
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeInitial = (activeWorkspace.product_name || activeWorkspace.name || "?").slice(0, 1).toUpperCase();
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("aside", { className: "hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block", children: /* @__PURE__ */ jsx("div", { className: "sticky top-0 h-screen", children: /* @__PURE__ */ jsx(SidebarContent, { workspaces, activeWorkspace }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur lg:hidden", children: [
        /* @__PURE__ */ jsxs(Sheet, { open: mobileOpen, onOpenChange: setMobileOpen, children: [
          /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Open menu", children: /* @__PURE__ */ jsx(Menu, { className: "size-5" }) }) }),
          /* @__PURE__ */ jsx(SheetContent, { side: "left", className: "w-60 p-0", children: /* @__PURE__ */ jsx(
            SidebarContent,
            {
              workspaces,
              activeWorkspace,
              onNavigate: () => setMobileOpen(false)
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold", children: activeInitial }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold", children: [
            activeWorkspace.product_name,
            " Outreach"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1", children })
    ] })
  ] });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      },
      ...props
    }
  );
};
const appDir$1 = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(appDir$1, "..", "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");
let database;
let databaseReady;
let databaseUsesEmbeddedReplica = false;
let syncInProgress = null;
async function getWorkspaces() {
  return await all("SELECT * FROM workspaces ORDER BY name");
}
async function getWorkspaceBySlug(slug) {
  return await one("SELECT * FROM workspaces WHERE slug = ?", [slug]);
}
async function getActiveWorkspace() {
  const fallback = await one("SELECT * FROM workspaces WHERE slug = 'tempolis'");
  if (!fallback) throw new Error("Default workspace is missing.");
  return fallback;
}
async function requireWorkspace(slug) {
  const workspace = slug ? await getWorkspaceBySlug(slug) : null;
  if (!workspace) {
    throw new Response("Workspace not found", { status: 404, statusText: "Workspace Not Found" });
  }
  return workspace;
}
async function getWorkspaceShellData(slug) {
  const [workspaces, activeWorkspace] = await Promise.all([getWorkspaces(), requireWorkspace(slug)]);
  return { workspaces, activeWorkspace };
}
async function getWorkspaceDocs(workspaceId) {
  return await all("SELECT * FROM workspace_docs WHERE workspace_id = ? ORDER BY type", [workspaceId]);
}
async function getActivePromptTemplate(workspaceId, channel, purpose) {
  const template = await one(`
    SELECT *
    FROM prompt_templates
    WHERE workspace_id = ? AND channel = ? AND purpose = ? AND active = 1
    ORDER BY version DESC, id DESC
  `, [workspaceId, channel, purpose]);
  if (!template) throw new Error(`Missing active prompt template for ${channel}/${purpose}.`);
  return template;
}
async function recordPromptRun(input) {
  await run(`
    INSERT INTO prompt_runs (workspace_id, prompt_template_id, prospect_id, input_json, output_json, model)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    input.workspaceId,
    input.promptTemplateId || null,
    input.prospectId || null,
    JSON.stringify(input.inputJson),
    JSON.stringify(input.outputJson),
    input.model
  ]);
}
async function getWorkspaceSettings(workspaceId) {
  const [workspace, docs, prompts] = await Promise.all([
    one("SELECT * FROM workspaces WHERE id = ?", [workspaceId]),
    getWorkspaceDocs(workspaceId),
    all(`
      SELECT *
      FROM prompt_templates
      WHERE workspace_id = ? AND active = 1
      ORDER BY channel, purpose
    `, [workspaceId])
  ]);
  if (!workspace) throw new Error("Workspace not found.");
  return { workspace, docs, prompts };
}
async function runWorkspaceSettingsAction(formData, workspaceId) {
  const intent = String(formData.get("intent") || "");
  if (intent === "updateWorkspace") {
    const name = String(formData.get("name") || "").trim();
    const productName = String(formData.get("productName") || "").trim();
    const defaultLanguage = String(formData.get("defaultLanguage") || "en").trim() || "en";
    if (!name || !productName) throw new Error("Workspace name and product name are required.");
    await run(`
      UPDATE workspaces
      SET name = ?, product_name = ?, default_language = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, productName, defaultLanguage, workspaceId]);
    return;
  }
  if (intent === "updateDoc") {
    const docId = Number(formData.get("docId"));
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();
    if (!docId || !title) throw new Error("Doc id and title are required.");
    await run(`
      UPDATE workspace_docs
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND workspace_id = ?
    `, [title, content, docId, workspaceId]);
    return;
  }
  if (intent === "updatePrompt") {
    const promptId = Number(formData.get("promptId"));
    const name = String(formData.get("name") || "").trim();
    const systemPrompt = String(formData.get("systemPrompt") || "").trim();
    const userPrompt = String(formData.get("userPrompt") || "").trim();
    const model = String(formData.get("model") || "").trim();
    const temperature = Number(formData.get("temperature") || "0.2");
    const existing = await one("SELECT * FROM prompt_templates WHERE id = ? AND workspace_id = ?", [promptId, workspaceId]);
    if (!existing) throw new Error("Prompt template not found.");
    if (!name || !systemPrompt || !userPrompt || !model) throw new Error("Prompt fields are required.");
    await run("UPDATE prompt_templates SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = ? AND channel = ? AND purpose = ?", [workspaceId, existing.channel, existing.purpose]);
    await run(`
      INSERT INTO prompt_templates (
        workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [workspaceId, existing.channel, existing.purpose, name, systemPrompt, userPrompt, model, Number.isFinite(temperature) ? temperature : 0.2, existing.version + 1]);
    return;
  }
  throw new Error(`Unknown settings action ${intent}`);
}
async function findProspectByProfileUrl(profileUrl, workspaceId) {
  const normalized = normalizeLinkedInUrl$1(profileUrl);
  const row = workspaceId ? await one("SELECT id FROM prospects WHERE profile_url = ? AND workspace_id = ?", [normalized, workspaceId]) : await one("SELECT id FROM prospects WHERE profile_url = ?", [normalized]);
  return row?.id || null;
}
async function setProspectOutreachPreference(id, mode) {
  const today = todayIso();
  await run("UPDATE prospects SET outreach_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [mode, id]);
  await addEvent(id, mode === "no_note" ? "no_note_mode_selected" : "with_note_mode_selected", `Extension selected ${mode === "no_note" ? "no-note" : "with-note"} outreach mode.`, today);
}
async function getExtensionDashboard(workspaceId) {
  const workspace = workspaceId ? await one("SELECT * FROM workspaces WHERE id = ?", [workspaceId]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const pendingCheckDelayHours = 4;
  const pendingConnections = await all(`
    SELECT id, name, position, profile_url, outreach_mode, connection_sent_date, pending_checked_at, connection_last_state
    FROM prospects
    WHERE status = 'connection_sent'
      AND workspace_id = ?
      AND (
        pending_checked_at IS NULL
        OR pending_checked_at <= datetime('now', ?)
      )
    ORDER BY
      CASE WHEN pending_checked_at IS NULL THEN 0 ELSE 1 END,
      pending_checked_at,
      COALESCE(connection_sent_date, '9999-12-31'),
      name
  `, [workspace.id, `-${pendingCheckDelayHours} hours`]);
  return {
    today: todayIso(),
    workspace,
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
async function getProspectDetail(id, workspaceId) {
  const prospect = await one(`
    SELECT
      p.*,
      w.slug AS workspace_slug,
      w.name AS workspace_name,
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
    LEFT JOIN workspaces w ON w.id = p.workspace_id
    WHERE p.id = ?
      ${workspaceId ? "AND p.workspace_id = ?" : ""}
  `, workspaceId ? [id, workspaceId] : [id]);
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
async function getDashboard(workspaceInput) {
  const workspace = typeof workspaceInput === "object" ? workspaceInput : workspaceInput ? await one("SELECT * FROM workspaces WHERE id = ?", [workspaceInput]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const today = todayIso();
  const [prospectRows, tasks, events, stats] = await Promise.all([
    all(`
      SELECT
        p.*,
        w.slug AS workspace_slug,
        w.name AS workspace_name,
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
      LEFT JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.workspace_id = ?
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
    `, [workspace.id]),
    all(`
      SELECT t.*, p.name, p.profile_url, p.source_channel, p.twitter_url
      FROM tasks t
      LEFT JOIN prospects p ON p.id = t.prospect_id
      WHERE p.workspace_id = ?
      ORDER BY
        CASE WHEN t.due_date IS NOT NULL AND t.due_date < ? THEN 0 ELSE 1 END,
        COALESCE(t.due_date, '9999-12-31'),
        t.created_at
    `, [workspace.id, today]),
    all(`
      SELECT e.*, p.name
      FROM events e
      LEFT JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
      ORDER BY e.happened_at DESC, e.id DESC
      LIMIT 100
    `, [workspace.id]),
    getDashboardStats(today, workspace.id)
  ]);
  const prospects = prospectRows.map(withDerivedMessages);
  return {
    today,
    workspace,
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
async function getDashboardStats(today, workspaceId) {
  const days7 = Array.from({ length: 7 }, (_, index) => addDaysIso(today, index - 6));
  const days30 = Array.from({ length: 30 }, (_, index) => addDaysIso(today, index - 29));
  const firstDay7 = days7[0];
  const firstDay30 = days30[0];
  const sentEventTypes = [
    "report_sent",
    "followup_sent",
    "reply_sent",
    "twitter_dm_sent",
    "twitter_followup_sent"
  ];
  const [
    sentRows7,
    sentRows30,
    createdBefore7,
    createdRows7,
    createdBefore30,
    createdRows30,
    funnel7d,
    funnel30d,
    rates7d,
    rates30d,
    processHealth,
    importQuality,
    channelBreakdown,
    topicPerformance
  ] = await Promise.all([
    all(`
      SELECT date(events.happened_at) AS date, COUNT(*) AS count
      FROM events
      JOIN prospects p ON p.id = events.prospect_id
      WHERE events.type IN (${sentEventTypes.map(() => "?").join(", ")})
        AND p.workspace_id = ?
        AND date(events.happened_at) >= ?
        AND date(events.happened_at) <= ?
      GROUP BY date(events.happened_at)
    `, [...sentEventTypes, workspaceId, firstDay7, today]),
    all(`
      SELECT date(events.happened_at) AS date, COUNT(*) AS count
      FROM events
      JOIN prospects p ON p.id = events.prospect_id
      WHERE events.type IN (${sentEventTypes.map(() => "?").join(", ")})
        AND p.workspace_id = ?
        AND date(events.happened_at) >= ?
        AND date(events.happened_at) <= ?
      GROUP BY date(events.happened_at)
    `, [...sentEventTypes, workspaceId, firstDay30, today]),
    one(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) < ?
    `, [workspaceId, firstDay7]),
    all(`
      SELECT date(created_at) AS date, COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
      GROUP BY date(created_at)
    `, [workspaceId, firstDay7, today]),
    one(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) < ?
    `, [workspaceId, firstDay30]),
    all(`
      SELECT date(created_at) AS date, COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
      GROUP BY date(created_at)
    `, [workspaceId, firstDay30, today]),
    getFunnelStats(workspaceId, firstDay7, today),
    getFunnelStats(workspaceId, firstDay30, today),
    getRateStats(workspaceId, firstDay7, today),
    getRateStats(workspaceId, firstDay30, today),
    getProcessHealth(workspaceId, today),
    getImportQuality(workspaceId),
    getChannelBreakdown(workspaceId, firstDay30, today),
    getTopicPerformance(workspaceId, firstDay30, today)
  ]);
  const sentByDay7 = new Map(sentRows7.map((row) => [row.date, Number(row.count)]));
  const sentByDay30 = new Map(sentRows30.map((row) => [row.date, Number(row.count)]));
  const createdByDay7 = new Map(createdRows7.map((row) => [row.date, Number(row.count)]));
  const createdByDay30 = new Map(createdRows30.map((row) => [row.date, Number(row.count)]));
  let cumulativeProspects7 = Number(createdBefore7?.count || 0);
  let cumulativeProspects30 = Number(createdBefore30?.count || 0);
  return {
    messagesSent7d: days7.map((date) => ({
      date,
      label: shortDayLabel(date),
      value: sentByDay7.get(date) || 0
    })),
    messagesSent30d: days30.map((date) => ({
      date,
      label: shortDayLabel(date),
      value: sentByDay30.get(date) || 0
    })),
    prospects7d: days7.map((date) => {
      cumulativeProspects7 += createdByDay7.get(date) || 0;
      return {
        date,
        label: shortDayLabel(date),
        value: cumulativeProspects7
      };
    }),
    prospects30d: days30.map((date) => {
      cumulativeProspects30 += createdByDay30.get(date) || 0;
      return {
        date,
        label: shortDayLabel(date),
        value: cumulativeProspects30
      };
    }),
    funnel7d,
    funnel30d,
    rates7d,
    rates30d,
    processHealth,
    importQuality,
    channelBreakdown,
    topicPerformance
  };
}
async function getFunnelStats(workspaceId, firstDay, today) {
  const [prospectsAdded, firstTouchesSent, linkedinAccepted, reportsSent, repliesReceived, activeConversations] = await Promise.all([
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM events e
      JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
        AND e.type IN ('connection_sent', 'connection_sent_without_note', 'twitter_dm_sent')
        AND date(e.happened_at) >= ?
        AND date(e.happened_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND source_channel = 'linkedin'
        AND accepted_date IS NOT NULL
        AND date(accepted_date) >= ?
        AND date(accepted_date) <= ?
    `, [workspaceId, firstDay, today]),
    countReportsSent(workspaceId, firstDay, today),
    countOne(`
      SELECT COUNT(*) AS count
      FROM replies r
      JOIN prospects p ON p.id = r.prospect_id
      WHERE p.workspace_id = ?
        AND date(r.created_at) >= ?
        AND date(r.created_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND status IN ('conversation_active', 'reply_sent')
        AND date(updated_at) >= ?
        AND date(updated_at) <= ?
    `, [workspaceId, firstDay, today])
  ]);
  return { prospectsAdded, firstTouchesSent, linkedinAccepted, reportsSent, repliesReceived, activeConversations };
}
async function getRateStats(workspaceId, firstDay, today) {
  const [linkedinConnectionsSent, linkedinAccepted, firstMessagesSent, repliesReceived, activeConversations] = await Promise.all([
    countOne(`
      SELECT COUNT(*) AS count
      FROM events e
      JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
        AND p.source_channel = 'linkedin'
        AND e.type IN ('connection_sent', 'connection_sent_without_note')
        AND date(e.happened_at) >= ?
        AND date(e.happened_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND source_channel = 'linkedin'
        AND accepted_date IS NOT NULL
        AND date(accepted_date) >= ?
        AND date(accepted_date) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM events e
      JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
        AND e.type IN ('report_sent', 'twitter_dm_sent')
        AND date(e.happened_at) >= ?
        AND date(e.happened_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM replies r
      JOIN prospects p ON p.id = r.prospect_id
      WHERE p.workspace_id = ?
        AND date(r.created_at) >= ?
        AND date(r.created_at) <= ?
    `, [workspaceId, firstDay, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND status IN ('conversation_active', 'reply_sent')
        AND date(updated_at) >= ?
        AND date(updated_at) <= ?
    `, [workspaceId, firstDay, today])
  ]);
  return {
    linkedinAcceptRate: ratio(linkedinAccepted, linkedinConnectionsSent),
    replyRate: ratio(repliesReceived, firstMessagesSent),
    activeConversationRate: ratio(activeConversations, repliesReceived),
    linkedinConnectionsSent,
    firstMessagesSent,
    repliesReceived
  };
}
async function getProcessHealth(workspaceId, today) {
  const [overdue, acceptedWithoutReport, pendingChecksDue] = await Promise.all([
    one(`
      SELECT COUNT(*) AS count, MIN(due_date) AS oldest_due
      FROM tasks t
      JOIN prospects p ON p.id = t.prospect_id
      WHERE p.workspace_id = ?
        AND t.status = 'open'
        AND t.type IN ('send_followup', 'send_twitter_followup')
        AND t.due_date IS NOT NULL
        AND t.due_date < ?
    `, [workspaceId, today]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND status = 'accepted'
        AND report_sent_date IS NULL
    `, [workspaceId]),
    countOne(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND status = 'connection_sent'
        AND (
          pending_checked_at IS NULL
          OR pending_checked_at <= datetime('now', '-4 hours')
        )
    `, [workspaceId])
  ]);
  return {
    followupsOverdue: Number(overdue?.count || 0),
    oldestOverdueDays: overdue?.oldest_due ? daysBetween(overdue.oldest_due, today) : null,
    acceptedWithoutReport,
    pendingChecksDue
  };
}
async function getImportQuality(workspaceId) {
  const rows = await all(`
    SELECT priority_tag, COUNT(*) AS count
    FROM prospects
    WHERE workspace_id = ?
    GROUP BY priority_tag
  `, [workspaceId]);
  const counts = new Map(rows.map((row) => [String(row.priority_tag || "").toUpperCase(), Number(row.count)]));
  const learn = counts.get("LEARN") || 0;
  const warm = counts.get("WARM") || 0;
  const save = counts.get("SAVE") || 0;
  const skip = counts.get("SKIP") || 0;
  return { learn, warm, save, skip, learnRate: ratio(learn, learn + warm + save + skip) };
}
async function getChannelBreakdown(workspaceId, firstDay, today) {
  const rows = await all(`
    SELECT
      p.source_channel AS channel,
      COUNT(DISTINCT p.id) AS prospects,
      COUNT(DISTINCT CASE
        WHEN e.type IN ('connection_sent', 'connection_sent_without_note', 'twitter_dm_sent')
          AND date(e.happened_at) >= ?
          AND date(e.happened_at) <= ?
        THEN e.id
      END) AS first_touches,
      COUNT(DISTINCT CASE
        WHEN date(r.created_at) >= ?
          AND date(r.created_at) <= ?
        THEN r.id
      END) AS replies,
      COUNT(DISTINCT CASE WHEN p.status IN ('conversation_active', 'reply_sent') THEN p.id END) AS active_conversations
    FROM prospects p
    LEFT JOIN events e ON e.prospect_id = p.id
    LEFT JOIN replies r ON r.prospect_id = p.id
    WHERE p.workspace_id = ?
    GROUP BY p.source_channel
  `, [firstDay, today, firstDay, today, workspaceId]);
  const byChannel = new Map(rows.map((row) => [row.channel || "linkedin", row]));
  return ["linkedin", "twitter"].map((channel) => {
    const row = byChannel.get(channel);
    const firstTouches = Number(row?.first_touches || 0);
    const replies = Number(row?.replies || 0);
    return {
      channel,
      prospects: Number(row?.prospects || 0),
      firstTouches,
      replies,
      activeConversations: Number(row?.active_conversations || 0),
      replyRate: ratio(replies, firstTouches)
    };
  });
}
async function getTopicPerformance(workspaceId, firstDay, today) {
  const rows = await all(`
    SELECT
      COALESCE(NULLIF(TRIM(b.topic), ''), 'No topic') AS topic,
      COUNT(DISTINCT p.id) AS prospects,
      COUNT(DISTINCT CASE
        WHEN e.type IN ('connection_sent', 'connection_sent_without_note', 'twitter_dm_sent')
          AND date(e.happened_at) >= ?
          AND date(e.happened_at) <= ?
        THEN e.id
      END) AS first_touches,
      COUNT(DISTINCT CASE
        WHEN date(r.created_at) >= ?
          AND date(r.created_at) <= ?
        THEN r.id
      END) AS replies,
      COUNT(DISTINCT CASE WHEN p.status IN ('conversation_active', 'reply_sent') THEN p.id END) AS active_conversations
    FROM prospects p
    LEFT JOIN briefs b ON b.prospect_id = p.id
    LEFT JOIN events e ON e.prospect_id = p.id
    LEFT JOIN replies r ON r.prospect_id = p.id
    WHERE p.workspace_id = ?
    GROUP BY topic
    ORDER BY replies DESC, first_touches DESC, prospects DESC, topic
    LIMIT 8
  `, [firstDay, today, firstDay, today, workspaceId]);
  return rows.map((row) => {
    const firstTouches = Number(row.first_touches || 0);
    const replies = Number(row.replies || 0);
    return {
      topic: row.topic,
      prospects: Number(row.prospects || 0),
      firstTouches,
      replies,
      activeConversations: Number(row.active_conversations || 0),
      replyRate: ratio(replies, firstTouches)
    };
  });
}
async function countReportsSent(workspaceId, firstDay, today) {
  return await countOne(`
    SELECT COUNT(DISTINCT prospect_id) AS count
    FROM (
      SELECT e.prospect_id
      FROM events e
      JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
        AND e.type = 'report_sent'
        AND date(e.happened_at) >= ?
        AND date(e.happened_at) <= ?
      UNION
      SELECT m.prospect_id
      FROM messages m
      JOIN prospects p ON p.id = m.prospect_id
      WHERE p.workspace_id = ?
        AND m.type = 'report'
        AND m.sent_date IS NOT NULL
        AND date(m.sent_date) >= ?
        AND date(m.sent_date) <= ?
    )
  `, [workspaceId, firstDay, today, workspaceId, firstDay, today]);
}
async function countOne(sql, args = []) {
  const row = await one(sql, args);
  return Number(row?.count || 0);
}
function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}
function daysBetween(fromIso, toIso) {
  const from = (/* @__PURE__ */ new Date(`${fromIso}T12:00:00Z`)).getTime();
  const to = (/* @__PURE__ */ new Date(`${toIso}T12:00:00Z`)).getTime();
  return Math.max(0, Math.floor((to - from) / 864e5));
}
async function runProspectAction(formData, workspaceId) {
  const id = Number(formData.get("prospectId"));
  const intent = String(formData.get("intent") || "");
  const prospect = await one(
    `SELECT * FROM prospects WHERE id = ? ${workspaceId ? "AND workspace_id = ?" : ""}`,
    workspaceId ? [id, workspaceId] : [id]
  );
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
      const responseDirection = String(formData.get("responseDirection") || "").trim();
      if (!inboundContent) throw new Error("Reply content is required");
      const suggestedResponse = String(formData.get("suggestedResponse") || "").trim() || (await generateReplyDraft(id, inboundContent, responseDirection)).suggestedResponse;
      await run("INSERT INTO replies (prospect_id, inbound_content, suggested_response) VALUES (?, ?, ?)", [id, inboundContent, suggestedResponse]);
      await run("UPDATE prospects SET status = 'conversation_active', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeOpenTask(id, "send_followup");
      await addEvent(id, "reply_received", responseDirection ? `Prospect replied. Draft generated with direction: ${responseDirection}` : "Prospect replied. Follow-up task closed.", today);
    } else if (intent === "regenerateReplyResponse") {
      const replyId = Number(formData.get("replyId"));
      const responseDirection = String(formData.get("responseDirection") || "").trim();
      if (!replyId) throw new Error("Reply id is required");
      const reply = await one("SELECT inbound_content FROM replies WHERE id = ? AND prospect_id = ?", [replyId, id]);
      if (!reply) throw new Error("Reply not found.");
      const generated = await generateReplyDraft(id, reply.inbound_content, responseDirection);
      await run("UPDATE replies SET suggested_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND prospect_id = ?", [generated.suggestedResponse, replyId, id]);
      await addEvent(id, "reply_response_regenerated", responseDirection ? `Reply response regenerated with direction: ${responseDirection}` : "Reply response regenerated.", today);
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
      const workspace = prospect.workspace_id ? await one("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : null;
      await upsertGeneratedMessage(id, "report_no_note", noNoteReportFallback(prospect.name, topic, prospect.position, prospect.about, prospect.recommended_template, workspace?.product_name || "Tempolis"), null);
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
async function generateReplyDraft(prospectId, inboundContent, responseDirection) {
  loadLocalEnv$1();
  const detail = await getProspectDetail(prospectId);
  if (!detail) throw new Error("Prospect not found");
  const { prospect } = detail;
  const workspace = prospect.workspace_id ? await one("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const docs = await getWorkspaceDocs(workspace.id);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { suggestedResponse: replyFallback(prospect.name, inboundContent) };
  }
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderReplyDraftPrompt(workspace, docs, prospect, inboundContent, responseDirection);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a concise B2B outreach reply writer. Return only valid JSON. Never include markdown."
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
  const parsed = parseJson$1(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: null,
    prospectId: prospect.id,
    inputJson: { prompt, prospectId: prospect.id, inboundContent, responseDirection },
    outputJson: parsed,
    model
  });
  return normalizeReplyDraft(parsed, prospect.name, inboundContent);
}
function renderReplyDraftPrompt(workspace, docs, prospect, inboundContent, responseDirection) {
  return `
Write a reply to a prospect who answered our first outreach message.

RULES
- Write in ${workspace.default_language || "en"} by default.
- Be short, professional, human, and specific.
- Follow the user's response direction if provided.
- Do not over-pitch ${workspace.product_name}.
- Do not ask for a call or demo unless the response direction explicitly asks for it.
- If useful, ask one precise calibration question.
- If the prospect is skeptical, acknowledge it and ask what would make the brief useful.
- If the prospect is positive, thank them and suggest the next light step.
- Keep it to 2 short paragraphs max.
- No markdown.

RESPONSE DIRECTION FROM USER
${responseDirection || "(none provided; infer a useful, low-pressure reply)"}

WORKSPACE
${JSON.stringify({
    name: workspace.name,
    productName: workspace.product_name,
    docs: docs.map((doc) => ({ type: doc.type, title: doc.title, content: doc.content.slice(0, 9e3) }))
  }, null, 2)}

PROSPECT
${JSON.stringify({
    name: prospect.name,
    position: prospect.position,
    profileUrl: prospect.profile_url,
    sourceChannel: prospect.source_channel,
    rationale: prospect.rationale,
    recommendedTemplate: prospect.recommended_template,
    briefTopic: prospect.brief_topic,
    briefPreparation: prospect.preparation_notes,
    sharedUrl: prospect.shared_url,
    firstMessageSent: prospect.post_acceptance_message || prospect.report_message || prospect.twitter_dm_message
  }, null, 2)}

PROSPECT REPLY
${inboundContent}

OUTPUT JSON SHAPE
{
  "suggestedResponse": string
}
`;
}
function normalizeReplyDraft(value, name, inboundContent) {
  const input = value;
  const fallback = replyFallback(name, inboundContent);
  const suggestedResponse = String(input.suggestedResponse || "").trim();
  if (!suggestedResponse) return { suggestedResponse: fallback };
  return { suggestedResponse };
}
async function importAnalyzedProspects(items2, workspaceId) {
  const workspace = workspaceId ? await one("SELECT * FROM workspaces WHERE id = ?", [workspaceId]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const today = todayIso();
  try {
    for (const raw of items2) {
      const item = normalizeAnalyzedProspect(raw);
      if (!item.name || !item.profileUrl) continue;
      const status = statusForImportedProspect(item);
      const sourceChannel = item.sourceChannel === "twitter" ? "twitter" : "linkedin";
      const twitterUrl = sourceChannel === "twitter" ? normalizeTwitterUrl$1(item.twitterUrl || item.profileUrl) : null;
      const twitterHandle = sourceChannel === "twitter" ? normalizeTwitterHandle$1(item.twitterHandle || item.profileUrl) : null;
      const existingProfile = await one(
        "SELECT id, workspace_id FROM prospects WHERE profile_url = ?",
        [item.profileUrl]
      );
      if (existingProfile?.workspace_id && existingProfile.workspace_id !== workspace.id) {
        continue;
      }
      if (existingProfile && !existingProfile.workspace_id) {
        await run("UPDATE prospects SET workspace_id = ? WHERE id = ?", [workspace.id, existingProfile.id]);
      }
      await run(`
        INSERT INTO prospects (
          workspace_id, name, position, profile_url, source_channel, twitter_handle, twitter_url, about, priority_tag, wave, contact_now,
          rationale, recommended_template, notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        workspace.id,
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
      const prospect = await one("SELECT id, status FROM prospects WHERE profile_url = ? AND workspace_id = ?", [item.profileUrl, workspace.id]);
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
      await addEvent(prospect.id, "batch_imported", `Analyzed from ${sourceChannel} for ${workspace.name} as ${item.priorityTag}${item.wave ? ` wave ${item.wave}` : ""}.`, today);
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
    const config = getDatabaseConfig();
    databaseUsesEmbeddedReplica = Boolean(config.syncUrl);
    database = createClient(config);
    databaseReady = prepareDatabase(database);
  }
  await databaseReady;
  return database;
}
function getDatabaseConfig() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  const url = configuredUrl || `file:${dbPath}`;
  const shouldUseEmbeddedReplica = isRemoteLibsqlUrl(url) && process.env.DATABASE_USE_REMOTE_DIRECT !== "1";
  if (!shouldUseEmbeddedReplica) {
    return {
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN
    };
  }
  const replicaPath = process.env.DATABASE_REPLICA_PATH || path.join(dataDir, "outreach-replica.sqlite");
  fs.mkdirSync(path.dirname(replicaPath), { recursive: true });
  return {
    url: `file:${replicaPath}`,
    syncUrl: url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
    syncInterval: Number(process.env.DATABASE_SYNC_INTERVAL_MS || "5000"),
    readYourWrites: true
  };
}
function isRemoteLibsqlUrl(url) {
  return /^(libsql|https?|wss?):\/\//i.test(url);
}
async function prepareDatabase(db) {
  if (databaseUsesEmbeddedReplica) {
    await syncDatabase();
  }
  await applyMigrations(db);
  await seedWorkspaceDefaults(db);
  if (databaseUsesEmbeddedReplica) {
    await syncDatabase();
  }
}
async function syncDatabase(_reason) {
  if (!database || !databaseUsesEmbeddedReplica) return;
  if (!syncInProgress) {
    syncInProgress = database.sync().catch((error) => {
      console.warn("Database sync failed:", error);
    }).finally(() => {
      syncInProgress = null;
    });
  }
  await syncInProgress;
}
function scheduleDatabaseSync() {
  if (!database || !databaseUsesEmbeddedReplica || syncInProgress) return;
  syncInProgress = database.sync().catch((error) => {
    console.warn("Database sync failed:", error);
  }).finally(() => {
    syncInProgress = null;
  });
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
async function seedWorkspaceDefaults(db) {
  const repoRoot2 = path.resolve(rootDir, "..");
  const defaultModel = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const seeds = [
    {
      slug: "tempolis",
      name: "Tempolis",
      productName: "Tempolis",
      docs: [
        { type: "brand", title: "Brand", sourcePath: "tempolis/front/docs/brand.md" },
        { type: "outreach", title: "Outreach Playbook", sourcePath: "tempolis/front/docs/outreach.md" }
      ]
    },
    {
      slug: "narralens",
      name: "Narralens",
      productName: "Narralens",
      docs: [
        { type: "brand", title: "Brand", sourcePath: "narralens/front/docs/brand.md" },
        { type: "outreach", title: "Outreach DM Playbook", sourcePath: "narralens/front/docs/outreach-dm-playbook.md" },
        { type: "examples", title: "Copy-Paste Messages", sourcePath: "narralens/front/docs/outreach-copy-paste-messages.md" }
      ]
    }
  ];
  for (const seed of seeds) {
    await db.execute({
      sql: `
        INSERT INTO workspaces (slug, name, product_name, default_language)
        VALUES (?, ?, ?, 'en')
        ON CONFLICT(slug) DO UPDATE SET
          name = COALESCE(workspaces.name, excluded.name),
          product_name = COALESCE(workspaces.product_name, excluded.product_name)
      `,
      args: [seed.slug, seed.name, seed.productName]
    });
    const workspace = (await db.execute({ sql: "SELECT * FROM workspaces WHERE slug = ?", args: [seed.slug] })).rows[0];
    if (!workspace) continue;
    for (const doc of seed.docs) {
      const absolutePath = path.join(repoRoot2, doc.sourcePath);
      const content = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO workspace_docs (workspace_id, type, title, content, source_path)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [workspace.id, doc.type, doc.title, content, doc.sourcePath]
      });
    }
    const isNarralens2 = seed.slug === "narralens";
    await seedPromptTemplate(
      db,
      workspace.id,
      "linkedin",
      "batch_analysis",
      isNarralens2 ? "LinkedIn batch analysis - concrete Narralens topics" : "LinkedIn batch analysis",
      DEFAULT_LINKEDIN_BATCH_SYSTEM_PROMPT,
      isNarralens2 ? DEFAULT_NARRALENS_LINKEDIN_BATCH_USER_PROMPT : DEFAULT_LINKEDIN_BATCH_USER_PROMPT,
      defaultModel,
      0.2
    );
    await seedPromptTemplate(
      db,
      workspace.id,
      "twitter",
      "batch_analysis",
      isNarralens2 ? "Twitter/X batch analysis - concrete Narralens topics" : "Twitter/X batch analysis",
      DEFAULT_TWITTER_BATCH_SYSTEM_PROMPT,
      isNarralens2 ? DEFAULT_NARRALENS_TWITTER_BATCH_USER_PROMPT : DEFAULT_TWITTER_BATCH_USER_PROMPT,
      defaultModel,
      0.2
    );
    await seedPromptTemplate(
      db,
      workspace.id,
      "linkedin",
      "no_note_rewrite",
      isNarralens2 ? "LinkedIn no-note rewrite - Narralens workflows" : "LinkedIn no-note rewrite",
      DEFAULT_NO_NOTE_SYSTEM_PROMPT,
      isNarralens2 ? DEFAULT_NARRALENS_NO_NOTE_USER_PROMPT : DEFAULT_NO_NOTE_USER_PROMPT,
      defaultModel,
      0.2
    );
  }
}
async function seedPromptTemplate(db, workspaceId, channel, purpose, name, systemPrompt, userPrompt, model, temperature) {
  const existing = await db.execute({
    sql: "SELECT id FROM prompt_templates WHERE workspace_id = ? AND channel = ? AND purpose = ? LIMIT 1",
    args: [workspaceId, channel, purpose]
  });
  if (existing.rows.length > 0) return;
  await db.execute({
    sql: `
      INSERT INTO prompt_templates (
        workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `,
    args: [workspaceId, channel, purpose, name, systemPrompt, userPrompt, model, temperature]
  });
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
  scheduleDatabaseSync();
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
    prospect.recommended_template,
    prospect.workspace_name || "Tempolis"
  );
  return {
    ...prospect,
    source_channel: prospect.source_channel || "linkedin",
    outreach_mode: prospect.outreach_mode || "with_note",
    connection_note_sent: prospect.connection_note_sent || 0,
    post_acceptance_message: prospect.outreach_mode === "no_note" ? prospect.no_note_report_message ? sanitizeNoNoteMessage(prospect.no_note_report_message, noNoteFallback) : rewriteReportForNoNote(prospect.report_message, prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template, prospect.workspace_name || "Tempolis") : prospect.report_message
  };
}
function rewriteReportForNoNote(content, name, topic, position, about, template, productName = "Tempolis") {
  const fallback = noNoteReportFallback(name, topic, position, about, template, productName);
  if (!content) return fallback;
  const rewritten = content.replace(/As promised,\s*the brief on/i, "Thanks for connecting. I prepared a brief on").replace(/As promised,\s*the brief/i, "Thanks for connecting. I prepared a brief").replace(/The brief I mentioned,\s*on/i, "Thanks for connecting. I prepared a brief on").replace(/The brief I promised,\s*on/i, "Thanks for connecting. I prepared a brief on").replace(/As promised,\s*/i, "").replace(/The brief I mentioned,\s*/i, "I prepared a brief ").replace(/The brief I mentioned/i, "I prepared a brief").replace(/The brief I promised,\s*/i, "I prepared a brief ").replace(/The brief I promised/i, "I prepared a brief").replace(/Le brief promis\s*/i, "J'ai préparé un brief ").replace(/Comme promis,\s*/i, "");
  return rewritten === content ? fallback : rewritten;
}
function noNoteReportFallback(name, topic, position, about, template, productName = "Tempolis") {
  const firstName2 = name.split(/\s+/)[0] || name;
  const briefTopic = topic || "your policy area";
  const context = prospectContext$1(position, about, template);
  return `Hi ${firstName2},

Thanks for connecting. I'm building ${productName}, a tool for public affairs narrative briefs, and I prepared a short brief on ${briefTopic} because it seems close to your work on ${context}.

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
  const workspace = prospect.workspace_id ? await one("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const [template, docs] = await Promise.all([
    getActivePromptTemplate(workspace.id, "linkedin", "no_note_rewrite"),
    getWorkspaceDocs(workspace.id)
  ]);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to .env or your shell env.");
  }
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderNoNoteRewritePrompt(template.user_prompt, workspace, docs, prospect);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt
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
  const parsed = parseJson$1(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    prospectId: prospect.id,
    inputJson: { prompt, prospectId: prospect.id },
    outputJson: parsed,
    model
  });
  return normalizeNoNoteRewrite(parsed, prospect, workspace.product_name);
}
function renderNoNoteRewritePrompt(template, workspace, docs, prospect) {
  return template.replaceAll("{{productName}}", workspace.product_name).replaceAll("{{workspaceName}}", workspace.name).replaceAll("{{defaultLanguage}}", workspace.default_language || "en").replaceAll("{{workspaceDocs}}", formatWorkspaceDocs$1(docs)).replaceAll("{{prospectJson}}", JSON.stringify({
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
  }, null, 2)).replaceAll("{{currentCopyJson}}", JSON.stringify({
    connectionNote: prospect.connection_message,
    afterAcceptanceWithNote: prospect.report_message,
    existingNoNoteMessage: prospect.no_note_report_message,
    followup: prospect.followup_message
  }, null, 2));
}
function formatWorkspaceDocs$1(docs) {
  return docs.map((doc) => `## ${doc.title} (${doc.type})
${doc.content.slice(0, 18e3)}`).join("\n\n---\n\n");
}
function normalizeNoNoteRewrite(value, prospect, productName = "Tempolis") {
  const input = value;
  const fallbackReport = noNoteReportFallback(prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template, productName);
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
const DEFAULT_LINKEDIN_BATCH_SYSTEM_PROMPT = "You are a strict JSON-producing outreach analyst. Return only valid JSON. Never include markdown.";
const DEFAULT_TWITTER_BATCH_SYSTEM_PROMPT = "You are a strict JSON-producing outreach analyst. Return only valid JSON. Never include markdown.";
const DEFAULT_NO_NOTE_SYSTEM_PROMPT = "You are a strict JSON-producing outreach copywriter. Return only valid JSON. Never include markdown.";
const DEFAULT_LINKEDIN_BATCH_USER_PROMPT = `
Analyze this new {{productName}} LinkedIn outreach batch.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the workspace docs.
- Use the strict strategy: LEARN = good profile to learn from and contactable now; WARM = very good profile but better after 1 or 2 iterations; SAVE = premium prospect to keep for later; SKIP = outside target or too low probability of useful feedback.
- Do not default to LEARN. A broad title/industry match is not enough.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Generate exact LinkedIn connection messages for contactToday=true profiles.
- Write all outreach messages in {{defaultLanguage}} by default.
- Use brief topics of 1 to 3 words only.
- A brief topic is not the prospect's broad profession. It must be a concrete {{productName}} brief subject.
- Treat activity evidence carefully: reposts, likes, comments, and visible activity prove interest only, not professional ownership.
- Do not say "your work on [topic]" unless role/about/experience explicitly says the prospect works on that topic.
- Respect the outreach rule: no product pitch, no demo/call request, short connection note under 300 characters.
- Generate two post-acceptance variants:
  - reportMessage assumes a custom connection note was sent and may refer to the promised brief.
  - noNoteReportMessage assumes no custom connection note was sent; it must open naturally with "Thanks for connecting" or equivalent.
- Generate the J+2 follow-up.
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": { "total": number, "contactToday": number, "wave2": number, "saved": number, "skipped": number },
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

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECTS
{{prospectsJson}}
`;
const DEFAULT_TWITTER_BATCH_USER_PROMPT = `
Analyze this new {{productName}} Twitter/X outreach batch.

CONTEXT
This is not LinkedIn. We are testing Twitter/X as a manual acquisition channel. The app helps copy messages and track follow-ups, but it does not automate X.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the workspace docs.
- Use the strict strategy: LEARN = good profile to learn from and contactable now; WARM = very good profile but better after 1 or 2 iterations; SAVE = premium prospect to keep for later; SKIP = outside target or too low probability of useful feedback.
- Do not default to LEARN. A broad title/industry match is not enough.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Write all outreach messages in {{defaultLanguage}} by default.
- Use brief topics of 1 to 3 words only.
- A brief topic must be concrete: a brand, campaign, launch, competitor, figure, issue, controversy, narrative risk, or public debate.
- Treat Twitter activity carefully: posts, reposts, likes, follows and bio claims are signals of interest, not proof of professional ownership unless explicitly stated.
- Do not say "your work on [topic]" unless the bio/about/role explicitly says they work on that topic.
- twitterDmMessage must explicitly connect the brief to one concrete source signal from the profile/feed.
- Preferred structure: "I prepared a short brief on [briefTopic], based on [specific signal from your bio/posts/feed]."
- Keep twitterDmMessage to 4 lines max, no pitch, no demo/call ask, with [shared link] on its own line if a brief is being sent.
- twitterFollowupMessage is one gentle follow-up at J+2 max.
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": { "total": number, "contactToday": number, "wave2": number, "saved": number, "skipped": number },
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

WORKSPACE DOCS
{{workspaceDocs}}

TWITTER/X PROSPECTS
{{prospectsJson}}
`;
const DEFAULT_NO_NOTE_USER_PROMPT = `
Rewrite this {{productName}} LinkedIn outreach sequence for NO-CUSTOM-NOTE mode.

CONTEXT
LinkedIn custom note quota is exhausted. The connection request will be sent without any note. The first actual outreach message is sent only after the person accepts the request.

TASK
- Keep the strategy soft: no product pitch, no demo request, no call request.
- Write in {{defaultLanguage}}.
- Adapt the first post-acceptance message so it does not rely on a previous promise.
- The first message must naturally acknowledge the new connection and introduce the brief.
- Make the first message feel written for this exact person, not a reusable template.
- Treat activity evidence carefully: reposts, likes, comments, and visible activity prove interest only, not professional ownership.
- Do not say "your work on [topic]" unless role/about/experience explicitly says the prospect works on that topic.
- Mention the builder context lightly: the sender is building {{productName}} / testing a small brief format.
- It must include [shared link] on its own line.
- It must be 5 lines max.
- It must not say "as promised", "the brief I mentioned", "as I mentioned", or imply that a note was sent.
- Rewrite the follow-up for 2 days later. It should still be gentle and should not refer to a promised brief.

OUTPUT JSON SHAPE
{
  "noNoteReportMessage": string,
  "followupMessage": string
}

PROSPECT
{{prospectJson}}

CURRENT COPY
{{currentCopyJson}}

WORKSPACE DOCS
{{workspaceDocs}}
`;
const NARRALENS_TOPIC_RULES = `

NARRALENS-SPECIFIC RULES
- Narralens is for brand, social, PR, marketing, agency, and founder workflows.
- The suggested briefTopic must be a concrete search/query someone could run in Narralens.
- Do not output abstract categories as briefTopic: "brand perception", "perception", "social listening", "brand monitoring", "campaign monitoring", "marketing", "reputation", "consumer insights", "narrative intelligence", or "competitive intelligence".
- Prefer concrete brand, campaign, launch, competitor, product, spokesperson, founder, or public figure topics.
- Strong briefTopic examples: "OpenAI launch", "Nike sustainability", "Notion vs ClickUp", "Apple Vision Pro", "Duolingo marketing", "Tesla robotaxi", "Elon Musk advertisers", "Spotify Wrapped".
- If the profile mentions a client sector, company, campaign, founder, product, competitor, or platform, use that as the concrete topic.
- If the profile only shows broad brand/social/PR experience, pick a famous concrete test case relevant to that workflow rather than a generic concept.
- Brief preparation should explain why this concrete case is useful for their workflow: campaign readout, launch reaction, competitor narrative check, client update, crisis/backlash scan, or positioning decision.
- Outreach copy must not say "your work on [topic]" unless the profile explicitly says they work on that exact topic. Safer wording: "as a concrete test case for campaign/competitor readouts" or "given your brand/social/PR work".
- The product promise is business/workflow value, not concept analysis: faster campaign reads, launch monitoring, competitor checks, client updates, and internal decision briefs.
`;
const DEFAULT_NARRALENS_LINKEDIN_BATCH_USER_PROMPT = `${DEFAULT_LINKEDIN_BATCH_USER_PROMPT}${NARRALENS_TOPIC_RULES}`;
const DEFAULT_NARRALENS_TWITTER_BATCH_USER_PROMPT = `${DEFAULT_TWITTER_BATCH_USER_PROMPT}${NARRALENS_TOPIC_RULES}
- For Twitter/X, connect the topic to a visible post, repost, bio signal, client sector, or public thread, but describe it as interest/signal unless ownership is explicit.
`;
const DEFAULT_NARRALENS_NO_NOTE_USER_PROMPT = `${DEFAULT_NO_NOTE_USER_PROMPT}${NARRALENS_TOPIC_RULES}
- The no-note first message should frame the brief as "a concrete test case" for their workflow.
- Prefer wording like "I prepared a short Narralens brief on [briefTopic] as a concrete campaign/competitor readout" over "I prepared a brief on brand perception."
`;
async function loader$d({
  request
}) {
  const url = new URL(request.url);
  const workspaceSlug = url.pathname.split("/").filter(Boolean)[0];
  return await getWorkspaceShellData(workspaceSlug);
}
const _app = UNSAFE_withComponentProps(function AppLayout() {
  const shellData = useLoaderData();
  return /* @__PURE__ */ jsxs(AppShell, {
    workspaces: shellData.workspaces,
    activeWorkspace: shellData.activeWorkspace,
    children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {
      richColors: true,
      closeButton: true,
      position: "bottom-right"
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _app,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
        info: "border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-400",
        muted: "border-transparent bg-muted text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Accordion(props) {
  return /* @__PURE__ */ jsx(AccordionPrimitive.Root, { "data-slot": "accordion", ...props });
}
function AccordionItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AccordionPrimitive.Item,
    {
      "data-slot": "accordion-item",
      className: cn("border-b last:border-b-0", className),
      ...props
    }
  );
}
function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
    AccordionPrimitive.Trigger,
    {
      "data-slot": "accordion-trigger",
      className: cn(
        "flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium transition-all outline-none",
        "hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ChevronDown, { className: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" })
      ]
    }
  ) });
}
function AccordionContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AccordionPrimitive.Content,
    {
      "data-slot": "accordion-content",
      className: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
      ...props,
      children: /* @__PURE__ */ jsx("div", { className: cn("pt-0 pb-4", className), children })
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { "data-slot": "table-container", className: "relative w-full overflow-x-auto", children: /* @__PURE__ */ jsx(
    "table",
    {
      "data-slot": "table",
      className: cn("w-full caption-bottom text-sm", className),
      ...props
    }
  ) });
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-3 align-middle [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function statusVariant(status) {
  if (status === "accepted" || status === "report_sent" || status === "conversation_active") return "success";
  if (status === "followup_due" || status === "followup_sent") return "warning";
  if (status === "archived" || status === "archived_declined" || status === "skipped") return "muted";
  if (status === "to_contact" || status === "connection_sent" || status === "twitter_contacted") return "info";
  return "secondary";
}
const meta$5 = () => [{
  title: "Dashboard · Outreach"
}, {
  name: "description",
  content: "Internal outreach tracker."
}];
async function loader$c({
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  return await getDashboard(workspace);
}
async function action$6({
  request,
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  const formData = await request.formData();
  await runProspectAction(formData, workspace.id);
  return redirect(`/${workspace.slug}`);
}
const home = UNSAFE_withComponentProps(function Home() {
  const data2 = useLoaderData();
  const activeProspects = data2.prospects.filter((prospect) => !["saved_for_later", "skipped", "archived_declined", "archived"].includes(prospect.status));
  const todoItems = buildTodoItems(data2);
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl space-y-8",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase tracking-wide text-primary",
            children: "Dashboard"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-3xl font-semibold tracking-tight",
            children: "Today's pipeline"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-2xl text-sm text-muted-foreground",
            children: "Daily command center for LinkedIn requests, accepted connections, shared briefs, and follow-ups."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border bg-card px-4 py-3",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase text-muted-foreground",
            children: "Today"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-lg font-semibold",
            children: data2.today
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-4",
        children: [/* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "pipeline-now",
          title: "Pipeline now",
          detail: "Current workload for this workspace.",
          count: data2.prospects.length,
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
            children: [/* @__PURE__ */ jsx(KpiCard, {
              label: "Prospects",
              value: data2.prospects.length
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Pending connections",
              value: data2.sections.pendingConnections.length
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Reports to send",
              value: data2.sections.acceptedReport.length
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Active conversations",
              value: data2.sections.conversationsActive.length
            })]
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "process-health",
          title: "Process health",
          detail: "Anything that can break the outreach rhythm.",
          count: data2.stats.processHealth.followupsOverdue + data2.stats.processHealth.acceptedWithoutReport + data2.stats.processHealth.pendingChecksDue,
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
            children: [/* @__PURE__ */ jsx(KpiCard, {
              label: "Follow-ups overdue",
              value: data2.stats.processHealth.followupsOverdue,
              tone: data2.stats.processHealth.followupsOverdue ? "warning" : "normal"
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Oldest overdue",
              value: data2.stats.processHealth.oldestOverdueDays === null ? "-" : `${data2.stats.processHealth.oldestOverdueDays}d`,
              tone: data2.stats.processHealth.oldestOverdueDays ? "warning" : "normal"
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Accepted waiting report",
              value: data2.stats.processHealth.acceptedWithoutReport,
              tone: data2.stats.processHealth.acceptedWithoutReport ? "warning" : "normal"
            }), /* @__PURE__ */ jsx(KpiCard, {
              label: "Pending checks due",
              value: data2.stats.processHealth.pendingChecksDue,
              tone: data2.stats.processHealth.pendingChecksDue ? "warning" : "normal"
            })]
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "volume-charts",
          title: "Volume",
          detail: "Messages sent and total prospect base.",
          count: data2.stats.messagesSent7d.reduce((sum, point) => sum + point.value, 0),
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-4 lg:grid-cols-2",
            children: [/* @__PURE__ */ jsx(StatsChart, {
              title: "Messages sent",
              detail: "Last 7 days, across LinkedIn and Twitter/X.",
              points: data2.stats.messagesSent7d,
              totalLabel: "total"
            }), /* @__PURE__ */ jsx(StatsChart, {
              title: "Prospect base",
              detail: "Total prospects in CRM over the last 7 days.",
              points: data2.stats.prospects7d,
              totalLabel: "today"
            })]
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "funnel",
          title: "Funnel",
          detail: "Added, contacted, accepted, replied and active conversations.",
          count: data2.stats.funnel7d.firstTouchesSent,
          children: /* @__PURE__ */ jsx(FunnelPanel, {
            funnel7d: data2.stats.funnel7d,
            funnel30d: data2.stats.funnel30d
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "conversion-rates",
          title: "Conversion rates",
          detail: "7-day and 30-day conversion health.",
          count: data2.stats.rates7d.repliesReceived,
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-3 md:grid-cols-3",
            children: [/* @__PURE__ */ jsx(RateCard, {
              title: "LinkedIn accept rate",
              rate7d: data2.stats.rates7d.linkedinAcceptRate,
              rate30d: data2.stats.rates30d.linkedinAcceptRate,
              denominator: `${data2.stats.rates7d.linkedinConnectionsSent} sent 7d · ${data2.stats.rates30d.linkedinConnectionsSent} sent 30d`
            }), /* @__PURE__ */ jsx(RateCard, {
              title: "Reply rate",
              rate7d: data2.stats.rates7d.replyRate,
              rate30d: data2.stats.rates30d.replyRate,
              denominator: `${data2.stats.rates7d.firstMessagesSent} first messages 7d · ${data2.stats.rates30d.firstMessagesSent} first messages 30d`
            }), /* @__PURE__ */ jsx(RateCard, {
              title: "Active conversation rate",
              rate7d: data2.stats.rates7d.activeConversationRate,
              rate30d: data2.stats.rates30d.activeConversationRate,
              denominator: `${data2.stats.rates7d.repliesReceived} replies 7d · ${data2.stats.rates30d.repliesReceived} replies 30d`
            })]
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "channel-performance",
          title: "Channel performance",
          detail: "LinkedIn vs Twitter/X over the last 30 days.",
          count: data2.stats.channelBreakdown.reduce((sum, row) => sum + row.firstTouches, 0),
          children: /* @__PURE__ */ jsx(ChannelPerformanceTable, {
            rows: data2.stats.channelBreakdown
          })
        }), /* @__PURE__ */ jsx(CollapsibleDashboardSection, {
          storageKey: "learning",
          title: "Learning",
          detail: "Import quality and brief topics that are getting signal.",
          count: data2.stats.topicPerformance.length,
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]",
            children: [/* @__PURE__ */ jsx(ImportQualityPanel, {
              quality: data2.stats.importQuality
            }), /* @__PURE__ */ jsx(TopicPerformanceTable, {
              rows: data2.stats.topicPerformance
            })]
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
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
          }), /* @__PURE__ */ jsx(ProspectsInProgressPanel, {
            prospects: activeProspects
          })]
        }), /* @__PURE__ */ jsx("aside", {
          className: "h-fit lg:sticky lg:top-6",
          children: /* @__PURE__ */ jsxs(Card, {
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Timeline"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Latest events."
              })]
            }), /* @__PURE__ */ jsx(CardContent, {
              className: "space-y-4",
              children: data2.events.length === 0 ? /* @__PURE__ */ jsx(EmptyState$1, {}) : data2.events.map((event) => /* @__PURE__ */ jsxs("div", {
                className: "border-l-2 border-primary pl-3",
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: event.name || "System"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: event.type
                }), /* @__PURE__ */ jsxs("p", {
                  className: "mt-1 text-xs text-muted-foreground",
                  children: [event.happened_at, " · ", event.note]
                })]
              }, event.id))
            })]
          })
        })]
      })]
    })
  });
});
function ProspectsInProgressPanel({
  prospects
}) {
  const storageKey = "outreach.dashboard.details.prospects-in-progress";
  const defaultOpen = prospects.length > 0;
  const [value, setValue] = useState(defaultOpen ? "item" : "");
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "open") setValue("item");
    if (saved === "closed") setValue("");
  }, []);
  return /* @__PURE__ */ jsx(Accordion, {
    type: "single",
    collapsible: true,
    value,
    onValueChange: (next) => {
      setValue(next);
      window.localStorage.setItem(storageKey, next ? "open" : "closed");
    },
    children: /* @__PURE__ */ jsxs(AccordionItem, {
      value: "item",
      className: "border-none",
      children: [/* @__PURE__ */ jsx(AccordionTrigger, {
        className: "rounded-lg border bg-card px-4 py-3 hover:no-underline data-[state=open]:rounded-b-none",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex w-full items-center justify-between gap-3 pr-3",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "text-left",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-lg font-semibold",
              children: "Prospects in progress"
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm font-normal text-muted-foreground",
              children: [prospects.length, " profiles in the working set."]
            })]
          }), /* @__PURE__ */ jsx(Badge, {
            variant: prospects.length ? "info" : "success",
            children: prospects.length
          })]
        })
      }), /* @__PURE__ */ jsx(AccordionContent, {
        className: "rounded-b-lg border border-t-0 bg-card p-0",
        children: /* @__PURE__ */ jsx(ProspectsTable, {
          prospects
        })
      })]
    })
  });
}
function DashboardTaskLink({
  prospect,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-2 rounded-lg border bg-muted/30 p-3 transition-colors hover:border-primary md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(Link$1, {
      to: prospectPath(prospect),
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
      children: [prospect.priority_tag ? /* @__PURE__ */ jsx(Badge, {
        variant: "muted",
        children: prospect.priority_tag
      }) : null, /* @__PURE__ */ jsx(Badge, {
        variant: prospect.outreach_mode === "no_note" ? "info" : "success",
        children: outreachModeLabel$1(prospect)
      }), /* @__PURE__ */ jsx(Badge, {
        variant: statusVariant(prospect.status),
        children: prospect.status
      }), /* @__PURE__ */ jsx(Button, {
        asChild: true,
        variant: "outline",
        size: "icon",
        className: "size-8",
        children: /* @__PURE__ */ jsx("a", {
          href: prospect.twitter_url || prospect.profile_url,
          target: "_blank",
          rel: "noreferrer",
          "aria-label": `Open ${prospect.name} profile`,
          title: prospect.source_channel === "twitter" ? "Open X profile" : "Open LinkedIn profile",
          children: /* @__PURE__ */ jsx(ExternalLink, {
            className: "size-3.5"
          })
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
  return /* @__PURE__ */ jsx(Card, {
    children: /* @__PURE__ */ jsxs(CardContent, {
      className: "grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center",
      children: [/* @__PURE__ */ jsx(Link$1, {
        to: item.prospect ? prospectPath(item.prospect) : "/tempolis",
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
          variant: "default"
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
          variant: "default"
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
          variant: "default"
        }) : null, item.kind === "connection" && item.prospect ? /* @__PURE__ */ jsx(ActionButton$1, {
          intent: "markConnectionSentWithoutNote",
          prospectId: item.prospect.id,
          label: "Sent without note",
          icon: /* @__PURE__ */ jsx(UserCheck, {
            size: 16
          }),
          variant: "outline"
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
          variant: "default"
        }) : null, item.kind === "pending" && item.prospect ? /* @__PURE__ */ jsx(Button, {
          asChild: true,
          variant: "outline",
          size: "sm",
          children: /* @__PURE__ */ jsxs("a", {
            href: item.prospect.profile_url,
            target: "_blank",
            rel: "noreferrer",
            children: [/* @__PURE__ */ jsx(ExternalLink, {
              className: "size-4"
            }), "Check"]
          })
        }) : null, item.kind === "brief" && item.prospect ? /* @__PURE__ */ jsx(Button, {
          asChild: true,
          variant: "outline",
          size: "sm",
          children: /* @__PURE__ */ jsxs(Link$1, {
            to: prospectPath(item.prospect),
            children: [/* @__PURE__ */ jsx(Link, {
              className: "size-4"
            }), "Add URL"]
          })
        }) : null, item.kind === "brief" && item.prospect ? /* @__PURE__ */ jsx(BriefUrlForm, {
          prospectId: item.prospect.id
        }) : null]
      })]
    })
  });
}
function BriefUrlForm({
  prospectId
}) {
  return /* @__PURE__ */ jsxs(Form, {
    method: "post",
    className: "flex items-center gap-2",
    children: [/* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "intent",
      value: "addBriefUrl"
    }), /* @__PURE__ */ jsx("input", {
      type: "hidden",
      name: "prospectId",
      value: prospectId
    }), /* @__PURE__ */ jsx(Input, {
      name: "sharedUrl",
      type: "url",
      required: true,
      placeholder: "https://tempolis.com/share/...",
      className: "h-9 w-64"
    }), /* @__PURE__ */ jsxs(Button, {
      type: "submit",
      variant: "secondary",
      size: "sm",
      children: [/* @__PURE__ */ jsx(Link, {
        className: "size-4"
      }), "Save"]
    })]
  });
}
function ProfileButton({
  prospect
}) {
  if (prospect.source_channel === "twitter") {
    return /* @__PURE__ */ jsx(Button, {
      asChild: true,
      size: "sm",
      className: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
      children: /* @__PURE__ */ jsx("a", {
        href: prospect.twitter_url || prospect.profile_url,
        target: "_blank",
        rel: "noreferrer",
        "aria-label": `Open ${prospect.name} on X`,
        title: "Open X profile",
        children: "X"
      })
    });
  }
  return /* @__PURE__ */ jsx(Button, {
    asChild: true,
    size: "sm",
    className: "bg-[#0a66c2] text-white hover:bg-[#004182] dark:bg-[#0a66c2] dark:hover:bg-[#004182]",
    children: /* @__PURE__ */ jsx("a", {
      href: prospect.profile_url,
      target: "_blank",
      rel: "noreferrer",
      "aria-label": `Open ${prospect.name} on LinkedIn`,
      title: "Open LinkedIn profile",
      children: "in"
    })
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
    className: "overflow-x-auto",
    children: /* @__PURE__ */ jsxs(Table, {
      children: [/* @__PURE__ */ jsx(TableHeader, {
        children: /* @__PURE__ */ jsxs(TableRow, {
          children: [/* @__PURE__ */ jsx(TableHead, {
            children: "Prospect"
          }), /* @__PURE__ */ jsx(TableHead, {
            children: "Status"
          }), /* @__PURE__ */ jsx(TableHead, {
            children: "Wave"
          }), /* @__PURE__ */ jsx(TableHead, {
            children: "Brief"
          }), /* @__PURE__ */ jsx(TableHead, {
            children: "Next"
          })]
        })
      }), /* @__PURE__ */ jsx(TableBody, {
        children: prospects.map((prospect) => /* @__PURE__ */ jsxs(TableRow, {
          children: [/* @__PURE__ */ jsxs(TableCell, {
            children: [/* @__PURE__ */ jsx(Link$1, {
              to: prospectPath(prospect),
              className: "font-medium text-foreground hover:text-primary",
              children: prospect.name
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-0.5 max-w-xl truncate text-xs text-muted-foreground",
              children: prospect.position
            })]
          }), /* @__PURE__ */ jsx(TableCell, {
            children: /* @__PURE__ */ jsx(Badge, {
              variant: statusVariant(prospect.status),
              children: prospect.status
            })
          }), /* @__PURE__ */ jsx(TableCell, {
            className: "text-muted-foreground",
            children: prospect.wave || "-"
          }), /* @__PURE__ */ jsx(TableCell, {
            className: "text-muted-foreground",
            children: prospect.brief_topic || "-"
          }), /* @__PURE__ */ jsx(TableCell, {
            className: "text-muted-foreground",
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
function CollapsibleDashboardSection({
  storageKey,
  title,
  detail,
  count,
  children
}) {
  const key = `outreach.dashboard.kpi.${storageKey}`;
  const [value, setValue] = useState("item");
  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved === "closed") setValue("");
    if (saved === "open") setValue("item");
  }, [key]);
  return /* @__PURE__ */ jsx(Accordion, {
    type: "single",
    collapsible: true,
    value,
    onValueChange: (next) => {
      setValue(next);
      window.localStorage.setItem(key, next ? "open" : "closed");
    },
    children: /* @__PURE__ */ jsxs(AccordionItem, {
      value: "item",
      className: "overflow-hidden rounded-lg border bg-card",
      children: [/* @__PURE__ */ jsx(AccordionTrigger, {
        className: "px-5 py-4 hover:no-underline",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex w-full flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold tracking-tight",
              children: title
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-1 text-sm font-normal text-muted-foreground",
              children: detail
            })]
          }), /* @__PURE__ */ jsx(Badge, {
            variant: count ? "info" : "muted",
            children: count
          })]
        })
      }), /* @__PURE__ */ jsx(AccordionContent, {
        className: "px-5 pb-5 pt-0",
        children
      })]
    })
  });
}
function KpiCard({
  label,
  value,
  tone = "normal"
}) {
  return /* @__PURE__ */ jsx(Card, {
    className: cn(tone === "warning" && "border-amber-500/50"),
    children: /* @__PURE__ */ jsxs(CardContent, {
      className: "p-5",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm text-muted-foreground",
        children: label
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-1 text-3xl font-semibold tracking-tight",
        children: value
      })]
    })
  });
}
function RateCard({
  title,
  rate7d,
  rate30d,
  denominator
}) {
  return /* @__PURE__ */ jsx(Card, {
    children: /* @__PURE__ */ jsxs(CardContent, {
      className: "p-5",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm text-muted-foreground",
        children: title
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3 flex items-end justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase text-muted-foreground",
            children: "7d"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-3xl font-semibold tracking-tight",
            children: formatRate(rate7d)
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-right",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase text-muted-foreground",
            children: "30d"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-2xl font-semibold tracking-tight",
            children: formatRate(rate30d)
          })]
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-3 text-xs text-muted-foreground",
        children: denominator
      })]
    })
  });
}
function FunnelPanel({
  funnel7d,
  funnel30d
}) {
  const [window2, setWindow] = useState("7d");
  const funnel = window2 === "7d" ? funnel7d : funnel30d;
  const steps = [["Added", funnel.prospectsAdded], ["First touch", funnel.firstTouchesSent], ["Accepted", funnel.linkedinAccepted], ["Report sent", funnel.reportsSent], ["Replied", funnel.repliesReceived], ["Active conversation", funnel.activeConversations]];
  const max = Math.max(1, ...steps.map(([, value]) => value));
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: "inline-flex rounded-md border bg-muted/40 p-1",
      children: ["7d", "30d"].map((item) => /* @__PURE__ */ jsx("button", {
        type: "button",
        onClick: () => setWindow(item),
        className: cn("rounded-sm px-3 py-1 text-sm font-medium", window2 === item ? "bg-background shadow-sm" : "text-muted-foreground"),
        children: item
      }, item))
    }), /* @__PURE__ */ jsx("div", {
      className: "grid gap-3 md:grid-cols-3 xl:grid-cols-6",
      children: steps.map(([label, value]) => /* @__PURE__ */ jsx(Card, {
        children: /* @__PURE__ */ jsxs(CardContent, {
          className: "p-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-muted-foreground",
            children: label
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-1 text-2xl font-semibold tracking-tight",
            children: value
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-3 h-2 rounded-full bg-muted",
            children: /* @__PURE__ */ jsx("div", {
              className: "h-2 rounded-full bg-primary",
              style: {
                width: `${Math.max(4, Math.round(value / max * 100))}%`
              }
            })
          })]
        })
      }, label))
    })]
  });
}
function ChannelPerformanceTable({
  rows
}) {
  return /* @__PURE__ */ jsxs(Table, {
    children: [/* @__PURE__ */ jsx(TableHeader, {
      children: /* @__PURE__ */ jsxs(TableRow, {
        children: [/* @__PURE__ */ jsx(TableHead, {
          children: "Channel"
        }), /* @__PURE__ */ jsx(TableHead, {
          children: "Prospects"
        }), /* @__PURE__ */ jsx(TableHead, {
          children: "First touches"
        }), /* @__PURE__ */ jsx(TableHead, {
          children: "Replies"
        }), /* @__PURE__ */ jsx(TableHead, {
          children: "Conversations"
        }), /* @__PURE__ */ jsx(TableHead, {
          children: "Reply rate"
        })]
      })
    }), /* @__PURE__ */ jsx(TableBody, {
      children: rows.map((row) => /* @__PURE__ */ jsxs(TableRow, {
        children: [/* @__PURE__ */ jsx(TableCell, {
          className: "font-medium",
          children: row.channel === "twitter" ? "Twitter/X" : "LinkedIn"
        }), /* @__PURE__ */ jsx(TableCell, {
          children: row.prospects
        }), /* @__PURE__ */ jsx(TableCell, {
          children: row.firstTouches
        }), /* @__PURE__ */ jsx(TableCell, {
          children: row.replies
        }), /* @__PURE__ */ jsx(TableCell, {
          children: row.activeConversations
        }), /* @__PURE__ */ jsx(TableCell, {
          children: formatRate(row.replyRate)
        })]
      }, row.channel))
    })]
  });
}
function ImportQualityPanel({
  quality
}) {
  const rows = [["LEARN", quality.learn], ["WARM", quality.warm], ["SAVE", quality.save], ["SKIP", quality.skip]];
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsxs(CardHeader, {
      children: [/* @__PURE__ */ jsx(CardTitle, {
        children: "Import quality"
      }), /* @__PURE__ */ jsxs("p", {
        className: "text-sm text-muted-foreground",
        children: [formatRate(quality.learnRate), " LEARN rate"]
      })]
    }), /* @__PURE__ */ jsx(CardContent, {
      className: "space-y-3",
      children: rows.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-1 flex items-center justify-between text-sm",
          children: [/* @__PURE__ */ jsx("span", {
            children: label
          }), /* @__PURE__ */ jsx("span", {
            className: "font-medium",
            children: value
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "h-2 rounded-full bg-muted",
          children: /* @__PURE__ */ jsx("div", {
            className: "h-2 rounded-full bg-primary",
            style: {
              width: total ? `${Math.round(value / total * 100)}%` : "0%"
            }
          })
        })]
      }, label))
    })]
  });
}
function TopicPerformanceTable({
  rows
}) {
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsxs(CardHeader, {
      children: [/* @__PURE__ */ jsx(CardTitle, {
        children: "Top brief topics"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-sm text-muted-foreground",
        children: "Last 30 days for outreach/replies, current status for conversations."
      })]
    }), /* @__PURE__ */ jsx(CardContent, {
      children: /* @__PURE__ */ jsxs(Table, {
        children: [/* @__PURE__ */ jsx(TableHeader, {
          children: /* @__PURE__ */ jsxs(TableRow, {
            children: [/* @__PURE__ */ jsx(TableHead, {
              children: "Topic"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Prospects"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "First touches"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Replies"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Conversations"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Reply rate"
            })]
          })
        }), /* @__PURE__ */ jsx(TableBody, {
          children: rows.length ? rows.map((row) => /* @__PURE__ */ jsxs(TableRow, {
            children: [/* @__PURE__ */ jsx(TableCell, {
              className: "font-medium",
              children: row.topic
            }), /* @__PURE__ */ jsx(TableCell, {
              children: row.prospects
            }), /* @__PURE__ */ jsx(TableCell, {
              children: row.firstTouches
            }), /* @__PURE__ */ jsx(TableCell, {
              children: row.replies
            }), /* @__PURE__ */ jsx(TableCell, {
              children: row.activeConversations
            }), /* @__PURE__ */ jsx(TableCell, {
              children: formatRate(row.replyRate)
            })]
          }, row.topic)) : /* @__PURE__ */ jsx(TableRow, {
            children: /* @__PURE__ */ jsx(TableCell, {
              colSpan: 6,
              className: "text-muted-foreground",
              children: "No topics yet."
            })
          })
        })]
      })
    })]
  });
}
function StatsChart({
  title,
  detail,
  points,
  totalLabel
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const latest = points.at(-1)?.value || 0;
  return /* @__PURE__ */ jsx(Card, {
    children: /* @__PURE__ */ jsxs(CardContent, {
      className: "p-5",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-semibold",
            children: title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-1 text-sm text-muted-foreground",
            children: detail
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-left sm:text-right",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-2xl font-semibold tracking-tight",
            children: latest
          }), /* @__PURE__ */ jsx("p", {
            className: "text-xs font-medium uppercase text-muted-foreground",
            children: totalLabel === "total" ? `${total} total` : totalLabel
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-5 grid h-40 grid-cols-7 items-end gap-2 border-b pb-2",
        children: points.map((point) => /* @__PURE__ */ jsxs("div", {
          className: "flex h-full flex-col justify-end gap-2",
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex min-h-6 items-center justify-center text-xs font-semibold text-muted-foreground",
            children: point.value
          }), /* @__PURE__ */ jsx("div", {
            className: "min-h-2 rounded-t-md bg-primary/80",
            style: {
              height: point.value === 0 ? "0px" : `${Math.max(8, Math.round(point.value / max * 104))}px`
            },
            title: `${point.date}: ${point.value}`
          })]
        }, point.date))
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-2 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground",
        children: points.map((point) => /* @__PURE__ */ jsx("span", {
          children: point.label
        }, point.date))
      })]
    })
  });
}
function formatRate(value) {
  if (value === null) return "-";
  return `${Math.round(value * 100)}%`;
}
function SectionTitle$1({
  title,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
    children: [/* @__PURE__ */ jsx("h2", {
      className: "text-xl font-semibold tracking-tight",
      children: title
    }), /* @__PURE__ */ jsx("p", {
      className: "text-sm text-muted-foreground",
      children: detail
    })]
  });
}
function TodayPanel({
  storageKey,
  title,
  items: items2,
  children
}) {
  const key = `outreach.dashboard.details.today-${storageKey}`;
  const defaultOpen = items2.length > 0;
  const [value, setValue] = useState(defaultOpen ? "item" : "");
  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved === "open") setValue("item");
    if (saved === "closed") setValue("");
  }, [key]);
  return /* @__PURE__ */ jsx(Accordion, {
    type: "single",
    collapsible: true,
    value,
    onValueChange: (next) => {
      setValue(next);
      window.localStorage.setItem(key, next ? "open" : "closed");
    },
    children: /* @__PURE__ */ jsxs(AccordionItem, {
      value: "item",
      className: "border-none",
      children: [/* @__PURE__ */ jsx(AccordionTrigger, {
        className: "rounded-lg border bg-card px-4 py-3 hover:no-underline data-[state=open]:rounded-b-none",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex w-full items-center justify-between gap-3 pr-3",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "font-semibold",
            children: title
          }), /* @__PURE__ */ jsx(Badge, {
            variant: items2.length ? "info" : "success",
            children: items2.length
          })]
        })
      }), /* @__PURE__ */ jsx(AccordionContent, {
        className: "rounded-b-lg border border-t-0 bg-card px-4 pb-4 pt-0",
        children: /* @__PURE__ */ jsx("div", {
          className: "grid gap-2",
          children: items2.length ? items2.map((item, index) => /* @__PURE__ */ jsx("div", {
            children: children(item)
          }, index)) : /* @__PURE__ */ jsx(EmptyState$1, {})
        })
      })]
    })
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
      className: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary",
      children: icon
    }), /* @__PURE__ */ jsxs("div", {
      className: "min-w-0",
      children: [/* @__PURE__ */ jsx("p", {
        className: "truncate font-medium",
        children: title
      }), /* @__PURE__ */ jsx("p", {
        className: "truncate text-sm text-muted-foreground",
        children: detail
      })]
    })]
  });
}
function outreachModeLabel$1(prospect) {
  if (prospect.source_channel === "twitter") return "Twitter/X";
  if (prospect.status === "to_contact") return "note optional";
  return prospect.outreach_mode === "no_note" ? "no note" : "with note";
}
function prospectPath(prospect) {
  return `/${prospect.workspace_slug || "tempolis"}/prospects/${prospect.id}`;
}
function ActionButton$1({
  intent,
  prospectId,
  label,
  icon,
  variant = "outline"
}) {
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
    }), /* @__PURE__ */ jsxs(Button, {
      type: "submit",
      variant,
      size: "sm",
      children: [icon, label]
    })]
  });
}
function CopyButton$1({
  label,
  value,
  compact = false
}) {
  return /* @__PURE__ */ jsxs(Button, {
    type: "button",
    variant: "outline",
    size: compact ? "sm" : "sm",
    onClick: () => {
      navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    },
    className: cn(compact && "h-8 px-2"),
    children: [/* @__PURE__ */ jsx(Clipboard, {
      className: "size-4"
    }), label]
  });
}
function EmptyState$1() {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed p-4 text-sm text-muted-foreground",
    children: "Nothing here."
  });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  default: home,
  loader: loader$c,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm font-medium leading-none select-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Select(props) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectValue(props) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[placeholder]:text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn("flex cursor-default items-center justify-center py-1", className),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUp, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn("flex cursor-default items-center justify-center py-1", className),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-4" })
    }
  );
}
const statuses = ["all", "to_contact", "connection_sent", "twitter_contacted", "accepted", "report_sent", "followup_sent", "saved_for_later", "skipped", "archived_declined", "archived"];
const meta$4 = () => [{
  title: "Prospects · Outreach"
}, {
  name: "description",
  content: "Browse and filter prospects stored in the outreach CRM."
}];
async function loader$b({
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  return await getDashboard(workspace);
}
const prospects__index = UNSAFE_withComponentProps(function ProspectsIndex() {
  const data2 = useLoaderData();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const status = params.get("status") || "all";
  const results = filterProspects(data2.prospects, query, status);
  function updateParams(nextQuery, nextStatus) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set("q", nextQuery);
    if (nextStatus !== "all") next.set("status", nextStatus);
    setParams(next);
  }
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl space-y-6",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase tracking-wide text-primary",
            children: "CRM"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-3xl font-semibold tracking-tight",
            children: "Prospects"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-sm text-muted-foreground",
            children: "Search every prospect stored in the CRM, including archived and skipped profiles."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-sm text-muted-foreground",
          children: [results.length, " of ", data2.prospects.length]
        })]
      }), /* @__PURE__ */ jsx(Card, {
        children: /* @__PURE__ */ jsx(CardContent, {
          className: "pt-6",
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "search",
                children: "Search"
              }), /* @__PURE__ */ jsxs("div", {
                className: "relative",
                children: [/* @__PURE__ */ jsx(Search, {
                  className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                }), /* @__PURE__ */ jsx(Input, {
                  id: "search",
                  value: query,
                  onChange: (event) => updateParams(event.target.value, status),
                  placeholder: "Name, company, URL, topic, status...",
                  className: "pl-9"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "status",
                children: "Status"
              }), /* @__PURE__ */ jsxs(Select, {
                value: status,
                onValueChange: (value) => updateParams(query, value),
                children: [/* @__PURE__ */ jsx(SelectTrigger, {
                  id: "status",
                  className: "w-full",
                  children: /* @__PURE__ */ jsx(SelectValue, {})
                }), /* @__PURE__ */ jsx(SelectContent, {
                  children: statuses.map((item) => /* @__PURE__ */ jsx(SelectItem, {
                    value: item,
                    children: item
                  }, item))
                })]
              })]
            })]
          })
        })
      }), /* @__PURE__ */ jsx(Card, {
        className: "overflow-hidden p-0",
        children: /* @__PURE__ */ jsxs(Table, {
          children: [/* @__PURE__ */ jsx(TableHeader, {
            children: /* @__PURE__ */ jsxs(TableRow, {
              children: [/* @__PURE__ */ jsx(TableHead, {
                children: "Prospect"
              }), /* @__PURE__ */ jsx(TableHead, {
                children: "Status"
              }), /* @__PURE__ */ jsx(TableHead, {
                children: "Tag"
              }), /* @__PURE__ */ jsx(TableHead, {
                children: "Wave"
              }), /* @__PURE__ */ jsx(TableHead, {
                children: "Brief"
              }), /* @__PURE__ */ jsx(TableHead, {
                className: "text-right",
                children: "Profile"
              })]
            })
          }), /* @__PURE__ */ jsx(TableBody, {
            children: results.length === 0 ? /* @__PURE__ */ jsx(TableRow, {
              children: /* @__PURE__ */ jsx(TableCell, {
                colSpan: 6,
                className: "py-10 text-center text-sm text-muted-foreground",
                children: "No prospects found."
              })
            }) : results.map((prospect) => /* @__PURE__ */ jsxs(TableRow, {
              children: [/* @__PURE__ */ jsxs(TableCell, {
                className: "max-w-md",
                children: [/* @__PURE__ */ jsx(Link$1, {
                  to: `/${data2.workspace.slug}/prospects/${prospect.id}`,
                  className: "font-medium text-foreground hover:text-primary",
                  children: prospect.name
                }), /* @__PURE__ */ jsx("p", {
                  className: "mt-0.5 truncate text-xs text-muted-foreground",
                  children: prospect.position
                })]
              }), /* @__PURE__ */ jsx(TableCell, {
                children: /* @__PURE__ */ jsx(Badge, {
                  variant: statusVariant(prospect.status),
                  children: prospect.status
                })
              }), /* @__PURE__ */ jsx(TableCell, {
                children: prospect.priority_tag ? /* @__PURE__ */ jsx(Badge, {
                  variant: "muted",
                  children: prospect.priority_tag
                }) : /* @__PURE__ */ jsx("span", {
                  className: "text-muted-foreground",
                  children: "-"
                })
              }), /* @__PURE__ */ jsx(TableCell, {
                className: "text-muted-foreground",
                children: prospect.wave || "-"
              }), /* @__PURE__ */ jsx(TableCell, {
                className: "max-w-xs truncate text-muted-foreground",
                children: prospect.brief_topic || "-"
              }), /* @__PURE__ */ jsx(TableCell, {
                className: "text-right",
                children: /* @__PURE__ */ jsxs("a", {
                  className: "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline",
                  href: prospect.twitter_url || prospect.profile_url,
                  target: "_blank",
                  rel: "noreferrer",
                  children: [prospect.source_channel === "twitter" ? "X" : "LinkedIn", /* @__PURE__ */ jsx(ExternalLink, {
                    className: "size-3"
                  })]
                })
              })]
            }, prospect.id))
          })]
        })
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
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: prospects__index,
  loader: loader$b,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const meta$3 = ({
  data: data2
}) => {
  const name = data2?.detail?.prospect?.name || "Prospect";
  return [{
    title: `${name} · Outreach`
  }];
};
async function loader$a({
  params
}) {
  const id = Number(params.id);
  const workspace = await requireWorkspace(params.workspaceSlug);
  const detail = await getProspectDetail(id, workspace.id);
  if (!detail) {
    throw new Response("Prospect not found", {
      status: 404
    });
  }
  return {
    detail
  };
}
async function action$5({
  request,
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  const formData = await request.formData();
  await runProspectAction(formData, workspace.id);
  if (String(formData.get("intent") || "") === "deleteProspect") {
    return redirect(`/${workspace.slug}`);
  }
  return redirect(`/${workspace.slug}/prospects/${params.id}`);
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
  const defaultOpen = [prospect.source_channel === "linkedin" && !archiveMode ? "outreach-mode" : null, !archiveMode ? "brief" : null, !archiveMode ? "messages" : null, prospect.notes ? "notes" : null].filter((item) => Boolean(item));
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl space-y-6",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "min-w-0",
          children: [/* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "ghost",
            size: "sm",
            className: "-ml-3",
            children: /* @__PURE__ */ jsxs(Link$1, {
              to: `/${prospect.workspace_slug || "tempolis"}`,
              children: [/* @__PURE__ */ jsx(ArrowLeft, {
                className: "size-4"
              }), "Dashboard"]
            })
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-3 text-3xl font-semibold tracking-tight",
            children: prospect.name
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-sm text-muted-foreground",
            children: prospect.position
          }), /* @__PURE__ */ jsxs("a", {
            className: "mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline",
            href: prospect.twitter_url || prospect.profile_url,
            target: "_blank",
            rel: "noreferrer",
            children: [prospect.source_channel === "twitter" ? "X profile" : "LinkedIn profile", /* @__PURE__ */ jsx(ExternalLink, {
              className: "size-3.5"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap items-start gap-2",
          children: [/* @__PURE__ */ jsx(Badge, {
            variant: "muted",
            children: prospect.workspace_name || "Workspace"
          }), prospect.priority_tag ? /* @__PURE__ */ jsx(Badge, {
            variant: "muted",
            children: prospect.priority_tag
          }) : null, /* @__PURE__ */ jsxs(Badge, {
            variant: "muted",
            children: ["Wave ", prospect.wave || "-"]
          }), /* @__PURE__ */ jsx(Badge, {
            variant: "info",
            children: prospect.source_channel === "twitter" ? "Twitter/X" : "LinkedIn"
          }), /* @__PURE__ */ jsx(Badge, {
            variant: prospect.outreach_mode === "no_note" ? "info" : "success",
            children: outreachModeLabel(prospect)
          }), /* @__PURE__ */ jsx(Badge, {
            variant: statusVariant(prospect.status),
            children: prospect.status
          }), /* @__PURE__ */ jsx(ArchiveControls, {
            prospect
          }), /* @__PURE__ */ jsx(DeleteProspectButton, {
            prospect
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-6",
          children: [/* @__PURE__ */ jsxs(Card, {
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Actions in progress"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Do these from top to bottom."
              })]
            }), /* @__PURE__ */ jsx(CardContent, {
              className: "grid gap-3",
              children: openTasks.length ? openTasks.map((task) => /* @__PURE__ */ jsx(OpenTask, {
                task,
                prospect,
                today
              }, task.id)) : /* @__PURE__ */ jsx(EmptyState, {})
            })]
          }), /* @__PURE__ */ jsxs(Accordion, {
            type: "multiple",
            defaultValue: defaultOpen,
            className: "space-y-4",
            children: [prospect.source_channel === "linkedin" ? /* @__PURE__ */ jsx(SectionAccordion, {
              value: "outreach-mode",
              title: "Outreach mode",
              detail: "Switch the copy strategy before sending.",
              children: /* @__PURE__ */ jsxs("div", {
                className: "grid gap-3 rounded-lg border bg-muted/30 p-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("p", {
                    className: "font-semibold",
                    children: outreachModeLabel(prospect)
                  }), /* @__PURE__ */ jsx("p", {
                    className: "mt-1 text-sm text-muted-foreground",
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
                    variant: prospect.outreach_mode !== "no_note" ? "default" : "outline"
                  }), /* @__PURE__ */ jsx(ActionButton, {
                    intent: "switchToWithNoteMode",
                    prospectId: prospect.id,
                    label: "Use with-note mode",
                    icon: /* @__PURE__ */ jsx(Send, {
                      size: 16
                    }),
                    variant: prospect.outreach_mode === "no_note" ? "default" : "outline"
                  })]
                })]
              })
            }) : null, /* @__PURE__ */ jsx(SectionAccordion, {
              value: "brief",
              title: "Brief",
              detail: "Topic, preparation notes and shared URL.",
              children: /* @__PURE__ */ jsxs("div", {
                className: "grid gap-4 md:grid-cols-2",
                children: [/* @__PURE__ */ jsxs(Form, {
                  method: "post",
                  className: "space-y-3",
                  children: [/* @__PURE__ */ jsx("input", {
                    type: "hidden",
                    name: "intent",
                    value: "updateBriefStrategy"
                  }), /* @__PURE__ */ jsx("input", {
                    type: "hidden",
                    name: "prospectId",
                    value: prospect.id
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "space-y-2",
                    children: [/* @__PURE__ */ jsx(Label, {
                      htmlFor: "briefTopic",
                      children: "Topic"
                    }), /* @__PURE__ */ jsx(Input, {
                      id: "briefTopic",
                      name: "briefTopic",
                      defaultValue: prospect.brief_topic || "",
                      required: true,
                      maxLength: 80,
                      placeholder: "Narrative risk"
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "space-y-2",
                    children: [/* @__PURE__ */ jsx(Label, {
                      htmlFor: "briefPreparation",
                      children: "Preparation notes"
                    }), /* @__PURE__ */ jsx(Textarea, {
                      id: "briefPreparation",
                      name: "briefPreparation",
                      defaultValue: prospect.preparation_notes || "",
                      rows: 4,
                      placeholder: "Why this subject fits the profile, source signal, angle to prepare..."
                    })]
                  }), /* @__PURE__ */ jsxs(Button, {
                    type: "submit",
                    variant: "outline",
                    size: "sm",
                    children: [/* @__PURE__ */ jsx(Save, {
                      className: "size-4"
                    }), "Save brief theme"]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    children: "Shared URL"
                  }), prospect.shared_url ? /* @__PURE__ */ jsxs("a", {
                    className: "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline",
                    href: prospect.shared_url,
                    target: "_blank",
                    rel: "noreferrer",
                    children: [prospect.shared_url, /* @__PURE__ */ jsx(ExternalLink, {
                      className: "size-3.5"
                    })]
                  }) : /* @__PURE__ */ jsxs(Form, {
                    method: "post",
                    className: "flex gap-2",
                    children: [/* @__PURE__ */ jsx("input", {
                      type: "hidden",
                      name: "intent",
                      value: "addBriefUrl"
                    }), /* @__PURE__ */ jsx("input", {
                      type: "hidden",
                      name: "prospectId",
                      value: prospect.id
                    }), /* @__PURE__ */ jsx(Input, {
                      name: "sharedUrl",
                      type: "url",
                      required: true,
                      placeholder: "https://tempolis.com/share/...",
                      className: "flex-1"
                    }), /* @__PURE__ */ jsxs(Button, {
                      type: "submit",
                      variant: "outline",
                      size: "sm",
                      children: [/* @__PURE__ */ jsx(Link, {
                        className: "size-4"
                      }), "Add URL"]
                    })]
                  })]
                })]
              })
            }), /* @__PURE__ */ jsxs(SectionAccordion, {
              value: "messages",
              title: "Messages",
              detail: prospect.source_channel === "twitter" ? "Copy exact Twitter/X copy." : "Copy exact LinkedIn copy.",
              children: [prospect.source_channel === "linkedin" ? /* @__PURE__ */ jsx("div", {
                className: "mb-4 flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3",
                children: /* @__PURE__ */ jsx(ActionButton, {
                  intent: "regenerateSaferCopy",
                  prospectId: prospect.id,
                  label: "Regenerate safer copy",
                  icon: /* @__PURE__ */ jsx(RefreshCw, {
                    size: 16
                  }),
                  variant: "outline"
                })
              }) : null, prospect.source_channel === "twitter" ? /* @__PURE__ */ jsxs("div", {
                className: "grid gap-3",
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
                className: "grid gap-3",
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
            })]
          }), /* @__PURE__ */ jsxs(Card, {
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Reply handling"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "If this prospect replies, paste it here and answer instead of following up."
              })]
            }), /* @__PURE__ */ jsx(CardContent, {
              children: /* @__PURE__ */ jsx(ReplyPanel, {
                prospect,
                replies
              })
            })]
          }), /* @__PURE__ */ jsx(Accordion, {
            type: "multiple",
            defaultValue: defaultOpen,
            children: /* @__PURE__ */ jsx(SectionAccordion, {
              value: "notes",
              title: "Internal note",
              detail: "Small private CRM note.",
              children: /* @__PURE__ */ jsxs(Form, {
                method: "post",
                className: "space-y-3",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "hidden",
                  name: "intent",
                  value: "updateProspectNotes"
                }), /* @__PURE__ */ jsx("input", {
                  type: "hidden",
                  name: "prospectId",
                  value: prospect.id
                }), prospect.notes ? /* @__PURE__ */ jsx("div", {
                  className: "rounded-md border bg-muted/30 p-3 text-sm",
                  children: /* @__PURE__ */ jsx("p", {
                    className: "whitespace-pre-wrap",
                    children: prospect.notes
                  })
                }) : null, /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx(Label, {
                    htmlFor: "notes",
                    children: "Note"
                  }), /* @__PURE__ */ jsx(Textarea, {
                    id: "notes",
                    name: "notes",
                    defaultValue: prospect.notes || "",
                    rows: 3,
                    placeholder: "Tiny internal note, context, next angle..."
                  })]
                }), /* @__PURE__ */ jsxs(Button, {
                  type: "submit",
                  variant: "outline",
                  size: "sm",
                  children: [/* @__PURE__ */ jsx(Save, {
                    className: "size-4"
                  }), "Save note"]
                })]
              })
            })
          }), /* @__PURE__ */ jsxs(Card, {
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Past and future"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Task history for this prospect."
              })]
            }), /* @__PURE__ */ jsx(CardContent, {
              className: "grid gap-3",
              children: tasks.length ? tasks.map((task) => /* @__PURE__ */ jsx(TaskRow, {
                task,
                today
              }, task.id)) : /* @__PURE__ */ jsx(EmptyState, {})
            })]
          })]
        }), /* @__PURE__ */ jsx("aside", {
          className: "h-fit lg:sticky lg:top-6",
          children: /* @__PURE__ */ jsxs(Card, {
            children: [/* @__PURE__ */ jsxs(CardHeader, {
              children: [/* @__PURE__ */ jsx(CardTitle, {
                children: "Timeline"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Actions already logged."
              })]
            }), /* @__PURE__ */ jsxs(CardContent, {
              className: "space-y-4",
              children: [events.length ? events.map((event) => /* @__PURE__ */ jsxs("div", {
                className: "border-l-2 border-primary pl-3",
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: event.type
                }), /* @__PURE__ */ jsx("p", {
                  className: "mt-1 text-sm text-muted-foreground",
                  children: event.note
                }), /* @__PURE__ */ jsx("p", {
                  className: "mt-1 text-xs text-muted-foreground",
                  children: event.happened_at
                })]
              }, event.id)) : /* @__PURE__ */ jsx(EmptyState, {}), doneTasks.length ? /* @__PURE__ */ jsxs("div", {
                className: "border-t pt-4",
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
          })
        })]
      })]
    })
  });
});
function SectionAccordion({
  value,
  title,
  detail,
  children
}) {
  return /* @__PURE__ */ jsxs(AccordionItem, {
    value,
    className: "overflow-hidden rounded-lg border bg-card",
    children: [/* @__PURE__ */ jsx(AccordionTrigger, {
      className: "px-5 py-4 hover:no-underline",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-1 text-left sm:flex-row sm:items-end sm:justify-between sm:gap-4",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-xl font-semibold tracking-tight",
          children: title
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm font-normal text-muted-foreground",
          children: detail
        })]
      })
    }), /* @__PURE__ */ jsx(AccordionContent, {
      className: "px-5 pb-5 pt-0",
      children
    })]
  });
}
function OpenTask({
  task,
  prospect,
  today
}) {
  const overdue = task.due_date && task.due_date < today;
  return /* @__PURE__ */ jsx("div", {
    className: cn("rounded-lg border bg-muted/30 p-4", overdue && "border-amber-500/70 dark:border-amber-400/70"),
    children: /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "font-semibold",
          children: task.title
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-muted-foreground",
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
          variant: "default"
        }), /* @__PURE__ */ jsx(CopyButton, {
          label: "Copy note",
          value: prospect.connection_message || ""
        }), /* @__PURE__ */ jsx(ActionButton, {
          intent: "markConnectionSentWithNote",
          prospectId: prospect.id,
          label: "Sent with note",
          icon: /* @__PURE__ */ jsx(Send, {
            size: 16
          }),
          variant: "outline"
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
        variant: "default"
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markConnectionSentWithoutNote",
        prospectId: prospect.id,
        label: "Sent without note",
        icon: /* @__PURE__ */ jsx(UserCheck, {
          size: 16
        }),
        variant: "outline"
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
        variant: "default"
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "archiveDeclined",
        prospectId: prospect.id,
        label: "Archive declined",
        icon: /* @__PURE__ */ jsx(Archive, {
          size: 16
        }),
        variant: "destructive"
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
        variant: "default"
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
        variant: "default"
      })]
    });
  }
  if (task.type === "send_twitter_dm") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy DM",
        value: prospect.twitter_dm_message || ""
      }), /* @__PURE__ */ jsx(Button, {
        asChild: true,
        variant: "outline",
        size: "sm",
        children: /* @__PURE__ */ jsxs("a", {
          href: prospect.twitter_url || prospect.profile_url,
          target: "_blank",
          rel: "noreferrer",
          children: [/* @__PURE__ */ jsx(AtSign, {
            className: "size-4"
          }), "Open X"]
        })
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markTwitterDmSent",
        prospectId: prospect.id,
        label: "Mark DM sent",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        variant: "default"
      })]
    });
  }
  if (task.type === "send_twitter_followup") {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy follow-up",
        value: prospect.twitter_followup_message || ""
      }), /* @__PURE__ */ jsx(Button, {
        asChild: true,
        variant: "outline",
        size: "sm",
        children: /* @__PURE__ */ jsxs("a", {
          href: prospect.twitter_url || prospect.profile_url,
          target: "_blank",
          rel: "noreferrer",
          children: [/* @__PURE__ */ jsx(AtSign, {
            className: "size-4"
          }), "Open X"]
        })
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markTwitterFollowupSent",
        prospectId: prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(CalendarCheck, {
          size: 16
        }),
        variant: "default"
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
    className: cn("rounded-lg border bg-muted/30", compact ? "p-3" : "p-4", overdue && "border-amber-500/70 dark:border-amber-400/70"),
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
      children: [/* @__PURE__ */ jsx("p", {
        className: "font-medium",
        children: task.title
      }), /* @__PURE__ */ jsx(Badge, {
        variant: task.status === "open" ? "info" : "success",
        children: task.status
      })]
    }), /* @__PURE__ */ jsxs("p", {
      className: "mt-1 text-sm text-muted-foreground",
      children: [task.type, " ", task.due_date ? `· due ${task.due_date}` : "", " ", task.completed_at ? `· completed ${task.completed_at}` : ""]
    })]
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
    className: "rounded-lg border bg-muted/30 p-4",
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
        }), /* @__PURE__ */ jsxs(Button, {
          type: "submit",
          variant: "outline",
          size: "sm",
          className: "h-8",
          children: [/* @__PURE__ */ jsx(Save, {
            className: "size-3.5"
          }), "Save"]
        })]
      })]
    }), /* @__PURE__ */ jsx(Textarea, {
      name: "messageContent",
      defaultValue: content,
      rows: Math.max(3, Math.min(8, content.split("\n").length + 1)),
      className: "mt-3"
    })]
  });
}
function ReadonlyMessage({
  title,
  content
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border bg-muted/30 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-semibold",
          children: title
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-xs font-medium text-muted-foreground",
          children: "Sent. Locked to preserve history."
        })]
      }), /* @__PURE__ */ jsx(CopyButton, {
        label: "Copy",
        value: content,
        compact: true
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 whitespace-pre-wrap rounded-md border bg-background p-3 text-sm",
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
    className: "grid gap-4",
    children: [latest ? /* @__PURE__ */ jsx(ReplyEditor, {
      prospect,
      reply: latest
    }) : null, /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "rounded-lg border bg-muted/30 p-4",
      children: [/* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "intent",
        value: "addProspectReply"
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "prospectId",
        value: prospect.id
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-2",
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "inboundContent",
          children: "Prospect reply"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "inboundContent",
          name: "inboundContent",
          rows: 4,
          required: true,
          placeholder: "Paste the LinkedIn reply here..."
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3 space-y-2",
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "responseDirection",
          children: "Response direction"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "responseDirection",
          name: "responseDirection",
          rows: 3,
          placeholder: "Optional. Example: thank them, clarify this is early, ask what signal would make it useful for their team..."
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-3 space-y-2",
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "suggestedResponse",
          children: "Draft response"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "suggestedResponse",
          name: "suggestedResponse",
          rows: 4,
          placeholder: "Optional manual override. Leave empty and the app will generate a draft from the direction above."
        })]
      }), /* @__PURE__ */ jsxs(Button, {
        type: "submit",
        className: "mt-3",
        children: [/* @__PURE__ */ jsx(MessageSquareReply, {
          className: "size-4"
        }), "Save and draft response"]
      })]
    })]
  });
}
function ReplyEditor({
  prospect,
  reply
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border bg-muted/30 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm font-semibold",
          children: "Latest reply"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-xs text-muted-foreground",
          children: reply.created_at
        })]
      }), reply.sent_at ? /* @__PURE__ */ jsxs(Badge, {
        variant: "success",
        children: ["sent ", reply.sent_at]
      }) : /* @__PURE__ */ jsx(Badge, {
        variant: "info",
        children: "response draft"
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-3 whitespace-pre-wrap rounded-md border bg-background p-3 text-sm",
      children: reply.inbound_content
    }), !reply.sent_at ? /* @__PURE__ */ jsxs(Form, {
      method: "post",
      className: "mt-3 rounded-md border bg-background p-3",
      children: [/* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "intent",
        value: "regenerateReplyResponse"
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "prospectId",
        value: prospect.id
      }), /* @__PURE__ */ jsx("input", {
        type: "hidden",
        name: "replyId",
        value: reply.id
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-2",
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: `responseDirection-${reply.id}`,
          children: "Regenerate direction"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: `responseDirection-${reply.id}`,
          name: "responseDirection",
          rows: 3,
          placeholder: "Example: answer warmly, say the brief is a prototype, ask if a competitor comparison would be more useful..."
        })]
      }), /* @__PURE__ */ jsxs(Button, {
        type: "submit",
        variant: "outline",
        size: "sm",
        className: "mt-3",
        children: [/* @__PURE__ */ jsx(RefreshCw, {
          className: "size-3.5"
        }), "Regenerate draft"]
      })]
    }) : null, /* @__PURE__ */ jsxs(Form, {
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
          }), /* @__PURE__ */ jsxs(Button, {
            type: "submit",
            variant: "outline",
            size: "sm",
            className: "h-8",
            children: [/* @__PURE__ */ jsx(Save, {
              className: "size-3.5"
            }), "Save"]
          })]
        })]
      }), /* @__PURE__ */ jsx(Textarea, {
        name: "suggestedResponse",
        defaultValue: reply.suggested_response || "",
        rows: 5,
        required: true,
        disabled: Boolean(reply.sent_at),
        className: "mt-2"
      })]
    }), !reply.sent_at ? /* @__PURE__ */ jsx("div", {
      className: "mt-3",
      children: /* @__PURE__ */ jsx(ActionButton, {
        intent: "markReplySent",
        prospectId: prospect.id,
        label: "Mark response sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        variant: "default",
        extra: {
          replyId: String(reply.id)
        }
      })
    }) : null]
  });
}
function NoNoteCallout() {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border bg-muted/30 p-4",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm font-semibold",
      children: "Connection note"
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 text-sm text-muted-foreground",
      children: "No custom note was sent. Use the first message after acceptance instead."
    })]
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
  variant = "outline",
  extra
}) {
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
    }, key)) : null, /* @__PURE__ */ jsxs(Button, {
      type: "submit",
      variant,
      size: "sm",
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
    }), /* @__PURE__ */ jsx(Button, {
      type: "submit",
      variant: "destructive",
      size: "sm",
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
      }),
      variant: "outline"
    });
  }
  return /* @__PURE__ */ jsx(ActionButton, {
    intent: "archiveProspect",
    prospectId: prospect.id,
    label: "Archive",
    icon: /* @__PURE__ */ jsx(Archive, {
      size: 14
    }),
    variant: "destructive"
  });
}
function CopyButton({
  label,
  value,
  compact = false
}) {
  return /* @__PURE__ */ jsxs(Button, {
    type: "button",
    variant: "outline",
    size: "sm",
    className: cn(compact && "h-8"),
    onClick: () => {
      navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    },
    children: [/* @__PURE__ */ jsx(Clipboard, {
      className: "size-3.5"
    }), label]
  });
}
function EmptyState() {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed p-4 text-sm text-muted-foreground",
    children: "Nothing here."
  });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: prospect_$id,
  loader: loader$a,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "..", "..", "..");
async function analyzeProspectTable(tableText, workspace) {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No prospects found. Paste a table with Name, Position, Profile URL and About columns.");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }
  const template = await getActivePromptTemplate(workspace.id, "linkedin", "batch_analysis");
  const docs = await getWorkspaceDocs(workspace.id);
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderPrompt(template.user_prompt, {
    workspace,
    docs,
    prospects
  });
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt
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
  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    inputJson: { tableText, prospects, prompt },
    outputJson: parsed,
    model
  });
  return normalizeAnalysis(parsed, prospects.length, workspace.product_name);
}
async function analyzeTwitterProspectTable(tableText, workspace) {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No Twitter/X prospects found. Add at least a name and profile URL or handle.");
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }
  const template = await getActivePromptTemplate(workspace.id, "twitter", "batch_analysis");
  const docs = await getWorkspaceDocs(workspace.id);
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderPrompt(template.user_prompt, {
    workspace,
    docs,
    prospects
  });
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App"
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt
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
  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    inputJson: { tableText, prospects, prompt },
    outputJson: parsed,
    model
  });
  return normalizeTwitterAnalysis(parsed, prospects.length, workspace.product_name);
}
function prospectEvidenceToTable(profile) {
  const evidence = [
    "Source: browser extension single-profile capture.",
    "Important: do not classify as LEARN by default. Apply the strict LEARN/WARM/SAVE/SKIP strategy.",
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
  ].map(cleanCell).join("	");
  return [header.join("	"), row].join("\n");
}
function cleanCell(value) {
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
function renderPrompt(template, input) {
  return template.replaceAll("{{productName}}", input.workspace.product_name).replaceAll("{{workspaceName}}", input.workspace.name).replaceAll("{{defaultLanguage}}", input.workspace.default_language || "en").replaceAll("{{workspaceDocs}}", formatWorkspaceDocs(input.docs)).replaceAll("{{prospectsJson}}", JSON.stringify(input.prospects, null, 2)).concat("\n\n", STRICT_CLASSIFICATION_POLICY);
}
const STRICT_CLASSIFICATION_POLICY = `
STRICT OUTREACH CLASSIFICATION POLICY
- LEARN: good profile to learn from, and contactable now. Use only when the profile is clearly in ICP, likely to understand the product promise, has enough visible evidence to personalize a brief, and can produce useful feedback immediately.
- WARM: very good profile, but not critical yet. Use when the person is relevant but should wait for 1 or 2 product/outreach iterations, or when evidence is promising but not strong enough for today's first wave.
- SAVE: premium prospect to keep for later. Use for senior, high-leverage, high-brand-value, hard-to-reach, or strategically important profiles that deserve a stronger product/proof point before contacting.
- SKIP: outside target, too weak, too generic, low probability of useful feedback, not enough evidence, or likely to be a poor learning conversation.

SELECTION RULES
- Never classify a prospect as LEARN just because they match a broad industry, title, or keyword.
- For a browser-extension single-profile capture, still choose WARM, SAVE, or SKIP when appropriate.
- contactToday=true only for LEARN wave 1 profiles that are genuinely worth contacting now.
- If the evidence is thin, generic, scraped footer text, or mostly unrelated page noise, prefer WARM or SKIP.
- If the profile is excellent but senior/premium enough that a weak early message could waste the opportunity, choose SAVE.
- If there is no concrete brief angle, do not mark LEARN.
`;
function formatWorkspaceDocs(docs) {
  return docs.map((doc) => `## ${doc.title} (${doc.type})
${doc.content.slice(0, 18e3)}`).join("\n\n---\n\n");
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
      name: clean$1(row.name),
      position: clean$1(row.position),
      profileUrl: clean$1(row.profileurl || row.profile || row.linkedin || row.url),
      about: clean$1(row.about),
      signals: clean$1(row.signals || row.recentposts || row.posts || row.activity || row.evidence),
      briefDirection: clean$1(row.briefdirection || row.briefseed || row.topicseed || row.suggestedtopic || row.preferredtopic)
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
function normalizeAnalysis(value, total, productName = "Tempolis") {
  const input = value;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map((item) => normalizeProspect(item, productName)).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length
  };
  return { summary, prospects };
}
function normalizeTwitterAnalysis(value, total, productName = "Tempolis") {
  const input = value;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map((item) => normalizeTwitterProspect(item, productName)).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length
  };
  return { summary, prospects };
}
function normalizeProspect(item, productName = "Tempolis") {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(String(item.priorityTag)) ? item.priorityTag : "SKIP";
  const wave = typeof item.wave === "number" ? item.wave : null;
  const rawBriefTopic = clean$1(item.briefTopic).split(/\s+/).slice(0, 3).join(" ");
  const briefTopic = isGenericBriefTopic(rawBriefTopic, productName) ? fallbackBriefTopic(item, productName) : rawBriefTopic;
  const firstName2 = clean$1(item.name).split(/\s+/)[0] || clean$1(item.name);
  const connectionMessage = enforceEnglish(
    clean$1(item.connectionMessage),
    `Hi ${firstName2}, I'm building ${productName} and testing short briefs for public affairs professionals. I prepared one on ${briefTopic || "your policy area"}. Would value your view.`
  );
  const reportMessage = enforceEnglish(
    clean$1(item.reportMessage),
    `Hi ${firstName2},

As promised, the brief on ${briefTopic || "your policy area"}: what public discourse is saying over the last 24 hours, outside media coverage.

[shared link]

I'm testing it with relevant profiles before a proper launch. If the angle resonates, or if something feels off in the brief, your feedback would mean a lot.`
  );
  const noNoteFallback = noNoteFallbackCopy(firstName2, briefTopic, item.position, item.about, item.recommendedTemplate, productName);
  const noNoteReportMessage = noPriorNoteCopy(enforceEnglish(clean$1(item.noNoteReportMessage), noNoteFallback), noNoteFallback);
  const followupMessage = enforceEnglish(
    clean$1(item.followupMessage),
    `Hi ${firstName2}, following up in case the brief slipped through. No worries if this isn't the right timing.`
  );
  return {
    name: clean$1(item.name),
    position: clean$1(item.position),
    profileUrl: clean$1(item.profileUrl),
    about: clean$1(item.about),
    priorityTag: tag,
    wave,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: clean$1(item.rationale),
    briefTopic,
    briefPreparation: clean$1(item.briefPreparation),
    recommendedTemplate: clean$1(item.recommendedTemplate),
    connectionMessage: connectionMessage.slice(0, 300),
    reportMessage,
    noNoteReportMessage,
    followupMessage
  };
}
function normalizeTwitterProspect(item, productName = "Tempolis") {
  const base = normalizeProspect({
    ...item,
    connectionMessage: "",
    reportMessage: "",
    noNoteReportMessage: "",
    followupMessage: item.twitterFollowupMessage || item.followupMessage || ""
  }, productName);
  const profileUrl = normalizeTwitterProfileUrl(item.profileUrl || item.twitterUrl || item.twitterHandle || "");
  const first = clean$1(item.name).split(/\s+/)[0] || clean$1(item.name);
  const topic = base.briefTopic || "Narrative risk";
  return {
    ...base,
    profileUrl,
    sourceChannel: "twitter",
    twitterUrl: profileUrl,
    twitterHandle: normalizeTwitterHandle(item.twitterHandle || profileUrl),
    twitterDmMessage: sanitizeTwitterDm(
      enforceEnglish(clean$1(item.twitterDmMessage), twitterDmFallback(first, topic, item, productName)),
      twitterDmFallback(first, topic, item, productName)
    ),
    twitterFollowupMessage: enforceEnglish(
      clean$1(item.twitterFollowupMessage || item.followupMessage),
      `Hi ${first}, quick follow-up in case the brief slipped through. Even a short read on whether the angle is useful would help.`
    )
  };
}
function normalizeTwitterProfileUrl(value) {
  const handle = normalizeTwitterHandle(value);
  return handle ? `https://x.com/${handle}` : clean$1(value);
}
function twitterDmFallback(firstName2, topic, item, productName = "Tempolis") {
  const signal = twitterSourceSignal(item);
  return `Hi ${firstName2}, I'm building ${productName} and testing a short brief format.

I prepared one on ${topic}, based on ${signal}.

[shared link]

Would your read be that the angle and signal are useful, or off?`;
}
function twitterSourceSignal(item) {
  const evidence = clean$1([item.briefPreparation, item.rationale, item.about, item.recommendedTemplate].filter(Boolean).join(" "));
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
  const trimmed = clean$1(value);
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
function isGenericBriefTopic(value, productName = "Tempolis") {
  const normalized = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const commonGenericTopics = [
    "policy",
    "public policy",
    "communications",
    "public affairs",
    "eu affairs",
    "regulation",
    "strategy",
    "stakeholder management"
  ];
  const narralensGenericTopics = [
    "brand",
    "brand perception",
    "perception",
    "social listening",
    "brand monitoring",
    "campaign monitoring",
    "campaign",
    "marketing",
    "reputation",
    "consumer insights",
    "narrative intelligence",
    "competitive intelligence"
  ];
  return [...commonGenericTopics, ...isNarralens(productName) ? narralensGenericTopics : []].includes(normalized);
}
function fallbackBriefTopic(item, productName = "Tempolis") {
  const text = `${clean$1(item.position)} ${clean$1(item.about)} ${clean$1(item.rationale)} ${clean$1(item.recommendedTemplate)}`.toLowerCase();
  if (isNarralens(productName)) {
    if (/\b(openai|chatgpt|anthropic|claude|ai launch|artificial intelligence)\b/.test(text)) return "OpenAI launch";
    if (/\b(nike|adidas|sport|sneaker|fashion|retail|sustainability)\b/.test(text)) return "Nike sustainability";
    if (/\b(notion|clickup|saas|productivity|b2b)\b/.test(text)) return "Notion vs ClickUp";
    if (/\b(apple|vision pro|consumer tech|hardware)\b/.test(text)) return "Apple Vision Pro";
    if (/\b(duolingo|social|community|tiktok|campaign|creator)\b/.test(text)) return "Duolingo marketing";
    if (/\b(tesla|elon|automotive|ev|robotaxi)\b/.test(text)) return "Tesla robotaxi";
    if (/\b(competitor|competitive|positioning|market)\b/.test(text)) return "Notion vs ClickUp";
    if (/\b(launch|announcement|release)\b/.test(text)) return "OpenAI launch";
    return "Nike sustainability";
  }
  if (/\b(ai|artificial intelligence|ai act)\b/.test(text)) return "AI Act";
  if (/\b(energy|climate|grid|power)\b/.test(text)) return "Energy security";
  if (/\b(competitiveness|industry|industrial)\b/.test(text)) return "EU competitiveness";
  if (/\b(trade|tariff|canada|market access)\b/.test(text)) return "Trade tensions";
  if (/\b(privacy|gdpr|data)\b/.test(text)) return "Data privacy";
  if (/\b(digital|tech|platform)\b/.test(text)) return "Tech regulation";
  if (/\b(communications|comms|reputation|narrative|editorial)\b/.test(text)) return "Narrative risk";
  return "Policy backlash";
}
function isNarralens(productName = "Tempolis") {
  return productName.toLowerCase() === "narralens";
}
function noNoteFallbackCopy(firstName2, briefTopic, position, about, template, productName = "Tempolis") {
  const topic = briefTopic || "your policy area";
  const context = prospectContext(position, about, template);
  if (isNarralens(productName)) {
    return `Hi ${firstName2},

Thanks for connecting. I'm building ${productName} and testing short briefs for brand/social workflows, so I prepared one on ${topic} as a concrete campaign or competitor readout.

[shared link]

If the angle feels useful for the kind of monitoring or client updates you deal with, your blunt feedback would help a lot.`;
  }
  return `Hi ${firstName2},

Thanks for connecting. I'm building ${productName} and testing short briefs, and I prepared one on ${topic} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`;
}
function prospectContext(position, about, template) {
  const text = `${clean$1(position)} ${clean$1(about)} ${clean$1(template)}`.toLowerCase();
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
function clean$1(value) {
  return String(value || "").trim();
}
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Root,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring outline-none",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
const emptyRow = {
  name: "",
  position: "",
  profileUrl: "",
  about: "",
  signals: "",
  briefDirection: ""
};
const meta$2 = () => [{
  title: "Import · Outreach"
}, {
  name: "description",
  content: "Import and classify LinkedIn or X prospects in one place."
}];
async function action$4({
  request,
  params
}) {
  const formData = await request.formData();
  const source = String(formData.get("source") || "linkedin") === "x" ? "x" : "linkedin";
  const table = String(formData.get("table") || "");
  const workspace = await requireWorkspace(params.workspaceSlug);
  try {
    const analysis = source === "x" ? await analyzeTwitterProspectTable(table, workspace) : await analyzeProspectTable(table, workspace);
    await importAnalyzedProspects(analysis.prospects, workspace.id);
    return {
      ok: true,
      source,
      analysis
    };
  } catch (error) {
    return {
      ok: false,
      source,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
const _import = UNSAFE_withComponentProps(function ImportPage() {
  const [params, setParams] = useSearchParams();
  const source = params.get("source") === "x" ? "x" : "linkedin";
  function setSource(next) {
    const nextParams = new URLSearchParams(params);
    if (next === "linkedin") nextParams.delete("source");
    else nextParams.set("source", next);
    setParams(nextParams, {
      preventScrollReset: true
    });
  }
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl space-y-6",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase tracking-wide text-primary",
            children: "Prospecting"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-3xl font-semibold tracking-tight",
            children: "Import prospects"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-sm text-muted-foreground",
            children: "Paste profiles from LinkedIn or X, submit, and the app will classify them, generate outreach copy, and save everything to the CRM."
          })]
        }), /* @__PURE__ */ jsx(Badge, {
          variant: "muted",
          className: "px-3 py-1 text-[11px]",
          children: "Model: google/gemini-2.5-flash-lite"
        })]
      }), /* @__PURE__ */ jsxs(Tabs, {
        value: source,
        onValueChange: (v) => setSource(v),
        children: [/* @__PURE__ */ jsxs(TabsList, {
          children: [/* @__PURE__ */ jsxs(TabsTrigger, {
            value: "linkedin",
            children: [/* @__PURE__ */ jsx(Users, {
              className: "size-4"
            }), "LinkedIn"]
          }), /* @__PURE__ */ jsxs(TabsTrigger, {
            value: "x",
            children: [/* @__PURE__ */ jsx(AtSign, {
              className: "size-4"
            }), "X / Twitter"]
          })]
        }), /* @__PURE__ */ jsx(TabsContent, {
          value: "linkedin",
          children: /* @__PURE__ */ jsx(ImportForm, {
            source: "linkedin"
          })
        }), /* @__PURE__ */ jsx(TabsContent, {
          value: "x",
          children: /* @__PURE__ */ jsx(ImportForm, {
            source: "x"
          })
        })]
      })]
    })
  });
});
function ImportForm({
  source
}) {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [rows, setRows] = useState([{
    ...emptyRow
  }, {
    ...emptyRow
  }, {
    ...emptyRow
  }]);
  const tablePayload = toTsv(rows);
  const filled = rows.filter(isFilled);
  const submitting = navigation.state === "submitting" && navigation.formData?.get("source") === source;
  useEffect(() => {
    if (!actionData || actionData.source !== source) return;
    if (actionData.ok) {
      toast.success(`Imported ${actionData.analysis.summary.total} prospect${actionData.analysis.summary.total > 1 ? "s" : ""}`);
    } else {
      toast.error("Analysis failed", {
        description: actionData.error
      });
    }
  }, [actionData, source]);
  function update(index, field, value) {
    setRows((current) => current.map((row, i) => i === index ? {
      ...row,
      [field]: value
    } : row));
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "mt-4 space-y-6",
    children: [/* @__PURE__ */ jsxs(Card, {
      children: [/* @__PURE__ */ jsx(CardHeader, {
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              children: "Profiles"
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: source === "linkedin" ? "One row per LinkedIn profile. Empty rows are ignored." : "One row per X profile. Use posts/signals to help pick a sharper brief topic."
            })]
          }), /* @__PURE__ */ jsxs(Button, {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: () => setRows((current) => [...current, {
              ...emptyRow
            }]),
            children: [/* @__PURE__ */ jsx(Plus, {
              className: "size-4"
            }), "Add row"]
          })]
        })
      }), /* @__PURE__ */ jsx(CardContent, {
        children: /* @__PURE__ */ jsxs(Form, {
          method: "post",
          className: "space-y-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "source",
            value: source
          }), /* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "table",
            value: tablePayload
          }), /* @__PURE__ */ jsx("div", {
            className: "overflow-x-auto rounded-md border",
            children: /* @__PURE__ */ jsxs("table", {
              className: "w-full min-w-[1480px] border-collapse text-sm",
              children: [/* @__PURE__ */ jsx("thead", {
                className: "bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
                children: /* @__PURE__ */ jsxs("tr", {
                  children: [/* @__PURE__ */ jsx("th", {
                    className: "w-[170px] border-b px-3 py-2",
                    children: "Name"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[250px] border-b px-3 py-2",
                    children: source === "x" ? "Role / context" : "Position"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[250px] border-b px-3 py-2",
                    children: source === "x" ? "X URL or handle" : "Profile URL"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[300px] border-b px-3 py-2",
                    children: source === "x" ? "Bio / about" : "About"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[340px] border-b px-3 py-2",
                    children: "Posts / signals"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[190px] border-b px-3 py-2",
                    children: "Brief direction"
                  }), /* @__PURE__ */ jsx("th", {
                    className: "w-[56px] border-b px-3 py-2"
                  })]
                })
              }), /* @__PURE__ */ jsx("tbody", {
                children: rows.map((row, index) => /* @__PURE__ */ jsxs("tr", {
                  className: "align-top",
                  children: [/* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Input, {
                      value: row.name,
                      onChange: (e) => update(index, "name", e.target.value),
                      placeholder: "Jane Doe"
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Input, {
                      value: row.position,
                      onChange: (e) => update(index, "position", e.target.value),
                      placeholder: source === "x" ? "EU policy analyst, journalist..." : "EU Public Affairs Manager"
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Input, {
                      value: row.profileUrl,
                      onChange: (e) => update(index, "profileUrl", e.target.value),
                      placeholder: source === "x" ? "@handle or https://x.com/handle" : "https://www.linkedin.com/in/..."
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Textarea, {
                      value: row.about,
                      onChange: (e) => update(index, "about", e.target.value),
                      rows: 2,
                      placeholder: source === "x" ? "Bio, public role, org, topics..." : "Short profile summary, about, sector, topics...",
                      className: "min-h-20"
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Textarea, {
                      value: row.signals,
                      onChange: (e) => update(index, "signals", e.target.value),
                      rows: 2,
                      placeholder: source === "x" ? "Recent posts, reposts, recurring themes..." : "Recent posts, experience, client context...",
                      className: "min-h-20"
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Input, {
                      value: row.briefDirection,
                      onChange: (e) => update(index, "briefDirection", e.target.value),
                      placeholder: "AI Act, EU competitiveness..."
                    })
                  }), /* @__PURE__ */ jsx("td", {
                    className: "border-b p-2",
                    children: /* @__PURE__ */ jsx(Button, {
                      type: "button",
                      variant: "outline",
                      size: "icon",
                      "aria-label": "Remove row",
                      disabled: rows.length === 1,
                      onClick: () => setRows((current) => current.filter((_, i) => i !== index)),
                      className: "text-destructive",
                      children: /* @__PURE__ */ jsx(Trash2, {
                        className: "size-4"
                      })
                    })
                  })]
                }, index))
              })]
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap items-center gap-3",
            children: [/* @__PURE__ */ jsxs(Button, {
              type: "submit",
              disabled: filled.length === 0 || submitting,
              children: [submitting ? /* @__PURE__ */ jsx(LoaderCircle, {
                className: "size-4 animate-spin"
              }) : /* @__PURE__ */ jsx(Brain, {
                className: "size-4"
              }), submitting ? "Analyzing..." : `Analyze ${filled.length || ""} and import`]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-xs text-muted-foreground",
              children: ["Requires ", /* @__PURE__ */ jsx("code", {
                className: "rounded bg-muted px-1 py-0.5",
                children: "OPENROUTER_API_KEY"
              }), "."]
            })]
          })]
        })
      })]
    }), actionData?.source === source && actionData.ok ? /* @__PURE__ */ jsx(Results, {
      source,
      analysis: actionData.analysis
    }) : null]
  });
}
function Results({
  source,
  analysis
}) {
  const toContact = analysis.prospects.filter((p) => p.contactNow);
  const wave2 = analysis.prospects.filter((p) => p.wave === 2);
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-6",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
      children: [/* @__PURE__ */ jsx(Metric, {
        label: "Total",
        value: analysis.summary.total
      }), /* @__PURE__ */ jsx(Metric, {
        label: source === "x" ? "DM today" : "Connect today",
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
    }), /* @__PURE__ */ jsxs(Card, {
      children: [/* @__PURE__ */ jsx(CardHeader, {
        children: /* @__PURE__ */ jsxs(CardTitle, {
          className: "flex items-center gap-2",
          children: [/* @__PURE__ */ jsx(Send, {
            className: "size-5"
          }), source === "x" ? "X / Twitter actions" : "Actions for today"]
        })
      }), /* @__PURE__ */ jsx(CardContent, {
        className: "space-y-3",
        children: toContact.length ? toContact.map((p) => /* @__PURE__ */ jsx(ActionCard, {
          prospect: p,
          source
        }, p.profileUrl)) : /* @__PURE__ */ jsx(Empty, {
          text: "No first-wave contact recommended in this batch."
        })
      })]
    }), source === "linkedin" && wave2.length ? /* @__PURE__ */ jsxs(Card, {
      children: [/* @__PURE__ */ jsx(CardHeader, {
        children: /* @__PURE__ */ jsx(CardTitle, {
          children: "Wave 2 calibration"
        })
      }), /* @__PURE__ */ jsx(CardContent, {
        className: "space-y-3",
        children: wave2.map((p) => /* @__PURE__ */ jsx(MiniCard, {
          prospect: p
        }, p.profileUrl))
      })]
    }) : null, source === "linkedin" ? /* @__PURE__ */ jsxs(Card, {
      children: [/* @__PURE__ */ jsx(CardHeader, {
        children: /* @__PURE__ */ jsxs(CardTitle, {
          className: "flex items-center gap-2",
          children: [/* @__PURE__ */ jsx(CircleCheck, {
            className: "size-5"
          }), "Full classification"]
        })
      }), /* @__PURE__ */ jsx(CardContent, {
        className: "space-y-3",
        children: analysis.prospects.map((p) => /* @__PURE__ */ jsx(MiniCard, {
          prospect: p
        }, p.profileUrl))
      })]
    }) : null]
  });
}
function ActionCard({
  prospect,
  source
}) {
  return /* @__PURE__ */ jsxs("article", {
    className: "rounded-lg border bg-muted/30 p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-muted-foreground",
          children: prospect.position
        }), /* @__PURE__ */ jsxs("p", {
          className: "mt-2 text-sm",
          children: ["Brief: ", /* @__PURE__ */ jsx("span", {
            className: "font-semibold",
            children: prospect.briefTopic
          })]
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-muted-foreground",
          children: prospect.rationale
        })]
      }), /* @__PURE__ */ jsx("a", {
        className: "text-sm font-medium text-primary hover:underline",
        href: prospect.profileUrl,
        target: "_blank",
        rel: "noreferrer",
        children: source === "x" ? "X profile" : "LinkedIn"
      })]
    }), source === "x" ? /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Message, {
        title: "DM / first touch",
        value: prospect.twitterDmMessage || ""
      }), /* @__PURE__ */ jsx(Message, {
        title: "Follow-up J+2",
        value: prospect.twitterFollowupMessage || prospect.followupMessage
      })]
    }) : /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Message, {
        title: "Connection note",
        value: prospect.connectionMessage
      }), /* @__PURE__ */ jsx(Message, {
        title: "After acceptance, with note",
        value: prospect.reportMessage
      }), /* @__PURE__ */ jsx(Message, {
        title: "After acceptance, without note",
        value: prospect.noNoteReportMessage
      }), /* @__PURE__ */ jsx(Message, {
        title: "Follow-up J+2",
        value: prospect.followupMessage
      })]
    })]
  });
}
function MiniCard({
  prospect
}) {
  return /* @__PURE__ */ jsx("article", {
    className: "rounded-lg border bg-muted/30 p-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-muted-foreground",
          children: prospect.position
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm",
          children: prospect.rationale
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-wrap gap-2",
        children: [/* @__PURE__ */ jsx(Badge, {
          variant: "muted",
          children: prospect.priorityTag
        }), /* @__PURE__ */ jsxs(Badge, {
          variant: "muted",
          children: ["Wave ", prospect.wave || "-"]
        }), prospect.briefTopic ? /* @__PURE__ */ jsx(Badge, {
          variant: "muted",
          children: prospect.briefTopic
        }) : null]
      })]
    })
  });
}
function Message({
  title,
  value
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: cn("mt-3 border-t pt-3"),
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold",
        children: title
      }), /* @__PURE__ */ jsxs(Button, {
        type: "button",
        variant: "outline",
        size: "sm",
        onClick: () => {
          navigator.clipboard.writeText(value);
          toast.success(`${title} copied`);
        },
        children: [/* @__PURE__ */ jsx(Clipboard, {
          className: "size-3"
        }), "Copy"]
      })]
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-2 whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground",
      children: value
    })]
  });
}
function Metric({
  label,
  value
}) {
  return /* @__PURE__ */ jsx(Card, {
    children: /* @__PURE__ */ jsxs(CardContent, {
      className: "pt-6",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
        children: label
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-1 text-3xl font-semibold tracking-tight",
        children: value
      })]
    })
  });
}
function Empty({
  text
}) {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-md border border-dashed p-4 text-sm text-muted-foreground",
    children: text
  });
}
function toTsv(rows) {
  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const body = rows.filter(isFilled).map((row) => [row.name, row.position, row.profileUrl, row.about, row.signals, row.briefDirection].map(clean).join("	"));
  return [header.join("	"), ...body].join("\n");
}
function clean(value) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}
function isFilled(row) {
  return Boolean(row.name.trim() || row.position.trim() || row.profileUrl.trim() || row.about.trim() || row.signals.trim() || row.briefDirection.trim());
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: _import,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const tempolisConfig = {
  productName: "Tempolis",
  headline: "Discover public affairs prospects",
  description: "Google-powered LinkedIn prospecting queries for EU public affairs, policy, comms and analysis profiles. Open a search, shortlist profiles, then import them.",
  importSource: "linkedin",
  steps: ["Start with operational first-wave searches in EU public affairs, policy comms, consultants and analysts.", "Avoid very senior premium targets until copy and brief format are calibrated.", "Import promising profiles so the app classifies them and writes the outreach sequence."],
  groups: [{
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
  }]
};
const narralensConfig = {
  productName: "Narralens",
  headline: "Discover brand, social and PR prospects",
  description: "Find people who can test Narralens on a real brand, campaign, launch or competitor. Prioritize workflow pain over audience size.",
  importSource: "linkedin",
  steps: ["Start with brand, social, PR and agency people who produce campaign readouts, client updates or launch monitoring.", "Look for visible moments: launches, campaigns, repositioning, backlash, competitor tracking or reporting workflows.", "Import profiles with a concrete test topic, so outreach can ask for feedback on one real brief instead of pitching a tool."],
  groups: [{
    title: "Brand and social teams",
    description: "Best first-wave ICP: people responsible for reading public conversation and turning it into decisions or updates.",
    queries: [{
      label: "Brand managers",
      intent: "In-house people likely to care about perception around campaigns, launches and competitors.",
      query: 'site:linkedin.com/in ("brand manager" OR "brand lead" OR "brand strategist") ("campaign" OR "launch" OR "consumer insights" OR "brand tracking")'
    }, {
      label: "Social media leads",
      intent: "High workflow fit: they already monitor conversation and need fast summaries.",
      query: 'site:linkedin.com/in ("social media manager" OR "social media lead" OR "head of social") ("brand" OR "campaign" OR "community" OR "insights")'
    }, {
      label: "Comms managers",
      intent: "Useful for reputation, narrative shifts and stakeholder-ready briefs.",
      query: 'site:linkedin.com/in ("communications manager" OR "comms lead" OR "corporate communications") ("brand" OR reputation OR campaign OR launch)'
    }, {
      label: "Product marketers",
      intent: "Good wedge around launches, positioning and competitor perception.",
      query: 'site:linkedin.com/in ("product marketing manager" OR "product marketer" OR "GTM") ("launch" OR positioning OR competitor OR messaging)'
    }]
  }, {
    title: "PR and agencies",
    description: "Agencies can test across multiple clients and immediately understand the value of a shareable perception brief.",
    queries: [{
      label: "PR account leads",
      intent: "Client-facing profiles who need quick narrative readouts and issue context.",
      query: 'site:linkedin.com/in ("PR account director" OR "PR account manager" OR "communications consultant") ("client" OR campaign OR reputation OR media)'
    }, {
      label: "Agency strategists",
      intent: "Strategists are likely to test brand vs competitor, launch perception and campaign narratives.",
      query: 'site:linkedin.com/in ("agency strategist" OR "strategy director" OR "brand strategist") ("social listening" OR insights OR campaign OR client)'
    }, {
      label: "Social agencies",
      intent: "Teams with recurring monitoring/reporting pain but not always heavy tooling.",
      query: 'site:linkedin.com/in ("social media agency" OR "social strategist" OR "community strategist") ("reports" OR insights OR monitoring OR campaigns)'
    }, {
      label: "Founder-led agencies",
      intent: "Small agency operators may adopt faster if the brief saves time before client updates.",
      query: 'site:linkedin.com/in ("agency founder" OR "founder" OR "managing director") ("PR agency" OR "social agency" OR "brand agency")'
    }]
  }, {
    title: "Need signals",
    description: "Search for people already talking about monitoring, perception, reporting, launches or social listening alternatives.",
    queries: [{
      label: "Social listening pain",
      intent: "People discussing heavy dashboards, reporting gaps or signal quality.",
      query: 'site:linkedin.com/posts ("social listening" OR "brand monitoring") ("dashboard" OR "reporting" OR "insights" OR "too much noise")'
    }, {
      label: "Campaign reporting",
      intent: "Profiles posting about campaign wrap-ups, performance reports or narrative learnings.",
      query: 'site:linkedin.com/posts ("campaign report" OR "campaign learnings" OR "brand campaign") ("insights" OR "social" OR "PR" OR "marketing")'
    }, {
      label: "Launch monitoring",
      intent: "Good hook for a first test: run Narralens on a launch they know.",
      query: 'site:linkedin.com/posts ("product launch" OR "launch campaign") ("social" OR "brand" OR "PR" OR "community")'
    }, {
      label: "Competitor tracking",
      intent: "Strong use case for brand and product marketing teams.",
      query: 'site:linkedin.com/posts ("competitor analysis" OR "competitive intelligence" OR "brand tracking") ("marketing" OR "brand" OR "positioning")'
    }]
  }, {
    title: "Founder launch wedge",
    description: "Secondary ICP: founders with visible launches who can give fast feedback on whether the brief helps.",
    queries: [{
      label: "Recent launch founders",
      intent: "Useful for direct product feedback around launch perception.",
      query: 'site:linkedin.com/in (founder OR cofounder) ("launched" OR "launching" OR "Product Hunt" OR "waitlist") ("brand" OR "SaaS" OR "consumer")'
    }, {
      label: "Indie builders with distribution",
      intent: "Only worth it if they have an active launch or visible audience need.",
      query: 'site:linkedin.com/in ("indie hacker" OR "builder" OR "founder") ("launch" OR "audience" OR "growth" OR "community")'
    }, {
      label: "Startup marketers",
      intent: "Small teams where one person owns launch, social, positioning and reporting.",
      query: 'site:linkedin.com/in ("startup marketer" OR "growth marketer" OR "marketing lead") ("launch" OR "brand" OR "community" OR "social")'
    }]
  }, {
    title: "X / Twitter discovery",
    description: "Google-indexed X profiles and posts. Use this for lighter DM/reply outreach, not LinkedIn-style connection flows.",
    queries: [{
      label: "Marketing people on X",
      intent: "Find profiles likely to reply to short product-testing DMs.",
      query: 'site:x.com ("brand strategist" OR "social media manager" OR "growth marketer") ("launch" OR "campaign" OR "positioning")'
    }, {
      label: "Agency operators on X",
      intent: "Good for finding people who talk publicly about client work and workflows.",
      query: 'site:x.com ("agency founder" OR "brand strategist" OR "PR" OR "social strategy") ("clients" OR "campaigns" OR "reports")'
    }, {
      label: "Live perception topics",
      intent: "Find posts where a contextual reply about a perception brief could make sense.",
      query: 'site:x.com ("brand perception" OR "campaign backlash" OR "social listening" OR "launch feedback")'
    }]
  }]
};
const configs = {
  tempolis: tempolisConfig,
  narralens: narralensConfig
};
const meta$1 = () => [{
  title: "Discover · Outreach"
}, {
  name: "description",
  content: "Google search launcher for outreach prospecting."
}];
const discover = UNSAFE_withComponentProps(function DiscoverPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug || "tempolis";
  const config = configs[workspaceSlug] || tempolisConfig;
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-7xl space-y-8",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase tracking-wide text-primary",
            children: "Prospecting"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-3xl font-semibold tracking-tight",
            children: config.headline
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-sm text-muted-foreground",
            children: config.description
          })]
        }), /* @__PURE__ */ jsx(Button, {
          asChild: true,
          children: /* @__PURE__ */ jsx(Link$1, {
            to: `/${workspaceSlug}/import?source=${config.importSource}`,
            children: "Add shortlisted prospects"
          })
        })]
      }), /* @__PURE__ */ jsxs(Card, {
        children: [/* @__PURE__ */ jsx(CardHeader, {
          children: /* @__PURE__ */ jsx(CardTitle, {
            children: "How to use"
          })
        }), /* @__PURE__ */ jsx(CardContent, {
          children: /* @__PURE__ */ jsx("ol", {
            className: "grid gap-2 text-sm text-muted-foreground md:grid-cols-3",
            children: config.steps.map((step, index) => /* @__PURE__ */ jsxs("li", {
              children: [index + 1, ". ", step]
            }, step))
          })
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-6",
        children: config.groups.map((group) => /* @__PURE__ */ jsxs("section", {
          className: "space-y-3",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-lg font-semibold",
                children: group.title
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: group.description
              })]
            }), /* @__PURE__ */ jsxs("span", {
              className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
              children: [group.queries.length, " searches"]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "grid gap-3 lg:grid-cols-2",
            children: group.queries.map((item) => /* @__PURE__ */ jsx(QueryCard, {
              item
            }, item.label))
          })]
        }, group.title))
      })]
    })
  });
});
function QueryCard({
  item
}) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(item.query)}`;
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsx(CardHeader, {
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            children: item.label
          }), /* @__PURE__ */ jsx(CardDescription, {
            className: "mt-1",
            children: item.intent
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex shrink-0 gap-2",
          children: [/* @__PURE__ */ jsxs(Button, {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: () => {
              navigator.clipboard.writeText(item.query);
              toast.success("Query copied");
            },
            children: [/* @__PURE__ */ jsx(Copy, {
              className: "size-4"
            }), "Copy"]
          }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            size: "sm",
            children: /* @__PURE__ */ jsxs("a", {
              href: url,
              target: "_blank",
              rel: "noreferrer",
              children: [/* @__PURE__ */ jsx(Search, {
                className: "size-4"
              }), "Open", /* @__PURE__ */ jsx(ExternalLink, {
                className: "size-3"
              })]
            })
          })]
        })]
      })
    }), /* @__PURE__ */ jsx(CardContent, {
      children: /* @__PURE__ */ jsx("code", {
        className: "block whitespace-pre-wrap rounded-md border bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground",
        children: item.query
      })
    })]
  });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: discover,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => [{
  title: "Settings · Outreach"
}, {
  name: "description",
  content: "Workspace docs, prompts and model settings."
}];
async function loader$9({
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  return await getWorkspaceSettings(workspace.id);
}
async function action$3({
  request,
  params
}) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  const formData = await request.formData();
  await runWorkspaceSettingsAction(formData, workspace.id);
  return redirect(`/${workspace.slug}/settings`);
}
const settings = UNSAFE_withComponentProps(function SettingsPage() {
  const {
    workspace,
    docs,
    prompts
  } = useLoaderData();
  return /* @__PURE__ */ jsx("div", {
    className: "px-6 py-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl space-y-6",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs font-semibold uppercase tracking-wide text-primary",
            children: "Settings"
          }), /* @__PURE__ */ jsx("h1", {
            className: "mt-1 text-3xl font-semibold tracking-tight",
            children: workspace.name
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 max-w-3xl text-sm text-muted-foreground",
            children: "Configure the workspace once here. Future generations read from the DB, not from the seed markdown files."
          })]
        }), /* @__PURE__ */ jsxs(Badge, {
          variant: "muted",
          children: ["/", workspace.slug]
        })]
      }), /* @__PURE__ */ jsxs(Card, {
        children: [/* @__PURE__ */ jsxs(CardHeader, {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            children: "Workspace"
          }), /* @__PURE__ */ jsx(CardDescription, {
            children: "Name, product name and default generation language."
          })]
        }), /* @__PURE__ */ jsx(CardContent, {
          children: /* @__PURE__ */ jsxs(Form, {
            method: "post",
            className: "grid gap-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end",
            children: [/* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "intent",
              value: "updateWorkspace"
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "name",
                children: "Name"
              }), /* @__PURE__ */ jsx(Input, {
                id: "name",
                name: "name",
                defaultValue: workspace.name,
                required: true
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "productName",
                children: "Product name"
              }), /* @__PURE__ */ jsx(Input, {
                id: "productName",
                name: "productName",
                defaultValue: workspace.product_name,
                required: true
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "defaultLanguage",
                children: "Language"
              }), /* @__PURE__ */ jsx(Input, {
                id: "defaultLanguage",
                name: "defaultLanguage",
                defaultValue: workspace.default_language,
                required: true
              })]
            }), /* @__PURE__ */ jsxs(Button, {
              type: "submit",
              children: [/* @__PURE__ */ jsx(Save, {
                className: "size-4"
              }), "Save"]
            })]
          })
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-4",
        children: [/* @__PURE__ */ jsx(SectionTitle, {
          title: "Docs",
          detail: "Brand, ICP/playbook and examples used by prompts."
        }), docs.map((doc) => /* @__PURE__ */ jsx(DocEditor, {
          doc
        }, doc.id))]
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-4",
        children: [/* @__PURE__ */ jsx(SectionTitle, {
          title: "Prompts",
          detail: "Saving a prompt creates a new active version."
        }), prompts.map((prompt) => /* @__PURE__ */ jsx(PromptEditor, {
          prompt
        }, prompt.id))]
      })]
    })
  });
});
function SectionTitle({
  title,
  detail
}) {
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h2", {
      className: "text-xl font-semibold tracking-tight",
      children: title
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-sm text-muted-foreground",
      children: detail
    })]
  });
}
function DocEditor({
  doc
}) {
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsx(CardHeader, {
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            children: doc.title
          }), /* @__PURE__ */ jsx(CardDescription, {
            children: doc.source_path || doc.type
          })]
        }), /* @__PURE__ */ jsx(Badge, {
          variant: "muted",
          children: doc.type
        })]
      })
    }), /* @__PURE__ */ jsx(CardContent, {
      children: /* @__PURE__ */ jsxs(Form, {
        method: "post",
        className: "space-y-3",
        children: [/* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "intent",
          value: "updateDoc"
        }), /* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "docId",
          value: doc.id
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsx(Label, {
            htmlFor: `doc-title-${doc.id}`,
            children: "Title"
          }), /* @__PURE__ */ jsx(Input, {
            id: `doc-title-${doc.id}`,
            name: "title",
            defaultValue: doc.title,
            required: true
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsx(Label, {
            htmlFor: `doc-content-${doc.id}`,
            children: "Content"
          }), /* @__PURE__ */ jsx(Textarea, {
            id: `doc-content-${doc.id}`,
            name: "content",
            defaultValue: doc.content,
            rows: 14
          })]
        }), /* @__PURE__ */ jsxs(Button, {
          type: "submit",
          variant: "outline",
          size: "sm",
          children: [/* @__PURE__ */ jsx(Save, {
            className: "size-4"
          }), "Save doc"]
        })]
      })
    })]
  });
}
function PromptEditor({
  prompt
}) {
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsx(CardHeader, {
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx(CardTitle, {
            children: prompt.name
          }), /* @__PURE__ */ jsxs(CardDescription, {
            children: [prompt.channel, " · ", prompt.purpose]
          })]
        }), /* @__PURE__ */ jsxs(Badge, {
          variant: "info",
          children: ["v", prompt.version]
        })]
      })
    }), /* @__PURE__ */ jsx(CardContent, {
      children: /* @__PURE__ */ jsxs(Form, {
        method: "post",
        className: "space-y-3",
        children: [/* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "intent",
          value: "updatePrompt"
        }), /* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "promptId",
          value: prompt.id
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid gap-3 md:grid-cols-[1fr_260px_140px]",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: `prompt-name-${prompt.id}`,
              children: "Name"
            }), /* @__PURE__ */ jsx(Input, {
              id: `prompt-name-${prompt.id}`,
              name: "name",
              defaultValue: prompt.name,
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: `prompt-model-${prompt.id}`,
              children: "Model"
            }), /* @__PURE__ */ jsx(Input, {
              id: `prompt-model-${prompt.id}`,
              name: "model",
              defaultValue: prompt.model,
              required: true
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: `prompt-temperature-${prompt.id}`,
              children: "Temperature"
            }), /* @__PURE__ */ jsx(Input, {
              id: `prompt-temperature-${prompt.id}`,
              name: "temperature",
              type: "number",
              min: "0",
              max: "2",
              step: "0.1",
              defaultValue: prompt.temperature,
              required: true
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsx(Label, {
            htmlFor: `prompt-system-${prompt.id}`,
            children: "System prompt"
          }), /* @__PURE__ */ jsx(Textarea, {
            id: `prompt-system-${prompt.id}`,
            name: "systemPrompt",
            defaultValue: prompt.system_prompt,
            rows: 4,
            required: true
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsx(Label, {
            htmlFor: `prompt-user-${prompt.id}`,
            children: "User prompt"
          }), /* @__PURE__ */ jsx(Textarea, {
            id: `prompt-user-${prompt.id}`,
            name: "userPrompt",
            defaultValue: prompt.user_prompt,
            rows: 18,
            required: true
          })]
        }), /* @__PURE__ */ jsxs(Button, {
          type: "submit",
          variant: "outline",
          size: "sm",
          children: [/* @__PURE__ */ jsx(Save, {
            className: "size-4"
          }), "Save new version"]
        })]
      })
    })]
  });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: settings,
  loader: loader$9,
  meta
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders$2(request)
    });
  }
  const workspaces = await getWorkspaces();
  const requestedSlug = new URL(request.url).searchParams.get("workspaceSlug") || "tempolis";
  const workspace = await getWorkspaceBySlug(requestedSlug) || await getWorkspaceBySlug("tempolis");
  if (!workspace) {
    return data({
      ok: false,
      error: "No workspace configured"
    }, {
      status: 500,
      headers: corsHeaders$2(request)
    });
  }
  const dashboard = await getExtensionDashboard(workspace.id);
  return data({
    ok: true,
    workspaces,
    ...dashboard
  }, {
    headers: corsHeaders$2(request)
  });
}
function corsHeaders$2(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true"
  };
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function action$2({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders$1(request)
    });
  }
  if (request.method !== "POST") {
    return data({
      ok: false,
      error: "Method not allowed"
    }, {
      status: 405,
      headers: corsHeaders$1(request)
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
      headers: corsHeaders$1(request)
    });
  }
  if (payload.state === "unknown") {
    return data({
      ok: true,
      synced: false
    }, {
      headers: corsHeaders$1(request)
    });
  }
  if (!["accepted", "declined", "pending"].includes(String(payload.state))) {
    return data({
      ok: false,
      error: "Unknown connection state"
    }, {
      status: 400,
      headers: corsHeaders$1(request)
    });
  }
  await syncProspectConnectionState(id, payload.state);
  return data({
    ok: true,
    synced: true,
    state: payload.state
  }, {
    headers: corsHeaders$1(request)
  });
}
function corsHeaders$1(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true"
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
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request)
    });
  }
  if (request.method !== "POST") {
    return data({
      ok: false,
      error: "Method not allowed"
    }, {
      status: 405,
      headers: corsHeaders(request)
    });
  }
  const payload = await readPayload(request);
  const workspace = await workspaceFromPayload(payload, request);
  if (payload.sourceChannel === "twitter") {
    return handleTwitterPayload(payload, workspace, request);
  }
  const profileUrl = normalizeLinkedInUrl(String(payload.profileUrl || ""));
  if (!profileUrl.includes("linkedin.com/in/")) {
    return data({
      ok: false,
      error: "Open a LinkedIn profile page first."
    }, {
      status: 400,
      headers: corsHeaders(request)
    });
  }
  const existingId = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (existingId) {
    await setProspectOutreachPreference(existingId, normalizeOutreachMode(payload.outreachMode));
    return respond(payload, existingId, true, workspace, request);
  }
  const table = prospectEvidenceToTable({
    ...payload,
    profileUrl
  });
  const analysis = await analyzeProspectTable(table, workspace);
  await importAnalyzedProspects(analysis.prospects, workspace.id);
  const id = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (!id) {
    return data({
      ok: false,
      error: "Profile analyzed but not found after import."
    }, {
      status: 500,
      headers: corsHeaders(request)
    });
  }
  await setProspectOutreachPreference(id, normalizeOutreachMode(payload.outreachMode));
  return respond(payload, id, false, workspace, request);
}
async function handleTwitterPayload(payload, workspace, request) {
  const profileUrl = normalizeTwitterUrl(String(payload.profileUrl || payload.twitterUrl || payload.twitterHandle || ""));
  if (!profileUrl.includes("x.com/") && !profileUrl.includes("twitter.com/")) {
    return data({
      ok: false,
      error: "Open a Twitter/X profile page first."
    }, {
      status: 400,
      headers: corsHeaders(request)
    });
  }
  const existingId = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (existingId) {
    return respond(payload, existingId, true, workspace, request);
  }
  const table = prospectEvidenceToTable({
    ...payload,
    profileUrl,
    signals: [payload.signals, payload.activity ? `Visible posts: ${payload.activity}` : "", payload.rawText ? `Visible page text: ${payload.rawText}` : ""].filter(Boolean).join("\n\n")
  });
  const analysis = await analyzeTwitterProspectTable(table, workspace);
  await importAnalyzedProspects(analysis.prospects, workspace.id);
  const id = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (!id) {
    return data({
      ok: false,
      error: "Twitter/X profile analyzed but not found after import."
    }, {
      status: 500,
      headers: corsHeaders(request)
    });
  }
  return respond(payload, id, false, workspace, request);
}
async function workspaceFromPayload(payload, request) {
  if (payload.workspaceSlug) {
    const workspace = await getWorkspaceBySlug(payload.workspaceSlug);
    if (workspace) return workspace;
  }
  const querySlug = new URL(request.url).searchParams.get("workspaceSlug");
  if (querySlug) {
    const workspace = await getWorkspaceBySlug(querySlug);
    if (workspace) return workspace;
  }
  const fallback = await getWorkspaceBySlug("tempolis");
  if (!fallback) throw new Error("Default workspace is missing.");
  return fallback;
}
function respond(payload, id, existing, workspace, request) {
  const path2 = `/${workspace.slug}/prospects/${id}`;
  if (payload.open) return redirect(path2);
  return data({
    ok: true,
    id,
    existing,
    url: `http://localhost:4377${path2}`
  }, {
    headers: corsHeaders(request)
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
function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true"
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
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
function loader$7() {
  return redirect("/tempolis");
}
function action() {
  return redirect("/tempolis");
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
function loader$6() {
  return redirect("/tempolis/prospects");
}
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
function loader$5({
  request
}) {
  const url = new URL(request.url);
  return redirect(`/tempolis/import${url.search}`);
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
function loader$4() {
  return redirect("/tempolis/discover");
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function loader$3() {
  return redirect("/tempolis/settings");
}
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
function loader$2() {
  return redirect("/tempolis/import?source=linkedin");
}
const batch = UNSAFE_withComponentProps(function BatchRedirect() {
  return null;
});
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: batch,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
function loader$1() {
  return redirect("/tempolis/import?source=x");
}
const twitter = UNSAFE_withComponentProps(function TwitterRedirect() {
  return null;
});
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: twitter,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function loader() {
  return redirect("/tempolis/prospects");
}
const search = UNSAFE_withComponentProps(function SearchRedirect() {
  return null;
});
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: search,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-B45ZdhYm.js", "imports": ["/assets/jsx-runtime-u17CrQMm.js", "/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/index-C0hqblHI.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-pzTPmsKe.js", "imports": ["/assets/jsx-runtime-u17CrQMm.js", "/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/index-C0hqblHI.js", "/assets/card-vTM3lGsb.js", "/assets/utils-BQHNewu7.js"], "css": ["/assets/root-TXUXC89k.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/root": { "id": "routes/_redirects/root", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/root-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app": { "id": "routes/_app", "parentId": "root", "path": ":workspaceSlug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/_app-V2ln9QPm.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/button-CvQmwb1I.js", "/assets/index-D3Aez1bm.js", "/assets/index-DpmgHXye.js", "/assets/index-DesLcHwm.js", "/assets/index-C3yXPApV.js", "/assets/utils-BQHNewu7.js", "/assets/index-DRlceVeN.js", "/assets/index-Bvl8UudE.js", "/assets/index-D4RkPWLA.js", "/assets/index-C0hqblHI.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "routes/_app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-CCc0KV4Q.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-D4RkPWLA.js", "/assets/input-CVT0M0Si.js", "/assets/button-CvQmwb1I.js", "/assets/card-vTM3lGsb.js", "/assets/accordion-DlVUSEs4.js", "/assets/table-CbkYy7r8.js", "/assets/status-badge-D_T9qZn3.js", "/assets/utils-BQHNewu7.js", "/assets/send-CFz3_WwC.js", "/assets/index-DpmgHXye.js", "/assets/external-link-CGuRpFEE.js", "/assets/index-C0hqblHI.js", "/assets/index-D3Aez1bm.js", "/assets/index-C3yXPApV.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/prospects._index": { "id": "routes/prospects._index", "parentId": "routes/_app", "path": "prospects", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/prospects._index-DrTj2W7y.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/input-CVT0M0Si.js", "/assets/card-vTM3lGsb.js", "/assets/label-CRuF6lYJ.js", "/assets/index-C0hqblHI.js", "/assets/index-D3Aez1bm.js", "/assets/index-DpmgHXye.js", "/assets/index-DesLcHwm.js", "/assets/index-Bvl8UudE.js", "/assets/utils-BQHNewu7.js", "/assets/status-badge-D_T9qZn3.js", "/assets/table-CbkYy7r8.js", "/assets/search-CKQeJwCo.js", "/assets/external-link-CGuRpFEE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/prospect.$id": { "id": "routes/prospect.$id", "parentId": "routes/_app", "path": "prospects/:id", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/prospect._id-CxAacdYw.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-D4RkPWLA.js", "/assets/accordion-DlVUSEs4.js", "/assets/input-CVT0M0Si.js", "/assets/button-CvQmwb1I.js", "/assets/card-vTM3lGsb.js", "/assets/label-CRuF6lYJ.js", "/assets/textarea-C8ocjBql.js", "/assets/status-badge-D_T9qZn3.js", "/assets/utils-BQHNewu7.js", "/assets/index-DpmgHXye.js", "/assets/external-link-CGuRpFEE.js", "/assets/send-CFz3_WwC.js", "/assets/save-CSQhRxaK.js", "/assets/index-C0hqblHI.js", "/assets/index-D3Aez1bm.js", "/assets/index-C3yXPApV.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/import": { "id": "routes/import", "parentId": "routes/_app", "path": "import", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/import-DP6q4qBl.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-D4RkPWLA.js", "/assets/input-CVT0M0Si.js", "/assets/button-CvQmwb1I.js", "/assets/card-vTM3lGsb.js", "/assets/textarea-C8ocjBql.js", "/assets/index-D3Aez1bm.js", "/assets/index-DRlceVeN.js", "/assets/index-C3yXPApV.js", "/assets/utils-BQHNewu7.js", "/assets/send-CFz3_WwC.js", "/assets/index-DpmgHXye.js", "/assets/index-C0hqblHI.js", "/assets/index-Bvl8UudE.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/discover": { "id": "routes/discover", "parentId": "routes/_app", "path": "discover", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/discover-CiwrQWKq.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/index-D4RkPWLA.js", "/assets/button-CvQmwb1I.js", "/assets/card-vTM3lGsb.js", "/assets/index-DpmgHXye.js", "/assets/search-CKQeJwCo.js", "/assets/external-link-CGuRpFEE.js", "/assets/index-C0hqblHI.js", "/assets/utils-BQHNewu7.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings": { "id": "routes/settings", "parentId": "routes/_app", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/settings-DD3lkHkI.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js", "/assets/jsx-runtime-u17CrQMm.js", "/assets/input-CVT0M0Si.js", "/assets/button-CvQmwb1I.js", "/assets/card-vTM3lGsb.js", "/assets/label-CRuF6lYJ.js", "/assets/textarea-C8ocjBql.js", "/assets/save-CSQhRxaK.js", "/assets/index-DpmgHXye.js", "/assets/utils-BQHNewu7.js", "/assets/index-C0hqblHI.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.dashboard": { "id": "routes/api.extension.dashboard", "parentId": "root", "path": "api/extension/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.dashboard-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.connection-status": { "id": "routes/api.extension.connection-status", "parentId": "root", "path": "api/extension/connection-status", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.connection-status-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.extension.prospect": { "id": "routes/api.extension.prospect", "parentId": "root", "path": "api/extension/prospect", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/api.extension.prospect-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/workspace": { "id": "routes/_redirects/workspace", "parentId": "root", "path": "workspace", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/workspace-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/prospects": { "id": "routes/_redirects/prospects", "parentId": "root", "path": "prospects", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/prospects-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/import": { "id": "routes/_redirects/import", "parentId": "root", "path": "import", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/import-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/discover": { "id": "routes/_redirects/discover", "parentId": "root", "path": "discover", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/discover-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/settings": { "id": "routes/_redirects/settings", "parentId": "root", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": false, "hasErrorBoundary": false, "module": "/assets/settings-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/batch": { "id": "routes/_redirects/batch", "parentId": "root", "path": "batch", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/batch-BsT5-qgm.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/twitter": { "id": "routes/_redirects/twitter", "parentId": "root", "path": "twitter", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/twitter-CEizxzb8.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_redirects/search": { "id": "routes/_redirects/search", "parentId": "root", "path": "search", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/search-DRe9jh-Q.js", "imports": ["/assets/chunk-OE4NN4TA-DOuj0hGT.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-ae5fd672.js", "version": "ae5fd672", "sri": void 0 };
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
  "routes/_redirects/root": {
    id: "routes/_redirects/root",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_app": {
    id: "routes/_app",
    parentId: "root",
    path: ":workspaceSlug",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/home": {
    id: "routes/home",
    parentId: "routes/_app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/prospects._index": {
    id: "routes/prospects._index",
    parentId: "routes/_app",
    path: "prospects",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/prospect.$id": {
    id: "routes/prospect.$id",
    parentId: "routes/_app",
    path: "prospects/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/import": {
    id: "routes/import",
    parentId: "routes/_app",
    path: "import",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/discover": {
    id: "routes/discover",
    parentId: "routes/_app",
    path: "discover",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "routes/_app",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/api.extension.dashboard": {
    id: "routes/api.extension.dashboard",
    parentId: "root",
    path: "api/extension/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/api.extension.connection-status": {
    id: "routes/api.extension.connection-status",
    parentId: "root",
    path: "api/extension/connection-status",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/api.extension.prospect": {
    id: "routes/api.extension.prospect",
    parentId: "root",
    path: "api/extension/prospect",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/_redirects/workspace": {
    id: "routes/_redirects/workspace",
    parentId: "root",
    path: "workspace",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/_redirects/prospects": {
    id: "routes/_redirects/prospects",
    parentId: "root",
    path: "prospects",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/_redirects/import": {
    id: "routes/_redirects/import",
    parentId: "root",
    path: "import",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/_redirects/discover": {
    id: "routes/_redirects/discover",
    parentId: "root",
    path: "discover",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/_redirects/settings": {
    id: "routes/_redirects/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/_redirects/batch": {
    id: "routes/_redirects/batch",
    parentId: "root",
    path: "batch",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/_redirects/twitter": {
    id: "routes/_redirects/twitter",
    parentId: "root",
    path: "twitter",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/_redirects/search": {
    id: "routes/_redirects/search",
    parentId: "root",
    path: "search",
    index: void 0,
    caseSensitive: void 0,
    module: route19
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
