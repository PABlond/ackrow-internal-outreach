INSERT INTO workspace_docs (workspace_id, type, title, content, source_path)
SELECT
  id,
  'positioning_guardrails',
  'Narralens Outreach Guardrails',
  'Narralens outreach must sell a concrete workflow, not a generic concept.

The prospect should be offered a brief topic that looks like a real Narralens search:
- OpenAI launch
- Nike sustainability
- Notion vs ClickUp
- Apple Vision Pro
- Duolingo marketing
- Tesla robotaxi
- Elon Musk advertisers
- Spotify Wrapped

Avoid abstract brief topics such as brand perception, perception, social listening, brand monitoring, campaign monitoring, marketing, reputation, consumer insights, narrative intelligence, and competitive intelligence.

When profile evidence is broad, pick a famous concrete test case relevant to their workflow. When evidence is specific, use the company, campaign, launch, competitor, spokesperson, founder, or public figure visible in the profile. Reposts and likes show interest only; never describe them as the prospect working on that topic.

The business promise is: help brand, social, PR, marketing, agency, and founder teams create faster campaign reads, launch monitoring briefs, competitor narrative checks, client updates, and internal decision briefs.',
  'migration:007_narralens_concrete_topics.sql'
FROM workspaces
WHERE slug = 'narralens'
ON CONFLICT(workspace_id, type) DO UPDATE SET
  title = excluded.title,
  content = excluded.content,
  source_path = excluded.source_path,
  updated_at = CURRENT_TIMESTAMP;

UPDATE prompt_templates
SET active = 0, updated_at = CURRENT_TIMESTAMP
WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'narralens')
  AND (
    (channel = 'linkedin' AND purpose = 'batch_analysis')
    OR (channel = 'twitter' AND purpose = 'batch_analysis')
    OR (channel = 'linkedin' AND purpose = 'no_note_rewrite')
  );

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'linkedin',
  'batch_analysis',
  'LinkedIn batch analysis - concrete Narralens topics',
  'You are a strict JSON-producing outreach analyst. Return only valid JSON. Never include markdown.',
  'Analyze this new {{productName}} LinkedIn outreach batch.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the workspace docs.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Write all outreach messages in {{defaultLanguage}} by default.
- The briefTopic must be 1 to 3 words and must be a concrete Narralens search/query, not a category.
- Do not output abstract brief topics: brand perception, perception, social listening, brand monitoring, campaign monitoring, marketing, reputation, consumer insights, narrative intelligence, or competitive intelligence.
- Prefer concrete brand, campaign, launch, competitor, product, spokesperson, founder, or public figure topics.
- Strong briefTopic examples: OpenAI launch, Nike sustainability, Notion vs ClickUp, Apple Vision Pro, Duolingo marketing, Tesla robotaxi, Elon Musk advertisers, Spotify Wrapped.
- If profile evidence is broad, choose a famous concrete test case relevant to their brand/social/PR/agency workflow instead of a generic concept.
- Treat activity evidence carefully: reposts, likes, comments, and visible activity prove interest only, not professional ownership.
- Do not say "your work on [topic]" unless role/about/experience explicitly says the prospect works on that exact topic.
- Safe wording: "as a concrete test case for campaign/competitor readouts", "given your brand/social/PR work", or "for the kind of client updates you likely handle".
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
{{prospectsJson}}',
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'batch_analysis' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.2,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'batch_analysis'), 1)
FROM workspaces w
WHERE w.slug = 'narralens';

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'twitter',
  'batch_analysis',
  'Twitter/X batch analysis - concrete Narralens topics',
  'You are a strict JSON-producing outreach analyst. Return only valid JSON. Never include markdown.',
  'Analyze this new {{productName}} Twitter/X outreach batch.

CONTEXT
This is not LinkedIn. We are testing Twitter/X as a manual acquisition channel. The app helps copy messages and track follow-ups, but it does not automate X.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the workspace docs.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Write all outreach messages in {{defaultLanguage}} by default.
- The briefTopic must be 1 to 3 words and must be a concrete Narralens search/query, not a category.
- Do not output abstract brief topics: brand perception, perception, social listening, brand monitoring, campaign monitoring, marketing, reputation, consumer insights, narrative intelligence, or competitive intelligence.
- Prefer concrete brand, campaign, launch, competitor, product, spokesperson, founder, or public figure topics.
- Strong briefTopic examples: OpenAI launch, Nike sustainability, Notion vs ClickUp, Apple Vision Pro, Duolingo marketing, Tesla robotaxi, Elon Musk advertisers, Spotify Wrapped.
- If profile evidence is broad, choose a famous concrete test case relevant to their brand/social/PR/agency workflow instead of a generic concept.
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
{{prospectsJson}}',
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' AND purpose = 'batch_analysis' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.2,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' AND purpose = 'batch_analysis'), 1)
FROM workspaces w
WHERE w.slug = 'narralens';

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'linkedin',
  'no_note_rewrite',
  'LinkedIn no-note rewrite - Narralens workflows',
  'You are a strict JSON-producing outreach copywriter. Return only valid JSON. Never include markdown.',
  'Rewrite this {{productName}} LinkedIn outreach sequence for NO-CUSTOM-NOTE mode.

CONTEXT
LinkedIn custom note quota is exhausted. The connection request will be sent without any note. The first actual outreach message is sent only after the person accepts the request.

TASK
- Keep the strategy soft: no product pitch, no demo request, no call request.
- Write in {{defaultLanguage}}.
- Adapt the first post-acceptance message so it does not rely on a previous promise.
- The first message must naturally acknowledge the new connection and introduce the brief.
- Make the first message feel written for this exact person, not a reusable template.
- Frame the brief as a concrete test case for brand/social/PR workflows: campaign readout, launch reaction, competitor narrative check, client update, or positioning decision.
- Do not use abstract wording like brand perception, social listening, brand monitoring, campaign monitoring, marketing, reputation, or consumer insights as the topic.
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
{{workspaceDocs}}',
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'no_note_rewrite' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.2,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'no_note_rewrite'), 1)
FROM workspaces w
WHERE w.slug = 'narralens';
