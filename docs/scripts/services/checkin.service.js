import { supabase } from "./supabase.js";

/* ══════════════════════════════════
   CHECK-IN SERVICE
   Atualizado para usar coluna user_id
══════════════════════════════════ */

/** Buscar semana de torneio aberta (próxima) */
export async function getOpenWeek() {
  const { data, error } = await supabase
    .from("tournament_weeks")
    .select(`
      id,
      tournament_id,
      week_number,
      match_date,
      match_time,
      max_players,
      status,
      tournaments (
        name,
        edition
      )
    `)
    .in("status", ["open", "in_progress"])
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Buscar check-ins de uma semana */
export async function getCheckins(weekId) {
  const { data, error } = await supabase
    .from("tournament_checkins")
    .select(`
      id,
      player_id,
      checked_in_at,
      players (
        full_name,
        rating_rapid,
        games_played_rapid
      )
    `)
    .eq("tournament_week_id", weekId)
    .order("checked_in_at", { ascending: true });

  if (error) throw error;
  return data;
}

/** Fazer check-in */
export async function doCheckin(weekId) {
  const { data, error } = await supabase.rpc("checkin_tournament", {
    p_tournament_week_id: weekId
  });

  if (error) throw error;
  return data;
}

/** Cancelar check-in */
export async function cancelCheckin(weekId) {
  const { data, error } = await supabase.rpc("cancel_checkin", {
    p_tournament_week_id: weekId
  });

  if (error) throw error;
  return data;
}

/** Verificar se o jogador logado já fez check-in */
export async function isPlayerCheckedIn(weekId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Buscar player vinculado ao auth user via user_id
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!player) return false;

  const { data } = await supabase
    .from("tournament_checkins")
    .select("id")
    .eq("tournament_week_id", weekId)
    .eq("player_id", player.id)
    .maybeSingle();

  return !!data;
}

/** Buscar todas as semanas de um torneio */
export async function getWeeksByTournament(tournamentId) {
  const { data, error } = await supabase
    .from("tournament_weeks")
    .select(`
      id,
      week_number,
      match_date,
      match_time,
      max_players,
      status
    `)
    .eq("tournament_id", tournamentId)
    .order("week_number", { ascending: false });

  if (error) throw error;
  return data;
}
