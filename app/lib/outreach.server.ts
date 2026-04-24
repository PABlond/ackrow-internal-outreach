import { createClient, type Client, type InValue } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(appDir, "..", "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");

let database: Client | undefined;
let databaseReady: Promise<void> | undefined;
let databaseUsesEmbeddedReplica = false;
let syncInProgress: Promise<unknown> | null = null;

export type Prospect = {
  id: number;
  workspace_id: number | null;
  workspace_slug: string | null;
  workspace_name: string | null;
  name: string;
  position: string | null;
  profile_url: string;
  source_channel: "linkedin" | "twitter";
  twitter_handle: string | null;
  twitter_url: string | null;
  about: string | null;
  priority_tag: string;
  wave: number | null;
  contact_now: number;
  rationale: string | null;
  recommended_template: string | null;
  notes: string | null;
  status: string;
  outreach_mode: "with_note" | "no_note";
  connection_note_sent: number;
  connection_sent_date: string | null;
  accepted_date: string | null;
  report_sent_date: string | null;
  followup_sent_date: string | null;
  twitter_contacted_date: string | null;
  twitter_followup_sent_date: string | null;
  pending_checked_at: string | null;
  connection_last_state: string | null;
  brief_topic: string | null;
  preparation_notes: string | null;
  shared_url: string | null;
  connection_message: string | null;
  report_message: string | null;
  no_note_report_message: string | null;
  post_acceptance_message: string | null;
  followup_message: string | null;
  twitter_dm_message: string | null;
  twitter_followup_message: string | null;
  followup_due_date: string | null;
};

type NoNoteRewrite = {
  noNoteReportMessage: string;
  followupMessage: string;
};

type MessageRegeneration = {
  connectionMessage?: string;
  reportMessage?: string;
  noNoteReportMessage?: string;
  followupMessage?: string;
  twitterDmMessage?: string;
  twitterFollowupMessage?: string;
};

type ReplyDraft = {
  suggestedResponse: string;
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
  noNoteReportMessage: string;
  followupMessage: string;
  sourceChannel?: "linkedin" | "twitter";
  twitterHandle?: string;
  twitterUrl?: string;
  twitterDmMessage?: string;
  twitterFollowupMessage?: string;
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
  source_channel: string | null;
  twitter_url: string | null;
};

export type Event = {
  id: number;
  prospect_id: number | null;
  type: string;
  note: string | null;
  happened_at: string;
  name: string | null;
};

