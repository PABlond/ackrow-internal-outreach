import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(appDir, "..", "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");

let database: DatabaseSync | undefined;

export type Prospect = {
  id: number;
  name: string;
  position: string | null;
  profile_url: string;
  about: string | null;
  priority_tag: string;
  wave: number | null;
  contact_now: number;
  rationale: string | null;
  recommended_template: string | null;
  notes: string | null;
  status: string;
  connection_sent_date: string | null;
  accepted_date: string | null;
  report_sent_date: string | null;
  followup_sent_date: string | null;
  brief_topic: string | null;
  preparation_notes: string | null;
  shared_url: string | null;
  connection_message: string | null;
  report_message: string | null;
  followup_message: string | null;
  followup_due_date: string | null;
};

export type AnalyzedProspect = {
  name: string;
  position: string;
  profileUrl: string;
  about: string;
  priorityTag: "LEARN" | "WARM" | "SAVE" | "SKIP";
  wave: number | null;
  contactNow: boolean;
  rationale: string;
  briefTopic: string;
  briefPreparation: string;
  recommendedTemplate: string;
  connectionMessage: string;
  reportMessage: string;
  followupMessage: string;
};

export type Task = {
  id: number;
  prospect_id: number | null;
  type: string;
  title: string;
  due_date: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  name: string | null;
  profile_url: string | null;
};

export type Event = {
  id: number;
  prospect_id: number | null;
  type: string;
  note: string | null;
  happened_at: string;
  name: string | null;
};

export function getProspectDetail(id: number) {
  const db = getDb();
  const prospect = db.prepare(`
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
    WHERE p.id = ?
  `).get(id) as Prospect | undefined;

  if (!prospect) return null;

  const tasks = db.prepare(`
    SELECT t.*, p.name, p.profile_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    WHERE t.prospect_id = ?
    ORDER BY
      CASE t.status WHEN 'open' THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `).all(id) as Task[];

  const events = db.prepare(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    WHERE e.prospect_id = ?
    ORDER BY e.happened_at DESC, e.id DESC
  `).all(id) as Event[];

  return { prospect, tasks, events, today: todayIso() };
}

export function getDashboard() {
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
  `).all() as Prospect[];

  const tasks = db.prepare(`
    SELECT t.*, p.name, p.profile_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    ORDER BY
      CASE WHEN t.due_date IS NOT NULL AND t.due_date < ? THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `).all(today) as Task[];

  const events = db.prepare(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    ORDER BY e.happened_at DESC, e.id DESC
    LIMIT 100
  `).all() as Event[];

  return {
    today,
    prospects,
    tasks,
    events,
    sections: {
      toConnect: tasks.filter((item) => item.status === "open" && item.type === "send_connection"),
      acceptedReport: prospects.filter((item) => item.status === "accepted" && !item.report_sent_date),
      missingBriefUrls: prospects.filter(
        (item) => ["connection_sent", "accepted"].includes(item.status) && Boolean(item.brief_topic) && !item.shared_url,
      ),
      followupsDue: tasks.filter(
        (item) => item.status === "open" && item.type === "send_followup" && item.due_date && item.due_date <= today,
      ),
      pendingConnections: prospects.filter((item) => item.status === "connection_sent"),
      doneToday: events.filter((item) => String(item.happened_at).slice(0, 10) === today),
    },
  };
}

export function runProspectAction(formData: FormData) {
  const id = Number(formData.get("prospectId"));
  const intent = String(formData.get("intent") || "");
  const db = getDb();
  const prospect = db.prepare("SELECT * FROM prospects WHERE id = ?").get(id) as { name: string } | undefined;

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
    } else if (intent === "archiveDeclined") {
      db.prepare("UPDATE prospects SET status = 'archived_declined', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      completeAllOpenTasks(id);
      addEvent(id, "archived_declined", "Connection request declined or ignored. Archived to avoid recontacting.", today);
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

export function importAnalyzedProspects(items: AnalyzedProspect[]) {
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
        status,
      );
      const prospect = getProspect.get(item.profileUrl) as { id: number; status: string };

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

function applyMigrations(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const applied = new Set((db.prepare("SELECT version FROM schema_migrations").all() as { version: string }[]).map((row) => row.version));
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

function createOpenTask(prospectId: number, type: string, title: string, dueDate: string | null) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM tasks WHERE prospect_id = ? AND type = ? AND status = 'open'").get(prospectId, type);
  if (!existing) {
    db.prepare("INSERT INTO tasks (prospect_id, type, title, due_date) VALUES (?, ?, ?, ?)").run(prospectId, type, title, dueDate);
  }
}

function completeOpenTask(prospectId: number, type: string) {
  getDb().prepare(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND type = ? AND status = 'open'
  `).run(todayIso(), prospectId, type);
}

function completeAllOpenTasks(prospectId: number) {
  getDb().prepare(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND status = 'open'
  `).run(todayIso(), prospectId);
}

function addEvent(prospectId: number, type: string, note: string, happenedAt: string) {
  getDb().prepare("INSERT INTO events (prospect_id, type, note, happened_at) VALUES (?, ?, ?, ?)").run(prospectId, type, note, happenedAt);
}

function todayIso() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function addDaysIso(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function statusForImportedProspect(item: AnalyzedProspect) {
  if (item.priorityTag === "SKIP") return "skipped";
  if (item.priorityTag === "SAVE") return "saved_for_later";
  return "to_contact";
}

function normalizeAnalyzedProspect(item: AnalyzedProspect): AnalyzedProspect {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(item.priorityTag) ? item.priorityTag : "SKIP";
  const topic = trimWords(String(item.briefTopic || ""), 3);
  return {
    name: String(item.name || "").trim(),
    position: String(item.position || "").trim(),
    profileUrl: String(item.profileUrl || "").trim(),
    about: String(item.about || "").trim(),
    priorityTag: tag as AnalyzedProspect["priorityTag"],
    wave: item.wave ? Number(item.wave) : null,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: String(item.rationale || "").trim(),
    briefTopic: topic,
    briefPreparation: String(item.briefPreparation || "").trim(),
    recommendedTemplate: String(item.recommendedTemplate || "").trim(),
    connectionMessage: String(item.connectionMessage || "").trim().slice(0, 300),
    reportMessage: String(item.reportMessage || "").trim(),
    followupMessage: String(item.followupMessage || "").trim(),
  };
}

function trimWords(value: string, max: number) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, max).join(" ");
}
