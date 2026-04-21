import { getDb, getDbPath, resetDbFile } from "../src/db.js";
import { importSeedData } from "../src/seed.js";

resetDbFile();
const db = getDb();
importSeedData(db);

const counts = {
  prospects: db.prepare("SELECT COUNT(*) AS count FROM prospects").get().count,
  briefs: db.prepare("SELECT COUNT(*) AS count FROM briefs").get().count,
  messages: db.prepare("SELECT COUNT(*) AS count FROM messages").get().count,
  tasks: db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count,
};

console.log(`Created ${getDbPath()}`);
console.log(`Imported ${counts.prospects} prospects, ${counts.briefs} briefs, ${counts.messages} messages, ${counts.tasks} tasks.`);
