import { getDb } from "../src/db.js";

const db = getDb();
const prospects = db.prepare("SELECT COUNT(*) AS count FROM prospects").get().count;
const pending = db.prepare("SELECT COUNT(*) AS count FROM prospects WHERE status = 'connection_sent'").get().count;
const shortTopics = db.prepare(`
  SELECT topic FROM briefs
  WHERE LENGTH(TRIM(topic)) > 0
`).all();
const longTopics = shortTopics.filter((row) => row.topic.trim().split(/\s+/).length > 3);
const longConnections = db.prepare(`
  SELECT p.name, LENGTH(m.content) AS length
  FROM messages m
  JOIN prospects p ON p.id = m.prospect_id
  WHERE m.type = 'connection' AND LENGTH(m.content) > 300
`).all();

if (prospects !== 10) {
  throw new Error(`Expected 10 prospects, got ${prospects}`);
}
if (pending !== 2) {
  throw new Error(`Expected 2 pending connections, got ${pending}`);
}
if (longTopics.length > 0) {
  throw new Error(`Expected brief topics to be 1-3 words: ${longTopics.map((row) => row.topic).join(", ")}`);
}
if (longConnections.length > 0) {
  throw new Error(`Connection messages over 300 chars: ${JSON.stringify(longConnections)}`);
}

console.log("Checks passed: 10 prospects, 2 pending connections, short topics, LinkedIn notes under 300 chars.");
