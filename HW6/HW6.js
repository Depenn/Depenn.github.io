import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("HW6.db");

db.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    user TEXT,
    time DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const posts = [
  {
    title: "Chill",
    content: "old style Japanese fusion jazz + staring at the ceiling",
    user: "By Bill",
  },
  {
    title: "How to do the homework?",
    content: "How do I install deno js on my Laptop? And does anyone know?",
    user: "By Deven",
  },
  {
    title: "Somebody To Love",
    content: "Each morning I get up I die a little. Can barely stand on my feet.",
    user: "By Fred",
  },
];

for (const post of posts) {
  db.query(
    "INSERT INTO posts (title, content, user) VALUES (?, ?, ?)",
    [post.title, post.content, post.user]
  );
}

for (
  const [id, title, content, user, time] of db.query(
    "SELECT id, title, content, user, time FROM posts"
  )
) {
  console.log(id, title, content, user, time);
}

db.close();