export type Reply = {
  id: number;
  prospect_id: number;
  inbound_content: string;
  suggested_response: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProspectEvidence = {
  id: number;
  prospect_id: number;
  workspace_id: number;
  source_channel: "linkedin" | "twitter";
  capture_source: string;
  payload_json: string;
  summary_text: string;
  created_at: string;
};

export type DashboardStatsPoint = {
  date: string;
  label: string;
  value: number;
};

export type DashboardFunnelStats = {
  prospectsAdded: number;
  firstTouchesSent: number;
  linkedinAccepted: number;
  reportsSent: number;
  repliesReceived: number;
  activeConversations: number;
};

export type DashboardRateStats = {
  linkedinAcceptRate: number | null;
  replyRate: number | null;
  activeConversationRate: number | null;
  linkedinConnectionsSent: number;
  firstMessagesSent: number;
  repliesReceived: number;
};

export type DashboardProcessHealth = {
  followupsOverdue: number;
  oldestOverdueDays: number | null;
  acceptedWithoutReport: number;
  pendingChecksDue: number;
};

export type DashboardImportQuality = {
  learn: number;
  warm: number;
  save: number;
  skip: number;
  learnRate: number | null;
};

export type DashboardChannelBreakdown = {
  channel: "linkedin" | "twitter";
  prospects: number;
  firstTouches: number;
  replies: number;
  activeConversations: number;
  replyRate: number | null;
};

export type DashboardTopicPerformance = {
  topic: string;
  prospects: number;
  firstTouches: number;
  replies: number;
  activeConversations: number;
  replyRate: number | null;
};

export type Workspace = {
  id: number;
  slug: string;
  name: string;
  product_name: string;
  default_language: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceTodoSummary = {
  workspace_id: number;
  workspace_slug: string;
  workspace_name: string;
  todo_count: number;
  overdue_count: number;
};

export type ProspectSearchResult = {
  id: number;
  name: string;
  position: string | null;
  workspace_slug: string;
  workspace_name: string;
  status: string;
  source_channel: "linkedin" | "twitter";
};

export type WorkspaceDoc = {
  id: number;
  workspace_id: number;
  type: string;
  title: string;
  content: string;
  source_path: string | null;
  created_at: string;
  updated_at: string;
};

export type PromptTemplate = {
  id: number;
  workspace_id: number;
  channel: "linkedin" | "twitter";
  purpose: "batch_analysis" | "no_note_rewrite" | "message_regeneration";
  name: string;
  system_prompt: string;
  user_prompt: string;
  model: string;
  temperature: number;
  active: number;
  version: number;
  created_at: string;
  updated_at: string;
};

export type ExtensionPendingConnection = {
  id: number;
  name: string;
  position: string | null;
  profile_url: string;
  outreach_mode: "with_note" | "no_note";
  connection_sent_date: string | null;
  pending_checked_at: string | null;
  connection_last_state: string | null;
};

export async function getWorkspaces() {
  return await all<Workspace>("SELECT * FROM workspaces ORDER BY name");
}

export async function getWorkspaceBySlug(slug: string) {
  return await one<Workspace>("SELECT * FROM workspaces WHERE slug = ?", [slug]);
}

export async function getActiveWorkspace() {
  const fallback = await one<Workspace>("SELECT * FROM workspaces WHERE slug = 'tempolis'");
  if (!fallback) throw new Error("Default workspace is missing.");
  return fallback;
}

export async function requireWorkspace(slug: string | undefined) {
  const workspace = slug ? await getWorkspaceBySlug(slug) : null;
  if (!workspace) {
    throw new Response("Workspace not found", { status: 404, statusText: "Workspace Not Found" });
  }
  return workspace;
}

export async function getWorkspaceShellData(slug: string | undefined) {
  const [workspaces, activeWorkspace, todoSummaries] = await Promise.all([
    getWorkspaces(),
    requireWorkspace(slug),
    getWorkspaceTodoSummaries(),
  ]);
  return { workspaces, activeWorkspace, todoSummaries };
}

export async function searchProspectsGlobally(query: string, limit = 8) {
  const normalized = String(query || "").trim();
  if (normalized.length < 2) return [] as ProspectSearchResult[];

  const like = `%${escapeLike(normalized)}%`;
  const prefix = `${escapeLike(normalized)}%`;

  return await all<ProspectSearchResult>(`
    SELECT
      p.id,
      p.name,
      p.position,
      w.slug AS workspace_slug,
      w.name AS workspace_name,
      p.status,
      p.source_channel
    FROM prospects p
    JOIN workspaces w ON w.id = p.workspace_id
    WHERE
      p.name LIKE ? ESCAPE '\\'
      OR COALESCE(p.position, '') LIKE ? ESCAPE '\\'
      OR COALESCE(p.profile_url, '') LIKE ? ESCAPE '\\'
      OR COALESCE(p.twitter_handle, '') LIKE ? ESCAPE '\\'
    ORDER BY
      CASE
        WHEN lower(p.name) = lower(?) THEN 0
        WHEN lower(p.name) LIKE lower(?) ESCAPE '\\' THEN 1
        WHEN lower(COALESCE(p.position, '')) LIKE lower(?) ESCAPE '\\' THEN 2
        ELSE 3
      END,
      CASE
        WHEN p.status IN ('conversation_active', 'reply_sent', 'accepted', 'report_sent', 'connection_sent') THEN 0
        WHEN p.status = 'to_contact' THEN 1
        ELSE 2
      END,
      p.updated_at DESC,
      p.created_at DESC
    LIMIT ?
  `, [like, like, like, like, normalized, prefix, prefix, limit]);
}

export async function getWorkspaceTodoSummaries() {
  const today = todayIso();
  const rows = await all<{
    workspace_id: number;
    workspace_slug: string;
    workspace_name: string;
    todo_count: number;
    overdue_count: number;
  }>(`
    SELECT
      w.id AS workspace_id,
      w.slug AS workspace_slug,
      w.name AS workspace_name,
      (
        SELECT COUNT(*)
        FROM prospects p
        WHERE p.workspace_id = w.id
          AND p.status = 'accepted'
          AND p.report_sent_date IS NULL
      ) + (
        SELECT COUNT(*)
        FROM tasks t
        JOIN prospects p ON p.id = t.prospect_id
        WHERE p.workspace_id = w.id
          AND t.status = 'open'
          AND t.type IN ('send_followup', 'send_twitter_followup')
          AND t.due_date IS NOT NULL
          AND t.due_date <= ?
      ) + (
        SELECT COUNT(*)
        FROM tasks t
        JOIN prospects p ON p.id = t.prospect_id
        WHERE p.workspace_id = w.id
          AND t.status = 'open'
          AND t.type IN ('send_connection', 'send_twitter_dm')
      ) + (
        SELECT COUNT(*)
        FROM briefs b
        JOIN prospects p ON p.id = b.prospect_id
        WHERE p.workspace_id = w.id
          AND p.status <> 'connection_sent'
          AND p.status IN ('accepted')
          AND b.topic IS NOT NULL
          AND trim(b.topic) <> ''
          AND (b.shared_url IS NULL OR trim(b.shared_url) = '')
      ) + (
        SELECT COUNT(*)
        FROM prospects p
        WHERE p.workspace_id = w.id
          AND p.status = 'connection_sent'
          AND (
            p.pending_checked_at IS NULL
            OR p.pending_checked_at <= datetime('now', '-4 hours')
          )
      ) AS todo_count,
      (
        SELECT COUNT(*)
        FROM tasks t
        JOIN prospects p ON p.id = t.prospect_id
        WHERE p.workspace_id = w.id
          AND t.status = 'open'
          AND t.type IN ('send_followup', 'send_twitter_followup')
          AND t.due_date IS NOT NULL
          AND t.due_date < ?
      ) AS overdue_count
    FROM workspaces w
    ORDER BY w.name
  `, [today, today]);

  return rows.map((row) => ({
    ...row,
    todo_count: Number(row.todo_count || 0),
    overdue_count: Number(row.overdue_count || 0),
  })) satisfies WorkspaceTodoSummary[];
}

export async function getWorkspaceDocs(workspaceId: number) {
  return await all<WorkspaceDoc>("SELECT * FROM workspace_docs WHERE workspace_id = ? ORDER BY type", [workspaceId]);
}

export async function getActivePromptTemplate(workspaceId: number, channel: "linkedin" | "twitter", purpose: PromptTemplate["purpose"]) {
  const template = await one<PromptTemplate>(`
    SELECT *
    FROM prompt_templates
    WHERE workspace_id = ? AND channel = ? AND purpose = ? AND active = 1
    ORDER BY version DESC, id DESC
  `, [workspaceId, channel, purpose]);
  if (!template) throw new Error(`Missing active prompt template for ${channel}/${purpose}.`);
  return template;
}

export async function saveProspectEvidence(input: {
  prospectId: number;
  workspaceId: number;
  sourceChannel: "linkedin" | "twitter";
  captureSource: string;
  payload: unknown;
}) {
  const summaryText = summarizeEvidencePayload(input.payload, input.sourceChannel);
  await run(`
    INSERT INTO prospect_evidence (
      prospect_id, workspace_id, source_channel, capture_source, payload_json, summary_text
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    input.prospectId,
    input.workspaceId,
    input.sourceChannel,
    input.captureSource,
    JSON.stringify(input.payload),
    summaryText,
  ]);
}

export async function getLatestProspectEvidence(prospectId: number, workspaceId?: number) {
  return await one<ProspectEvidence>(`
    SELECT *
    FROM prospect_evidence
    WHERE prospect_id = ?
      ${workspaceId ? "AND workspace_id = ?" : ""}
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `, workspaceId ? [prospectId, workspaceId] : [prospectId]);
}

function summarizeEvidencePayload(payload: unknown, sourceChannel: "linkedin" | "twitter") {
  const input = (payload || {}) as Record<string, unknown>;
  const parts = [
    `Channel: ${sourceChannel}`,
    textPart("Name", input.name),
    textPart(sourceChannel === "twitter" ? "Handle" : "Position", sourceChannel === "twitter" ? input.twitterHandle || input.position : input.position),
    textPart(sourceChannel === "twitter" ? "Bio" : "About", input.about),
    textPart("Brief direction", input.briefDirection),
    sourceChannel === "linkedin" ? textPart("Experience", input.experience, 2500) : "",
    sourceChannel === "linkedin" ? textPart("Education", input.education, 1200) : "",
    textPart(sourceChannel === "twitter" ? "Visible posts" : "Activity", input.activity, 3500),
    textPart("Additional signals", input.signals, 1500),
    textPart("Raw visible text", input.rawText, 3000),
  ].filter(Boolean);
  return parts.join("\n\n").slice(0, 14000);
}

function textPart(label: string, value: unknown, max = 1800) {
  const text = String(value || "").trim();
  return text ? `${label}:\n${text.slice(0, max)}` : "";
}

export async function recordPromptRun(input: {
  workspaceId: number;
  promptTemplateId?: number | null;
  prospectId?: number | null;
  inputJson: unknown;
  outputJson: unknown;
  model: string;
}) {
  await run(`
    INSERT INTO prompt_runs (workspace_id, prompt_template_id, prospect_id, input_json, output_json, model)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    input.workspaceId,
    input.promptTemplateId || null,
    input.prospectId || null,
    JSON.stringify(input.inputJson),
    JSON.stringify(input.outputJson),
    input.model,
  ]);
}

export async function getWorkspaceSettings(workspaceId: number) {
  const [workspace, docs, prompts] = await Promise.all([
    one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [workspaceId]),
    getWorkspaceDocs(workspaceId),
    all<PromptTemplate>(`
      SELECT *
      FROM prompt_templates
      WHERE workspace_id = ? AND active = 1
      ORDER BY channel, purpose
    `, [workspaceId]),
  ]);
  if (!workspace) throw new Error("Workspace not found.");
  return { workspace, docs, prompts };
}

