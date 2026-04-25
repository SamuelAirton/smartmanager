let produtos = [];

function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;
  const quantidade = document.getElementById("quantidade").value;

  const produto = { nome, preco, quantidade };

  produtos.push(produto);

  mostrarProdutos();
}

function mostrarProdutos() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  produtos.forEach(p => {
    lista.innerHTML += `<li>${p.nome} - €${p.preco} - ${p.quantidade}</li>`;
  });
}