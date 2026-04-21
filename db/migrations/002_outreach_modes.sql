ALTER TABLE prospects ADD COLUMN outreach_mode TEXT NOT NULL DEFAULT 'with_note';
ALTER TABLE prospects ADD COLUMN connection_note_sent INTEGER NOT NULL DEFAULT 0;

UPDATE prospects
SET connection_note_sent = 1
WHERE connection_sent_date IS NOT NULL;