export async function runWorkspaceSettingsAction(formData: FormData, workspaceId: number) {
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
    const existing = await one<PromptTemplate>("SELECT * FROM prompt_templates WHERE id = ? AND workspace_id = ?", [promptId, workspaceId]);
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

export async function findProspectByProfileUrl(profileUrl: string, workspaceId?: number) {
  const normalized = normalizeLinkedInUrl(profileUrl);
  const row = workspaceId
    ? await one<{ id: number }>("SELECT id FROM prospects WHERE profile_url = ? AND workspace_id = ?", [normalized, workspaceId])
    : await one<{ id: number }>("SELECT id FROM prospects WHERE profile_url = ?", [normalized]);
  return row?.id || null;
}

export async function setProspectOutreachPreference(id: number, mode: "with_note" | "no_note") {
  const today = todayIso();
  await run("UPDATE prospects SET outreach_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [mode, id]);
  await addEvent(id, mode === "no_note" ? "no_note_mode_selected" : "with_note_mode_selected", `Extension selected ${mode === "no_note" ? "no-note" : "with-note"} outreach mode.`, today);
}

export async function getExtensionDashboard(workspaceId?: number) {
  const workspace = workspaceId ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [workspaceId]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const pendingCheckDelayHours = 4;
  const pendingConnections = await all<ExtensionPendingConnection>(`
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
    pendingConnections,
  };
}

export async function syncProspectConnectionState(id: number, state: "accepted" | "declined" | "pending") {
  const today = todayIso();
  const prospect = await one<Pick<Prospect, "id" | "name" | "status">>("SELECT id, name, status FROM prospects WHERE id = ?", [id]);
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

export async function getProspectDetail(id: number, workspaceId?: number) {
  const prospect = await one<Prospect>(`
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

  const tasks = await all<Task>(`
    SELECT t.*, p.name, p.profile_url, p.source_channel, p.twitter_url
    FROM tasks t
    LEFT JOIN prospects p ON p.id = t.prospect_id
    WHERE t.prospect_id = ?
    ORDER BY
      CASE t.status WHEN 'open' THEN 0 ELSE 1 END,
      COALESCE(t.due_date, '9999-12-31'),
      t.created_at
  `, [id]);

  const events = await all<Event>(`
    SELECT e.*, p.name
    FROM events e
    LEFT JOIN prospects p ON p.id = e.prospect_id
    WHERE e.prospect_id = ?
    ORDER BY e.happened_at DESC, e.id DESC
  `, [id]);

  const replies = await all<Reply>(`
    SELECT *
    FROM replies
    WHERE prospect_id = ?
    ORDER BY created_at DESC, id DESC
  `, [id]);
  const latestEvidence = await getLatestProspectEvidence(id, workspaceId);

  return { prospect: withDerivedMessages(prospect), tasks, events, replies, latestEvidence, today: todayIso() };
}

export async function getDashboard(workspaceInput?: number | Workspace) {
  const workspace = typeof workspaceInput === "object"
    ? workspaceInput
    : workspaceInput
      ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [workspaceInput])
      : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const today = todayIso();
  const [prospectRows, tasks, events, stats] = await Promise.all([
    all<Prospect>(`
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
    all<Task>(`
      SELECT t.*, p.name, p.profile_url, p.source_channel, p.twitter_url
      FROM tasks t
      LEFT JOIN prospects p ON p.id = t.prospect_id
      WHERE p.workspace_id = ?
      ORDER BY
        CASE WHEN t.due_date IS NOT NULL AND t.due_date < ? THEN 0 ELSE 1 END,
        COALESCE(t.due_date, '9999-12-31'),
        t.created_at
    `, [workspace.id, today]),
    all<Event>(`
      SELECT e.*, p.name
      FROM events e
      LEFT JOIN prospects p ON p.id = e.prospect_id
      WHERE p.workspace_id = ?
      ORDER BY e.happened_at DESC, e.id DESC
      LIMIT 100
    `, [workspace.id]),
    getDashboardStats(today, workspace.id),
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
        (item) => ["connection_sent", "accepted"].includes(item.status) && Boolean(item.brief_topic) && !item.shared_url,
      ),
      followupsDue: tasks.filter(
        (item) => item.status === "open" && ["send_followup", "send_twitter_followup"].includes(item.type) && item.due_date && item.due_date <= today,
      ),
      followupsScheduled: tasks.filter(
        (item) => item.status === "open" && ["send_followup", "send_twitter_followup"].includes(item.type) && item.due_date && item.due_date > today,
      ),
      conversationsActive: prospects.filter((item) => item.status === "conversation_active"),
      pendingConnections: prospects.filter((item) => item.status === "connection_sent"),
      doneToday: events.filter((item) => String(item.happened_at).slice(0, 10) === today),
    },
  };
}

async function getDashboardStats(today: string, workspaceId: number) {
  const days7 = Array.from({ length: 7 }, (_, index) => addDaysIso(today, index - 6));
  const days30 = Array.from({ length: 30 }, (_, index) => addDaysIso(today, index - 29));
  const firstDay7 = days7[0];
  const firstDay30 = days30[0];
  const sentEventTypes = [
    "report_sent",
    "followup_sent",
    "reply_sent",
    "twitter_dm_sent",
    "twitter_followup_sent",
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
    topicPerformance,
  ] = await Promise.all([
    all<{ date: string; count: number }>(`
      SELECT date(events.happened_at) AS date, COUNT(*) AS count
      FROM events
      JOIN prospects p ON p.id = events.prospect_id
      WHERE events.type IN (${sentEventTypes.map(() => "?").join(", ")})
        AND p.workspace_id = ?
        AND date(events.happened_at) >= ?
        AND date(events.happened_at) <= ?
      GROUP BY date(events.happened_at)
    `, [...sentEventTypes, workspaceId, firstDay7, today]),
    all<{ date: string; count: number }>(`
      SELECT date(events.happened_at) AS date, COUNT(*) AS count
      FROM events
      JOIN prospects p ON p.id = events.prospect_id
      WHERE events.type IN (${sentEventTypes.map(() => "?").join(", ")})
        AND p.workspace_id = ?
        AND date(events.happened_at) >= ?
        AND date(events.happened_at) <= ?
      GROUP BY date(events.happened_at)
    `, [...sentEventTypes, workspaceId, firstDay30, today]),
    one<{ count: number }>(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) < ?
    `, [workspaceId, firstDay7]),
    all<{ date: string; count: number }>(`
      SELECT date(created_at) AS date, COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) >= ?
        AND date(created_at) <= ?
      GROUP BY date(created_at)
    `, [workspaceId, firstDay7, today]),
    one<{ count: number }>(`
      SELECT COUNT(*) AS count
      FROM prospects
      WHERE workspace_id = ?
        AND date(created_at) < ?
    `, [workspaceId, firstDay30]),
    all<{ date: string; count: number }>(`
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
    getTopicPerformance(workspaceId, firstDay30, today),
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
      value: sentByDay7.get(date) || 0,
    })),
    messagesSent30d: days30.map((date) => ({
      date,
      label: shortDayLabel(date),
      value: sentByDay30.get(date) || 0,
    })),
    prospects7d: days7.map((date) => {
      cumulativeProspects7 += createdByDay7.get(date) || 0;
      return {
        date,
        label: shortDayLabel(date),
        value: cumulativeProspects7,
      };
    }),
    prospects30d: days30.map((date) => {
      cumulativeProspects30 += createdByDay30.get(date) || 0;
      return {
        date,
        label: shortDayLabel(date),
        value: cumulativeProspects30,
      };
    }),
    funnel7d,
    funnel30d,
    rates7d,
    rates30d,
    processHealth,
    importQuality,
    channelBreakdown,
    topicPerformance,
  };
}

async function getFunnelStats(workspaceId: number, firstDay: string, today: string): Promise<DashboardFunnelStats> {
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
    `, [workspaceId, firstDay, today]),
  ]);
  return { prospectsAdded, firstTouchesSent, linkedinAccepted, reportsSent, repliesReceived, activeConversations };
}

async function getRateStats(workspaceId: number, firstDay: string, today: string): Promise<DashboardRateStats> {
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
    `, [workspaceId, firstDay, today]),
  ]);
  return {
    linkedinAcceptRate: ratio(linkedinAccepted, linkedinConnectionsSent),
    replyRate: ratio(repliesReceived, firstMessagesSent),
    activeConversationRate: ratio(activeConversations, repliesReceived),
    linkedinConnectionsSent,
    firstMessagesSent,
    repliesReceived,
  };
}

async function getProcessHealth(workspaceId: number, today: string): Promise<DashboardProcessHealth> {
  const [overdue, acceptedWithoutReport, pendingChecksDue] = await Promise.all([
    one<{ count: number; oldest_due: string | null }>(`
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
    `, [workspaceId]),
  ]);
  return {
    followupsOverdue: Number(overdue?.count || 0),
    oldestOverdueDays: overdue?.oldest_due ? daysBetween(overdue.oldest_due, today) : null,
    acceptedWithoutReport,
    pendingChecksDue,
  };
}

async function getImportQuality(workspaceId: number): Promise<DashboardImportQuality> {
  const rows = await all<{ priority_tag: string; count: number }>(`
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

async function getChannelBreakdown(workspaceId: number, firstDay: string, today: string): Promise<DashboardChannelBreakdown[]> {
  const rows = await all<{
    channel: "linkedin" | "twitter";
    prospects: number;
    first_touches: number;
    replies: number;
    active_conversations: number;
  }>(`
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
  return (["linkedin", "twitter"] as const).map((channel) => {
    const row = byChannel.get(channel);
    const firstTouches = Number(row?.first_touches || 0);
    const replies = Number(row?.replies || 0);
    return {
      channel,
      prospects: Number(row?.prospects || 0),
      firstTouches,
      replies,
      activeConversations: Number(row?.active_conversations || 0),
      replyRate: ratio(replies, firstTouches),
    };
  });
}

async function getTopicPerformance(workspaceId: number, firstDay: string, today: string): Promise<DashboardTopicPerformance[]> {
  const rows = await all<{
    topic: string;
    prospects: number;
    first_touches: number;
    replies: number;
    active_conversations: number;
  }>(`
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
      replyRate: ratio(replies, firstTouches),
    };
  });
}

async function countReportsSent(workspaceId: number, firstDay: string, today: string) {
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

async function countOne(sql: string, args: InValue[] = []) {
  const row = await one<{ count: number }>(sql, args);
  return Number(row?.count || 0);
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(`${fromIso}T12:00:00Z`).getTime();
  const to = new Date(`${toIso}T12:00:00Z`).getTime();
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

export async function runProspectAction(formData: FormData, workspaceId?: number) {
  const id = Number(formData.get("prospectId"));
  const intent = String(formData.get("intent") || "");
  const prospect = await one<Pick<Prospect, "name" | "position" | "about" | "recommended_template" | "workspace_id">>(
    `SELECT * FROM prospects WHERE id = ? ${workspaceId ? "AND workspace_id = ?" : ""}`,
    workspaceId ? [id, workspaceId] : [id],
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
        today,
      );
    } catch (error) {
      throw error;
    }
    return;
  }

  if (intent === "regenerateFromLatestCapture") {
    const generated = await generateMessagesFromLatestEvidence(id);
    if (generated.connectionMessage) {
      await upsertGeneratedMessage(id, "connection", generated.connectionMessage.slice(0, 300), null);
    }
    if (generated.reportMessage) {
      await upsertGeneratedMessage(id, "report", generated.reportMessage, null);
    }
    if (generated.noNoteReportMessage) {
      await upsertGeneratedMessage(id, "report_no_note", generated.noNoteReportMessage, null);
    }
    if (generated.followupMessage) {
      await upsertGeneratedMessage(id, "followup", generated.followupMessage, null);
    }
    if (generated.twitterDmMessage) {
      await upsertGeneratedMessage(id, "twitter_dm", generated.twitterDmMessage, null);
    }
    if (generated.twitterFollowupMessage) {
      await upsertGeneratedMessage(id, "twitter_followup", generated.twitterFollowupMessage, null);
    }
    await addEvent(id, "messages_regenerated_from_evidence", "Messages regenerated from latest captured evidence.", today);
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
      const suggestedResponse = String(formData.get("suggestedResponse") || "").trim()
        || (await generateReplyDraft(id, inboundContent, responseDirection)).suggestedResponse;
      await run("INSERT INTO replies (prospect_id, inbound_content, suggested_response) VALUES (?, ?, ?)", [id, inboundContent, suggestedResponse]);
      await run("UPDATE prospects SET status = 'conversation_active', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
      await completeOpenTask(id, "send_followup");
      await addEvent(id, "reply_received", responseDirection ? `Prospect replied. Draft generated with direction: ${responseDirection}` : "Prospect replied. Follow-up task closed.", today);
    } else if (intent === "regenerateReplyResponse") {
      const replyId = Number(formData.get("replyId"));
      const responseDirection = String(formData.get("responseDirection") || "").trim();
      if (!replyId) throw new Error("Reply id is required");
      const reply = await one<Pick<Reply, "inbound_content">>("SELECT inbound_content FROM replies WHERE id = ? AND prospect_id = ?", [replyId, id]);
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
      const workspace = prospect.workspace_id ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : null;
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

function replyFallback(name: string, inboundContent: string) {
  const first = firstName(name);
  const lower = inboundContent.toLowerCase();
  if (/\b(thanks|thank you|interesting|useful|helpful)\b/.test(lower)) {
    return `Thanks ${first}, really appreciate you taking a look.\n\nIf useful, I can keep refining this around the kinds of narrative signals that matter most for your work.`;
  }
  if (/\b(not relevant|not useful|unclear|don't|do not)\b/.test(lower)) {
    return `Thanks ${first}, that's helpful to know.\n\nWas the issue the topic choice, the format, or the type of signal surfaced? That would help me calibrate the next version.`;
  }
  return `Thanks ${first}, really appreciate the reply.\n\nWhat would make this more useful for the kind of policy or communications work you do?`;
}

async function generateReplyDraft(prospectId: number, inboundContent: string, responseDirection: string): Promise<ReplyDraft> {
  loadLocalEnv();
  const detail = await getProspectDetail(prospectId);
  if (!detail) throw new Error("Prospect not found");

  const { prospect } = detail;
  const workspace = prospect.workspace_id ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : await getActiveWorkspace();
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
      "X-Title": "Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a concise B2B outreach reply writer. Return only valid JSON. Never include markdown.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detailText.slice(0, 600)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");
  const parsed = parseJson(content);

  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: null,
    prospectId: prospect.id,
    inputJson: { prompt, prospectId: prospect.id, inboundContent, responseDirection },
    outputJson: parsed,
    model,
  });

  return normalizeReplyDraft(parsed, prospect.name, inboundContent);
}

function renderReplyDraftPrompt(
  workspace: Workspace,
  docs: WorkspaceDoc[],
  prospect: Prospect,
  inboundContent: string,
  responseDirection: string,
) {
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
    docs: docs.map((doc) => ({ type: doc.type, title: doc.title, content: doc.content.slice(0, 9000) })),
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
    firstMessageSent: prospect.post_acceptance_message || prospect.report_message || prospect.twitter_dm_message,
  }, null, 2)}

