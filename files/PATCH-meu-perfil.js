/* ══════════════════════════════════════════════════════════════════
   PATCH PARA meu-perfil.js
   Adicione os blocos abaixo nos locais indicados.
   ══════════════════════════════════════════════════════════════════

   ── 1. No HTML (meu-perfil.html), adicione dentro do <head>:
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

   ── 2. No HTML, dentro de #state-auth (abaixo do form-login), adicione:

    <div id="forgot-password-section" style="margin-top:12px;text-align:center;">
      <button type="button" id="btn-forgot" style="background:none;border:none;
        color:var(--text-muted);font-size:.83rem;cursor:pointer;text-decoration:underline;
        font-family:var(--font-body);">Esqueceu a senha?</button>
    </div>

    <!-- Reset de senha -->
    <div id="form-reset-wrap" style="display:none;margin-top:20px;">
      <div class="pf-group">
        <label for="reset-email">Seu email</label>
        <input type="email" id="reset-email" placeholder="seu@email.com">
      </div>
      <button type="button" id="btn-send-reset" class="btn-primary" style="width:100%;padding:12px;">
        Enviar link de redefinição
      </button>
      <p id="reset-message" style="margin-top:10px;font-size:.84rem;text-align:center;"></p>
    </div>

   ── 3. Adicione este STATE em STATES array no meu-perfil.js:
   const STATES = ["loading", "auth", "verify", "link", "register", "profile", "new-password"];

   ── 4. Adicione no HTML um novo state para definir nova senha,
         APÓS o state-auth:

    <div id="state-new-password" class="profile-state">
      <div class="auth-card">
        <h2>🔑 Redefinir senha</h2>
        <p class="auth-sub">Escolha uma nova senha para sua conta.</p>
        <div class="pf-group" style="margin-top:20px;">
          <label for="new-pwd">Nova senha</label>
          <input type="password" id="new-pwd" placeholder="Mínimo 6 caracteres">
        </div>
        <div class="pf-group">
          <label for="new-pwd-confirm">Confirmar senha</label>
          <input type="password" id="new-pwd-confirm" placeholder="Repita a senha">
        </div>
        <button type="button" id="btn-save-password" class="btn-primary" style="width:100%;padding:12px;">
          Salvar nova senha
        </button>
        <p id="new-pwd-message" style="margin-top:12px;font-size:.84rem;text-align:center;"></p>
      </div>
    </div>

   ══════════════════════════════════════════════════════════════════
   CÓDIGO JAVASCRIPT — cole no final do meu-perfil.js
   (antes do init() no final do arquivo)
   ══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   RESET DE SENHA — "Esqueceu a senha?"
   ═══════════════════════════════════════════ */

document.getElementById("btn-forgot")?.addEventListener("click", () => {
  const wrap = document.getElementById("form-reset-wrap");
  const isVisible = wrap.style.display !== "none";
  wrap.style.display = isVisible ? "none" : "block";
  // pré-preencher email do campo de login
  const loginEmail = document.getElementById("login-email")?.value;
  if (loginEmail) document.getElementById("reset-email").value = loginEmail;
});

document.getElementById("btn-send-reset")?.addEventListener("click", async () => {
  const msgEl = document.getElementById("reset-message");
  const email = document.getElementById("reset-email")?.value.trim();
  const btn   = document.getElementById("btn-send-reset");

  if (!email) {
    msgEl.style.color = "#f87171";
    msgEl.textContent = "Digite seu email.";
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Enviando...";
  msgEl.textContent = "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/pages/meu-perfil.html"
  });

  btn.disabled    = false;
  btn.textContent = "Enviar link de redefinição";

  if (error) {
    msgEl.style.color = "#f87171";
    msgEl.textContent = "Erro ao enviar. Verifique o email e tente novamente.";
  } else {
    msgEl.style.color = "#22c55e";
    msgEl.textContent = "✅ Email enviado! Verifique sua caixa de entrada.";
  }
});

/* ═══════════════════════════════════════════
   DETECÇÃO DO LINK DE RECOVERY (evento auth)
   Quando o usuário clica no link do email,
   o Supabase gera evento PASSWORD_RECOVERY
   ═══════════════════════════════════════════ */

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    showState("new-password");
  }
});

