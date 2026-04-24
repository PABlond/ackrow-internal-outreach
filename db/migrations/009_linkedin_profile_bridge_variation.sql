CREATE TEMP TABLE _linkedin_profile_bridge_variation_base AS
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
  CASE
    WHEN pt.purpose = 'batch_analysis' THEN pt.name || ' + profile bridge variation'
    ELSE pt.name || ' + profile bridge variation'
  END,
  pt.system_prompt,
  pt.user_prompt || '

LINKEDIN PROFILE-BRIDGE AND VARIATION UPDATE
- Every first LinkedIn message must connect the brief to one visible prospect signal: role, about, experience, company context, sector, or activity.
- If the signal is a repost, like, comment, or activity item, phrase it as an interest or public signal visible on the profile, not as proof that the prospect works on or owns that topic.
- Avoid spam-like repetition. Do not reuse the same opener, sentence rhythm, or feedback ask across every prospect in a batch.
- Vary the profile bridge naturally: "Based on what I saw on your profile...", "Your profile pointed me toward...", "I used the signals on your profile to pick...", "Given the themes visible on your profile..."
- Keep the tone soft: no demo, no call ask, no heavy product pitch.
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
FROM _linkedin_profile_bridge_variation_base pt;

DROP TABLE _linkedin_profile_bridge_variation_base;
