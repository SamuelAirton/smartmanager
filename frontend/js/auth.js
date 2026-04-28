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
// LOGOUT
// =======================
function logout() {
  localStorage.removeItem("token");
  location.reload();
}