CREATE TABLE IF NOT EXISTS prospects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT,
  profile_url TEXT NOT NULL UNIQUE,
  about TEXT,
  priority_tag TEXT NOT NULL DEFAULT 'LEARN',
  wave INTEGER,
  contact_now INTEGER NOT NULL DEFAULT 0,
  rationale TEXT,
  recommended_template TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'to_contact',
  connection_sent_date TEXT,
  accepted_date TEXT,
  report_sent_date TEXT,
  followup_sent_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS briefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER NOT NULL,
  topic TEXT NOT NULL,
  preparation_notes TEXT,
  shared_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
  UNIQUE (prospect_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  due_date TEXT,
  sent_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
  UNIQUE (prospect_id, type)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER,
  type TEXT NOT NULL,
  note TEXT,
  happened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospect_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON tasks(status, due_date);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
