const express = require("express");
const db = require("../database/db");
const autenticar = require("../middleware/auth");

const router = express.Router();

// =======================
// CRIAR VENDA
// =======================
router.post("/", autenticar, (req, res) => {
  const { itens } = req.body;
  const data = new Date().toISOString();

  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: "Carrinho vazio" });
  }

  const ids = itens.map(i => i.id);

  db.all(
    `SELECT id, quantidade FROM produtos WHERE id IN (${ids.map(() => "?").join(",")})`,
    ids,
    (err, produtosDB) => {
      if (err) return res.status(500).json(err);

      // 🔍 validar estoque
      for (let item of itens) {
        const produto = produtosDB.find(p => p.id === item.id);

        if (!produto) {
          return res.status(400).json({ error: "Produto não existe" });
        }

        if (produto.quantidade < item.quantidade) {
          return res.status(400).json({
            error: `Estoque insuficiente para ${item.nome}`
          });
        }
      }

      // 💰 calcular total
      let total = 0;
      itens.forEach(i => {
        total += i.preco * i.quantidade;
      });

      // 💾 salvar venda
      db.run(
        "INSERT INTO vendas (total, data) VALUES (?, ?)",
        [total, data],
        function (err) {
          if (err) return res.status(500).json(err);

          const vendaId = this.lastID;

          itens.forEach(i => {
            db.run(
              "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?)",
              [vendaId, i.id, i.quantidade, i.preco]
            );

            db.run(
              "UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?",
              [i.quantidade, i.id]
            );
          });

          res.json({
            message: "Venda realizada com sucesso",
            total
          });
        }
      );
    }
  );
});

// =======================
// LISTAR VENDAS
// =======================
router.get("/", autenticar, (req, res) => {
  db.all("SELECT * FROM vendas ORDER BY data DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;