PROSPECT REPLY
${inboundContent}

OUTPUT JSON SHAPE
{
  "suggestedResponse": string
}
`;
}

function normalizeReplyDraft(value: unknown, name: string, inboundContent: string): ReplyDraft {
  const input = value as Partial<ReplyDraft>;
  const fallback = replyFallback(name, inboundContent);
  const suggestedResponse = String(input.suggestedResponse || "").trim();
  if (!suggestedResponse) return { suggestedResponse: fallback };
  return { suggestedResponse };
}

export async function importAnalyzedProspects(items: AnalyzedProspect[], workspaceId?: number) {
  const workspace = workspaceId ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [workspaceId]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const today = todayIso();

  try {
    for (const raw of items) {
      const item = normalizeAnalyzedProspect(raw);
      if (!item.name || !item.profileUrl) continue;
      const status = statusForImportedProspect(item);
      const sourceChannel = item.sourceChannel === "twitter" ? "twitter" : "linkedin";
      const twitterUrl = sourceChannel === "twitter" ? normalizeTwitterUrl(item.twitterUrl || item.profileUrl) : null;
      const twitterHandle = sourceChannel === "twitter" ? normalizeTwitterHandle(item.twitterHandle || item.profileUrl) : null;
      const existingProfile = await one<{ id: number; workspace_id: number | null }>(
        "SELECT id, workspace_id FROM prospects WHERE profile_url = ?",
        [item.profileUrl],
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
        status,
      ]);
      const prospect = await one<{ id: number; status: string }>("SELECT id, status FROM prospects WHERE profile_url = ? AND workspace_id = ?", [item.profileUrl, workspace.id]);
      if (!prospect) continue;
      const shouldKeepDrafts = item.contactNow && prospect.status === "to_contact";

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
      if (shouldKeepDrafts) {
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
      } else if (prospect.status === "to_contact" || prospect.status === "saved_for_later" || prospect.status === "skipped") {
        await clearUnsentGeneratedMessages(prospect.id);
        if (sourceChannel === "twitter") {
          await completeOpenTask(prospect.id, "send_twitter_dm");
        } else {
          await completeOpenTask(prospect.id, "send_connection");
        }
      }
      if (shouldKeepDrafts) {
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

function normalizeLinkedInUrl(value: string) {
  return value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
}

function normalizeTwitterUrl(value: string) {
  const trimmed = value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
  const handle = normalizeTwitterHandle(trimmed);
  if (handle) return `https://x.com/${handle}`;
  return trimmed;
}

