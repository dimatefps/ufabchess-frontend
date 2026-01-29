import {
  getFinishedTournaments,
  getStandingsByTournament,
  getOngoingTournament
} from "../services/tournaments.service.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("tournaments-list");

  if (!container) return;

  try {
    const ongoingTournament = await getOngoingTournament();

    if (ongoingTournament) {
      await renderOngoingTournament(container, ongoingTournament);
    } else {
      await renderFinishedTournaments(container);
    }

  } catch (error) {
    console.error("Erro ao carregar torneios:", error);
    container.innerHTML = "<p>Erro ao carregar torneios.</p>";
  }
});

/* ============================
   TORNEIO EM ANDAMENTO
============================ */

async function renderOngoingTournament(container, tournament) {
  container.innerHTML = `
    <section class="tournament tournament-ongoing">
      <h3>${tournament.name}</h3>
      <p><strong>Status:</strong> Torneio em andamento</p>
      <div class="standings">Carregando classificação...</div>
    </section>
  `;

  const standingsContainer = container.querySelector(".standings");

  async function loadStandings() {
    try {
      const standings = await getStandingsByTournament(tournament.id);
      standingsContainer.innerHTML = renderStandingsTable(standings);
    } catch (err) {
      console.error("Erro ao carregar classificação:", err);
      standingsContainer.innerHTML = "<p>Erro ao carregar classificação.</p>";
    }
  }

  await loadStandings();

  // atualiza automaticamente a cada 15 segundos
  setInterval(loadStandings, 15000);
}

/* ============================
   TORNEIOS FINALIZADOS
============================ */

async function renderFinishedTournaments(container) {
  const tournaments = await getFinishedTournaments();

  if (!tournaments.length) {
    container.innerHTML = "<p>Nenhum torneio encontrado.</p>";
    return;
  }

  for (const tournament of tournaments) {
    const section = document.createElement("section");
    section.className = "tournament";

    section.innerHTML = `
      <h3>${tournament.name}</h3>
      <p>Edição ${tournament.edition}</p>
      <div class="standings">Carregando classificação...</div>
    `;

    container.appendChild(section);

    const standingsContainer = section.querySelector(".standings");

    try {
      const standings = await getStandingsByTournament(tournament.id);
      standingsContainer.innerHTML = renderStandingsTable(standings);
    } catch (err) {
      console.error("Erro ao carregar classificação:", err);
      standingsContainer.innerHTML = "<p>Erro ao carregar classificação.</p>";
    }
  }
}

/* ============================
   TABELA DE CLASSIFICAÇÃO
============================ */

function renderStandingsTable(standings) {
  if (!standings || !standings.length) {
    return "<p>Sem dados de classificação.</p>";
  }

  const rows = standings.map(s => `
    <tr>
      <td>${s.position ?? "-"}</td>
      <td>${s.players?.full_name ?? "-"}</td>
      <td>${s.points}</td>
      <td>${s.games_played}</td>
      <td>${s.players?.rating_rapid ?? "-"}</td>
    </tr>
  `).join("");

  return `
    <table class="standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jogador</th>
          <th>Pontos</th>
          <th>Partidas</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
