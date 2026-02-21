import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { ENV } from "./env.js"; // Importa o arquivo onde o Action vai injetar os dados

// Aqui criamos a conexão de fato usando os valores processados
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

console.log("Supabase client inicializado com sucesso!");