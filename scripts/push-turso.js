import { createClient } from "@libsql/client";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dbPath = path.join(rootDir, "data", "outreach.sqlite");
const migrationsDir = path.join(rootDir, "db", "migrations");

loadLocalEnv();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("DATABASE_URL and DATABASE_AUTH_TOKEN are required.");
}

const local = new DatabaseSync(dbPath);
const remote = createClient({ url, authToken });

await resetRemote();
await applyMigrations();
await copyTable("prospects");
await copyTable("briefs");
await copyTable("messages");
await copyTable("events");
await copyTable("tasks");
await copyTable("replies");

const count = await remote.execute("SELECT COUNT(*) AS count FROM prospects");
console.log(`Pushed ${count.rows[0].count} prospects to ${url}`);

function loadLocalEnv() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

async function resetRemote() {
  await remote.execute("PRAGMA foreign_keys = OFF");
  for (const table of ["replies", "tasks", "events", "messages", "briefs", "prospects", "schema_migrations"]) {
    await remote.execute(`DROP TABLE IF EXISTS ${table}`);
  }
  await remote.execute("PRAGMA foreign_keys = ON");
}

async function applyMigrations() {
  await remote.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await remote.executeMultiple(fs.readFileSync(path.join(migrationsDir, file), "utf8"));
    await remote.execute({
      sql: "INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)",
      args: [file],
    });
  }
}

async function copyTable(table) {
  const rows = local.prepare(`SELECT * FROM ${table}`).all();
  if (rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

  for (const row of rows) {
    await remote.execute({
      sql,
      args: columns.map((column) => row[column]),
    });
  }
}
