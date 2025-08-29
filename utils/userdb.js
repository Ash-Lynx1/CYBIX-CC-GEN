const dbFile = './userdb.json';
const fs = require('fs');

function loadDb() {
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}');
  return JSON.parse(fs.readFileSync(dbFile));
}
function saveDb(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db));
}
function ensureUserExists(id) {
  const db = loadDb();
  if (!db[id]) {
    db[id] = { type: 'regular', used: {} };
    saveDb(db);
  }
}
function setPremium(id, type) {
  const db = loadDb();
  if (!db[id]) db[id] = { type: 'regular', used: {} };
  db[id].type = type;
  saveDb(db);
}
function getUserType(id) {
  const db = loadDb();
  return db[id]?.type || 'regular';
}
function getAllUsers() {
  return loadDb();
}

module.exports = { ensureUserExists, setPremium, getUserType, getAllUsers, saveDb };