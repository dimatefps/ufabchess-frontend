import { supabase } from "../services/supabase.js";

/* ══════════════════════════════════════════════════════
   JOGADOR.JS — Perfil público de um jogador
   URL esperada: /pages/jogador.html?id=PLAYER_UUID
   ══════════════════════════════════════════════════════ */

/* ── Title badge ── */
function getTitleBadge(rating, gamesPlayed) {
  if (!gamesPlayed || gamesPlayed < 10) return "";
  if (rating >= 2000) return `<span class="title-badge gmf" title="Grande Mestre Federal">GMF</span>`;
  if (rating >= 1800) return `<span class="title-badge mf"  title="Mestre Federal">MF</span>`;
  if (rating >= 1600) return `<span class="title-badge cmf" title="Candidato a Mestre Federal">CMF</span>`;
  return "";
}

/* ── Globals ── */
let chartInstance = null;
let allHistory    = [];   // todos os registros de rating_history do jogador

/* ══════════════════════════════════
   INIT
   ══════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("player-content");
  const params    = new URLSearchParams(window.location.search);
  const playerId  = params.get("id");

  if (!playerId) {
    container.innerHTML = notFound("ID do jogador não informado.");
    return;
  }

  try {
    /* ── Buscar dados do jogador ── */
    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .maybeSingle();

    if (error || !player) {
      container.innerHTML = notFound("Jogador não encontrado.");
      return;
    }

    /* ── Atualizar título da página ── */
    document.getElementById("page-title").textContent = player.full_name;
    document.title = `UFABCHESS — ${player.full_name}`;

    /* ── Buscar rank ── */
    const { count: totalPlayers } = await supabase
      .from("players")
      .select("id", { count: "exact", head: true });

    const { count: playersAbove } = await supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .gt("rating_rapid", player.rating_rapid ?? 0);

    const rank = (playersAbove ?? 0) + 1;

    /* ── Buscar rating_history ── */
    const { data: history } = await supabase
      .from("rating_history")
      .select("rating_before, rating_after, delta, time_control, created_at, match_id")
      .eq("player_id", playerId)
      .order("created_at", { ascending: true });

    allHistory = history ?? [];

    /* ── Buscar partidas recentes (últimas 10 do jogador) ── */
    const { data: matchesWhite } = await supabase
      .from("matches")
      .select("id, round_number, result_white, result_black, created_at, player_black:players!matches_player_black_fkey(id, full_name)")
      .eq("player_white", playerId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: matchesBlack } = await supabase
      .from("matches")
      .select("id, round_number, result_white, result_black, created_at, player_white:players!matches_player_white_fkey(id, full_name)")
      .eq("player_black", playerId)
      .order("created_at", { ascending: false })
      .limit(10);

    /* Combinar e ordenar */
    const allMatches = [
      ...(matchesWhite ?? []).map(m => ({
        id: m.id,
        opponent: m.player_black?.full_name ?? "?",
        opponentId: m.player_black?.id,
        myResult: Number(m.result_white),
        oppResult: Number(m.result_black),
        created_at: m.created_at
      })),
      ...(matchesBlack ?? []).map(m => ({
        id: m.id,
        opponent: m.player_white?.full_name ?? "?",
        opponentId: m.player_white?.id,
        myResult: Number(m.result_black),
        oppResult: Number(m.result_white),
        created_at: m.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    /* ── Renderizar ── */
    container.innerHTML = renderPlayer(player, rank, totalPlayers ?? 0, allHistory, allMatches);

    /* ── Iniciar gráfico ── */
    renderChart("rapid");

    /* ── Tabs de time control ── */
    document.querySelectorAll(".tc-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tc-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        renderChart(tab.dataset.tc);
      });
    });

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    container.innerHTML = notFound("Erro ao carregar perfil. Tente novamente.");
  }
});

/* ══════════════════════════════════
   RENDER PLAYER
   ══════════════════════════════════ */
