const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const produtosRoutes = require("./routes/produtos");
const vendasRoutes = require("./routes/vendas");

require("./database/db"); // inicializa banco

const app = express();

app.use(cors());
app.use(express.json());

// rotas
app.use("/", authRoutes);
app.use("/produtos", produtosRoutes);
app.use("/vendas", vendasRoutes);

app.listen(3000, () => {
  console.log("🚀 Backend rodando em http://localhost:3000");
});