let grafico;

function atualizarDashboard(produtos) {
  document.getElementById("totalProdutos").innerText = produtos.length;

  const totalQtd = produtos.reduce((acc, p) => acc + Number(p.quantidade), 0);
  const totalValor = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);

  document.getElementById("totalQuantidade").innerText = totalQtd;
  document.getElementById("valorTotal").innerText = "€ " + totalValor.toFixed(2);
}

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