import { supabase } from "./supabase.js";

/* ══════════════════════════════════
   PAIRINGS SERVICE
══════════════════════════════════ */

/** Buscar pareamentos de uma semana */
export async function getPairings(weekId) {
  const { data, error } = await supabase
    .from("pairings")
    .select(`
      id,
      round_number,
      table_number,
      player_white:player_white (
        id, full_name, rating_rapid, games_played_rapid
      ),
      player_black:player_black (
        id, full_name, rating_rapid, games_played_rapid
      )
    `)
    .eq("tournament_week_id", weekId)
    .order("round_number", { ascending: true })
    .order("table_number", { ascending: true });

  if (error) throw error;
  return data;
}

/** Gerar pareamentos (admin) */
export async function generatePairings(weekId) {
  const { data, error } = await supabase.rpc("generate_pairings", {
    p_tournament_week_id: weekId
  });

  if (error) throw error;
  return data;
}