function normalizeTwitterHandle(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const raw = match?.[1] || trimmed.replace(/^@/, "");
  return raw && !/^https?:\/\//i.test(raw) ? raw.replace(/[^a-zA-Z0-9_]/g, "") : "";
}

async function getDb() {
  if (!database) {
    loadLocalEnv();
    fs.mkdirSync(dataDir, { recursive: true });
    const config = getDatabaseConfig();
    databaseUsesEmbeddedReplica = Boolean(config.syncUrl);
    database = createClient(config);
    databaseReady = prepareDatabase(database).catch(async (error) => {
      if (databaseUsesEmbeddedReplica && isWalConflict(error)) {
        console.warn("Embedded replica WAL conflict detected. Resetting local replica and syncing from Turso.");
        database?.close();
        resetEmbeddedReplicaFiles();
        const retryConfig = getDatabaseConfig();
        databaseUsesEmbeddedReplica = Boolean(retryConfig.syncUrl);
        database = createClient(retryConfig);
        await prepareDatabase(database);
        return;
      }
      database?.close();
      database = undefined;
      databaseReady = undefined;
      throw error;
    });
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
      authToken: process.env.DATABASE_AUTH_TOKEN,
    };
  }

  const replicaPath = getEmbeddedReplicaPath();
  fs.mkdirSync(path.dirname(replicaPath), { recursive: true });
  return {
    url: `file:${replicaPath}`,
    syncUrl: url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
    syncInterval: Number(process.env.DATABASE_SYNC_INTERVAL_MS || "5000"),
    readYourWrites: true,
  };
}

function isRemoteLibsqlUrl(url: string) {
  return /^(libsql|https?|wss?):\/\//i.test(url);
}

async function prepareDatabase(db: Client) {
  if (databaseUsesEmbeddedReplica) {
    await syncDatabase("startup", true);
  }
  await applyMigrations(db);
  await seedWorkspaceDefaults(db);
  if (databaseUsesEmbeddedReplica) {
    await syncDatabase("post-migration", true);
  }
}

async function syncDatabase(_reason: string, throwOnError = false) {
  if (!database || !databaseUsesEmbeddedReplica) return;
  if (!syncInProgress) {
    syncInProgress = database.sync().catch((error) => {
      if (throwOnError) throw error;
      console.warn("Database sync failed:", error);
    }).finally(() => {
      syncInProgress = null;
    });
  }
  await syncInProgress;
}

function getEmbeddedReplicaPath() {
  return process.env.DATABASE_REPLICA_PATH || path.join(dataDir, "outreach-replica.sqlite");
}

function resetEmbeddedReplicaFiles() {
  const replicaPath = getEmbeddedReplicaPath();
  for (const suffix of ["", "-wal", "-shm", "-info"]) {
    try {
      fs.rmSync(`${replicaPath}${suffix}`, { force: true });
    } catch {
      // Best effort cleanup; a retry will surface any real filesystem issue.
    }
  }
}

function isWalConflict(error: unknown): boolean {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const record = current as { message?: unknown; code?: unknown; cause?: unknown };
    if (String(record.message || "").toLowerCase().includes("walconflict")) return true;
    if (String(record.code || "").toLowerCase().includes("walconflict")) return true;
    current = record.cause;
  }
  return false;
}

function scheduleDatabaseSync() {
  if (!database || !databaseUsesEmbeddedReplica || syncInProgress) return;
  syncInProgress = database.sync().catch((error) => {
    console.warn("Database sync failed:", error);
  }).finally(() => {
    syncInProgress = null;
  });
}

async function applyMigrations(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const appliedRows = await db.execute("SELECT version FROM schema_migrations");
  const applied = new Set((appliedRows.rows as unknown as { version: string }[]).map((row) => row.version));
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await db.executeMultiple(sql);
    await db.execute({ sql: "INSERT INTO schema_migrations (version) VALUES (?)", args: [file] });
  }
}

async function seedWorkspaceDefaults(db: Client) {
  const repoRoot = path.resolve(rootDir, "..");
  const defaultModel = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const seeds = [
    {
      slug: "tempolis",
      name: "Tempolis",
      productName: "Tempolis",
      docs: [
        { type: "brand", title: "Brand", sourcePath: "tempolis/front/docs/brand.md" },
        { type: "outreach", title: "Outreach Playbook", sourcePath: "tempolis/front/docs/outreach.md" },
      ],
    },
    {
      slug: "narralens",
      name: "Narralens",
      productName: "Narralens",
      docs: [
        { type: "brand", title: "Brand", sourcePath: "narralens/front/docs/brand.md" },
        { type: "outreach", title: "Outreach DM Playbook", sourcePath: "narralens/front/docs/outreach-dm-playbook.md" },
        { type: "examples", title: "Copy-Paste Messages", sourcePath: "narralens/front/docs/outreach-copy-paste-messages.md" },
      ],
    },
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
      args: [seed.slug, seed.name, seed.productName],
    });
    const workspace = (await db.execute({ sql: "SELECT * FROM workspaces WHERE slug = ?", args: [seed.slug] })).rows[0] as unknown as Workspace | undefined;
    if (!workspace) continue;

    for (const doc of seed.docs) {
      const absolutePath = path.join(repoRoot, doc.sourcePath);
      const content = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO workspace_docs (workspace_id, type, title, content, source_path)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [workspace.id, doc.type, doc.title, content, doc.sourcePath],
      });
    }

    const isNarralens = seed.slug === "narralens";
    await seedPromptTemplate(
      db,
      workspace.id,
      "linkedin",
      "batch_analysis",
      isNarralens ? "LinkedIn batch analysis - concrete Narralens topics" : "LinkedIn batch analysis",
      DEFAULT_LINKEDIN_BATCH_SYSTEM_PROMPT,
      isNarralens ? DEFAULT_NARRALENS_LINKEDIN_BATCH_USER_PROMPT : DEFAULT_LINKEDIN_BATCH_USER_PROMPT,
      defaultModel,
      0.2,
    );
    await seedPromptTemplate(
      db,
      workspace.id,
      "twitter",
      "batch_analysis",
      isNarralens ? "Twitter/X batch analysis - concrete Narralens topics" : "Twitter/X batch analysis",
      DEFAULT_TWITTER_BATCH_SYSTEM_PROMPT,
      isNarralens ? DEFAULT_NARRALENS_TWITTER_BATCH_USER_PROMPT : DEFAULT_TWITTER_BATCH_USER_PROMPT,
      defaultModel,
      0.2,
    );
    await seedPromptTemplate(
      db,
      workspace.id,
      "linkedin",
      "no_note_rewrite",
      isNarralens ? "LinkedIn no-note rewrite - Narralens workflows" : "LinkedIn no-note rewrite",
      DEFAULT_NO_NOTE_SYSTEM_PROMPT,
      isNarralens ? DEFAULT_NARRALENS_NO_NOTE_USER_PROMPT : DEFAULT_NO_NOTE_USER_PROMPT,
      defaultModel,
      0.2,
    );
  }
}

