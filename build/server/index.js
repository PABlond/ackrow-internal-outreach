import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, useRouteError, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useLoaderData, Link, Form, redirect, useActionData } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Plus, Send, Check, LinkIcon, CalendarCheck, Clock, UserCheck, ExternalLink, Save, SkipForward, Clipboard, ArrowLeft, Trash2, Brain, CheckCircle2 } from "lucide-react";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { useState } from "react";
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
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
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
function getDashboard() {
  const db = getDb();
  const today = todayIso();
  const prospects = db.prepare(`
    SELECT
      p.*,
      b.topic AS brief_topic,
      b.preparation_notes,
      b.shared_url,
      cm.content AS connection_message,
      rm.content AS report_message,
      fm.content AS followup_message,
      fm.due_date AS followup_due_date
    FROM prospects p
    LEFT JOIN briefs b ON b.prospect_id = p.id
    LEFT JOIN messages cm ON cm.prospect_id = p.id AND cm.type = 'connection'
    LEFT JOIN messages rm ON rm.prospect_id = p.id AND rm.type = 'report'
    LEFT JOIN messages fm ON fm.prospect_id = p.id AND fm.type = 'followup'
    ORDER BY
      CASE p.status
        WHEN 'accepted' THEN 1
        WHEN 'connection_sent' THEN 2
        WHEN 'to_contact' THEN 3
        WHEN 'report_sent' THEN 4
        WHEN 'followup_due' THEN 5
        WHEN 'saved_for_later' THEN 6
        WHEN 'skipped' THEN 7
        ELSE 8
      END,
      p.wave,
      p.name
  `).all();
  const tasks = db.prepare(`
    SELECT t.*, p.name, p.profile_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    ORDER BY
      CASE WHEN t.due_date IS NOT NULL AND t.due_date < ? THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `).all(today);
  const events = db.prepare(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    ORDER BY e.happened_at DESC, e.id DESC
    LIMIT 100
  `).all();
  return {
    today,
    prospects,
    tasks,
    events,
    sections: {
      toConnect: tasks.filter((item) => item.status === "open" && item.type === "send_connection"),
      acceptedReport: prospects.filter((item) => item.status === "accepted" && !item.report_sent_date),
      missingBriefUrls: prospects.filter(
        (item) => ["connection_sent", "accepted"].includes(item.status) && Boolean(item.brief_topic) && !item.shared_url
      ),
      followupsDue: tasks.filter(
        (item) => item.status === "open" && item.type === "send_followup" && item.due_date && item.due_date <= today
      ),
      pendingConnections: prospects.filter((item) => item.status === "connection_sent"),
      doneToday: events.filter((item) => String(item.happened_at).slice(0, 10) === today)
    }
  };
}
function runProspectAction(formData) {
  const id = Number(formData.get("prospectId"));
  const intent = String(formData.get("intent") || "");
  const db = getDb();
  const prospect = db.prepare("SELECT * FROM prospects WHERE id = ?").get(id);
  if (!id || !prospect) {
    throw new Error("Unknown prospect");
  }
  const today = todayIso();
  db.exec("BEGIN");
  try {
    if (intent === "markAccepted") {
      db.prepare("UPDATE prospects SET status = 'accepted', accepted_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(today, id);
      completeOpenTask(id, "watch_acceptance");
      createOpenTask(id, "send_report", `Send report to ${prospect.name}`, today);
      addEvent(id, "accepted", "LinkedIn connection accepted.", today);
    } else if (intent === "markConnectionSent") {
      db.prepare("UPDATE prospects SET status = 'connection_sent', connection_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(today, id);
      db.prepare("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'connection'").run(today, id);
      completeOpenTask(id, "send_connection");
      createOpenTask(id, "watch_acceptance", `Watch LinkedIn acceptance for ${prospect.name}`, null);
      addEvent(id, "connection_sent", "Connection request sent.", today);
    } else if (intent === "addBriefUrl") {
      const sharedUrl = String(formData.get("sharedUrl") || "").trim();
      if (!sharedUrl) throw new Error("Brief URL is required");
      db.prepare("UPDATE briefs SET shared_url = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ?").run(sharedUrl, id);
      addEvent(id, "brief_url_added", `Brief URL added: ${sharedUrl}`, today);
    } else if (intent === "markReportSent") {
      const followupDate = addDaysIso(today, 5);
      db.prepare("UPDATE prospects SET status = 'report_sent', report_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(today, id);
      db.prepare("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'report'").run(today, id);
      db.prepare("UPDATE messages SET due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'followup'").run(followupDate, id);
      completeOpenTask(id, "send_report");
      createOpenTask(id, "send_followup", `Follow up with ${prospect.name}`, followupDate);
      addEvent(id, "report_sent", `Report sent. Follow-up due on ${followupDate}.`, today);
    } else if (intent === "markFollowupSent") {
      db.prepare("UPDATE prospects SET status = 'followup_sent', followup_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(today, id);
      db.prepare("UPDATE messages SET sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE prospect_id = ? AND type = 'followup'").run(today, id);
      completeOpenTask(id, "send_followup");
      addEvent(id, "followup_sent", "Follow-up sent.", today);
    } else if (intent === "skip") {
      db.prepare("UPDATE prospects SET status = 'skipped', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      completeAllOpenTasks(id);
      addEvent(id, "skipped", "Prospect skipped.", today);
    } else if (intent === "saveForLater") {
      db.prepare("UPDATE prospects SET status = 'saved_for_later', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      completeAllOpenTasks(id);
      addEvent(id, "saved_for_later", "Prospect saved for a later wave.", today);
    } else {
      throw new Error(`Unknown action ${intent}`);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function importAnalyzedProspects(items) {
  const db = getDb();
  const today = todayIso();
  const upsertProspect = db.prepare(`
    INSERT INTO prospects (
      name, position, profile_url, about, priority_tag, wave, contact_now,
      rationale, recommended_template, notes, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(profile_url) DO UPDATE SET
      name = excluded.name,
      position = excluded.position,
      about = excluded.about,
      priority_tag = excluded.priority_tag,
      wave = excluded.wave,
      contact_now = excluded.contact_now,
      rationale = excluded.rationale,
      recommended_template = excluded.recommended_template,
      notes = excluded.notes,
      status = CASE
        WHEN prospects.status IN ('connection_sent', 'accepted', 'report_sent', 'followup_sent') THEN prospects.status
        ELSE excluded.status
      END,
      updated_at = CURRENT_TIMESTAMP
  `);
  const getProspect = db.prepare("SELECT id, status FROM prospects WHERE profile_url = ?");
  const upsertBrief = db.prepare(`
    INSERT INTO briefs (prospect_id, topic, preparation_notes)
    VALUES (?, ?, ?)
    ON CONFLICT(prospect_id) DO UPDATE SET
      topic = excluded.topic,
      preparation_notes = excluded.preparation_notes,
      updated_at = CURRENT_TIMESTAMP
  `);
  const upsertMessage = db.prepare(`
    INSERT INTO messages (prospect_id, type, content, due_date, sent_date)
    VALUES (?, ?, ?, ?, NULL)
    ON CONFLICT(prospect_id, type) DO UPDATE SET
      content = excluded.content,
      due_date = excluded.due_date,
      updated_at = CURRENT_TIMESTAMP
  `);
  db.exec("BEGIN");
  try {
    for (const raw of items) {
      const item = normalizeAnalyzedProspect(raw);
      if (!item.name || !item.profileUrl) continue;
      const status = statusForImportedProspect(item);
      upsertProspect.run(
        item.name,
        item.position,
        item.profileUrl,
        item.about,
        item.priorityTag,
        item.wave,
        item.contactNow ? 1 : 0,
        item.rationale,
        item.recommendedTemplate,
        "",
        status
      );
      const prospect = getProspect.get(item.profileUrl);
      if (item.briefTopic) {
        upsertBrief.run(prospect.id, item.briefTopic, item.briefPreparation);
      }
      if (item.connectionMessage) {
        upsertMessage.run(prospect.id, "connection", item.connectionMessage, null);
      }
      if (item.reportMessage) {
        upsertMessage.run(prospect.id, "report", item.reportMessage, null);
      }
      if (item.followupMessage) {
        upsertMessage.run(prospect.id, "followup", item.followupMessage, null);
      }
      if (item.contactNow && status === "to_contact") {
        createOpenTask(prospect.id, "send_connection", `Send connection request to ${item.name}`, today);
      }
      addEvent(prospect.id, "batch_imported", `Analyzed as ${item.priorityTag}${item.wave ? ` wave ${item.wave}` : ""}.`, today);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function getDb() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA foreign_keys = ON");
    applyMigrations(database);
  }
  return database;
}
function applyMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const applied = new Set(db.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version));
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(file);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}
function createOpenTask(prospectId, type, title, dueDate) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM tasks WHERE prospect_id = ? AND type = ? AND status = 'open'").get(prospectId, type);
  if (!existing) {
    db.prepare("INSERT INTO tasks (prospect_id, type, title, due_date) VALUES (?, ?, ?, ?)").run(prospectId, type, title, dueDate);
  }
}
function completeOpenTask(prospectId, type) {
  getDb().prepare(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND type = ? AND status = 'open'
  `).run(todayIso(), prospectId, type);
}
function completeAllOpenTasks(prospectId) {
  getDb().prepare(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND status = 'open'
  `).run(todayIso(), prospectId);
}
function addEvent(prospectId, type, note, happenedAt) {
  getDb().prepare("INSERT INTO events (prospect_id, type, note, happened_at) VALUES (?, ?, ?, ?)").run(prospectId, type, note, happenedAt);
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
function statusForImportedProspect(item) {
  if (item.priorityTag === "SKIP") return "skipped";
  if (item.priorityTag === "SAVE") return "saved_for_later";
  return "to_contact";
}
function normalizeAnalyzedProspect(item) {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(item.priorityTag) ? item.priorityTag : "SKIP";
  const topic = trimWords(String(item.briefTopic || ""), 3);
  return {
    name: String(item.name || "").trim(),
    position: String(item.position || "").trim(),
    profileUrl: String(item.profileUrl || "").trim(),
    about: String(item.about || "").trim(),
    priorityTag: tag,
    wave: item.wave ? Number(item.wave) : null,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: String(item.rationale || "").trim(),
    briefTopic: topic,
    briefPreparation: String(item.briefPreparation || "").trim(),
    recommendedTemplate: String(item.recommendedTemplate || "").trim(),
    connectionMessage: String(item.connectionMessage || "").trim().slice(0, 300),
    reportMessage: String(item.reportMessage || "").trim(),
    followupMessage: String(item.followupMessage || "").trim()
  };
}
function trimWords(value, max) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, max).join(" ");
}
const meta$1 = () => [{
  title: "Tempolis Outreach"
}, {
  name: "description",
  content: "Internal Tempolis outreach tracker."
}];
function loader() {
  return getDashboard();
}
async function action$1({
  request
}) {
  const formData = await request.formData();
  runProspectAction(formData);
  return redirect("/");
}
const home = UNSAFE_withComponentProps(function Home() {
  const data = useLoaderData();
  const activeProspects = data.prospects.filter((prospect) => !["saved_for_later", "skipped"].includes(prospect.status));
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
          children: [/* @__PURE__ */ jsxs(Link, {
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
              children: data.today
            })]
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        children: [/* @__PURE__ */ jsx(Metric$1, {
          label: "Prospects",
          value: data.prospects.length
        }), /* @__PURE__ */ jsx(Metric$1, {
          label: "Pending connections",
          value: data.sections.pendingConnections.length
        }), /* @__PURE__ */ jsx(Metric$1, {
          label: "Reports to send",
          value: data.sections.acceptedReport.length
        }), /* @__PURE__ */ jsx(Metric$1, {
          label: "Follow-ups due",
          value: data.sections.followupsDue.length
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-8",
          children: [/* @__PURE__ */ jsxs("section", {
            children: [/* @__PURE__ */ jsx(SectionTitle, {
              title: "Today",
              detail: "What needs attention first."
            }), /* @__PURE__ */ jsxs("div", {
              className: "mt-3 grid gap-3",
              children: [/* @__PURE__ */ jsx(TodayPanel, {
                title: "Connect today",
                items: data.sections.toConnect,
                children: (task) => {
                  const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                  return prospect ? /* @__PURE__ */ jsx(ConnectTask, {
                    prospect
                  }) : null;
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                title: "Accepted, report to send",
                items: data.sections.acceptedReport,
                children: (prospect) => /* @__PURE__ */ jsx(ReportTask, {
                  prospect
                })
              }), /* @__PURE__ */ jsx(TodayPanel, {
                title: "Brief URLs missing",
                items: data.sections.missingBriefUrls,
                children: (prospect) => /* @__PURE__ */ jsx(BriefUrlTask, {
                  prospect
                })
              }), /* @__PURE__ */ jsx(TodayPanel, {
                title: "Follow-ups due",
                items: data.sections.followupsDue,
                children: (task) => {
                  const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                  return /* @__PURE__ */ jsx(FollowupTask, {
                    task,
                    prospect,
                    today: data.today
                  });
                }
              }), /* @__PURE__ */ jsx(TodayPanel, {
                title: "Pending connections",
                items: data.sections.pendingConnections,
                children: (prospect) => /* @__PURE__ */ jsx(PendingTask, {
                  prospect
                })
              })]
            })]
          }), /* @__PURE__ */ jsxs("section", {
            children: [/* @__PURE__ */ jsx(SectionTitle, {
              title: "Active prospects",
              detail: `${activeProspects.length} profiles in the working set.`
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-3 grid gap-3",
              children: activeProspects.map((prospect) => /* @__PURE__ */ jsx(ProspectCard, {
                prospect
              }, prospect.id))
            })]
          })]
        }), /* @__PURE__ */ jsxs("aside", {
          className: "h-fit rounded-lg border border-stone-300 bg-white p-5 lg:sticky lg:top-6",
          children: [/* @__PURE__ */ jsx(SectionTitle, {
            title: "Timeline",
            detail: "Latest events."
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-4 space-y-4",
            children: data.events.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : data.events.map((event) => /* @__PURE__ */ jsxs("div", {
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
function Metric$1({
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
function TodayPanel({
  title,
  items,
  children
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-300 bg-white p-4",
    children: [/* @__PURE__ */ jsx("h3", {
      className: "font-semibold",
      children: title
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-3 grid gap-2",
      children: items.length ? items.map((item, index) => /* @__PURE__ */ jsx("div", {
        children: children(item)
      }, index)) : /* @__PURE__ */ jsx(EmptyState, {})
    })]
  });
}
function ReportTask({
  prospect
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(TaskIntro, {
      icon: /* @__PURE__ */ jsx(Send, {
        size: 18
      }),
      title: prospect.name,
      detail: `${prospect.brief_topic || "No topic"} · report ready after acceptance`
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-wrap gap-2",
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy report",
        value: prospect.report_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markReportSent",
        prospectId: prospect.id,
        label: "Mark report sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      })]
    })]
  });
}
function ConnectTask({
  prospect
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(TaskIntro, {
      icon: /* @__PURE__ */ jsx(Send, {
        size: 18
      }),
      title: prospect.name,
      detail: `${prospect.brief_topic || "No topic"} · send LinkedIn connection request`
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-wrap gap-2",
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy request",
        value: prospect.connection_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markConnectionSent",
        prospectId: prospect.id,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      })]
    })]
  });
}
function BriefUrlTask({
  prospect
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-stone-200 bg-stone-50 p-3",
    children: [/* @__PURE__ */ jsx(TaskIntro, {
      icon: /* @__PURE__ */ jsx(LinkIcon, {
        size: 18
      }),
      title: prospect.name,
      detail: `Prepare: ${prospect.brief_topic}`
    }), /* @__PURE__ */ jsxs(FormShell, {
      className: "mt-3 grid gap-2 sm:grid-cols-[1fr_auto]",
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
        className: "min-h-10 rounded-md border border-stone-300 bg-white px-3 outline-none focus:border-teal-700"
      }), /* @__PURE__ */ jsxs("button", {
        className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
        children: [/* @__PURE__ */ jsx(LinkIcon, {
          size: 16
        }), "Add URL"]
      })]
    })]
  });
}
function FollowupTask({
  task,
  prospect,
  today
}) {
  const overdue = task.due_date && task.due_date < today;
  return /* @__PURE__ */ jsxs("div", {
    className: `grid gap-3 rounded-lg border bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center ${overdue ? "border-amber-500" : "border-stone-200"}`,
    children: [/* @__PURE__ */ jsx(TaskIntro, {
      icon: /* @__PURE__ */ jsx(CalendarCheck, {
        size: 18
      }),
      title: task.name || "Unknown",
      detail: `Due ${task.due_date || "soon"}`
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-wrap gap-2",
      children: [/* @__PURE__ */ jsx(CopyButton, {
        label: "Copy follow-up",
        value: prospect?.followup_message || ""
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "markFollowupSent",
        prospectId: task.prospect_id || 0,
        label: "Mark sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      })]
    })]
  });
}
function PendingTask({
  prospect
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center",
    children: [/* @__PURE__ */ jsx(TaskIntro, {
      icon: /* @__PURE__ */ jsx(Clock, {
        size: 18
      }),
      title: prospect.name,
      detail: `Sent ${prospect.connection_sent_date || "today"} · watch acceptance`
    }), /* @__PURE__ */ jsx(ActionButton, {
      intent: "markAccepted",
      prospectId: prospect.id,
      label: "Mark accepted",
      icon: /* @__PURE__ */ jsx(UserCheck, {
        size: 16
      }),
      primary: true
    })]
  });
}
function ProspectCard({
  prospect
}) {
  return /* @__PURE__ */ jsxs("article", {
    className: "rounded-lg border border-stone-300 bg-white p-5",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "text-lg font-semibold",
          children: prospect.name
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-stone-600",
          children: prospect.position
        }), /* @__PURE__ */ jsxs("a", {
          className: "mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900",
          href: prospect.profile_url,
          target: "_blank",
          rel: "noreferrer",
          children: ["LinkedIn profile", /* @__PURE__ */ jsx(ExternalLink, {
            size: 14
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-wrap gap-2",
        children: [/* @__PURE__ */ jsx(Badge$1, {
          children: prospect.priority_tag
        }), /* @__PURE__ */ jsxs(Badge$1, {
          children: ["Wave ", prospect.wave || "-"]
        }), /* @__PURE__ */ jsx(Badge$1, {
          tone: "blue",
          children: prospect.status
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-4 grid gap-4 md:grid-cols-2",
      children: [/* @__PURE__ */ jsx(InfoBlock, {
        title: "Brief",
        value: prospect.brief_topic || "No brief yet",
        detail: prospect.preparation_notes || void 0,
        link: prospect.shared_url || void 0
      }), /* @__PURE__ */ jsx(InfoBlock, {
        title: "Rationale",
        value: prospect.rationale || prospect.notes || ""
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-4 grid gap-3",
      children: [/* @__PURE__ */ jsx(MessageBlock, {
        title: "Connection message",
        content: prospect.connection_message
      }), /* @__PURE__ */ jsx(MessageBlock, {
        title: "Report message",
        content: prospect.report_message
      }), /* @__PURE__ */ jsx(MessageBlock, {
        title: "Follow-up",
        content: prospect.followup_message
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-4 flex flex-wrap gap-2",
      children: [prospect.status === "connection_sent" ? /* @__PURE__ */ jsx(ActionButton, {
        intent: "markAccepted",
        prospectId: prospect.id,
        label: "Mark accepted",
        icon: /* @__PURE__ */ jsx(UserCheck, {
          size: 16
        }),
        primary: true
      }) : null, prospect.status === "to_contact" && prospect.contact_now ? /* @__PURE__ */ jsx(ActionButton, {
        intent: "markConnectionSent",
        prospectId: prospect.id,
        label: "Mark connection sent",
        icon: /* @__PURE__ */ jsx(Send, {
          size: 16
        }),
        primary: true
      }) : null, prospect.connection_message ? /* @__PURE__ */ jsx(CopyButton, {
        label: "Copy request",
        value: prospect.connection_message
      }) : null, prospect.report_message ? /* @__PURE__ */ jsx(CopyButton, {
        label: "Copy report",
        value: prospect.report_message
      }) : null, prospect.status === "accepted" ? /* @__PURE__ */ jsx(ActionButton, {
        intent: "markReportSent",
        prospectId: prospect.id,
        label: "Mark report sent",
        icon: /* @__PURE__ */ jsx(Check, {
          size: 16
        }),
        primary: true
      }) : null, prospect.followup_message ? /* @__PURE__ */ jsx(CopyButton, {
        label: "Copy follow-up",
        value: prospect.followup_message
      }) : null, /* @__PURE__ */ jsx(ActionButton, {
        intent: "saveForLater",
        prospectId: prospect.id,
        label: "Save for later",
        icon: /* @__PURE__ */ jsx(Save, {
          size: 16
        })
      }), /* @__PURE__ */ jsx(ActionButton, {
        intent: "skip",
        prospectId: prospect.id,
        label: "Skip",
        icon: /* @__PURE__ */ jsx(SkipForward, {
          size: 16
        }),
        danger: true
      })]
    })]
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
function InfoBlock({
  title,
  value,
  detail,
  link
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsx("p", {
      className: "text-sm font-semibold",
      children: title
    }), /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-sm text-stone-700",
      children: value
    }), detail ? /* @__PURE__ */ jsx("p", {
      className: "mt-1 text-sm text-stone-500",
      children: detail
    }) : null, link ? /* @__PURE__ */ jsxs("a", {
      className: "mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700",
      href: link,
      target: "_blank",
      rel: "noreferrer",
      children: ["Shared brief ", /* @__PURE__ */ jsx(ExternalLink, {
        size: 14
      })]
    }) : null]
  });
}
function MessageBlock({
  title,
  content
}) {
  if (!content) return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "border-t border-stone-200 pt-3",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center justify-between gap-3",
      children: [/* @__PURE__ */ jsx("p", {
        className: "text-sm font-semibold",
        children: title
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
function ActionButton({
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
function EmptyState() {
  return /* @__PURE__ */ jsx("div", {
    className: "rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500",
    children: "Nothing here."
  });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: home,
  loader,
  meta: meta$1
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
- Write all outreach messages in English by default: connectionMessage, reportMessage, and followupMessage.
- Do not use French greetings or French message templates unless the input explicitly requests French. For now, assume English.
- Use brief topics of 1 to 3 words only.
- Respect the outreach rule: no product pitch, no demo/call request, short connection note under 300 characters.
- Generate the first post-acceptance report message and the J+5 follow-up.
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
      about: clean(row.about)
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
function normalizeProspect(item) {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(String(item.priorityTag)) ? item.priorityTag : "SKIP";
  const wave = typeof item.wave === "number" ? item.wave : null;
  const briefTopic = clean(item.briefTopic).split(/\s+/).slice(0, 3).join(" ");
  const firstName = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const connectionMessage = enforceEnglish(
    clean(item.connectionMessage),
    `Hi ${firstName}, I'm building a tool aimed at EU public affairs professionals. I prepared a brief on ${briefTopic || "your policy area"} that might resonate. Would value your view.`
  );
  const reportMessage = enforceEnglish(
    clean(item.reportMessage),
    `Hi ${firstName},

As promised, the brief on ${briefTopic || "your policy area"}: what public discourse is saying over the last 24 hours, outside media coverage.

[shared link]

I'm testing it with public affairs profiles before a proper launch. If the angle resonates, or if something feels off in the brief, your feedback would mean a lot.`
  );
  const followupMessage = enforceEnglish(
    clean(item.followupMessage),
    `Hi ${firstName}, following up in case the brief slipped through. No worries if this isn't the right timing.`
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
    followupMessage
  };
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
function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function clean(value) {
  return String(value || "").trim();
}
const meta = () => [{
  title: "New batch · Tempolis Outreach"
}, {
  name: "description",
  content: "Analyze a pasted LinkedIn outreach batch with OpenRouter."
}];
async function action({
  request
}) {
  const formData = await request.formData();
  const table = String(formData.get("table") || "");
  try {
    const analysis = await analyzeProspectTable(table);
    importAnalyzedProspects(analysis.prospects);
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
    about: ""
  }, {
    name: "",
    position: "",
    profileUrl: "",
    about: ""
  }, {
    name: "",
    position: "",
    profileUrl: "",
    about: ""
  }]);
  const tablePayload = toTsv(rows);
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8",
    children: /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs(Link, {
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
                  about: ""
                }]),
                className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700",
                children: [/* @__PURE__ */ jsx(Plus, {
                  size: 16
                }), "Add row"]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "mt-4 overflow-x-auto rounded-lg border border-stone-300",
              children: /* @__PURE__ */ jsxs("table", {
                className: "min-w-[1050px] w-full border-collapse bg-white text-sm",
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
                      className: "border-b border-stone-300 px-3 py-2",
                      children: "About"
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
              disabled: rows.filter(isFilledRow).length === 0,
              className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300",
              children: [/* @__PURE__ */ jsx(Brain, {
                size: 18
              }), "Analyze ", rows.filter(isFilledRow).length || "", " and import"]
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
function toTsv(rows) {
  const header = ["Name", "Position", "Profile URL", "About"];
  const body = rows.filter(isFilledRow).map((row) => [row.name, row.position, row.profileUrl, row.about].map(cleanCell).join("	"));
  return [header.join("	"), ...body].join("\n");
}
function cleanCell(value) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}
function isFilledRow(row) {
  return Boolean(row.name.trim() || row.position.trim() || row.profileUrl.trim() || row.about.trim());
}
function Results({
  analysis
}) {
  const toContact = analysis.prospects.filter((item) => item.contactNow);
  const wave2 = analysis.prospects.filter((item) => item.wave === 2);
  return /* @__PURE__ */ jsxs("section", {
    className: "mt-6 grid gap-6",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
      children: [/* @__PURE__ */ jsx(Metric, {
        label: "Total",
        value: analysis.summary.total
      }), /* @__PURE__ */ jsx(Metric, {
        label: "Connect today",
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
        }), "Actions for today"]
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-4 grid gap-3",
        children: toContact.length ? toContact.map((prospect) => /* @__PURE__ */ jsx(ActionCard, {
          prospect
        }, prospect.profileUrl)) : /* @__PURE__ */ jsx(Empty, {
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
        }, prospect.profileUrl)) : /* @__PURE__ */ jsx(Empty, {
          text: "No wave 2 profiles."
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "rounded-lg border border-stone-300 bg-white p-5",
      children: [/* @__PURE__ */ jsxs("h2", {
        className: "flex items-center gap-2 text-xl font-semibold",
        children: [/* @__PURE__ */ jsx(CheckCircle2, {
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
        children: "LinkedIn"
      })]
    }), /* @__PURE__ */ jsx(Message, {
      title: "Connection request",
      value: prospect.connectionMessage
    }), /* @__PURE__ */ jsx(Message, {
      title: "After acceptance",
      value: prospect.reportMessage
    }), /* @__PURE__ */ jsx(Message, {
      title: "Follow-up J+5",
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
        children: [/* @__PURE__ */ jsx(Badge, {
          children: prospect.priorityTag
        }), /* @__PURE__ */ jsxs(Badge, {
          children: ["Wave ", prospect.wave || "-"]
        }), prospect.briefTopic ? /* @__PURE__ */ jsx(Badge, {
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
function Badge({
  children
}) {
  return /* @__PURE__ */ jsx("span", {
    className: "inline-flex min-h-6 items-center rounded-full bg-teal-50 px-2.5 text-xs font-semibold text-teal-800",
    children
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
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: batch,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BbVYme2y.js", "imports": ["/assets/chunk-OE4NN4TA-DnIib_hb.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-C1whdJTd.js", "imports": ["/assets/chunk-OE4NN4TA-DnIib_hb.js"], "css": ["/assets/root-BkGb1jEB.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-COxxfx7C.js", "imports": ["/assets/chunk-OE4NN4TA-DnIib_hb.js", "/assets/send-47-eJgtI.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/batch": { "id": "routes/batch", "parentId": "root", "path": "batch", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/batch-DulDpkBf.js", "imports": ["/assets/chunk-OE4NN4TA-DnIib_hb.js", "/assets/send-47-eJgtI.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-75aaf9ea.js", "version": "75aaf9ea", "sri": void 0 };
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
