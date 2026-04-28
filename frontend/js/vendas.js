let carrinho = [];

function adicionarItem() {
  const select = document.getElementById("produtoSelect");
  const quantidade = Number(document.getElementById("quantidadeVenda").value);

  const produto = JSON.parse(select.value);

  const existente = carrinho.find(i => i.id === produto.id);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({ ...produto, quantidade });
  }

  mostrarCarrinho();
}

function mostrarCarrinho() {
  const lista = document.getElementById("carrinho");
  lista.innerHTML = "";

  carrinho.forEach(item => {
    lista.innerHTML += `
      <li>${item.nome} x${item.quantidade}</li>
    `;
  });
}

function limparCarrinho() {
  carrinho = [];
  mostrarCarrinho();
}

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
      <li>€${v.total} - ${new Date(v.data).toLocaleString()}</li>
    `;
  });
}