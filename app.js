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

  produtos.forEach(p => {
    lista.innerHTML += `
      <li>
        ${p.nome} - €${p.preco} - ${p.quantidade}
        <button onclick="editarProduto(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">✏️</button>
        <button onclick="deletarProduto(${p.id})">❌</button>
      </li>
    `;
  });
}
criarGrafico(produtos);
atualizarDashboard(produtos);
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
// REGISTER (TESTE)
// =======================
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
  console.log("REGISTER:", dados);
}

// =======================
// LOGIN (SALVA TOKEN)
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
  } else {
    alert("Login inválido");
  }
}

  // salva token
  localStorage.setItem("token", dados.token);

// =======================
// LOGOUT
// =======================
function logout() {
  localStorage.removeItem("token");

  document.getElementById("login").style.display = "block";
  document.getElementById("sistema").style.display = "none";
}
// =======================
// INICIAR
// =======================
const token = localStorage.getItem("token");

if (token) {
  document.getElementById("login").style.display = "none";
  document.getElementById("sistema").style.display = "block";
  carregarProdutos();
} else {
  document.getElementById("login").style.display = "block";
  document.getElementById("sistema").style.display = "none";
}
let grafico;

function criarGrafico(produtos) {
  const nomes = produtos.map(p => p.nome);
  const quantidades = produtos.map(p => p.quantidade);

  const ctx = document.getElementById("grafico").getContext("2d");

  // destruir gráfico antigo (evita bug)
  if (grafico) {
    grafico.destroy();
  }

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
function atualizarDashboard(produtos) {
  const totalProdutos = produtos.length;

  const totalQuantidade = produtos.reduce((acc, p) => {
    return acc + Number(p.quantidade);
  }, 0);

  const valorTotal = produtos.reduce((acc, p) => {
    return acc + (p.preco * p.quantidade);
  }, 0);

  document.getElementById("totalProdutos").innerText = totalProdutos;
  document.getElementById("totalQuantidade").innerText = totalQuantidade;
  document.getElementById("valorTotal").innerText = "€ " + valorTotal.toFixed(2);
}
//=================
// CRIAR VENDA
//=================
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
//==============
// CARREGAR VENDA
//==============
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
}