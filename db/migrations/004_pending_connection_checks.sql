ALTER TABLE prospects ADD COLUMN pending_checked_at TEXT;
ALTER TABLE prospects ADD COLUMN connection_last_state TEXT;

CREATE INDEX IF NOT EXISTS idx_prospects_pending_checked
ON prospects(status, pending_checked_at, connection_sent_date);
