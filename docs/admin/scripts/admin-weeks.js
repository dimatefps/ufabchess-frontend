/* ══════════════════════════════════════════════════════
   ADMIN — Gerenciamento de Semanas de Torneio
   
   Adicione este script ao admin.html:
   <script type="module" src="./scripts/admin-weeks.js"></script>
   
   E adicione o HTML abaixo no admin.html, antes do 
   botão de logout:
══════════════════════════════════════════════════════ */

/*
   HTML A ADICIONAR NO admin.html:
   ================================

<h2>Gerenciar Semanas</h2>

<fieldset id="week-fieldset">
  <legend>Nova Semana de Torneio</legend>
  
  <label>
    Torneio
    <select id="week-tournament-select" required>
      <option value="">Selecione o torneio</option>
    </select>
  </label>
  
  <label>
    Nº da Semana
    <input type="number" id="week-number" min="1" required>
  </label>
  
  <label>
    Data
    <input type="date" id="week-date" required>
  </label>
  
  <label>
    Máx. Jogadores
    <input type="number" id="week-max-players" value="18" min="2" max="50">
  </label>
  
  <button type="button" id="btn-create-week">
    Criar Semana
  </button>
</fieldset>

<h2>Semanas Abertas</h2>
<ul id="weeks-list"></ul>

*/

import { supabase } from "../../scripts/services/supabase.js";

// Wait for DOM
document.addEventListener("DOMContentLoaded", async () => {
  // Check if admin elements exist
  const weekTournamentSelect = document.getElementById("week-tournament-select");
  const weeksList = document.getElementById("weeks-list");
  
  if (!weekTournamentSelect || !weeksList) return;

  // Load tournaments into week select
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, edition")
    .eq("status", "ongoing")
    .order("created_at", { ascending: false });

  if (tournaments) {
    tournaments.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.edition ? `${t.name} • Edição ${t.edition}` : t.name;
      weekTournamentSelect.appendChild(option);
    });
  }

  // Create week button
  document.getElementById("btn-create-week")?.addEventListener("click", async () => {
    const tournamentId = weekTournamentSelect.value;
    const weekNumber = Number(document.getElementById("week-number").value);
    const matchDate = document.getElementById("week-date").value;
    const maxPlayers = Number(document.getElementById("week-max-players").value) || 18;

    if (!tournamentId || !weekNumber || !matchDate) {
      alert("Preencha todos os campos");
      return;
    }

    const { data, error } = await supabase.rpc("create_tournament_week", {
      p_tournament_id: tournamentId,
      p_week_number: weekNumber,
      p_match_date: matchDate,
      p_max_players: maxPlayers
    });

    if (error) {
      alert(error.message || "Erro ao criar semana");
      return;
    }

    alert("Semana criada com sucesso!");
    loadWeeks();
  });

  // Load existing weeks
  async function loadWeeks() {
    const { data: weeks, error } = await supabase
      .from("tournament_weeks")
      .select(`
        id,
        week_number,
        match_date,
        max_players,
        status,
        tournaments (name, edition)
      `)
      .in("status", ["open", "in_progress"])
      .order("match_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    weeksList.innerHTML = "";

    if (!weeks || weeks.length === 0) {
      weeksList.innerHTML = "<li>Nenhuma semana aberta.</li>";
      return;
    }

    for (const week of weeks) {
      // Count checkins
      const { count } = await supabase
        .from("tournament_checkins")
        .select("id", { count: "exact", head: true })
        .eq("tournament_week_id", week.id);

      const li = document.createElement("li");
      li.innerHTML = `
        <span>
          Semana ${week.week_number} — ${week.tournaments?.name || "?"} 
          (${week.match_date}) · ${count || 0}/${week.max_players} jogadores · 
          <strong style="color: ${week.status === 'open' ? 'var(--color-primary)' : '#f0c03a'}">${week.status}</strong>
        </span>
      `;

      // Generate pairings button
      if (week.status === "open") {
        const btnPair = document.createElement("button");
        btnPair.textContent = "Gerar Pareamento";
        btnPair.style.cssText = "background:#f0c03a;color:#1a1a1a;";
        btnPair.onclick = async () => {
          if (!confirm(`Gerar pareamento para Semana ${week.week_number}? Isso fechará o check-in.`)) return;

          const { data, error } = await supabase.rpc("generate_pairings", {
            p_tournament_week_id: week.id
          });

          if (error) {
            alert(error.message || "Erro ao gerar pareamento");
            return;
          }

          if (data?.success) {
            alert(`Pareamento gerado! ${data.tables} mesas criadas.`);
            loadWeeks();
          } else {
            alert(data?.error || "Erro ao gerar pareamento.");
          }
        };
        li.appendChild(btnPair);
      }

      // Close week button
      const btnClose = document.createElement("button");
      btnClose.textContent = "Encerrar";
      btnClose.style.cssText = "background:#ef4444;color:white;";
      btnClose.onclick = async () => {
        if (!confirm("Encerrar esta semana?")) return;

        const { error } = await supabase
          .from("tournament_weeks")
          .update({ status: "finished" })
          .eq("id", week.id);

        if (error) {
          alert(error.message);
          return;
        }

        loadWeeks();
      };
      li.appendChild(btnClose);

      weeksList.appendChild(li);
    }
  }

  loadWeeks();
});
