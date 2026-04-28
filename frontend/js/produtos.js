async function carregarProdutos() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/produtos", {
    headers: { Authorization: "Bearer " + token }
  });

  const produtos = await res.json();

  const lista = document.getElementById("lista");
  const select = document.getElementById("produtoSelect");

  lista.innerHTML = "";
  select.innerHTML = "";

  produtos.forEach(p => {
    let alerta = "";
    if (p.quantidade === 0) alerta = "❌";
    else if (p.quantidade <= 5) alerta = "⚠️";

    lista.innerHTML += `
      <li>
        ${p.nome} - €${p.preco} - ${p.quantidade} ${alerta}
        <button onclick="editarProduto(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">✏️</button>
        <button onclick="deletarProduto(${p.id})">❌</button>
      </li>
    `;

    select.innerHTML += `
      <option value='${JSON.stringify(p)}'>
        ${p.nome}
      </option>
    `;
  });

  atualizarDashboard(produtos);
  criarGrafico(produtos);
}

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

async function deletarProduto(id) {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:3000/produtos/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  carregarProdutos();
}