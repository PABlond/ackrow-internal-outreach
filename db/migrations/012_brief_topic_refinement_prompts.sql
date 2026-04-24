INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'linkedin',
  'brief_topic_refinement',
  w.product_name || ' LinkedIn brief topic refinement',
  'You are a strict JSON-producing outreach strategist. Return only valid JSON. Never include markdown.',
  CASE
    WHEN w.slug = 'narralens' THEN 'Suggest better {{productName}} brief topics for this prospect.

TASK
- Use the workspace docs, current prospect context, current brief topic, and latest captured evidence.
- Return exactly 3 alternative brief topics.
- Write all rationales and preparation notes in {{defaultLanguage}} by default.
- Each topic must be 1 to 3 words only.
- Prefer topics that look like real {{productName}} searches: a brand, company, campaign, launch, competitor, public figure, controversy, platform change, or concrete narrative debate.
- Avoid abstract topics like brand perception, communications, marketing, narrative intelligence, or campaign monitoring.
- If the user gives a direction, follow it.
- Treat reposts, likes, and visible activity as interest/public context only, not proof that the prospect professionally owns that topic.
- Each suggestion should feel credible for a first brief and specific enough to discuss with the prospect.
- For each suggestion, include short preparation notes explaining what angle to take.

OUTPUT JSON SHAPE
{
  "suggestions": [
    {
      "topic": string,
      "rationale": string,
      "preparationNotes": string
    }
  ]
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

USER DIRECTION
{{direction}}'
    ELSE 'Suggest better {{productName}} brief topics for this prospect.

TASK
- Use the workspace docs, current prospect context, current brief topic, and latest captured evidence.
- Return exactly 3 alternative brief topics.
- Write all rationales and preparation notes in {{defaultLanguage}} by default.
- Each topic must be 1 to 3 words only.
- For Tempolis-style work, prefer concrete policy/public-affairs subjects that could realistically make a strong first brief.
- A good topic is often broader and more usable than the first detected niche, but still specific enough to feel intentional.
- Treat reposts, likes, comments, and visible activity as signals of interest only, not proof that the prospect owns that topic professionally.
- If the user gives a direction, follow it.
- Do not suggest abstract labels like public policy, communications, regulation, or strategy on their own.
- Do not simply echo the current topic unless it is still clearly one of the top 3 options.
- For each suggestion, include short preparation notes explaining what angle to take.

OUTPUT JSON SHAPE
{
  "suggestions": [
    {
      "topic": string,
      "rationale": string,
      "preparationNotes": string
    }
  ]
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

USER DIRECTION
{{direction}}'
  END,
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.3,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'linkedin' AND purpose = 'brief_topic_refinement'), 1)
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates p
  WHERE p.workspace_id = w.id AND p.channel = 'linkedin' AND p.purpose = 'brief_topic_refinement'
);

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  w.id,
  'twitter',
  'brief_topic_refinement',
  w.product_name || ' Twitter/X brief topic refinement',
  'You are a strict JSON-producing outreach strategist. Return only valid JSON. Never include markdown.',
  CASE
    WHEN w.slug = 'narralens' THEN 'Suggest better {{productName}} brief topics for this prospect.

TASK
- Use the workspace docs, current prospect context, current brief topic, and latest captured evidence.
- Return exactly 3 alternative brief topics.
- Write all rationales and preparation notes in {{defaultLanguage}} by default.
- Each topic must be 1 to 3 words only.
- Prefer topics that look like real {{productName}} searches: a brand, company, campaign, launch, competitor, public figure, controversy, platform change, or concrete narrative debate.
- Avoid abstract topics like brand perception, communications, marketing, narrative intelligence, or campaign monitoring.
- If the user gives a direction, follow it.
- Treat reposts, likes, and visible activity as interest/public context only, not proof that the prospect professionally owns that topic.
- Each suggestion should feel credible for a first brief and specific enough to discuss with the prospect.
- For each suggestion, include short preparation notes explaining what angle to take.

OUTPUT JSON SHAPE
{
  "suggestions": [
    {
      "topic": string,
      "rationale": string,
      "preparationNotes": string
    }
  ]
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

USER DIRECTION
{{direction}}'
    ELSE 'Suggest better {{productName}} brief topics for this prospect.

TASK
- Use the workspace docs, current prospect context, current brief topic, and latest captured evidence.
- Return exactly 3 alternative brief topics.
- Write all rationales and preparation notes in {{defaultLanguage}} by default.
- Each topic must be 1 to 3 words only.
- For Tempolis-style work, prefer concrete policy/public-affairs subjects that could realistically make a strong first brief.
- A good topic is often broader and more usable than the first detected niche, but still specific enough to feel intentional.
- Treat reposts, likes, comments, and visible activity as signals of interest only, not proof that the prospect owns that topic professionally.
- If the user gives a direction, follow it.
- Do not suggest abstract labels like public policy, communications, regulation, or strategy on their own.
- Do not simply echo the current topic unless it is still clearly one of the top 3 options.
- For each suggestion, include short preparation notes explaining what angle to take.

OUTPUT JSON SHAPE
{
  "suggestions": [
    {
      "topic": string,
      "rationale": string,
      "preparationNotes": string
    }
  ]
}

WORKSPACE DOCS
{{workspaceDocs}}

PROSPECT CONTEXT
{{prospectJson}}

LATEST CAPTURED EVIDENCE
{{evidenceJson}}

USER DIRECTION
{{direction}}'
  END,
  COALESCE((SELECT model FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' ORDER BY id DESC LIMIT 1), 'google/gemini-2.5-flash-lite'),
  0.3,
  1,
  COALESCE((SELECT MAX(version) + 1 FROM prompt_templates WHERE workspace_id = w.id AND channel = 'twitter' AND purpose = 'brief_topic_refinement'), 1)
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates p
  WHERE p.workspace_id = w.id AND p.channel = 'twitter' AND p.purpose = 'brief_topic_refinement'
);
