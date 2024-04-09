const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./user_database.db', (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'member'
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('User table created.');
      }
    });
  }
});
