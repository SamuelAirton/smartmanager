const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  db.run(
    "INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)",
    [email, senhaHash, "admin"],
    function (err) {
      if (err) return res.status(500).json({ error: "Usuário já existe" });

      res.json({ message: "Usuário criado" });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
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

      const token = jwt.sign(
        { id: user.id, tipo: user.tipo },
        "segredo"
      );

      res.json({ token });
    }
  );
});

module.exports = router;