async function seedPromptTemplate(
  db: Client,
  workspaceId: number,
  channel: "linkedin" | "twitter",
  purpose: PromptTemplate["purpose"],
  name: string,
  systemPrompt: string,
  userPrompt: string,
  model: string,
  temperature: number,
) {
  const existing = await db.execute({
    sql: "SELECT id FROM prompt_templates WHERE workspace_id = ? AND channel = ? AND purpose = ? LIMIT 1",
    args: [workspaceId, channel, purpose],
  });
  if (existing.rows.length > 0) return;
  await db.execute({
    sql: `
      INSERT INTO prompt_templates (
        workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `,
    args: [workspaceId, channel, purpose, name, systemPrompt, userPrompt, model, temperature],
  });
}

async function createOpenTask(prospectId: number, type: string, title: string, dueDate: string | null) {
  const existing = await one<{ id: number }>("SELECT id FROM tasks WHERE prospect_id = ? AND type = ? AND status = 'open'", [prospectId, type]);
  if (!existing) {
    await run("INSERT INTO tasks (prospect_id, type, title, due_date) VALUES (?, ?, ?, ?)", [prospectId, type, title, dueDate]);
  }
}

async function clearUnsentGeneratedMessages(prospectId: number) {
  await run(`
    DELETE FROM messages
    WHERE prospect_id = ?
      AND sent_date IS NULL
      AND type IN ('connection', 'report', 'report_no_note', 'followup', 'twitter_dm', 'twitter_followup')
  `, [prospectId]);
}

async function completeOpenTask(prospectId: number, type: string) {
  await run(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND type = ? AND status = 'open'
  `, [todayIso(), prospectId, type]);
}

async function completeAllOpenTasks(prospectId: number) {
  await run(`
    UPDATE tasks
    SET status = 'done', completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE prospect_id = ? AND status = 'open'
  `, [todayIso(), prospectId]);
}

async function upsertGeneratedMessage(prospectId: number, type: string, content: string, dueDate: string | null) {
  await run(`
    INSERT INTO messages (prospect_id, type, content, due_date, sent_date)
    VALUES (?, ?, ?, ?, NULL)
    ON CONFLICT(prospect_id, type) DO UPDATE SET
      content = excluded.content,
      due_date = excluded.due_date,
      updated_at = CURRENT_TIMESTAMP
  `, [prospectId, type, content, dueDate]);
}

async function addEvent(prospectId: number, type: string, note: string, happenedAt: string) {
  await run("INSERT INTO events (prospect_id, type, note, happened_at) VALUES (?, ?, ?, ?)", [prospectId, type, note, happenedAt]);
}

async function one<T>(sql: string, args: InValue[] = []) {
  const rows = await all<T>(sql, args);
  return rows[0] as T | undefined;
}

async function all<T>(sql: string, args: InValue[] = []) {
  const db = await getDb();
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

async function run(sql: string, args: InValue[] = []) {
  const db = await getDb();
  await db.execute({ sql, args });
  scheduleDatabaseSync();
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

function shortDayLabel(dateIso: string) {
  return dateIso.slice(5).replace("-", "/");
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function withDerivedMessages(prospect: Prospect): Prospect {
  const canDeriveOutreachCopy =
    prospect.status !== "skipped" &&
    prospect.status !== "saved_for_later" &&
    !(prospect.status === "to_contact" && !prospect.contact_now);
  const noNoteFallback = noNoteReportFallback(
    prospect.name,
    prospect.brief_topic,
    prospect.position,
    prospect.about,
    prospect.recommended_template,
    prospect.workspace_name || "Tempolis",
  );
  return {
    ...prospect,
    source_channel: prospect.source_channel || "linkedin",
    outreach_mode: prospect.outreach_mode || "with_note",
    connection_note_sent: prospect.connection_note_sent || 0,
    post_acceptance_message:
      !canDeriveOutreachCopy
        ? null
        : prospect.outreach_mode === "no_note"
        ? prospect.no_note_report_message
          ? sanitizeNoNoteMessage(prospect.no_note_report_message, noNoteFallback)
          : rewriteReportForNoNote(prospect.report_message, prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template, prospect.workspace_name || "Tempolis")
        : prospect.report_message,
  };
}

function rewriteReportForNoNote(content: string | null, name: string, topic: string | null, position?: string | null, about?: string | null, template?: string | null, productName = "Tempolis") {
  const fallback = noNoteReportFallback(name, topic, position, about, template, productName);
  if (!content) return fallback;

  const rewritten = content
    .replace(/As promised,\s*the brief on/i, "Thanks for connecting. I prepared a brief on")
    .replace(/As promised,\s*the brief/i, "Thanks for connecting. I prepared a brief")
    .replace(/The brief I mentioned,\s*on/i, "Thanks for connecting. I prepared a brief on")
    .replace(/The brief I promised,\s*on/i, "Thanks for connecting. I prepared a brief on")
    .replace(/As promised,\s*/i, "")
    .replace(/The brief I mentioned,\s*/i, "I prepared a brief ")
    .replace(/The brief I mentioned/i, "I prepared a brief")
    .replace(/The brief I promised,\s*/i, "I prepared a brief ")
    .replace(/The brief I promised/i, "I prepared a brief")
    .replace(/Le brief promis\s*/i, "J'ai préparé un brief ")
    .replace(/Comme promis,\s*/i, "");

  return rewritten === content ? fallback : rewritten;
}

function noNoteReportFallback(name: string, topic: string | null, position?: string | null, about?: string | null, template?: string | null, productName = "Tempolis") {
  const firstName = name.split(/\s+/)[0] || name;
  const briefTopic = topic || "";
  const context = isNarralensProduct(productName)
    ? narralensProspectContext(position, about, template)
    : prospectContext(position, about, template);
  if (isNarralensProduct(productName)) {
    return `Hi ${firstName},

Thanks for connecting. I'm building ${productName} for brand, social, and PR teams, and I wanted to test whether this kind of short narrative brief could be useful${briefTopic ? `, starting with ${briefTopic}` : ""}.

[shared link]

If the format feels useful for campaign monitoring, client updates, or positioning work, I'd really value your blunt feedback.`;
  }
  return `Hi ${firstName},

Thanks for connecting. I'm building ${productName}, a tool for public affairs narrative briefs, and I prepared a short brief${briefTopic ? ` on ${briefTopic}` : ""} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`;
}

function prospectContext(position?: string | null, about?: string | null, template?: string | null) {
  const text = `${position || ""} ${about || ""} ${template || ""}`.toLowerCase();
  if (/\b(ai|artificial intelligence|digital|tech|technology|platform|data|privacy|gdpr)\b/.test(text)) return "tech policy and regulation";
  if (/\b(energy|climate|sustainability|power|grid)\b/.test(text)) return "energy and policy strategy";
  if (/\b(health|pharma|medical|biotech)\b/.test(text)) return "health policy and public affairs";
  if (/\b(finance|bank|fintech|payments|competition)\b/.test(text)) return "regulated markets and public affairs";
  if (/\b(communications|comms|media|narrative|reputation)\b/.test(text)) return "strategic communications";
  if (/\b(government affairs|public affairs|policy|regulatory|eu affairs|brussels)\b/.test(text)) return "public affairs and policy";
  return "policy and public affairs";
}

