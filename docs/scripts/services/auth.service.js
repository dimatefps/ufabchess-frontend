import { supabase } from "./supabase.js";

/* ══════════════════════════════════
   AUTH SERVICE — Jogadores
   Atualizado: vinculação por email,
   não mais por nome
══════════════════════════════════ */

/** Cadastrar novo jogador (apenas cria auth user) */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) throw error;

  // NÃO chamar mais a RPC register_player aqui.
  // A vinculação/cadastro de player acontece na página meu-perfil.html
  // após a confirmação de email.

  return data;
}

/** Login */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/** Logout */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Buscar sessão atual */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/** Buscar usuário autenticado */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

/** Buscar perfil do jogador logado (via user_id) */
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !player) return null;

  // Calcular rank
  const { count: totalPlayers } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true });

  const { count: playersAbove } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true })
    .gt("rating_rapid", player.rating_rapid ?? 0);

  return {
    ...player,
    found: true,
    rank: (playersAbove ?? 0) + 1,
    total_players: totalPlayers ?? 0
  };
}
