import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");

let db;

export function getDb() {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON");
    applyMigrations(db);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}

export function resetDbFile() {
  closeDb();
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath);
  }
}

export function getDbPath() {
  return dbPath;
}

function applyMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = new Set(
    database.prepare("SELECT version FROM schema_migrations").all().map((row) => row.version),
  );
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    database.exec("BEGIN");
    try {
      database.exec(sql);
      database.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(file);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }
}
