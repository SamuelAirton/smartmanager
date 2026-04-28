const express = require("express");
const db = require("../database/db");
const autenticar = require("../middleware/auth");

const router = express.Router();

router.get("/", autenticar, (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.post("/", autenticar, (req, res) => {
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

router.put("/:id", autenticar, (req, res) => {
  const { id } = req.params;
  const { nome, preco, quantidade } = req.body;

  db.run(
    "UPDATE produtos SET nome=?, preco=?, quantidade=? WHERE id=?",
    [nome, preco, quantidade, id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ message: "Atualizado" });
    }
  );
});

router.delete("/:id", autenticar, (req, res) => {
  db.run("DELETE FROM produtos WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deletado" });
  });
});

module.exports = router;