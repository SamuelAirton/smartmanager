const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// BANCO DE DADOS
// =======================
const db = new sqlite3.Database("./database.db");

// =======================
// MIDDLEWARE DE AUTENTICAÇÃO
// =======================
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "segredo");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// =======================
// TABELAS
// =======================
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
    senha TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL,
    data TEXT
  )
`);
// =======================
// criar venda
//========================
app.post("/vendas", autenticar, (req, res) => {
  const { total } = req.body;
  const data = new Date().toISOString();

  db.run(
    "INSERT INTO vendas (total, data) VALUES (?, ?)",
    [total, data],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({ id: this.lastID, total, data });
    }
  );
});
// =======================
// LISTAR VENDA
// =======================
app.get("/vendas", autenticar, (req, res) => {
  db.all("SELECT * FROM vendas ORDER BY data DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// =======================
// REGISTER (SEM PROTEÇÃO)
// =======================
app.post("/register", async (req, res) => {
  const { email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  db.run(
    "INSERT INTO usuarios (email, senha) VALUES (?, ?)",
    [email, senhaHash],
    function (err) {
      if (err) return res.status(500).json({ error: "Usuário já existe" });

      res.json({ message: "Usuário criado" });
    }
  );
});

// =======================
// LOGIN (SEM PROTEÇÃO)
// =======================
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
        return res.status(401).json({ error: "Senha inválida" });
      }

      const token = jwt.sign({ id: user.id }, "segredo");

      res.json({ token });
    }
  );
});
carregarVendas();
// =======================
// PRODUTOS (PROTEGIDOS)
// =======================

// LISTAR
app.get("/produtos", autenticar, (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// CRIAR
app.post("/produtos", autenticar, (req, res) => {
  const { nome, preco, quantidade } = req.body;

  db.run(
    "INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)",
    [nome, preco, quantidade],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        id: this.lastID,
        nome,
        preco,
        quantidade
      });
    }
  );
});

// ATUALIZAR
app.put("/produtos/:id", autenticar, (req, res) => {
  const { id } = req.params;
  const { nome, preco, quantidade } = req.body;

  db.run(
    "UPDATE produtos SET nome = ?, preco = ?, quantidade = ? WHERE id = ?",
    [nome, preco, quantidade, id],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({ message: "Produto atualizado" });
    }
  );
});

// DELETAR
app.delete("/produtos/:id", autenticar, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM produtos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json(err);

    res.json({ message: "Produto deletado" });
  });
});

// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("🚀 Backend rodando em http://localhost:3000");
});