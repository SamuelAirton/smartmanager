// =======================
// ESTADO GLOBAL
// =======================
let grafico;
let carrinho = [];


// =======================
// CARREGAR PRODUTOS
// =======================
async function carregarProdutos() {
  const token = localStorage.getItem("token");

  const resposta = await fetch("http://localhost:3000/produtos", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  if (resposta.status === 401) {
    alert("Você precisa fazer login!");
    return;
  }

  const produtos = await resposta.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const user = getUserFromToken();

produtos.forEach(p => {

  let classe = "";
  let texto = "";

  if (p.quantidade === 0) {
    classe = "critico";
    texto = "SEM ESTOQUE";
  } else if (p.quantidade <= 5) {
    classe = "baixo";
    texto = "BAIXO";
  }

  // 🔐 botões só para admin
  let botoes = "";

  if (user?.tipo === "admin") {
    botoes = `
      <button onclick="editarProduto(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">✏️</button>
      <button onclick="deletarProduto(${p.id})">❌</button>
    `;
  }

  lista.innerHTML += `
    <li>
      ${p.nome} - €${p.preco} - ${p.quantidade}
      <span class="${classe}">${texto}</span>
      ${botoes}
    </li>
  `;
});

  criarGrafico(produtos);
  atualizarDashboard(produtos);
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

  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("quantidade").value = "";

  carregarProdutos();
}


// =======================
// EDITAR PRODUTO
// =======================
async function editarProduto(id, nomeAtual, precoAtual, quantidadeAtual) {
  const token = localStorage.getItem("token");

  const nome = prompt("Novo nome:", nomeAtual);
  const preco = prompt("Novo preço:", precoAtual);
  const quantidade = prompt("Nova quantidade:", quantidadeAtual);

  if (!nome || !preco || !quantidade) return;

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
// DELETAR PRODUTO
// =======================
async function deletarProduto(id) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  carregarProdutos();
}


// =======================
// LOGIN
// =======================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const resposta = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, senha })
  });

  const dados = await resposta.json();

  if (dados.token) {
    localStorage.setItem("token", dados.token);

    document.getElementById("login").style.display = "none";
    document.getElementById("sistema").style.display = "block";

    carregarProdutos();
    carregarVendas();
  } else {
    alert("Login inválido");
  }
}


// =======================
// LOGOUT
// =======================
function logout() {
  localStorage.removeItem("token");

  document.getElementById("login").style.display = "block";
  document.getElementById("sistema").style.display = "none";
}
carregarSelectProdutos();

// =======================
// INICIALIZAÇÃO
// =======================
const token = localStorage.getItem("token");

if (token) {
  document.getElementById("login").style.display = "none";
  document.getElementById("sistema").style.display = "block";

  carregarProdutos();
  carregarVendas();
} else {
  document.getElementById("login").style.display = "block";
  document.getElementById("sistema").style.display = "none";
}


// =======================
// GRÁFICO
// =======================
function criarGrafico(produtos) {
  const nomes = produtos.map(p => p.nome);
  const quantidades = produtos.map(p => p.quantidade);

  const ctx = document.getElementById("grafico").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: nomes,
      datasets: [{
        label: "Quantidade em estoque",
        data: quantidades
      }]
    }
  });
}


// =======================
// DASHBOARD
// =======================
function atualizarDashboard(produtos) {
  const totalProdutos = produtos.length;

  const totalQuantidade = produtos.reduce((acc, p) => acc + Number(p.quantidade), 0);

  const valorTotal = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);

  document.getElementById("totalProdutos").innerText = totalProdutos;
  document.getElementById("totalQuantidade").innerText = totalQuantidade;
  document.getElementById("valorTotal").innerText = "€ " + valorTotal.toFixed(2);
}


// =======================
// VENDAS
// =======================

// criar venda simples
async function criarVenda() {
  const token = localStorage.getItem("token");
  const total = document.getElementById("valorVenda").value;

  await fetch("http://localhost:3000/vendas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ total })
  });

  carregarVendas();
}


