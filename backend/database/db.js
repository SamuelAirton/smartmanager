const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

// criar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      preco REAL,
      quantidade INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      senha TEXT,
      tipo TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL,
      data TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER,
      preco REAL
    )
  `);
});

module.exports = db;