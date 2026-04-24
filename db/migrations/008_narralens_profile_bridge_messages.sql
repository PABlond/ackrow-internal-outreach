CREATE TEMP TABLE _narralens_profile_bridge_prompt_base AS
SELECT *
FROM prompt_templates
WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'narralens')
  AND active = 1
  AND (
    (channel = 'linkedin' AND purpose = 'batch_analysis')
    OR (channel = 'linkedin' AND purpose = 'no_note_rewrite')
  );

UPDATE prompt_templates
SET active = 0, updated_at = CURRENT_TIMESTAMP
WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'narralens')
  AND active = 1
  AND (
    (channel = 'linkedin' AND purpose = 'batch_analysis')
    OR (channel = 'linkedin' AND purpose = 'no_note_rewrite')
  );

INSERT INTO prompt_templates (
  workspace_id, channel, purpose, name, system_prompt, user_prompt, model, temperature, active, version
)
SELECT
  pt.workspace_id,
  pt.channel,
  pt.purpose,
  CASE
    WHEN pt.purpose = 'batch_analysis' THEN 'LinkedIn batch analysis - Narralens profile bridge'
    ELSE 'LinkedIn no-note rewrite - Narralens profile bridge'
  END,
  pt.system_prompt,
  pt.user_prompt || '

NARRALENS PROFILE-BRIDGE UPDATE
- The first LinkedIn message must not sound like a generic product test.
- The message must say the brief was created from a visible signal on the prospect profile.
- Preferred wording: "Based on what I saw on your profile around [profile signal], I prepared a short Narralens brief on [briefTopic] as a concrete campaign/competitor readout."
- If the signal is a repost, like, comment, or activity item, describe it as an interest/signal visible on their profile, not as their job or ownership.
- Do not write bare copy like "Would you be open to seeing a brief on [topic]?" without the profile-based bridge.
- Do not reuse the same opener, sentence rhythm, or CTA across every prospect in the batch.
- Vary the bridge naturally: "Your profile pointed me toward...", "I used the signals on your profile to pick...", "Given the brand/social themes visible on your profile...", "I thought [briefTopic] would be a sharper test case than a generic brand brief..."
- Keep the product mention light: building/testing Narralens is context, not the main pitch.
- Still include [shared link] on its own line for post-acceptance first messages.',
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
FROM _narralens_profile_bridge_prompt_base pt;

DROP TABLE _narralens_profile_bridge_prompt_base;