// FINALIZAR VENDA
async function finalizarVenda() {
  const token = localStorage.getItem("token");

  if (carrinho.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  const resposta = await fetch("http://localhost:3000/vendas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ itens: carrinho })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.error || "Erro na venda");
    return;
  }

  alert("Venda realizada com sucesso!");

  carrinho = [];
  mostrarCarrinho();
  carregarProdutos();
  carregarVendas();
  carregarSelectProdutos();
}
// carregar venda
async function carregarVendas() {
  const token = localStorage.getItem("token");

  const resposta = await fetch("http://localhost:3000/vendas", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const vendas = await resposta.json();

  const lista = document.getElementById("listaVendas");
  lista.innerHTML = "";

  vendas.forEach(v => {
    lista.innerHTML += `
      <li>
        €${v.total} - ${new Date(v.data).toLocaleString()}
      </li>
    `;
  });

  criarGraficoVendas(vendas);
  atualizarFaturamento(vendas);
}



// =======================
// CARRINHO DE VENDAS ADICIONAR ITEM
// =======================

function adicionarItem() {
  const select = document.getElementById("produtoSelect");
  const quantidade = Number(document.getElementById("quantidadeVenda").value);

  if (!quantidade || quantidade <= 0) {
    alert("Quantidade inválida");
    return;
  }

  const produto = JSON.parse(select.value);

  // 🔍 verifica se já existe no carrinho
  const itemExistente = carrinho.find(i => i.id === produto.id);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: quantidade
    });
  }

  mostrarCarrinho();
}
// =======================
// mostrarCarrinho
// =======================
function mostrarCarrinho() {
  const lista = document.getElementById("carrinho");
  lista.innerHTML = "";

  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco * item.quantidade;

    lista.innerHTML += `
      <li>
        ${item.nome}
        <input type="number" value="${item.quantidade}" min="1"
          onchange="alterarQuantidade(${index}, this.value)">
        - €${item.preco}
        <button onclick="removerItem(${index})">❌</button>
      </li>
    `;
  });

  lista.innerHTML += `
    <hr>
    <strong>Total: €${total.toFixed(2)}</strong>
  `;
}
// =======================
// GRAFICO VENDA
// =======================
function criarGraficoVendas(vendas) {
  const datas = vendas.map(v => new Date(v.data).toLocaleDateString());
  const valores = vendas.map(v => v.total);

  const ctx = document.getElementById("graficoVendas").getContext("2d");

  if (window.graficoVendas) {
    window.graficoVendas.destroy();
  }

  window.graficoVendas = new Chart(ctx, {
    type: "line",
    data: {
      labels: datas,
      datasets: [{
        label: "Faturamento (€)",
        data: valores
      }]
    }
  });
}
// =======================
// ATUALIZAR FATURAMENTO
// =======================
function atualizarFaturamento(vendas) {
  const total = vendas.reduce((acc, v) => acc + v.total, 0);

  document.getElementById("faturamentoTotal").innerText =
    "€ " + total.toFixed(2);
}
async function testarRegister() {
  const resposta = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "teste@email.com",
      senha: "123456"
    })
  });

  const dados = await resposta.json();
  console.log(dados);
}   
function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload;
}
async function carregarSelectProdutos() {
  const token = localStorage.getItem("token");

  const resposta = await fetch("http://localhost:3000/produtos", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const produtos = await resposta.json();

  const select = document.getElementById("produtoSelect");
  select.innerHTML = "";

  produtos.forEach(p => {
    select.innerHTML += `
      <option value='${JSON.stringify(p)}'>
        ${p.nome} - €${p.preco}
      </option>
    `;
  });
}
//==================
// ALTERAR QUANTIDADE
//==================
function alterarQuantidade(index, novaQtd) {
  carrinho[index].quantidade = Number(novaQtd);
  mostrarCarrinho();
}
//=================
// REMOVER ITEM
//=================
function removerItem(index) {
  carrinho.splice(index, 1);
  mostrarCarrinho();
}
//=================
// LIMPAR CARRINHO
//=================
function limparCarrinho() {
  carrinho = [];
  mostrarCarrinho();
}
