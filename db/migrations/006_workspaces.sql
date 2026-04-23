CREATE TABLE IF NOT EXISTS workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  default_language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_docs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE (workspace_id, type)
);

CREATE TABLE IF NOT EXISTS prompt_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  purpose TEXT NOT NULL,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  temperature REAL NOT NULL DEFAULT 0.2,
  active INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prompt_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  prompt_template_id INTEGER,
  prospect_id INTEGER,
  input_json TEXT NOT NULL,
  output_json TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_template_id) REFERENCES prompt_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO workspaces (slug, name, product_name, default_language)
VALUES
  ('tempolis', 'Tempolis', 'Tempolis', 'en'),
  ('narralens', 'Narralens', 'Narralens', 'en');

ALTER TABLE prospects ADD COLUMN workspace_id INTEGER;

UPDATE prospects
SET workspace_id = (SELECT id FROM workspaces WHERE slug = 'tempolis')
WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_workspace ON prospects(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(workspace_id, channel, purpose, active);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_workspace ON prompt_runs(workspace_id, created_at);
