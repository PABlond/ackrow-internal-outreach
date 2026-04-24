CREATE TABLE IF NOT EXISTS prospect_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER NOT NULL,
  workspace_id INTEGER NOT NULL,
  source_channel TEXT NOT NULL,
  capture_source TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prospect_evidence_prospect_created ON prospect_evidence(prospect_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_evidence_workspace_channel ON prospect_evidence(workspace_id, source_channel, created_at DESC);

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'linkedin',
  'message_regeneration',
  w.product_name || ' LinkedIn message regeneration',
  'You are a strict JSON-producing outreach copywriter. Return only valid JSON. Never include markdown.',
  'Regenerate this {{productName}} LinkedIn outreach sequence from the latest captured profile evidence.

TASK
- Use the workspace docs, current prospect state, current brief, current copy, and latest captured evidence.
- Write in {{defaultLanguage}} by default.
- Generate individually written copy. Do not reuse a fixed architecture or phrasing.
- Include light builder context when it makes the outreach feel less abrupt.
- Make relevance feel natural and human; do not use creepy/internal wording such as "signals on your profile", "profile evidence", "scraped", or "visible activity".
- Treat reposts, likes, comments, and activity as interest/public context only, not proof of professional ownership.
- Keep the connection note under 300 characters.
- No heavy product pitch, no demo request, no call request.
- If outreachMode is no_note, the noNoteReportMessage is the primary first message after acceptance. It must not imply a prior custom note.
- If outreachMode is with_note, reportMessage may refer naturally to the brief angle already introduced by the connection note.
- Follow-up is gentle and due around J+2.

OUTPUT JSON SHAPE
{
  "connectionMessage": string,
  "reportMessage": string,
  "noNoteReportMessage": string,
  "followupMessage": string
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

CURRENT COPY
{{currentCopyJson}}',
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.35,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'message_regeneration'), 1)
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates p
  WHERE p.workspace_id = w.id AND p.channel = 'linkedin' AND p.purpose = 'message_regeneration'
);

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'twitter',
  'message_regeneration',
  w.product_name || ' Twitter/X message regeneration',
  'You are a strict JSON-producing outreach copywriter. Return only valid JSON. Never include markdown.',
  'Regenerate this {{productName}} Twitter/X outreach sequence from the latest captured profile evidence.

TASK
- Use the workspace docs, current prospect state, current brief, current copy, and latest captured X evidence.
- Write in {{defaultLanguage}} by default.
- Generate a short manual DM and a gentle J+2 follow-up.
- Make the DM fit Twitter/X: direct, lightweight, conversational, not a LinkedIn connection flow.
- Use posts/bio/public context to choose the angle, but do not overstate professional ownership.
- Do not use creepy/internal wording such as "signals on your profile", "profile evidence", "scraped", or "visible activity".
- Do not ask for a demo or call.
- Vary wording naturally; do not use a fixed template.
- Include [shared link] on its own line when sending the brief.

OUTPUT JSON SHAPE
{
  "twitterDmMessage": string,
  "twitterFollowupMessage": string
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

CURRENT COPY
{{currentCopyJson}}',
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.35,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' AND purpose = 'message_regeneration'), 1)
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates p
  WHERE p.workspace_id = w.id AND p.channel = 'twitter' AND p.purpose = 'message_regeneration'
);
