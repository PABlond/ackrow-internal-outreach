CREATE TEMP TABLE _linkedin_direction_prompt_base AS
SELECT *
FROM prompt_templates
WHERE active = 1
  AND channel = 'linkedin'
  AND purpose IN ('batch_analysis', 'no_note_rewrite');

UPDATE prompt_templates
SET active = 0, updated_at = CURRENT_TIMESTAMP
WHERE active = 1
  AND channel = 'linkedin'
  AND purpose IN ('batch_analysis', 'no_note_rewrite');

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  pt.workspace_id,
  pt.channel,
  pt.purpose,
  pt.name || ' + direction over templates',
  pt.system_prompt,
  pt.user_prompt || '

HIGHER PRIORITY COPYWRITING UPDATE
- Treat any earlier wording examples in this prompt as anti-examples, not templates to copy.
- Do not reuse one message architecture across prospects. For each prospect, decide the opener, brief bridge, and feedback ask from the actual profile data.
- The message should explain the sender context when needed: this is a builder testing a useful brief format, not a random pitch.
- Make the relevance feel human and natural. Avoid analytical or creepy language such as "signals on your profile", "profile evidence", "I used your profile", "scraped", or "visible activity".
- If the input contains reposts, likes, comments, or activity, treat them only as interest/public context. Do not imply professional ownership unless the role/about/experience says it explicitly.
- Vary these dimensions across the batch: first sentence, sentence count, transition into the brief, amount of product context, feedback ask, and closing tone.
- The result should feel like individually written outreach, not a mail-merge with swapped variables.',
  pt.model,
  pt.temperature,
  1,
  COALESCE((
    SELECT MAX(version) + 1
    FROM prompt_templates next_pt
    WHERE next_pt.workspace_id = pt.workspace_id
      AND next_pt.channel = pt.channel
      AND next_pt.purpose = pt.purpose
  ), 1)
FROM _linkedin_direction_prompt_base pt;

DROP TABLE _linkedin_direction_prompt_base;
