const sqlite = require('better-sqlite3');
const path = require('path');
const db = new sqlite(path.resolve('./tbr-timekeeper.db'), { fileMustExist: false });

function query(sql, params) {
  return db.prepare(sql).all(params);
}
function getall(sql) {
  return db.prepare(sql).all();
}
function run(sql, params) {
  return db.prepare(sql).run(params);
}
function GenerateTables() {
  db.exec(`CREATE TABLE IF NOT EXISTS config 
  (id INTEGER PRIMARY KEY NOT NULL, 
  name TEXT, 
  value TEXT)`)
}

module.exports = {
  query, getall, GenerateTables, run
}