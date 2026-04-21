import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csv.js";

const docsDir = path.resolve(process.cwd(), "..", "tempolis", "front", "docs");
const prospectsCsv = "Tempolis-Linkedin-outreach-list - Sheet1.csv";
const wavesCsv = "outreach-prospect-waves.csv";
const archiveCsv = "outreach-contacted-archive.csv";
const actionsCsv = "outreach-actions-2026-04-21.csv";

export function importSeedData(db) {
  const prospects = readCsv(prospectsCsv);
  const waves = byUrl(readCsv(wavesCsv));
  const archive = byUrl(readCsv(archiveCsv));
  const actions = byUrl(readCsv(actionsCsv));

  const upsertProspect = db.prepare(`
    INSERT INTO prospects (
      name, position, profile_url, about, priority_tag, wave, contact_now,
      rationale, recommended_template, notes, status, connection_sent_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      status = excluded.status,
      connection_sent_date = excluded.connection_sent_date,
      updated_at = CURRENT_TIMESTAMP
  `);
  const upsertBrief = db.prepare(`
    INSERT INTO briefs (prospect_id, topic, preparation_notes)
    VALUES (?, ?, ?)
    ON CONFLICT DO NOTHING
  `);
  const updateBrief = db.prepare(`
    UPDATE briefs
    SET topic = ?, preparation_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ?
  `);
  const upsertMessage = db.prepare(`
    INSERT INTO messages (prospect_id, type, content, due_date, sent_date)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(prospect_id, type) DO UPDATE SET
      content = excluded.content,
      due_date = excluded.due_date,
      sent_date = COALESCE(messages.sent_date, excluded.sent_date),
      updated_at = CURRENT_TIMESTAMP
  `);
  const insertEvent = db.prepare(`
    INSERT INTO events (prospect_id, type, note, happened_at)
    VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `);
  const upsertTask = db.prepare(`
    INSERT INTO tasks (prospect_id, type, title, due_date, status)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM tasks WHERE prospect_id IS ? AND type = ? AND status = ?
    )
  `);
  const getId = db.prepare("SELECT id FROM prospects WHERE profile_url = ?");

  db.exec("BEGIN");
  try {
    for (const prospect of prospects) {
      const url = prospect["Profile URL"];
      const wave = waves.get(url) ?? {};
      const archived = archive.get(url) ?? {};
      const action = actions.get(url) ?? {};
      const tag = wave["Priority tag"] || action["Priority tag"] || archived["Priority tag"] || "LEARN";
      const status = deriveStatus(tag, archived, action);
      const connectionSentDate = archived["First contact date"] || (action["Action today"] ? "2026-04-21" : "");

      upsertProspect.run(
        prospect.Name,
        prospect.Position,
        url,
        prospect.About,
        tag,
        nullableInt(wave.Wave || action.Wave || archived.Wave),
        boolToInt(wave["Contact now?"]),
        wave.Rationale || "",
        wave["Recommended template"] || "",
        wave.Notes || "",
        status,
        connectionSentDate || null,
      );

      const { id } = getId.get(url);
      const topic = cleanTopic(wave["Recommended brief topic"] || archived["Topic used"] || "");
      const prep = action["Brief to prepare before sending"] || "";
      if (topic) {
        upsertBrief.run(id, topic, prep);
        updateBrief.run(topic, prep, id);
      }

      if (action["Connection message"]) {
        upsertMessage.run(id, "connection", action["Connection message"], connectionSentDate || null, connectionSentDate || null);
      }
      if (action["First message after accepted"]) {
        upsertMessage.run(id, "report", action["First message after accepted"], null, null);
      }
      if (action["Follow-up message"]) {
        upsertMessage.run(id, "followup", action["Follow-up message"], action["Follow-up date"] || null, null);
      }
      if (status === "connection_sent") {
        upsertTask.run(id, "watch_acceptance", `Watch LinkedIn acceptance for ${prospect.Name}`, null, "open", id, "watch_acceptance", "open");
        insertEvent.run(id, "connection_sent", "Connection request sent from the initial outreach batch.", connectionSentDate || null);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readCsv(file) {
  const fullPath = path.join(docsDir, file);
  return parseCsv(fs.readFileSync(fullPath, "utf8"));
}

function byUrl(rows) {
  return new Map(rows.filter((row) => row["Profile URL"]).map((row) => [row["Profile URL"], row]));
}

function deriveStatus(tag, archived, action) {
  if (tag === "SKIP") return "skipped";
  if (tag === "SAVE") return "saved_for_later";
  if (archived.Status === "planned" || action["Action today"]) return "connection_sent";
  return "to_contact";
}

function nullableInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function boolToInt(value) {
  return String(value).toLowerCase() === "yes" ? 1 : 0;
}

function cleanTopic(topic) {
  if (!topic || topic === "None" || topic === "To enrich before contact") return "";
  return topic;
}
