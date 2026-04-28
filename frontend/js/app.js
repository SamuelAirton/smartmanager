// =======================
// ESTADO GLOBAL
// =======================
let carrinho = [];
let grafico;


// =======================
// LOGIN
// =======================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, senha })
  });

  const dados = await res.json();

  if (dados.token) {
    localStorage.setItem("token", dados.token);

    document.getElementById("login").style.display = "none";
    document.getElementById("sistema").style.display = "block";

    iniciarSistema();
  } else {
    alert("Login inválido");
  }
}


// =======================
// INICIAR SISTEMA
// =======================
function iniciarSistema() {
  carregarProdutos();
  carregarVendas();
}


// =======================
// LOGOUT
// =======================
function logout() {
  localStorage.removeItem("token");
  location.reload();
}


// =======================
// PRODUTOS
// =======================
async function carregarProdutos() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/produtos", {
    headers: { Authorization: "Bearer " + token }
  });

  const produtos = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const select = document.getElementById("produtoSelect");
  select.innerHTML = "";

  produtos.forEach(p => {

    // 🔥 alerta estoque
    let alerta = "";
    if (p.quantidade === 0) alerta = "❌ SEM ESTOQUE";
    else if (p.quantidade <= 5) alerta = "⚠️ BAIXO";

    lista.innerHTML += `
      <li>
        ${p.nome} - €${p.preco} - ${p.quantidade} ${alerta}
        <button onclick="editarProduto(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">✏️</button>
        <button onclick="deletarProduto(${p.id})">❌</button>
      </li>
    `;

    // preencher select
    select.innerHTML += `
      <option value='${JSON.stringify(p)}'>
        ${p.nome}
      </option>
    `;
  });

  atualizarDashboard(produtos);
  criarGrafico(produtos);
}


// =======================
// ADICIONAR PRODUTO
// =======================
async function adicionarProduto() {
  const token = localStorage.getItem("token");

  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;
  const quantidade = document.getElementById("quantidade").value;

  await fetch("http://localhost:3000/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ nome, preco, quantidade })
  });

  carregarProdutos();
}


// =======================
// EDITAR
// =======================
async function editarProduto(id, nomeAtual, precoAtual, quantidadeAtual) {
  const token = localStorage.getItem("token");

  const nome = prompt("Nome:", nomeAtual);
  const preco = prompt("Preço:", precoAtual);
  const quantidade = prompt("Quantidade:", quantidadeAtual);

  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ nome, preco, quantidade })
  });

  carregarProdutos();
}


// =======================
// DELETAR
// =======================
async function deletarProduto(id) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  carregarProdutos();
}


// =======================
// DASHBOARD
// =======================
function atualizarDashboard(produtos) {
  document.getElementById("totalProdutos").innerText = produtos.length;

  const totalQtd = produtos.reduce((acc, p) => acc + Number(p.quantidade), 0);
  const totalValor = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);

  document.getElementById("totalQuantidade").innerText = totalQtd;
  document.getElementById("valorTotal").innerText = "€ " + totalValor.toFixed(2);
}


// =======================
// GRÁFICO
// =======================
function criarGrafico(produtos) {
  const ctx = document.getElementById("grafico").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: produtos.map(p => p.nome),
      datasets: [{
        label: "Estoque",
        data: produtos.map(p => p.quantidade)
      }]
    }
  });
}


// =======================
// CARRINHO
// =======================
function adicionarItem() {
  const select = document.getElementById("produtoSelect");
  const quantidade = Number(document.getElementById("quantidadeVenda").value);

  const produto = JSON.parse(select.value);

  const existente = carrinho.find(i => i.id === produto.id);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({
      ...produto,
      quantidade
    });
  }

  mostrarCarrinho();
}


function mostrarCarrinho() {
  const lista = document.getElementById("carrinho");
  lista.innerHTML = "";

  carrinho.forEach(item => {
    lista.innerHTML += `
      <li>
        ${item.nome} x${item.quantidade}
      </li>
    `;
  });
}


function limparCarrinho() {
  carrinho = [];
  mostrarCarrinho();
}


// =======================
// FINALIZAR VENDA
// =======================
async function finalizarVenda() {
  const token = localStorage.getItem("token");

  await fetch("http://localhost:3000/vendas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ itens: carrinho })
  });

  carrinho = [];
  mostrarCarrinho();

  carregarProdutos();
  carregarVendas();
}


// =======================
// VENDAS
// =======================
async function carregarVendas() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/vendas", {
    headers: { Authorization: "Bearer " + token }
  });

  const vendas = await res.json();

  const lista = document.getElementById("listaVendas");
  lista.innerHTML = "";

  vendas.forEach(v => {
    lista.innerHTML += `
      <li>
        €${v.total} - ${new Date(v.data).toLocaleString()}
      </li>
    `;
  });
}