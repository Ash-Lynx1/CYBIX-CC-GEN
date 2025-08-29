const { getUserType, ensureUserExists, getAllUsers, saveDb } = require('./userdb');

const LIMITS = { regular: 3, premium: 30, vvip: Infinity };
const WINDOW_MS = 60 * 60 * 1000;

function canUseCommand(id, type, cmd) {
  ensureUserExists(id);
  const db = getAllUsers();
  const now = Date.now();
  if (!db[id].used[cmd]) db[id].used[cmd] = [];
  db[id].used[cmd] = db[id].used[cmd].filter(ts => now - ts < WINDOW_MS);
  if (db[id].used[cmd].length < LIMITS[type]) return true;
  return false;
}

function recordCommandUse(id, cmd) {
  const db = getAllUsers();
  if (!db[id].used[cmd]) db[id].used[cmd] = [];
  db[id].used[cmd].push(Date.now());
  saveDb(db);
}

module.exports = { canUseCommand, recordCommandUse, getUserType };