function renderPlayer(player, rank, total, history, matches) {
  const initials = player.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const badge    = getTitleBadge(player.rating_rapid, player.games_played_rapid);

  /* Calcular win/draw/loss a partir do histórico de rating */
  const rapHistory = history.filter(h => h.time_control === "rapid");
  const wins   = rapHistory.filter(h => h.delta > 0).length;
  const losses = rapHistory.filter(h => h.delta < 0).length;
  const draws  = rapHistory.filter(h => h.delta === 0 && rapHistory.length > 0).length;

  return `
    <!-- Header -->
    <div class="player-header">
      <div class="player-avatar">${initials}</div>
      <div class="player-info">
        <h2>${badge}${player.full_name}</h2>
        <div class="player-rank">
          Posição <strong style="color:var(--green)">#${rank}</strong> de ${total} jogadores
          ${player.level ? `· <span style="color:var(--text-muted);text-transform:capitalize;">${player.level}</span>` : ""}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${player.rating_rapid ?? 1200}</div>
        <div class="stat-label">Rating Rapid</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${player.games_played_rapid ?? 0}</div>
        <div class="stat-label">Partidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${wins > 0 || losses > 0 ? Math.round(wins / (wins + losses + draws) * 100) + "%" : "—"}</div>
        <div class="stat-label">Aproveit.</div>
      </div>
    </div>

    <!-- Gráfico de evolução -->
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">Evolução do Rating</div>
        <div class="chart-tc-tabs">
          <button class="tc-tab active" data-tc="rapid">Rapid</button>
          <button class="tc-tab" data-tc="blitz">Blitz</button>
          <button class="tc-tab" data-tc="standard">Standard</button>
        </div>
      </div>
      <div class="chart-canvas-wrap">
        <canvas id="rating-chart"></canvas>
      </div>
      <div id="chart-empty" class="chart-empty" style="display:none;">
        Nenhuma partida registrada nesta modalidade.
      </div>
    </div>

    <!-- Partidas recentes -->
    <div class="matches-card">
      <div class="card-title" style="margin-bottom:16px;">Partidas Recentes</div>
      ${matches.length === 0
        ? `<div class="chart-empty">Nenhuma partida registrada ainda.</div>`
        : matches.map(m => renderMatchRow(m)).join("")
      }
    </div>`;
}

/* ── Linha de partida ── */
function renderMatchRow(m) {
  let resultLabel, resultClass;
  if (m.myResult === 1)   { resultLabel = "Vitória"; resultClass = "win";  }
  else if (m.myResult === 0) { resultLabel = "Derrota"; resultClass = "loss"; }
  else                    { resultLabel = "Empate";  resultClass = "draw"; }

  /* Pegar delta do rating_history se disponível */
  const histEntry = allHistory.find(h => h.match_id === m.id);
  const delta = histEntry?.delta;
  const deltaHtml = delta !== undefined
    ? `<span class="match-delta ${delta >= 0 ? "pos" : "neg"}">${delta >= 0 ? "+" : ""}${delta}</span>`
    : `<span class="match-delta" style="color:var(--text-muted);">—</span>`;

  const opponentLink = m.opponentId
    ? `<a href="./jogador.html?id=${m.opponentId}" class="match-opponent" style="text-decoration:none;color:var(--text-primary);">${m.opponent}</a>`
    : `<span class="match-opponent">${m.opponent}</span>`;

  return `
    <div class="match-row">
      ${opponentLink}
      <span class="match-result ${resultClass}">${resultLabel}</span>
      ${deltaHtml}
    </div>`;
}

/* ══════════════════════════════════
   RENDER CHART
   ══════════════════════════════════ */
function renderChart(timeControl) {
  const canvas   = document.getElementById("rating-chart");
  const emptyEl  = document.getElementById("chart-empty");

  const filtered = allHistory.filter(h => h.time_control === timeControl);

  if (!filtered.length) {
    canvas.style.display = "none";
    emptyEl.style.display = "block";
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  canvas.style.display = "block";
  emptyEl.style.display = "none";

  /* Montar dados: primeiro ponto usa rating_before, depois rating_after de cada entrada */
  const labels = [];
  const data   = [];

  filtered.forEach((h, i) => {
    if (i === 0) {
      labels.push(formatDateShort(h.created_at) + " (início)");
      data.push(h.rating_before);
    }
    labels.push(formatDateShort(h.created_at));
    data.push(h.rating_after);
  });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `Rating ${timeControl}`,
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
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} pts`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
            maxTicksLimit: 8,
            font: { size: 10 }
          },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: {
            color: "#94a3b8",
            font: { size: 10 }
          },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      }
    }
  });
}

/* ── Helpers ── */
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
}

function notFound(msg) {
  return `<div class="profile-loading">${msg}</div>`;
}