function narralensProspectContext(position?: string | null, about?: string | null, template?: string | null) {
  const text = `${position || ""} ${about || ""} ${template || ""}`.toLowerCase();
  if (/\b(agency|client|account|consult|advisory)\b/.test(text)) return "agency and client update work";
  if (/\b(pr|communications|public relations|media)\b/.test(text)) return "PR and communications work";
  if (/\b(brand|marketing|campaign|social|content)\b/.test(text)) return "brand and campaign work";
  return "brand, social, or PR work";
}

function isNarralensProduct(productName: string) {
  return productName.trim().toLowerCase() === "narralens";
}

async function generateNoNoteRewrite(prospectId: number): Promise<NoNoteRewrite> {
  loadLocalEnv();
  const detail = await getProspectDetail(prospectId);
  if (!detail) throw new Error("Prospect not found");

  const { prospect } = detail;
  const workspace = prospect.workspace_id ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");
  const [template, docs] = await Promise.all([
    getActivePromptTemplate(workspace.id, "linkedin", "no_note_rewrite"),
    getWorkspaceDocs(workspace.id),
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
      "X-Title": "Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt,
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detailText.slice(0, 600)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");

  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    prospectId: prospect.id,
    inputJson: { prompt, prospectId: prospect.id },
    outputJson: parsed,
    model,
  });

  return normalizeNoNoteRewrite(parsed, prospect, workspace.product_name);
}

async function generateMessagesFromLatestEvidence(prospectId: number): Promise<MessageRegeneration> {
  loadLocalEnv();
  const detail = await getProspectDetail(prospectId);
  if (!detail) throw new Error("Prospect not found");

  const { prospect, latestEvidence } = detail;
  const workspace = prospect.workspace_id ? await one<Workspace>("SELECT * FROM workspaces WHERE id = ?", [prospect.workspace_id]) : await getActiveWorkspace();
  if (!workspace) throw new Error("Workspace not found.");

  const channel = prospect.source_channel === "twitter" ? "twitter" : "linkedin";
  const [template, docs] = await Promise.all([
    getActivePromptTemplate(workspace.id, channel, "message_regeneration"),
    getWorkspaceDocs(workspace.id),
  ]);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to .env or your shell env.");
  }

  const evidence = latestEvidence
    ? {
        id: latestEvidence.id,
        sourceChannel: latestEvidence.source_channel,
        captureSource: latestEvidence.capture_source,
        createdAt: latestEvidence.created_at,
        summaryText: latestEvidence.summary_text,
        payload: safeJsonParse(latestEvidence.payload_json),
      }
    : {
        sourceChannel: channel,
        captureSource: "fallback_current_prospect",
        summaryText: "No extension capture is stored for this prospect yet. Use the current prospect fields as fallback context.",
        payload: null,
      };

  const prompt = renderMessageRegenerationPrompt(template.user_prompt, workspace, docs, prospect, evidence);
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt,
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detailText.slice(0, 600)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");

  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    prospectId: prospect.id,
    inputJson: { prompt, prospectId: prospect.id, evidenceId: latestEvidence?.id || null },
    outputJson: parsed,
    model,
  });

  return normalizeMessageRegeneration(parsed, prospect, workspace.product_name, workspace.default_language || "en");
}

function renderMessageRegenerationPrompt(
  template: string,
  workspace: Workspace,
  docs: WorkspaceDoc[],
  prospect: Prospect,
  evidence: unknown,
) {
  return template
    .replaceAll("{{productName}}", workspace.product_name)
    .replaceAll("{{workspaceName}}", workspace.name)
    .replaceAll("{{defaultLanguage}}", workspace.default_language || "en")
    .replaceAll("{{workspaceDocs}}", formatWorkspaceDocs(docs))
    .replaceAll("{{prospectJson}}", JSON.stringify({
      id: prospect.id,
      name: prospect.name,
      position: prospect.position,
      about: prospect.about,
      profileUrl: prospect.profile_url,
      sourceChannel: prospect.source_channel,
      outreachMode: prospect.outreach_mode,
      priorityTag: prospect.priority_tag,
      wave: prospect.wave,
      rationale: prospect.rationale,
      recommendedTemplate: prospect.recommended_template,
      briefTopic: prospect.brief_topic,
      briefPreparation: prospect.preparation_notes,
      sharedUrl: prospect.shared_url || "[shared link]",
    }, null, 2))
    .replaceAll("{{evidenceJson}}", JSON.stringify(evidence, null, 2))
    .replaceAll("{{currentCopyJson}}", JSON.stringify({
      connectionNote: prospect.connection_message,
      afterAcceptanceWithNote: prospect.report_message,
      existingNoNoteMessage: prospect.no_note_report_message,
      postAcceptanceMessage: prospect.post_acceptance_message,
      followup: prospect.followup_message,
      twitterDm: prospect.twitter_dm_message,
      twitterFollowup: prospect.twitter_followup_message,
    }, null, 2));
}

function renderNoNoteRewritePrompt(template: string, workspace: Workspace, docs: WorkspaceDoc[], prospect: Prospect) {
  return template
    .replaceAll("{{productName}}", workspace.product_name)
    .replaceAll("{{workspaceName}}", workspace.name)
    .replaceAll("{{defaultLanguage}}", workspace.default_language || "en")
    .replaceAll("{{workspaceDocs}}", formatWorkspaceDocs(docs))
    .replaceAll("{{prospectJson}}", JSON.stringify({
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
      sharedUrl: prospect.shared_url || "[shared link]",
    }, null, 2))
    .replaceAll("{{currentCopyJson}}", JSON.stringify({
      connectionNote: prospect.connection_message,
      afterAcceptanceWithNote: prospect.report_message,
      existingNoNoteMessage: prospect.no_note_report_message,
      followup: prospect.followup_message,
    }, null, 2));
}

function formatWorkspaceDocs(docs: WorkspaceDoc[]) {
  return docs
    .map((doc) => `## ${doc.title} (${doc.type})\n${doc.content.slice(0, 18000)}`)
    .join("\n\n---\n\n");
}

function normalizeNoNoteRewrite(value: unknown, prospect: Prospect, productName = "Tempolis"): NoNoteRewrite {
  const input = value as Partial<NoNoteRewrite>;
  const fallbackReport = noNoteReportFallback(prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template, productName);
  const fallbackFollowup = `Hi ${firstName(prospect.name)}, following up in case the brief slipped through. No worries if this isn't the right timing.`;
  return {
    noNoteReportMessage: sanitizeNoNoteMessage(String(input.noNoteReportMessage || ""), fallbackReport),
    followupMessage: sanitizeNoNoteMessage(String(input.followupMessage || ""), fallbackFollowup),
  };
}

