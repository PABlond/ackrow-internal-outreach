ALTER TABLE prospects ADD COLUMN source_channel TEXT NOT NULL DEFAULT 'linkedin';
ALTER TABLE prospects ADD COLUMN twitter_handle TEXT;
ALTER TABLE prospects ADD COLUMN twitter_url TEXT;
ALTER TABLE prospects ADD COLUMN twitter_contacted_date TEXT;
ALTER TABLE prospects ADD COLUMN twitter_followup_sent_date TEXT;

UPDATE prospects
SET source_channel = 'linkedin'
WHERE source_channel IS NULL OR source_channel = '';

CREATE INDEX IF NOT EXISTS idx_prospects_source_channel ON prospects(source_channel);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_twitter_url ON prospects(twitter_url) WHERE twitter_url IS NOT NULL;