document.getElementById("btn-save-password")?.addEventListener("click", async () => {
  const msgEl   = document.getElementById("new-pwd-message");
  const pwd     = document.getElementById("new-pwd")?.value;
  const confirm = document.getElementById("new-pwd-confirm")?.value;
  const btn     = document.getElementById("btn-save-password");

  msgEl.textContent = "";

  if (!pwd || pwd.length < 6) {
    msgEl.style.color = "#f87171";
    msgEl.textContent = "A senha deve ter pelo menos 6 caracteres.";
    return;
  }
  if (pwd !== confirm) {
    msgEl.style.color = "#f87171";
    msgEl.textContent = "As senhas não coincidem.";
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Salvando...";

  const { error } = await supabase.auth.updateUser({ password: pwd });

  btn.disabled    = false;
  btn.textContent = "Salvar nova senha";

  if (error) {
    msgEl.style.color = "#f87171";
    msgEl.textContent = error.message || "Erro ao salvar senha.";
  } else {
    msgEl.style.color = "#22c55e";
    msgEl.textContent = "✅ Senha redefinida com sucesso! Redirecionando...";
    setTimeout(() => init(), 2000);
  }
});

/* ═══════════════════════════════════════════
   GRÁFICO DE RATING — dentro de renderProfileView
   ═══════════════════════════════════════════
   Substitua o trecho final do renderProfileView que define
   grid.innerHTML, adicionando o bloco do gráfico.

   No final do grid.innerHTML, ANTES do fechamento da template string,
   adicione este card:

    <div class="profile-header-card" style="flex-direction:column;align-items:flex-start;gap:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px;">
        <div class="card-title">Evolução do Rating</div>
        <div id="tc-tabs-own" style="display:flex;gap:6px;">
          <button class="tc-tab-own active" data-tc="rapid"
            style="background:var(--green);border:1px solid var(--green);color:#052e16;
                   font-family:var(--font-body);font-size:.76rem;font-weight:600;
                   padding:4px 12px;border-radius:20px;cursor:pointer;">Rapid</button>
          <button class="tc-tab-own" data-tc="blitz"
            style="background:none;border:1px solid var(--border);color:var(--text-muted);
                   font-family:var(--font-body);font-size:.76rem;font-weight:600;
                   padding:4px 12px;border-radius:20px;cursor:pointer;">Blitz</button>
          <button class="tc-tab-own" data-tc="standard"
            style="background:none;border:1px solid var(--border);color:var(--text-muted);
                   font-family:var(--font-body);font-size:.76rem;font-weight:600;
                   padding:4px 12px;border-radius:20px;cursor:pointer;">Standard</button>
        </div>
      </div>
      <div style="position:relative;height:200px;width:100%;">
        <canvas id="rating-chart-own"></canvas>
      </div>
      <div id="chart-own-empty" style="display:none;text-align:center;padding:24px;
           color:var(--text-muted);font-size:.88rem;width:100%;">
        Nenhuma partida registrada nesta modalidade ainda.
      </div>
    </div>

   ── Depois do grid.innerHTML, adicione as chamadas abaixo: ── */

// Após renderizar o grid, buscar history e iniciar gráfico
async function loadOwnRatingChart(playerId) {
  const { data: history } = await supabase
    .from("rating_history")
    .select("rating_before, rating_after, delta, time_control, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: true });

  const allOwnHistory = history ?? [];

  let ownChart = null;

  function renderOwnChart(tc) {
    const canvas  = document.getElementById("rating-chart-own");
    const emptyEl = document.getElementById("chart-own-empty");
    if (!canvas) return;

    const filtered = allOwnHistory.filter(h => h.time_control === tc);

    if (!filtered.length) {
      canvas.style.display = "none";
      emptyEl.style.display = "block";
      if (ownChart) { ownChart.destroy(); ownChart = null; }
      return;
    }

    canvas.style.display = "block";
    emptyEl.style.display = "none";

    const labels = [];
    const data   = [];
    filtered.forEach((h, i) => {
      if (i === 0) {
        labels.push("Início");
        data.push(h.rating_before);
      }
      labels.push(`${i + 1}`);
      data.push(h.rating_after);
    });

    if (ownChart) ownChart.destroy();

    ownChart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.08)",
          borderWidth: 2,
          pointRadius: data.length > 30 ? 2 : 4,
          pointBackgroundColor: "#22c55e",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8", maxTicksLimit: 8, font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.06)" } }
        }
      }
    });
  }

  renderOwnChart("rapid");

  document.querySelectorAll(".tc-tab-own").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tc-tab-own").forEach(t => {
        t.style.background = "none";
        t.style.borderColor = "var(--border)";
        t.style.color = "var(--text-muted)";
      });
      tab.style.background = "var(--green)";
      tab.style.borderColor = "var(--green)";
      tab.style.color = "#052e16";
      renderOwnChart(tab.dataset.tc);
    });
  });
}

// IMPORTANTE: Chame loadOwnRatingChart(player.id) no final da função renderProfileView,
// após o grid.innerHTML = `...`
// Exemplo:
//   grid.innerHTML = `...todo o HTML...`;
//   await loadOwnRatingChart(player.id);   ← ADICIONE ESTA LINHA
