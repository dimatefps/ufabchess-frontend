import { signIn, signUp, getSession } from "../services/auth.service.js";

/* ══════════════════════════════════
   AUTH PAGE — Login / Cadastro
══════════════════════════════════ */

document.addEventListener("DOMContentLoaded", async () => {

  // Se já logado, redirecionar
  const session = await getSession();
  if (session) {
    window.location.href = "./perfil.html";
    return;
  }

  // ── Tabs ──
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove("active"));
      forms.forEach(f => f.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`form-${target}`).classList.add("active");

      // Limpar mensagens
      document.querySelectorAll(".auth-message").forEach(m => {
        m.style.display = "none";
      });
    });
  });

  // ── Login ──
  document.getElementById("btn-login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("login-message");
    const btn = document.getElementById("btn-login");

    if (!email || !password) {
      showMessage(msg, "Preencha todos os campos.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Entrando...";

    try {
      await signIn(email, password);
      showMessage(msg, "Login realizado! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "./perfil.html";
      }, 800);
    } catch (err) {
      showMessage(msg, translateError(err.message), "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  });

  // ── Registro ──
  document.getElementById("btn-register").addEventListener("click", async () => {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const msg = document.getElementById("register-message");
    const btn = document.getElementById("btn-register");

    if (!name || !email || !password) {
      showMessage(msg, "Preencha todos os campos.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(msg, "A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Criando conta...";

    try {
      await signUp(email, password, name);
      showMessage(msg, "Conta criada com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "./perfil.html";
      }, 1000);
    } catch (err) {
      showMessage(msg, translateError(err.message), "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Criar conta";
    }
  });

  // Enter key submits
  document.getElementById("login-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-login").click();
  });
  document.getElementById("reg-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-register").click();
  });
});

/* ── Helpers ── */

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `auth-message ${type}`;
  el.style.display = "block";
}

function translateError(message) {
  if (message.includes("Invalid login")) return "Email ou senha incorretos.";
  if (message.includes("already registered")) return "Este email já possui uma conta.";
  if (message.includes("Jogador já cadastrado")) return "Sua conta já está vinculada a um perfil de jogador.";
  if (message.includes("valid email")) return "Insira um email válido.";
  if (message.includes("least 6")) return "A senha deve ter pelo menos 6 caracteres.";
  return message;
}
