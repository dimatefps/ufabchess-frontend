import { supabase } from "./supabase.js";

/* ══════════════════════════════════
   AUTH SERVICE — Jogadores
══════════════════════════════════ */

/** Cadastrar novo jogador */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) throw error;

  // Vincular ao perfil de jogador
  const { error: rpcError } = await supabase.rpc("register_player", {
    p_full_name: fullName,
    p_email: email
  });

  if (rpcError) throw rpcError;
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

/** Buscar perfil do jogador logado */
export async function getMyProfile() {
  const { data, error } = await supabase.rpc("get_my_profile");
  if (error) throw error;
  return data;
}
