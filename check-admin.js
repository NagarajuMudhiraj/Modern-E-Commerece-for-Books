import Database from "better-sqlite3";
const db = new Database("bookverse.db");
const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@bookverse.com");
console.log("Admin user:", admin);
db.close();