function normalizeMessageRegeneration(
  value: unknown,
  prospect: Prospect,
  productName = "Tempolis",
  defaultLanguage = "en",
): MessageRegeneration {
  const input = value as Partial<MessageRegeneration>;
  if (prospect.source_channel === "twitter") {
    const twitterDmFallbackText = twitterDmFallback(prospect, productName);
    const twitterFollowupFallback = `Hi ${firstName(prospect.name)}, quick follow-up in case the brief slipped through. Any blunt read on whether the angle is useful would help.`;
    return {
      twitterDmMessage: sanitizeGeneratedMessage(String(input.twitterDmMessage || ""), twitterDmFallbackText, {
        defaultLanguage,
        briefTopic: prospect.brief_topic,
        requireSharedLink: true,
      }),
      twitterFollowupMessage: sanitizeGeneratedMessage(String(input.twitterFollowupMessage || ""), twitterFollowupFallback, {
        defaultLanguage,
        briefTopic: prospect.brief_topic,
      }),
    };
  }
  const connectionFallback = linkedInConnectionFallback(prospect, productName);
  const reportFallback = linkedInReportFallback(prospect, productName);
  const fallbackNoNote = noNoteReportFallback(prospect.name, prospect.brief_topic, prospect.position, prospect.about, prospect.recommended_template, productName);
  return {
    connectionMessage: sanitizeGeneratedMessage(String(input.connectionMessage || ""), connectionFallback, {
      defaultLanguage,
      briefTopic: prospect.brief_topic,
      maxLength: 300,
    }).slice(0, 300),
    reportMessage: sanitizeGeneratedMessage(String(input.reportMessage || ""), reportFallback, {
      defaultLanguage,
      briefTopic: prospect.brief_topic,
      requireSharedLink: true,
    }),
    noNoteReportMessage: sanitizeNoNoteMessage(
      sanitizeGeneratedMessage(String(input.noNoteReportMessage || ""), prospect.no_note_report_message || fallbackNoNote, {
        defaultLanguage,
        briefTopic: prospect.brief_topic,
        requireSharedLink: true,
      }),
      prospect.no_note_report_message || fallbackNoNote,
    ),
    followupMessage: sanitizeGeneratedMessage(String(input.followupMessage || ""), `Hi ${firstName(prospect.name)}, following up in case the brief slipped through. No worries if this isn't the right timing.`, {
      defaultLanguage,
      briefTopic: prospect.brief_topic,
    }),
  };
}

function sanitizeGeneratedMessage(
  value: string,
  fallback: string,
  options: {
    defaultLanguage?: string;
    briefTopic?: string | null;
    requireSharedLink?: boolean;
    maxLength?: number;
  } = {},
) {
  const cleanValue = value.trim();
  if (!cleanValue) return fallback;
  if ((options.defaultLanguage || "en").toLowerCase().startsWith("en") && isFrenchLikeMessage(cleanValue)) return fallback;
  if (/\b(used the signals|signals on your profile|profile evidence|scraped|visible activity)\b/i.test(cleanValue)) return fallback;
  if (/\bbref\b/i.test(cleanValue)) return fallback;
  if (options.requireSharedLink && !/\[shared link\]/i.test(cleanValue)) return fallback;
  if (!options.briefTopic && /\b(on|sur)\s+[\"'“‘][^"'”’]+[\"'”’]/i.test(cleanValue)) return fallback;
  if (!options.briefTopic && /\b(picked|starting with|prepared (?:a|one|this)? ?(?:short )?(?:brief|test brief) on)\b/i.test(cleanValue)) return fallback;
  if (options.maxLength && cleanValue.length > options.maxLength) return fallback;
  return cleanValue;
}

function linkedInConnectionFallback(prospect: Prospect, productName: string) {
  const first = firstName(prospect.name);
  if (isNarralensProduct(productName)) {
    const context = narralensProspectContext(prospect.position, prospect.about, prospect.recommended_template);
    return `Hi ${first}, I'm building ${productName} for brand, social, and PR teams and testing whether short narrative briefs are useful in ${context}. Thought this might be worth sharing.`;
  }
  const context = prospectContext(prospect.position, prospect.about, prospect.recommended_template);
  return `Hi ${first}, I'm building ${productName} and testing whether short issue briefs are useful for people working in ${context}. Thought this might be relevant.`;
}

function linkedInReportFallback(prospect: Prospect, productName: string) {
  const first = firstName(prospect.name);
  if (isNarralensProduct(productName)) {
    const context = narralensProspectContext(prospect.position, prospect.about, prospect.recommended_template);
    return `Hi ${first},

Thanks for connecting. I'm building ${productName} for brand, social, and PR teams, and I wanted to test whether this kind of short narrative brief could be useful for ${context}${prospect.brief_topic ? `, using ${prospect.brief_topic} as the starting point` : ""}.

[shared link]

If the format feels useful for campaign monitoring, client updates, or positioning work, I'd really value your blunt feedback.`;
  }
  const context = prospectContext(prospect.position, prospect.about, prospect.recommended_template);
  return `Hi ${first},

Thanks for connecting. I'm building ${productName} and testing whether short issue briefs can be useful for ${context}${prospect.brief_topic ? `, using ${prospect.brief_topic} as the first angle` : ""}.

[shared link]

If the format feels useful, or if the angle is off, I'd value your feedback.`;
}

function isFrenchLikeMessage(value: string) {
  return /\b(salut|bonjour|merci|acceptation|bref|bref sur|ton avis|je teste|j'ai prépar|ça|résonne|missions|petit suivi)\b/i.test(value);
}

function twitterDmFallback(prospect: Prospect, productName: string) {
  return `Hi ${firstName(prospect.name)}, I'm building ${productName} and testing short briefs around public conversations.

I prepared a short test brief${prospect.brief_topic ? ` on ${prospect.brief_topic}` : ""}.

[shared link]

Would value a blunt read on whether the angle is useful.`;
}

function sanitizeNoNoteMessage(value: string, fallback: string) {
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

function firstName(name: string) {
  return name.split(/\s+/)[0] || name;
}

function parseJson(content: string) {
  const trimmed = content.trim();
  const json = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim() : trimmed;
  return JSON.parse(json);
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadLocalEnv() {
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
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function statusForImportedProspect(item: AnalyzedProspect) {
  if (item.priorityTag === "SKIP") return "skipped";
  if (item.priorityTag === "SAVE") return "saved_for_later";
  return "to_contact";
}

function normalizeAnalyzedProspect(item: AnalyzedProspect): AnalyzedProspect {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(item.priorityTag) ? item.priorityTag : "SKIP";
  const topic = trimWords(String(item.briefTopic || ""), 3);
  const name = String(item.name || "").trim();
  const reportMessage = String(item.reportMessage || "").trim();
  const noNoteFallback = rewriteReportForNoNote(reportMessage, name, topic, item.position, item.about, item.recommendedTemplate);
  const sourceChannel = item.sourceChannel === "twitter" ? "twitter" : "linkedin";
  const profileUrl = sourceChannel === "twitter" ? normalizeTwitterUrl(item.profileUrl || item.twitterUrl || "") : String(item.profileUrl || "").trim();
  return {
    name,
    position: String(item.position || "").trim(),
    profileUrl,
    about: String(item.about || "").trim(),
    priorityTag: tag as AnalyzedProspect["priorityTag"],
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
    twitterHandle: sourceChannel === "twitter" ? normalizeTwitterHandle(item.twitterHandle || profileUrl) : "",
    twitterUrl: sourceChannel === "twitter" ? normalizeTwitterUrl(item.twitterUrl || profileUrl) : "",
    twitterDmMessage: String(item.twitterDmMessage || "").trim(),
    twitterFollowupMessage: String(item.twitterFollowupMessage || "").trim(),
  };
}

function trimWords(value: string, max: number) {
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
- For both reportMessage and noNoteReportMessage, make the message feel motivated by the actual profile data without sounding like surveillance.
- Include light builder context when useful so the recipient understands why a stranger is sharing a brief.
- Use the profile evidence to choose the angle, tone, and reason for relevance; do not copy a fixed message architecture.
- If the evidence is a repost, like, or activity item, phrase it as an interest or public signal, not as proof that the prospect owns that subject professionally.
- Avoid creepy/internal wording such as "I used the signals on your profile", "profile evidence", "scraped", or "visible activity".
- Avoid mass-outreach patterns: vary opener, sentence rhythm, message length, transition into the brief, and feedback ask across every prospect in the batch.
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
- LinkedIn first messages must not be generic. The reader should understand why this brief was chosen for them, but the wording should feel natural and human rather than analytical.
- Mention the builder/testing context when it makes the approach feel less abrupt.
- Do not use one reusable sentence pattern. Let the profile data decide the opener, bridge, and feedback ask for each prospect.
- Avoid creepy/internal wording such as "signals on your profile", "profile evidence", or "I used your profile".
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
